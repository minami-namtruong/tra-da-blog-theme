/* ==========================================
   ARCHIVE PAGE (MỤC LỤC TOÀN THƯ) — v4.0
   Đặc tả: specs/BRANCHING_TIMELINE_ARCHIVE_SPECIFICATION.md (FEAT-BRANCHING-TIMELINE-V4)
   - Cây Dòng Thời Gian Rẽ Nhánh (SVG Branching Tree)
   - Phân tách luồng: ✦ Bài Viết (articles) vs ⚡ Ghi Nhanh (notes)
   - Thanh Chuyên Mục 2 Cụm (Two-Cluster Category Bar)
   - Tương tác 2 chiều: Node ↔ Category Pill
   - URL sync, Live Search, Smart Cross-Branch Hint
   - Tương thích ngược hoàn toàn với API window.initArchivePage
   ========================================== */

(function () {
  'use strict';

  var CACHE_KEY = 'blogger_archive_posts_v5'; // v5 để tránh conflict với v4 cũ
  var CACHE_TTL = 3 * 60 * 1000; // 3 phút

  // ── Dữ liệu phân luồng ──
  var allArticles = []; // Bài viết tâm huyết — nhãn thường hoặc series
  var allNotes = [];    // Ghi chép nhanh — có nhãn @

  // ── Trạng thái UI ──
  var activeStream = 'articles'; // 'articles' | 'notes'
  var activeCategory = 'all';    // category đang chọn trong stream hiện tại
  var searchQuery = '';
  var expandedYears = {};        // year -> boolean
  var searchDebounceTimer = null;
  var isAppMounted = false;

  /* ═══════════════════════════════════════
     TIỆN ÍCH & HELPERS
     ═══════════════════════════════════════ */

  function removeVietnameseDiacritics(str) {
    if (!str) return '';
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim();
  }

  function formatDateStr(isoStr) {
    if (!isoStr) return '';
    var d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';
    var dd = String(d.getDate()).padStart(2, '0');
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    return dd + '/' + mm;
  }

  function getYearFromDate(isoStr) {
    if (!isoStr) return new Date().getFullYear();
    var d = new Date(isoStr);
    return isNaN(d.getTime()) ? new Date().getFullYear() : d.getFullYear();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getLang() {
    try { return localStorage.getItem('user_lang') || 'vi'; } catch (e) { return 'vi'; }
  }

  function parseBilingual(str) {
    if (!str) return '';
    var lang = getLang();
    if (window.parseBilingualText) return window.parseBilingualText(str, lang);
    var parts = str.split('|');
    return lang === 'en' && parts.length > 1 ? parts[1].trim() : parts[0].trim();
  }

  /* ═══════════════════════════════════════
     PHÁT HIỆN TRANG MỤC LỤC
     ═══════════════════════════════════════ */

  function isArchivePage() {
    var pathname = window.location.pathname.toLowerCase();
    var href = window.location.href.toLowerCase();
    var container = document.getElementById('editorial-archive-app');
    var isContainerVisible = container && (
      container.offsetParent !== null ||
      !container.closest('#archive-page-wrapper') ||
      container.closest('#archive-page-wrapper').style.display !== 'none'
    );

    return (
      Boolean(isContainerVisible) ||
      pathname.endsWith('/p/muc-luc.html') ||
      pathname.endsWith('/p/archive.html') ||
      pathname.endsWith('/p/dong-thoi-gian.html') ||
      href.indexOf('/p/muc-luc.html') !== -1 ||
      href.indexOf('/p/archive.html') !== -1 ||
      href.indexOf('/p/dong-thoi-gian.html') !== -1 ||
      window.location.hash === '#archive'
    );
  }

  /* ═══════════════════════════════════════
     TẢI DỮ LIỆU & DATA PIPELINE
     ═══════════════════════════════════════ */

  function processEntry(entry) {
    var allLabels = [];
    if (entry.category && entry.category.length > 0) {
      allLabels = entry.category.map(function(c) { return c.term || ''; });
    }

    // Phân tách nhãn
    var normalLabels = allLabels.filter(function(l) {
      var lower = l.toLowerCase();
      return l.indexOf('@') !== 0 && !lower.startsWith('ai:') && !lower.startsWith('ai-') && !lower.startsWith('series:');
    });

    var featureLabels = allLabels.filter(function(l) { return l.startsWith('@'); });

    var hasSeriesLabel = allLabels.some(function(l) { return l.toLowerCase().startsWith('series:'); });
    var seriesName = '';
    if (hasSeriesLabel) {
      var sLabel = allLabels.find(function(l) { return l.toLowerCase().startsWith('series:'); });
      if (sLabel) seriesName = sLabel.replace(/^series:\s*/i, '').trim();
    }

    // Nhãn AI
    var aiType = null;
    allLabels.forEach(function(l) {
      if (!aiType) {
        var lower = l.toLowerCase().replace(/-/g, ':');
        if (lower.startsWith('ai:')) aiType = lower;
      }
    });

    // Base info
    var title = (entry.title && entry.title.$t) || 'Bài viết không tiêu đề';
    var postUrl = '#';
    if (entry.link) {
      var altLink = entry.link.find(function(l) { return l.rel === 'alternate'; });
      if (altLink) postUrl = altLink.href;
    }
    var published = (entry.published && entry.published.$t) || '';
    var year = getYearFromDate(published);
    var dateStr = formatDateStr(published);
    var timestamp = published ? new Date(published).getTime() : 0;

    // Extract content snippet for notes
    var contentSnippet = '';
    if (entry.summary && entry.summary.$t) {
      contentSnippet = entry.summary.$t.replace(/<[^>]*>/g, '').trim().substring(0, 120);
    }

    var result = {
      articles: null,
      notes: null
    };

    // ── Nhánh Bài Viết: có nhãn thường HOẶC thuộc series ──
    if (normalLabels.length > 0 || hasSeriesLabel) {
      var category = normalLabels.length > 0 ? normalLabels[0] : (seriesName || 'Chưa phân loại');
      category = category.replace(/^[@#_~]+/, '').trim();
      result.articles = {
        title: title,
        url: postUrl,
        year: year,
        dateStr: dateStr,
        category: category,
        allNormalLabels: normalLabels,
        aiType: aiType,
        timestamp: timestamp
      };
    }

    // ── Nhánh Ghi Nhanh: có nhãn @ bất kỳ ──
    if (featureLabels.length > 0) {
      var primaryFeature = featureLabels[0]; // nhãn @ chính (đầu tiên)
      result.notes = {
        title: title,
        url: postUrl,
        year: year,
        dateStr: dateStr,
        featureLabel: primaryFeature,
        allFeatureLabels: featureLabels,
        contentSnippet: contentSnippet,
        aiType: aiType,
        timestamp: timestamp
      };
    }

    return result;
  }

  function loadArchiveData(callback) {
    // Dọn sạch cache cũ
    try {
      ['blogger_archive_posts', 'blogger_archive_posts_v2', 'blogger_archive_posts_v3',
       'blogger_archive_posts_v4', 'editorial_archive_posts', 'editorial_archive_posts_v2'].forEach(function(k) {
        sessionStorage.removeItem(k);
      });
    } catch (e) {}

    // Kiểm tra cache v5
    try {
      var cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        var parsed = JSON.parse(cached);
        if (parsed && parsed.ts && (Date.now() - parsed.ts < CACHE_TTL) &&
            Array.isArray(parsed.articles) && Array.isArray(parsed.notes)) {
          allArticles = parsed.articles;
          allNotes = parsed.notes;
          if (callback) callback();
          return;
        } else {
          sessionStorage.removeItem(CACHE_KEY);
        }
      }
    } catch (e) {}

    var feedUrl = '/feeds/posts/summary?alt=json&max-results=500&_cb=' + Date.now();
    var isPreviewOrLocal =
      window.location.protocol === 'file:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (!isPreviewOrLocal) {
      fetch(feedUrl, { cache: 'no-cache' })
        .then(function(res) {
          if (!res.ok) throw new Error('Feed fetch failed: ' + res.status);
          return res.json();
        })
        .then(function(data) {
          var entries = (data.feed && data.feed.entry) || [];
          var articles = [], notes = [];

          entries.forEach(function(entry) {
            var processed = processEntry(entry);
            if (processed.articles) articles.push(processed.articles);
            if (processed.notes) notes.push(processed.notes);
          });

          articles.sort(function(a, b) { return b.timestamp - a.timestamp; });
          notes.sort(function(a, b) { return b.timestamp - a.timestamp; });

          allArticles = articles;
          allNotes = notes;

          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
              ts: Date.now(),
              articles: articles,
              notes: notes
            }));
          } catch (e) {}

          if (callback) callback();
        })
        .catch(function(err) {
          console.warn('[Archive v4] Feed fetch failed:', err);
          useFallbackData(callback);
        });
    } else {
      useFallbackData(callback);
    }
  }

  function useFallbackData(callback) {
    if (window.__TIMELINE_MOCK_POSTS__ && window.__TIMELINE_MOCK_POSTS__.length > 0) {
      var articles = [], notes = [];
      window.__TIMELINE_MOCK_POSTS__.forEach(function(p) {
        if (p.featureLabel || (p.allFeatureLabels && p.allFeatureLabels.length > 0)) {
          notes.push(p);
        } else {
          articles.push(p);
        }
      });
      allArticles = articles;
      allNotes = notes;
    } else {
      allArticles = [];
      allNotes = [];
    }

    allArticles.sort(function(a, b) { return b.timestamp - a.timestamp; });
    allNotes.sort(function(a, b) { return b.timestamp - a.timestamp; });
    if (callback) callback();
  }

  /* ═══════════════════════════════════════
     URL PARAMS
     ═══════════════════════════════════════ */

  function parseUrlParams() {
    var params = new URLSearchParams(window.location.search);
    var stream = params.get('stream');
    var cat = params.get('cat');
    var q = params.get('q');
    var yr = params.get('year');

    if (stream === 'notes') activeStream = 'notes';
    else activeStream = 'articles';

    if (cat) activeCategory = cat.trim();
    if (q) searchQuery = q.trim();
    if (yr) {
      var yNum = parseInt(yr, 10);
      if (!isNaN(yNum)) {
        expandedYears = {};
        expandedYears[yNum] = true;
      }
    }
  }

  function syncUrlParams() {
    try {
      var url = new URL(window.location.href);

      // Stream
      if (activeStream === 'notes') {
        url.searchParams.set('stream', 'notes');
      } else {
        url.searchParams.delete('stream');
      }

      // Category
      if (activeCategory && activeCategory !== 'all') {
        url.searchParams.set('cat', activeCategory);
      } else {
        url.searchParams.delete('cat');
      }

      // Search
      if (searchQuery) {
        url.searchParams.set('q', searchQuery);
      } else {
        url.searchParams.delete('q');
      }

      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
  }

  /* ═══════════════════════════════════════
     LỌC DỮ LIỆU
     ═══════════════════════════════════════ */

  function isCategoryMatch(postCat, targetCat) {
    if (!targetCat || targetCat === 'all') return true;
    if (!postCat) return false;
    var pLower = postCat.toLowerCase().trim();
    var tLower = targetCat.toLowerCase().trim();
    if (pLower === tLower) return true;
    var pParts = pLower.split('|').map(function(s) { return s.trim(); });
    var tParts = tLower.split('|').map(function(s) { return s.trim(); });
    for (var i = 0; i < pParts.length; i++) {
      for (var j = 0; j < tParts.length; j++) {
        if (pParts[i] && tParts[j]) {
          if (pParts[i] === tParts[j] || pParts[i].indexOf(tParts[j]) !== -1 || tParts[j].indexOf(pParts[i]) !== -1) {
            return true;
          }
        }
      }
    }
    return false;
  }

  function filterCurrentStream() {
    var pool = activeStream === 'notes' ? allNotes : allArticles;
    var queryRaw = searchQuery.toLowerCase().trim();
    var queryNorm = removeVietnameseDiacritics(searchQuery);

    return pool.filter(function(post) {
      // Lọc category
      var catKey = activeStream === 'notes' ? (post.featureLabel || '') : (post.category || '');
      if (activeCategory !== 'all') {
        if (!isCategoryMatch(catKey, activeCategory)) return false;
      }

      // Lọc từ khóa
      if (!queryRaw) return true;
      var titleRaw = (post.title || '').toLowerCase();
      var titleNorm = removeVietnameseDiacritics(post.title || '');
      var catNorm = removeVietnameseDiacritics(catKey);
      var yearStr = String(post.year);
      var dateStr = post.dateStr || '';
      var snippetRaw = (post.contentSnippet || '').toLowerCase();
      var snippetNorm = removeVietnameseDiacritics(post.contentSnippet || '');

      return (
        titleRaw.indexOf(queryRaw) !== -1 ||
        titleNorm.indexOf(queryNorm) !== -1 ||
        catNorm.indexOf(queryNorm) !== -1 ||
        yearStr.indexOf(queryRaw) !== -1 ||
        dateStr.indexOf(queryRaw) !== -1 ||
        snippetRaw.indexOf(queryRaw) !== -1 ||
        snippetNorm.indexOf(queryNorm) !== -1
      );
    });
  }

  function filterOtherStream() {
    var pool = activeStream === 'notes' ? allArticles : allNotes;
    var queryRaw = searchQuery.toLowerCase().trim();
    var queryNorm = removeVietnameseDiacritics(searchQuery);
    if (!queryRaw) return [];
    return pool.filter(function(post) {
      var titleRaw = (post.title || '').toLowerCase();
      var titleNorm = removeVietnameseDiacritics(post.title || '');
      return titleRaw.indexOf(queryRaw) !== -1 || titleNorm.indexOf(queryNorm) !== -1;
    });
  }

  function groupByYear(posts) {
    var groups = {};
    posts.forEach(function(p) {
      var yr = p.year || new Date().getFullYear();
      if (!groups[yr]) groups[yr] = [];
      groups[yr].push(p);
    });
    var years = Object.keys(groups).map(Number);
    years.sort(function(a, b) { return b - a; });
    return years.map(function(yr) { return { year: yr, posts: groups[yr] }; });
  }

  /* ═══════════════════════════════════════
     RENDER: HERO STATS
     ═══════════════════════════════════════ */

  function renderHeroStats(container) {
    var heroWrap = container.querySelector('#archive-hero-v4');
    if (!heroWrap) return;

    var yearsSet = new Set();
    allArticles.forEach(function(p) { if (p.year) yearsSet.add(p.year); });
    allNotes.forEach(function(p) { if (p.year) yearsSet.add(p.year); });

    heroWrap.innerHTML =
      '<div class="archive-stats-v4">' +
        '<span class="archive-stat-badge-v4 stat-articles" id="archive-stat-articles">' +
          '<strong>📚 ' + allArticles.length + '</strong> Bài Viết' +
        '</span>' +
        '<span class="archive-stat-badge-v4 stat-notes" id="archive-stat-notes">' +
          '<strong>⚡ ' + allNotes.length + '</strong> Ghi Nhanh' +
        '</span>' +
        '<span class="archive-stat-badge-v4 stat-years">' +
          '<strong>🗓️ ' + yearsSet.size + '</strong> Năm' +
        '</span>' +
      '</div>';
  }

  /* ═══════════════════════════════════════
     RENDER: SVG BRANCHING TREE
     ═══════════════════════════════════════ */

  function renderBranchingTree(container) {
    var treeWrap = container.querySelector('#archive-branching-tree');
    if (!treeWrap) return;

    var artCount = allArticles.length;
    var noteCount = allNotes.length;

    // SVG dimensions (viewBox cố định, co giãn tỷ lệ responsive)
    // Root tại (300, 8), nhánh trái (160, 100), nhánh phải (440, 100)
    var html =
      '<div class="timeline-tree-svg-wrap">' +
        '<svg class="timeline-tree-svg" viewBox="0 0 600 140" preserveAspectRatio="xMidYMid meet" aria-label="Cây dòng thời gian rẽ nhánh" role="img">' +
          '<!-- Định nghĩa gradient và filter -->' +
          '<defs>' +
            '<filter id="tree-glow-articles" x="-50%" y="-50%" width="200%" height="200%">' +
              '<feGaussianBlur stdDeviation="3" result="blur"/>' +
              '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>' +
            '</filter>' +
            '<filter id="tree-glow-notes" x="-50%" y="-50%" width="200%" height="200%">' +
              '<feGaussianBlur stdDeviation="3" result="blur"/>' +
              '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>' +
            '</filter>' +
          '</defs>' +

          '<!-- Đường thân gốc -->' +
          '<path class="tree-trunk-root" d="M 300 10 L 300 38"/>' +

          '<!-- Nhánh rẽ trái — Bài Viết -->' +
          '<path class="tree-branch-left ' + (activeStream === 'articles' ? 'is-active' : '') + '" ' +
               'id="tree-branch-articles" ' +
               'd="M 300 38 C 300 75, 160 60, 160 105"/>' +

          '<!-- Nhánh rẽ phải — Ghi Nhanh -->' +
          '<path class="tree-branch-right ' + (activeStream === 'notes' ? 'is-active' : '') + '" ' +
               'id="tree-branch-notes" ' +
               'd="M 300 38 C 300 75, 440 60, 440 105"/>' +

          '<!-- Root Node -->' +
          '<g class="tree-root-node">' +
            '<circle class="tree-root-circle" cx="300" cy="10" r="9"/>' +
            '<text class="tree-root-symbol" x="300" y="10">✦</text>' +
          '</g>' +

          '<!-- Node Bài Viết (trái) -->' +
          '<g class="tree-branch-node-group articles-node ' + (activeStream === 'articles' ? 'is-active' : '') + '" ' +
             'id="tree-node-articles" tabindex="0" role="button" aria-label="Chuyển sang nhánh Bài Viết">' +
            '<circle class="tree-node-glow" cx="160" cy="105" r="27"/>' +
            '<circle class="tree-node-circle" cx="160" cy="105" r="22"/>' +
            '<text class="tree-node-icon" x="160" y="105">🌿</text>' +
            '<text class="tree-node-label" x="160" y="133">Bài Viết</text>' +
            '<text class="tree-node-count" x="160" y="144">' + artCount + ' bài</text>' +
          '</g>' +

          '<!-- Node Ghi Nhanh (phải) -->' +
          '<g class="tree-branch-node-group notes-node ' + (activeStream === 'notes' ? 'is-active' : '') + '" ' +
             'id="tree-node-notes" tabindex="0" role="button" aria-label="Chuyển sang nhánh Ghi Nhanh">' +
            '<circle class="tree-node-glow" cx="440" cy="105" r="27"/>' +
            '<circle class="tree-node-circle" cx="440" cy="105" r="22"/>' +
            '<text class="tree-node-icon" x="440" y="105">⚡</text>' +
            '<text class="tree-node-label" x="440" y="133">Ghi Nhanh</text>' +
            '<text class="tree-node-count" x="440" y="144">' + noteCount + ' ghi chép</text>' +
          '</g>' +
        '</svg>' +
      '</div>';

    treeWrap.innerHTML = html;

    // Bind click cho các node
    var nodeArticles = treeWrap.querySelector('#tree-node-articles');
    var nodeNotes = treeWrap.querySelector('#tree-node-notes');

    if (nodeArticles) {
      nodeArticles.addEventListener('click', function() {
        switchStream('articles', container, 'all');
      });
      nodeArticles.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nodeArticles.click(); }
      });
    }

    if (nodeNotes) {
      nodeNotes.addEventListener('click', function() {
        switchStream('notes', container, 'all');
      });
      nodeNotes.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nodeNotes.click(); }
      });
    }
  }

  function updateTreeActiveState(treeWrap) {
    var nodeArt = treeWrap.querySelector('#tree-node-articles');
    var nodeNote = treeWrap.querySelector('#tree-node-notes');
    var branchLeft = treeWrap.querySelector('#tree-branch-articles');
    var branchRight = treeWrap.querySelector('#tree-branch-notes');

    if (nodeArt) {
      nodeArt.classList.toggle('is-active', activeStream === 'articles');
    }
    if (nodeNote) {
      nodeNote.classList.toggle('is-active', activeStream === 'notes');
    }
    if (branchLeft) {
      branchLeft.classList.toggle('is-active', activeStream === 'articles');
    }
    if (branchRight) {
      branchRight.classList.toggle('is-active', activeStream === 'notes');
    }
  }

  /* ═══════════════════════════════════════
     RENDER: TWO-CLUSTER CATEGORY BAR
     ═══════════════════════════════════════ */

  function renderTwoClusterCategoryBar(container) {
    var barWrap = container.querySelector('#archive-cluster-bar');
    if (!barWrap) return;

    // Đếm bài theo category trong từng stream
    var artCatCounts = {};
    allArticles.forEach(function(p) {
      var cat = p.category || 'Chưa phân loại';
      artCatCounts[cat] = (artCatCounts[cat] || 0) + 1;
    });

    var noteCatCounts = {};
    allNotes.forEach(function(p) {
      var cat = p.featureLabel || '@?';
      noteCatCounts[cat] = (noteCatCounts[cat] || 0) + 1;
    });

    var artCategories = Object.keys(artCatCounts).sort(function(a, b) { return artCatCounts[b] - artCatCounts[a]; });
    var noteCategories = Object.keys(noteCatCounts).sort(function(a, b) { return noteCatCounts[b] - noteCatCounts[a]; });

    // Render helper
    function isArticleClusterActive() {
      return activeStream === 'articles';
    }
    function isNoteClusterActive() {
      return activeStream === 'notes';
    }

    var html = '';

    // ── Cụm 1: Bài Viết ──
    html += '<button type="button" class="cluster-head-pill articles-head ' + (isArticleClusterActive() && activeCategory === 'all' ? 'is-active' : '') + '" ' +
            'id="cluster-head-articles" data-stream="articles" data-cat="all">' +
              '✦ Bài Viết <span class="pill-count">(' + allArticles.length + ')</span>' +
            '</button>';

    artCategories.forEach(function(cat) {
      var isActive = isArticleClusterActive() && isCategoryMatch(activeCategory, cat);
      html += '<button type="button" class="archive-cat-pill ' + (isActive ? 'is-active' : '') + '" ' +
              'data-stream="articles" data-cat="' + escapeHtml(cat) + '">' +
                escapeHtml(parseBilingual(cat)) +
                ' <span class="pill-count">(' + artCatCounts[cat] + ')</span>' +
              '</button>';
    });

    // ── Vạch phân cách ──
    html += '<span class="cluster-silk-separator" aria-hidden="true">┆ ✦ ┆</span>';

    // ── Cụm 2: Ghi Nhanh ──
    html += '<button type="button" class="cluster-head-pill notes-head ' + (isNoteClusterActive() && activeCategory === 'all' ? 'is-active' : '') + '" ' +
            'id="cluster-head-notes" data-stream="notes" data-cat="all">' +
              '⚡ Ghi Nhanh <span class="pill-count">(' + allNotes.length + ')</span>' +
            '</button>';

    noteCategories.forEach(function(cat) {
      var isActive = isNoteClusterActive() && isCategoryMatch(activeCategory, cat);
      // Icon theo nhãn @
      var icon = getNoteIcon(cat);
      html += '<button type="button" class="archive-cat-pill note-pill ' + (isActive ? 'is-active' : '') + '" ' +
              'data-stream="notes" data-cat="' + escapeHtml(cat) + '">' +
                icon + ' ' + escapeHtml(cat) +
                ' <span class="pill-count">(' + noteCatCounts[cat] + ')</span>' +
              '</button>';
    });

    barWrap.innerHTML = html;

    // Bind click
    var pills = barWrap.querySelectorAll('[data-stream]');
    pills.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var stream = btn.getAttribute('data-stream');
        var cat = btn.getAttribute('data-cat') || 'all';
        switchStream(stream, container, cat);
      });
    });
  }

  function updateClusterBarActiveState(barWrap) {
    var pills = barWrap.querySelectorAll('[data-stream]');
    pills.forEach(function(btn) {
      var stream = btn.getAttribute('data-stream');
      var cat = btn.getAttribute('data-cat') || 'all';
      var isStreamMatch = stream === activeStream;

      if (btn.classList.contains('cluster-head-pill')) {
        // Head pill active khi đúng stream VÀ cat là 'all'
        btn.classList.toggle('is-active', isStreamMatch && activeCategory === 'all');
      } else {
        // Sub pill
        btn.classList.toggle('is-active', isStreamMatch && isCategoryMatch(activeCategory, cat));
      }
    });
  }

  function getNoteIcon(featureLabel) {
    var lower = featureLabel.toLowerCase();
    if (lower.indexOf('quote') !== -1 || lower.indexOf('trích') !== -1) return '💬';
    if (lower.indexOf('điểm tin') !== -1 || lower.indexOf('news') !== -1) return '⚡';
    if (lower.indexOf('tiêu điểm') !== -1 || lower.indexOf('spotlight') !== -1) return '🌟';
    return '📝';
  }

  /* ═══════════════════════════════════════
     ĐỒNG BỘ THANH CHUYÊN MỤC DƯỚI BANNER (.category-tabs-bar)
     ═══════════════════════════════════════ */

  function syncBannerCategoryTabs() {
    var bar = document.getElementById('category-tabs-bar') || document.querySelector('.category-tabs-bar');
    if (!bar) return;

    // Đảm bảo thanh trượt ngang 1 dòng duy nhất
    bar.style.flexWrap = 'nowrap';
    bar.style.overflowX = 'auto';

    var lang = getLang();

    // 1. Đổi nút "Tất cả" thành "✦ Bài Viết" (cho trang timeline)
    var firstPill = bar.querySelector('.tab-pill:not(.tab-pill-note)');
    if (firstPill) {
      if (!firstPill.getAttribute('data-home-label')) {
        firstPill.setAttribute('data-home-label', firstPill.getAttribute('data-raw-label') || firstPill.textContent || '✦ Tất cả | All');
      }
      firstPill.setAttribute('data-stream', 'articles');
      firstPill.setAttribute('data-cat', 'all');
      firstPill.setAttribute('data-raw-label', '✦ Bài Viết | Articles');
      firstPill.setAttribute('data-bilingual', 'true');
      firstPill.textContent = window.parseBilingualText ? window.parseBilingualText('✦ Bài Viết | Articles', lang) : '✦ Bài Viết';
    }

    // 2. Thu thập các nhãn Ghi Nhanh (@)
    var noteCats = {};
    allNotes.forEach(function(p) {
      if (p.featureLabel) noteCats[p.featureLabel] = (noteCats[p.featureLabel] || 0) + 1;
    });

    // 3. Đánh dấu các pill đã có trong DOM nếu bắt đầu bằng @
    var existingPills = bar.querySelectorAll('.tab-pill');
    var existingLabels = new Set();
    existingPills.forEach(function(p) {
      var rawLabel = (p.getAttribute('data-label') || p.getAttribute('data-raw-label') || p.textContent || '').trim();
      var clean = rawLabel.replace(/^✦\s*/, '').replace(/^[💬⚡🌟📝]\s*/, '').trim();
      existingLabels.add(clean.toLowerCase());
      if (clean.startsWith('@')) {
        p.classList.add('tab-pill-note');
      }
    });

    // 4. Vạch phân cách ┆
    var sep = bar.querySelector('.cat-bar-separator');
    if (!sep) {
      sep = document.createElement('span');
      sep.className = 'cat-bar-separator';
      sep.setAttribute('aria-hidden', 'true');
      sep.textContent = '┆';
      bar.appendChild(sep);
    }
    sep.style.display = '';

    // 5. Thêm nút "⚡ Ghi Nhanh" (chọn tất cả ghi nhanh có label @)
    var notesAllPill = bar.querySelector('.tab-pill-notes-all');
    if (!notesAllPill) {
      notesAllPill = document.createElement('a');
      notesAllPill.className = 'tab-pill tab-pill-note tab-pill-notes-all';
      notesAllPill.href = '#';
      notesAllPill.setAttribute('data-stream', 'notes');
      notesAllPill.setAttribute('data-cat', 'all');
      notesAllPill.setAttribute('data-raw-label', '⚡ Ghi Nhanh | Quick Notes');
      notesAllPill.setAttribute('data-bilingual', 'true');
      notesAllPill.textContent = window.parseBilingualText ? window.parseBilingualText('⚡ Ghi Nhanh | Quick Notes', lang) : '⚡ Ghi Nhanh';

      // Chèn ngay sau vạch phân cách ┆
      if (sep && sep.nextSibling) {
        bar.insertBefore(notesAllPill, sep.nextSibling);
      } else {
        bar.appendChild(notesAllPill);
      }
    } else {
      notesAllPill.style.display = '';
    }

    // 6. Bổ sung các nhãn Note cụ thể còn thiếu vào thanh dưới banner
    var missingNoteCats = Object.keys(noteCats).filter(function(cat) {
      return !existingLabels.has(cat.toLowerCase());
    });

    if (missingNoteCats.length > 0) {
      missingNoteCats.forEach(function(cat) {
        var a = document.createElement('a');
        a.className = 'tab-pill tab-pill-note';
        a.href = '#';
        a.setAttribute('data-stream', 'notes');
        a.setAttribute('data-cat', cat);
        a.setAttribute('data-label', cat);
        var icon = getNoteIcon(cat);
        a.textContent = icon + ' ' + cat;
        bar.appendChild(a);
      });
    }

    updateBannerCategoryTabsActive();
  }

  function updateBannerCategoryTabsActive() {
    var bar = document.getElementById('category-tabs-bar') || document.querySelector('.category-tabs-bar');
    if (!bar) return;

    var pills = bar.querySelectorAll('.tab-pill');

    pills.forEach(function(p) {
      var streamAttr = p.getAttribute('data-stream');
      var catAttr = p.getAttribute('data-cat');
      var rawLabel = (p.getAttribute('data-label') || p.getAttribute('data-raw-label') || p.textContent || '').trim();
      var clean = rawLabel.replace(/^✦\s*/, '').replace(/^[💬⚡🌟📝]\s*/, '').trim();

      var isArticlesAllPill = (streamAttr === 'articles' && catAttr === 'all') ||
                              clean.toLowerCase().indexOf('bài viết') !== -1 ||
                              clean.toLowerCase() === 'articles' ||
                              (clean.toLowerCase().indexOf('tất cả') !== -1 && !p.classList.contains('tab-pill-note'));

      var isNotesAllPill = (streamAttr === 'notes' && catAttr === 'all') ||
                           p.classList.contains('tab-pill-notes-all') ||
                           clean.toLowerCase().indexOf('ghi nhanh') !== -1 ||
                           clean.toLowerCase() === 'quick notes';

      var isActive = false;
      if (activeCategory === 'all') {
        if (activeStream === 'notes') {
          isActive = isNotesAllPill;
        } else {
          isActive = isArticlesAllPill;
        }
      } else {
        if (!isArticlesAllPill && !isNotesAllPill) {
          isActive = isCategoryMatch(clean, activeCategory);
        }
      }

      p.classList.toggle('active', isActive);
      if (isActive) {
        try {
          p.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } catch (e) {}
      }
    });
  }

  /* ═══════════════════════════════════════
     CHUYỂN NHÁNH (SWITCH STREAM)
     ═══════════════════════════════════════ */

  function switchStream(stream, container, cat) {
    activeStream = stream;
    activeCategory = cat || 'all';

    // Cập nhật SVG tree
    var treeWrap = container.querySelector('#archive-branching-tree');
    if (treeWrap) updateTreeActiveState(treeWrap);

    // Cập nhật Banner Category Tabs
    updateBannerCategoryTabsActive();

    // Render body
    syncUrlParams();
    renderTimelineBody(container);
  }

  /* ═══════════════════════════════════════
     RENDER: TIMELINE BODY (TRỤC + POSTS)
     ═══════════════════════════════════════ */

  function renderTimelineBody(container) {
    var body = container.querySelector('#archive-app-body');
    if (!body) return;

    var filtered = filterCurrentStream();
    var otherFiltered = filterOtherStream();
    var yearGroups = groupByYear(filtered);

    // Smart search cross-branch hint
    var hintHtml = '';
    if (searchQuery && filtered.length === 0 && otherFiltered.length > 0) {
      var otherStreamLabel = activeStream === 'articles' ? 'Ghi Nhanh' : 'Bài Viết';
      var otherStream = activeStream === 'articles' ? 'notes' : 'articles';
      hintHtml =
        '<div class="archive-search-crossbranch-hint" role="alert">' +
          '<span class="hint-text">🔍 Không tìm thấy kết quả bên nhánh <strong>' + (activeStream === 'articles' ? 'Bài Viết' : 'Ghi Nhanh') + '</strong> — ' +
          'Tìm thấy <strong>' + otherFiltered.length + '</strong> kết quả bên nhánh <strong>' + otherStreamLabel + '</strong>.</span>' +
          '<button type="button" class="hint-switch-btn" id="hint-switch-btn">[Chuyển nhánh để xem →]</button>' +
        '</div>';
    }

    // Empty state
    if (yearGroups.length === 0) {
      body.innerHTML = hintHtml +
        '<div class="archive-empty-state">' +
          '<div class="archive-empty-icon">🔍</div>' +
          '<h3 class="archive-empty-title">Không tìm thấy kết quả nào</h3>' +
          '<p class="archive-empty-desc">' +
            (activeStream === 'articles'
              ? 'Chưa có bài viết nào phù hợp trong nhánh <strong>Bài Viết</strong>.'
              : 'Chưa có ghi chép nào phù hợp trong nhánh <strong>Ghi Nhanh</strong>.') +
          '</p>' +
          '<button type="button" class="archive-btn-reset" id="archive-reset-btn">↺ Xem tất cả</button>' +
        '</div>';

      var resetBtn = body.querySelector('#archive-reset-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', function() {
          searchQuery = '';
          activeCategory = 'all';
          var searchInput = container.querySelector('#archive-search-input');
          var clearBtn = container.querySelector('#archive-search-clear');
          if (searchInput) searchInput.value = '';
          if (clearBtn) clearBtn.style.display = 'none';
          syncUrlParams();
          updateBannerCategoryTabsActive();
          renderTimelineBody(container);
        });
      }

      bindHintSwitchBtn(body, container);
      return;
    }

    // Render danh sách
    var isNoteStream = activeStream === 'notes';
    var html = hintHtml;
    html += '<div class="archive-timeline-body ' + (isNoteStream ? 'stream-notes' : 'stream-articles') + '">';
    html += '<div class="archive-spine" aria-hidden="true"></div>';
    html += '<div class="archive-tree-container">';

    yearGroups.forEach(function(group) {
      var yr = group.year;
      var isExpanded = expandedYears[yr] !== undefined ? expandedYears[yr] : true;

      html += '<div class="archive-year-group ' + (isExpanded ? 'is-expanded' : 'is-collapsed') + '" data-year="' + yr + '">';

      // Year header
      html += '<div class="archive-year-header" role="button" tabindex="0" aria-expanded="' + isExpanded + '" aria-controls="year-posts-' + yr + '">';
      html += '  <div class="archive-year-title-wrap">';
      html += '    <span class="archive-year-dot" aria-hidden="true"></span>';
      html += '    <span class="archive-year-num">' + yr + '</span>';
      html += '  </div>';
      html += '  <div class="archive-year-line" aria-hidden="true"></div>';
      html += '  <div class="archive-year-chevron" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg></div>';
      html += '</div>';

      // Posts list
      html += '<div class="archive-year-posts" id="year-posts-' + yr + '">';
      group.posts.forEach(function(post) {
        if (isNoteStream) {
          html += renderNoteCard(post);
        } else {
          html += renderArticleCard(post);
        }
      });
      html += '</div>';
      html += '</div>';
    });

    html += '</div>'; // .archive-tree-container
    html += '</div>'; // .archive-timeline-body

    body.innerHTML = html;

    // Bind accordion
    var yearHeaders = body.querySelectorAll('.archive-year-header');
    yearHeaders.forEach(function(header) {
      function toggleYear() {
        var groupEl = header.closest('.archive-year-group');
        if (!groupEl) return;
        var yr = groupEl.getAttribute('data-year');
        var willExpand = !groupEl.classList.contains('is-expanded');
        groupEl.classList.toggle('is-expanded', willExpand);
        groupEl.classList.toggle('is-collapsed', !willExpand);
        header.setAttribute('aria-expanded', willExpand);
        expandedYears[yr] = willExpand;
      }
      header.addEventListener('click', toggleYear);
      header.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleYear(); }
      });
    });

    bindHintSwitchBtn(body, container);
  }

  function bindHintSwitchBtn(body, container) {
    var hintBtn = body.querySelector('#hint-switch-btn');
    if (hintBtn) {
      hintBtn.addEventListener('click', function() {
        var otherStream = activeStream === 'articles' ? 'notes' : 'articles';
        switchStream(otherStream, container, 'all');
      });
    }
  }

  /* ═══════════════════════════════════════
     RENDER: ARTICLE CARD (Editorial)
     ═══════════════════════════════════════ */

  function renderArticleCard(post) {
    var aiAttr = post.aiType ? ' data-ai-type="' + post.aiType + '"' : '';
    var rawCat = post.category || 'Chưa phân loại';
    var parsedCat = parseBilingual(rawCat);
    var parsedTitle = parseBilingual(post.title);

    var html = '<a class="archive-post-card" href="' + escapeHtml(post.url) + '"' + aiAttr + '>';
    html += '<span class="archive-post-cat-pill" data-bilingual="true" data-raw-label="' + escapeHtml(rawCat) + '">' + escapeHtml(parsedCat) + '</span>';
    html += '<span class="archive-post-card-title" data-bilingual="true" data-raw-label="' + escapeHtml(post.title) + '">' + escapeHtml(parsedTitle) + '</span>';

    if (post.aiType && window.AITransparency) {
      html += window.AITransparency.renderAIBadge(post.aiType, 'micro', getLang());
    }

    html += '<div class="archive-post-meta">';
    html += '<span class="archive-post-date">📅 ' + escapeHtml(post.dateStr) + '</span>';
    html += '<span class="archive-post-arrow" aria-hidden="true">→</span>';
    html += '</div>';
    html += '</a>';
    return html;
  }

  /* ═══════════════════════════════════════
     RENDER: NOTE CARD (Ghi Nhanh) — Variants theo nhãn @
     ═══════════════════════════════════════ */

  function renderNoteCard(post) {
    var featureLabel = (post.featureLabel || '').toLowerCase();
    var aiAttr = post.aiType ? ' data-ai-type="' + post.aiType + '"' : '';

    // Detect variant
    if (featureLabel.indexOf('quote') !== -1 || featureLabel.indexOf('trích') !== -1) {
      return renderQuoteCard(post, aiAttr);
    } else if (featureLabel.indexOf('điểm tin') !== -1 || featureLabel.indexOf('news') !== -1 || featureLabel.indexOf('diem tin') !== -1) {
      return renderNewsCard(post, aiAttr);
    } else if (featureLabel.indexOf('tiêu điểm') !== -1 || featureLabel.indexOf('spotlight') !== -1 || featureLabel.indexOf('tieu diem') !== -1) {
      return renderSpotlightCard(post, aiAttr);
    } else {
      return renderGenericNoteCard(post, aiAttr);
    }
  }

  function renderQuoteCard(post, aiAttr) {
    var parsedTitle = parseBilingual(post.title);
    var snippet = post.contentSnippet || '';
    var quoteText = snippet || parsedTitle;
    var aiHtml = post.aiType && window.AITransparency ? window.AITransparency.renderAIBadge(post.aiType, 'micro', getLang()) : '';

    return '<a class="archive-note-card variant-quote" href="' + escapeHtml(post.url) + '"' + aiAttr + '>' +
      '<p class="quote-text">' + escapeHtml(quoteText) + '</p>' +
      '<div class="quote-attribution">Trích dẫn</div>' +
      '<div class="quote-meta">' +
        '<span>📅 ' + escapeHtml(post.dateStr) + '</span>' +
        aiHtml +
        '<span>→</span>' +
      '</div>' +
    '</a>';
  }

  function renderNewsCard(post, aiAttr) {
    var parsedTitle = parseBilingual(post.title);
    var snippet = post.contentSnippet || '';
    var aiHtml = post.aiType && window.AITransparency ? window.AITransparency.renderAIBadge(post.aiType, 'micro', getLang()) : '';

    return '<a class="archive-note-card variant-news" href="' + escapeHtml(post.url) + '"' + aiAttr + '>' +
      '<div class="note-news-header">' +
        '<span class="note-news-badge">⚡ Điểm Tin</span>' +
        aiHtml +
      '</div>' +
      '<div class="note-news-title">' + escapeHtml(parsedTitle) + '</div>' +
      (snippet ? '<div class="note-news-excerpt">' + escapeHtml(snippet) + '</div>' : '') +
      '<div class="note-news-footer">' +
        '<span class="archive-post-date">📅 ' + escapeHtml(post.dateStr) + '</span>' +
        '<span class="note-read-more">Đọc tiếp →</span>' +
      '</div>' +
    '</a>';
  }

  function renderSpotlightCard(post, aiAttr) {
    var parsedTitle = parseBilingual(post.title);
    var aiHtml = post.aiType && window.AITransparency ? window.AITransparency.renderAIBadge(post.aiType, 'micro', getLang()) : '';

    return '<a class="archive-note-card variant-spotlight" href="' + escapeHtml(post.url) + '"' + aiAttr + '>' +
      '<div class="note-spotlight-header">' +
        '<span class="note-spotlight-badge">🌟 Tiêu Điểm</span>' +
        aiHtml +
      '</div>' +
      '<div class="note-spotlight-title">' + escapeHtml(parsedTitle) + '</div>' +
      '<div class="note-spotlight-meta">' +
        '<span>📅 ' + escapeHtml(post.dateStr) + '</span>' +
        '<span>→</span>' +
      '</div>' +
    '</a>';
  }

  function renderGenericNoteCard(post, aiAttr) {
    var parsedTitle = parseBilingual(post.title);
    var icon = getNoteIcon(post.featureLabel || '');
    var label = post.featureLabel || '@Ghi Chú';
    var aiHtml = post.aiType && window.AITransparency ? window.AITransparency.renderAIBadge(post.aiType, 'micro', getLang()) : '';

    return '<a class="archive-note-card variant-generic" href="' + escapeHtml(post.url) + '"' + aiAttr + '>' +
      '<span class="note-generic-label">' + icon + ' ' + escapeHtml(label) + '</span>' +
      '<span class="note-generic-title">' + escapeHtml(parsedTitle) + '</span>' +
      '<span class="note-generic-meta">' +
        aiHtml +
        '<span>📅 ' + escapeHtml(post.dateStr) + '</span>' +
        '<span>→</span>' +
      '</span>' +
    '</a>';
  }

  /* ═══════════════════════════════════════
     KHỞI TẠO VÀ BIND SỰ KIỆN
     ═══════════════════════════════════════ */

  function createArchiveStructure(container) {
    if (container.querySelector('#archive-branching-tree')) return;

    container.innerHTML = [
      '<!-- Thanh Tìm Kiếm Tức Thì -->',
      '<div class="archive-search-wrap">',
      '  <span class="archive-search-icon" aria-hidden="true">🔍</span>',
      '  <input class="archive-search-input" id="archive-search-input" type="search"',
      '         placeholder="Tìm bài viết, ghi chú hoặc năm..." autocomplete="off" aria-label="Tìm kiếm"/>',
      '  <button type="button" class="archive-search-clear" id="archive-search-clear" aria-label="Xóa" style="display:none;">✕</button>',
      '</div>',
      '',
      '<!-- SVG Branching Tree -->',
      '<div class="archive-branching-tree-wrap" id="archive-branching-tree"></div>',
      '',
      '<!-- Timeline Body -->',
      '<div id="archive-app-body" aria-live="polite">',
      '  <div class="archive-loading">',
      '    <div class="archive-spinner"></div>',
      '    <span>Đang đồng bộ dữ liệu...</span>',
      '  </div>',
      '</div>'
    ].join('\n');
  }

  function bindArchiveEvents(container) {
    var searchInput = container.querySelector('#archive-search-input');
    var clearBtn = container.querySelector('#archive-search-clear');

    if (searchInput && searchQuery) {
      searchInput.value = searchQuery;
      if (clearBtn) clearBtn.style.display = 'flex';
    }

    if (searchInput) {
      searchInput.addEventListener('input', function() {
        searchQuery = searchInput.value;
        if (clearBtn) {
          clearBtn.style.display = searchQuery.length > 0 ? 'flex' : 'none';
        }
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(function() {
          syncUrlParams();
          renderTimelineBody(container);
        }, 150);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        searchQuery = '';
        if (searchInput) { searchInput.value = ''; searchInput.focus(); }
        clearBtn.style.display = 'none';
        syncUrlParams();
        renderTimelineBody(container);
      });
    }
  }

  // Kết nối Category Tabs ngoài banner (.category-tabs-bar) → lọc trên Archive page
  function bindCategoryTabs(container) {
    if (window._categoryTabsBoundV4) return;
    window._categoryTabsBoundV4 = true;

    document.addEventListener('click', function(e) {
      var pill = e.target.closest('.category-tabs-bar .tab-pill, #category-tabs-bar .tab-pill');
      if (!pill) return;
      if (!isArchivePage()) return;
      var appEl = document.getElementById('editorial-archive-app');
      if (!appEl) return;

      e.preventDefault();
      e.stopPropagation();

      var streamAttr = pill.getAttribute('data-stream');
      var catAttr = pill.getAttribute('data-cat');
      var rawLabel = (pill.getAttribute('data-label') || pill.getAttribute('data-raw-label') || pill.textContent || '').trim();
      var cleanLabel = rawLabel.replace(/^✦\s*/, '').replace(/^[💬⚡🌟📝]\s*/, '').trim();

      // 1. Nút "✦ Bài Viết" (tất cả bài viết regular)
      var isArticlesAll = (streamAttr === 'articles' && catAttr === 'all') ||
                          cleanLabel.toLowerCase().indexOf('bài viết') !== -1 ||
                          cleanLabel.toLowerCase() === 'articles' ||
                          (cleanLabel.toLowerCase().indexOf('tất cả') !== -1 && !pill.classList.contains('tab-pill-note'));

      if (isArticlesAll) {
        switchStream('articles', appEl, 'all');
        return;
      }

      // 2. Nút "⚡ Ghi Nhanh" (tất cả bài viết có label @)
      var isNotesAll = (streamAttr === 'notes' && catAttr === 'all') ||
                       pill.classList.contains('tab-pill-notes-all') ||
                       cleanLabel.toLowerCase().indexOf('ghi nhanh') !== -1 ||
                       cleanLabel.toLowerCase() === 'quick notes';

      if (isNotesAll) {
        switchStream('notes', appEl, 'all');
        return;
      }

      // 3. Nhãn note cụ thể (@Quote, @Điểm tin, @Tiêu điểm)
      if (cleanLabel.startsWith('@')) {
        switchStream('notes', appEl, cleanLabel);
      } else {
        // 4. Nhãn chuyên mục bài viết regular
        switchStream('articles', appEl, cleanLabel);
      }
    }, true);
  }

  function mountArchiveApp(targetEl) {
    var container = targetEl || document.getElementById('editorial-archive-app');
    if (!container) return;

    container.classList.add('editorial-archive-page');
    createArchiveStructure(container);
    parseUrlParams();
    bindArchiveEvents(container);
    bindCategoryTabs(container);

    loadArchiveData(function() {
      syncBannerCategoryTabs();
      renderBranchingTree(container);
      renderTimelineBody(container);
    });

    isAppMounted = true;
  }

  function init() {
    if (isArchivePage()) {
      var appEl = document.getElementById('editorial-archive-app');
      if (appEl) mountArchiveApp(appEl);
    }
  }

  // Export API toàn cục
  window.initArchivePage = function(targetEl) {
    mountArchiveApp(targetEl);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
