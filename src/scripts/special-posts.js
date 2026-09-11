/**
 * Blogger Special Posts Widget Engine v2.1
 * Multi-label Support & Pluggable Pattern Strategy
 * Spec: FEAT-FLEXIBLE-SPECIAL-POSTS-WIDGET-V2
 *
 * Features:
 *  - Multi-label fetch (parallel) với deduplication
 *  - SessionStorage cache 5 phút
 *  - 4 renderers: ranked, spotlight, quote, digest
 *  - Skeleton shimmer (CLS = 0)
 *  - Anchor scroll highlight pulse
 *  - Label sanitization (lọc @ # _ ~)
 *  - Fallback: views → latest nếu API lỗi
 */
(function () {
  'use strict';

  /* ─── Constants ─────────────────────────────────────────────── */
  const CACHE_PREFIX = 'editorial_sp_';
  const CACHE_TTL    = 5 * 60 * 1000; // 5 phút

  /* ─── Pattern → Renderer map (Pluggable Strategy) ───────────── */
  const PATTERN_RENDERERS = {
    ranked:    renderRankedPattern,
    spotlight: renderSpotlightPattern,
    quote:     renderQuotePattern,
    digest:    renderDigestPattern,
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
    const widgets = document.querySelectorAll('.special-posts-widget');
    widgets.forEach(renderWidgetInstance);
  }

  /* ═══════════════════════════════════════════════════════════════
     RENDER WIDGET INSTANCE
     ═══════════════════════════════════════════════════════════════ */
  async function renderWidgetInstance(container) {
    // Nếu widget đã có markup tĩnh (static preview demo) và không có cấu hình fetch
    if (!container.dataset.labels && !container.dataset.posts && !container.dataset.sort && container.querySelector('.sp-widget-card')) {
      return;
    }

    const pattern        = container.dataset.pattern  || 'digest';
    const rawLabels      = (container.dataset.labels  || container.dataset.label || '').trim();
    const limit          = Math.min(parseInt(container.dataset.limit, 10) || 4, 10);
    const sort           = container.dataset.sort     || 'latest';
    const handpickedRaw  = container.dataset.posts    || '';
    const showThumb      = container.dataset.showThumbnail !== 'false';
    const showSnippet    = container.dataset.showSnippet   !== 'false';
    const viewAllText    = container.dataset.viewAllText   || 'Xem tất cả »';
    const widgetTitle    = container.dataset.title         || '';

    // Thêm class pattern cho container queries
    container.classList.add('pattern-' + pattern);

    // Skeleton loading trước — CLS = 0
    renderSkeleton(container, pattern, limit, widgetTitle, viewAllText, rawLabels);

    try {
      let posts = [];

      if (handpickedRaw.trim()) {
        // Chế độ Handpicked URLs
        posts = await fetchHandpickedPosts(handpickedRaw);
      } else if (sort === 'views' || sort === 'popular') {
        // Chế độ Popular Posts (số lượt xem)
        const timeRange = container.dataset.timeRange || 'all_time';
        try {
          posts = await fetchPopularPosts(limit, timeRange, rawLabels);
        } catch (e) {
          // Fallback về latest nếu API Popular Posts không khả dụng
          console.warn('[SpecialPostsWidget] Popular Posts API không khả dụng, fallback → latest', e);
          if (rawLabels) {
            const labelList = splitLabels(rawLabels);
            posts = await fetchMultiLabelPosts(labelList, limit, 'latest');
          }
        }
      } else if (rawLabels) {
        // Chế độ Multi-label
        const labelList = splitLabels(rawLabels);
        posts = await fetchMultiLabelPosts(labelList, limit, sort);
      }

      if ((!posts || posts.length === 0) && typeof window !== 'undefined' && window.__SPECIAL_POSTS_MOCK__) {
        var mockAll = window.__SPECIAL_POSTS_MOCK__;
        if (rawLabels) {
          var lList = splitLabels(rawLabels).map(function(l) { return l.toLowerCase().replace(/^[@#_~]+/, ''); });
          posts = mockAll.filter(function(p) {
            var pLabels = (p.labels || []).map(function(l) { return l.toLowerCase().replace(/^[@#_~]+/, ''); });
            return lList.some(function(req) { return pLabels.indexOf(req) !== -1; });
          });
        }
        if (!posts || posts.length === 0) {
          posts = mockAll;
        }
        posts = posts.slice(0, limit);
      }

      if (!posts || posts.length === 0) {
        renderEmptyState(container, widgetTitle, viewAllText, rawLabels);
        return;
      }

      // Gọi Pattern Renderer
      const renderer = PATTERN_RENDERERS[pattern] || PATTERN_RENDERERS.digest;
      container.innerHTML = buildWidgetShell(
        widgetTitle,
        viewAllText,
        rawLabels,
        pattern,
        renderer(posts, { showThumb, showSnippet, limit })
      );

    } catch (err) {
      if (typeof window !== 'undefined' && window.__SPECIAL_POSTS_MOCK__) {
        var mockAll = window.__SPECIAL_POSTS_MOCK__;
        var posts = mockAll.slice(0, limit);
        var renderer = PATTERN_RENDERERS[pattern] || PATTERN_RENDERERS.digest;
        container.innerHTML = buildWidgetShell(
          widgetTitle,
          viewAllText,
          rawLabels,
          pattern,
          renderer(posts, { showThumb, showSnippet, limit })
        );
        return;
      }
      console.warn('[SpecialPostsWidget] Lỗi nạp dữ liệu:', err);
      container.innerHTML = buildWidgetShell(
        widgetTitle,
        viewAllText,
        rawLabels,
        pattern,
        '<div class="sp-error">Không thể tải nội dung mục này.</div>'
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

  /* ═══════════════════════════════════════════════════════════════
     WIDGET SHELL — Header + Body
     ═══════════════════════════════════════════════════════════════ */
  function buildWidgetShell(title, viewAllText, rawLabels, pattern, bodyHtml) {
    const cleanTitle = title ? escapeHtml(title) : '';
    const viewAllUrl = rawLabels
      ? buildLabelUrl(splitLabels(rawLabels)[0])
      : '/';

    const headerHtml = cleanTitle ? `
      <div class="sp-widget-header">
        <h3 class="sp-widget-title">${cleanTitle}</h3>
        <a href="${escapeHtml(viewAllUrl)}" class="sp-view-all-link">${escapeHtml(viewAllText)}</a>
      </div>` : '';

    return `
      <div class="sp-widget-card pattern-${escapeHtml(pattern)}">
        ${headerHtml}
        <div class="sp-widget-body">
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
      const aiType  = extractAIType(post.labels || []);
      const aiHtml  = aiType ? (' • ' + renderAIInlineBadge(aiType)) : '';

      return `
        <a href="${escapeHtml(post.url)}" class="sp-ranked-item"${aiType ? ` data-ai-type="${aiType}"` : ''}>
          <span class="sp-rank-number">${rankNum}</span>
          ${thumb ? `<div class="sp-ranked-thumb"><img src="${escapeHtml(thumb)}" alt="${escapeHtml(post.title)}" loading="lazy" width="52" height="52"/></div>` : ''}
          <div class="sp-ranked-content">
            <h4 class="sp-ranked-title">${escapeHtml(post.title)}</h4>
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
      ? optimizeThumbnail(post.thumbnail, 's600-c')
      : '';
    const badge  = post.labels && post.labels[0]
      ? formatLabelName(post.labels[0])
      : '';
    const aiType = extractAIType(post.labels || []);
    const aiHtml = aiType ? renderAIStandardBadge(aiType, lang) : '';

    return `
      <a href="${escapeHtml(post.url)}" class="sp-spotlight-card"${aiType ? ` data-ai-type="${aiType}"` : ''}>
        ${thumb ? `<div class="sp-spotlight-cover"><img src="${escapeHtml(thumb)}" alt="${escapeHtml(post.title)}" loading="lazy" width="600" height="338"/></div>` : ''}
        <div class="sp-spotlight-info">
          <div class="sp-spotlight-meta">
            ${badge ? `<span class="sp-spotlight-badge">${escapeHtml(badge)}</span>` : ''}
            <span class="sp-spotlight-date">📅 ${escapeHtml(post.dateFormatted)}</span>
            ${aiHtml}
          </div>
          <h3 class="sp-spotlight-title">${escapeHtml(post.title)}</h3>
          ${(opts.showSnippet && post.snippet) ? `<p class="sp-spotlight-snippet">${escapeHtml(post.snippet)}</p>` : ''}
          <span class="sp-spotlight-cta">Đọc tiếp bài viết <span aria-hidden="true">→</span></span>
        </div>
      </a>`;
  }

  /* ── 3. QUOTE ───────────────────────────────────────────────── */
  function renderQuotePattern(posts, opts) {
    const itemsHtml = posts.map(post => {
      // Lấy tiêu đề bài làm câu trích dẫn, snippet làm lời bình
      const quoteText = post.title;
      const snippet   = (opts.showSnippet && post.snippet) ? post.snippet : '';

      return `
        <a href="${escapeHtml(post.url)}" class="sp-quote-card">
          <span class="sp-quote-mark-open">\u201C</span>
          <p class="sp-quote-text">${escapeHtml(quoteText)}</p>
          <span class="sp-quote-mark-close">\u201D</span>
          <div class="sp-quote-author">\u2014 ${escapeHtml(post.dateFormatted)}</div>
          ${snippet ? `<div class="sp-quote-divider"></div><p class="sp-quote-snippet">${escapeHtml(snippet)}</p>` : ''}
          <span class="sp-quote-cta">Xem lời bình &amp; phân tích <span aria-hidden="true">→</span></span>
        </a>`;
    }).join('');

    return `<div class="sp-quote-list">${itemsHtml}</div>`;
  }

  /* ── 4. DIGEST ──────────────────────────────────────────────── */
  function renderDigestPattern(posts, opts) {
    const lang = (() => { try { return localStorage.getItem('user_lang') || 'vi'; } catch(e) { return 'vi'; } })();
    const itemsHtml = posts.map(post => {
      const snippet = (opts.showSnippet && post.snippet) ? post.snippet : '';
      const aiType  = extractAIType(post.labels || []);
      const aiHtml  = aiType ? (' • ' + renderAIInlineBadge(aiType)) : '';

      return `
        <a href="${escapeHtml(post.url)}" class="sp-digest-item"${aiType ? ` data-ai-type="${aiType}"` : ''}>
          <div class="sp-digest-timestamp">
            <span class="sp-digest-bullet">✦</span>
            ${escapeHtml(post.dateFormatted)}${aiHtml}
          </div>
          <div class="sp-digest-title">${escapeHtml(post.title)}</div>
          ${snippet ? `<div class="sp-digest-snippet">${escapeHtml(snippet)}</div>` : ''}
        </a>`;
    }).join('');

    return `<div class="sp-digest-list">${itemsHtml}</div>`;
  }

  /* ═══════════════════════════════════════════════════════════════
     DATA FETCHERS
     ═══════════════════════════════════════════════════════════════ */

  /* ── Fetch nhiều nhãn song song + deduplication ─────────────── */
  async function fetchMultiLabelPosts(labels, limit, sort) {
    // Nạp song song tất cả nhãn
    const promises = labels.map(label => fetchSingleLabelFeed(label, limit + 5));
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
  async function fetchSingleLabelFeed(label, count) {
    const cacheKey = CACHE_PREFIX + 'label_' + encodeURIComponent(label) + '_' + count;
    const cached   = readCache(cacheKey);
    if (cached) return cached;

    const encodedLabel = encodeURIComponent(label);
    const blogUrl      = getBlogBaseUrl();
    const url          = `${blogUrl}/feeds/posts/summary/-/${encodedLabel}?alt=json&max-results=${count}&orderby=published`;

    const res  = await fetch(url);
    const json = await res.json();

    const posts = parseFeedEntries(json.feed ? json.feed.entry : []);
    writeCache(cacheKey, posts);
    return posts;
  }

  /* ── Fetch Popular Posts (lượt xem nhiều nhất) ──────────────── */
  async function fetchPopularPosts(limit, timeRange, labelFilter) {
    const cacheKey = CACHE_PREFIX + 'popular_' + timeRange + '_' + limit;
    const cached   = readCache(cacheKey);
    if (cached) {
      return filterByLabels(cached, labelFilter, limit);
    }

    // Blogger Popular Posts JSON Feed
    const blogUrl = getBlogBaseUrl();
    // Blogger không có Public Popular Posts API trực tiếp;
    // dùng feed với orderby=updated (phổ biến nhất) kết hợp max-results lớn
    // và sắp xếp theo label nếu có
    let url;
    if (labelFilter) {
      const labelList    = splitLabels(labelFilter);
      const encodedLabel = encodeURIComponent(labelList[0]);
      url = `${blogUrl}/feeds/posts/summary/-/${encodedLabel}?alt=json&max-results=20&orderby=updated`;
    } else {
      url = `${blogUrl}/feeds/posts/summary?alt=json&max-results=20&orderby=updated`;
    }

    const res  = await fetch(url);
    const json = await res.json();

    const posts = parseFeedEntries(json.feed ? json.feed.entry : []);
    writeCache(cacheKey, posts);
    return posts.slice(0, limit);
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
      if (entry.media$thumbnail) {
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

      return { url, title, thumbnail, snippet, published, dateFormatted, labels };
    } catch {
      return null;
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     UTILS
     ═══════════════════════════════════════════════════════════════ */

  /** Lọc ký tự @ # _ ~ khỏi tên nhãn trước khi hiển thị */
  function formatLabelName(raw) {
    if (!raw) return '';
    return decodeURIComponent(String(raw)).replace(/^[@#_~]+/, '').trim();
  }

  /** Trích xuất loại AI từ mảng labels; trả về key hoặc null */
  function extractAIType(labels) {
    if (!labels || !labels.length) return null;
    for (var i = 0; i < labels.length; i++) {
      var raw = labels[i] || '';
      var lower = raw.toLowerCase().replace(/-/g, ':');
      if (lower.startsWith('ai:')) return lower;
    }
    return null;
  }

  /** Render AI badge inline HTML (không phụ thuộc external module để tránh race condition) */
  function renderAIInlineBadge(aiType) {
    var icons = { 'ai:assisted': '✨', 'ai:product': '🤖', 'ai:generated': '⚡' };
    var icon = icons[aiType] || '✨';
    return '<span class="ai-badge ai-badge-inline" data-ai-type="' + aiType + '" data-ai-variant="inline">' +
      '<span class="ai-badge-icon">' + icon + '</span>' +
      '<span class="ai-badge-label">AI</span>' +
    '</span>';
  }

  function renderAIStandardBadge(aiType, lang) {
    var icons = { 'ai:assisted': '✨', 'ai:product': '🤖', 'ai:generated': '⚡' };
    var labels = {
      'ai:assisted':  { vi: 'Hỗ trợ bởi AI', en: 'AI-Assisted'  },
      'ai:product':   { vi: 'Sản phẩm AI',   en: 'AI Product'   },
      'ai:generated': { vi: 'Tạo bởi AI',    en: 'AI-Generated' },
    };
    var icon = icons[aiType] || '✨';
    var labelCfg = labels[aiType] || labels['ai:assisted'];
    var label = (lang === 'en') ? labelCfg.en : labelCfg.vi;
    return '<span class="ai-badge ai-badge-standard" data-ai-type="' + aiType + '" data-ai-variant="standard">' +
      '<span class="ai-badge-icon">' + icon + '</span>' +
      '<span class="ai-badge-label">' + label + '</span>' +
    '</span>';
  }

  /** Tách chuỗi nhãn "A, B, C" thành mảng */
  function splitLabels(raw) {
    return raw.split(',').map(l => l.trim()).filter(Boolean);
  }

  /** Tối ưu kích thước ảnh Blogger (Retina-safe) */
  function optimizeThumbnail(url, size) {
    if (!url) return '';
    return url
      .replace(/\/s[0-9]+(-c)?\//, '/' + size + '/')
      .replace(/\/w[0-9]+-h[0-9]+(-c)?\//, '/' + size + '/');
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

  /** Build URL trang nhãn (lọc @ cho URL) */
  function buildLabelUrl(label) {
    if (!label) return '/';
    const blogBase = getBlogBaseUrl();
    return `${blogBase}/search/label/${encodeURIComponent(label)}`;
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
