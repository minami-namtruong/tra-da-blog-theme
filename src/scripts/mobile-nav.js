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
      catBar.innerHTML = '<a class="tab-pill active" href="/" data-bilingual="true" data-raw-label="✦ Tất cả | All">✦ Tất cả | All</a>';
      catSection.appendChild(catBar);
    }
    if (!catBar) return;

    var currentLang = (typeof localStorage !== 'undefined' && localStorage.getItem('user_lang')) || 'vi';

    // Helper: Thêm hoặc chuẩn hóa một tab pill
    function addOrUpdateTab(rawTerm, url) {
      var term = (rawTerm || '').trim();
      if (!term) return;
      // Bỏ qua nhãn tính năng (@...) và nhãn AI (ai:...)
      if (term.startsWith('@') || term.toLowerCase().startsWith('ai:') || term.toUpperCase().startsWith('AI-')) {
        return;
      }

      var targetHref = url || ('/search/label/' + encodeURIComponent(term));
      
      // Kiểm tra xem đã có tab với nhãn này chưa
      var existingPill = null;
      catBar.querySelectorAll('.tab-pill').forEach(function(p) {
        var pRaw = p.getAttribute('data-raw-label') || p.getAttribute('data-label') || p.textContent.trim();
        var pHref = p.getAttribute('href') || '';
        if (pRaw.toLowerCase() === term.toLowerCase() || 
            (pHref && targetHref && pHref.split('/search/label/')[1] === targetHref.split('/search/label/')[1])) {
          existingPill = p;
        }
      });

      var displayText = window.parseBilingualText ? window.parseBilingualText(term, currentLang) : term.split('|')[0].trim();

      if (existingPill) {
        existingPill.setAttribute('data-raw-label', term);
        existingPill.setAttribute('data-bilingual', 'true');
        existingPill.textContent = displayText;
      } else {
        var a = document.createElement('a');
        a.className = 'tab-pill';
        a.href = targetHref;
        a.setAttribute('data-raw-label', term);
        a.setAttribute('data-bilingual', 'true');
        a.textContent = displayText;
        catBar.appendChild(a);
      }
    }

    // 1. Dọn sạch các nhãn tính năng đặc biệt (@...) và nhãn AI có sẵn từ server
    var existingPills = Array.from(catBar.querySelectorAll('.tab-pill'));
    var allPill = null;

    existingPills.forEach(function(pill) {
      var href = pill.getAttribute('href') || '';
      var label = (pill.getAttribute('data-raw-label') || pill.getAttribute('data-label') || pill.textContent || '').trim();
      
      if (href === '/' || href === window.location.origin + '/' || label.startsWith('✦')) {
        allPill = pill;
        pill.setAttribute('data-raw-label', '✦ Tất cả | All');
        pill.setAttribute('data-bilingual', 'true');
        pill.textContent = window.parseBilingualText ? window.parseBilingualText('✦ Tất cả | All', currentLang) : '✦ Tất cả';
        return;
      }

      if (label.startsWith('@') || label.toLowerCase().startsWith('ai:') || label.toUpperCase().startsWith('AI-')) {
        pill.remove();
        return;
      }

      pill.setAttribute('data-raw-label', label);
      pill.setAttribute('data-bilingual', 'true');
      pill.textContent = window.parseBilingualText ? window.parseBilingualText(label, currentLang) : label.split('|')[0].trim();
    });

    if (!allPill) {
      allPill = document.createElement('a');
      allPill.className = 'tab-pill active';
      allPill.href = '/';
      allPill.setAttribute('data-raw-label', '✦ Tất cả | All');
      allPill.setAttribute('data-bilingual', 'true');
      allPill.textContent = window.parseBilingualText ? window.parseBilingualText('✦ Tất cả | All', currentLang) : '✦ Tất cả';
      catBar.insertBefore(allPill, catBar.firstChild);
    }

    // 2. Thu thập nhãn tức thì từ các thẻ bài viết đang có trên trang (0ms lag, không phụ thuộc API)
    document.querySelectorAll('.post-raw-label').forEach(function(lblEl) {
      var name = lblEl.textContent.trim();
      var url = lblEl.getAttribute('data-url');
      addOrUpdateTab(name, url);
    });

    // 3. Nhận diện và gán class active cho tab tương ứng với URL hiện tại
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

    // 4. Đồng bộ thêm toàn bộ nhãn từ Blogger Feed API (quét cả feed.category và feed.entry[i].category)
    fetch('/feeds/posts/summary?alt=json&max-results=150')
      .then(function(res) {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then(function(data) {
        if (!data || !data.feed) return;
        var categories = [];
        
        // Quét feed-level categories
        if (data.feed.category && Array.isArray(data.feed.category)) {
          data.feed.category.forEach(function(c) {
            if (c && c.term) categories.push(c.term);
          });
        }
        // Quét entry-level categories (từng bài viết)
        if (data.feed.entry && Array.isArray(data.feed.entry)) {
          data.feed.entry.forEach(function(entry) {
            if (entry.category && Array.isArray(entry.category)) {
              entry.category.forEach(function(c) {
                if (c && c.term) categories.push(c.term);
              });
            }
          });
        }

        var addedCount = 0;
        categories.forEach(function(term) {
          addOrUpdateTab(term);
          addedCount++;
        });

        if (addedCount > 0) {
          updateActivePill();
          if (window.applyBilingualElements) {
            window.applyBilingualElements(currentLang);
          }
        }
      })
      .catch(function(err) {
        console.log('[CategoryTabs] Feed fetch bypassed:', err.message);
      });

    if (window.applyBilingualElements) {
      window.applyBilingualElements(currentLang);
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
