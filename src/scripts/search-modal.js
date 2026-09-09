/* ==========================================
   SEARCH MODAL
   ========================================== */
(function() {
  'use strict';

  var searchOverlay = null;
  var searchInput = null;
  var searchOpenBtn = null;
  var searchCloseBtn = null;
  var searchForm = null;

  function initSearchModal() {
    searchOverlay = document.getElementById('search-modal-overlay');
    searchInput = document.getElementById('search-input');
    searchOpenBtn = document.getElementById('search-open-btn');
    searchCloseBtn = document.getElementById('search-close-btn');
    searchForm = document.getElementById('search-form');

    if (!searchOverlay) return;

    if (searchOpenBtn) {
      searchOpenBtn.addEventListener('click', openSearch);
    }
    if (searchCloseBtn) {
      searchCloseBtn.addEventListener('click', closeSearch);
    }
    // Close on backdrop click
    searchOverlay.addEventListener('click', function(e) {
      if (e.target === searchOverlay) closeSearch();
    });
    // Close on Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeSearch();
    });
    // Handle form submit → Blogger search
    if (searchForm) {
      searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var query = searchInput ? searchInput.value.trim() : '';
        if (query) {
          window.location.href = '/search?q=' + encodeURIComponent(query);
        }
      });
    }
  }

  function openSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    // Focus input after animation
    setTimeout(function() {
      if (searchInput) searchInput.focus();
    }, 200);
  }

  function closeSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  document.addEventListener('DOMContentLoaded', initSearchModal);
})();
