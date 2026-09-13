/* ==========================================
   MOBILE NAVIGATION - Hamburger + Drawer
   - Auto-syncs menu items from Desktop LinkList
   ========================================== */
(function() {
  'use strict';

  var hamburgerBtn = null;
  var navDrawer = null;
  var navDrawerBackdrop = null;
  var navDrawerClose = null;

  function ensureDesktopMenu() {
    var navWrapper = document.querySelector('.nav-menu-wrapper');
    var navMenu = document.querySelector('.nav-menu');
    if (!navMenu || !navMenu.children.length) {
      var headerInner = document.querySelector('.site-header .header-inner');
      if (headerInner) {
        if (!navWrapper) {
          navWrapper = document.createElement('nav');
          navWrapper.className = 'nav-menu-wrapper';
          navWrapper.id = 'nav-menu-wrapper';
          navWrapper.setAttribute('aria-label', 'Menu chính');
          var logoSection = document.querySelector('.site-header .brand-logo-section, .site-header .brand-logo');
          if (logoSection && logoSection.nextSibling) {
            headerInner.insertBefore(navWrapper, logoSection.nextSibling);
          } else {
            var headerActions = document.querySelector('.site-header .header-actions');
            if (headerActions) {
              headerInner.insertBefore(navWrapper, headerActions);
            } else {
              headerInner.appendChild(navWrapper);
            }
          }
        }
        navWrapper.innerHTML = '<ul class="nav-menu">' +
          '<li><a class="active" href="/" data-bilingual="true">Trang Chủ | Home</a></li>' +
          '<li><a href="/p/muc-luc.html" data-bilingual="true">Dòng Thời Gian | Timeline</a></li>' +
        '</ul>';
        // Kích hoạt dịch song ngữ cho menu vừa tạo nếu bilingual.js đã tải
        if (window.applyBilingualElements) {
          window.applyBilingualElements(localStorage.getItem('user_lang') || 'vi');
        }
      }
    }
  }

  function sanitizeLegacyMenu() {
    var menu = document.querySelector('.nav-menu');
    if (menu) {
      var text = menu.textContent;
      if (text.includes('Disclaimer') || text.includes('Privacy') || text.includes('Faq') || text.includes('Term')) {
        menu.innerHTML = '<li><a class="active" href="/" id="nav-home-btn" data-bilingual="true">Trang Chủ | Home</a></li>' +
          '<li><a href="/p/muc-luc.html" id="nav-timeline-btn" data-bilingual="true">Dòng Thời Gian | Timeline</a></li>';
        if (window.applyBilingualElements) {
          window.applyBilingualElements(localStorage.getItem('user_lang') || 'vi');
        }
      }
    }
  }

  function ensureCategoryTabs() {
    var catSection = document.getElementById('category-tabs-section');
    if (catSection && (!catSection.children.length || !catSection.querySelector('.category-tabs-bar, .tab-pill'))) {
      catSection.innerHTML = '<nav class="category-tabs-bar" id="category-tabs-bar" aria-label="Lọc theo chủ đề">' +
        '<a class="tab-pill active" href="/" data-bilingual="true">✦ Tất cả | All</a>' +
        '<a class="tab-pill" href="/search/label/G%C3%B3c%20Nh%C3%ACn%20%26%20T%C6%B0%20Duy" data-bilingual="true">Góc Nhìn &amp; Tư Duy | Perspectives</a>' +
        '<a class="tab-pill" href="/search/label/Tr%E1%BA%A3i%20Nghi%E1%BB%87m%20S%E1%BB%91ng" data-bilingual="true">Trải Nghiệm Sống | Life Stories</a>' +
        '<a class="tab-pill" href="/search/label/S%C3%A1ch%20%26%20C%C3%B4ng%20C%E1%BB%A5" data-bilingual="true">Sách &amp; Công Cụ | Books &amp; Tools</a>' +
        '<a class="tab-pill" href="/search/label/Ph%C3%A1t%20Tri%E1%BB%83n%20B%E1%BA%A3n%20Th%C3%A2n" data-bilingual="true">Phát Triển Bản Thân | Self Development</a>' +
        '<a class="tab-pill" href="/search/label/C%C3%B4ng%20Ngh%E1%BB%87%20%26%20AI" data-bilingual="true">Công Nghệ &amp; AI | Tech &amp; AI</a>' +
      '</nav>';
      if (window.applyBilingualElements) {
        window.applyBilingualElements(localStorage.getItem('user_lang') || 'vi');
      }
    }
  }

  function formatDropdownMenus() {
    var menu = document.getElementById('nav-desktop-menu');
    if (!menu) return;
    var items = Array.from(menu.children);
    var currentParent = null;
    var currentDropdown = null;

    items.forEach(function(li) {
      var a = li.querySelector('a');
      if (!a) return;
      var text = a.textContent.trim();
      if ((text.startsWith('_') || text.startsWith('-')) && currentParent) {
        a.textContent = text.substring(1).trim();
        if (!currentDropdown) {
          currentParent.classList.add('has-dropdown');
          currentDropdown = document.createElement('ul');
          currentDropdown.className = 'dropdown-menu';
          currentParent.appendChild(currentDropdown);
        }
        currentDropdown.appendChild(li);
      } else {
        currentParent = li;
        currentDropdown = null;
      }
    });
  }

  function syncDrawerMenu() {
    ensureDesktopMenu();
    formatDropdownMenus();
    var desktopMenu = document.querySelector('.nav-menu');
    var drawerMenu = document.querySelector('.nav-drawer-menu');
    if (desktopMenu && drawerMenu && !drawerMenu.children.length) {
      drawerMenu.innerHTML = desktopMenu.innerHTML;
    }
  }

  function syncDrawerLogo() {
    var headerLogoImg = document.querySelector('.site-header .brand-logo img.brand-logo-img');
    var drawerLogo = document.querySelector('.nav-drawer-header .brand-logo');
    if (headerLogoImg && drawerLogo) {
      drawerLogo.innerHTML = headerLogoImg.outerHTML;
    }
  }

  function initMobileNav() {
    hamburgerBtn = document.getElementById('hamburger-btn');
    navDrawer = document.getElementById('nav-drawer');
    navDrawerBackdrop = document.getElementById('nav-drawer-backdrop');
    navDrawerClose = document.getElementById('nav-drawer-close');

    ensureDesktopMenu();
    sanitizeLegacyMenu();
    ensureCategoryTabs();
    syncDrawerMenu();
    syncDrawerLogo();

    if (!hamburgerBtn || !navDrawer) return;

    hamburgerBtn.addEventListener('click', openDrawer);
    if (navDrawerClose) navDrawerClose.addEventListener('click', closeDrawer);
    if (navDrawerBackdrop) navDrawerBackdrop.addEventListener('click', closeDrawer);

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  function openDrawer() {
    if (!navDrawer) return;
    navDrawer.classList.add('is-open');
    if (navDrawerBackdrop) navDrawerBackdrop.classList.add('is-open');
    if (hamburgerBtn) hamburgerBtn.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (!navDrawer) return;
    navDrawer.classList.remove('is-open');
    if (navDrawerBackdrop) navDrawerBackdrop.classList.remove('is-open');
    if (hamburgerBtn) hamburgerBtn.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // Close drawer on window resize to desktop
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) closeDrawer();
  });

  document.addEventListener('DOMContentLoaded', initMobileNav);
})();
