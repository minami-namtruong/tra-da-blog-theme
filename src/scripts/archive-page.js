/* ==========================================
   ARCHIVE PAGE (MỤC LỤC TOÀN THƯ) — v3.0
   Đặc tả: specs/TIMELINE_ARCHIVE_PAGE_SPECIFICATION.md (FEAT-TIMELINE-PAGE-V3)
   - Tự động nhận diện trang tĩnh /p/muc-luc.html hoặc container #editorial-archive-app
   - Thu thập & Cache Blogger JSON Feed API (500 bài)
   - Tìm kiếm tức thì tiếng Việt có dấu/không dấu (Debounce 150ms)
   - Lọc theo Category Pills + Accordion đóng/mở theo Năm
   - Hỗ trợ URL Query Parameters: ?q=, ?cat=, ?year=
   ========================================== */

(function () {
  'use strict';

  var CACHE_KEY = 'blogger_archive_posts';
  var allPosts = [];
  var activeCategory = 'all';
  var searchQuery = '';
  var expandedYears = {}; // year -> boolean
  var searchDebounceTimer = null;
  var isAppMounted = false;

  // Helper: Loại bỏ dấu tiếng Việt để tìm kiếm không dấu
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

  // Format ngày DD/MM từ chuỗi ISO
  function formatDateStr(isoStr) {
    if (!isoStr) return '';
    var d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';
    var dd = String(d.getDate()).padStart(2, '0');
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    return dd + '/' + mm;
  }

  // Format năm YYYY từ chuỗi ISO
  function getYearFromDate(isoStr) {
    if (!isoStr) return new Date().getFullYear();
    var d = new Date(isoStr);
    return isNaN(d.getTime()) ? new Date().getFullYear() : d.getFullYear();
  }

  // Kiểm tra xem hiện tại có phải trang Mục Lục hay không
  function isArchivePage() {
    var pathname = window.location.pathname.toLowerCase();
    var href = window.location.href.toLowerCase();
    var container = document.getElementById('editorial-archive-app');

    return (
      Boolean(container) ||
      pathname.endsWith('/p/muc-luc.html') ||
      pathname.endsWith('/p/archive.html') ||
      href.indexOf('/p/muc-luc.html') !== -1 ||
      href.indexOf('/p/archive.html') !== -1 ||
      window.location.hash === '#archive'
    );
  }

  // Thu thập dữ liệu bài viết (Cache -> API -> Fallback Mock Data)
  function loadArchiveData(callback) {
    // 1. Kiểm tra Cache trong sessionStorage
    try {
      var cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        var parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          allPosts = parsed;
          if (callback) callback(allPosts);
          return;
        }
      }
    } catch (e) {
      console.warn('[Archive] sessionStorage error:', e);
    }

    // 2. Thử tải Blogger JSON Feed API
    var feedUrl = '/feeds/posts/summary?alt=json&max-results=500';
    var isPreviewOrLocal =
      window.location.protocol === 'file:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (!isPreviewOrLocal) {
      fetch(feedUrl)
        .then(function (res) {
          if (!res.ok) throw new Error('Feed fetch failed: ' + res.status);
          return res.json();
        })
        .then(function (data) {
          var entries = (data.feed && data.feed.entry) || [];
          var posts = entries.map(function (entry) {
            var title = (entry.title && entry.title.$t) || 'Bài viết không tiêu đề';
            var postUrl = '#';
            if (entry.link) {
              var altLink = entry.link.find(function (l) { return l.rel === 'alternate'; });
              if (altLink) postUrl = altLink.href;
            }
            var published = (entry.published && entry.published.$t) || '';
            var year = getYearFromDate(published);
            var dateStr = formatDateStr(published);
            var timestamp = published ? new Date(published).getTime() : 0;
            var category = 'Chưa phân loại';
            if (entry.category && entry.category.length > 0) {
              category = entry.category[0].term || 'Chưa phân loại';
            }
            return {
              title: title,
              url: postUrl,
              year: year,
              dateStr: dateStr,
              category: category,
              timestamp: timestamp
            };
          });

          // Sắp xếp giảm dần theo thời gian
          posts.sort(function (a, b) { return b.timestamp - a.timestamp; });

          allPosts = posts;
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(posts));
          } catch (e) {}

          if (callback) callback(allPosts);
        })
        .catch(function (err) {
          console.warn('[Archive] Feed fetch failed, using fallback:', err);
          useFallbackData(callback);
        });
    } else {
      useFallbackData(callback);
    }
  }

  // Fallback dữ liệu mock khi chạy local preview hoặc lỗi feed
  function useFallbackData(callback) {
    if (window.__TIMELINE_MOCK_POSTS__ && window.__TIMELINE_MOCK_POSTS__.length > 0) {
      allPosts = window.__TIMELINE_MOCK_POSTS__.slice();
    } else {
      // Cố gắng trích xuất các bài viết từ DOM nếu có
      var domCards = document.querySelectorAll('.posts-feed .post-card');
      if (domCards.length > 0) {
        allPosts = Array.from(domCards).map(function (card, index) {
          var titleEl = card.querySelector('.post-card-title a, .post-card-title');
          var badgeEl = card.querySelector('.post-badge');
          var dateEl = card.querySelector('time');
          var title = titleEl ? titleEl.textContent.trim() : 'Bài viết #' + (index + 1);
          var postUrl = titleEl && titleEl.getAttribute('href') ? titleEl.getAttribute('href') : '#';
          var category = badgeEl ? badgeEl.textContent.trim() : 'Góc Nhìn';
          var rawDate = dateEl ? dateEl.getAttribute('datetime') || dateEl.textContent : '';
          var year = getYearFromDate(rawDate);
          var dateStr = formatDateStr(rawDate) || '15/08';
          var timestamp = rawDate ? new Date(rawDate).getTime() : Date.now() - index * 86400000 * 5;
          return {
            title: title,
            url: postUrl,
            year: year,
            dateStr: dateStr,
            category: category,
            timestamp: timestamp
          };
        });
      } else {
        allPosts = [];
      }
    }

    allPosts.sort(function (a, b) { return b.timestamp - a.timestamp; });
    if (callback) callback(allPosts);
  }

  // Đọc URL Query Parameters (?q=, ?cat=, ?year=)
  function parseUrlParams() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    var cat = params.get('cat');
    var yr = params.get('year');

    if (q) searchQuery = q.trim();
    if (cat) activeCategory = cat.trim();
    if (yr) {
      var yNum = parseInt(yr, 10);
      if (!isNaN(yNum)) {
        expandedYears = {};
        expandedYears[yNum] = true;
      }
    }
  }

  // Cập nhật URL Query Parameters mà không reload trang
  function syncUrlParams() {
    try {
      var url = new URL(window.location.href);
      if (searchQuery) {
        url.searchParams.set('q', searchQuery);
      } else {
        url.searchParams.delete('q');
      }

      if (activeCategory && activeCategory !== 'all') {
        url.searchParams.set('cat', activeCategory);
      } else {
        url.searchParams.delete('cat');
      }

      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
  }

  // Cập nhật các huy hiệu thống kê (Stats Badges)
  function updateStatsBadges(postsToCount) {
    var statPosts = document.getElementById('archive-stat-posts');
    var statYears = document.getElementById('archive-stat-years');
    var statCats = document.getElementById('archive-stat-cats');

    var list = postsToCount || allPosts;
    var totalPosts = list.length;

    var yearsSet = new Set();
    var catsSet = new Set();
    list.forEach(function (p) {
      if (p.year) yearsSet.add(p.year);
      if (p.category && p.category !== 'Chưa phân loại') catsSet.add(p.category);
    });

    if (statPosts) statPosts.innerHTML = '<strong>📚 ' + totalPosts + '</strong> Bài viết';
    if (statYears) statYears.innerHTML = '<strong>🗓️ ' + yearsSet.size + '</strong> Năm xuất bản';
    if (statCats) statCats.innerHTML = '<strong>🏷️ ' + catsSet.size + '</strong> Chủ đề';
  }

  // Khởi tạo và render Category Pills
  function renderCategoryPills(container) {
    var pillsContainer = container.querySelector('#archive-cat-pills');
    if (!pillsContainer) return;

    // Đếm bài viết theo category
    var catCounts = { all: allPosts.length };
    allPosts.forEach(function (p) {
      var cat = p.category || 'Chưa phân loại';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });

    var categories = Object.keys(catCounts).filter(function (c) { return c !== 'all'; });
    categories.sort(function (a, b) { return catCounts[b] - catCounts[a]; });

    var html = '';
    // Pill Tất cả
    var isAllActive = activeCategory === 'all' || !activeCategory;
    html += '<button type="button" class="archive-cat-pill ' + (isAllActive ? 'is-active' : '') + '" data-cat="all">';
    html += '✦ Tất cả <span class="pill-count">(' + catCounts.all + ')</span>';
    html += '</button>';

    categories.forEach(function (cat) {
      var isActive = activeCategory.toLowerCase() === cat.toLowerCase();
      html += '<button type="button" class="archive-cat-pill ' + (isActive ? 'is-active' : '') + '" data-cat="' + escapeHtml(cat) + '">';
      html += escapeHtml(cat) + ' <span class="pill-count">(' + catCounts[cat] + ')</span>';
      html += '</button>';
    });

    pillsContainer.innerHTML = html;

    // Gắn sự kiện click cho từng pill
    var pillBtns = pillsContainer.querySelectorAll('.archive-cat-pill');
    pillBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        pillBtns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        activeCategory = btn.getAttribute('data-cat') || 'all';
        syncUrlParams();
        applyFilterAndRender(container);
      });
    });
  }

  // Lọc bài viết theo searchQuery & activeCategory
  function filterPosts() {
    var queryRaw = searchQuery.toLowerCase().trim();
    var queryNormalized = removeVietnameseDiacritics(searchQuery);

    return allPosts.filter(function (post) {
      // 1. Lọc theo chuyên mục
      if (activeCategory !== 'all') {
        var postCat = (post.category || '').toLowerCase();
        if (postCat !== activeCategory.toLowerCase()) {
          return false;
        }
      }

      // 2. Lọc theo từ khóa tìm kiếm
      if (!queryRaw) return true;

      var titleRaw = (post.title || '').toLowerCase();
      var titleNormalized = removeVietnameseDiacritics(post.title || '');
      var catNormalized = removeVietnameseDiacritics(post.category || '');
      var yearStr = String(post.year);
      var dateStr = post.dateStr || '';

      var matchTitle = titleRaw.indexOf(queryRaw) !== -1 || titleNormalized.indexOf(queryNormalized) !== -1;
      var matchCat = catNormalized.indexOf(queryNormalized) !== -1;
      var matchYear = yearStr.indexOf(queryRaw) !== -1;
      var matchDate = dateStr.indexOf(queryRaw) !== -1;

      return matchTitle || matchCat || matchYear || matchDate;
    });
  }

  // Nhóm bài viết theo Năm (giảm dần)
  function groupPostsByYear(posts) {
    var groups = {};
    posts.forEach(function (p) {
      var yr = p.year || new Date().getFullYear();
      if (!groups[yr]) groups[yr] = [];
      groups[yr].push(p);
    });

    // Mảng các năm sắp xếp giảm dần
    var years = Object.keys(groups).map(Number);
    years.sort(function (a, b) { return b - a; });

    return years.map(function (yr) {
      return {
        year: yr,
        posts: groups[yr]
      };
    });
  }

  // Render danh sách cây năm và thẻ bài viết phẳng
  function applyFilterAndRender(container) {
    var body = container.querySelector('#archive-app-body');
    if (!body) return;

    var filtered = filterPosts();
    var yearGroups = groupPostsByYear(filtered);

    // Nếu không có bài viết nào phù hợp
    if (yearGroups.length === 0) {
      body.innerHTML = [
        '<div class="archive-empty-state">',
        '  <div class="archive-empty-icon">🔍</div>',
        '  <h3 class="archive-empty-title">Không tìm thấy bài viết nào phù hợp</h3>',
        '  <p class="archive-empty-desc">Thử tìm kiếm với từ khóa khác hoặc bấm để xem toàn bộ bài viết.</p>',
        '  <button type="button" class="archive-btn-reset" id="archive-reset-btn">↺ Xem tất cả bài viết</button>',
        '</div>'
      ].join('');

      var resetBtn = body.querySelector('#archive-reset-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          searchQuery = '';
          activeCategory = 'all';
          var searchInput = container.querySelector('#archive-search-input');
          var clearBtn = container.querySelector('#archive-search-clear');
          if (searchInput) searchInput.value = '';
          if (clearBtn) clearBtn.style.display = 'none';

          var tabs = document.querySelectorAll('.category-tabs-bar .tab-pill');
          tabs.forEach(function (t, idx) {
            t.classList.toggle('active', idx === 0);
          });

          syncUrlParams();
          applyFilterAndRender(container);
        });
      }
      return;
    }

    // Xây dựng cây dòng thời gian
    var html = '';
    yearGroups.forEach(function (group, gIdx) {
      // Mặc định mở tất cả các năm (trừ khi đã có trạng thái lưu)
      var yr = group.year;
      var isExpanded = expandedYears[yr] !== undefined ? expandedYears[yr] : true;

      html += '<div class="archive-year-group ' + (isExpanded ? 'is-expanded' : 'is-collapsed') + '" data-year="' + yr + '">';

      // Node Năm (Header) - Tinh gọn, chỉ có số năm, đường kẻ và chevron
      html += '<div class="archive-year-header" role="button" tabindex="0" aria-expanded="' + isExpanded + '" aria-controls="year-posts-' + yr + '">';
      html += '  <div class="archive-year-title-wrap">';
      html += '    <span class="archive-year-num">' + yr + '</span>';
      html += '  </div>';
      html += '  <div class="archive-year-line" aria-hidden="true"></div>';
      html += '  <div class="archive-year-chevron" aria-hidden="true">';
      html += '    <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>';
      html += '  </div>';
      html += '</div>';

      // Danh sách thẻ bài viết phẳng
      html += '<div class="archive-year-posts" id="year-posts-' + yr + '">';
      group.posts.forEach(function (post) {
        html += '<a class="archive-post-card" href="' + escapeHtml(post.url) + '">';
        // Cột 1: Chuyên mục
        html += '  <span class="archive-post-cat-pill">' + escapeHtml(post.category || 'Góc Nhìn') + '</span>';
        // Cột 2: Tiêu đề
        html += '  <span class="archive-post-card-title">' + escapeHtml(post.title) + '</span>';
        // Cột 3: Ngày đăng + Mũi tên
        html += '  <div class="archive-post-meta">';
        html += '    <span class="archive-post-date">📅 ' + escapeHtml(post.dateStr) + '</span>';
        html += '    <span class="archive-post-arrow" aria-hidden="true">→</span>';
        html += '  </div>';
        html += '</a>';
      });
      html += '</div>'; // /.archive-year-posts

      html += '</div>'; // /.archive-year-group
    });

    body.innerHTML = html;

    // Gắn sự kiện click Accordion cho các Node Năm
    var yearHeaders = body.querySelectorAll('.archive-year-header');
    yearHeaders.forEach(function (header) {
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
      header.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleYear();
        }
      });
    });
  }

  // Khởi tạo toàn bộ sự kiện tìm kiếm & điều khiển
  function bindArchiveEvents(container) {
    var searchInput = container.querySelector('#archive-search-input');
    var clearBtn = container.querySelector('#archive-search-clear');
    var expandAllBtn = container.querySelector('#archive-expand-all');
    var collapseAllBtn = container.querySelector('#archive-collapse-all');

    // Khởi tạo giá trị ban đầu nếu có từ URL
    if (searchInput) {
      if (searchQuery) {
        searchInput.value = searchQuery;
        if (clearBtn) clearBtn.style.display = 'flex';
      }

      searchInput.addEventListener('input', function () {
        searchQuery = searchInput.value;
        if (clearBtn) {
          clearBtn.style.display = searchQuery.length > 0 ? 'flex' : 'none';
        }

        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(function () {
          syncUrlParams();
          applyFilterAndRender(container);
        }, 150); // Debounce 150ms theo spec
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        searchQuery = '';
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        clearBtn.style.display = 'none';
        syncUrlParams();
        applyFilterAndRender(container);
      });
    }

    // Mở tất cả các năm
    if (expandAllBtn) {
      expandAllBtn.addEventListener('click', function () {
        var yearGroups = container.querySelectorAll('.archive-year-group');
        yearGroups.forEach(function (g) {
          var yr = g.getAttribute('data-year');
          g.classList.remove('is-collapsed');
          g.classList.add('is-expanded');
          var hdr = g.querySelector('.archive-year-header');
          if (hdr) hdr.setAttribute('aria-expanded', 'true');
          expandedYears[yr] = true;
        });
      });
    }

    // Thu gọn tất cả các năm
    if (collapseAllBtn) {
      collapseAllBtn.addEventListener('click', function () {
        var yearGroups = container.querySelectorAll('.archive-year-group');
        yearGroups.forEach(function (g) {
          var yr = g.getAttribute('data-year');
          g.classList.remove('is-expanded');
          g.classList.add('is-collapsed');
          var hdr = g.querySelector('.archive-year-header');
          if (hdr) hdr.setAttribute('aria-expanded', 'false');
          expandedYears[yr] = false;
        });
      });
    }
  }

  // Tạo khung HTML hoàn chỉnh cho Dedicated Archive Page nếu chưa có sẵn
  function createArchiveStructure(container) {
    if (container.querySelector('.archive-search-wrap')) {
      return; // Đã có cấu trúc sẵn
    }

    var html = [
      '<!-- Thanh Tìm Kiếm Tức Thì -->',
      '<div class="archive-search-wrap">',
      '  <span class="archive-search-icon" aria-hidden="true">🔍</span>',
      '  <input class="archive-search-input" id="archive-search-input" type="search"',
      '         placeholder="Nhập từ khóa tìm tên bài, chủ đề hoặc năm (VD: 2025, sách, thói quen)..."',
      '         autocomplete="off" aria-label="Tìm kiếm bài viết"/>',
      '  <button type="button" class="archive-search-clear" id="archive-search-clear" aria-label="Xóa tìm kiếm" style="display:none;">✕</button>',
      '</div>',
      '',
      '<!-- Khung danh sách bài viết -->',
      '<div id="archive-app-body" class="archive-tree-container" aria-live="polite">',
      '  <div class="archive-loading">',
      '    <div class="archive-spinner"></div>',
      '    <span>Đang đồng bộ danh mục bài viết...</span>',
      '  </div>',
      '</div>'
    ].join('\n');

    container.innerHTML = html;
  }

  // Kết nối thanh nhãn Chuyên mục dưới banner (.category-tabs-bar) để lọc bài viết
  function bindCategoryTabs(container) {
    var tabs = document.querySelectorAll('.category-tabs-bar .tab-pill');
    tabs.forEach(function (pill) {
      if (pill._archiveBound) return;
      pill._archiveBound = true;

      pill.addEventListener('click', function (e) {
        var appEl = document.getElementById('editorial-archive-app');
        if (appEl && appEl.offsetParent !== null) {
          e.preventDefault();
          tabs.forEach(function (t) { t.classList.remove('active'); });
          pill.classList.add('active');

          var catText = pill.textContent.replace('✦', '').trim();
          activeCategory = (catText === 'Tất cả') ? 'all' : catText;

          syncUrlParams();
          applyFilterAndRender(appEl);
        }
      });
    });
  }

  // Escape HTML để ngăn ngừa XSS
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Khởi động toàn bộ ứng dụng Mục Lục
  function mountArchiveApp(targetEl) {
    var container = targetEl || document.getElementById('editorial-archive-app');
    if (!container) return;

    container.classList.add('editorial-archive-page');
    createArchiveStructure(container);
    parseUrlParams();
    bindArchiveEvents(container);
    bindCategoryTabs(container);

    loadArchiveData(function (posts) {
      applyFilterAndRender(container);
    });

    isAppMounted = true;
  }

  // Khởi chạy khi DOM sẵn sàng
  function init() {
    if (isArchivePage()) {
      var appEl = document.getElementById('editorial-archive-app');
      if (appEl) {
        mountArchiveApp(appEl);
      }
    }
  }

  // Export API toàn cục để preview.html hoặc router có thể gọi trực tiếp
  window.initArchivePage = function (targetEl) {
    mountArchiveApp(targetEl);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
