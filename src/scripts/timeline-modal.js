/* ==========================================
   TIMELINE ARCHIVE PAGE — v2.0
   - Flat post cards (nhất quán với trang chủ)
   - Category filter pills + text search
   - Collapse/Expand accordion theo năm
   - Fetch Blogger JSON Feed + DOM fallback
   ========================================== */
(function () {
  'use strict';

  /* ── State ── */
  var timelineOverlay    = null;
  var timelineCloseBtn   = null;
  var timelineSearchInput = null;
  var timelineBody       = null;
  var timelineCatPills   = null;
  var timelineStatsBadge = null;
  var btnExpandAll       = null;
  var btnCollapseAll     = null;

  var allPostsData   = [];
  var isDataLoaded   = false;
  var activeCategory = 'all';   // 'all' | category string
  var searchQuery    = '';

  /* ── Init ── */
  function initTimelineModal() {
    timelineOverlay     = document.getElementById('timeline-modal-overlay');
    timelineCloseBtn    = document.getElementById('timeline-close-btn');
    timelineSearchInput = document.getElementById('timeline-search-input');
    timelineBody        = document.getElementById('timeline-modal-body');
    timelineCatPills    = document.getElementById('timeline-cat-pills');
    timelineStatsBadge  = document.getElementById('timeline-stats-badge');
    btnExpandAll        = document.getElementById('timeline-expand-all');
    btnCollapseAll      = document.getElementById('timeline-collapse-all');

    if (!timelineOverlay) return;

    /* Open triggers */
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest(
        '#timeline-open-btn, .timeline-open-trigger, a[href="#timeline"], a[href="#archive"]'
      );
      if (trigger) {
        e.preventDefault();
        openTimeline();
      }
    });

    /* Close button */
    if (timelineCloseBtn) {
      timelineCloseBtn.addEventListener('click', closeTimeline);
    }

    /* ESC key */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && timelineOverlay.classList.contains('is-open')) {
        closeTimeline();
      }
    });

    /* Search — debounced */
    if (timelineSearchInput) {
      var searchTimer;
      timelineSearchInput.addEventListener('input', function () {
        clearTimeout(searchTimer);
        var val = this.value.trim().toLowerCase();
        searchTimer = setTimeout(function () {
          searchQuery = val;
          renderTimeline(filterPosts());
        }, 200);
      });
    }

    /* Expand / Collapse All */
    if (btnExpandAll) {
      btnExpandAll.addEventListener('click', function (e) {
        e.preventDefault();
        toggleAllYears(true);
      });
    }
    if (btnCollapseAll) {
      btnCollapseAll.addEventListener('click', function (e) {
        e.preventDefault();
        toggleAllYears(false);
      });
    }
  }

  /* ── Open / Close ── */
  function openTimeline() {
    if (!timelineOverlay) return;

    // Đóng mobile drawer nếu đang mở
    var navDrawer         = document.getElementById('nav-drawer');
    var navDrawerBackdrop = document.getElementById('nav-drawer-backdrop');
    var hamburgerBtn      = document.getElementById('hamburger-btn');
    if (navDrawer)         navDrawer.classList.remove('is-open');
    if (navDrawerBackdrop) navDrawerBackdrop.classList.remove('is-open');
    if (hamburgerBtn)      hamburgerBtn.classList.remove('is-open');

    timelineOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    timelineOverlay.scrollTop = 0;

    if (!isDataLoaded) {
      loadTimelineData();
    }

    setTimeout(function () {
      if (timelineSearchInput) timelineSearchInput.focus();
    }, 280);
  }

  function closeTimeline() {
    if (!timelineOverlay) return;
    timelineOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  /* ── Expand / Collapse All Years ── */
  function toggleAllYears(expand) {
    var groups = timelineBody ? timelineBody.querySelectorAll('.timeline-year-group') : [];
    groups.forEach(function (group) {
      var header = group.querySelector('.timeline-year-header');
      if (expand) {
        group.classList.add('is-expanded');
        group.classList.remove('is-collapsed');
        if (header) header.setAttribute('aria-expanded', 'true');
      } else {
        group.classList.remove('is-expanded');
        group.classList.add('is-collapsed');
        if (header) header.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Load Data ── */
  function loadTimelineData() {
    /* 1. Mock data (preview / local dev) */
    if (window.__TIMELINE_MOCK_POSTS__ && Array.isArray(window.__TIMELINE_MOCK_POSTS__)) {
      allPostsData = window.__TIMELINE_MOCK_POSTS__;
      buildCategoryPills(allPostsData);
      renderTimeline(allPostsData);
      isDataLoaded = true;
      return;
    }

    /* Loading state */
    if (timelineBody) {
      timelineBody.innerHTML =
        '<div class="timeline-empty-state">' +
          '<span class="timeline-empty-icon">⏳</span>' +
          '<p>Đang tải kho lưu trữ bài viết...</p>' +
        '</div>';
    }

    /* 2. Blogger JSON Feed */
    var feedUrl = '/feeds/posts/summary?alt=json&max-results=500';
    fetch(feedUrl)
      .then(function (res) {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(function (data) {
        var entries = (data && data.feed && data.feed.entry) || [];
        allPostsData = entries.map(parseEntry);
        allPostsData.sort(function (a, b) { return b.timestamp - a.timestamp; });
        buildCategoryPills(allPostsData);
        renderTimeline(allPostsData);
        isDataLoaded = true;
      })
      .catch(function (err) {
        console.warn('[TimelineModal] Feed fetch failed:', err);
        scrapePostsFromDOM();
      });
  }

  function parseEntry(entry) {
    var title   = entry.title ? entry.title.$t : 'Bài viết không có tiêu đề';
    var linkObj = entry.link && entry.link.find(function (l) { return l.rel === 'alternate'; });
    var url     = linkObj ? linkObj.href : '#';
    var pubDate = entry.published ? entry.published.$t : new Date().toISOString();
    var cats    = entry.category || [];
    var cat     = cats.length > 0 ? cats[0].term : 'Khác';

    var d     = new Date(pubDate);
    var year  = d.getFullYear() || new Date().getFullYear();
    var day   = String(d.getDate()).padStart(2, '0');
    var month = String(d.getMonth() + 1).padStart(2, '0');

    return {
      title: title,
      url: url,
      year: year,
      dateStr: day + '/' + month,
      category: cat,
      timestamp: d.getTime()
    };
  }

  /* Fallback: DOM scraping */
  function scrapePostsFromDOM() {
    var cards = document.querySelectorAll('.post-card');
    if (cards.length > 0) {
      allPostsData = Array.from(cards).map(function (card, idx) {
        var titleEl  = card.querySelector('.post-card-title a');
        var badgeEl  = card.querySelector('.post-badge');
        var dateEl   = card.querySelector('.post-card-meta span:first-child');

        var title    = titleEl ? titleEl.textContent.trim() : 'Bài viết ' + (idx + 1);
        var url      = titleEl && titleEl.href ? titleEl.href : '#';
        var cat      = badgeEl ? badgeEl.textContent.trim() : 'Khác';
        var dateText = dateEl ? dateEl.textContent.replace('📅', '').trim() : '';

        return {
          title: title,
          url: url,
          year: new Date().getFullYear(),
          dateStr: dateText,
          category: cat,
          timestamp: Date.now() - idx * 86400000 * 5
        };
      });
      buildCategoryPills(allPostsData);
      renderTimeline(allPostsData);
      isDataLoaded = true;
    } else {
      if (timelineBody) {
        timelineBody.innerHTML =
          '<div class="timeline-empty-state">' +
            '<span class="timeline-empty-icon">📭</span>' +
            '<p>Chưa có bài viết nào trong kho lưu trữ.</p>' +
          '</div>';
      }
    }
  }

  /* ── Category Filter Pills ── */
  function buildCategoryPills(posts) {
    if (!timelineCatPills) return;

    // Extract unique categories
    var catSet = {};
    posts.forEach(function (p) {
      if (p.category) catSet[p.category] = (catSet[p.category] || 0) + 1;
    });
    var cats = Object.keys(catSet).sort(function (a, b) {
      return catSet[b] - catSet[a]; // sort by frequency desc
    });

    var html = '<button class="timeline-cat-pill is-active" data-cat="all">✦ Tất cả</button>';
    cats.forEach(function (c) {
      html += '<button class="timeline-cat-pill" data-cat="' + escAttr(c) + '">' + esc(c) + '</button>';
    });
    timelineCatPills.innerHTML = html;

    // Attach click events (once)
    if (!timelineCatPills._hasListener) {
      timelineCatPills._hasListener = true;
      timelineCatPills.addEventListener('click', function (e) {
        var pill = e.target.closest('.timeline-cat-pill');
        if (!pill) return;
        var cat = pill.getAttribute('data-cat');
        activeCategory = cat;

        // Update active state
        timelineCatPills.querySelectorAll('.timeline-cat-pill').forEach(function (p) {
          p.classList.toggle('is-active', p.getAttribute('data-cat') === cat);
        });

        renderTimeline(filterPosts());
      });
    }
  }

  /* ── Filter Logic ── */
  function filterPosts() {
    return allPostsData.filter(function (item) {
      var matchCat   = activeCategory === 'all' || item.category === activeCategory;
      var matchText  = !searchQuery ||
        item.title.toLowerCase().indexOf(searchQuery) !== -1 ||
        (item.category && item.category.toLowerCase().indexOf(searchQuery) !== -1) ||
        String(item.year).indexOf(searchQuery) !== -1;
      return matchCat && matchText;
    });
  }

  /* ── Render Timeline ── */
  function renderTimeline(posts) {
    if (!timelineBody) return;

    if (!posts || posts.length === 0) {
      timelineBody.innerHTML =
        '<div class="timeline-empty-state">' +
          '<span class="timeline-empty-icon">🔍</span>' +
          '<p>Không tìm thấy bài viết phù hợp.<br>Thử tìm kiếm với từ khóa khác.</p>' +
        '</div>';
      updateStatsBadge(0, 0);
      return;
    }

    // Group by Year
    var grouped = {};
    posts.forEach(function (item) {
      var y = item.year || new Date().getFullYear();
      if (!grouped[y]) grouped[y] = [];
      grouped[y].push(item);
    });

    var years = Object.keys(grouped).sort(function (a, b) { return Number(b) - Number(a); });

    updateStatsBadge(posts.length, years.length);

    var html = '<div class="timeline-tree-container">';

    years.forEach(function (year, yIdx) {
      var list = grouped[year];
      // First year expanded, rest also expanded by default
      var isExpanded = true;

      html += '<div class="timeline-year-group ' + (isExpanded ? 'is-expanded' : 'is-collapsed') +
              '" data-year="' + year + '">';

      /* Year header */
      html += '<div class="timeline-year-header" role="button" tabindex="0" ' +
                   'aria-expanded="' + (isExpanded ? 'true' : 'false') + '">' +
                '<div class="timeline-year-title-wrap">' +
                  '<span class="timeline-year-num">' + year + '</span>' +
                  '<span class="timeline-year-count">' + list.length + ' bài viết</span>' +
                '</div>' +
                '<div class="timeline-year-line"></div>' +
                '<span class="timeline-year-chevron" aria-hidden="true">' +
                  '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>' +
                '</span>' +
              '</div>';

      /* Post cards */
      html += '<div class="timeline-year-posts">';
      list.forEach(function (post) {
        html +=
          '<a class="timeline-post-card" href="' + escAttr(post.url) + '">' +
            '<span class="timeline-post-cat">' + esc(post.category || 'Khác') + '</span>' +
            '<span class="timeline-post-title">' + esc(post.title) + '</span>' +
            '<span class="timeline-post-date">📅 ' + esc(post.dateStr) + '</span>' +
            '<span class="timeline-post-arrow" aria-hidden="true">→</span>' +
          '</a>';
      });
      html += '</div>'; // .timeline-year-posts
      html += '</div>'; // .timeline-year-group
    });

    html += '</div>'; // .timeline-tree-container

    timelineBody.innerHTML = html;

    // Bind accordion click + keyboard on year headers
    timelineBody.querySelectorAll('.timeline-year-header').forEach(function (header) {
      function handleToggle() {
        var group = header.closest('.timeline-year-group');
        if (!group) return;
        var expanded = group.classList.contains('is-expanded');

        // Max-height trick for smooth animation
        var postsEl = group.querySelector('.timeline-year-posts');
        if (postsEl && expanded) {
          postsEl.style.maxHeight = postsEl.scrollHeight + 'px';
          requestAnimationFrame(function () {
            group.classList.remove('is-expanded');
            group.classList.add('is-collapsed');
            header.setAttribute('aria-expanded', 'false');
            postsEl.style.maxHeight = '';
          });
        } else if (postsEl) {
          group.classList.add('is-expanded');
          group.classList.remove('is-collapsed');
          header.setAttribute('aria-expanded', 'true');
          postsEl.style.maxHeight = postsEl.scrollHeight + 'px';
          setTimeout(function () { postsEl.style.maxHeight = ''; }, 360);
        }
      }

      header.addEventListener('click', handleToggle);
      header.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggle();
        }
      });

      // Set initial max-height for expanded groups
      var group = header.closest('.timeline-year-group');
      if (group && group.classList.contains('is-expanded')) {
        var postsEl = group.querySelector('.timeline-year-posts');
        if (postsEl) postsEl.style.maxHeight = 'none';
      }
    });

    /* Close timeline and navigate when clicking post card */
    timelineBody.querySelectorAll('.timeline-post-card').forEach(function (card) {
      card.addEventListener('click', function (e) {
        closeTimeline();
        if (typeof window.triggerSinglePostView === 'function') {
          e.preventDefault();
          window.triggerSinglePostView(card.querySelector('.timeline-post-title').textContent.trim());
        }
      });
    });
  }

  /* ── Stats Badge ── */
  function updateStatsBadge(postCount, yearCount) {
    if (!timelineStatsBadge) return;
    timelineStatsBadge.innerHTML =
      '<strong>' + postCount + '</strong> bài viết' +
      (yearCount > 0 ? ' · <strong>' + yearCount + '</strong> năm' : '');
  }

  /* ── Helpers ── */
  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escAttr(str) {
    return esc(str);
  }

  /* ── Expose Public API ── */
  window.openTimelineModal  = openTimeline;
  window.closeTimelineModal = closeTimeline;

  /* ── Boot ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTimelineModal);
  } else {
    initTimelineModal();
  }
})();
