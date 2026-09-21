/* ==========================================================================
   SUBWAY METRO TIMELINE ARCHIVE — v5.0
   Đặc tả: specs/SUBWAY_TIMELINE_ARCHIVE_SPECIFICATION.md (FEAT-SUBWAY-TIMELINE-ARCHIVE-V5)
   - Tự động nhận diện trang tĩnh /p/muc-luc.html hoặc container #editorial-archive-app
   - Dòng thời gian hợp nhất: Hiển thị cả bài viết thường & bài ghi chép độc quyền @
   - Hình tượng Bản đồ Tàu điện ngầm (Subway Metro Map) với Root Node, Main Track,
     Year Stations, Year Sub-tracks và Post Leaves rẽ nhánh
   - Hệ thống lọc đa tầng: Banner Category Tabs + Search + Popover Bộ lọc nâng cao (@, định dạng, AI)
   - Thích ứng di động (Mobile Bottom Sheet) + Dark Mode + Song ngữ VI | EN
   ========================================================================== */

(function () {
  'use strict';

  var CACHE_KEY = 'blogger_subway_archive_v5';
  var CACHE_TTL = 3 * 60 * 1000; // 3 phút

  var allPosts = [];
  var filterState = {
    searchQuery: '',        // Từ input search
    bannerCategory: 'all',  // Từ tabs dưới banner
    selectedLabel: 'all'    // 'all' | nhãn thường | nhãn @ (@Quote, @Điểm tin, @Tiêu điểm...)
  };

  var expandedYears = {}; // year -> boolean
  var searchDebounceTimer = null;
  var isAppMounted = false;
  var isPopoverOpen = false;

  // ── Helper: Loại bỏ dấu tiếng Việt ──
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

  // ── Helper: Format ngày DD/MM từ chuỗi ISO ──
  function formatDateStr(isoStr) {
    if (!isoStr) return '';
    var d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';
    var dd = String(d.getDate()).padStart(2, '0');
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    return dd + '/' + mm;
  }

  // ── Helper: Lấy năm YYYY từ chuỗi ISO ──
  function getYearFromDate(isoStr) {
    if (!isoStr) return new Date().getFullYear();
    var d = new Date(isoStr);
    return isNaN(d.getTime()) ? new Date().getFullYear() : d.getFullYear();
  }

  // ── Helper: Escape HTML ──
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ── Helper: Escape Attribute ──
  function escapeAttr(str) {
    return escapeHtml(str);
  }

  // ── Kiểm tra xem hiện tại có phải trang Mục Lục hay không ──
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

  // ── Trích xuất link alternate từ Blogger feed entry ──
  function extractAlternateLink(entry) {
    if (!entry || !entry.link) return '#';
    var alt = entry.link.find(function (l) { return l.rel === 'alternate'; });
    return alt ? alt.href : '#';
  }

  // ── Phân tích Blogger JSON Feed Entry (Mục 5.1 Spec) ──
  function parseEntry(entry) {
    var rawLabels = (entry.category || []).map(function (c) { return (c.term || '').trim(); }).filter(Boolean);

    var normalLabels = [];
    var featureLabels = [];
    var aiTypeContent = null;
    var aiTypeProduct = null;
    var priority = ['ai:generated', 'ai:contributed', 'ai:assisted', 'ai:translated'];
    var seriesName = null;

    rawLabels.forEach(function (lbl) {
      var lower = lbl.toLowerCase();
      if (lbl.startsWith('@')) {
        featureLabels.push(lbl);
      } else if (lower.startsWith('ai:') || lower.startsWith('ai-')) {
        var t = lower.replace(/-/g, ':');
        if (t === 'ai:product') {
          aiTypeProduct = t;
        } else {
          if (priority.indexOf(t) !== -1) {
            if (!aiTypeContent || priority.indexOf(t) < priority.indexOf(aiTypeContent)) {
              aiTypeContent = t;
            }
          }
        }
      } else if (lower.startsWith('series:')) {
        if (!seriesName) seriesName = lbl.replace(/^series:\s*/i, '').trim();
      } else {
        normalLabels.push(lbl);
      }
    });

    var isFeatureOnly = rawLabels.length > 0 && normalLabels.length === 0 && !seriesName && featureLabels.length > 0;
    var postType = (isFeatureOnly || featureLabels.length > 0) ? 'feature' : 'regular';
    var primaryCategory = normalLabels.length > 0 ? normalLabels[0] : (seriesName || (featureLabels.length > 0 ? featureLabels[0] : 'Chưa phân loại'));

    var publishedStr = (entry.published && entry.published.$t) || '';
    var year = getYearFromDate(publishedStr);
    var dateStr = formatDateStr(publishedStr);
    var timestamp = publishedStr ? new Date(publishedStr).getTime() : 0;

    var aiTypeArr = [];
    if (aiTypeContent) aiTypeArr.push(aiTypeContent);
    if (aiTypeProduct) aiTypeArr.push(aiTypeProduct);
    var aiType = aiTypeArr.length > 0 ? aiTypeArr.join(',') : null;

    return {
      id: entry.id.$t,
      title: entry.title ? entry.title.$t : 'Bài viết không có tiêu đề',
      url: extractAlternateLink(entry),
      published: publishedStr,
      year: year,
      dateStr: dateStr,
      timestamp: timestamp,
      category: primaryCategory,
      normalLabels: normalLabels,
      featureLabels: featureLabels,
      postType: postType, // 'regular' | 'feature'
      aiType: aiType,
      seriesName: seriesName
    };
  }

  // ── Tải dữ liệu bài viết (Cache -> API -> Mock Data) ──
  function loadArchiveData(callback) {
    var isPreviewOrLocal =
      window.location.protocol === 'file:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    // Khi chạy trên môi trường preview local: Luôn xóa cache cũ và tải mock data mới nhất
    if (isPreviewOrLocal) {
      try {
        sessionStorage.removeItem(CACHE_KEY);
      } catch (e) {}
      useFallbackData(callback);
      return;
    }

    // 1. Kiểm tra sessionStorage Cache (chỉ áp dụng trên production Blogger)
    try {
      var cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        var parsed = JSON.parse(cached);
        if (parsed && parsed.ts && (Date.now() - parsed.ts < CACHE_TTL) && Array.isArray(parsed.posts) && parsed.posts.length > 0) {
          allPosts = parsed.posts;
          if (callback) callback(allPosts);
          return;
        } else {
          sessionStorage.removeItem(CACHE_KEY);
        }
      }
    } catch (e) {
      console.warn('[SubwayTimeline] Cache read error:', e);
    }

    var feedUrl = '/feeds/posts/summary?alt=json&max-results=500&_cb=' + Date.now();
    if (!isPreviewOrLocal) {
      fetch(feedUrl, { cache: 'no-cache' })
        .then(function (res) {
          if (!res.ok) throw new Error('Feed fetch failed: ' + res.status);
          return res.json();
        })
        .then(function (data) {
          var entries = (data.feed && data.feed.entry) || [];
          var posts = entries.map(parseEntry);

          // Sắp xếp giảm dần theo thời gian
          posts.sort(function (a, b) { return b.timestamp - a.timestamp; });
          allPosts = posts;

          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
              ts: Date.now(),
              posts: posts
            }));
          } catch (e) {}

          if (callback) callback(allPosts);
        })
        .catch(function (err) {
          console.warn('[SubwayTimeline] Feed API failed, using fallback:', err);
          useFallbackData(callback);
        });
    } else {
      useFallbackData(callback);
    }
  }

  // ── Fallback dữ liệu mock khi chạy local preview ──
  function useFallbackData(callback) {
    if (window.__TIMELINE_MOCK_POSTS__ && window.__TIMELINE_MOCK_POSTS__.length > 0) {
      allPosts = window.__TIMELINE_MOCK_POSTS__.map(function (p) {
        var featLabels = Array.isArray(p.featureLabels) ? p.featureLabels.slice() : [];
        var normLabels = Array.isArray(p.normalLabels) ? p.normalLabels.slice() : [];
        var cat = p.category || '';

        if (cat.startsWith('@') && featLabels.indexOf(cat) === -1) {
          featLabels.push(cat);
        } else if (cat && !cat.startsWith('@') && normLabels.length === 0) {
          normLabels.push(cat);
        }

        var isFeat = featLabels.length > 0 || p.postType === 'feature';
        var primaryCat = normLabels.length > 0 ? normLabels[0] : (featLabels.length > 0 ? featLabels[0] : (cat || 'Chưa phân loại'));

        return {
          title: p.title || 'Bài viết mẫu',
          url: p.url || '#',
          year: p.year || new Date().getFullYear(),
          dateStr: p.dateStr || '15/08',
          category: primaryCat,
          normalLabels: normLabels,
          featureLabels: featLabels,
          postType: isFeat ? 'feature' : 'regular',
          aiType: p.aiType || null,
          timestamp: p.timestamp || Date.now()
        };
      });
    } else {
      allPosts = [];
    }

    allPosts.sort(function (a, b) { return b.timestamp - a.timestamp; });
    if (callback) callback(allPosts);
  }

  // ── Đọc URL Query Parameters (?q=, ?cat=, ?label=, ?year=) ──
  function parseUrlParams() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    var cat = params.get('cat');
    var lbl = params.get('label') || params.get('feature');
    var yr = params.get('year');

    if (q) filterState.searchQuery = q.trim();
    if (cat) filterState.bannerCategory = cat.trim();
    if (lbl) filterState.selectedLabel = lbl.trim();

    if (yr) {
      var yNum = parseInt(yr, 10);
      if (!isNaN(yNum)) {
        expandedYears = {};
        expandedYears[yNum] = true;
      }
    }
  }

  // ── Đồng bộ URL Query Parameters không reload trang ──
  function syncUrlParams() {
    try {
      var url = new URL(window.location.href);
      if (filterState.searchQuery) url.searchParams.set('q', filterState.searchQuery);
      else url.searchParams.delete('q');

      if (filterState.bannerCategory && filterState.bannerCategory !== 'all') {
        url.searchParams.set('cat', filterState.bannerCategory);
      } else {
        url.searchParams.delete('cat');
      }

      if (filterState.selectedLabel && filterState.selectedLabel !== 'all') {
        url.searchParams.set('label', filterState.selectedLabel);
      } else {
        url.searchParams.delete('label');
        url.searchParams.delete('feature');
      }

      url.searchParams.delete('type');
      url.searchParams.delete('ai');

      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
  }

  // ── Kiểm tra khớp chuyên mục (hỗ trợ song ngữ VI | EN) ──
  function isCategoryMatch(postCat, targetCat) {
    if (!targetCat || targetCat === 'all') return true;
    if (!postCat) return false;

    var pLower = postCat.toLowerCase().trim();
    var tLower = targetCat.toLowerCase().trim();

    if (pLower === tLower) return true;

    var pParts = pLower.split('|').map(function (s) { return s.trim(); });
    var tParts = tLower.split('|').map(function (s) { return s.trim(); });

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

  // ── Thu thập toàn bộ các nhãn: nhãn @ và nhãn chuyên mục thường ──
  function getAllLabels() {
    var regularMap = {};
    var featureMap = {};

    allPosts.forEach(function (p) {
      (p.normalLabels || []).forEach(function (lbl) {
        if (lbl.startsWith('@')) {
          featureMap[lbl] = (featureMap[lbl] || 0) + 1;
        } else {
          regularMap[lbl] = (regularMap[lbl] || 0) + 1;
        }
      });
      if (p.category) {
        if (p.category.startsWith('@')) {
          featureMap[p.category] = (featureMap[p.category] || 0) + 1;
        } else {
          regularMap[p.category] = (regularMap[p.category] || 0) + 1;
        }
      }
      (p.featureLabels || []).forEach(function (lbl) {
        featureMap[lbl] = (featureMap[lbl] || 0) + 1;
      });
    });

    // Luôn đảm bảo các nhãn @ tiêu chuẩn có mặt
    ['@Quote', '@Điểm tin', '@Tiêu điểm'].forEach(function (sl) {
      if (featureMap[sl] === undefined) featureMap[sl] = 0;
    });

    var regularList = Object.keys(regularMap).sort(function (a, b) {
      return (regularMap[b] || 0) - (regularMap[a] || 0);
    });

    var featureList = Object.keys(featureMap).sort(function (a, b) {
      return (featureMap[b] || 0) - (featureMap[a] || 0);
    });

    return {
      regular: regularList,
      feature: featureList
    };
  }

  // ── Lọc danh sách bài viết theo filterState ──
  function filterPosts() {
    var qRaw = filterState.searchQuery.toLowerCase().trim();
    var qNorm = removeVietnameseDiacritics(filterState.searchQuery);

    return allPosts.filter(function (post) {
      // 1. Lọc theo Banner Category (dưới hero cover)
      if (filterState.bannerCategory !== 'all') {
        var hasMatchingNormalLabel = (post.normalLabels || []).some(function (lbl) {
          return isCategoryMatch(lbl, filterState.bannerCategory);
        });
        var matchMainCategory = isCategoryMatch(post.category, filterState.bannerCategory);
        if (!hasMatchingNormalLabel && !matchMainCategory) {
          return false;
        }
      }

      // 2. Lọc theo nhãn được chọn (Regular hoặc @ Feature)
      if (filterState.selectedLabel && filterState.selectedLabel !== 'all') {
        var targetLbl = filterState.selectedLabel.toLowerCase();
        var allPostLabels = (post.featureLabels || [])
          .concat(post.normalLabels || [])
          .concat([post.category || ''])
          .map(function (s) { return s.toLowerCase(); });

        var matchSelected = allPostLabels.some(function (lbl) {
          return isCategoryMatch(lbl, targetLbl);
        });
        if (!matchSelected) return false;
      }

      // 3. Lọc theo từ khóa tìm kiếm tức thì (Search Query)
      if (qRaw) {
        var tRaw = (post.title || '').toLowerCase();
        var tNorm = removeVietnameseDiacritics(post.title || '');
        var cNorm = removeVietnameseDiacritics(post.category || '');
        var yStr = String(post.year);
        var dStr = post.dateStr || '';

        var matchTitle = tRaw.indexOf(qRaw) !== -1 || tNorm.indexOf(qNorm) !== -1;
        var matchCat = cNorm.indexOf(qNorm) !== -1;
        var matchYear = yStr.indexOf(qRaw) !== -1;
        var matchDate = dStr.indexOf(qRaw) !== -1;

        var matchLabels = (post.featureLabels || []).concat(post.normalLabels || []).some(function (l) {
          return l.toLowerCase().indexOf(qRaw) !== -1 || removeVietnameseDiacritics(l).indexOf(qNorm) !== -1;
        });

        if (!matchTitle && !matchCat && !matchYear && !matchDate && !matchLabels) {
          return false;
        }
      }

      return true;
    });
  }

  // ── Nhóm bài viết theo Năm ──
  function groupPostsByYear(posts) {
    var groups = {};
    posts.forEach(function (p) {
      var yr = p.year || new Date().getFullYear();
      if (!groups[yr]) groups[yr] = [];
      groups[yr].push(p);
    });

    var years = Object.keys(groups).map(Number);
    years.sort(function (a, b) { return b - a; });

    return years.map(function (yr) {
      return {
        year: yr,
        posts: groups[yr]
      };
    });
  }

  // ── Kiểm tra xem có bộ lọc nâng cao nào đang active không ──
  function hasActiveAdvancedFilter() {
    return filterState.selectedLabel && filterState.selectedLabel !== 'all';
  }

  // ── Cập nhật trạng thái nút icon filter trong Search bar ──
  function updateFilterTriggerState(container) {
    var triggerBtn = container.querySelector('#archive-filter-trigger-btn');
    var dot = container.querySelector('#archive-filter-dot');
    if (!triggerBtn) return;

    var isActive = hasActiveAdvancedFilter();
    triggerBtn.classList.toggle('is-active', isActive);
    if (dot) {
      dot.style.display = isActive ? 'block' : 'none';
    }
  }

  // ── Cập nhật trạng thái active của các tab chuyên mục dưới banner ──
  function updateActiveCategoryTabs() {
    var tabs = document.querySelectorAll('.category-tabs-bar .tab-pill, #category-tabs-bar .tab-pill');
    tabs.forEach(function (t) {
      var href = t.getAttribute('href') || '';
      var raw = (t.getAttribute('data-raw-label') || t.getAttribute('data-label') || t.textContent || '').trim();
      var clean = raw.replace(/^✦\s*/, '').trim();
      var isAll = href === '/' || href === (window.location.origin + '/') ||
                  clean.toLowerCase().indexOf('tất cả') !== -1 ||
                  clean.toLowerCase() === 'all';

      if (filterState.bannerCategory === 'all') {
        t.classList.toggle('active', isAll);
      } else {
        t.classList.toggle('active', isCategoryMatch(clean, filterState.bannerCategory));
      }
    });
  }

  // ── Render Popover Bộ Lọc Nhãn Bài Viết (Danh sách thống nhất: Regular trước, Feature sau, cùng màu, không icon) ──
  function renderFilterPopoverContent(container) {
    var popover = container.querySelector('#archive-filter-popover');
    if (!popover) return;

    var labels = getAllLabels();
    var curSelected = (filterState.selectedLabel || 'all').toLowerCase();

    var pillsContainer = popover.querySelector('#filter-pills-list') ||
                         popover.querySelector('#filter-pills-regular') ||
                         popover.querySelector('.filter-popover-pills');
    if (!pillsContainer) return;

    var html = '';

    var lang = (typeof localStorage !== 'undefined' && localStorage.getItem('user_lang')) || 'vi';

    // 1. "Tất cả" ở vị trí đầu tiên
    var isAllActive = curSelected === 'all';
    var allRaw = 'Tất cả | All';
    var allParsed = window.parseBilingualText ? window.parseBilingualText(allRaw, lang) : 'Tất cả';
    html += '<button type="button" class="filter-tag-pill ' + (isAllActive ? 'is-active' : '') + '" data-val="all" data-bilingual="true" data-raw-label="' + allRaw + '">' + allParsed + '</button>';

    // 2. Toàn bộ regular labels / category trước
    labels.regular.forEach(function (reg) {
      var isActive = curSelected === reg.toLowerCase();
      var parsedReg = window.parseBilingualText ? window.parseBilingualText(reg, lang) : reg.split('|')[0].trim();
      html += '<button type="button" class="filter-tag-pill ' + (isActive ? 'is-active' : '') + '" data-val="' + escapeAttr(reg) + '" data-bilingual="true" data-raw-label="' + escapeAttr(reg) + '">';
      html += escapeHtml(parsedReg);
      html += '</button>';
    });

    // 3. Toàn bộ feature labels (@...) sau, không icon, cùng màu chung
    labels.feature.forEach(function (feat) {
      var isActive = curSelected === feat.toLowerCase();
      var parsedFeat = window.parseBilingualText ? window.parseBilingualText(feat, lang) : feat.split('|')[0].trim();
      html += '<button type="button" class="filter-tag-pill ' + (isActive ? 'is-active' : '') + '" data-val="' + escapeAttr(feat) + '" data-bilingual="true" data-raw-label="' + escapeAttr(feat) + '">';
      html += escapeHtml(parsedFeat);
      html += '</button>';
    });

    pillsContainer.innerHTML = html;
  }

  // ── Mở / Đóng Popover Bộ Lọc ──
  function toggleFilterPopover(container, forceState) {
    var popover = container.querySelector('#archive-filter-popover');
    var backdrop = container.querySelector('#archive-filter-backdrop');
    if (!popover) return;

    var willOpen = forceState !== undefined ? forceState : !isPopoverOpen;
    isPopoverOpen = willOpen;

    if (willOpen) {
      renderFilterPopoverContent(container);
      popover.style.display = 'flex';
      if (backdrop) backdrop.style.display = 'block';
      popover.classList.add('is-open');
    } else {
      popover.classList.remove('is-open');
      popover.style.display = 'none';
      if (backdrop) backdrop.style.display = 'none';
    }
  }

  // ── Xây dựng thẻ bài viết Subway Metro (Section 4.3 Spec) ──
  function renderSubwayPostCard(post) {
    var lang = (typeof localStorage !== 'undefined' && localStorage.getItem('user_lang')) || 'vi';

    // Xác định phong cách thẻ theo định dạng bài viết
    var cardModifier = 'subway-card--regular';
    var isQuote = false;
    var isBulletin = false;
    var isSpotlight = false;

    var firstFeat = (post.featureLabels && post.featureLabels[0]) || '';
    var lowerFeat = firstFeat.toLowerCase();

    if (lowerFeat.indexOf('quote') !== -1 || post.category.toLowerCase().indexOf('quote') !== -1) {
      cardModifier = 'subway-card--quote';
      isQuote = true;
    } else if (lowerFeat.indexOf('điểm tin') !== -1 || post.category.toLowerCase().indexOf('điểm tin') !== -1) {
      cardModifier = 'subway-card--bulletin';
      isBulletin = true;
    } else if (lowerFeat.indexOf('tiêu điểm') !== -1 || post.category.toLowerCase().indexOf('tiêu điểm') !== -1) {
      cardModifier = 'subway-card--spotlight';
      isSpotlight = true;
    } else if (post.postType === 'feature') {
      cardModifier = 'subway-card--feature';
    }

    // Tiêu đề bài viết
    var rawTitle = post.title || 'Bài viết không tiêu đề';
    var parsedTitle = window.parseBilingualText ? window.parseBilingualText(rawTitle, lang) : rawTitle.split('|')[0].trim();

    // Huy hiệu chuyên mục
    var rawCat = post.category || 'Góc Nhìn';
    var parsedCat = window.parseBilingualText ? window.parseBilingualText(rawCat, lang) : rawCat.split('|')[0].trim();

    var catIcon = '';
    var pillClass = 'subway-cat-pill';

    if (isQuote) {
      catIcon = '💬 ';
      pillClass += ' subway-pill--quote';
    } else if (isBulletin) {
      catIcon = '⚡ ';
      pillClass += ' subway-pill--bulletin';
    } else if (isSpotlight) {
      catIcon = '🌟 ';
      pillClass += ' subway-pill--spotlight';
    } else if (post.postType === 'feature') {
      catIcon = '⚡ ';
      pillClass += ' subway-pill--feature';
    }

    var aiAttr = post.aiType ? ' data-ai-type="' + escapeAttr(post.aiType) + '"' : '';
    var aiHtml = '';
    if (post.aiType && window.AITransparency) {
      aiHtml = window.AITransparency.renderAIBadge(post.aiType, 'micro', lang);
    }

    // Với bài @Quote: định dạng tiêu đề trong ngoặc kép thanh lịch nếu chưa có
    var displayTitle = parsedTitle;
    if (isQuote && !displayTitle.startsWith('“') && !displayTitle.startsWith('"')) {
      displayTitle = '“' + displayTitle + '”';
    }

    var html = [
      '<div class="subway-post-item">',
      '  <div class="subway-post-node" aria-hidden="true"></div>',
      '  <div class="subway-post-connector" aria-hidden="true"></div>',
      '  <a class="subway-post-card ' + cardModifier + '" href="' + escapeAttr(post.url) + '"' + aiAttr + '>',
      '    <span class="' + pillClass + '" data-bilingual="true" data-raw-label="' + escapeAttr(rawCat) + '" title="' + escapeAttr(parsedCat) + '">' + catIcon + escapeHtml(parsedCat) + '</span>',
      '    <span class="subway-post-title' + (isQuote ? ' subway-title--quote' : '') + '" data-bilingual="true" data-raw-label="' + escapeAttr(rawTitle) + '">' + escapeHtml(displayTitle) + '</span>',
      aiHtml ? '    ' + aiHtml : '',
      '    <div class="subway-post-meta">',
      '      <span class="subway-post-date">',
      '        <svg class="subway-date-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
      '        <span>' + escapeHtml(post.dateStr) + '</span>',
      '      </span>',
      '      <span class="subway-post-arrow" aria-hidden="true">→</span>',
      '    </div>',
      '  </a>',
      '</div>'
    ].join('\n');

    return html;
  }

  // ── Render toàn bộ Cây Dòng Thời Gian Đường Tàu (Subway Metro Tree) ──
  function applyFilterAndRender(container) {
    var body = container.querySelector('#archive-app-body');
    if (!body) return;

    var filtered = filterPosts();
    var yearGroups = groupPostsByYear(filtered);

    // Cập nhật trạng thái nút icon filter
    updateFilterTriggerState(container);

    // Xử lý trạng thái rỗng nếu không tìm thấy bài viết
    if (yearGroups.length === 0) {
      body.innerHTML = [
        '<div class="archive-empty-state">',
        '  <div class="archive-empty-icon">🔍</div>',
        '  <h3 class="archive-empty-title" data-bilingual="true" data-raw-label="Không tìm thấy bài viết nào phù hợp | No matching posts found">' + (window.parseBilingualText ? window.parseBilingualText('Không tìm thấy bài viết nào phù hợp | No matching posts found', window.currentLang || 'vi') : 'Không tìm thấy bài viết nào phù hợp | No matching posts found') + '</h3>',
        '  <p class="archive-empty-desc" data-bilingual="true" data-raw-label="Thử điều chỉnh từ khóa tìm kiếm hoặc đặt lại các bộ lọc nâng cao. | Try adjusting your search keywords or resetting the filters.">' + (window.parseBilingualText ? window.parseBilingualText('Thử điều chỉnh từ khóa tìm kiếm hoặc đặt lại các bộ lọc nâng cao. | Try adjusting your search keywords or resetting the filters.', window.currentLang || 'vi') : 'Thử điều chỉnh từ khóa tìm kiếm hoặc đặt lại các bộ lọc nâng cao. | Try adjusting your search keywords or resetting the filters.') + '</p>',
        '  <button type="button" class="archive-btn-reset" id="archive-empty-reset-btn" data-bilingual="true" data-raw-label="↺ Xem tất cả bài viết | ↺ View all posts">' + (window.parseBilingualText ? window.parseBilingualText('↺ Xem tất cả bài viết | ↺ View all posts', window.currentLang || 'vi') : '↺ Xem tất cả bài viết | ↺ View all posts') + '</button>',
        '</div>'
      ].join('');

      var resetBtn = body.querySelector('#archive-empty-reset-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          filterState.searchQuery = '';
          filterState.bannerCategory = 'all';
          filterState.selectedLabel = 'all';

          var searchInput = container.querySelector('#archive-search-input');
          var clearBtn = container.querySelector('#archive-search-clear');
          if (searchInput) searchInput.value = '';
          if (clearBtn) clearBtn.style.display = 'none';

          updateActiveCategoryTabs();
          syncUrlParams();
          applyFilterAndRender(container);
        });
      }
      return;
    }

    var lang = (typeof localStorage !== 'undefined' && localStorage.getItem('user_lang')) || 'vi';
    var rawRootTitle = window.parseBilingualText ? window.parseBilingualText('Bài Viết | Articles', lang) : 'Bài Viết';
    var cleanRootTitle = rawRootTitle.replace(/^[✦*\s]+/, '').trim();

    var html = '<div class="subway-tree">';

    // 1. Root Node ở đỉnh dòng thời gian (Node Gốc) - Không lặp lại dấu sao, không hiển thị số đếm
    html += '<div class="subway-root-node">';
    html += '  <div class="subway-root-badge">';
    html += '    <span class="subway-root-sparkle">✦</span>';
    html += '    <span class="subway-root-title">' + escapeHtml(cleanRootTitle) + '</span>';
    html += '  </div>';
    html += '</div>';

    // 2. Cột ray chính (Main Track) chứa các năm
    html += '<div class="subway-main-track">';
    html += '  <div class="subway-main-line" aria-hidden="true"></div>';

    yearGroups.forEach(function (group, gIdx) {
      var yr = group.year;
      // Năm đầu tiên (mới nhất) tự động mở; các năm cũ thu gọn mặc định (nếu chưa được lưu trạng thái)
      var isExpanded = expandedYears[yr] !== undefined ? expandedYears[yr] : (gIdx === 0);

      html += '<div class="subway-year-group ' + (isExpanded ? 'is-expanded' : 'is-collapsed') + '" data-year="' + yr + '">';

      // Hàng trạm năm (Station Row): Node Tròn Trạm -> Connector Ngang -> Lá Năm (Bỏ icon lịch, bỏ số bài)
      html += '<div class="subway-station-row">';
      html += '  <div class="subway-station-node" title="Trạm Năm ' + yr + '" aria-hidden="true">';
      html += '    <span class="subway-station-core"></span>';
      html += '  </div>';
      html += '  <div class="subway-branch-connector" aria-hidden="true"></div>';
      html += '  <button type="button" class="subway-year-leaf" aria-expanded="' + isExpanded + '" aria-controls="subway-branch-' + yr + '">';
      html += '    <span class="subway-year-num">' + yr + '</span>';
      html += '    <span class="subway-year-chevron" aria-hidden="true">';
      html += '      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
      html += '    </span>';
      html += '  </button>';
      html += '</div>'; // /.subway-station-row

      // Nhánh rẽ năm (Year Branch): Line năm thẳng đứng nét đứt + Danh sách Lá Bài Viết
      html += '<div class="subway-year-branch" id="subway-branch-' + yr + '">';
      html += '  <div class="subway-year-line" aria-hidden="true"></div>';
      html += '  <div class="subway-post-list">';
      group.posts.forEach(function (post) {
        html += renderSubwayPostCard(post);
      });
      html += '  </div>'; // /.subway-post-list
      html += '</div>'; // /.subway-year-branch

      html += '</div>'; // /.subway-year-group
    });

    html += '</div>'; // /.subway-main-track
    html += '</div>'; // /.subway-tree

    body.innerHTML = html;

    // Gắn sự kiện Expand / Collapse cho Lá Năm
    var yearLeaves = body.querySelectorAll('.subway-year-leaf');
    yearLeaves.forEach(function (leafBtn) {
      function toggleYearAccordion(e) {
        if (e) e.preventDefault();
        var groupEl = leafBtn.closest('.subway-year-group');
        if (!groupEl) return;
        var yr = groupEl.getAttribute('data-year');
        var branchEl = groupEl.querySelector('.subway-year-branch');
        var willExpand = !groupEl.classList.contains('is-expanded');

        if (willExpand) {
          groupEl.classList.remove('is-collapsed');
          groupEl.classList.add('is-expanded');
          leafBtn.setAttribute('aria-expanded', 'true');
          expandedYears[yr] = true;

          if (branchEl) {
            branchEl.style.maxHeight = branchEl.scrollHeight + 'px';
            setTimeout(function () {
              if (groupEl.classList.contains('is-expanded')) branchEl.style.maxHeight = 'none';
            }, 300);
          }
        } else {
          if (branchEl) {
            branchEl.style.maxHeight = branchEl.scrollHeight + 'px';
            // Force repaint
            void branchEl.offsetHeight;
            branchEl.style.maxHeight = '0px';
          }
          setTimeout(function () {
            groupEl.classList.remove('is-expanded');
            groupEl.classList.add('is-collapsed');
            leafBtn.setAttribute('aria-expanded', 'false');
            expandedYears[yr] = false;
          }, 240);
        }
      }

      leafBtn.addEventListener('click', toggleYearAccordion);
      leafBtn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          toggleYearAccordion(e);
        }
      });
    });

    // Luôn đồng bộ trạng thái active của Category Tabs dưới banner
    updateActiveCategoryTabs();
  }

  // ── Khởi tạo sự kiện tìm kiếm & popover bộ lọc ──
  function bindArchiveEvents(container) {
    if (container._eventsBound) return;
    container._eventsBound = true;

    var searchInput = container.querySelector('#archive-search-input');
    var clearBtn = container.querySelector('#archive-search-clear');
    var filterTrigger = container.querySelector('#archive-filter-trigger-btn');
    var filterClose = container.querySelector('#archive-filter-close-btn');
    var filterBackdrop = container.querySelector('#archive-filter-backdrop');
    var filterPopover = container.querySelector('#archive-filter-popover');
    var resetBtn = container.querySelector('#filter-popover-reset-btn');
    var applyBtn = container.querySelector('#filter-popover-apply-btn');

    // 1. Text Search Input
    if (searchInput) {
      if (filterState.searchQuery) {
        searchInput.value = filterState.searchQuery;
        if (clearBtn) clearBtn.style.display = 'flex';
      }

      searchInput.addEventListener('input', function () {
        filterState.searchQuery = searchInput.value;
        if (clearBtn) {
          clearBtn.style.display = filterState.searchQuery.length > 0 ? 'flex' : 'none';
        }

        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(function () {
          syncUrlParams();
          applyFilterAndRender(container);
        }, 150); // Debounce 150ms chuẩn spec
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        filterState.searchQuery = '';
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        clearBtn.style.display = 'none';
        syncUrlParams();
        applyFilterAndRender(container);
      });
    }

    // 2. Mở / Đóng Filter Popover
    if (filterTrigger) {
      filterTrigger.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleFilterPopover(container);
      });
    }

    if (filterClose) {
      filterClose.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleFilterPopover(container, false);
      });
    }

    if (filterBackdrop) {
      filterBackdrop.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleFilterPopover(container, false);
      });
    }

    // Đóng popover khi nhấn phím ESC hoặc click bên ngoài trên desktop
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isPopoverOpen) {
        toggleFilterPopover(container, false);
      }
    });

    document.addEventListener('click', function (e) {
      if (!isPopoverOpen) return;
      var popover = container.querySelector('#archive-filter-popover');
      var trigger = container.querySelector('#archive-filter-trigger-btn');
      if (popover && !popover.contains(e.target) && trigger && !trigger.contains(e.target)) {
        toggleFilterPopover(container, false);
      }
    });

    // 3. Tương tác chọn Pill bên trong Popover: Lọc tức thì và đóng popup
    if (filterPopover) {
      filterPopover.addEventListener('click', function (e) {
        var pill = e.target.closest('.filter-tag-pill');
        if (!pill) return;

        var val = pill.getAttribute('data-val') || 'all';
        filterState.selectedLabel = val;

        syncUrlParams();
        applyFilterAndRender(container);
        toggleFilterPopover(container, false);
      });
    }

    // 4. Nút Đặt Lại / Xem Tất Cả trong Popover
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        filterState.selectedLabel = 'all';
        syncUrlParams();
        applyFilterAndRender(container);
        toggleFilterPopover(container, false);
      });
    }
  }

  // ── Tạo khung HTML hoàn chỉnh cho Dedicated Archive Page ──
  function createArchiveStructure(container) {
    if (container.querySelector('#archive-filter-trigger-btn') && container.querySelector('#archive-app-body')) {
      return; // Đã có cấu trúc đầy đủ
    }

    var lang = (typeof localStorage !== 'undefined' && localStorage.getItem('user_lang')) || 'vi';
    var placeholderText = lang === 'en' ? 'Search articles...' : 'Tìm kiếm bài viết...';

    var filterHeadingRaw = 'Lọc Theo Nhãn | Filter by Tags';
    var filterHeadingText = window.parseBilingualText ? window.parseBilingualText(filterHeadingRaw, lang) : 'Lọc Theo Nhãn';

    var resetBtnRaw = '↺ Xem tất cả | ↺ View all';
    var resetBtnText = window.parseBilingualText ? window.parseBilingualText(resetBtnRaw, lang) : '↺ Xem tất cả';

    var html = [
      '<!-- Thanh Tìm Kiếm Tức Thì & Nút Bộ Lọc Nâng Cao (@) -->',
      '<div class="archive-search-wrap">',
      '  <span class="archive-search-icon" aria-hidden="true">🔍</span>',
      '  <input class="archive-search-input" id="archive-search-input" type="search"',
      '         placeholder="' + placeholderText + '" data-i18n="searchPlaceholder"',
      '         autocomplete="off" aria-label="Tìm kiếm bài viết"/>',
      '  <button type="button" class="archive-search-clear" id="archive-search-clear" aria-label="Xóa tìm kiếm" style="display:none;">✕</button>',
      '  <button type="button" class="archive-filter-trigger-btn" id="archive-filter-trigger-btn" aria-label="Mở bộ lọc nâng cao" title="Bộ lọc tính năng nâng cao">',
      '    <svg class="icon-filter" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
      '      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>',
      '    </svg>',
      '    <span class="filter-badge-dot" id="archive-filter-dot" style="display:none;"></span>',
      '  </button>',
      '',
      '  <!-- Backdrop & Popover / Bottom Sheet Bộ Lọc Nâng Cao -->',
      '  <div class="archive-filter-backdrop" id="archive-filter-backdrop" style="display:none;"></div>',
      '  <div class="archive-filter-popover" id="archive-filter-popover" style="display:none;" role="dialog" aria-modal="true" aria-labelledby="archive-filter-heading">',
      '    <div class="filter-popover-sheet-handle" aria-hidden="true"></div>',
      '    <div class="filter-popover-header">',
      '      <div class="filter-popover-title-row">',
      '        <span class="filter-popover-icon">🏷️</span>',
      '        <h4 class="filter-popover-heading" id="archive-filter-heading" data-bilingual="true" data-raw-label="' + filterHeadingRaw + '">' + filterHeadingText + '</h4>',
      '      </div>',
      '      <button type="button" class="filter-popover-close-btn" id="archive-filter-close-btn" aria-label="Đóng bộ lọc">✕</button>',
      '    </div>',
      '',
      '    <div class="filter-popover-body">',
      '      <div class="filter-popover-pills" id="filter-pills-list">',
      '        <!-- Dynamic Pills: Tất cả, Regular Labels, Feature @ Labels -->',
      '      </div>',
      '    </div>',
      '',
      '    <!-- Chân trang Popover -->',
      '    <div class="filter-popover-footer">',
      '      <button type="button" class="filter-popover-btn-reset" id="filter-popover-reset-btn" data-bilingual="true" data-raw-label="' + resetBtnRaw + '">' + resetBtnText + '</button>',
      '    </div>',
      '  </div>',
      '</div>',
      '',
      '<!-- Khung cây Dòng Thời Gian Đường Tàu -->',
      '<div id="archive-app-body" class="subway-tree-container" aria-live="polite">',
      '  <div class="archive-loading">',
      '    <div class="archive-spinner"></div>',
      '    <span>Đang đồng bộ tuyến đường thời gian...</span>',
      '  </div>',
      '</div>'
    ].join('\n');

    container.innerHTML = html;
  }

  // ── Kết nối thanh nhãn Chuyên mục dưới banner (.category-tabs-bar) ──
  function bindCategoryTabs(container) {
    if (window._categoryTabsBound) return;
    window._categoryTabsBound = true;

    document.addEventListener('click', function (e) {
      var pill = e.target.closest('.category-tabs-bar .tab-pill, #category-tabs-bar .tab-pill');
      if (!pill) return;

      // Chỉ can thiệp khi đang ở trang Dòng thời gian / Mục lục
      if (!isArchivePage()) return;

      var appEl = document.getElementById('editorial-archive-app');
      if (!appEl) return;

      // Chặn chuyển hướng trang chủ
      e.preventDefault();
      e.stopPropagation();

      var href = pill.getAttribute('href') || '';
      var rawLabel = (pill.getAttribute('data-raw-label') || pill.getAttribute('data-label') || pill.textContent || '').trim();
      var cleanLabel = rawLabel.replace(/^✦\s*/, '').trim();

      var isAll = href === '/' || href === (window.location.origin + '/') ||
                  cleanLabel.toLowerCase().indexOf('tất cả') !== -1 ||
                  cleanLabel.toLowerCase() === 'all';

      filterState.bannerCategory = isAll ? 'all' : cleanLabel;

      syncUrlParams();
      updateActiveCategoryTabs();
      applyFilterAndRender(appEl);
    }, true);
  }

  // ── Khởi động toàn bộ ứng dụng Mục Lục Đường Tàu ──
  function mountArchiveApp(targetEl) {
    var container = targetEl || document.getElementById('editorial-archive-app');
    if (!container) return;

    container.classList.add('editorial-archive-page');
    createArchiveStructure(container);
    parseUrlParams();
    bindArchiveEvents(container);
    bindCategoryTabs(container);
    updateActiveCategoryTabs();

    loadArchiveData(function () {
      applyFilterAndRender(container);
    });

    isAppMounted = true;
  }

  // ── Khởi chạy khi DOM sẵn sàng ──
  function init() {
    var appEl = document.getElementById('editorial-archive-app');
    if (appEl && (isArchivePage() || window.location.hash === '#archive' || appEl.offsetParent !== null)) {
      mountArchiveApp(appEl);
    }
  }

  // Export API toàn cục để preview.html hoặc router có thể gọi trực tiếp
  window.initArchivePage = function (targetEl) {
    mountArchiveApp(targetEl);
  };

  // Lắng nghe sự kiện đổi hash sang #archive
  window.addEventListener('hashchange', function () {
    if (window.location.hash === '#archive') {
      var appEl = document.getElementById('editorial-archive-app');
      if (appEl) mountArchiveApp(appEl);
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
