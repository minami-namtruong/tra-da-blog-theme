/**
 * FOOTER SCRIPTS — Modular Footer (FEAT-MODULAR-FOOTER-V3)
 * - Scroll-to-top button
 * - Guaranteed fallback menus (Chính Sách, Mạng Xã Hội, Menu Đáy) matching preview.html
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

  function ensureFooterMenus() {
    // 1. Cột 2: Chính Sách & Minh Bạch
    var legalSection = document.getElementById('footer-legal-section');
    if (legalSection) {
      var hasLinks = legalSection.querySelector('.footer-links li');
      if (!hasLinks) {
        var existingContent = legalSection.querySelector('.footer-col-legal');
        var legalHtml = '<div class="footer-col-legal">' +
          '<h4 class="footer-col-title" data-bilingual="true">⚖️ Chính Sách &amp; Minh Bạch | Policies &amp; Transparency</h4>' +
          '<ul class="footer-links">' +
            '<li><a href="/p/chinh-sach-bao-mat.html"><span data-bilingual="true">Chính sách bảo mật | Privacy Policy</span></a></li>' +
            '<li><a href="/p/dieu-khoan.html"><span data-bilingual="true">Điều khoản dịch vụ | Terms of Service</span></a></li>' +
            '<li><a href="/p/ai-transparency.html"><span data-bilingual="true">Minh bạch nội dung AI | AI Transparency</span></a></li>' +
            '<li><a href="/p/lien-he.html"><span data-bilingual="true">Liên hệ &amp; Hợp tác | Contact &amp; Collab</span></a></li>' +
          '</ul>' +
        '</div>';
        if (existingContent) {
          existingContent.outerHTML = legalHtml;
        } else {
          legalSection.innerHTML = legalHtml;
        }
      }
    }

    // 2. Cột 3: Mạng Xã Hội
    var newsletterSection = document.getElementById('footer-newsletter-section');
    if (newsletterSection && !newsletterSection.querySelector('.footer-social-grid a')) {
      var existingSocial = newsletterSection.querySelector('.footer-col-social');
      var socialHtml = '<div class="footer-col-social">' +
        '<div class="footer-social-grid">' +
          '<a class="footer-social-icon" href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook">FB</a>' +
          '<a class="footer-social-icon" href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" title="X (Twitter)">𝕏</a>' +
          '<a class="footer-social-icon" href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">GH</a>' +
          '<a class="footer-social-icon" href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" title="YouTube">YT</a>' +
          '<a class="footer-social-icon" href="/feeds/posts/default" target="_blank" rel="noopener noreferrer" aria-label="RSS Feed" title="RSS Feed">RSS</a>' +
        '</div>' +
      '</div>';
      if (existingSocial) {
        existingSocial.outerHTML = socialHtml;
      } else {
        var div = document.createElement('div');
        div.innerHTML = socialHtml;
        newsletterSection.appendChild(div.firstElementChild);
      }
    }

    // 3. Tầng 2: Menu Đáy Trang
    var bottomNavSection = document.getElementById('footer-bottom-menu-section');
    if (bottomNavSection) {
      var hasBottomNav = bottomNavSection.querySelector('.footer-bottom-nav li');
      if (!hasBottomNav) {
        bottomNavSection.innerHTML = '<nav aria-label="Footer navigation">' +
          '<ul class="footer-bottom-nav">' +
            '<li><a href="/" data-bilingual="true">Trang Chủ | Home</a></li>' +
            '<li><a href="#profile-cover-section" data-bilingual="true">Về Tôi | About Me</a></li>' +
            '<li><a href="/p/lien-he.html" data-bilingual="true">Liên Hệ | Contact</a></li>' +
          '</ul>' +
        '</nav>';
      }
    }

    // Kích hoạt dịch song ngữ cho các menu vừa được khởi tạo
    if (window.applyBilingualElements) {
      var currentLang = localStorage.getItem('user_lang') || 'vi';
      window.applyBilingualElements(currentLang);
    }
  }

  function initFooter() {
    initScrollToTop();
    ensureFooterMenus();
  }

  document.addEventListener('DOMContentLoaded', initFooter);
})();
