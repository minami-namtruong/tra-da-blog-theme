/**
 * Blogger Special Posts Widget Engine v2.1
 * Multi-label Support & Pluggable Pattern Strategy
 * Spec: FEAT-FLEXIBLE-SPECIAL-POSTS-WIDGET-V2
 *
 * Features:
 *  - Multi-label fetch (parallel) với deduplication
 *  - SessionStorage cache 5 phút
 *  - 5 renderers: ranked, spotlight, quote, digest, series
 *  - Skeleton shimmer (CLS = 0)
 *  - Anchor scroll highlight pulse
 *  - Label sanitization (lọc @ # _ ~)
 *  - Fallback: views → latest nếu API lỗi
 */
(function () {
  'use strict';

  /* ─── Constants ─────────────────────────────────────────────── */
  const CACHE_PREFIX = 'editorial_sp_v3_';
  const CACHE_TTL    = 5 * 60 * 1000; // 5 phút

  /* ─── Pattern → Renderer map (Pluggable Strategy) ───────────── */
  const PATTERN_RENDERERS = {
    ranked:    renderRankedPattern,
    spotlight: renderSpotlightPattern,
    quote:     renderQuotePattern,
    digest:    renderDigestPattern,
    series:    renderSeriesPattern,
    // Mở rộng tương lai: video, slideshow
  };

  /* ═══════════════════════════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', function () {
    initSpecialPostWidgets();
    initAnchorHighlight();
  });

  function initSpecialPostWidgets() {
    // Tự động nhận diện nếu user bấm "+ Thêm tiện ích" HTML/JavaScript mới và gõ cú pháp ngắn gọn
    document.querySelectorAll('.widget.HTML .widget-content, .widget.HTML').forEach(el => {
      if (el.querySelector('.special-posts-widget')) return;
      const targetHost = el.querySelector('.widget-content') || el;
      const directContent = targetHost.textContent.trim();
      const match = directContent.match(/^(?:pattern|kiểu)\s*:\s*(spotlight|ranked|quote|digest|series)/i);
      if (match) {
        const pattern = match[1].toLowerCase();
        const wrapper = document.createElement('div');
        wrapper.className = 'special-posts-widget';
        wrapper.dataset.pattern = pattern;
        const configDiv = document.createElement('div');
        configDiv.className = 'sp-raw-user-content';
        configDiv.style.display = 'none';
        configDiv.textContent = directContent.replace(/^(?:pattern|kiểu)\s*:\s*(spotlight|ranked|quote|digest|series)\s*\|?/i, '').trim();
        wrapper.appendChild(configDiv);
        targetHost.innerHTML = '';
        targetHost.appendChild(wrapper);
      }
    });

    // Dọn dẹp các widget sidebar cũ đã loại bỏ (phòng khi Blogger tự động khôi phục từ database)
    ['HTML15', 'HTML16', 'HTML17'].forEach(function(id) {
      var orphaned = document.getElementById(id);
      if (orphaned) orphaned.remove();
    });

    const widgets = document.querySelectorAll('.special-posts-widget');
    widgets.forEach(renderWidgetInstance);
  }

  /* ═══════════════════════════════════════════════════════════════
     RENDER WIDGET INSTANCE
     ═══════════════════════════════════════════════════════════════ */
  async function renderWidgetInstance(container) {
    // ── Hỗ trợ cấu hình nhanh từ ô Content của Blogger Layout ──
    const userConfigEl = container.querySelector('.sp-raw-user-content');
    if (userConfigEl) {
      const rawUserContent = userConfigEl.innerHTML.trim();
      // Case A: Người dùng dán nguyên thẻ .special-posts-widget
      if (userConfigEl.querySelector('.special-posts-widget')) {
        const replacement = userConfigEl.querySelector('.special-posts-widget');
        container.replaceWith(replacement);
        return renderWidgetInstance(replacement);
      }
      // Case B: Người dùng dán mã HTML nhúng bên thứ 3 (AdSense, Banner, iframe, custom HTML...)
      if (/<(script|iframe|img|picture|a|form|object|embed)/i.test(rawUserContent) || (rawUserContent.startsWith('<') && !rawUserContent.includes('data-pattern') && !rawUserContent.includes('data-labels'))) {
        container.innerHTML = rawUserContent;
        container.classList.remove('special-posts-widget');
        return;
      }
      // Case C: Người dùng chỉ gõ tên nhãn dạng văn bản hoặc câu trích dẫn
      const textOnly = userConfigEl.textContent.trim();
      const currentPattern = container.dataset.pattern || 'digest';

      // Nếu là kiểu quote và người dùng gõ trực tiếp một câu nói / trích dẫn:
      if (currentPattern === 'quote' && textOnly && !/^(labels?|nhãn|posts|links|limit|sort)\s*:/i.test(textOnly) && (textOnly.length > 20 || textOnly.includes('"') || textOnly.includes('“') || textOnly.includes(' - '))) {
        let quoteText = textOnly;
        let quoteAuthor = 'Chiêm nghiệm';
        if (quoteText.includes(' - ')) {
          const qParts = quoteText.split(' - ');
          quoteText = qParts[0].trim().replace(/^["“]+|["”]+$/g, '');
          quoteAuthor = qParts.slice(1).join(' - ').trim();
        }
        const customQuotePost = [{
          title: quoteText,
          url: '#',
          dateFormatted: '',
          author: quoteAuthor,
          snippet: ''
        }];
        const widgetTitle = container.dataset.title || '';
        container.innerHTML = buildWidgetShell(widgetTitle, '', '', currentPattern, renderQuotePattern(customQuotePost, { showThumb: false, showSnippet: false }));
        userConfigEl.remove();
        return;
      }

      if (textOnly) {
        const parts = textOnly.split('|').map(s => s.trim());
        parts.forEach(part => {
          if (/^limit\s*:\s*(\d+)/i.test(part)) {
            container.dataset.limit = part.match(/^limit\s*:\s*(\d+)/i)[1];
          } else if (/^sort\s*:\s*(\w+)/i.test(part)) {
            container.dataset.sort = part.match(/^sort\s*:\s*(\w+)/i)[1];
          } else if (/^(?:thumb|thumbnail)\s*:\s*(true|false)/i.test(part)) {
            container.dataset.showThumbnail = part.match(/^(?:thumb|thumbnail)\s*:\s*(true|false)/i)[1].toLowerCase();
          } else if (/^snippet\s*:\s*(true|false)/i.test(part)) {
            container.dataset.showSnippet = part.match(/^snippet\s*:\s*(true|false)/i)[1].toLowerCase();
          } else if (/^(?:viewall|viewAllText)\s*:\s*(.+)/i.test(part)) {
            container.dataset.viewAllText = part.match(/^(?:viewall|viewAllText)\s*:\s*(.+)/i)[1].trim();
          } else if (/^(?:timerange|timeRange)\s*:\s*(\w+)/i.test(part)) {
            container.dataset.timeRange = part.match(/^(?:timerange|timeRange)\s*:\s*(\w+)/i)[1].trim();
          } else if (/^(?:posts|links)\s*:\s*(.+)/i.test(part)) {
            container.dataset.posts = part.match(/^(?:posts|links)\s*:\s*(.+)/i)[1].trim();
          } else if (/^title\s*:\s*(.+)/i.test(part)) {
            container.dataset.title = part.match(/^title\s*:\s*(.+)/i)[1].trim();
          } else {
            const cleanedLabel = part.replace(/^(labels?|nhãn)\s*:\s*/i, '').trim();
            if (cleanedLabel) container.dataset.labels = cleanedLabel;
          }
        });
      }
      userConfigEl.remove();
    }

    // Nếu widget đã có markup tĩnh (static preview demo) và không có cấu hình fetch
    if (!container.dataset.labels && !container.dataset.posts && !container.dataset.sort && container.querySelector('.sp-widget-card')) {
      return;
    }

    const pattern        = container.dataset.pattern  || 'digest';
    const rawLabels      = (container.dataset.labels  || container.dataset.label || '').trim();
    const defaultLimit   = pattern === 'series' ? 5 : 4;
    const limit          = Math.min(parseInt(container.dataset.limit, 10) || defaultLimit, 10);
    const sort           = container.dataset.sort     || (pattern === 'series' ? 'random' : 'latest');
    const handpickedRaw  = container.dataset.posts    || '';
    const showThumb      = container.dataset.showThumbnail !== 'false';
    const showSnippet    = container.dataset.showSnippet   !== 'false';
    const lang           = window.currentLang || document.documentElement.lang || 'vi';
    const rawViewAll     = container.dataset.viewAllText;
    let viewAllText      = (rawViewAll === 'false' || rawViewAll === 'none') ? '' : (rawViewAll || 'Xem tất cả » | View All »');
    let widgetTitle      = container.dataset.title || (pattern === 'series' ? '📚 Chuyên Đề | 📚 Series Topic' : '');

    // Thêm class pattern cho container queries
    container.classList.add('pattern-' + pattern);

    // Skeleton loading trước — CLS = 0
    renderSkeleton(container, pattern, limit, widgetTitle, viewAllText, rawLabels);

    if (pattern === 'series') {
      try {
        await renderSeriesWidget(container, {
          widgetTitle,
          limit,
          specifiedLabel: rawLabels,
          sort
        });
        return;
      } catch (seriesErr) {
        console.warn('[SpecialPostsWidget] Series render error:', seriesErr);
      }
    }

    try {
      let posts = [];
      const feedType = pattern === 'quote' ? 'default' : 'summary';

      if (handpickedRaw.trim()) {
        // Chế độ Handpicked URLs
        posts = await fetchHandpickedPosts(handpickedRaw);
      } else if (sort === 'views' || sort === 'popular') {
        // Chế độ Popular Posts (số lượt xem)
        const timeRange = container.dataset.timeRange || 'all_time';
        try {
          posts = await fetchPopularPosts(limit, timeRange, rawLabels, feedType);
        } catch (e) {
          posts = [];
        }
        // Fallback về bài mới nhất nếu chưa có đủ dữ liệu lượt xem
        if (!posts || posts.length === 0) {
          posts = await fetchLatestPosts(limit, feedType);
        }
      } else if (rawLabels) {
        // Chế độ Multi-label
        const labelList = splitLabels(rawLabels);
        try {
          posts = await fetchMultiLabelPosts(labelList, limit, sort, feedType);
        } catch (e) {
          posts = [];
        }
        // TỰ ĐỘNG FALLBACK THÔNG MINH:
        // Nếu nhãn yêu cầu chưa có bài nào (VD blog mới cài chưa gắn nhãn @Tiêu điểm, @Quote, @Điểm tin...)
        // Tự động lấy các bài viết mới nhất để lấp đầy widget, đảm bảo blog luôn sống động và không báo lỗi!
        if (!posts || posts.length === 0) {
          posts = await fetchLatestPosts(limit, feedType);
        }
      } else {
        // Không chỉ định nhãn -> Lấy bài viết mới nhất
        posts = await fetchLatestPosts(limit, feedType);
      }

      if (!posts || posts.length === 0) {
        container.innerHTML = buildWidgetShell(
          widgetTitle,
          viewAllText,
          rawLabels,
          pattern,
          `<div class="sp-empty-state" style="padding: 1.5rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
            <span style="font-size: 1.6rem; display: block; margin-bottom: 0.35rem;">✨</span>
            <span>Chưa có bài viết nào. Hãy đăng bài đầu tiên để làm nổi bật tại đây!</span>
          </div>`
        );
        return;
      }

      // Gọi Pattern Renderer
      const renderer = PATTERN_RENDERERS[pattern] || PATTERN_RENDERERS.digest;
      container.innerHTML = buildWidgetShell(
        widgetTitle,
        viewAllText,
        rawLabels,
        pattern,
        renderer(posts, { showThumb, showSnippet, limit }),
        posts
      );

    } catch (err) {
      console.warn('[SpecialPostsWidget] Lỗi nạp dữ liệu, thử fallback về bài mới nhất:', err);
      try {
        const fallbackPosts = await fetchLatestPosts(limit);
        if (fallbackPosts && fallbackPosts.length > 0) {
          const renderer = PATTERN_RENDERERS[pattern] || PATTERN_RENDERERS.digest;
          container.innerHTML = buildWidgetShell(
            widgetTitle,
            viewAllText,
            rawLabels,
            pattern,
            renderer(fallbackPosts, { showThumb, showSnippet, limit }),
            fallbackPosts
          );
          return;
        }
      } catch (fbErr) {
        // ignore
      }

      // Trường hợp bất khả kháng mới hiện thông báo nhẹ nhàng thay vì lỗi đỏ
      container.innerHTML = buildWidgetShell(
        widgetTitle,
        viewAllText,
        rawLabels,
        pattern,
        `<div class="sp-empty-state" style="padding: 1.25rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
          <span>✨ Mục này sẽ tự động hiển thị khi bạn đăng bài viết mới.</span>
        </div>`
      );
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     SKELETON LOADING
     ═══════════════════════════════════════════════════════════════ */
  function renderSkeleton(container, pattern, limit, title, viewAllText, rawLabels) {
    let skeletonBody = '';

    if (pattern === 'spotlight') {
      skeletonBody = `
        <div class="sp-skeleton" style="padding:0.75rem 1rem 1rem;">
          <div class="sp-skeleton-cover"></div>
          <div class="sp-skeleton-line sp-skeleton-line-55" style="margin-bottom:0.75rem;height:10px;"></div>
          <div class="sp-skeleton-line sp-skeleton-line-full" style="height:16px;margin-bottom:0.4rem;"></div>
          <div class="sp-skeleton-line sp-skeleton-line-80"  style="height:16px;margin-bottom:0.9rem;"></div>
          <div class="sp-skeleton-line sp-skeleton-line-40"  style="height:10px;"></div>
          <div class="sp-skeleton-line sp-skeleton-line-55"  style="height:10px;margin-top:0.35rem;"></div>
          <div class="sp-skeleton-line sp-skeleton-line-40"  style="height:10px;margin-top:0.35rem;"></div>
        </div>`;

    } else if (pattern === 'quote') {
      skeletonBody = `
        <div class="sp-skeleton" style="padding:1.1rem 1.25rem;">
          <div class="sp-skeleton-quote-line" style="width:20px;height:22px;margin-bottom:0.5rem;"></div>
          <div class="sp-skeleton-quote-line sp-skeleton-line-full"></div>
          <div class="sp-skeleton-quote-line sp-skeleton-line-80"></div>
          <div class="sp-skeleton-quote-line sp-skeleton-line-55"></div>
          <div class="sp-skeleton-quote-line" style="width:20px;height:22px;margin-left:auto;margin-top:0.25rem;"></div>
          <div class="sp-skeleton-quote-line sp-skeleton-line-40" style="margin-left:auto;margin-top:0.75rem;"></div>
        </div>`;

    } else if (pattern === 'series') {
      const items = Array.from({ length: limit }).map(() => `
        <div class="popular-post-item sp-skeleton-item" style="border-bottom:none;padding:0.4rem 0;">
          <div class="popular-post-num sp-skeleton-num" style="min-width:32px;height:24px;border-radius:var(--radius-sm);"></div>
          <div class="popular-post-thumb sp-skeleton-thumb" style="width:60px;height:60px;border-radius:var(--radius-sm);flex-shrink:0;"></div>
          <div class="popular-post-info sp-skeleton-content" style="flex:1;">
            <div class="sp-skeleton-line sp-skeleton-line-full" style="height:14px;margin-bottom:0.45rem;"></div>
            <div class="sp-skeleton-line sp-skeleton-line-80" style="height:14px;margin-bottom:0.45rem;"></div>
            <div class="sp-skeleton-line sp-skeleton-line-40" style="height:10px;"></div>
          </div>
        </div>`).join('');
      skeletonBody = `
        <div class="sp-skeleton" style="padding:0.25rem 0;">
          <div style="background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:0.75rem 0.95rem;margin-bottom:1.1rem;">
            <div class="sp-skeleton-line sp-skeleton-line-55" style="height:14px;margin-bottom:0.4rem;"></div>
            <div class="sp-skeleton-line sp-skeleton-line-40" style="height:10px;"></div>
          </div>
          <div class="popular-posts-list">${items}</div>
        </div>`;

    } else {
      // ranked & digest — dạng danh sách
      const items = Array.from({ length: limit }).map(() => `
        <div class="sp-skeleton-item">
          ${pattern === 'ranked' ? '<div class="sp-skeleton-num"></div>' : ''}
          <div class="sp-skeleton-thumb"></div>
          <div class="sp-skeleton-content">
            <div class="sp-skeleton-line sp-skeleton-line-full"></div>
            <div class="sp-skeleton-line sp-skeleton-line-80"></div>
            <div class="sp-skeleton-line sp-skeleton-line-40"></div>
          </div>
        </div>`).join('');
      skeletonBody = `<div class="sp-skeleton">${items}</div>`;
    }

    container.innerHTML = buildWidgetShell(title, viewAllText, rawLabels, pattern, skeletonBody);
  }

  /* ── Helper: Tìm nhãn khớp chính xác từ bài viết thực tế trên blog ── */
  function resolveActiveLabel(rawLabels, posts) {
    const labelsArr = Array.isArray(rawLabels) ? rawLabels : splitLabels(rawLabels || '');
    if (labelsArr.length === 0) return '';
    if (posts && posts.length > 0) {
      for (const post of posts) {
        if (post && post.labels && Array.isArray(post.labels)) {
          for (const target of labelsArr) {
            const matched = post.labels.find(l => l.toLowerCase() === target.toLowerCase());
            if (matched) return matched;
          }
        }
      }
    }
    return labelsArr[0];
  }

  /* ═══════════════════════════════════════════════════════════════
     WIDGET SHELL — Header + Body
     ═══════════════════════════════════════════════════════════════ */
  function buildWidgetShell(title, viewAllText, rawLabels, pattern, bodyHtml, posts, extraHeaderHtml) {
    const lang = (() => { try { return localStorage.getItem('user_lang') || 'vi'; } catch(e) { return 'vi'; } })();
    const cleanTitle = title ? escapeHtml(title) : (pattern === 'series' ? '📚 Chuyên Đề | 📚 Series Topic' : '');
    const parsedTitle = window.parseBilingualText ? window.parseBilingualText(cleanTitle, lang) : cleanTitle.split('|')[0].trim();
    
    const activeLabel = resolveActiveLabel(rawLabels, posts);
    const viewAllUrl = activeLabel ? buildLabelUrl(activeLabel, title) : '/search';
    const parsedViewAll = window.parseBilingualText ? window.parseBilingualText(viewAllText, lang) : (viewAllText || '').split('|')[0].trim();

    let headerActionsHtml = '';
    if (extraHeaderHtml) {
      headerActionsHtml = extraHeaderHtml;
    } else if (parsedViewAll) {
      headerActionsHtml = `<a href="${escapeHtml(viewAllUrl)}" class="sp-view-all-link" data-bilingual="true" data-raw-label="${escapeHtml(viewAllText)}">${escapeHtml(parsedViewAll)}</a>`;
    }

    const isSeries = pattern === 'series';
    const headerHtml = cleanTitle ? `
      <div class="sp-widget-header ${isSeries ? 'series-widget-header' : ''}">
        <h3 class="${isSeries ? 'sidebar-widget-title series-main-title' : 'sp-widget-title'}">
          <span class="${isSeries ? 'series-title-text' : 'sp-title-text'}" data-bilingual="true" data-raw-label="${cleanTitle}">${parsedTitle}</span>
          ${isSeries ? headerActionsHtml : ''}
        </h3>
        ${!isSeries ? headerActionsHtml : ''}
      </div>` : '';

    return `
      <div class="sp-widget-card pattern-${escapeHtml(pattern)}">
        ${headerHtml}
        <div class="sp-widget-body ${isSeries ? 'series-widget-body' : ''}">
          ${bodyHtml}
        </div>
      </div>`;
  }

  function renderEmptyState(container, title, viewAllText, rawLabels) {
    container.innerHTML = buildWidgetShell(
      title, viewAllText, rawLabels, 'empty',
      '<div class="sp-empty-state">Chưa có nội dung trong mục này.</div>'
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     PATTERN RENDERERS
     ═══════════════════════════════════════════════════════════════ */

  /* ── 1. RANKED ──────────────────────────────────────────────── */
  function renderRankedPattern(posts, opts) {
    const lang = (() => { try { return localStorage.getItem('user_lang') || 'vi'; } catch(e) { return 'vi'; } })();
    const itemsHtml = posts.map((post, index) => {
      const rankNum = String(index + 1).padStart(2, '0');
      const thumb   = (opts.showThumb && post.thumbnail)
        ? optimizeThumbnail(post.thumbnail, 's160-c')
        : '';
      const aiType  = extractAITypes(post.labels || []);
      const aiHtml  = aiType ? (' • ' + renderAIInlineBadge(aiType)) : '';

      const parsedTitle = window.parseBilingualText ? window.parseBilingualText(post.title, lang) : post.title.split('|')[0].trim();

      return `
        <a href="${escapeHtml(post.url)}" class="sp-ranked-item"${aiType ? ` data-ai-type="${aiType}"` : ''}>
          <span class="sp-rank-number">${rankNum}</span>
          ${opts.showThumb ? `<div class="sp-ranked-thumb ${!thumb ? 'sp-no-thumb' : ''}">${thumb ? `<img src="${escapeHtml(thumb)}" alt="${escapeHtml(post.title)}" loading="lazy"/>` : ''}</div>` : ''}
          <div class="sp-ranked-content">
            <h4 class="sp-ranked-title" data-bilingual="true" data-raw-label="${escapeHtml(post.title)}">${escapeHtml(parsedTitle)}</h4>
            <span class="sp-ranked-date">${escapeHtml(post.dateFormatted)}${aiHtml}</span>
          </div>
        </a>`;
    }).join('');

    return `<div class="special-posts-ranked-list">${itemsHtml}</div>`;
  }

  /* ── 2. SPOTLIGHT ───────────────────────────────────────────── */
  function renderSpotlightPattern(posts, opts) {
    // Chỉ lấy bài đầu tiên làm hero
    const post   = posts[0];
    const lang   = (() => { try { return localStorage.getItem('user_lang') || 'vi'; } catch(e) { return 'vi'; } })();
    const thumb  = (opts.showThumb && post.thumbnail)
      ? optimizeThumbnail(post.thumbnail, 'w1200')
      : '';
    const badge  = extractNormalCategory(post.labels || []);
    const aiType = extractAITypes(post.labels || []);
    const aiHtml = aiType ? renderAIStandardBadge(aiType, lang) : '';

    const parsedBadge = window.parseBilingualText ? window.parseBilingualText(badge, lang) : badge.split('|')[0].trim();
    const parsedTitle = window.parseBilingualText ? window.parseBilingualText(post.title, lang) : post.title.split('|')[0].trim();
    const parsedSnippet = (post.snippet && window.parseBilingualText) ? window.parseBilingualText(post.snippet, lang) : (post.snippet || '').split('|')[0].trim();

    return `
      <a href="${escapeHtml(post.url)}" class="sp-spotlight-card"${aiType ? ` data-ai-type="${aiType}"` : ''}>
        ${opts.showThumb ? `<div class="sp-spotlight-cover ${!thumb ? 'sp-no-thumb' : ''}">${thumb ? `<img src="${escapeHtml(thumb)}" alt="${escapeHtml(post.title)}" loading="lazy" width="600" height="338"/>` : ''}</div>` : ''}
        <div class="sp-spotlight-info">
          <div class="sp-spotlight-meta">
            ${badge ? `<span class="sp-spotlight-badge" data-bilingual="true" data-raw-label="${escapeHtml(badge)}">${escapeHtml(parsedBadge)}</span>` : ''}
            <span class="sp-spotlight-date">📅 ${escapeHtml(post.dateFormatted)}</span>
            ${aiHtml}
          </div>
          <h3 class="sp-spotlight-title" data-bilingual="true" data-raw-label="${escapeHtml(post.title)}">${escapeHtml(parsedTitle)}</h3>
          ${(opts.showSnippet && post.snippet) ? `<p class="sp-spotlight-snippet" data-bilingual="true" data-raw-label="${escapeHtml(post.snippet)}">${escapeHtml(parsedSnippet)}</p>` : ''}
          <span class="sp-spotlight-cta" data-bilingual="true" data-raw-label="Đọc tiếp bài viết → | Read more →">${window.parseBilingualText ? window.parseBilingualText('Đọc tiếp bài viết → | Read more →', lang) : 'Đọc tiếp bài viết → | Read more →'}</span>
        </div>
      </a>`;
  }

  /* ── 3. QUOTE ───────────────────────────────────────────────── */
  function extractFirstSentences(text, maxChars = 150) {
    if (!text) return '';
    text = text.replace(/\s+/g, ' ').trim();
    if (text.length <= maxChars) return text;
    const match = text.slice(0, maxChars + 35).match(/[.!?](\s|$)/);
    if (match && match.index && match.index >= 40) {
      return text.slice(0, match.index + 1).trim();
    }
    const cut = text.lastIndexOf(' ', maxChars);
    return text.substring(0, cut === -1 ? maxChars : cut).trim() + '...';
  }

  function extractQuoteData(post, opts) {
    const rawContent = post.rawContent || '';

    // Nếu không có nội dung HTML raw (hoặc bài mock/fallback)
    if (!rawContent) {
      return {
        quoteText: post.title || '',
        quoteSnippet: (opts.showSnippet && post.snippet) ? post.snippet : '',
        quoteAuthor: post.author || ''
      };
    }

    try {
      // Helper phân tích khối trích dẫn (trước jumpbreak): tách text câu nói và tên tác giả (nếu có), hỗ trợ <br>
      const parseQuoteBlock = (containerEl) => {
        if (!containerEl) return { text: '', author: '' };
        const clone = containerEl.cloneNode(true);
        clone.querySelectorAll('br').forEach(br => br.replaceWith('\n'));

        const cleanTextWithNewlines = (str) => {
          return (str || '')
            .replace(/[ \t]+/g, ' ')
            .replace(/[ \t]*\n[ \t]*/g, '\n')
            .trim();
        };

        const ps = Array.from(clone.querySelectorAll('p, blockquote'))
          .map(el => cleanTextWithNewlines(el.textContent))
          .filter(Boolean);

        let lines = [];
        if (ps.length === 0) {
          const full = cleanTextWithNewlines(clone.textContent);
          if (!full) return { text: '', author: '' };
          lines = full.split('\n').map(s => s.trim()).filter(Boolean);
        } else {
          ps.forEach(p => {
            p.split('\n').map(s => s.trim()).filter(Boolean).forEach(l => lines.push(l));
          });
        }

        if (lines.length === 0) return { text: '', author: '' };

        const lastLine = lines[lines.length - 1];
        if (lines.length >= 2 && (/^[—–~-]\s*/.test(lastLine) || (lastLine.length < 45 && !/[.!?]$/.test(lastLine)))) {
          const author = lastLine.replace(/^[—–~-\s]+/, '').trim();
          const text = lines.slice(0, -1).join('\n');
          return { text, author };
        }
        return { text: lines.join('\n'), author: '' };
      };

      // Helper phân tích khối giải thích (sau jumpbreak): lấy 1-2 câu đầu từ đoạn văn <p> có nghĩa
      const parseSnippetBlock = (containerEl) => {
        if (!containerEl) return '';
        const ps = Array.from(containerEl.querySelectorAll('p'))
          .map(el => el.textContent.replace(/\s+/g, ' ').trim())
          .filter(t => t.length > 20);

        if (ps.length > 0) {
          return extractFirstSentences(ps[0], 160);
        }
        const rawText = containerEl.textContent.replace(/\s+/g, ' ').trim();
        return extractFirstSentences(rawText, 160);
      };

      // ── CẤP 1: Kiểm tra thẻ Jump Break (<a name='more'></a> hoặc <!--more-->) ──
      const jumpBreakRegex = /(?:<a[^>]+name=['"]more['"][^>]*>.*?<\/a>|<a[^>]+name=['"]more['"][^>]*\/?>|<!--more-->)/i;
      if (jumpBreakRegex.test(rawContent)) {
        const parts = rawContent.split(jumpBreakRegex);
        const beforeHtml = parts[0] || '';
        const afterHtml = parts.slice(1).join('') || '';

        const docBefore = new DOMParser().parseFromString(beforeHtml, 'text/html');
        const docAfter = new DOMParser().parseFromString(afterHtml, 'text/html');

        // Bóc tách câu quote (trước jumpbreak), hỗ trợ cấu trúc song ngữ
        let quoteText = '';
        let quoteAuthor = '';
        const viBefore = docBefore.querySelector('[data-lang="vi"], .lang-vi');
        const enBefore = docBefore.querySelector('[data-lang="en"], .lang-en');

        if (viBefore && enBefore) {
          const viQ = parseQuoteBlock(viBefore);
          const enQ = parseQuoteBlock(enBefore);
          quoteText = `${viQ.text} | ${enQ.text}`;
          quoteAuthor = (viQ.author === enQ.author) ? viQ.author : (viQ.author && enQ.author ? `${viQ.author} | ${enQ.author}` : (viQ.author || enQ.author));
        } else {
          const parsed = parseQuoteBlock(docBefore.body);
          quoteText = parsed.text;
          quoteAuthor = parsed.author;
        }

        // Bóc tách lời giải thích (sau jumpbreak), hỗ trợ cấu trúc song ngữ
        let quoteSnippet = '';
        if (opts.showSnippet) {
          const viAfter = docAfter.querySelector('[data-lang="vi"], .lang-vi');
          const enAfter = docAfter.querySelector('[data-lang="en"], .lang-en');
          if (viAfter && enAfter) {
            quoteSnippet = `${parseSnippetBlock(viAfter)} | ${parseSnippetBlock(enAfter)}`;
          } else {
            quoteSnippet = parseSnippetBlock(docAfter.body);
          }
        }

        if (quoteText) {
          return { quoteText, quoteSnippet, quoteAuthor };
        }
      }

      // ── CẤP 2: Không có Jump Break -> Phân tách theo đoạn văn (Paragraphs) ──
      const doc = new DOMParser().parseFromString(rawContent, 'text/html');
      doc.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
      const rawBlocks = Array.from(doc.body.querySelectorAll('p, blockquote, div'))
        .map(el => el.textContent.replace(/[ \t]+/g, ' ').replace(/[ \t]*\n[ \t]*/g, '\n').trim())
        .filter(t => t.length > 0);

      // Lọc bỏ đoạn văn bị trùng lặp do cấu trúc lồng nhau
      const uniqueBlocks = [];
      for (const b of rawBlocks) {
        if (!uniqueBlocks.some(u => u === b || u.includes(b))) {
          uniqueBlocks.push(b);
        }
      }

      if (uniqueBlocks.length >= 2) {
        return {
          quoteText: uniqueBlocks[0],
          quoteSnippet: opts.showSnippet ? extractFirstSentences(uniqueBlocks[1], 150) : '',
          quoteAuthor: ''
        };
      }

      // ── CẤP 3: Chỉ có 1 đoạn văn ngắn hoặc không phân tách -> Tiêu đề làm Quote, đoạn làm giải thích ──
      if (uniqueBlocks.length === 1 && post.title && post.title.trim() !== uniqueBlocks[0]) {
        return {
          quoteText: post.title,
          quoteSnippet: opts.showSnippet ? extractFirstSentences(uniqueBlocks[0], 150) : '',
          quoteAuthor: ''
        };
      }
    } catch (_) {
      // Fallback an toàn nếu lỗi DOM parsing
    }

    return {
      quoteText: post.title || '',
      quoteSnippet: (opts.showSnippet && post.snippet) ? post.snippet : '',
      quoteAuthor: ''
    };
  }

  function renderQuotePattern(posts, opts) {
    const lang = (() => { try { return localStorage.getItem('user_lang') || 'vi'; } catch(e) { return 'vi'; } })();
    const itemsHtml = posts.map(post => {
      const { quoteText, quoteSnippet, quoteAuthor } = extractQuoteData(post, opts);

      // Làm sạch dấu ngoặc kép thừa ở 2 đầu nếu có để cặp dấu CSS ::before/::after ôm trọn
      const cleanQuoteText = quoteText.split('|').map(s => s.trim().replace(/^[“"«\s]+|[”"»\s]+$/g, '').trim()).join(' | ');
      const rawParsedQuote = window.parseBilingualText ? window.parseBilingualText(cleanQuoteText, lang) : cleanQuoteText.split('|')[0].trim();
      const parsedQuote = rawParsedQuote.replace(/^[“"«\s]+|[”"»\s]+$/g, '').trim();

      const parsedSnippet = (quoteSnippet && window.parseBilingualText) ? window.parseBilingualText(quoteSnippet, lang) : (quoteSnippet || '').split('|')[0].trim();

      let authorDisplay = '';
      if (quoteAuthor) {
        authorDisplay = window.parseBilingualText ? window.parseBilingualText(quoteAuthor, lang) : quoteAuthor.split('|')[0].trim();
        authorDisplay = authorDisplay.replace(/^[—–~-\s]+/, '').trim();
      }

      return `
        <a href="${escapeHtml(post.url)}" class="sp-quote-card">
          <p class="sp-quote-text" data-bilingual="true" data-raw-label="${escapeHtml(cleanQuoteText)}">${escapeHtml(parsedQuote)}</p>
          ${authorDisplay ? `<div class="sp-quote-author" data-bilingual="true" data-raw-label="${escapeHtml(quoteAuthor)}">\u2014 ${escapeHtml(authorDisplay)}</div>` : ''}
          ${quoteSnippet ? `<div class="sp-quote-divider"></div><p class="sp-quote-snippet" data-bilingual="true" data-raw-label="${escapeHtml(quoteSnippet)}">${escapeHtml(parsedSnippet)}</p>` : ''}
          <span class="sp-quote-cta" data-bilingual="true" data-raw-label="Xem lời bình & phân tích → | View commentary & analysis →">${window.parseBilingualText ? window.parseBilingualText('Xem lời bình & phân tích → | View commentary & analysis →', lang) : 'Xem lời bình & phân tích → | View commentary & analysis →'}</span>
        </a>`;
    }).join('');

    return `<div class="sp-quote-list">${itemsHtml}</div>`;
  }

  /* ── 4. DIGEST ──────────────────────────────────────────────── */
  function renderDigestPattern(posts, opts) {
    const lang = (() => { try { return localStorage.getItem('user_lang') || 'vi'; } catch(e) { return 'vi'; } })();
    const itemsHtml = posts.map(post => {
      const snippet = (opts.showSnippet && post.snippet) ? post.snippet : '';
      const aiType  = extractAITypes(post.labels || []);
      const aiHtml  = aiType ? (' • ' + renderAIInlineBadge(aiType)) : '';

      const parsedTitle = window.parseBilingualText ? window.parseBilingualText(post.title, lang) : post.title.split('|')[0].trim();
      const parsedSnippet = (snippet && window.parseBilingualText) ? window.parseBilingualText(snippet, lang) : snippet.split('|')[0].trim();

      return `
        <a href="${escapeHtml(post.url)}" class="sp-digest-item"${aiType ? ` data-ai-type="${aiType}"` : ''}>
          <div class="sp-digest-timestamp">
            <span class="sp-digest-bullet">✦</span>
            ${escapeHtml(post.dateFormatted)}${aiHtml}
          </div>
          <div class="sp-digest-title" data-bilingual="true" data-raw-label="${escapeHtml(post.title)}">${escapeHtml(parsedTitle)}</div>
          ${snippet ? `<div class="sp-digest-snippet" data-bilingual="true" data-raw-label="${escapeHtml(snippet)}">${escapeHtml(parsedSnippet)}</div>` : ''}
        </a>`;
    }).join('');

    return `<div class="sp-digest-list">${itemsHtml}</div>`;
  }

  /* ── 5. SERIES SHOWCASE ─────────────────────────────────────── */
  const MOCK_SERIES_CATALOG = {
    'series:The-Law-Of-Union': {
      title: "The Law of 'Union and Separation'",
      posts: [
        {
          title: "The Law of 'Union and Separation' - P1: Khởi nguồn của sự gắn kết",
          url: "#post-series-union-p1",
          thumbnail: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=160&auto=format&fit=crop&q=80",
          published: "2026-09-13T08:00:00Z",
          dateFormatted: "13/09/2026",
          labels: ["Triết học", "series:The-Law-Of-Union"]
        },
        {
          title: "The Law of 'Union and Separation' - P2: Ranh giới tự do và cô độc",
          url: "#post-series-union-p2",
          thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=160&auto=format&fit=crop&q=80",
          published: "2026-09-14T09:00:00Z",
          dateFormatted: "14/09/2026",
          labels: ["Triết học", "series:The-Law-Of-Union"]
        },
        {
          title: "The Law of 'Union and Separation' - P3: Bản hòa ca của sự dung hợp",
          url: "#post-series-union-p3",
          thumbnail: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=160&auto=format&fit=crop&q=80",
          published: "2026-09-15T10:00:00Z",
          dateFormatted: "15/09/2026",
          labels: ["Triết học", "series:The-Law-Of-Union"]
        }
      ]
    },
    'series:Tu-Do-Tai-Chinh': {
      title: "Hành Trình Tự Do Tài Chính",
      posts: [
        {
          title: "Tự Do Tài Chính - Phần 1: Định nghĩa lại đồng tiền và giá trị bản thân",
          url: "#post-series-finance-p1",
          thumbnail: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=160&auto=format&fit=crop&q=80",
          published: "2026-08-01T08:00:00Z",
          dateFormatted: "01/08/2026",
          labels: ["Tài chính", "series:Tu-Do-Tai-Chinh"]
        },
        {
          title: "Tự Do Tài Chính - Phần 2: Kiểm soát chi tiêu và tư duy tích lũy",
          url: "#post-series-finance-p2",
          thumbnail: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=160&auto=format&fit=crop&q=80",
          published: "2026-08-10T09:00:00Z",
          dateFormatted: "10/08/2026",
          labels: ["Tài chính", "series:Tu-Do-Tai-Chinh"]
        },
        {
          title: "Tự Do Tài Chính - Phần 3: Danh mục đầu tư dài hạn an nhiên",
          url: "#post-series-finance-p3",
          thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=160&auto=format&fit=crop&q=80",
          published: "2026-08-20T10:00:00Z",
          dateFormatted: "20/08/2026",
          labels: ["Tài chính", "series:Tu-Do-Tai-Chinh"]
        },
        {
          title: "Tự Do Tài Chính - Phần 4: Vượt qua cạm bẫy tâm lý và FOMO",
          url: "#post-series-finance-p4",
          thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=160&auto=format&fit=crop&q=80",
          published: "2026-08-28T11:00:00Z",
          dateFormatted: "28/08/2026",
          labels: ["Tài chính", "series:Tu-Do-Tai-Chinh"]
        }
      ]
    },
    'series:Song-Toi-Gian': {
      title: "Nghệ Thuật Sống Tối Giản",
      posts: [
        {
          title: "Sống Tối Giản - Kỳ 1: Dọn dẹp không gian vật lý xung quanh",
          url: "#post-series-minimal-p1",
          thumbnail: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=160&auto=format&fit=crop&q=80",
          published: "2026-07-05T08:00:00Z",
          dateFormatted: "05/07/2026",
          labels: ["Lối sống", "series:Song-Toi-Gian"]
        },
        {
          title: "Sống Tối Giản - Kỳ 2: Tối giản các mối quan hệ độc hại",
          url: "#post-series-minimal-p2",
          thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=160&auto=format&fit=crop&q=80",
          published: "2026-07-15T09:00:00Z",
          dateFormatted: "15/07/2026",
          labels: ["Lối sống", "series:Song-Toi-Gian"]
        },
        {
          title: "Sống Tối Giản - Kỳ 3: Tìm thấy sự đủ đầy trong tâm tưởng",
          url: "#post-series-minimal-p3",
          thumbnail: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=160&auto=format&fit=crop&q=80",
          published: "2026-07-25T10:00:00Z",
          dateFormatted: "25/07/2026",
          labels: ["Lối sống", "series:Song-Toi-Gian"]
        }
      ]
    }
  };

  function formatSeriesTitle(rawLabel) {
    if (!rawLabel) return '';
    let name = rawLabel.replace(/^series:\s*/i, '').trim();
    if (name.indexOf('-') > -1 && name.indexOf(' ') === -1) {
      name = name.split('-').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join(' ');
    }
    return name;
  }

  async function fetchAvailableSeriesLabels(forceRefresh = false) {
    const cacheKey = CACHE_PREFIX + 'series_catalog_v2';
    if (!forceRefresh) {
      const cached = readCache(cacheKey);
      if (cached && Array.isArray(cached) && cached.length > 0) {
        return cached;
      }
    }

    let foundLabels = [];
    try {
      const blogUrl = getBlogBaseUrl();
      const cbParam = forceRefresh ? `&_cb=${Date.now()}` : '';
      const res = await fetch(`${blogUrl}/feeds/posts/summary?alt=json&max-results=500${cbParam}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.feed) {
          if (data.feed.category && Array.isArray(data.feed.category)) {
            data.feed.category.forEach(c => {
              if (c && c.term && /^series:/i.test(c.term)) foundLabels.push(c.term);
            });
          }
          if (data.feed.entry && Array.isArray(data.feed.entry)) {
            data.feed.entry.forEach(entry => {
              if (entry.category && Array.isArray(entry.category)) {
                entry.category.forEach(c => {
                  if (c && c.term && /^series:/i.test(c.term)) foundLabels.push(c.term);
                });
              }
            });
          }
        }
      }
    } catch (_) {}

    const labelMap = new Map();
    foundLabels.forEach(lbl => {
      const norm = lbl.trim().toLowerCase();
      if (!labelMap.has(norm)) labelMap.set(norm, lbl.trim());
    });

    let seriesLabels = Array.from(labelMap.values());
    const isLocalDev = typeof window !== 'undefined' && (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if (seriesLabels.length === 0 && isLocalDev) {
      seriesLabels = Object.keys(MOCK_SERIES_CATALOG);
    }

    writeCache(cacheKey, seriesLabels);
    return seriesLabels;
  }

  async function fetchSeriesPosts(seriesLabel) {
    let posts = [];
    try {
      posts = await fetchSingleLabelFeed(seriesLabel, 50, 'summary');
    } catch (_) {
      posts = [];
    }

    const isLocalDev = typeof window !== 'undefined' && (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if ((!posts || posts.length === 0) && isLocalDev) {
      const mock = MOCK_SERIES_CATALOG[seriesLabel] || Object.values(MOCK_SERIES_CATALOG)[0];
      if (mock && mock.posts) {
        posts = mock.posts.map(p => Object.assign({}, p));
      }
    }

    // Sắp xếp theo trình tự thời gian (Tập 1 -> Tập N)
    posts.sort((a, b) => new Date(a.published) - new Date(b.published));
    return posts;
  }

  function renderSeriesPattern(posts, opts = {}) {
    const lang = (() => { try { return localStorage.getItem('user_lang') || 'vi'; } catch(e) { return 'vi'; } })();
    const limit = opts.limit || 5;
    const seriesLabel = opts.seriesLabel || (posts[0] && (posts[0].labels || []).find(l => /^series:/i.test(l))) || '';
    const seriesTitle = opts.seriesTitle || formatSeriesTitle(seriesLabel);
    const totalParts = posts.length;
    const displayedPosts = posts.slice(0, limit);

    // Compact count text: e.g. "3/10 bài viết | 3/10 topics"
    const rawCountBadge = `${displayedPosts.length}/${totalParts} bài viết | ${displayedPosts.length}/${totalParts} topics`;
    const parsedCountBadge = window.parseBilingualText ? window.parseBilingualText(rawCountBadge, lang) : `${displayedPosts.length}/${totalParts} bài viết`;

    // Tooltip text for extension icon button
    const rawTooltip = `Xem tất cả | View all`;
    const parsedTooltip = window.parseBilingualText ? window.parseBilingualText(rawTooltip, lang) : `Xem tất cả`;
    const seriesSearchUrl = buildLabelUrl(seriesLabel, seriesTitle);

    const itemsHtml = displayedPosts.map((post, index) => {
      const numStr = String(index + 1).padStart(2, '0');
      const thumb = (opts.showThumb !== false && post.thumbnail)
        ? optimizeThumbnail(post.thumbnail, 's160-c')
        : '';
      const parsedPostTitle = window.parseBilingualText ? window.parseBilingualText(post.title, lang) : post.title.split('|')[0].trim();
      const aiType = extractAITypes(post.labels || []);
      const aiHtml = aiType ? (' • ' + renderAIInlineBadge(aiType)) : '';

      return `
        <li>
          <a class="popular-post-item" href="${escapeHtml(post.url)}"${aiType ? ` data-ai-type="${aiType}"` : ''}>
            <span class="popular-post-num">${numStr}</span>
            ${thumb ? `<img class="popular-post-thumb" src="${escapeHtml(thumb)}" alt="${escapeHtml(post.title)}" loading="lazy" width="60" height="60"/>` : '<div class="popular-post-thumb sp-no-thumb"></div>'}
            <div class="popular-post-info">
              <div class="popular-post-title" data-bilingual="true" data-raw-label="${escapeHtml(post.title)}">${escapeHtml(parsedPostTitle)}</div>
              <div class="popular-post-date">📅 ${escapeHtml(post.dateFormatted)}${aiHtml}</div>
            </div>
          </a>
        </li>`;
    }).join('');

    return `
      <div class="series-showcase-summary">
        <div class="series-showcase-name-group" title="${escapeHtml(seriesTitle)}">
          <span class="series-showcase-book-icon" aria-hidden="true">📖</span>
          <strong class="series-showcase-name" data-bilingual="true" data-raw-label="${escapeHtml(seriesTitle)}">${escapeHtml(seriesTitle)}</strong>
        </div>
        <div class="series-showcase-meta-right">
          <span class="series-showcase-count-pill" data-bilingual="true" data-raw-label="${escapeHtml(rawCountBadge)}">${escapeHtml(parsedCountBadge)}</span>
        </div>
      </div>
      <ul class="popular-posts-list series-showcase-list">
        ${itemsHtml}
      </ul>
      <div class="series-showcase-footer">
        <a href="${escapeHtml(seriesSearchUrl)}" class="series-showcase-ext-btn" title="${escapeHtml(parsedTooltip)}" aria-label="${escapeHtml(parsedTooltip)}">
          <span class="series-ext-label" data-bilingual="true" data-raw-label="${escapeHtml(rawTooltip)}">${escapeHtml(parsedTooltip)}</span>
          <svg class="series-ext-svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="13 17 18 12 13 7"></polyline>
            <polyline points="6 17 11 12 6 7"></polyline>
          </svg>
        </a>
      </div>
    `;
  }

  async function renderSeriesWidget(container, opts) {
    const { widgetTitle, limit, specifiedLabel } = opts;

    let availableSeries = await fetchAvailableSeriesLabels();
    container._availableSeries = availableSeries;

    let targetLabel = specifiedLabel;
    if (!targetLabel || !/^series:/i.test(targetLabel)) {
      const randIdx = Math.floor(Math.random() * availableSeries.length);
      targetLabel = availableSeries[randIdx];
      container._currentSeriesIndex = randIdx;
    } else {
      container._currentSeriesIndex = availableSeries.indexOf(targetLabel);
      if (container._currentSeriesIndex === -1) container._currentSeriesIndex = 0;
    }

    await renderSeriesContainerView(container, targetLabel, limit, widgetTitle);
  }

  async function renderSeriesContainerView(container, seriesLabel, limit, widgetTitle) {
    const posts = await fetchSeriesPosts(seriesLabel);
    if (!posts || posts.length === 0) {
      container.style.display = 'none';
      return;
    }
    const seriesTitle = formatSeriesTitle(seriesLabel);
    const lang = (() => { try { return localStorage.getItem('user_lang') || 'vi'; } catch(e) { return 'vi'; } })();
    const shuffleRawLabel = 'Đổi tuyến bài | Switch series';
    const shuffleRawTitle = 'Khám phá chuyên đề khác | Discover another series';
    const shuffleParsedLabel = window.parseBilingualText ? window.parseBilingualText(shuffleRawLabel, lang) : 'Đổi tuyến bài';
    const shuffleParsedTitle = window.parseBilingualText ? window.parseBilingualText(shuffleRawTitle, lang) : 'Khám phá chuyên đề khác';

    const shuffleBtnHtml = `
      <button type="button" class="series-shuffle-btn" aria-label="${escapeHtml(shuffleParsedLabel)}" title="${escapeHtml(shuffleParsedTitle)}">
        <svg class="series-shuffle-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="16 3 21 3 21 8"></polyline>
          <line x1="4" y1="20" x2="21" y2="3"></line>
          <polyline points="21 16 21 21 16 21"></polyline>
          <line x1="15" y1="15" x2="21" y2="21"></line>
          <line x1="4" y1="4" x2="9" y2="9"></line>
        </svg>
      </button>
    `;

    const bodyHtml = renderSeriesPattern(posts, {
      limit,
      seriesLabel,
      seriesTitle,
      showThumb: container.dataset.showThumbnail !== 'false'
    });

    container.innerHTML = buildWidgetShell(
      widgetTitle || '📚 Chuyên Đề | 📚 Series Topic',
      '',
      seriesLabel,
      'series',
      bodyHtml,
      posts,
      shuffleBtnHtml
    );

    // Gắn sự kiện cho nút Shuffle
    const shuffleBtn = container.querySelector('.series-shuffle-btn');
    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', async function (e) {
        e.preventDefault();
        e.stopPropagation();

        shuffleBtn.classList.add('is-spinning');
        let available = container._availableSeries || [];

        // Nếu chỉ có 1 series hoặc rỗng, thử quét lại feed (forceRefresh) để cập nhật nếu có series mới
        if (available.length <= 1) {
          try {
            available = await fetchAvailableSeriesLabels(true);
            container._availableSeries = available;
          } catch (_) {}
        }

        if (available.length > 1) {
          let nextIdx = ((container._currentSeriesIndex || 0) + 1) % available.length;
          if (available[nextIdx] === seriesLabel) {
            nextIdx = (nextIdx + 1) % available.length;
          }
          container._currentSeriesIndex = nextIdx;
          const nextLabel = available[nextIdx];

          const bodyEl = container.querySelector('.series-widget-body, .sp-widget-body');
          if (bodyEl) {
            bodyEl.style.opacity = '0.35';
            bodyEl.style.transition = 'opacity 0.25s ease';
          }

          await renderSeriesContainerView(container, nextLabel, limit, widgetTitle);

          const newBody = container.querySelector('.series-widget-body, .sp-widget-body');
          if (newBody) {
            newBody.style.opacity = '1';
          }
        } else {
          // Blog chỉ có 1 series: tạo hiệu ứng reload nhẹ và dừng xoay
          const bodyEl = container.querySelector('.series-widget-body, .sp-widget-body');
          if (bodyEl) {
            bodyEl.style.opacity = '0.4';
            bodyEl.style.transition = 'opacity 0.2s ease';
            setTimeout(() => {
              bodyEl.style.opacity = '1';
            }, 300);
          }
        }

        setTimeout(function () {
          const btn = container.querySelector('.series-shuffle-btn');
          if (btn) btn.classList.remove('is-spinning');
        }, 500);

        if (window.applyBilingualElements) {
          window.applyBilingualElements();
        }
      });
    }

    if (window.applyBilingualElements) {
      window.applyBilingualElements();
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     DATA FETCHERS
     ═══════════════════════════════════════════════════════════════ */

  /* ── Fetch nhiều nhãn song song + deduplication ─────────────── */
  async function fetchMultiLabelPosts(labels, limit, sort, feedType = 'summary') {
    // Nạp song song tất cả nhãn
    const promises = labels.map(label => fetchSingleLabelFeed(label, limit + 5, feedType));
    const results  = await Promise.all(promises);

    // Gộp
    const allPosts = results.flat();

    // Khử trùng lặp theo URL
    const uniqueMap = new Map();
    allPosts.forEach(post => {
      if (!uniqueMap.has(post.url)) uniqueMap.set(post.url, post);
    });
    let merged = Array.from(uniqueMap.values());

    // Sắp xếp
    if (sort === 'random') {
      merged.sort(() => Math.random() - 0.5);
    } else {
      // latest (mặc định)
      merged.sort((a, b) => new Date(b.published) - new Date(a.published));
    }

    return merged.slice(0, limit);
  }

  /* ── Fetch 1 nhãn qua Blogger JSON Feed API ─────────────────── */
  async function fetchSingleLabelFeed(label, count, feedType = 'summary') {
    const cacheKey = CACHE_PREFIX + 'label_' + encodeURIComponent(label) + '_' + count + '_' + feedType;
    const cached   = readCache(cacheKey);
    if (cached) return cached;

    try {
      const encodedLabel = encodeURIComponent(label);
      const blogUrl      = getBlogBaseUrl();
      const url          = `${blogUrl}/feeds/posts/${feedType}/-/${encodedLabel}?alt=json&max-results=${count}&orderby=published`;

      const res  = await fetch(url);
      if (!res.ok) {
        if (label !== label.toLowerCase()) {
          return await fetchSingleLabelFeed(label.toLowerCase(), count, feedType);
        }
        return [];
      }
      const json = await res.json();

      let posts = parseFeedEntries(json.feed ? json.feed.entry : []);
      // Nếu không có bài nào và tên nhãn chứa chữ hoa, thử tìm biến thể chữ thường
      if (posts.length === 0 && label !== label.toLowerCase()) {
        const lowerPosts = await fetchSingleLabelFeed(label.toLowerCase(), count, feedType);
        if (lowerPosts && lowerPosts.length > 0) return lowerPosts;
      }

      writeCache(cacheKey, posts);
      return posts;
    } catch (e) {
      if (label !== label.toLowerCase()) {
        try {
          return await fetchSingleLabelFeed(label.toLowerCase(), count, feedType);
        } catch (_) {}
      }
      return [];
    }
  }

  /* ── Fetch bài viết mới nhất toàn blog (Fallback tự động) ─────── */
  async function fetchLatestPosts(count, feedType = 'summary') {
    const cacheKey = CACHE_PREFIX + 'latest_' + count + '_' + feedType;
    const cached   = readCache(cacheKey);
    if (cached) return cached;

    try {
      const blogUrl = getBlogBaseUrl();
      const url     = `${blogUrl}/feeds/posts/${feedType}?alt=json&max-results=${count}&orderby=published`;
      const res     = await fetch(url);
      if (!res.ok) return [];
      const json    = await res.json();
      const posts   = parseFeedEntries(json.feed ? json.feed.entry : []);
      writeCache(cacheKey, posts);
      return posts;
    } catch (e) {
      return [];
    }
  }

  /* ── Fetch Popular Posts (lượt xem nhiều nhất) ──────────────── */
  async function fetchPopularPosts(limit, timeRange, labelFilter, feedType = 'summary') {
    const cacheKey = CACHE_PREFIX + 'popular_' + timeRange + '_' + limit + '_' + feedType;
    const cached   = readCache(cacheKey);
    if (cached) {
      return filterByLabels(cached, labelFilter, limit);
    }

    try {
      const blogUrl = getBlogBaseUrl();
      let url;
      if (labelFilter) {
        const labelList    = splitLabels(labelFilter);
        const encodedLabel = encodeURIComponent(labelList[0]);
        url = `${blogUrl}/feeds/posts/${feedType}/-/${encodedLabel}?alt=json&max-results=20&orderby=updated`;
      } else {
        url = `${blogUrl}/feeds/posts/${feedType}?alt=json&max-results=20&orderby=updated`;
      }

      const res  = await fetch(url);
      if (!res.ok) return [];
      const json = await res.json();

      const posts = parseFeedEntries(json.feed ? json.feed.entry : []);
      writeCache(cacheKey, posts);
      return posts.slice(0, limit);
    } catch (e) {
      return [];
    }
  }

  /* ── Fetch các bài viết theo danh sách URL chỉ định ─────────── */
  async function fetchHandpickedPosts(rawUrls) {
    const urls = rawUrls.split(',')
      .map(u => u.trim())
      .filter(Boolean);

    const blogBase = getBlogBaseUrl();

    const promises = urls.map(async (relOrAbs) => {
      const absUrl   = relOrAbs.startsWith('http') ? relOrAbs : blogBase + relOrAbs;
      const feedUrl  = absUrl.includes('?')
        ? absUrl + '&alt=json'
        : absUrl + '?alt=json';
      const cacheKey = CACHE_PREFIX + 'post_' + encodeURIComponent(absUrl);
      const cached   = readCache(cacheKey);
      if (cached) return cached;

      try {
        const res  = await fetch(feedUrl);
        const json = await res.json();
        const entry = json.entry;
        if (!entry) return null;
        const post = parseEntry(entry);
        writeCache(cacheKey, post);
        return post;
      } catch {
        return null;
      }
    });

    const results = await Promise.all(promises);
    return results.filter(Boolean);
  }

  /* ═══════════════════════════════════════════════════════════════
     PARSER HELPERS
     ═══════════════════════════════════════════════════════════════ */

  function parseFeedEntries(entries) {
    if (!Array.isArray(entries)) return [];
    return entries.map(parseEntry).filter(Boolean);
  }

  function parseEntry(entry) {
    try {
      // URL bài viết
      const links  = entry.link || [];
      const altLink = links.find(l => l.rel === 'alternate');
      const url    = altLink ? altLink.href : '';

      // Tiêu đề
      const title = entry.title ? (entry.title.$t || '') : '';

      // Ảnh thumbnail
      let thumbnail = '';
      if (entry.content && entry.content.$t) {
        const imgMatch = entry.content.$t.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch) thumbnail = imgMatch[1];
      }
      if (!thumbnail && entry.media$thumbnail) {
        thumbnail = entry.media$thumbnail.url || '';
      }

      // Snippet
      let snippet = '';
      if (entry.summary) {
        snippet = (entry.summary.$t || '').replace(/<[^>]+>/g, '').trim();
      } else if (entry.content) {
        snippet = (entry.content.$t || '').replace(/<[^>]+>/g, '').trim().substring(0, 200);
      }

      // Ngày đăng
      const published = entry.published ? entry.published.$t : '';
      const dateFormatted = formatDate(published);

      // Labels
      const labels = (entry.category || []).map(c => c.term || '');

      const rawContent = entry.content ? (entry.content.$t || '') : '';

      return { url, title, thumbnail, snippet, published, dateFormatted, labels, rawContent };
    } catch {
      return null;
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     UTILS
     ═══════════════════════════════════════════════════════════════ */

  /** Trích xuất nhãn chuyên mục thường đầu tiên (loại trừ @ và ai:) */
  function extractNormalCategory(labels) {
    if (!labels || !labels.length) return '';
    for (var i = 0; i < labels.length; i++) {
      var raw = (labels[i] || '').trim();
      var lower = raw.toLowerCase();
      if (!raw.startsWith('@') && !lower.startsWith('ai:') && !lower.startsWith('ai-') && !lower.startsWith('series:')) {
        return raw;
      }
    }
    return '';
  }

  /** Lọc ký tự @ # _ ~ khỏi tên nhãn trước khi hiển thị */
  function formatLabelName(raw) {
    if (!raw) return '';
    return decodeURIComponent(String(raw)).replace(/^[@#_~]+/, '').trim();
  }

  /** Trích xuất loại AI từ mảng labels; trả về key hoặc null với thứ tự ưu tiên */
  function extractAITypes(labels) {
    var aiTypeContent = null;
    var aiTypeProduct = null;
    var priority = ['ai:generated', 'ai:contributed', 'ai:assisted', 'ai:translated'];
    if (labels && labels.length) {
      for (var i = 0; i < labels.length; i++) {
        var raw = labels[i] || '';
        var lower = raw.toLowerCase().replace(/-/g, ':');
        if (lower.startsWith('ai:')) {
          if (lower === 'ai:product') {
             aiTypeProduct = lower;
          } else {
             if (priority.indexOf(lower) !== -1) {
               if (!aiTypeContent || priority.indexOf(lower) < priority.indexOf(aiTypeContent)) {
                 aiTypeContent = lower;
               }
             }
          }
        }
      }
    }
    var res = [];
    if (aiTypeContent) res.push(aiTypeContent);
    if (aiTypeProduct) res.push(aiTypeProduct);
    return res.length > 0 ? res.join(',') : null;
  }

  function renderAIInlineBadge(aiTypeString) {
    if (!aiTypeString) return '';
    var aiTypes = aiTypeString.split(',').filter(Boolean);
    var html = '';
    var icons = { 'ai:assisted': '✨', 'ai:contributed': '✨', 'ai:product': '🤖', 'ai:generated': '⚡', 'ai:translated': '🌐' };
    for (var i = 0; i < aiTypes.length; i++) {
      var type = aiTypes[i];
      var icon = icons[type] || '✨';
      html += '<span class="ai-badge ai-badge-inline" data-ai-type="' + type + '" data-ai-variant="inline">' +
        '<span class="ai-badge-icon">' + icon + '</span>' +
        '<span class="ai-badge-label">AI</span>' +
      '</span>';
    }
    return html;
  }

  function renderAIStandardBadge(aiTypeString, lang) {
    if (!aiTypeString) return '';
    var aiTypes = aiTypeString.split(',').filter(Boolean);
    var html = '';
    var icons = { 'ai:assisted': '✨', 'ai:contributed': '✨', 'ai:product': '🤖', 'ai:generated': '⚡', 'ai:translated': '🌐' };
    var labels = {
      'ai:assisted':    { vi: 'Hỗ trợ bởi AI',   en: 'AI-Assisted'   },
      'ai:contributed': { vi: 'Đóng góp bởi AI', en: 'AI-Contributed' },
      'ai:product':     { vi: 'Sản phẩm AI',     en: 'AI Product'     },
      'ai:generated':   { vi: 'Tạo bởi AI',      en: 'AI-Generated'   },
      'ai:translated':  { vi: 'Dịch bởi AI',     en: 'AI-Translated'  }
    };
    for (var i = 0; i < aiTypes.length; i++) {
      var type = aiTypes[i];
      var icon = icons[type] || '✨';
      var labelCfg = labels[type] || labels['ai:assisted'];
      var labelText = (lang === 'en') ? labelCfg.en : labelCfg.vi;
      html += '<span class="ai-badge ai-badge-standard" data-ai-type="' + type + '" data-ai-variant="standard">' +
        '<span class="ai-badge-icon">' + icon + '</span>' +
        '<span class="ai-badge-label">' + labelText + '</span>' +
      '</span>';
    }
    return html;
  }

  /** Tách chuỗi nhãn "A, B, C" thành mảng */
  function splitLabels(raw) {
    if (!raw) return [];
    const cleaned = raw.replace(/^(labels?|nhãn)\s*:\s*/i, '');
    return cleaned.split(',').map(l => l.trim()).filter(Boolean);
  }

  /** Tối ưu kích thước ảnh Blogger (Retina-safe) */
  function optimizeThumbnail(url, size) {
    if (!url) return '';
    return url
      .replace(/\/(s[0-9]+|w[0-9]+-h[0-9]+)(-c)?\//, '/' + size + '/')
      .replace(/=(s[0-9]+|w[0-9]+-h[0-9]+)(-c)?([a-zA-Z0-9-]*)$/i, '=' + size);
  }

  /** Format ngày ISO thành DD/MM/YYYY */
  function formatDate(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const dd   = String(d.getDate()).padStart(2, '0');
      const mm   = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    } catch { return ''; }
  }

  /** Lấy base URL của blog hiện tại */
  function getBlogBaseUrl() {
    return window.location.protocol + '//' + window.location.host;
  }

  /** Build URL trang nhãn (lọc @ cho URL, kèm tiêu đề hiển thị nếu có) */
  function buildLabelUrl(label, title) {
    if (!label) return '/';
    const blogBase = getBlogBaseUrl();
    let url = `${blogBase}/search/label/${encodeURIComponent(label)}`;
    if (title) {
      url += `?title=${encodeURIComponent(title)}`;
    }
    return url;
  }

  /** Lọc bài viết theo danh sách nhãn (OR logic) */
  function filterByLabels(posts, rawLabels, limit) {
    if (!rawLabels) return posts.slice(0, limit);
    const labels = splitLabels(rawLabels);
    const filtered = posts.filter(p =>
      p.labels && p.labels.some(l => labels.includes(l))
    );
    return (filtered.length > 0 ? filtered : posts).slice(0, limit);
  }

  /** Escape HTML để tránh XSS */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ═══════════════════════════════════════════════════════════════
     SESSION STORAGE CACHE
     ═══════════════════════════════════════════════════════════════ */

  function readCache(key) {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      if (Date.now() - ts > CACHE_TTL) {
        sessionStorage.removeItem(key);
        return null;
      }
      return data;
    } catch { return null; }
  }

  function writeCache(key, data) {
    try {
      sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
    } catch { /* Quota exceeded — bỏ qua */ }
  }

  /* ═══════════════════════════════════════════════════════════════
     ANCHOR SCROLL HIGHLIGHT
     Khi URL chứa #widget-{slug}, cuộn mượt + kích hoạt pulse
     ═══════════════════════════════════════════════════════════════ */
  function initAnchorHighlight() {
    function handleHash(hash) {
      if (!hash) return;
      const el = document.querySelector(hash);
      if (el && el.classList.contains('special-posts-widget')) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('sp-anchor-highlight');
        setTimeout(() => el.classList.remove('sp-anchor-highlight'), 1800);
      }
    }

    // Xử lý hash lúc trang load
    if (window.location.hash) {
      // Đợi widget render xong
      setTimeout(() => handleHash(window.location.hash), 600);
    }

    // Xử lý khi hash thay đổi (bấm link trong trang)
    window.addEventListener('hashchange', () => handleHash(window.location.hash));
  }

})();
