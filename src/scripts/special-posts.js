/**
 * Blogger Special Posts Widget Engine v2.2
 * Multi-label Support & Pluggable Pattern Strategy
 * Spec: FEAT-FLEXIBLE-SPECIAL-POSTS-WIDGET-V2 / OPEN_019
 *
 * Features:
 *  - Multi-label fetch (parallel) với deduplication
 *  - SessionStorage cache (5 phút cho posts, 60 phút cho reels)
 *  - 6 renderers: ranked, spotlight, quote, digest, series, reels
 *  - Skeleton shimmer (CLS = 0)
 *  - Anchor scroll highlight pulse
 *  - Label sanitization (lọc @ # _ ~)
 *  - Fallback: views → latest nếu API lỗi
 *  - Video & Reels Showcase: Living Canvas, Blurred BG Fill, Hover/In-View Preview,
 *    Audio Equalizer Waveform, Click-to-Play Facade, Hot/Regular Pool (60:40)
 */
(function () {
  'use strict';

  /* ─── Cache Configuration & Helpers ────────────────────────── */
  const CACHE_PREFIX      = 'editorial_sp_v5_';
  const DEFAULT_CACHE_TTL = 2 * 60 * 1000; // 2 phút mặc định (giảm TTL để bài mới hiển thị nhanh)

  function getEffectiveCacheTtl(customTtl) {
    if (typeof customTtl === 'number' && customTtl > 0) return customTtl;
    if (typeof window !== 'undefined') {
      if (typeof window.__EDITORIAL_CACHE_TTL__ === 'number' && window.__EDITORIAL_CACHE_TTL__ > 0) {
        return window.__EDITORIAL_CACHE_TTL__;
      }
      if (typeof window.EDITORIAL_CACHE_TTL === 'number' && window.EDITORIAL_CACHE_TTL > 0) {
        return window.EDITORIAL_CACHE_TTL;
      }
    }
    return DEFAULT_CACHE_TTL;
  }

  /* ─── Pattern → Renderer map (Pluggable Strategy) ───────────── */
  const PATTERN_RENDERERS = {
    ranked:    renderRankedPattern,
    spotlight: renderSpotlightPattern,
    quote:     renderQuotePattern,
    digest:    renderDigestPattern,
    series:    renderSeriesPattern,
    reels:     renderReelsPattern,
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
      const match = directContent.match(/^(?:pattern|kiểu)\s*:\s*(spotlight|ranked|quote|digest|series|reels)/i);
      if (match) {
        const pattern = match[1].toLowerCase();
        const wrapper = document.createElement('div');
        wrapper.className = 'special-posts-widget';
        wrapper.dataset.pattern = pattern;
        const configDiv = document.createElement('div');
        configDiv.className = 'sp-raw-user-content';
        configDiv.style.display = 'none';
        configDiv.textContent = directContent.replace(/^(?:pattern|kiểu)\s*:\s*(spotlight|ranked|quote|digest|series|reels)\s*\|?/i, '').trim();
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
        let lines = textOnly.split('\n').map(s => s.trim()).filter(Boolean);
        let parts = [];
        lines.forEach(line => {
          if (line.includes('|') && !/^title\s*:/i.test(line)) {
            parts.push(...line.split('|').map(s => s.trim()).filter(Boolean));
          } else {
            parts.push(line);
          }
        });
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
          } else if (/^(?:fetch-count|fetchCount)\s*:\s*(\d+)/i.test(part)) {
            container.dataset.fetchCount = part.match(/^(?:fetch-count|fetchCount)\s*:\s*(\d+)/i)[1];
          } else if (/^(?:hot-label|hotLabel)\s*:\s*(.+)/i.test(part)) {
            container.dataset.hotLabel = part.match(/^(?:hot-label|hotLabel)\s*:\s*(.+)/i)[1].trim();
          } else if (/^(?:hot-ratio|hotRatio)\s*:\s*(\d+)%?/i.test(part)) {
            container.dataset.hotRatio = part.match(/^(?:hot-ratio|hotRatio)\s*:\s*(\d+)/i)[1];
          } else if (/^extract\s*:\s*(\w+)/i.test(part)) {
            container.dataset.extract = part.match(/^extract\s*:\s*(\w+)/i)[1];
          } else if (/^media\s*:\s*(\w+)/i.test(part)) {
            container.dataset.media = part.match(/^media\s*:\s*(\w+)/i)[1];
          } else if (/^(?:cta-text|ctaText)\s*:\s*(.+)/i.test(part)) {
            container.dataset.ctaText = part.match(/^(?:cta-text|ctaText)\s*:\s*(.+)/i)[1].trim();
          } else if (/^mode\s*:\s*(\w+)/i.test(part)) {
            container.dataset.mode = part.match(/^mode\s*:\s*(\w+)/i)[1];
          } else if (/^(?:play-mode|playMode|chế-độ-phát)\s*:\s*(\w+)/i.test(part)) {
            container.dataset.playMode = part.match(/^(?:play-mode|playMode|chế-độ-phát)\s*:\s*(\w+)/i)[1].trim();
          } else if (/^(?:labels?|nhãn)\s*:\s*(.+)/i.test(part)) {
            container.dataset.labels = part.match(/^(?:labels?|nhãn)\s*:\s*(.+)/i)[1].trim();
          } else if (!part.includes(':') || /^[^:]+$/.test(part)) {
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
    const defaultLimit   = pattern === 'series' ? 5 : (pattern === 'reels' ? 10 : 4);
    const limit          = Math.min(parseInt(container.dataset.limit, 10) || defaultLimit, pattern === 'reels' ? 24 : 10);
    const sort           = container.dataset.sort     || (pattern === 'series' ? 'random' : 'latest');
    const handpickedRaw  = container.dataset.posts    || '';
    const showThumb      = container.dataset.showThumbnail !== 'false';
    const showSnippet    = container.dataset.showSnippet   !== 'false';
    const lang           = window.currentLang || document.documentElement.lang || 'vi';
    const rawViewAll     = container.dataset.viewAllText;
    let viewAllText      = (rawViewAll === 'false' || rawViewAll === 'none') ? '' : (rawViewAll || 'Xem tất cả » | View All »');
    let widgetTitle      = container.dataset.title || (pattern === 'series' ? '📚 Chuyên Đề | 📚 Series Topic' : (pattern === 'reels' ? 'Video' : ''));

    // Thêm class pattern cho container queries
    container.classList.add('pattern-' + pattern);

    // Skeleton loading trước — CLS = 0
    renderSkeleton(container, pattern, limit, widgetTitle, viewAllText, rawLabels);

    // ── Reels widget handler ──
    if (pattern === 'reels') {
      try {
        await renderReelsWidget(container, {
          widgetTitle,
          limit,
          rawLabels: rawLabels || '@video',
          hotLabel: container.dataset.hotLabel || '@video-hot',
          hotRatio: parseInt(container.dataset.hotRatio, 10) || 60,
          fetchCount: Math.min(parseInt(container.dataset.fetchCount, 10) || 40, 100),
          sort: container.dataset.sort || 'random',
          extract: container.dataset.extract || 'first',
          media: container.dataset.media || 'all',
          ctaText: container.dataset.ctaText || 'Xem chi tiết ➔',
          mode: container.dataset.mode || 'auto',
          playMode: container.dataset.playMode || 'modal',
        });
        return;
      } catch (reelsErr) {
        console.warn('[SpecialPostsWidget] Reels render error:', reelsErr);
      }
    }

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

    if (pattern === 'reels') {
      const reelCount = Math.min(limit || 5, 6);
      const cards = Array.from({ length: reelCount }).map(() => `
        <div class="sp-reel-card sp-reel-skeleton">
          <div class="sp-reel-skeleton-bg"></div>
        </div>`).join('');
      skeletonBody = `
        <div class="sp-reels-container">
          <div class="sp-reels-track sp-reels-track--skeleton">${cards}</div>
        </div>`;

    } else if (pattern === 'spotlight') {
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

    if (pattern === 'reels') {
      const inSidebar = !!container.closest('.sidebar, aside, [class*="sidebar"], .sidebar-widget');
      const inTopWide = !!container.closest('#top-wide-section');
      const isSeamless = inTopWide || container.dataset.seamless === 'true';
      if (inSidebar) {
        const parentWidget = container.closest('.sidebar-widget');
        if (parentWidget) parentWidget.classList.add('sidebar-widget--edge-to-edge');
      }
      container.innerHTML = buildReelsWidgetShell(title, skeletonBody, inSidebar, isSeamless);
    } else {
      container.innerHTML = buildWidgetShell(title, viewAllText, rawLabels, pattern, skeletonBody);
    }
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

  /* ── Reels Widget Shell (Khung viền Facebook Reels sang trọng) ── */
  function buildReelsWidgetShell(title, bodyHtml, isSidebar = false, isSeamless = false) {
    const displayTitle = title ? title.trim() : 'Video';
    const showHeader = !isSidebar && !isSeamless;
    const headerHtml = showHeader ? `
        <div class="sp-reels-header">
          <div class="sp-reels-header-left">
            <svg class="sp-reels-header-icon" viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
              <path d="M19.5 4h-15A2.5 2.5 0 0 0 2 6.5v11A2.5 2.5 0 0 0 4.5 20h15a2.5 2.5 0 0 0 2.5-2.5v-11A2.5 2.5 0 0 0 19.5 4zm.5 13.5a.5.5 0 0 1-.5.5h-15a.5.5 0 0 1-.5-.5V10h16v7.5zm0-9.5H4V6.5a.5.5 0 0 1 .5-.5h2.15l1.62 2h2.23l-1.62-2h3.24l1.62 2h2.23l-1.62-2h2.65a.5.5 0 0 1 .5.5V8z"/>
            </svg>
            <h3 class="sp-reels-header-title">${escapeHtml(displayTitle)}</h3>
          </div>
          <div class="sp-reels-header-actions" aria-hidden="true">
            <button class="sp-reels-more-btn" type="button" aria-label="Tùy chọn">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <circle cx="5" cy="12" r="2"></circle>
                <circle cx="12" cy="12" r="2"></circle>
                <circle cx="19" cy="12" r="2"></circle>
              </svg>
            </button>
          </div>
        </div>` : '';

    return `
      <div class="sp-reels-shelf pattern-reels ${isSidebar ? 'sp-reels-shelf--sidebar' : ''} ${isSeamless ? 'sp-reels-shelf--seamless' : ''}">
        ${headerHtml}
        <div class="sp-reels-body">
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
     REELS ENGINE — OPEN_019 (Video & Voice Reels Showcase)
     ═══════════════════════════════════════════════════════════════ */

  /* ── Mock data cho chế độ preview / local dev (100% link thật, không bị chặn nhúng) ── */
  const MOCK_REELS_DATA = [
    {
      type: 'youtube',
      videoId: 'M7lc1UVf-VE',
      isShorts: false,
      isHot: true,
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80',
      previewWebp: 'https://i.ytimg.com/an_webp/M7lc1UVf-VE/mqdefault_6s.webp',
      title: '🔥 YouTube: Google Developers IFrame Player Demo (Chuẩn Google)',
      url: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      duration: '4:20',
      postThumbnail: ''
    },
    {
      type: 'youtube',
      videoId: 'aqz-KE-bpKQ',
      isShorts: false,
      isHot: true,
      thumbnail: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&auto=format&fit=crop&q=80',
      previewWebp: 'https://i.ytimg.com/an_webp/aqz-KE-bpKQ/mqdefault_6s.webp',
      title: '🔥 Phim Hoạt Hình 4K Siêu Nét (Blender Open Movie CC-BY)',
      url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
      duration: '9:56',
      postThumbnail: ''
    },
    {
      type: 'mp4',
      videoId: '',
      isShorts: false,
      isHot: false,
      src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&auto=format&fit=crop&q=80',
      previewWebp: '',
      title: '🌸 Video Thiên Nhiên Cực Đẹp (HTML5 MP4 Trực Tiếp - MDN)',
      url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      duration: '0:05',
      postThumbnail: ''
    },
    {
      type: 'audio',
      videoId: '',
      isShorts: false,
      isHot: false,
      src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&auto=format&fit=crop&q=80',
      previewWebp: '',
      title: '🎙️ Podcast Sống Chậm: Nghệ Thuật Lắng Nghe Bản Thân — Tập 12',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: '6:12',
      postThumbnail: ''
    },
    {
      type: 'mp4',
      videoId: '',
      isShorts: false,
      isHot: false,
      src: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
      previewWebp: '',
      title: '🎬 Hoạt Hình Big Buck Bunny HD (HTML5 MP4 - W3Schools)',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      duration: '0:10',
      postThumbnail: ''
    },
    {
      type: 'youtube',
      videoId: 'jNQXAC9IVRw',
      isShorts: false,
      isHot: false,
      thumbnail: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=600&auto=format&fit=crop&q=80',
      previewWebp: 'https://i.ytimg.com/an_webp/jNQXAC9IVRw/mqdefault_6s.webp',
      title: '⚡ Thước Phim Lịch Sử Đầu Tiên Trên YouTube: Me At The Zoo',
      url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      duration: '0:19',
      postThumbnail: ''
    },
    {
      type: 'youtube',
      videoId: 'dQw4w9WgXcQ',
      isShorts: false,
      isHot: true,
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      previewWebp: 'https://i.ytimg.com/an_webp/dQw4w9WgXcQ/mqdefault_6s.webp',
      title: '🔥 Âm Nhạc & Cảm Hứng Sáng Tạo Đỉnh Cao (Music Video Showcase)',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      duration: '3:33',
      postThumbnail: ''
    },
    {
      type: 'mp4',
      videoId: '',
      isShorts: false,
      isHot: false,
      src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=80',
      previewWebp: '',
      title: '☕ Góc Làm Việc Tối Giản & Trải Nghiệm Deep Work Mỗi Sáng',
      url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      duration: '0:05',
      postThumbnail: ''
    },
    {
      type: 'audio',
      videoId: '',
      isShorts: false,
      isHot: false,
      src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      thumbnail: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
      previewWebp: '',
      title: '🎙️ Podcast Đọc Sách: Tư Duy Nhanh Và Chậm Trong Đời Sống',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      duration: '7:05',
      postThumbnail: ''
    },
    {
      type: 'youtube',
      videoId: '9bZkp7q19f0',
      isShorts: false,
      isHot: true,
      thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
      previewWebp: 'https://i.ytimg.com/an_webp/9bZkp7q19f0/mqdefault_6s.webp',
      title: '🔥 Kỷ Nguyên AI & Công Nghệ Thay Đổi Cách Chúng Ta Làm Việc',
      url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      duration: '4:12',
      postThumbnail: ''
    },
    {
      type: 'mp4',
      videoId: '',
      isShorts: false,
      isHot: false,
      src: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80',
      previewWebp: '',
      title: '🌿 Hành Trình Khám Phá Thiên Nhiên & Tìm Lại Sự Bình Yên',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      duration: '0:10',
      postThumbnail: ''
    },
    {
      type: 'youtube',
      videoId: 'L_LUpnjgPso',
      isShorts: false,
      isHot: false,
      thumbnail: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&auto=format&fit=crop&q=80',
      previewWebp: 'https://i.ytimg.com/an_webp/L_LUpnjgPso/mqdefault_6s.webp',
      title: '💡 Bài Học Khởi Nghiệp & Quản Trị Thời Gian Hiệu Quả',
      url: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
      duration: '5:40',
      postThumbnail: ''
    }
  ];

  /* ── Ma trận Nhận diện Phương tiện (Platform Regex Matchers) ── */
  function extractPostMedia(post, opts) {
    const extract = opts.extract || 'first';
    const mediaFilter = opts.media || 'all';
    const content = post.rawContent || post.snippet || '';
    const postUrl = post.url || '';

    const found = [];

    // 1. YouTube (Chuẩn + Shorts + Embed)
    if (mediaFilter === 'all' || mediaFilter === 'video') {
      // Quét trong content HTML sau khi giải mã ký tự entity
      const searchSrc = String(content + ' ' + postUrl)
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      const ytRegex = /(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|live\/|(?:watch|watch_popup)\?(?:[^#\s"'>]*&)?v=)([^#&?\s"'<>\\]{11})/gi;
      let m;
      while ((m = ytRegex.exec(searchSrc)) !== null) {
        const videoId = m[1];
        const isShorts = /shorts\//i.test(m[0]);
        found.push({
          type: isShorts ? 'youtube-shorts' : 'youtube',
          videoId,
          isShorts,
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          previewWebp: '',
          postThumbnail: post.thumbnail || '',
        });
      }

      // 2. TikTok
      const ttRegex = /(?:https?:\/\/)?(?:www\.|m\.|vm\.|vt\.)?tiktok\.com\/@?[\w.-]*\/video\/(\d+)/g;
      while ((m = ttRegex.exec(searchSrc)) !== null) {
        const fullMatched = m[0].startsWith('http') ? m[0] : ('https://' + m[0]);
        found.push({
          type: 'tiktok', videoId: m[1], isShorts: true,
          src: fullMatched,
          thumbnail: post.thumbnail || '',
          previewWebp: '',
          postThumbnail: post.thumbnail || '',
        });
      }

      // 3. Facebook Reel / Video / Watch / Share
      const fbRegex = /(?:https?:\/\/)?(?:www\.|m\.|web\.)?(?:facebook\.com\/(?:reel\/([a-zA-Z0-9_-]+)|watch\/?\?(?:[^#\s"'>]*&)?v=([a-zA-Z0-9_-]+)|(?:[\w.-]+\/videos\/([a-zA-Z0-9_-]+))|video\/([a-zA-Z0-9_-]+)|share\/r\/([a-zA-Z0-9_-]+))|fb\.watch\/([a-zA-Z0-9_-]+))/gi;
      while ((m = fbRegex.exec(searchSrc)) !== null) {
        const fullMatched = m[0].startsWith('http') ? m[0] : ('https://' + m[0]);
        const fbId = m[1] || m[2] || m[3] || m[4] || m[5] || m[6] || '';
        const isReel = /reel|share\/r/i.test(m[0]);
        let canonicalFbUrl = fullMatched;
        if (fbId && /^\d+$/.test(fbId)) {
          canonicalFbUrl = isReel ? `https://www.facebook.com/reel/${fbId}/` : `https://www.facebook.com/watch/?v=${fbId}`;
        }
        found.push({
          type: 'facebook',
          videoId: fbId,
          src: canonicalFbUrl,
          isShorts: isReel,
          thumbnail: post.thumbnail || '',
          previewWebp: '',
          postThumbnail: post.thumbnail || '',
        });
      }

      // 4. Direct MP4 / WebM
      const mp4Regex = /(https?:\/\/[^\s"'<>]+\.(?:mp4|webm))/gi;
      while ((m = mp4Regex.exec(searchSrc)) !== null) {
        found.push({
          type: 'mp4', videoId: '', src: m[1], isShorts: false,
          thumbnail: post.thumbnail || '',
          previewWebp: '',
          postThumbnail: post.thumbnail || '',
        });
      }
    }

    // 5. Audio / Voice / Podcast
    if (mediaFilter === 'all' || mediaFilter === 'audio') {
      const searchAudioSrc = String(content + ' ' + postUrl)
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      const audioRegex = /(https?:\/\/[^\s"'<>]+\.(?:mp3|m4a|ogg|wav))/gi;
      let m2;
      while ((m2 = audioRegex.exec(searchAudioSrc)) !== null) {
        found.push({
          type: 'audio', videoId: '', src: m2[1], isShorts: false,
          thumbnail: post.thumbnail || '',
          previewWebp: '',
          postThumbnail: post.thumbnail || '',
        });
      }
    }

    if (found.length === 0) return null;
    const chosen = (extract === 'random' && found.length > 1)
      ? found[Math.floor(Math.random() * found.length)]
      : found[0];

    const hotTag = (opts && opts.hotLabel ? opts.hotLabel : '@video-hot').toLowerCase();
    const isHot = (post.labels || []).some(l => {
      const lower = l.toLowerCase();
      return lower === hotTag || lower === '@video-hot' || lower === '@hotvideo';
    });

    return Object.assign({}, chosen, {
      title: post.title || '',
      url: post.url || '#',
      isHot,
      duration: '',
    });
  }

  /* ── Fisher-Yates Shuffle ── */
  function fisherYatesShuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ── HTML cho 1 Reel Card ── */
  function buildReelCard(item, itemIndex, totalCount) {
    const isAudio = item.type === 'audio';
    const isYouTube = item.type === 'youtube' || item.type === 'youtube-shorts';
    const isShorts = item.isShorts;
    const isHot = item.isHot;

    // Blurred background mode: dùng cho YouTube 16:9 (không phải Shorts)
    const useBlur = isYouTube && !isShorts;

    // Duration badge
    const durationIcon = isAudio ? '🎙️' : '🎬';
    const durationHtml = item.duration ? `<span class="sp-reel-duration">${durationIcon} ${escapeHtml(item.duration)}</span>` : '';

    // Hot badge
    const hotBadgeHtml = isHot ? `<span class="sp-reel-badge-hot">🔥 HOT</span>` : '';

    // Thumbnail
    const thumb = item.thumbnail || item.postThumbnail || '';

    // Audio mode: equalizer bars + spinning disc
    const equalizerHtml = isAudio ? `
      <div class="sp-reel-eq" aria-hidden="true">
        <span class="sp-reel-eq-bar"></span>
        <span class="sp-reel-eq-bar"></span>
        <span class="sp-reel-eq-bar"></span>
        <span class="sp-reel-eq-bar"></span>
        <span class="sp-reel-eq-bar"></span>
      </div>
      <div class="sp-reel-disc" aria-hidden="true">
        <span class="sp-reel-disc-inner">🎵</span>
      </div>
      <div class="sp-reel-marquee" aria-hidden="true">
        <span class="sp-reel-marquee-text">♫ Âm thanh bài viết · Audio Reel · ♪ ♫ Âm thanh bài viết · Audio Reel ·</span>
      </div>` : '';

    // Play button
    const playBtn = `
      <button class="sp-reel-play-btn" aria-label="Phát video" data-video-type="${escapeHtml(item.type)}" data-video-id="${escapeHtml(item.videoId || '')}" data-src="${escapeHtml(item.src || '')}" data-url="${escapeHtml(item.url)}">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
        <span class="sp-reel-play-pulse"></span>
      </button>`;

    // Fallback Poster cho bài viết chưa đính kèm ảnh bìa
    function buildPlatformFallbackPoster(pType) {
      if (pType === 'facebook') {
        return `
          <div class="sp-reel-thumb-poster sp-reel-thumb-poster--facebook">
            <div class="sp-reel-poster-icon">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </div>
            <span class="sp-reel-poster-label">Facebook Reel</span>
          </div>`;
      }
      if (pType === 'tiktok') {
        return `
          <div class="sp-reel-thumb-poster sp-reel-thumb-poster--tiktok">
            <div class="sp-reel-poster-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>
            </div>
            <span class="sp-reel-poster-label">TikTok</span>
          </div>`;
      }
      if (pType === 'audio') {
        return `
          <div class="sp-reel-thumb-poster sp-reel-thumb-poster--audio">
            <div class="sp-reel-poster-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            </div>
            <span class="sp-reel-poster-label">Audio Reel</span>
          </div>`;
      }
      if (pType === 'mp4') {
        return `
          <div class="sp-reel-thumb-poster sp-reel-thumb-poster--mp4">
            <div class="sp-reel-poster-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
            <span class="sp-reel-poster-label">Video Clip</span>
          </div>`;
      }
      return `
        <div class="sp-reel-thumb-poster sp-reel-thumb-poster--youtube">
          <div class="sp-reel-poster-icon">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </div>
          <span class="sp-reel-poster-label">YouTube</span>
        </div>`;
    }

    // Blurred background fill layout (16:9 YouTube)
    let mediaInner;
    if (thumb) {
      mediaInner = useBlur ? `
        <div class="sp-reel-blur-backdrop" style="--reel-thumb: url('${thumb}')"></div>
        <div class="sp-reel-media-center">
          <img class="sp-reel-thumb" src="${escapeHtml(thumb)}" alt="${escapeHtml(item.title)}" loading="lazy" data-preview-webp="${escapeHtml(item.previewWebp || '')}"/>
        </div>` : `
        <img class="sp-reel-thumb sp-reel-thumb--cover" src="${escapeHtml(thumb)}" alt="${escapeHtml(item.title)}" loading="lazy" data-preview-webp="${escapeHtml(item.previewWebp || '')}"/>`;
    } else {
      mediaInner = buildPlatformFallbackPoster(item.type);
    }

    return `
      <div class="sp-reel-card ${isHot ? 'sp-reel-card--hot' : ''} ${isAudio ? 'sp-reel-card--audio' : ''} ${useBlur ? 'sp-reel-card--blur' : 'sp-reel-card--cover'}" data-post-url="${escapeHtml(item.url)}" data-reel-index="${itemIndex !== undefined ? itemIndex : 0}">
        <div class="sp-reel-media">
          ${mediaInner}
          <div class="sp-reel-overlay">
            <div class="sp-reel-top-row">
              <div class="sp-reel-top-badges">
                ${hotBadgeHtml}
                ${durationHtml}
              </div>
              <span class="sp-reel-card-dots" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><circle cx="12" cy="5" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="19" r="2"></circle></svg>
              </span>
            </div>
            ${playBtn}
            ${equalizerHtml}
            <div class="sp-reel-bottom-info">
              <p class="sp-reel-title">${escapeHtml(item.title)}</p>
            </div>
          </div>
          <div class="sp-reel-player-slot" hidden></div>
        </div>
      </div>`;
  }

  /* ── renderReelsPattern (pure HTML, dùng trong buildWidgetShell nếu cần) ── */
  function renderReelsPattern(items, opts) {
    if (!items || items.length === 0) return '';
    const cards = items.map(buildReelCard).join('');
    const showNav = items.length > 1;
    return `
      <div class="sp-reels-container">
        ${showNav ? `<button class="sp-reels-btn sp-reels-btn-prev" aria-label="Trước"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg></button>` : ''}
        <div class="sp-reels-track">${cards}</div>
        ${showNav ? `<button class="sp-reels-btn sp-reels-btn-next" aria-label="Tiếp theo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg></button>` : ''}
      </div>`;
  }

  /* ── Fetch reels feed với cache 60 phút ── */
  async function fetchReelsFeed(label, fetchCount) {
    const cleanLabel = (label || '@video').trim();
    const cacheKey = CACHE_PREFIX + 'reels_' + encodeURIComponent(cleanLabel) + '_' + fetchCount;

    // Đọc cache với TTL 60 phút (chỉ lấy nếu data có ít nhất 1 bài hợp lệ)
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (raw) {
        const { data, ts } = JSON.parse(raw);
        if (Array.isArray(data) && data.length > 0 && Date.now() - ts <= getEffectiveCacheTtl()) {
          return data;
        }
        sessionStorage.removeItem(cacheKey);
      }
    } catch (_) {}

    try {
      const blogUrl = getBlogBaseUrl();
      let posts = [];

      // Blogger Atom Feed endpoint '/feeds/posts/default/-/{label}' không hỗ trợ ký tự '@' trong URL path (trả về rỗng).
      // Do đó, nếu label chứa ký tự '@', ta bỏ qua query category và chuyển thẳng sang fetch feed tổng để lọc client-side.
      const hasAtSymbol = cleanLabel.includes('@');

      if (!hasAtSymbol) {
        try {
          const catUrl = `${blogUrl}/feeds/posts/default/-/${encodeURIComponent(cleanLabel)}?alt=json&max-results=${fetchCount}&orderby=published`;
          const res = await fetch(catUrl);
          if (res.ok) {
            const json = await res.json();
            const entries = (json.feed && json.feed.entry) ? json.feed.entry : [];
            posts = parseFeedEntries(entries);
          }
        } catch (_) {}
      }

      // Fallback: Nếu query category không có bài hoặc nhãn có chứa '@'
      if (!posts || posts.length === 0) {
        const genUrl = `${blogUrl}/feeds/posts/default?alt=json&max-results=${Math.max(fetchCount, 50)}&orderby=published`;
        const res = await fetch(genUrl);
        if (res.ok) {
          const json = await res.json();
          const entries = (json.feed && json.feed.entry) ? json.feed.entry : [];
          const allPosts = parseFeedEntries(entries);

          // Tạo danh sách các biến thể nhãn chuẩn: @video, @video-hot, @hotvideo và nhãn do widget cấu hình
          const targetVariations = new Set(['@video', 'video', '@video-hot', 'video-hot', '@hotvideo', 'hotvideo']);
          const labelParts = cleanLabel.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
          labelParts.forEach(lp => {
            targetVariations.add(lp);
            targetVariations.add(lp.replace(/^@/, ''));
            targetVariations.add('@' + lp.replace(/^@/, ''));
          });

          // Lọc nghiêm ngặt: BẮT BUỘC bài viết phải có nhãn @video hoặc @video-hot
          let matched = allPosts.filter(p => {
            const pLabels = (p.labels || []).map(l => l.toLowerCase());
            return pLabels.some(l => targetVariations.has(l));
          });

          posts = matched;
        }
      }

      // Chỉ cache khi CÓ dữ liệu (không bao giờ cache mảng rỗng để bài viết mới hiển thị tức thì khi tải lại trang)
      if (posts && posts.length > 0) {
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({ data: posts, ts: Date.now() }));
        } catch (_) {}
      }

      return posts;
    } catch (_) {
      return [];
    }
  }

  /* ── renderReelsWidget — async orchestrator ── */
  async function renderReelsWidget(container, opts) {
    const { widgetTitle, limit, rawLabels, hotLabel, hotRatio, fetchCount, sort, extract, media, ctaText, mode, playMode } = opts;

    const isLocalDev = typeof window !== 'undefined' &&
      (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    let reelItems = [];

    if (isLocalDev) {
      // Chế độ preview/dev: dùng mock data
      reelItems = fisherYatesShuffle(MOCK_REELS_DATA).slice(0, limit);
    } else {
      // Production: fetch feed thật
      let posts = [];
      try {
        posts = await fetchReelsFeed(rawLabels, fetchCount);
      } catch (_) { posts = []; }

      if (!posts || posts.length === 0) {
        container.style.display = 'none';
        return;
      }

      // Bóc tách media từ từng bài, đảm bảo mỗi bài chỉ xuất hiện 1 lần
      const seen = new Set();
      const allMedia = [];
      for (const post of posts) {
        if (seen.has(post.url)) continue;
        seen.add(post.url);
        const m = extractPostMedia(post, { extract, media, hotLabel });
        if (m) allMedia.push(m);
      }

      if (allMedia.length === 0) {
        container.style.display = 'none';
        return;
      }

      // Phân loại Hot / Regular
      let poolHot = allMedia.filter(m => m.isHot);
      let poolReg = allMedia.filter(m => !m.isHot);

      // Fisher-Yates shuffle cả 2 pool
      if (sort === 'random') {
        poolHot = fisherYatesShuffle(poolHot);
        poolReg = fisherYatesShuffle(poolReg);
      }

      // Phân bổ tỷ lệ Hot:Reg theo hotRatio
      const hotCount = Math.min(Math.round(limit * hotRatio / 100), poolHot.length);
      const regCount = Math.min(limit - hotCount, poolReg.length);
      const selected = [
        ...poolHot.slice(0, hotCount),
        ...poolReg.slice(0, regCount),
      ];

      // Nếu thiếu (không đủ bài Hot hoặc Regular), bù vào
      const remaining = limit - selected.length;
      if (remaining > 0) {
        const usedUrls = new Set(selected.map(m => m.url));
        const extras = allMedia.filter(m => !usedUrls.has(m.url)).slice(0, remaining);
        selected.push(...extras);
      }

      reelItems = selected.slice(0, limit);
    }

    if (reelItems.length === 0) {
      container.style.display = 'none';
      return;
    }

    // Phát hiện ngữ cảnh hiển thị (mode)
    let displayMode = mode;
    const inSidebar = !!container.closest('.sidebar, aside, [class*="sidebar"], .sidebar-widget');
    if (inSidebar) {
      const parentWidget = container.closest('.sidebar-widget');
      if (parentWidget) parentWidget.classList.add('sidebar-widget--edge-to-edge');
    }
    if (mode === 'auto') {
      displayMode = inSidebar ? 'single' : 'slider';
    }
    const isSidebar = displayMode === 'single' || inSidebar;

    const resolvedPlayMode = playMode || container.dataset.playMode || 'modal';

    // Render HTML
    const showNav = reelItems.length > 1 && displayMode !== 'single';
    const singleInitialIndex = Math.floor(Math.random() * reelItems.length);
    const singleItem = displayMode === 'single' ? [reelItems[singleInitialIndex]] : reelItems;
    const cardsHtml = (displayMode === 'single' ? singleItem : reelItems).map((item, idx) => {
      const gIdx = displayMode === 'single' ? singleInitialIndex : idx;
      return buildReelCard(item, gIdx, reelItems.length);
    }).join('');

    const singleNavHtml = (displayMode === 'single' && reelItems.length > 1) ? `
      <button class="sp-reels-single-nav sp-reels-single-prev" type="button" aria-label="Video trước" title="Video trước">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>
      <button class="sp-reels-single-nav sp-reels-single-next" type="button" aria-label="Video tiếp theo" title="Video tiếp theo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>` : '';

    const bodyHtml = `
      <div class="sp-reels-container ${displayMode === 'single' ? 'sp-reels-container--single' : ''}">
        ${showNav ? `<button class="sp-reels-btn sp-reels-btn-prev" aria-label="Trước"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button>` : ''}
        ${singleNavHtml}
        <div class="sp-reels-track">${cardsHtml}</div>
        ${showNav ? `<button class="sp-reels-btn sp-reels-btn-next" aria-label="Tiếp theo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>` : ''}
      </div>`;

    const inTopWide = !!container.closest('#top-wide-section');
    const isSeamless = inTopWide || container.dataset.seamless === 'true';
    container.innerHTML = buildReelsWidgetShell(widgetTitle, bodyHtml, isSidebar, isSeamless);
    container.dataset.reelItems = JSON.stringify(reelItems);

    // Gắn sự kiện
    initReelsEvents(container, reelItems, displayMode, resolvedPlayMode);
  }

  /* ── Khởi tạo toàn bộ sự kiện interactive cho Reels widget ── */
  function initReelsEvents(container, reelItems, displayMode, playMode) {
    const track = container.querySelector('.sp-reels-track');
    if (!track) return;
    const modePlay = playMode || 'modal';

    // ── 1. Slider Prev/Next navigation ──
    const btnPrev = container.querySelector('.sp-reels-btn-prev');
    const btnNext = container.querySelector('.sp-reels-btn-next');

    function scrollBy(dir) {
      const cardWidth = track.querySelector('.sp-reel-card') ? track.querySelector('.sp-reel-card').offsetWidth + 16 : 220;
      track.scrollBy({ left: dir * cardWidth * 2, behavior: 'smooth' });
    }
    if (btnPrev) btnPrev.addEventListener('click', () => scrollBy(-1));
    if (btnNext) btnNext.addEventListener('click', () => scrollBy(1));

    // Ẩn nút khi không cần
    function checkNavVisibility() {
      if (!btnPrev && !btnNext) return;
      const needNav = track.scrollWidth > track.clientWidth + 4;
      if (btnPrev) btnPrev.style.display = needNav ? '' : 'none';
      if (btnNext) btnNext.style.display = needNav ? '' : 'none';
    }
    checkNavVisibility();
    window.addEventListener('resize', checkNavVisibility);

    // ── 2. Hover Preview (Desktop) ──
    track.querySelectorAll('.sp-reel-card').forEach(card => {
      const thumb = card.querySelector('.sp-reel-thumb');
      if (!thumb) return;
      const previewWebp = thumb.dataset.previewWebp;
      const origSrc = thumb.src;

      card.addEventListener('mouseenter', () => {
        card.classList.add('sp-reel-card--hovered');
        if (previewWebp && !previewWebp.includes('an_webp')) {
          thumb.src = previewWebp;
          card.classList.add('sp-reel-card--previewing');
        }
      });
      card.addEventListener('mouseleave', () => {
        card.classList.remove('sp-reel-card--hovered');
        if (previewWebp && !previewWebp.includes('an_webp')) {
          thumb.src = origSrc;
          card.classList.remove('sp-reel-card--previewing');
        }
      });
    });

    // ── 3. Smart In-View Preview (Mobile — IntersectionObserver) ──
    if ('IntersectionObserver' in window) {
      const cards = track.querySelectorAll('.sp-reel-card');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const thumb = entry.target.querySelector('.sp-reel-thumb');
          if (!thumb || !thumb.dataset.previewWebp) return;
          if (entry.intersectionRatio >= 0.7) {
            thumb.src = thumb.dataset.previewWebp;
            entry.target.classList.add('sp-reel-card--previewing');
          } else {
            thumb.src = thumb.dataset.previewWebp ? thumb.dataset.previewWebp.replace('mqdefault_6s.webp', 'hqdefault.jpg').replace('/an_webp/', '/vi/') : thumb.src;
            entry.target.classList.remove('sp-reel-card--previewing');
            const ytId = entry.target.querySelector('.sp-reel-play-btn') ? entry.target.querySelector('.sp-reel-play-btn').dataset.videoId : '';
            if (ytId) thumb.src = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
          }
        });
      }, { threshold: 0.7, root: track });
      cards.forEach(c => observer.observe(c));
    }

    // ── 4. Click-to-Play Facade / Modal Trigger ──
    const cards = track.querySelectorAll('.sp-reel-card');
    cards.forEach((card, idx) => {
      const itemIdx = parseInt(card.dataset.reelIndex, 10);
      const targetIdx = isNaN(itemIdx) ? idx : itemIdx;
      attachCardPlayTriggers(card, reelItems, targetIdx, modePlay);
    });

    // ── 5. Sidebar Single Mode: Prev/Next Buttons + Auto-advance (thay đổi sau 6s) ──
    if (displayMode === 'single' && reelItems.length > 1) {
      const initialCard = track.querySelector('.sp-reel-card');
      let currentSingleIdx = initialCard ? (parseInt(initialCard.dataset.reelIndex, 10) || 0) : 0;
      let singleTimer = null;
      let isHovered = false;
      let isTransitioning = false;

      function switchToIndex(newIdx, direction = 'next') {
        if (isTransitioning) return;
        isTransitioning = true;
        currentSingleIdx = (newIdx + reelItems.length) % reelItems.length;
        const newItem = reelItems[currentSingleIdx];
        const cardEl = track.querySelector('.sp-reel-card');
        if (!cardEl) {
          isTransitioning = false;
          return;
        }

        // Smooth transition effect
        cardEl.style.opacity = '0';
        cardEl.style.transform = direction === 'next' ? 'scale(0.97) translateX(-8px)' : 'scale(0.97) translateX(8px)';
        cardEl.style.transition = 'opacity 0.22s ease, transform 0.22s ease';

        setTimeout(() => {
          const newCardHtml = buildReelCard(newItem, currentSingleIdx, reelItems.length);
          const tmp = document.createElement('div');
          tmp.innerHTML = newCardHtml;
          const newCard = tmp.firstElementChild;
          newCard.style.opacity = '0';
          newCard.style.transform = direction === 'next' ? 'scale(1.02) translateX(8px)' : 'scale(1.02) translateX(-8px)';
          newCard.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

          track.replaceChild(newCard, cardEl);
          initReelCardEvents(newCard, reelItems, currentSingleIdx, modePlay);

          requestAnimationFrame(() => {
            newCard.style.opacity = '1';
            newCard.style.transform = 'scale(1) translateX(0)';
            setTimeout(() => {
              isTransitioning = false;
            }, 250);
          });
        }, 220);
      }

      function resetAutoTimer() {
        if (singleTimer) clearInterval(singleTimer);
        singleTimer = setInterval(() => {
          const modal = document.getElementById('sp-reels-modal');
          const isModalOpen = modal && modal.classList.contains('sp-reels-modal--open');
          const isInlinePlaying = container.querySelector('.sp-reel-card--playing');
          if (!isHovered && !isModalOpen && !isInlinePlaying) {
            switchToIndex(currentSingleIdx + 1, 'next');
          }
        }, 6000);
      }

      const btnSinglePrev = container.querySelector('.sp-reels-single-prev');
      const btnSingleNext = container.querySelector('.sp-reels-single-next');

      if (btnSinglePrev) {
        btnSinglePrev.addEventListener('click', (e) => {
          e.stopPropagation();
          switchToIndex(currentSingleIdx - 1, 'prev');
          resetAutoTimer();
        });
      }
      if (btnSingleNext) {
        btnSingleNext.addEventListener('click', (e) => {
          e.stopPropagation();
          switchToIndex(currentSingleIdx + 1, 'next');
          resetAutoTimer();
        });
      }

      container.addEventListener('mouseenter', () => { isHovered = true; });
      container.addEventListener('mouseleave', () => { isHovered = false; });

      resetAutoTimer();
    }
  }

  /* ── Quản lý Reels Theater Lightbox Modal (Singleton) ── */
  let activeModalPlaylist = [];
  let activeModalIndex = 0;
  let reelsModalEl = null;

  function ensureReelsModal() {
    if (reelsModalEl) return reelsModalEl;
    let modal = document.getElementById('sp-reels-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'sp-reels-modal';
      modal.className = 'sp-reels-modal';
      modal.setAttribute('aria-hidden', 'true');
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Reels Video Theater');
      modal.innerHTML = `
        <div class="sp-reels-modal-backdrop"></div>
        <div class="sp-reels-modal-dialog">
          <div class="sp-reels-modal-header">
            <div class="sp-reels-modal-badge">
              <span class="sp-reels-modal-icon">🎬</span>
              <span class="sp-reels-modal-counter">1 / 1</span>
            </div>
            <button class="sp-reels-modal-close" aria-label="Đóng (Esc)" title="Đóng (Esc)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <button class="sp-reels-modal-nav sp-reels-modal-nav--prev" aria-label="Clip trước (Phím mũi tên lên / trái)" title="Clip trước (↑)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button class="sp-reels-modal-nav sp-reels-modal-nav--next" aria-label="Clip tiếp theo (Phím mũi tên xuống / phải)" title="Clip tiếp theo (↓)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>

          <div class="sp-reels-modal-stage">
            <div class="sp-reels-modal-player-slot"></div>
            <div class="sp-reels-modal-overlay">
              <div class="sp-reels-modal-info">
                <p class="sp-reels-modal-title"></p>
                <a class="sp-reels-modal-cta" href="#" target="_blank" rel="noopener">
                  <span>Đọc bài viết đầy đủ</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      const closeBtn = modal.querySelector('.sp-reels-modal-close');
      const backdrop = modal.querySelector('.sp-reels-modal-backdrop');
      const btnPrev = modal.querySelector('.sp-reels-modal-nav--prev');
      const btnNext = modal.querySelector('.sp-reels-modal-nav--next');

      closeBtn.addEventListener('click', closeReelsModal);
      backdrop.addEventListener('click', closeReelsModal);

      btnPrev.addEventListener('click', (e) => { e.stopPropagation(); changeModalReel(-1); });
      btnNext.addEventListener('click', (e) => { e.stopPropagation(); changeModalReel(1); });

      document.addEventListener('keydown', function(e) {
        if (!modal.classList.contains('sp-reels-modal--open')) return;
        if (e.key === 'Escape') {
          closeReelsModal();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          changeModalReel(-1);
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          changeModalReel(1);
        }
      });

      // Touch swipe gestures on mobile
      const stage = modal.querySelector('.sp-reels-modal-stage');
      let touchStartY = 0;
      let touchStartX = 0;
      stage.addEventListener('touchstart', function(e) {
        if (e.touches && e.touches[0]) {
          touchStartY = e.touches[0].clientY;
          touchStartX = e.touches[0].clientX;
        }
      }, { passive: true });
      stage.addEventListener('touchend', function(e) {
        if (!e.changedTouches || !e.changedTouches[0]) return;
        const diffY = e.changedTouches[0].clientY - touchStartY;
        const diffX = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(diffY) > 40 && Math.abs(diffY) > Math.abs(diffX)) {
          if (diffY < 0) {
            changeModalReel(1); // Vuốt lên -> clip sau
          } else {
            changeModalReel(-1); // Vuốt xuống -> clip trước
          }
        }
      }, { passive: true });
    }
    reelsModalEl = modal;
    return modal;
  }

  function openReelsModal(playlist, startIndex) {
    if (!playlist || playlist.length === 0) return;
    activeModalPlaylist = playlist;
    activeModalIndex = (startIndex >= 0 && startIndex < playlist.length) ? startIndex : 0;

    // Dừng tất cả các thẻ đang phát inline trong widget để tránh 2 âm thanh đè nhau
    document.querySelectorAll('.sp-reel-card--playing').forEach(c => {
      c.classList.remove('sp-reel-card--playing');
      const s = c.querySelector('.sp-reel-player-slot');
      if (s) {
        s.querySelectorAll('video, audio').forEach(m => { try { m.pause(); m.src = ''; } catch(e){} });
        s.innerHTML = '';
        s.hidden = true;
        s.style.display = 'none';
      }
    });

    const modal = ensureReelsModal();
    modal.classList.add('sp-reels-modal--open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    renderModalCurrentReel();
  }

  function closeReelsModal() {
    if (!reelsModalEl) return;
    reelsModalEl.classList.remove('sp-reels-modal--open');
    reelsModalEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    const slot = reelsModalEl.querySelector('.sp-reels-modal-player-slot');
    if (slot) {
      slot.querySelectorAll('video, audio').forEach(m => { try { m.pause(); m.src = ''; } catch(e){} });
      slot.innerHTML = '';
    }
  }

  function changeModalReel(dir) {
    if (!activeModalPlaylist || activeModalPlaylist.length <= 1) return;
    activeModalIndex = (activeModalIndex + dir + activeModalPlaylist.length) % activeModalPlaylist.length;
    renderModalCurrentReel();
  }

  function renderModalCurrentReel() {
    if (!reelsModalEl) return;
    const item = activeModalPlaylist[activeModalIndex];
    if (!item) return;

    // Counter
    const counter = reelsModalEl.querySelector('.sp-reels-modal-counter');
    if (counter) counter.textContent = `${activeModalIndex + 1} / ${activeModalPlaylist.length}`;

    // Title & CTA
    const titleEl = reelsModalEl.querySelector('.sp-reels-modal-title');
    if (titleEl) titleEl.textContent = item.title || '';

    const ctaEl = reelsModalEl.querySelector('.sp-reels-modal-cta');
    if (ctaEl) {
      ctaEl.href = item.url || '#';
    }

    // Player slot
    const slot = reelsModalEl.querySelector('.sp-reels-modal-player-slot');
    if (!slot) return;

    // Dọn sạch video/audio cũ trước khi nạp clip mới (tránh ghost audio)
    slot.querySelectorAll('video, audio').forEach(m => { try { m.pause(); m.src = ''; m.load(); } catch(e) {} });
    slot.innerHTML = '';

    let mediaHtml = '';
    const vType = item.type;
    const vId = item.videoId;
    const vSrc = item.src;

    if (vType === 'youtube' || vType === 'youtube-shorts') {
      mediaHtml = `<iframe class="sp-reels-modal-iframe" src="https://www.youtube.com/embed/${encodeURIComponent(vId)}?autoplay=1&playsinline=1&rel=0&enablejsapi=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="true" frameborder="0" title="Reels Video Player"></iframe>`;
    } else if (vType === 'mp4') {
      mediaHtml = `<video class="sp-reels-modal-video" src="${escapeHtml(vSrc)}" controls autoplay playsinline style="width:100%;height:100%;object-fit:cover;"></video>`;
    } else if (vType === 'audio') {
      mediaHtml = `
        <div class="sp-reels-modal-audio-view">
          <div class="sp-reels-modal-disc">🎵</div>
          <div class="sp-reels-modal-audio-name">${escapeHtml(item.title)}</div>
          <audio class="sp-reels-modal-audio" src="${escapeHtml(vSrc)}" controls autoplay></audio>
        </div>`;
    } else if (vType === 'tiktok') {
      const ttDirectUrl = vSrc || `https://www.tiktok.com/@/video/${vId}`;
      mediaHtml = `
        <div class="sp-reels-tiktok-wrap" style="position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#000;">
          <iframe class="sp-reels-modal-iframe" src="https://www.tiktok.com/player/v1/${encodeURIComponent(vId)}?autoplay=1&controls=1&music_info=1&description=1" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen="true" scrolling="no" frameborder="0" title="TikTok player"></iframe>
          <div class="sp-reels-tt-controls" style="position:absolute;top:12px;left:12px;z-index:30;display:flex;align-items:center;gap:8px;">
            <button class="sp-tiktok-sound-btn" data-muted="true" aria-label="Bật/Tắt âm thanh TikTok" title="Bật/Tắt âm thanh" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:rgba(254,44,85,0.95);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:#fff;border-radius:20px;font-size:0.75rem;font-weight:700;border:1px solid rgba(255,255,255,0.25);cursor:pointer;box-shadow:0 4px 14px rgba(254,44,85,0.45);transition:all 0.2s;">
              <span class="sp-tiktok-sound-icon" style="font-size:0.95rem;">🔇</span>
              <span class="sp-tiktok-sound-text">Bật tiếng</span>
            </button>
            <a href="${escapeHtml(ttDirectUrl)}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:5px;padding:6px 12px;background:rgba(0,0,0,0.65);backdrop-filter:blur(6px);color:#fff;border-radius:20px;font-size:0.75rem;font-weight:600;text-decoration:none;border:1px solid rgba(255,255,255,0.2);">
              <span>Mở TikTok ↗</span>
            </a>
          </div>
        </div>`;
    } else if (vType === 'facebook') {
      const fbTargetUrl = vSrc || (item && item.isShorts ? `https://www.facebook.com/reel/${vId}/` : `https://www.facebook.com/watch/?v=${vId}`);
      const isShortRedirect = /share\/[rv]|fb\.watch/i.test(fbTargetUrl) || !/\d{8,}/.test(fbTargetUrl);

      if (isShortRedirect) {
        // Link chia sẻ rút gọn từ app điện thoại (Facebook chặn giải mã redirect trong iframe)
        mediaHtml = `
          <div class="sp-reels-facebook-wrap" style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem 1.5rem;text-align:center;background:radial-gradient(circle at center, #1c2738 0%, #0d1117 100%);color:#fff;box-sizing:border-box;">
            <div style="width:72px;height:72px;border-radius:50%;background:#1877f2;display:flex;align-items:center;justify-content:center;margin-bottom:1.25rem;box-shadow:0 8px 28px rgba(24,119,242,0.45);">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </div>
            <h3 style="font-size:1.2rem;font-weight:700;margin:0 0 0.5rem;color:#fff;">Facebook Reel</h3>
            <p style="font-size:0.85rem;color:rgba(255,255,255,0.8);max-width:320px;line-height:1.55;margin:0 0 1.5rem;">
              Đây là link chia sẻ rút gọn từ ứng dụng điện thoại (<code>/share/r/</code>). Facebook yêu cầu mở trực tiếp để xem:
            </p>
            <a href="${escapeHtml(fbTargetUrl)}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;padding:0.75rem 1.75rem;background:#1877f2;color:#fff;border-radius:30px;font-size:0.92rem;font-weight:700;text-decoration:none;box-shadow:0 6px 20px rgba(24,119,242,0.5);transition:transform 0.2s;">
              <span>Mở xem trên Facebook</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
            <span style="font-size:0.72rem;color:rgba(255,255,255,0.45);margin-top:1.25rem;">Mẹo: Dùng link gốc có ID số trên máy tính để nhúng phát trực tiếp.</span>
          </div>`;
      } else {
        const fbHref = encodeURIComponent(fbTargetUrl);
        const slotW = slot.clientWidth || 380;
        const fbW = Math.min(Math.max(slotW, 280), 450);
        const fbH = Math.round(fbW * 16 / 9);

        mediaHtml = `
          <div class="sp-reels-facebook-wrap" style="position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#000;">
            <iframe class="sp-reels-modal-iframe" src="https://www.facebook.com/plugins/video.php?href=${fbHref}&show_text=false&autoplay=true&mute=0&width=${fbW}&height=${fbH}" width="${fbW}" height="${fbH}" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen" allowfullscreen="true" scrolling="no" frameborder="0" title="Facebook Reel player" style="width:100%;height:100%;border:none;"></iframe>
            <div class="sp-reels-fb-direct-link" style="position:absolute;top:12px;left:12px;z-index:30;display:flex;align-items:center;gap:8px;">
              <a href="${escapeHtml(fbTargetUrl)}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:rgba(24,119,242,0.92);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:#fff;border-radius:20px;font-size:0.75rem;font-weight:600;text-decoration:none;box-shadow:0 4px 12px rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.2);transition:all 0.2s;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span>Xem trên Facebook ↗</span>
              </a>
            </div>
          </div>`;
      }
    }

    slot.innerHTML = mediaHtml;

    // Gắn sự kiện điều khiển âm thanh TikTok qua postMessage
    const ttSoundBtn = slot.querySelector('.sp-tiktok-sound-btn');
    if (ttSoundBtn) {
      const ttIframe = slot.querySelector('iframe.sp-reels-modal-iframe');
      if (ttIframe) {
        ttIframe.addEventListener('load', () => {
          setTimeout(() => { sendTikTokAudioCmd(ttIframe, true); }, 500);
        });
        ttSoundBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isCurrentlyMuted = ttSoundBtn.dataset.muted !== 'false';
          sendTikTokAudioCmd(ttIframe, isCurrentlyMuted);
          ttSoundBtn.dataset.muted = isCurrentlyMuted ? 'false' : 'true';
          const icon = ttSoundBtn.querySelector('.sp-tiktok-sound-icon');
          const txt = ttSoundBtn.querySelector('.sp-tiktok-sound-text');
          if (icon) icon.textContent = isCurrentlyMuted ? '🔊' : '🔇';
          if (txt) txt.textContent = isCurrentlyMuted ? 'Tắt tiếng' : 'Bật tiếng';
          ttSoundBtn.style.background = isCurrentlyMuted ? 'rgba(34, 197, 94, 0.95)' : 'rgba(254, 44, 85, 0.95)';
          ttSoundBtn.style.boxShadow = isCurrentlyMuted ? '0 4px 14px rgba(34, 197, 94, 0.45)' : '0 4px 14px rgba(254, 44, 85, 0.45)';
        });
      }
    }

    // Tự làm mờ gợi ý âm thanh Facebook sau 4 giây
    setTimeout(() => {
      const tip = slot.querySelector('.sp-reels-fb-sound-tip');
      if (tip) {
        tip.style.opacity = '0';
      }
    }, 4000);
  }

  /* ── Helper: Gửi lệnh điều khiển âm thanh tới TikTok Player iframe ── */
  function sendTikTokAudioCmd(iframe, unmute) {
    if (!iframe || !iframe.contentWindow) return;
    const msg = {
      'x-tiktok-player': true,
      'type': unmute ? 'unMute' : 'mute',
      'value': null
    };
    iframe.contentWindow.postMessage(msg, '*');
    try {
      iframe.contentWindow.postMessage(JSON.stringify(msg), '*');
    } catch (e) {}
  }

  // Lắng nghe sự kiện trạng thái âm thanh từ TikTok Player
  if (!window._spTikTokMessageBound) {
    window._spTikTokMessageBound = true;
    window.addEventListener('message', function(event) {
      let data = event.data;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch(e) {}
      }
      if (data && data['x-tiktok-player']) {
        if (data.type === 'onMute') {
          const isMuted = !!data.value;
          document.querySelectorAll('.sp-tiktok-sound-btn').forEach(btn => {
            btn.dataset.muted = isMuted ? 'true' : 'false';
            const icon = btn.querySelector('.sp-tiktok-sound-icon');
            const txt = btn.querySelector('.sp-tiktok-sound-text');
            if (icon) icon.textContent = isMuted ? '🔇' : '🔊';
            if (txt) txt.textContent = isMuted ? 'Bật tiếng' : 'Tắt tiếng';
            btn.style.background = isMuted ? 'rgba(254, 44, 85, 0.95)' : 'rgba(34, 197, 94, 0.95)';
          });
        }
      }
    });
  }

  /* ── Phát Video/Audio trong card (Click-to-Play Facade — chế độ inline) ── */
  function playReelCard(card) {
    if (!card || card.classList.contains('sp-reel-card--playing')) return;

    // Dừng tất cả các thẻ khác đang phát để tránh xung đột âm thanh
    document.querySelectorAll('.sp-reel-card--playing').forEach(otherCard => {
      if (otherCard !== card) {
        otherCard.classList.remove('sp-reel-card--playing');
        const otherSlot = otherCard.querySelector('.sp-reel-player-slot');
        if (otherSlot) {
          otherSlot.querySelectorAll('video, audio').forEach(m => {
            try { m.pause(); m.src = ''; m.load(); } catch(e) {}
          });
          otherSlot.innerHTML = '';
          otherSlot.hidden = true;
          otherSlot.style.display = 'none';
        }
      }
    });

    const btn = card.querySelector('.sp-reel-play-btn');
    const playerSlot = card.querySelector('.sp-reel-player-slot');
    if (!playerSlot || !btn) return;

    const vType = btn.dataset.videoType;
    const vId = btn.dataset.videoId;
    const vSrc = btn.dataset.src;

    let playerHtml = '';
    if (vType === 'youtube' || vType === 'youtube-shorts') {
      playerHtml = `<iframe class="sp-reel-iframe" src="https://www.youtube.com/embed/${encodeURIComponent(vId)}?autoplay=1&playsinline=1&rel=0&enablejsapi=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="true" frameborder="0" title="Video player"></iframe>`;
    } else if (vType === 'mp4') {
      playerHtml = `<video class="sp-reel-iframe" src="${escapeHtml(vSrc)}" controls autoplay playsinline style="width:100%;height:100%;object-fit:cover;"></video>`;
    } else if (vType === 'audio') {
      playerHtml = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:1.5rem;text-align:center;background:#111;"><div style="font-size:3rem;margin-bottom:1rem;animation:sp-spin-disc 4s linear infinite;">💿</div><div style="color:#fff;font-size:0.85rem;font-weight:600;margin-bottom:1.25rem;">${escapeHtml(card.querySelector('.sp-reel-title') ? card.querySelector('.sp-reel-title').textContent : 'Đang phát Podcast')}</div><audio class="sp-reel-audio-player" src="${escapeHtml(vSrc)}" controls autoplay style="width:100%;"></audio></div>`;
    } else if (vType === 'tiktok') {
      const ttDirectUrl = vSrc || `https://www.tiktok.com/@/video/${vId}`;
      playerHtml = `
        <div style="position:relative;width:100%;height:100%;background:#000;">
          <iframe class="sp-reel-iframe" src="https://www.tiktok.com/player/v1/${encodeURIComponent(vId)}?autoplay=1&controls=1&music_info=1&description=1" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen="true" scrolling="no" frameborder="0" title="TikTok player"></iframe>
          <div style="position:absolute;top:8px;left:8px;z-index:25;display:flex;align-items:center;gap:4px;">
            <button class="sp-tiktok-sound-btn" data-muted="true" aria-label="Bật/Tắt âm thanh" style="display:inline-flex;align-items:center;gap:4px;padding:4px 9px;background:rgba(254,44,85,0.95);color:#fff;border-radius:14px;font-size:0.68rem;font-weight:700;border:none;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.4);">
              <span class="sp-tiktok-sound-icon">🔇</span>
              <span class="sp-tiktok-sound-text">Bật tiếng</span>
            </button>
            <a href="${escapeHtml(ttDirectUrl)}" target="_blank" rel="noopener" style="padding:4px 8px;background:rgba(0,0,0,0.65);color:#fff;border-radius:14px;font-size:0.68rem;font-weight:600;text-decoration:none;">
              <span>TikTok ↗</span>
            </a>
          </div>
        </div>`;
    } else if (vType === 'facebook') {
      const fbTargetUrl = vSrc || (vId ? `https://www.facebook.com/reel/${vId}/` : '');
      const isShortRedirect = /share\/[rv]|fb\.watch/i.test(fbTargetUrl) || !/\d{8,}/.test(fbTargetUrl);

      if (isShortRedirect) {
        playerHtml = `
          <div style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1.5rem;text-align:center;background:#111;color:#fff;box-sizing:border-box;">
            <div style="width:48px;height:48px;border-radius:50%;background:#1877f2;display:flex;align-items:center;justify-content:center;margin-bottom:0.75rem;">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </div>
            <div style="font-size:0.85rem;font-weight:700;margin-bottom:0.4rem;">Facebook Reel</div>
            <p style="font-size:0.75rem;color:rgba(255,255,255,0.7);margin:0 0 1rem;line-height:1.4;">Link rút gọn từ điện thoại cần mở trực tiếp trên Facebook.</p>
            <a href="${escapeHtml(fbTargetUrl)}" target="_blank" rel="noopener" style="padding:6px 14px;background:#1877f2;color:#fff;border-radius:20px;font-size:0.8rem;font-weight:700;text-decoration:none;">
              Mở trên Facebook ↗
            </a>
          </div>`;
      } else {
        const fbHref = encodeURIComponent(fbTargetUrl);
        const cardW = card.clientWidth || 175;
        const fbW = Math.min(Math.max(cardW, 175), 450);
        const fbH = Math.round(fbW * 16 / 9);

        playerHtml = `
          <div style="position:relative;width:100%;height:100%;background:#000;">
            <iframe class="sp-reel-iframe" src="https://www.facebook.com/plugins/video.php?href=${fbHref}&show_text=false&autoplay=true&mute=0&width=${fbW}&height=${fbH}" width="${fbW}" height="${fbH}" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen" allowfullscreen="true" scrolling="no" frameborder="0" title="Facebook Reel player" style="width:100%;height:100%;border:none;"></iframe>
            <a href="${escapeHtml(fbTargetUrl)}" target="_blank" rel="noopener" style="position:absolute;top:8px;left:8px;z-index:20;display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:rgba(24,119,242,0.92);color:#fff;border-radius:14px;font-size:0.7rem;font-weight:600;text-decoration:none;">
              <span>Mở FB ↗</span>
            </a>
          </div>`;
      }
    }

    if (!playerHtml) return;

    card.classList.add('sp-reel-card--playing');
    playerSlot.innerHTML = playerHtml + `<button class="sp-reel-close-btn" aria-label="Đóng" title="Đóng video">✕</button>`;
    playerSlot.hidden = false;
    playerSlot.style.display = 'flex';

    // Kích hoạt phát video/audio HTML5 an toàn (nếu unmuted bị chặn thì tự động mute để không bị đơ)
    const nativeCardVideo = playerSlot.querySelector('video.sp-reel-iframe');
    if (nativeCardVideo) {
      const p = nativeCardVideo.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          nativeCardVideo.muted = true;
          nativeCardVideo.play();
        });
      }
    }
    const nativeCardAudio = playerSlot.querySelector('audio.sp-reel-audio-player');
    if (nativeCardAudio) {
      const p2 = nativeCardAudio.play();
      if (p2 && typeof p2.catch === 'function') {
        p2.catch(() => {});
      }
    }

    // Gắn sự kiện âm thanh TikTok cho inline card
    const cardTtBtn = playerSlot.querySelector('.sp-tiktok-sound-btn');
    if (cardTtBtn) {
      const cardTtIframe = playerSlot.querySelector('iframe.sp-reel-iframe');
      if (cardTtIframe) {
        cardTtIframe.addEventListener('load', () => {
          setTimeout(() => { sendTikTokAudioCmd(cardTtIframe, true); }, 500);
        });
        cardTtBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isCurrentlyMuted = cardTtBtn.dataset.muted !== 'false';
          sendTikTokAudioCmd(cardTtIframe, isCurrentlyMuted);
          cardTtBtn.dataset.muted = isCurrentlyMuted ? 'false' : 'true';
          const icon = cardTtBtn.querySelector('.sp-tiktok-sound-icon');
          const txt = cardTtBtn.querySelector('.sp-tiktok-sound-text');
          if (icon) icon.textContent = isCurrentlyMuted ? '🔊' : '🔇';
          if (txt) txt.textContent = isCurrentlyMuted ? 'Tắt tiếng' : 'Bật tiếng';
          cardTtBtn.style.background = isCurrentlyMuted ? 'rgba(34, 197, 94, 0.95)' : 'rgba(254, 44, 85, 0.95)';
        });
      }
    }

    const closeBtn = playerSlot.querySelector('.sp-reel-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function(e2) {
        e2.stopPropagation();
        card.classList.remove('sp-reel-card--playing');
        playerSlot.innerHTML = '';
        playerSlot.hidden = true;
        playerSlot.style.display = 'none';
      });
    }
  }

  /* ── Gắn trigger phát video cho card (hỗ trợ cả modal lẫn inline) ── */
  function attachCardPlayTriggers(card, playlist, itemIndex, playMode) {
    function handlePlayTrigger(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (playMode === 'inline') {
        playReelCard(card);
      } else {
        openReelsModal(playlist, itemIndex);
      }
    }

    const btn = card.querySelector('.sp-reel-play-btn');
    if (btn) {
      btn.addEventListener('click', handlePlayTrigger);
    }
    const media = card.querySelector('.sp-reel-media');
    if (media) {
      media.style.cursor = 'pointer';
      media.addEventListener('click', function(e) {
        if (e.target.closest('.sp-reel-close-btn')) return;
        handlePlayTrigger(e);
      });
    }
    const title = card.querySelector('.sp-reel-title');
    if (title) {
      title.style.cursor = 'pointer';
      title.addEventListener('click', handlePlayTrigger);
    }
  }

  /* ── Gắn events cho 1 card đơn lẻ (dùng khi rebuild card sau shuffle) ── */
  function initReelCardEvents(card, playlist, itemIndex, playMode) {
    const thumb = card.querySelector('.sp-reel-thumb');
    if (thumb) {
      const previewWebp = thumb.dataset.previewWebp;
      const origSrc = thumb.src;
      card.addEventListener('mouseenter', () => { if (previewWebp) { thumb.src = previewWebp; } });
      card.addEventListener('mouseleave', () => { if (previewWebp) { thumb.src = origSrc; } });
    }
    attachCardPlayTriggers(card, playlist, itemIndex, playMode);
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

      const rawContent = (entry.content && entry.content.$t) ? entry.content.$t : ((entry.summary && entry.summary.$t) ? entry.summary.$t : '');

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
      if (Date.now() - ts > getEffectiveCacheTtl()) {
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
