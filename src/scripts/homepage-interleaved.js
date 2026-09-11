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
    const configEl = document.getElementById('profile-custom-config');
    if (!configEl) return;

    const rawContent = configEl.innerHTML.trim();
    if (!rawContent) return;

    // Case 1: Người dùng dán nguyên khối HTML tùy chỉnh hoàn toàn
    if (configEl.querySelector('.profile-cover-section') || (rawContent.startsWith('<') && !rawContent.includes('banner:') && !rawContent.includes('avatar:'))) {
      const coverSection = document.getElementById('profile-cover-section');
      if (coverSection) {
        coverSection.outerHTML = rawContent;
      }
      return;
    }

    // Case 2: Người dùng dán link ảnh hoặc cú pháp ngắn
    const textOnly = configEl.textContent.trim();
    if (textOnly) {
      const coverWrapper = document.getElementById('cover-image-wrapper');
      const avatarImg = document.getElementById('profile-avatar-img');
      const bioEl = document.getElementById('profile-author-bio');
      const nameEl = document.getElementById('profile-author-name');

      // Nếu chỉ dán mỗi link ảnh (http...)
      if (/^https?:\/\/[^\s]+$/i.test(textOnly)) {
        if (coverWrapper) {
          coverWrapper.style.backgroundImage = `url("${textOnly}")`;
        }
      } else {
        // Cú pháp: banner: https://... | avatar: https://... | bio: ... | name: ...
        const parts = textOnly.split('|').map(s => s.trim());
        parts.forEach(part => {
          if (/^banner\s*:\s*(https?:\/\/[^\s]+)/i.test(part)) {
            const url = part.match(/^banner\s*:\s*(https?:\/\/[^\s]+)/i)[1];
            if (coverWrapper) coverWrapper.style.backgroundImage = `url("${url}")`;
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
            if (coverWrapper) coverWrapper.style.backgroundImage = `url("${part.trim()}")`;
          }
        });
      }
    }
  }

  function initHomepageInterleavedWidgets() {
    initProfileCoverSection();
    initAboveFeedSection();
    initInFeedInterleaving();
    initPrePaginationSection();
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
