/* ==========================================
   AUTO TABLE OF CONTENTS (TOC) GENERATOR
   - Extracts visible h2, h3 from .post-body
   - Supports bilingual content filtering & sync
   - Collapsible with toggle button
   - Smooth scroll to section on click
   - Highlights active section during scroll
   ========================================== */
(function() {
  'use strict';

  var tocContainer = null;
  var isCollapsed = false;
  var observer = null;

  function getVisibleHeadings() {
    var postBody = document.querySelector('.post-body');
    if (!postBody) return [];

    var allHeadings = postBody.querySelectorAll('h2, h3');
    var visibleHeadings = [];

    allHeadings.forEach(function(heading) {
      var parent = heading.parentElement;
      var isHidden = false;
      while (parent && parent !== postBody) {
        if (parent.style.display === 'none' || (parent.hasAttribute('data-lang') && parent.style.display === 'none')) {
          isHidden = true;
          break;
        }
        parent = parent.parentElement;
      }
      if (!isHidden) {
        visibleHeadings.push(heading);
      }
    });

    return visibleHeadings;
  }

  function initTOC() {
    var postBody = document.querySelector('.post-body');
    tocContainer = document.getElementById('auto-toc');
    if (!postBody || !tocContainer) return;

    var headings = getVisibleHeadings();
    if (headings.length < 2) {
      tocContainer.style.display = 'none';
      return;
    }
    tocContainer.style.display = '';

    // Assign IDs to headings
    headings.forEach(function(heading, idx) {
      if (!heading.id) {
        var slug = heading.innerText
          .toLowerCase()
          .replace(/[^a-z0-9À-ɏḀ-ỿ\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        heading.id = slug || ('heading-' + idx);
      }
    });

    // Detect language for title
    var isEn = document.querySelector('.lang-btn-en.active') !== null;
    var tocTitleText = isEn ? '📑 Table of Contents' : '📑 Mục Lục Bài Viết';

    // Build TOC HTML
    var html = '<div class="toc-title" onclick="toggleTocList()" role="button" tabindex="0">' +
               '<span>' + tocTitleText + '</span>' +
               '<span class="toc-toggle-icon" id="toc-toggle-icon">' + (isCollapsed ? '▼' : '▲') + '</span>' +
               '</div>' +
               '<ul class="toc-list" id="toc-list-items"' + (isCollapsed ? ' style="display:none;"' : '') + '>';

    headings.forEach(function(heading) {
      var tagClass = heading.tagName.toLowerCase() === 'h3' ? 'toc-h3' : 'toc-h2';
      html += '<li class="' + tagClass + '">' +
              '<a href="#' + heading.id + '" onclick="scrollToSection(event, \'' + heading.id + '\')">' +
              heading.innerText + '</a></li>';
    });

    html += '</ul>';
    tocContainer.innerHTML = html;

    // Keyboard accessibility for TOC title
    var tocTitle = tocContainer.querySelector('.toc-title');
    if (tocTitle) {
      tocTitle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') toggleTocList();
      });
    }

    // Activate IntersectionObserver for highlight
    initTOCObserver(headings);
  }

  // Toggle open/collapse
  window.toggleTocList = function() {
    var list = document.getElementById('toc-list-items');
    var icon = document.getElementById('toc-toggle-icon');
    if (!list) return;
    isCollapsed = !isCollapsed;
    list.style.display = isCollapsed ? 'none' : '';
    if (icon) icon.innerText = isCollapsed ? '▼' : '▲';
  };

  // Smooth scroll to heading
  window.scrollToSection = function(e, id) {
    e.preventDefault();
    var target = document.getElementById(id);
    if (!target) return;
    var offset = 80; // header height + gap
    var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: top, behavior: 'smooth' });
    if (history.replaceState) {
      history.replaceState(null, null, '#' + id);
    }
  };

  // Highlight active TOC item on scroll
  function initTOCObserver(headings) {
    if (!('IntersectionObserver' in window)) return;
    if (observer) observer.disconnect();

    var activeId = null;

    observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          activeId = entry.target.id;
        }
      });

      if (activeId) {
        var links = document.querySelectorAll('.toc-list a');
        links.forEach(function(link) {
          if (link.getAttribute('href') === '#' + activeId) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    }, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0
    });

    headings.forEach(function(heading) {
      observer.observe(heading);
    });
  }

  // Re-generate TOC on language change
  window.addEventListener('languageChanged', function() {
    initTOC();
  });

  document.addEventListener('DOMContentLoaded', initTOC);
})();
