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
      tableOfContents: '📑 Mục Lục Bài Viết',
      previousPost: '« Bài trước',
      nextPost: 'Bài sau »',
      newerPostTitle: 'Bài viết mới hơn',
      olderPostTitle: 'Bài viết cũ hơn',
      shareBtn: 'Chia sẻ',
      shareTitle: 'Chia sẻ bài viết:',
      sharePrompt: 'Thấy bài viết hữu ích? Hãy chia sẻ cùng bạn bè:',
      copyLink: 'Sao chép liên kết',
      copyLinkBtn: '🔗 Sao chép link',
      copiedLink: '✅ Đã sao chép liên kết!',
      moreOptions: 'Thêm tùy chọn...',
      breadcrumbHome: '🏠 Trang chủ',
      relatedPosts: '📚 Bài Viết Liên Quan',
      commentsTitle: '💬 Bình Luận',
      aboutAuthor: 'Về tác giả',
      authorBioDesc: 'Tôi viết về hành trình khám phá bản thân, trải nghiệm sống chân thực và những công cụ tư duy giúp tôi sống có ý nghĩa hơn mỗi ngày. Nếu bài viết này có ích với bạn, hãy mua tôi một ly cà phê nhé!',
      buyMeACoffee: '☕ Mời tôi ly cà phê',
      subscribeNewsletter: '💌 Đăng ký bản tin',
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
      tableOfContents: '📑 Table of Contents',
      previousPost: '« Previous Post',
      nextPost: 'Next Post »',
      newerPostTitle: 'Newer Article',
      olderPostTitle: 'Older Article',
      shareBtn: 'Share',
      shareTitle: 'Share this post:',
      sharePrompt: 'Enjoyed this article? Share it with friends:',
      copyLink: 'Copy Link',
      copyLinkBtn: '🔗 Copy link',
      copiedLink: '✅ Link copied to clipboard!',
      moreOptions: 'More options...',
      breadcrumbHome: '🏠 Home',
      relatedPosts: '📚 Related Articles',
      commentsTitle: '💬 Comments',
      aboutAuthor: 'About the author',
      authorBioDesc: 'I write about self-discovery, mindful living, and mental models to live more purposefully. If you find my work helpful, consider buying me a coffee!',
      buyMeACoffee: '☕ Buy me a coffee',
      subscribeNewsletter: '💌 Newsletter',
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

  function parseBilingualText(rawText, lang) {
    if (!rawText) return '';
    lang = lang || (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) || 'vi';
    if (rawText.includes('|')) {
      var parts = rawText.split('|').map(function(s) { return s.trim(); });
      return (lang === 'en' ? parts[1] : parts[0]) || parts[0];
    }
    return rawText.trim();
  }
  window.parseBilingualText = parseBilingualText;

  function localizeDates(lang) {
    var timeEls = document.querySelectorAll('time[datetime]');
    timeEls.forEach(function(el) {
      var iso = el.getAttribute('datetime');
      if (!iso) return;
      try {
        var d = new Date(iso);
        if (isNaN(d.getTime())) return;
        if (lang === 'en') {
          el.textContent = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } else {
          el.textContent = d.getDate() + ' tháng ' + (d.getMonth() + 1) + ', ' + d.getFullYear();
        }
      } catch (e) {}
    });
  }

  function applyBilingualElements(lang) {
    lang = lang || (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) || 'vi';
    // Bộ chọn toàn bộ các phần tử hỗ trợ cú pháp VI | EN
    // Bao gồm: data-bilingual="true", badge thẻ bài, tab chủ đề, pill timeline, breadcrumbs, footer
    const targets = document.querySelectorAll(
      '[data-bilingual="true"], [data-raw-label], .post-badge, .tab-pill, .archive-post-cat-pill, .breadcrumbs a, .breadcrumb-category-link, .footer-copyright, .footer-copyright a, .footer-bottom-nav a, .footer-links a'
    );
  
    targets.forEach(function(el) {
      // Bỏ qua thẻ cha .footer-copyright nếu bên trong đã có thẻ link <a> để không xoá mất link
      if (el.classList.contains('footer-copyright') && el.querySelector('a')) {
        return;
      }

      // 1. Lấy nội dung gốc chứa cú pháp VI | EN
      var raw = el.getAttribute('data-raw-label') || el.dataset.rawText;
      if (!raw) {
        var currentTxt = el.textContent.trim();
        if (currentTxt.includes('|')) {
          raw = currentTxt;
          el.setAttribute('data-raw-label', raw);
          el.dataset.rawText = raw;
        }
      }
  
      // 2. Nếu có nội dung gốc chứa dấu phân cách "|"
      if (raw && raw.includes('|')) {
        el.textContent = parseBilingualText(raw, lang);
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

    // 2. Toggle in-post bilingual content blocks (if bilingual blocks exist)
    var viContents = document.querySelectorAll("[data-lang='vi'], [lang='vi'], .lang-vi");
    var enContents = document.querySelectorAll("[data-lang='en'], [lang='en'], .lang-en");

    if (lang === 'en') {
      if (enContents.length > 0) {
        viContents.forEach(el => { el.style.display = 'none'; });
        enContents.forEach(el => { el.style.display = 'block'; });
      }
    } else {
      if (enContents.length > 0) {
        enContents.forEach(el => { el.style.display = 'none'; });
      }
      viContents.forEach(el => { el.style.display = 'block'; });
    }

    // 3. Apply VI | EN syntax parsing
    applyBilingualElements(lang);

    // 4. Translate static dictionary terms
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

    // 5. Localize dates
    localizeDates(lang);

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
  window.applyBilingualElements = applyBilingualElements;

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
