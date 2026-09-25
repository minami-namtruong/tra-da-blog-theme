/**
 * HOMEPAGE INTERLEAVED WIDGETS & MAIN FEED CONTROLLER
 * Feature: FEAT-HOMEPAGE-INTERLEAVED-WIDGETS-V1
 * 
 * Manages 3-tier main feed layout:
 * 1. Above Feed Hero (#main-above-feed) - Auto hides on Page 2+
 * 2. In-Feed Interleaved (#main-in-feed-section) - Auto-injects after post 3 (or data-insert-after)
 * 3. Pre-Pagination Action Zone (#main-pre-pagination-section) - Positioned immediately above .blog-pager
 */

(function () {
  'use strict';

  function initPostCardsProcessing() {
    var isHomepage = document.body.classList.contains('view-homepage');

    // 1. Xử lý các thẻ bài viết trên feed (Trang chủ / Danh mục)
    document.querySelectorAll('.post-card').forEach(function(card) {
      var rawLabels = card.querySelectorAll('.post-raw-label');
      if (rawLabels.length > 0) {
        var allFeatureAt = true;
        var firstNormalLabel = null;
        var detectedAiTypeContent = null;
        var detectedAiTypeProduct = null;
        var priority = ['ai:generated', 'ai:contributed', 'ai:assisted', 'ai:translated'];

        rawLabels.forEach(function(lblEl) {
          var name = lblEl.textContent.trim();
          var url = lblEl.getAttribute('data-url');
          if (name.startsWith('@')) {
            // Nhãn tính năng cho widget (@Quote, @Tiêu điểm, @Nổi bật, @Điểm tin)
          } else if (name.toLowerCase().startsWith('ai:') || name.toUpperCase().startsWith('AI-')) {
            // Nhãn AI minh bạch - KHÔNG tính là nhãn chuyên mục thường
            var t = name.toLowerCase().replace(/-/g, ':');
            if (t === 'ai:product') {
              detectedAiTypeProduct = t;
            } else {
              if (priority.indexOf(t) !== -1) {
                if (!detectedAiTypeContent || priority.indexOf(t) < priority.indexOf(detectedAiTypeContent)) {
                  detectedAiTypeContent = t;
                }
              }
            }
          } else if (name.toLowerCase().startsWith('series:')) {
            // Nhãn Series Navigator - Không dùng làm badge chuyên mục nhưng không phải nhãn ẩn @
            allFeatureAt = false;
          } else {
            allFeatureAt = false;
            if (!firstNormalLabel) firstNormalLabel = { name: name, url: url };
          }
        });

        // ══ QUY TẮC VÀNG: Ẩn bài viết "độc quyền @" khỏi Trang chủ ══
        // Bài viết chỉ có nhãn @ (và có thể kèm ai:) mà không có nhãn chuyên mục thường -> Ẩn khỏi Trang chủ
        if (allFeatureAt && !firstNormalLabel && isHomepage) {
          card.style.display = 'none';
          card.classList.add('is-exclusive-feature-hidden');
          return;
        }

        // Đảm bảo huy hiệu chuyên mục hiển thị sạch sẽ
        var badge = card.querySelector('.post-badge');
        if (badge) {
          var currentLang = (typeof localStorage !== 'undefined' && localStorage.getItem('user_lang')) || 'vi';
          if (firstNormalLabel) {
            badge.setAttribute('data-raw-label', firstNormalLabel.name);
            badge.setAttribute('data-bilingual', 'true');
            badge.textContent = window.parseBilingualText ? window.parseBilingualText(firstNormalLabel.name, currentLang) : firstNormalLabel.name.split('|')[0].trim();
            badge.href = firstNormalLabel.url;
            badge.style.display = '';
          } else {
            // Không có nhãn chuyên mục thường (chỉ có nhãn @ hoặc hệ thống) -> Ẩn badge để giao diện sạch sẽ
            badge.style.display = 'none';
          }
        }

        var detectedAiTypeArr = [];
        if (detectedAiTypeContent) detectedAiTypeArr.push(detectedAiTypeContent);
        if (detectedAiTypeProduct) detectedAiTypeArr.push(detectedAiTypeProduct);
        var detectedAiType = detectedAiTypeArr.length ? detectedAiTypeArr.join(',') : null;

        // Tự động gắn data-ai-type để ai-transparency.js kích hoạt badge
        if (detectedAiType) {
          card.setAttribute('data-ai-type', detectedAiType);
        }
      }

      // Trích xuất đoạn tóm tắt bài viết (Snippet) tự động nếu data:post.snippet rỗng
      var snippetEl = card.querySelector('.post-card-snippet');
      var bodySourceEl = card.querySelector('.post-body-snippet-source');
      var rawBodyText = '';
      if (bodySourceEl) {
        var viEl = bodySourceEl.querySelector('[data-lang="vi"]');
        var enEl = bodySourceEl.querySelector('[data-lang="en"]');
        
        // Cắt gọn một đoạn text (tối đa 140 ký tự)
        function truncateText(txt) {
          if (!txt) return '';
          txt = txt.replace(/\s+/g, ' ').trim();
          if (txt.length <= 140) return txt;
          var cut = txt.lastIndexOf(' ', 140);
          return txt.substring(0, cut === -1 ? 140 : cut) + '...';
        }

        if (viEl && enEl) {
          // Xử lý song ngữ dùng data-lang
          var viText = truncateText(viEl.textContent || viEl.innerText);
          var enText = truncateText(enEl.textContent || enEl.innerText);
          rawBodyText = viText + ' | ' + enText;
        } else {
          // Xử lý text thông thường hoặc dùng cú pháp "|" truyền thống
          rawBodyText = (bodySourceEl.textContent || bodySourceEl.innerText || '').replace(/\s+/g, ' ').trim();
          if (rawBodyText.indexOf('|') === -1) {
             rawBodyText = truncateText(rawBodyText);
          }
        }
      }

      // Luôn ghi đè snippet bằng rawBodyText (vì data:post.snippet của Blogger hay bị cụt chữ và làm hỏng cú pháp song ngữ)
      if (snippetEl && rawBodyText) {
        snippetEl.textContent = rawBodyText;
        snippetEl.setAttribute('data-bilingual', 'true');
        snippetEl.setAttribute('data-raw-label', rawBodyText);
        var currentLang = (typeof localStorage !== 'undefined' && localStorage.getItem('user_lang')) || 'vi';
        if (window.parseBilingualText) {
          snippetEl.textContent = window.parseBilingualText(rawBodyText, currentLang);
        } else {
          var parts = rawBodyText.split('|');
          snippetEl.textContent = currentLang === 'en' && parts.length > 1 ? parts[1].trim() : parts[0].trim();
        }
      }

      // Tính toán số phút đọc ước tính theo dung lượng từ thực tế
      var readTimeEl = card.querySelector('.read-time-est');
      if (readTimeEl && rawBodyText) {
        var words = rawBodyText.split(/\s+/).filter(Boolean).length;
        var mins = Math.max(1, Math.ceil(words / 200));
        var currentLang = (typeof localStorage !== 'undefined' && localStorage.getItem('user_lang')) || 'vi';
        readTimeEl.setAttribute('data-raw-label', mins + ' phút đọc | ' + mins + ' min read');
        readTimeEl.textContent = (currentLang === 'en') ? (mins + ' min read') : (mins + ' phút đọc');
      }

      if (bodySourceEl) {
        bodySourceEl.remove(); // Dọn dẹp DOM sạch sẽ sau khi bóc tách
      }
    });

    // 2. Xử lý trang chi tiết bài viết (Single Post View)
    var singleContainer = document.querySelector('.single-post-container');
    if (singleContainer) {
      var rawLabelsSingle = singleContainer.querySelectorAll('.post-raw-label');
      if (rawLabelsSingle.length > 0) {
        var normalLabelSingle = null;
        var aiTypeSingleContent = null;
        var aiTypeSingleProduct = null;
        var prioritySingle = ['ai:generated', 'ai:contributed', 'ai:assisted', 'ai:translated'];

        rawLabelsSingle.forEach(function(lblEl) {
          var name = lblEl.textContent.trim();
          var url = lblEl.getAttribute('data-url');
          if (name.startsWith('@')) {
            // bỏ qua
          } else if (name.toLowerCase().startsWith('ai:') || name.toUpperCase().startsWith('AI-')) {
            var t = name.toLowerCase().replace(/-/g, ':');
            if (t === 'ai:product') {
              aiTypeSingleProduct = t;
            } else {
              if (prioritySingle.indexOf(t) !== -1) {
                if (!aiTypeSingleContent || prioritySingle.indexOf(t) < prioritySingle.indexOf(aiTypeSingleContent)) {
                  aiTypeSingleContent = t;
                }
              }
            }
          } else if (name.toLowerCase().startsWith('series:')) {
            // bỏ qua không lấy làm breadcrumb chuyên mục
          } else {
            if (!normalLabelSingle) normalLabelSingle = { name: name, url: url };
          }
        });

        var breadcrumbCat = singleContainer.querySelector('.breadcrumb-category-link');
        if (breadcrumbCat) {
          var currentLang = (typeof localStorage !== 'undefined' && localStorage.getItem('user_lang')) || 'vi';
          if (normalLabelSingle) {
            breadcrumbCat.setAttribute('data-raw-label', normalLabelSingle.name);
            breadcrumbCat.setAttribute('data-bilingual', 'true');
            breadcrumbCat.textContent = window.parseBilingualText ? window.parseBilingualText(normalLabelSingle.name, currentLang) : normalLabelSingle.name.split('|')[0].trim();
            breadcrumbCat.href = normalLabelSingle.url;
          } else {
            breadcrumbCat.style.display = 'none';
            var nextSep = breadcrumbCat.nextElementSibling;
            if (nextSep && nextSep.classList.contains('separator')) nextSep.style.display = 'none';
          }
        }

        var aiTypeSingleArr = [];
        if (aiTypeSingleContent) aiTypeSingleArr.push(aiTypeSingleContent);
        if (aiTypeSingleProduct) aiTypeSingleArr.push(aiTypeSingleProduct);
        var aiTypeSingle = aiTypeSingleArr.length ? aiTypeSingleArr.join(',') : null;
        if (aiTypeSingle) {
          singleContainer.setAttribute('data-ai-type', aiTypeSingle);
        }
      }
    }
  }

  function initInFeedInterleaving() {
    const inFeedSection = document.getElementById('main-in-feed-section');
    if (!inFeedSection) return;

    // Loại bỏ widget thừa HTML99 / About Author nếu Blogger tự chèn vào inFeedSection
    const unwantedBio = inFeedSection.querySelectorAll('#HTML99, #hidden-author-bio-config');
    unwantedBio.forEach(el => el.remove());

    // 1. Kiểm tra xem có widget hoặc nội dung không
    const hasWidgets = inFeedSection.querySelectorAll('.widget, .special-posts-widget, .infeed-custom-content').length > 0 ||
                       (inFeedSection.children.length > 0 && inFeedSection.textContent.trim().length > 0);

    if (!hasWidgets) {
      inFeedSection.style.display = 'none';
      return;
    }

    // 2. Lấy danh sách các bài viết hiển thị (loại trừ các bài độc quyền @ đã ẩn)
    const feedContainer = document.getElementById('posts-feed-container') || document.querySelector('.posts-feed');
    if (!feedContainer) {
      inFeedSection.style.display = 'none';
      return;
    }

    const posts = Array.from(feedContainer.querySelectorAll('.post-card')).filter(function(card) {
      return card.style.display !== 'none';
    });
    if (!posts || posts.length === 0) {
      inFeedSection.style.display = 'none';
      return;
    }

    // 3. Xác định vị trí chèn (Mặc định: sau bài số 3 -> index 2)
    let insertAfterIndex = 2;
    const customConfigWidget = inFeedSection.querySelector('[data-insert-after]');
    if (customConfigWidget) {
      const customNum = parseInt(customConfigWidget.dataset.insertAfter, 10);
      if (!isNaN(customNum) && customNum > 0) {
        insertAfterIndex = customNum - 1;
      }
    }

    // Đảm bảo không vượt quá tổng số bài hiện có
    const targetIndex = Math.min(insertAfterIndex, posts.length - 1);

    // 4. Di chuyển mượt mà vào giữa luồng
    posts[targetIndex].after(inFeedSection);
    inFeedSection.classList.add('in-feed-active');
    inFeedSection.style.display = 'block';
  }

  function initPrePaginationSection() {
    const prePagination = document.getElementById('main-pre-pagination-section');
    if (!prePagination) return;

    // Kiểm tra widget / nội dung thực sự (loại trừ trường hợp widget rỗng hoặc chỉ có khoảng trắng / placeholder)
    const adSlot = prePagination.querySelector('.adsense-slot');
    const hasActiveAds = adSlot && adSlot.textContent.trim().length > 0 && !adSlot.textContent.includes('📣');
    const hasOtherWidgets = prePagination.querySelector('ins.adsbygoogle, iframe, script, img, form, .special-posts-widget, .newsletter-card, .pre-pagination-card');
    const hasTextContent = !adSlot && prePagination.children.length > 0 && prePagination.textContent.trim().length > 0;

    const hasWidgets = hasActiveAds || hasOtherWidgets || hasTextContent;

    if (!hasWidgets) {
      prePagination.style.display = 'none';
      return;
    }

    // Tìm nút phân trang blog-pager
    const blogPager = document.querySelector('.blog-pager');
    if (blogPager && blogPager.parentElement) {
      blogPager.before(prePagination);
      prePagination.style.display = 'block';
    } else {
      prePagination.style.display = 'block';
    }
  }

  function initAboveFeedSection() {
    const aboveFeed = document.getElementById('main-above-feed');
    if (!aboveFeed) return;

    // Kiểm tra nếu là trang chi tiết bài viết (Single Post) hoặc trang lưu trữ (Archive)
    const singlePostWrapper = document.getElementById('single-post-wrapper');
    const isSinglePost = document.body.classList.contains('view-single') ||
                         (singlePostWrapper && singlePostWrapper.style.display !== 'none');

    const archiveWrapper = document.getElementById('archive-page-wrapper');
    const isArchivePage = document.body.classList.contains('view-archive') ||
                          (archiveWrapper && archiveWrapper.style.display !== 'none');

    if (isSinglePost || isArchivePage) {
      aboveFeed.style.display = 'none';
      return;
    }

    // Kiểm tra nếu là Trang 2 trở đi (Page 2+)
    const urlParams = new URLSearchParams(window.location.search);
    const isPaged = urlParams.has('updated-max') ||
                    urlParams.get('page') === '2' ||
                    urlParams.get('paged') === '2' ||
                    document.body.classList.contains('is-paged') ||
                    document.body.classList.contains('view-paged');

    if (isPaged) {
      aboveFeed.style.display = 'none';
      return;
    }

    // Kiểm tra rỗng
    const hasWidgets = aboveFeed.querySelectorAll('.widget, .special-posts-widget, .hero-spotlight').length > 0 ||
                       (aboveFeed.children.length > 0 && aboveFeed.textContent.trim().length > 0);

    if (!hasWidgets) {
      aboveFeed.style.display = 'none';
      return;
    }

    aboveFeed.style.display = 'block';
  }

  function initProfileCoverSection() {
    const coverWrapper = document.getElementById('cover-image-wrapper');
    const avatarImg = document.getElementById('profile-avatar-img');
    const nameEl = document.getElementById('profile-author-name');
    const bioEl = document.getElementById('profile-author-bio');

    if (!coverWrapper) return;

    function syncSiteAvatars(avatarUrl) {
      if (!avatarUrl) return;
      document.querySelectorAll('.author-avatar-sm, .author-bio-avatar, .sidebar-about-avatar').forEach(function(img) {
        if (!img.src || img.src.includes('data:image') || img.src.includes('unsplash')) {
          img.src = avatarUrl;
        }
      });
    }

    // 1. Ảnh Banner tải lên trực tiếp từ máy tính qua widget Image1
    const uploadedBannerEl = document.getElementById('profile-uploaded-banner');
    if (uploadedBannerEl) {
      const bannerText = uploadedBannerEl.textContent.trim();
      if (/^https?:\/\/[^\s]+/i.test(bannerText)) {
        coverWrapper.style.backgroundImage = `url("${bannerText}")`;
      }
    }

    // 2. Ảnh Avatar tải lên trực tiếp từ máy tính qua widget Image2
    const uploadedAvatarEl = document.getElementById('profile-uploaded-avatar');
    if (uploadedAvatarEl) {
      const avatarText = uploadedAvatarEl.textContent.trim();
      if (/^https?:\/\/[^\s]+/i.test(avatarText)) {
        if (avatarImg) avatarImg.src = avatarText;
        try { localStorage.setItem('cached_author_avatar', avatarText); } catch(e){}
        syncSiteAvatars(avatarText);
      }
    }

    // Chỉ dùng Unsplash fallback khi ở môi trường Local Preview (preview.html hoặc localhost)
    const isLocalDev = window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalDev) {
      if (!coverWrapper.style.backgroundImage || coverWrapper.style.backgroundImage === 'none') {
        coverWrapper.style.backgroundImage = 'url("https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=1200&auto=format&fit=crop&q=80")';
      }
      if (avatarImg && (!avatarImg.src || avatarImg.src.includes('undefined') || avatarImg.src.startsWith('data:image'))) {
        avatarImg.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80';
      }
    }

    // 3. Đọc cấu hình tùy chỉnh từ ô Content của widget HTML1
    const configEl = document.getElementById('profile-custom-config');
    if (!configEl) return;

    // Chỉ thay thế toàn bộ component nếu người dùng dán NGUYÊN VẸN khối .profile-cover-section từ Preview
    if (configEl.querySelector('.profile-cover-section')) {
      const coverSection = document.getElementById('profile-cover-section');
      if (coverSection) {
        coverSection.outerHTML = configEl.querySelector('.profile-cover-section').outerHTML;
      }
      return;
    }

    // Nếu người dùng chèn ảnh qua nút "Chèn hình ảnh" của Blogger trong ô Content
    const inlineImgs = configEl.querySelectorAll('img');
    if (inlineImgs.length === 1) {
      if (inlineImgs[0].src && avatarImg) {
        avatarImg.src = inlineImgs[0].src;
        try { localStorage.setItem('cached_author_avatar', inlineImgs[0].src); } catch(e){}
        syncSiteAvatars(inlineImgs[0].src);
      }
    } else if (inlineImgs.length >= 2) {
      if (inlineImgs[0].src) coverWrapper.style.backgroundImage = `url("${inlineImgs[0].src}")`;
      if (inlineImgs[1].src && avatarImg) {
        avatarImg.src = inlineImgs[1].src;
        try { localStorage.setItem('cached_author_avatar', inlineImgs[1].src); } catch(e){}
        syncSiteAvatars(inlineImgs[1].src);
      }
    }

    const rawContent = configEl.innerHTML.trim();
    if (!rawContent) return;

    const textOnly = configEl.textContent.trim();
    if (textOnly) {
      // Nếu chỉ dán mỗi link ảnh http... (ưu tiên làm Banner)
      if (/^https?:\/\/[^\s]+$/i.test(textOnly)) {
        coverWrapper.style.backgroundImage = `url("${textOnly}")`;
      } else if (/(?:banner|avatar|bio|name)\s*:/i.test(textOnly)) {
        // Cú pháp tham số: banner: https://... | avatar: https://... | bio: ... | name: ...
        const parts = textOnly.split('|').map(s => s.trim());
        parts.forEach(part => {
          if (/^banner\s*:\s*(https?:\/\/[^\s]+)/i.test(part)) {
            const url = part.match(/^banner\s*:\s*(https?:\/\/[^\s]+)/i)[1];
            coverWrapper.style.backgroundImage = `url("${url}")`;
          } else if (/^avatar\s*:\s*(https?:\/\/[^\s]+)/i.test(part)) {
            const url = part.match(/^avatar\s*:\s*(https?:\/\/[^\s]+)/i)[1];
            if (avatarImg) avatarImg.src = url;
            try { localStorage.setItem('cached_author_avatar', url); } catch(e){}
            syncSiteAvatars(url);
          } else if (/^bio\s*:\s*(.+)/i.test(part)) {
            const bio = part.match(/^bio\s*:\s*(.+)/i)[1].trim();
            if (bioEl) bioEl.textContent = bio;
          } else if (/^name\s*:\s*(.+)/i.test(part)) {
            const name = part.match(/^name\s*:\s*(.+)/i)[1].trim();
            if (nameEl) nameEl.textContent = name;
          } else if (/^https?:\/\/[^\s]+/i.test(part)) {
            coverWrapper.style.backgroundImage = `url("${part.trim()}")`;
          }
        });
      } else {
        // Người dùng gõ văn bản tự nhiên (lời giới thiệu)
        // Nếu có nhiều dòng: dòng 1 < 40 ký tự và không có dấu chấm phẩy thì là Tên, phần sau là Bio
        const lines = textOnly.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const lang = (typeof localStorage !== 'undefined' && localStorage.getItem('user_lang')) || 'vi';
        const parseFn = window.parseBilingualText || (t => t);

        if (lines.length > 1 && lines[0].length < 40 && !/[.,;!?]$/.test(lines[0]) && !lines[0].includes('|')) {
          if (nameEl) {
            nameEl.setAttribute('data-raw-label', lines[0]);
            nameEl.textContent = parseFn(lines[0], lang);
          }
          if (bioEl) {
            const bioText = lines.slice(1).join('\n');
            bioEl.setAttribute('data-raw-label', bioText);
            bioEl.innerHTML = parseFn(bioText, lang).replace(/\n/g, '<br/>');
          }
        } else {
          // Toàn bộ là lời giới thiệu Bio
          if (bioEl) {
            bioEl.setAttribute('data-raw-label', textOnly);
            bioEl.innerHTML = parseFn(textOnly, lang).replace(/\n/g, '<br/>');
          }
        }
      }
    }
  }

  function showToast(msg) {
    var toast = document.getElementById('theme-toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'theme-toast-notification';
      toast.className = 'theme-floating-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function() {
      toast.classList.remove('is-visible');
    }, 3500);
  }

  function initNewsletterActions() {
    // 1. Cuộn mượt tới khung đăng ký bản tin khi bấm nút "Nhận Bản Tin"
    document.querySelectorAll('a[href="#newsletter"], .btn-subscribe').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.getElementById('newsletter') || document.querySelector('.pre-pagination-newsletter, .sidebar-widget, .footer-col-newsletter');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          var input = target.querySelector('input[type="email"]');
          if (input) {
            setTimeout(function() {
              input.focus();
              input.style.boxShadow = '0 0 0 3px rgba(var(--primary-rgb), 0.4)';
              setTimeout(function() { input.style.boxShadow = ''; }, 1600);
            }, 500);
          }
        }
      });
    });

    // 2. Xử lý sự kiện đăng ký bản tin (ở cả Feed, Sidebar và Footer)
    var forms = document.querySelectorAll('.pre-pagination-newsletter-form, .sidebar-newsletter-form, .newsletter-form');
    forms.forEach(function(form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var input = form.querySelector('input[type="email"]');
        var btn = form.querySelector('button[type="submit"], .pre-pagination-newsletter-btn, .sidebar-submit-btn, .btn-submit');
        if (!input) return;

        var email = input.value.trim();
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
          input.style.borderColor = 'var(--danger)';
          input.focus();
          showToast('⚠️ Vui lòng nhập địa chỉ email hợp lệ!');
          setTimeout(function() { input.style.borderColor = ''; }, 2500);
          return;
        }

        // Trạng thái thành công
        var origText = btn ? btn.innerHTML : '';
        if (btn) {
          btn.disabled = true;
          btn.innerHTML = '✓ Đã Đăng Ký!';
          btn.classList.add('theme-btn-success-state');
        }
        input.value = '';
        showToast('🎉 Cảm ơn bạn! Đã ghi nhận email đăng ký bản tin thành công.');

        setTimeout(function() {
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = origText;
            btn.classList.remove('theme-btn-success-state');
          }
        }, 4000);
      });
    });
  }

  /**
   * Đồng bộ tiêu đề trang Tìm kiếm / Nhãn:
   * 1. Đọc query param ?title= (truyền từ liên kết 'Xem tất cả' của widget)
   * 2. Fallback bảng tra cứu cho các nhãn kỹ thuật hệ thống (@quote, @tiêu điểm, @nổi bật, @điểm tin)
   * 3. Tự động áp dụng song ngữ VI/EN
   */
  function initSearchPageHeader() {
    var titleEl = document.getElementById('search-page-title');
    if (!titleEl) return;

    var params = new URLSearchParams(window.location.search);
    var customTitle = params.get('title');

    var rawLabel = (titleEl.getAttribute('data-raw-label') || titleEl.textContent || '').trim();
    var FEATURE_MAP = {
      '@quote': '☕ Góc Suy Ngẫm | ☕ Contemplation Corner',
      '@tiêu điểm': '🌟 Tiêu Điểm | Spotlight',
      '@tieu diem': '🌟 Tiêu Điểm | Spotlight',
      '@nổi bật': '🔥 Bài Viết Nổi Bật | Trending Posts',
      '@noi bat': '🔥 Bài Viết Nổi Bật | Trending Posts',
      '@điểm tin': '⚡ Điểm Tin Mỗi Ngày | Daily Digest',
      '@diem tin': '⚡ Điểm Tin Mỗi Ngày | Daily Digest'
    };

    var resolvedTitle = customTitle;
    if (!resolvedTitle && rawLabel) {
      var lower = rawLabel.toLowerCase();
      if (FEATURE_MAP[lower]) {
        resolvedTitle = FEATURE_MAP[lower];
      }
    }

    if (resolvedTitle) {
      var currentLang = (typeof localStorage !== 'undefined' && localStorage.getItem('user_lang')) || 'vi';
      titleEl.setAttribute('data-raw-label', resolvedTitle);
      titleEl.setAttribute('data-bilingual', 'true');
      titleEl.textContent = window.parseBilingualText ? window.parseBilingualText(resolvedTitle, currentLang) : resolvedTitle.split('|')[0].trim();

      try {
        var baseBlogTitle = document.title.split(/[-:|]/)[0].trim();
        var pageTitleText = resolvedTitle.split('|')[0].trim();
        document.title = pageTitleText + ' — ' + baseBlogTitle;
      } catch (e) {}
    }
  }

  function initInPostAds() {
    // 1. Kiểm tra vị trí đầu bài (In-Post Top)
    const topSlot = document.getElementById('post-ad-top-slot');
    if (topSlot) {
      const topSection = document.getElementById('post-ads-top-section');
      const globalConfig = document.getElementById('hidden-global-config');
      let customTopHtml = '';

      if (globalConfig) {
        const adTopEl = globalConfig.querySelector('.in-post-ads-config .ad-top-code');
        if (adTopEl && adTopEl.innerHTML.trim() && !adTopEl.innerHTML.includes('<!-- Mã quảng cáo đầu bài')) {
          customTopHtml = adTopEl.innerHTML.trim();
        }
      }

      if (customTopHtml) {
        topSlot.innerHTML = '<div class="adsense-slot adsense-top" aria-label="Quảng cáo">' + customTopHtml + '</div>';
      } else if (topSection) {
        const topWidget = topSection.querySelector('.widget, .adsense-slot');
        if (topWidget && (topWidget.textContent.trim().length > 0 || topWidget.children.length > 0)) {
          topSlot.appendChild(topWidget);
        }
      }
    }

    // 2. Kiểm tra vị trí cuối bài (In-Post Bottom)
    const bottomSlot = document.getElementById('post-ad-bottom-slot');
    if (bottomSlot) {
      const bottomSection = document.getElementById('post-ads-bottom-section');
      const globalConfig = document.getElementById('hidden-global-config');
      let customBottomHtml = '';

      if (globalConfig) {
        const adBottomEl = globalConfig.querySelector('.in-post-ads-config .ad-bottom-code');
        if (adBottomEl && adBottomEl.innerHTML.trim() && !adBottomEl.innerHTML.includes('<!-- Mã quảng cáo cuối bài')) {
          customBottomHtml = adBottomEl.innerHTML.trim();
        }
      }

      if (customBottomHtml) {
        topSlot && (bottomSlot.innerHTML = '<div class="adsense-slot adsense-bottom" aria-label="Quảng cáo">' + customBottomHtml + '</div>');
      } else if (bottomSection) {
        const bottomWidget = bottomSection.querySelector('.widget, .adsense-slot');
        if (bottomWidget && (bottomWidget.textContent.trim().length > 0 || bottomWidget.children.length > 0)) {
          bottomSlot.appendChild(bottomWidget);
        }
      }
    }

    // Luôn ẩn các section gốc nếu còn
    const topSection = document.getElementById('post-ads-top-section');
    if (topSection) topSection.style.display = 'none';
    const bottomSection = document.getElementById('post-ads-bottom-section');
    if (bottomSection) bottomSection.style.display = 'none';
  }

  function initHomepageInterleavedWidgets() {
    initPostCardsProcessing();
    initSearchPageHeader();
    initProfileCoverSection();
    initAboveFeedSection();
    initInFeedInterleaving();
    initPrePaginationSection();
    initInPostAds();
    initNewsletterActions();
    if (window.AITransparency && typeof window.AITransparency.reinject === 'function') {
      window.AITransparency.reinject();
    }
  }

  // Khởi chạy khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomepageInterleavedWidgets);
  } else {
    initHomepageInterleavedWidgets();
  }

  // Expose ra window để các module khác hoặc preview sandbox có thể kích hoạt lại khi chuyển view
  window.initHomepageInterleavedWidgets = initHomepageInterleavedWidgets;
})();
