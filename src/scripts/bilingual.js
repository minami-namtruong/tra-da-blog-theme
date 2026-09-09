/* ==========================================
   IN-POST BILINGUAL SWITCHER
   - Switches VI / EN content blocks
   - Saves preference to sessionStorage
   - Auto-hides switcher if no bilingual content
   - Emits languageChanged event for Auto-TOC re-render
   ========================================== */
(function() {
  'use strict';

  var SESSION_KEY = 'preferred_lang';

  function initBilingual() {
    var enContents = document.querySelectorAll("[data-lang='en']");
    var switcherWrapper = document.querySelector('.bilingual-switcher-wrapper');

    // If no English content blocks found, hide the switcher entirely
    if (!enContents.length) {
      if (switcherWrapper) switcherWrapper.style.display = 'none';
      return;
    }

    // Show the switcher
    if (switcherWrapper) switcherWrapper.classList.add('is-visible');

    // Restore preferred language from sessionStorage
    var preferred = sessionStorage.getItem(SESSION_KEY) || 'vi';
    applyLanguage(preferred, false);
  }

  function applyLanguage(lang, save) {
    var viContents = document.querySelectorAll("[data-lang='vi']");
    var enContents = document.querySelectorAll("[data-lang='en']");
    var viBtns = document.querySelectorAll('.lang-btn-vi');
    var enBtns = document.querySelectorAll('.lang-btn-en');

    if (lang === 'en') {
      viContents.forEach(function(el) { el.style.display = 'none'; });
      enContents.forEach(function(el) { el.style.display = ''; });
      viBtns.forEach(function(btn) { btn.classList.remove('active'); btn.setAttribute('aria-pressed', 'false'); });
      enBtns.forEach(function(btn) { btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true'); });
    } else {
      enContents.forEach(function(el) { el.style.display = 'none'; });
      viContents.forEach(function(el) { el.style.display = ''; });
      enBtns.forEach(function(btn) { btn.classList.remove('active'); btn.setAttribute('aria-pressed', 'false'); });
      viBtns.forEach(function(btn) { btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true'); });
    }

    if (save !== false) {
      try { sessionStorage.setItem(SESSION_KEY, lang); } catch(e) {}
    }

    // Dispatch event to inform Auto TOC to update
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));
  }

  // Global function called from inline onclick
  window.switchLanguage = function(lang) {
    applyLanguage(lang, true);
  };

  document.addEventListener('DOMContentLoaded', initBilingual);
})();
