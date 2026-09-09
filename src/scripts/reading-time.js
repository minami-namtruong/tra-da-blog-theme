/* ==========================================
   READING PROGRESS BAR & READING TIME
   ========================================== */
(function() {
  'use strict';

  // Reading Progress Bar (throttled for perf)
  var progressBar = null;
  var ticking = false;

  function updateProgress() {
    if (!progressBar) return;
    var winScroll = window.pageYOffset || document.documentElement.scrollTop;
    var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var pct = height > 0 ? Math.min(100, (winScroll / height) * 100) : 0;
    progressBar.style.width = pct + '%';
    ticking = false;
  }

  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });

  // Reading Time Calculator
  function calcReadingTime() {
    var postBody = document.querySelector('.post-body');
    var readTimeEl = document.getElementById('reading-time-val');
    if (!postBody || !readTimeEl) return;

    var text = postBody.innerText || postBody.textContent || '';
    var words = text.trim().split(/\s+/).filter(function(w) { return w.length > 0; }).length;
    // ~200 wpm for Vietnamese readers
    var minutes = Math.max(1, Math.ceil(words / 200));
    readTimeEl.innerText = minutes + ' phút đọc';
  }

  // Copy share link button
  function initCopyLink() {
    var copyBtn = document.getElementById('copy-link-btn');
    if (!copyBtn) return;
    copyBtn.addEventListener('click', function() {
      var url = window.location.href;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function() {
          showCopiedToast();
        }).catch(function() {
          fallbackCopy(url);
        });
      } else {
        fallbackCopy(url);
      }
    });
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch(e) {}
    document.body.removeChild(ta);
    showCopiedToast();
  }

  function showCopiedToast() {
    var existing = document.getElementById('copied-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.id = 'copied-toast';
    toast.innerText = '✅ Đã sao chép link!';
    toast.style.cssText = [
      'position: fixed',
      'bottom: 1.5rem',
      'left: 50%',
      'transform: translateX(-50%)',
      'background: #0f172a',
      'color: #fff',
      'padding: 0.65rem 1.35rem',
      'border-radius: 9999px',
      'font-size: 0.88rem',
      'font-weight: 600',
      'z-index: 9999',
      'box-shadow: 0 4px 20px rgba(0,0,0,0.3)',
      'animation: fadeInUp 0.3s ease'
    ].join(';');

    // Inject keyframe once
    if (!document.getElementById('toast-keyframe')) {
      var style = document.createElement('style');
      style.id = 'toast-keyframe';
      style.textContent = '@keyframes fadeInUp { from { opacity:0; transform: translateX(-50%) translateY(10px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }';
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);
    setTimeout(function() {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(function() { toast.remove(); }, 350);
    }, 2200);
  }

  // Scroll-to-top button
  function initScrollTop() {
    var btn = document.getElementById('scroll-top-btn');
    if (!btn) return;
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    progressBar = document.querySelector('.reading-progress-bar');
    calcReadingTime();
    initCopyLink();
    initScrollTop();
  });
})();
