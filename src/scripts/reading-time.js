/* ==========================================
   READING PROGRESS BAR & READING TIME
   ========================================== */
(function() {
  'use strict';

  // Reading Progress Bar (throttled for perf)
  var progressBar = null;
  var ticking = false;

  function updateProgress() {
    if (!progressBar) return;
    var winScroll = window.pageYOffset || document.documentElement.scrollTop;
    var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var pct = height > 0 ? Math.min(100, (winScroll / height) * 100) : 0;
    progressBar.style.width = pct + '%';
    ticking = false;
  }

  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });

  // Reading Time Calculator (Localized)
  function calcReadingTime() {
    var postBody = document.querySelector('.post-body');
    var readTimeEl = document.getElementById('reading-time-val');
    if (!postBody || !readTimeEl) return;

    var lang = (typeof localStorage !== 'undefined' && localStorage.getItem('user_lang')) || 'vi';
    var text = postBody.innerText || postBody.textContent || '';
    var words = text.trim().split(/\s+/).filter(function(w) { return w.length > 0; }).length;
    var minutes = Math.max(1, Math.ceil(words / 200));
    var unit = (lang === 'en') ? 'min read' : 'phút đọc';
    readTimeEl.innerText = minutes + ' ' + unit;
  }

  // Copy share link buttons
  function initCopyLink() {
    var copyBtns = document.querySelectorAll('#copy-link-btn, #quick-copy-link-btn, .btn-share-copy, .quick-share-copy');
    if (!copyBtns.length) return;
    copyBtns.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        var url = window.location.href;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(function() {
            showCopiedToast();
          }).catch(function() {
            fallbackCopy(url);
          });
        } else {
          fallbackCopy(url);
        }
      });
    });
  }

  // Share Dropdowns & Web Share API (Handles both Header and Bottom share buttons)
  function initShareDropdown() {
    var dropdowns = document.querySelectorAll('.post-share-dropdown');
    if (!dropdowns.length) return;

    dropdowns.forEach(function(wrapper) {
      var trigger = wrapper.querySelector('.post-share-trigger');
      var menu = wrapper.querySelector('.post-share-menu');
      if (!trigger || !menu) return;

      var nativeBtn = wrapper.querySelector('.share-menu-native');
      if (navigator.share && nativeBtn) {
        nativeBtn.style.display = 'flex';
        nativeBtn.addEventListener('click', function(e) {
          e.preventDefault();
          closeMenu();
          navigator.share({
            title: document.title,
            url: window.location.href
          }).catch(function() {});
        });
      }

      function toggleMenu(open) {
        var isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        var state = (typeof open === 'boolean') ? open : !isExpanded;
        if (state) {
          // Close other open dropdowns
          document.querySelectorAll('.post-share-dropdown').forEach(function(other) {
            if (other !== wrapper) {
              var ot = other.querySelector('.post-share-trigger');
              var om = other.querySelector('.post-share-menu');
              if (ot) ot.setAttribute('aria-expanded', 'false');
              if (om) om.classList.remove('show');
            }
          });
        }
        trigger.setAttribute('aria-expanded', state ? 'true' : 'false');
        if (state) {
          menu.classList.add('show');
        } else {
          menu.classList.remove('show');
        }
      }

      function closeMenu() {
        toggleMenu(false);
      }

      trigger.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
      });

      // Close when clicking outside
      document.addEventListener('click', function(e) {
        if (!wrapper.contains(e.target)) {
          closeMenu();
        }
      });

      // Close on Escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeMenu();
      });

      // Social share links popup window
      var socialLinks = menu.querySelectorAll('a.share-menu-item');
      socialLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
          var href = this.getAttribute('href');
          if (href && !href.startsWith('#')) {
            e.preventDefault();
            window.open(href, '_blank', 'width=600,height=500,menubar=no,toolbar=no');
            closeMenu();
          }
        });
      });

      // Close menu when clicking copy link
      var copyBtn = menu.querySelector('#quick-copy-link-btn, .quick-share-copy');
      if (copyBtn) {
        copyBtn.addEventListener('click', function() {
          closeMenu();
        });
      }
    });
  }

  // Auto-enhance Post Images: upscale Blogger CDN images & remove restrictive inline dimensions
  function enhancePostImages() {
    var postBody = document.querySelector('.post-body');
    if (!postBody) return;

    var images = postBody.querySelectorAll('img');
    images.forEach(function(img) {
      // 1. Remove fixed width/height HTML attributes and inline style constraints
      img.removeAttribute('width');
      img.removeAttribute('height');
      if (img.style.width) img.style.width = '';
      if (img.style.height) img.style.height = '';

      // 2. Upgrade resolution in Blogger/Google CDN URLs to full HD (s1600)
      var src = img.getAttribute('src');
      if (src && (src.includes('blogger.googleusercontent.com') || src.includes('.bp.blogspot.com') || src.includes('googleusercontent.com'))) {
        // Matches /s72-c/, /s320/, /s400/, /s640/, /s800/, /w320-h180/, etc.
        var newSrc = src.replace(/\/(s(72|120|200|320|400|640|800|1024|1200)(-[a-z0-9]+)?|w[0-9]+-h[0-9]+(-[a-z0-9]+)?)\//i, '/s1600/');
        if (newSrc !== src) {
          img.src = newSrc;
        }
      }

      // 3. Ensure parent link/separator does not clip or restrict image
      var parent = img.parentElement;
      if (parent && (parent.classList.contains('separator') || parent.tagName === 'A')) {
        parent.style.maxWidth = '100%';
        parent.style.display = 'block';
        if (parent.parentElement && parent.parentElement.classList.contains('separator')) {
          parent.parentElement.style.maxWidth = '100%';
          parent.parentElement.style.display = 'block';
        }
      }
    });
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch(e) {}
    document.body.removeChild(ta);
    showCopiedToast();
  }

  function showCopiedToast() {
    var existing = document.getElementById('copied-toast');
    if (existing) existing.remove();

    var lang = (typeof localStorage !== 'undefined' && localStorage.getItem('user_lang')) || 'vi';
    var toastMsg = (lang === 'en') ? '✅ Link copied to clipboard!' : '✅ Đã sao chép liên kết!';

    var toast = document.createElement('div');
    toast.id = 'copied-toast';
    toast.className = 'theme-floating-toast is-visible';
    toast.innerText = toastMsg;
    document.body.appendChild(toast);

    setTimeout(function() {
      toast.classList.remove('is-visible');
      setTimeout(function() { toast.remove(); }, 350);
    }, 2200);
  }

  // Newsletter Subscription Modal
  function initNewsletterModal() {
    var modal = document.getElementById('newsletter-modal');
    if (!modal) return;

    var closeBtn = document.getElementById('newsletter-modal-close');
    var form = document.getElementById('newsletter-modal-form');
    var emailInput = document.getElementById('newsletter-modal-email');
    var backdrop = document.getElementById('newsletter-modal-backdrop');

    function openModal() {
      modal.style.display = 'flex';
      requestAnimationFrame(function() {
        modal.classList.add('is-open');
        if (emailInput) emailInput.focus();
      });
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('is-open');
      setTimeout(function() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }, 250);
    }

    window.openNewsletterModal = openModal;
    window.closeNewsletterModal = closeModal;

    // Attach click event to all newsletter triggers across the page
    document.querySelectorAll('a[href="#newsletter"], .btn-subscribe, .btn-newsletter-trigger').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        openModal();
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });

    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!emailInput) return;
        var email = emailInput.value.trim();
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
          emailInput.style.borderColor = 'var(--danger)';
          emailInput.focus();
          setTimeout(function() { emailInput.style.borderColor = ''; }, 2500);
          return;
        }

        var submitBtn = form.querySelector('button[type="submit"]');
        var lang = (typeof localStorage !== 'undefined' && localStorage.getItem('user_lang')) || 'vi';
        var origText = submitBtn ? submitBtn.innerText : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerText = (lang === 'en') ? '✓ Subscribed!' : '✓ Đã Đăng Ký!';
          submitBtn.classList.add('theme-btn-success-state');
        }

        // Show toast
        var successMsg = (lang === 'en')
          ? '🎉 Thank you! You have subscribed to our newsletter.'
          : '🎉 Cảm ơn bạn! Đã đăng ký nhận bản tin thành công.';
        
        var toast = document.createElement('div');
        toast.className = 'theme-floating-toast theme-floating-toast--success is-visible';
        toast.innerText = successMsg;
        document.body.appendChild(toast);
        setTimeout(function() {
          toast.classList.remove('is-visible');
          setTimeout(function() { toast.remove(); }, 350);
        }, 3500);

        setTimeout(function() {
          closeModal();
          emailInput.value = '';
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = origText;
            submitBtn.classList.remove('theme-btn-success-state');
          }
        }, 1500);
      });
    }
  }

  // Scroll-to-top button
  function initScrollTop() {
    var btn = document.getElementById('scroll-top-btn');
    if (!btn) return;
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Dynamic Related Posts via Blogger JSON Feed API
  function initRelatedPosts() {
    var relSection = document.getElementById('related-posts-section');
    if (!relSection) return;
    var grid = document.getElementById('related-posts-grid');
    if (!grid) return;

    // In local preview where Blogger feed doesn't exist, preserve static cards if present
    if (window.location.protocol === 'file:' && grid.querySelector('.related-post-card')) return;

    var label = (relSection.getAttribute('data-label') || '').trim();
    var currentUrl = relSection.getAttribute('data-current-url') || window.location.href;
    var currentPath = '';
    try {
      currentPath = new URL(currentUrl, window.location.origin).pathname;
    } catch(e) {
      currentPath = window.location.pathname;
    }

    var lastEntries = null;

    var feedUrl = label
      ? '/feeds/posts/summary/-/' + encodeURIComponent(label) + '?alt=json&max-results=6&_cb=' + Date.now()
      : '/feeds/posts/summary?alt=json&max-results=6&_cb=' + Date.now();

    function renderPosts(entries) {
      if (!entries || !entries.length) {
        if (label) {
          // If category feed returned empty, fallback to recent posts
          label = '';
          fetchFeed('/feeds/posts/summary?alt=json&max-results=6&_cb=' + Date.now());
        } else {
          relSection.style.display = 'none';
        }
        return;
      }

      var validPosts = [];
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var postUrl = '';
        if (entry.link) {
          for (var j = 0; j < entry.link.length; j++) {
            if (entry.link[j].rel === 'alternate') {
              postUrl = entry.link[j].href;
              break;
            }
          }
        }

        // Avoid showing current post
        if (postUrl) {
          var entryPath = '';
          try {
            entryPath = new URL(postUrl, window.location.origin).pathname;
            if (entryPath === currentPath) continue;
          } catch(err) {
            if (postUrl === currentUrl) continue;
          }

          // Deduplicate: avoid showing posts that already belong to the active series
          if (window.SERIES_POST_URLS && window.SERIES_POST_URLS.length) {
            var isSeriesPost = false;
            for (var s = 0; s < window.SERIES_POST_URLS.length; s++) {
              var sUrl = window.SERIES_POST_URLS[s];
              if (sUrl === postUrl) { isSeriesPost = true; break; }
              try {
                if (entryPath && new URL(sUrl, window.location.origin).pathname === entryPath) {
                  isSeriesPost = true; break;
                }
              } catch(se) {}
            }
            if (isSeriesPost) continue;
          }
        }

        var title = entry.title ? (entry.title.$t || '') : '';
        var published = entry.published ? (entry.published.$t || '') : '';
        var dateStr = '';
        if (published) {
          try {
            var d = new Date(published);
            var day = ('0' + d.getDate()).slice(-2);
            var month = ('0' + (d.getMonth() + 1)).slice(-2);
            var year = d.getFullYear();
            dateStr = day + '/' + month + '/' + year;
          } catch(e) {
            dateStr = published.substring(0, 10);
          }
        }

        // Extract thumbnail and upgrade resolution
        var thumb = '';
        if (entry.media$thumbnail && entry.media$thumbnail.url) {
          thumb = entry.media$thumbnail.url;
          thumb = thumb.replace(/\/s72-c\//, '/w600-h360-c/')
                       .replace(/\/w72-h72-p-k-no-nu\//, '/w600-h360-c/')
                       .replace(/\/s1600-w[0-9]+-h[0-9]+-c\//, '/w600-h360-c/');
        } else if (entry.content && entry.content.$t) {
          var match = entry.content.$t.match(/<img[^>]+src=["']([^"']+)["']/i);
          if (match && match[1]) thumb = match[1];
        }

        validPosts.push({
          title: title,
          url: postUrl || '#',
          date: dateStr,
          thumb: thumb
        });

        if (validPosts.length >= 3) break;
      }

      if (validPosts.length === 0) {
        relSection.style.display = 'none';
        return;
      }

      grid.innerHTML = '';
      validPosts.forEach(function(item) {
        var card = document.createElement('a');
        card.className = 'related-post-card';
        card.href = item.url;

        var imgHtml = item.thumb
          ? '<img class="related-post-thumb" src="' + item.thumb + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy" decoding="async"/>'
          : '<div class="related-post-thumb-placeholder">📰</div>';

        card.innerHTML = imgHtml +
          '<span class="related-post-title" data-bilingual="true">' + item.title + '</span>' +
          '<span class="related-post-date">📅 ' + item.date + '</span>';

        grid.appendChild(card);
      });

      if (window.applyBilingualElements) {
        window.applyBilingualElements();
      }
    }

    function fetchFeed(url) {
      fetch(url, { cache: 'no-cache' })
        .then(function(res) {
          if (!res.ok) throw new Error('Network error');
          return res.json();
        })
        .then(function(data) {
          var entries = (data && data.feed && data.feed.entry) ? data.feed.entry : [];
          lastEntries = entries;
          renderPosts(entries);
        })
        .catch(function() {
          if (label) {
            label = '';
            fetch('/feeds/posts/summary?alt=json&max-results=6&_cb=' + Date.now(), { cache: 'no-cache' })
              .then(function(r) { return r.json(); })
              .then(function(d) {
                var entries = (d && d.feed && d.feed.entry) ? d.feed.entry : [];
                lastEntries = entries;
                renderPosts(entries);
              })
              .catch(function() {
                relSection.style.display = 'none';
              });
          } else {
            relSection.style.display = 'none';
          }
        });
    }

    // When series widget finishes loading, re-render related posts to ensure deduplication
    window.addEventListener('seriesLoaded', function() {
      if (lastEntries && lastEntries.length) {
        renderPosts(lastEntries);
      }
    });

    fetchFeed(feedUrl);
  }

  // Update on language changed
  window.addEventListener('languageChanged', function() {
    calcReadingTime();
  });

  document.addEventListener('DOMContentLoaded', function() {
    progressBar = document.querySelector('.reading-progress-bar');
    calcReadingTime();
    initCopyLink();
    initShareDropdown();
    initNewsletterModal();
    enhancePostImages();
    initScrollTop();
    initRelatedPosts();
  });
})();
