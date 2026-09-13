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
