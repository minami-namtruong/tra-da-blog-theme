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

  function initInFeedInterleaving() {
    const inFeedSection = document.getElementById('main-in-feed-section');
    if (!inFeedSection) return;

    // 1. Kiểm tra xem có widget hoặc nội dung không
    const hasWidgets = inFeedSection.querySelectorAll('.widget, .special-posts-widget, .infeed-custom-content').length > 0 ||
                       (inFeedSection.children.length > 0 && inFeedSection.textContent.trim().length > 0);

    if (!hasWidgets) {
      inFeedSection.style.display = 'none';
      return;
    }

    // 2. Lấy danh sách các bài viết
    const feedContainer = document.getElementById('posts-feed-container') || document.querySelector('.posts-feed');
    if (!feedContainer) {
      inFeedSection.style.display = 'none';
      return;
    }

    const posts = feedContainer.querySelectorAll('.post-card');
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

    // Kiểm tra widget / nội dung
    const hasWidgets = prePagination.querySelectorAll('.widget, .special-posts-widget, .newsletter-card, .adsense-slot, .ads-banner, .pre-pagination-card').length > 0 ||
                       (prePagination.children.length > 0 && prePagination.textContent.trim().length > 0);

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
      if (/^https?:\/\/[^\s]+/i.test(avatarText) && avatarImg) {
        avatarImg.src = avatarText;
      }
    }

    // Đảm bảo Banner và Avatar luôn luôn có ảnh hiển thị (Zero Blank Banner)
    if (!coverWrapper.style.backgroundImage || coverWrapper.style.backgroundImage === 'none') {
      coverWrapper.style.backgroundImage = 'url("https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=1200&auto=format&fit=crop&q=80")';
    }
    if (avatarImg && (!avatarImg.src || avatarImg.src.includes('undefined'))) {
      avatarImg.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80';
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
      if (inlineImgs[0].src && avatarImg) avatarImg.src = inlineImgs[0].src;
    } else if (inlineImgs.length >= 2) {
      if (inlineImgs[0].src) coverWrapper.style.backgroundImage = `url("${inlineImgs[0].src}")`;
      if (inlineImgs[1].src && avatarImg) avatarImg.src = inlineImgs[1].src;
    }

    const rawContent = configEl.innerHTML.trim();
    if (!rawContent) return;

    const textOnly = configEl.textContent.trim();
    if (textOnly) {
      // Nếu chỉ dán mỗi link ảnh http... (ưu tiên làm Banner)
      if (/^https?:\/\/[^\s]+$/i.test(textOnly)) {
        coverWrapper.style.backgroundImage = `url("${textOnly}")`;
      } else if (textOnly.includes('|') || /(?:banner|avatar|bio|name)\s*:/i.test(textOnly)) {
        // Cú pháp tham số: banner: https://... | avatar: https://... | bio: ... | name: ...
        const parts = textOnly.split('|').map(s => s.trim());
        parts.forEach(part => {
          if (/^banner\s*:\s*(https?:\/\/[^\s]+)/i.test(part)) {
            const url = part.match(/^banner\s*:\s*(https?:\/\/[^\s]+)/i)[1];
            coverWrapper.style.backgroundImage = `url("${url}")`;
          } else if (/^avatar\s*:\s*(https?:\/\/[^\s]+)/i.test(part)) {
            const url = part.match(/^avatar\s*:\s*(https?:\/\/[^\s]+)/i)[1];
            if (avatarImg) avatarImg.src = url;
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
        if (lines.length > 1 && lines[0].length < 40 && !/[.,;!?]$/.test(lines[0])) {
          if (nameEl) nameEl.textContent = lines[0];
          if (bioEl) bioEl.innerHTML = lines.slice(1).join('<br/>');
        } else {
          // Toàn bộ là lời giới thiệu Bio
          if (bioEl) bioEl.textContent = textOnly;
        }
      }
    }
  }

  function showToast(msg) {
    var toast = document.getElementById('theme-toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'theme-toast-notification';
      toast.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:#0f172a;color:#fff;padding:0.85rem 1.4rem;border-radius:999px;font-size:0.92rem;font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,0.3);z-index:99999;transition:all 0.3s cubic-bezier(0.4,0,0.2,1);transform:translateY(20px);opacity:0;pointer-events:none;display:flex;align-items:center;gap:0.5rem;border:1px solid rgba(255,255,255,0.15);';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function() {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
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
              input.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.4)';
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
          input.style.borderColor = '#ef4444';
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
          btn.style.backgroundColor = '#10b981';
          btn.style.borderColor = '#10b981';
          btn.style.color = '#ffffff';
        }
        input.value = '';
        showToast('🎉 Cảm ơn bạn! Đã ghi nhận email đăng ký bản tin thành công.');

        setTimeout(function() {
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = origText;
            btn.style.backgroundColor = '';
            btn.style.borderColor = '';
            btn.style.color = '';
          }
        }, 4000);
      });
    });
  }

  function initHomepageInterleavedWidgets() {
    initProfileCoverSection();
    initAboveFeedSection();
    initInFeedInterleaving();
    initPrePaginationSection();
    initNewsletterActions();
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
