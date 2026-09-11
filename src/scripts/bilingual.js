/* ==========================================
   IN-POST & THEME BILINGUAL SWITCHER (UNIFIED ORCHESTRATOR)
   - Switches VI / EN content blocks
   - Parses "VI | EN" syntax in menus, widgets
   - Translates static dictionary terms
   - Saves preference to localStorage
   - Emits languageChanged event for Auto-TOC re-render
   ========================================== */
(function() {
  'use strict';

  var STORAGE_KEY = 'user_lang';

  const CORE_I18N = {
    vi: {
      searchPlaceholder: 'Tìm kiếm bài viết...',
      readingTime: 'phút đọc',
      tableOfContents: 'Mục Lục Bài Viết',
      previousPost: '« Bài trước',
      nextPost: 'Bài sau »',
      shareTitle: 'Chia sẻ bài viết:',
      copiedLink: 'Đã sao chép liên kết!',
      aboutAuthor: 'Về Tác Giả',
      buyMeACoffee: 'Mời tôi ly cà phê',
      newsletterTitle: 'Nhận bài viết mới',
      newsletterDesc: 'Nhận thông báo khi có bài viết mới qua email.',
      subscribeBtn: 'Đăng Ký',
      olderPosts: 'Cũ hơn »',
      newsletterSubDesc: 'Đăng ký để nhận thông báo khi có bài viết mới. Không spam, chỉ nội dung chất lượng.',
      backToTop: '↑ Lên đầu trang',
      copyrightSuffix: 'Tất cả quyền được bảo lưu.',
      aiDisclosureDetails: 'Xem chi tiết',
    },
    en: {
      searchPlaceholder: 'Search articles...',
      readingTime: 'min read',
      tableOfContents: 'Table of Contents',
      previousPost: '« Previous Post',
      nextPost: 'Next Post »',
      shareTitle: 'Share this post:',
      copiedLink: 'Link copied to clipboard!',
      aboutAuthor: 'About The Author',
      buyMeACoffee: 'Buy me a coffee',
      newsletterTitle: 'Newsletter',
      newsletterDesc: 'Get thoughtful articles delivered to your inbox.',
      subscribeBtn: 'Subscribe',
      olderPosts: 'Older Posts »',
      newsletterSubDesc: 'Subscribe to get notified of new articles. No spam, only quality content.',
      backToTop: '↑ Back to top',
      copyrightSuffix: 'All rights reserved.',
      aiDisclosureDetails: 'Details',
    }
  };

  function initBilingual() {
    // Restore preferred language from localStorage
    var preferred = localStorage.getItem(STORAGE_KEY) || 'vi';
    applyLanguage(preferred, false);
  }

  function applyBilingualElements(lang) {
    // Bộ chọn toàn bộ các phần tử hỗ trợ cú pháp VI | EN
    // Bao gồm: data-bilingual="true", badge thẻ bài, tab chủ đề, pill timeline, breadcrumbs (spec §4.2.A)
    const targets = document.querySelectorAll(
      '[data-bilingual="true"], .post-badge, .tab-pill, .archive-post-cat-pill, .breadcrumbs a'
    );
  
    targets.forEach(el => {
      // 1. Lưu lại nội dung gốc ban đầu
      if (el.dataset.rawText === undefined) {
        el.dataset.rawText = el.textContent.trim();
      }
  
      const raw = el.dataset.rawText;
  
      // 2. Nếu có chứa dấu phân cách "|"
      if (raw.includes('|')) {
        const parts = raw.split('|').map(s => s.trim());
        el.textContent = (lang === 'en' ? parts[1] : parts[0]) || parts[0];
      } else {
        // Cơ chế An toàn (Graceful Fallback)
        el.textContent = raw;
      }
    });
  }

  function applyLanguage(lang, save) {
    // 1. Update dropdown toggle text
    var flagEl = document.getElementById('current-lang-flag');
    var textEl = document.getElementById('current-lang-text');
    if (flagEl && textEl) {
      if (lang === 'en') {
        flagEl.textContent = '🇬🇧';
        textEl.textContent = 'EN';
      } else {
        flagEl.textContent = '🇻🇳';
        textEl.textContent = 'VI';
      }
    }
    
    // Close dropdown
    var dropdown = document.getElementById('lang-dropdown-menu');
    if (dropdown) {
      dropdown.classList.remove('show');
    }

    // 2. Toggle in-post bilingual content blocks
    var viContents = document.querySelectorAll("[data-lang='vi']");
    var enContents = document.querySelectorAll("[data-lang='en']");

    if (lang === 'en') {
      viContents.forEach(el => { el.style.display = 'none'; });
      enContents.forEach(el => { el.style.display = 'block'; });
    } else {
      enContents.forEach(el => { el.style.display = 'none'; });
      viContents.forEach(el => { el.style.display = 'block'; });
    }

    // 3. Apply VI | EN syntax parsing
    applyBilingualElements(lang);

    // 4. Translate static dictionary terms (optional, depending on where data-i18n is used in template)
    var i18nTargets = document.querySelectorAll('[data-i18n]');
    i18nTargets.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (CORE_I18N[lang] && CORE_I18N[lang][key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = CORE_I18N[lang][key];
        } else {
          el.textContent = CORE_I18N[lang][key];
        }
      }
    });

    // Save to localStorage
    if (save !== false) {
      try { localStorage.setItem(STORAGE_KEY, lang); } catch(e) {}
    }

    // Dispatch event to inform Auto TOC and others to update
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));
  }

  // Global function called from inline onclick
  window.setLanguage = function(lang) {
    applyLanguage(lang, true);
  };
  
  // Legacy support for switchLanguage
  window.switchLanguage = window.setLanguage;

  // Close dropdown when clicking outside
  document.addEventListener('click', function(event) {
    var toggleBtn = document.getElementById('lang-toggle-btn');
    var dropdown = document.getElementById('lang-dropdown-menu');
    if (toggleBtn && dropdown) {
      if (!toggleBtn.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.remove('show');
      }
    }
  });

  document.addEventListener('DOMContentLoaded', initBilingual);
})();
