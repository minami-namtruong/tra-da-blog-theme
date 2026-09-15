/* ==========================================================================
   POST SERIES NAVIGATOR — LUXURY EDITORIAL EDITION (ROBUST V3)
   - Detects posts with 'series:[name]' label
   - Queries Blogger JSON Feed API for all parts with cache-buster
   - Stale-while-revalidate caching (invalidates if current post missing)
   - Robust URL/Slug pathname matching
   - Connected Vertical Journey Stepper (Timeline)
   - Active Illuminated Chapter Card & Next Chapter Spotlight
   - Populates window.SERIES_POST_URLS to deduplicate Related Posts
   - Localized (VI/EN)
   ========================================================================== */
(function() {
  'use strict';

  var SERIES_I18N = {
    vi: {
      seriesBadge: 'CHUYÊN ĐỀ',
      partLabel: 'Phần',
      progressText: 'Tiến trình:',
      completedRatio: 'hoàn thành',
      currentReading: 'Đang đọc',
      readStatus: 'Đã đọc',
      nextChapterBadge: 'Tiếp theo',
      upcomingBadge: 'Chưa đọc',
      nextKicker: 'Bài tiếp theo',
      prevKicker: 'Bài trước',
      completedSeriesMsg: 'Bạn đã hoàn thành tất cả các phần trong chuyên đề này.',
      viewRoadmap: 'Lộ trình ↓'
    },
    en: {
      seriesBadge: 'SERIES',
      partLabel: 'Part',
      progressText: 'Progress:',
      completedRatio: 'completed',
      currentReading: 'Reading Now',
      readStatus: 'Completed',
      nextChapterBadge: 'Next Up',
      upcomingBadge: 'Upcoming',
      nextKicker: 'Next Chapter',
      prevKicker: 'Previous',
      completedSeriesMsg: 'You have completed all parts of this series.',
      viewRoadmap: 'Roadmap ↓'
    }
  };

  function getLang() {
    return (typeof localStorage !== 'undefined' && localStorage.getItem('user_lang')) || 'vi';
  }

  function formatSeriesTitle(rawLabel) {
    if (!rawLabel) return '';
    var name = rawLabel.replace(/^series:\s*/i, '').trim();
    if (name.indexOf('-') > -1 && name.indexOf(' ') === -1) {
      name = name.split('-').map(function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join(' ');
    }
    return name;
  }

  function initPostSeries() {
    var pillContainer = document.getElementById('series-header-pill-container');
    var boxContainer = document.getElementById('series-roadmap-box-container');

    var seriesLabel = (pillContainer && pillContainer.getAttribute('data-series-label')) ||
                      (boxContainer && boxContainer.getAttribute('data-series-label')) || '';

    if (!seriesLabel) {
      var seriesEl = document.querySelector('[data-series-label]');
      if (seriesEl) seriesLabel = seriesEl.getAttribute('data-series-label');
    }

    if (!seriesLabel) {
      var rawLabels = document.querySelectorAll('.post-raw-label');
      rawLabels.forEach(function(lbl) {
        var txt = (lbl.innerText || lbl.textContent || '').trim();
        if (/^series:/i.test(txt)) {
          seriesLabel = txt;
        }
      });
    }

    if (!seriesLabel || !/^series:/i.test(seriesLabel)) {
      if (pillContainer) pillContainer.style.display = 'none';
      if (boxContainer) boxContainer.style.display = 'none';
      return;
    }

    var seriesTitle = formatSeriesTitle(seriesLabel);
    var currentUrl = window.location.href;
    var currentPath = window.location.pathname;

    // Use versioned cache key to discard old invalid caches
    var cacheKey = 'post_series_v3_' + encodeURIComponent(seriesLabel);
    var cachedData = null;
    try {
      var raw = sessionStorage.getItem(cacheKey);
      if (raw) cachedData = JSON.parse(raw);
    } catch(e) {}

    // Verify if cachedData actually contains the post we are currently reading
    var isCacheValid = false;
    if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
      for (var c = 0; c < cachedData.length; c++) {
        try {
          var cp = new URL(cachedData[c].url, window.location.origin).pathname;
          if (cp === currentPath || currentPath.indexOf(cp) > -1 || cp.indexOf(currentPath) > -1 || cachedData[c].url === currentUrl) {
            isCacheValid = true;
            break;
          }
        } catch(e) {}
      }
    }

    if (isCacheValid) {
      // 1. Render immediately from valid cache for 0ms CLS
      renderSeries(cachedData, seriesTitle, currentUrl, currentPath);
      // 2. Revalidate in background to pick up newly published parts
      fetchSeriesFeed(seriesLabel, seriesTitle, currentUrl, currentPath, cacheKey, true);
    } else {
      // Cache missing or invalid (does not contain current post) -> fetch immediately
      fetchSeriesFeed(seriesLabel, seriesTitle, currentUrl, currentPath, cacheKey, false);
    }
  }

  function fetchSeriesFeed(seriesLabel, seriesTitle, currentUrl, currentPath, cacheKey, isBackgroundRevalidate) {
    // If preview sandbox environment offline, do not crash but wire up pill click
    if (window.location.protocol === 'file:') {
      var pillTrigger = document.getElementById('series-pill-trigger');
      if (pillTrigger) {
        pillTrigger.addEventListener('click', function(e) {
          e.preventDefault();
          var target = document.getElementById('series-roadmap-box');
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            target.style.outline = '2px solid var(--primary)';
            setTimeout(function() { target.style.outline = 'none'; }, 2000);
          }
        });
      }
      return;
    }

    // Add cache buster timestamp to prevent stale browser disk cache
    var feedUrl = '/feeds/posts/summary/-/' + encodeURIComponent(seriesLabel) +
                  '?alt=json&max-results=50&_cb=' + Date.now();

    fetch(feedUrl, { cache: 'no-cache' })
      .then(function(res) {
        if (!res.ok) throw new Error('Failed to fetch series feed: ' + res.status);
        return res.json();
      })
      .then(function(data) {
        var entries = (data && data.feed && data.feed.entry) ? data.feed.entry : [];
        if (!entries.length) return;

        var posts = [];
        entries.forEach(function(entry) {
          var postUrl = '';
          if (entry.link) {
            for (var i = 0; i < entry.link.length; i++) {
              if (entry.link[i].rel === 'alternate') {
                postUrl = entry.link[i].href;
                break;
              }
            }
          }

          var title = entry.title ? (entry.title.$t || '') : '';
          var published = entry.published ? (entry.published.$t || '') : '';

          if (postUrl && title) {
            posts.push({
              title: title,
              url: postUrl,
              published: published
            });
          }
        });

        // Sort CHRONOLOGICALLY (oldest = Part 1)
        posts.sort(function(a, b) {
          return new Date(a.published) - new Date(b.published);
        });

        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(posts));
        } catch(e) {}

        renderSeries(posts, seriesTitle, currentUrl, currentPath);
      })
      .catch(function(err) {
        console.warn('Series feed error:', err);
      });
  }

  function renderSeries(posts, seriesTitle, currentUrl, currentPath) {
    if (!posts || !posts.length) return;

    // Register all series URLs globally so Related Posts can exclude them
    window.SERIES_POST_URLS = posts.map(function(p) { return p.url; });
    try {
      window.dispatchEvent(new CustomEvent('seriesLoaded', { detail: { urls: window.SERIES_POST_URLS } }));
    } catch(e) {}

    // Find active post index
    var activeIdx = -1;
    for (var i = 0; i < posts.length; i++) {
      var pUrl = posts[i].url;
      try {
        var pPath = new URL(pUrl, window.location.origin).pathname;
        if (pPath === currentPath || currentPath.endsWith(pPath) || pPath.endsWith(currentPath)) {
          activeIdx = i;
          break;
        }
      } catch(e) {
        if (pUrl === currentUrl || currentUrl.indexOf(pUrl) > -1) {
          activeIdx = i;
          break;
        }
      }
    }

    // Fallback: match by post title in document.title if pathname matching didn't catch
    if (activeIdx === -1) {
      var docTitle = document.title || '';
      for (var j = 0; j < posts.length; j++) {
        if (posts[j].title && docTitle.indexOf(posts[j].title.slice(0, 25)) > -1) {
          activeIdx = j;
          break;
        }
      }
    }

    if (activeIdx === -1) activeIdx = 0;

    var currentPartNum = activeIdx + 1;
    var totalParts = posts.length;
    var progressPct = Math.round((currentPartNum / totalParts) * 100);

    var lang = getLang();
    var i18n = SERIES_I18N[lang] || SERIES_I18N.vi;

    // 1. Render Top Pill
    var pillContainer = document.getElementById('series-header-pill-container');
    if (pillContainer) {
      pillContainer.style.display = 'block';
      pillContainer.innerHTML =
        '<div class="series-header-pill-wrapper">' +
          '<a href="#series-roadmap-box" class="series-header-pill" id="series-pill-trigger">' +
            '<span class="series-pill-kicker">' + i18n.seriesBadge + '</span>' +
            '<span class="series-pill-divider">/</span>' +
            '<span class="series-pill-title" data-bilingual="true">' + seriesTitle + '</span>' +
            '<span class="series-pill-badge">' + i18n.partLabel + ' ' + currentPartNum + '/' + totalParts + '</span>' +
            '<span class="series-pill-action">' + i18n.viewRoadmap + '</span>' +
          '</a>' +
        '</div>';

      var pillTrigger = document.getElementById('series-pill-trigger');
      if (pillTrigger) {
        pillTrigger.addEventListener('click', function(e) {
          e.preventDefault();
          var target = document.getElementById('series-roadmap-box');
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            target.style.outline = '2px solid var(--primary)';
            target.style.transition = 'outline 0.3s ease';
            setTimeout(function() { target.style.outline = 'none'; }, 2000);
          }
        });
      }
    }

    // 2. Render Bottom Roadmap Box
    var boxContainer = document.getElementById('series-roadmap-box-container');
    if (boxContainer) {
      boxContainer.style.display = 'block';

      var stepsHtml = '';
      posts.forEach(function(post, idx) {
        var partNum = ('0' + (idx + 1)).slice(-2);
        var isCurrent = (idx === activeIdx);
        var isRead = (idx < activeIdx);
        var isNext = (idx === activeIdx + 1);

        var itemClass = 'series-step-item';
        if (isCurrent) itemClass += ' is-active';
        if (isRead) itemClass += ' is-read';

        var badgeHtml = '';
        if (isCurrent) {
          badgeHtml = '<span class="series-step-badge badge-active"><span class="badge-dot"></span>' + i18n.currentReading + '</span>';
        } else if (isRead) {
          badgeHtml = '<span class="series-step-badge badge-read">✓ ' + i18n.readStatus + '</span>';
        } else if (isNext) {
          badgeHtml = '<span class="series-step-badge badge-next">' + i18n.nextChapterBadge + '</span>';
        } else {
          badgeHtml = '<span class="series-step-badge badge-upcoming">' + i18n.upcomingBadge + '</span>';
        }

        var nodeContent = isRead ? '✓' : partNum;
        var tag = isCurrent ? 'div' : 'a';
        var hrefAttr = isCurrent ? '' : ' href="' + post.url + '"';
        var cleanTitle = (post.title || '').replace(/"/g, '&quot;');

        stepsHtml +=
          '<' + tag + ' class="' + itemClass + '"' + hrefAttr + ' title="' + cleanTitle + '">' +
            '<div class="series-step-node">' + nodeContent + '</div>' +
            '<div class="series-step-content">' +
              '<span class="series-step-title" data-bilingual="true" title="' + cleanTitle + '">' + post.title + '</span>' +
              badgeHtml +
            '</div>' +
          '</' + tag + '>';
      });

      // Navigation Spotlight Cards
      var navHtml = '';
      var hasPrev = (activeIdx > 0);
      var hasNext = (activeIdx < posts.length - 1);

      if (hasPrev || hasNext) {
        var navClass = 'series-nav-spotlight';
        if (hasPrev && !hasNext) navClass += ' only-prev';
        if (!hasPrev && hasNext) navClass += ' only-next';

        navHtml += '<div class="' + navClass + '">';

        if (hasPrev) {
          var prevPost = posts[activeIdx - 1];
          var cleanPrevTitle = (prevPost.title || '').replace(/"/g, '&quot;');
          navHtml +=
            '<a class="series-nav-card series-nav-prev" href="' + prevPost.url + '" title="' + cleanPrevTitle + '">' +
              '<span class="series-nav-kicker">← ' + i18n.prevKicker + '</span>' +
              '<span class="series-nav-title" data-bilingual="true" title="' + cleanPrevTitle + '">' + prevPost.title + '</span>' +
            '</a>';
        }

        if (hasNext) {
          var nextPost = posts[activeIdx + 1];
          var cleanNextTitle = (nextPost.title || '').replace(/"/g, '&quot;');
          navHtml +=
            '<a class="series-nav-card series-nav-next" href="' + nextPost.url + '" title="' + cleanNextTitle + '">' +
              '<div class="series-nav-next-content">' +
                '<span class="series-nav-kicker">' + i18n.nextKicker + ' →</span>' +
                '<span class="series-nav-title" data-bilingual="true" title="' + cleanNextTitle + '">' + nextPost.title + '</span>' +
              '</div>' +
              '<div class="series-nav-arrow-bubble">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>' +
              '</div>' +
            '</a>';
        }

        navHtml += '</div>';
      } else if (posts.length > 1 && activeIdx === posts.length - 1) {
        navHtml = '<div class="series-completed-msg"><span>🏆</span> ' + i18n.completedSeriesMsg + '</div>';
      }

      boxContainer.innerHTML =
        '<div class="series-roadmap-box" id="series-roadmap-box">' +
          '<div class="series-box-header">' +
            '<div class="series-box-top-row">' +
              '<div class="series-box-kicker-group">' +
                '<span class="series-box-icon">✦</span>' +
                '<span class="series-box-kicker">' + i18n.seriesBadge + '</span>' +
              '</div>' +
              '<div class="series-box-progress-pill">' +
                '<span class="series-progress-count">' + currentPartNum + ' / ' + totalParts + '</span>' +
                '<span class="series-progress-label">' + i18n.completedRatio + '</span>' +
              '</div>' +
            '</div>' +
            '<h4 class="series-box-title" data-bilingual="true">' + seriesTitle + '</h4>' +
            '<div class="series-progress-track">' +
              '<div class="series-progress-fill" style="width: ' + progressPct + '%;"></div>' +
            '</div>' +
          '</div>' +
          '<div class="series-steps-list">' + stepsHtml + '</div>' +
          navHtml +
        '</div>';
    }

    if (window.applyBilingualElements) {
      window.applyBilingualElements();
    }
  }

  window.addEventListener('languageChanged', function() {
    initPostSeries();
  });

  document.addEventListener('DOMContentLoaded', initPostSeries);
})();
