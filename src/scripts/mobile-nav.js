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
    var catBar = document.getElementById('category-tabs-bar') || document.querySelector('.category-tabs-bar');
    var catSection = document.getElementById('category-tabs-section');

    if (!catBar && catSection) {
      catBar = document.createElement('nav');
      catBar.className = 'category-tabs-bar';
      catBar.id = 'category-tabs-bar';
      catBar.setAttribute('aria-label', 'Lọc theo chủ đề');
      catBar.innerHTML = '<a class="tab-pill active" href="/" data-bilingual="true">✦ Tất cả | All</a>';
      catSection.appendChild(catBar);
    }
    if (!catBar) return;

    // 1. Dọn sạch các nhãn tính năng đặc biệt (@...) và nhãn minh bạch AI (ai:...)
    var existingPills = Array.from(catBar.querySelectorAll('.tab-pill'));
    var realLabelsCount = 0;
    var allPill = null;

    existingPills.forEach(function(pill) {
      var href = pill.getAttribute('href') || '';
      var label = (pill.getAttribute('data-label') || pill.textContent || '').trim();
      if (href === '/' || href === window.location.origin + '/' || label.startsWith('✦')) {
        allPill = pill;
        return;
      }
      if (label.startsWith('@') || label.toLowerCase().startsWith('ai:') || label.toUpperCase().startsWith('AI-')) {
        pill.remove();
        return;
      }
      realLabelsCount++;
    });

    if (!allPill) {
      allPill = document.createElement('a');
      allPill.className = 'tab-pill active';
      allPill.href = '/';
      allPill.setAttribute('data-bilingual', 'true');
      allPill.textContent = '✦ Tất cả | All';
      catBar.insertBefore(allPill, catBar.firstChild);
    }

    // 2. Nhận diện và gán class active cho tab tương ứng với URL hiện tại
    function updateActivePill() {
      var currentPath = window.location.pathname;
      var activeFound = false;
      if (currentPath.indexOf('/search/label/') !== -1) {
        var rawLabel = currentPath.split('/search/label/')[1].split('/')[0].split('?')[0];
        var currentLabel = decodeURIComponent(rawLabel).toLowerCase();
        catBar.querySelectorAll('.tab-pill').forEach(function(pill) {
          var pillHref = pill.getAttribute('href') || '';
          if (pillHref.indexOf('/search/label/') !== -1) {
            var pillRawLabel = pillHref.split('/search/label/')[1].split('/')[0].split('?')[0];
            var pillLabel = decodeURIComponent(pillRawLabel).toLowerCase();
            if (pillLabel === currentLabel) {
              pill.classList.add('active');
              activeFound = true;
            } else {
              pill.classList.remove('active');
            }
          } else {
            pill.classList.remove('active');
          }
        });
      }
      if (!activeFound && allPill) {
        allPill.classList.add('active');
      }
    }

    updateActivePill();

    // 3. Cơ chế đồng bộ tức thì: Nếu máy chủ Blogger chưa kịp kết xuất danh sách nhãn (0 nhãn)
    // tự động truy vấn Blogger Feed API để cập nhật chính xác nhãn từ các bài viết vừa đăng
    if (realLabelsCount === 0) {
      fetch('/feeds/posts/summary?alt=json&max-results=150')
        .then(function(res) {
          if (!res.ok) throw new Error('Network error');
          return res.json();
        })
        .then(function(data) {
          if (!data || !data.feed || !data.feed.category) return;
          var categories = data.feed.category;
          var added = 0;
          categories.forEach(function(cat) {
            var term = (cat.term || '').trim();
            if (!term) return;
            // Bỏ qua nhãn đặc biệt @ và nhãn AI
            if (term.startsWith('@') || term.toLowerCase().startsWith('ai:') || term.toUpperCase().startsWith('AI-')) {
              return;
            }
            // Tránh thêm trùng lặp
            var exists = false;
            catBar.querySelectorAll('.tab-pill').forEach(function(p) {
              var pLabel = p.getAttribute('data-label') || p.textContent.trim();
              if (pLabel.toLowerCase() === term.toLowerCase()) exists = true;
            });
            if (!exists) {
              var a = document.createElement('a');
              a.className = 'tab-pill';
              a.href = '/search/label/' + encodeURIComponent(term);
              a.setAttribute('data-label', term);
              a.setAttribute('data-bilingual', 'true');
              a.textContent = term;
              catBar.appendChild(a);
              added++;
            }
          });
          if (added > 0) {
            updateActivePill();
            if (window.applyBilingualElements) {
              window.applyBilingualElements(localStorage.getItem('user_lang') || 'vi');
            }
          }
        })
        .catch(function(err) {
          // Fallback an toàn nếu chạy local sandbox preview
          console.log('[CategoryTabs] Feed sync bypassed or offline:', err.message);
        });
    }

    if (window.applyBilingualElements) {
      window.applyBilingualElements(localStorage.getItem('user_lang') || 'vi');
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
