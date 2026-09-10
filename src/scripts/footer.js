/**
 * FOOTER SCRIPTS — Modular Footer (FEAT-MODULAR-FOOTER-V3)
 * - Scroll-to-top button
 */
(function () {
  'use strict';

  function initScrollToTop() {
    var btn = document.getElementById('scroll-to-top');
    if (!btn) return;
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.addEventListener('DOMContentLoaded', initScrollToTop);
})();
