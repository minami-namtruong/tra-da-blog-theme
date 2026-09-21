/**
 * CONTACT PAGE MODULE — OPEN_020
 * Logic tương tác trang Liên Hệ & Gửi Bài Viết (/p/lien-he.html)
 * - Tab toggle (Guest Post / General Contact)
 * - Client-side validation
 * - Honeypot anti-spam
 * - Multi-adapter submit (blogger / gas / formsubmit)
 * - UX: spinner, toast, auto-reset
 *
 * @spec 07_Doing_020_Guest_Author_And_Contact_Submission_Specification.md
 */
(function () {
  'use strict';

  // Chỉ khởi động khi có #editorial-contact-app
  document.addEventListener('DOMContentLoaded', function () {
    var app = document.getElementById('editorial-contact-app');
    if (!app) return;
    initContactPage(app);
  });

  function initContactPage(app) {
    var cfg = window.__CONTACT_CONFIG || {};

    // ── 0. Thay thế email hiển thị động ─────────────────────────────────
    var adminEmail = cfg.adminEmail || 'tradabanthesu@gmail.com';
    var emailLink = app.querySelector('.contact-direct-link');
    if (emailLink) {
      emailLink.href = 'mailto:' + adminEmail;
      emailLink.textContent = '✉️ ' + adminEmail;
    }

    // ── 1. Tab Toggle ───────────────────────────────────────────────────
    var tabBtns   = app.querySelectorAll('.contact-tab-btn');
    var formGuest = app.querySelector('#contact-form-guest');
    var formGeneral = app.querySelector('#contact-form-general');

    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        tabBtns.forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        var target = btn.dataset.tab;
        if (formGuest)   formGuest.style.display   = (target === 'guest')   ? 'block' : 'none';
        if (formGeneral) formGeneral.style.display  = (target === 'general') ? 'block' : 'none';
      });
    });

    // ── 2. Submit handler của form Guest Post ──────────────────────────
    if (formGuest) {
      formGuest.addEventListener('submit', function (e) {
        e.preventDefault();
        _handleSubmit(formGuest, 'guest_post');
      });
    }

    // ── 3. Submit handler của form General Contact ───────────────────
    if (formGeneral) {
      formGeneral.addEventListener('submit', function (e) {
        e.preventDefault();
        _handleSubmit(formGeneral, 'general');
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  function _handleSubmit(form, type) {
    // Honeypot check
    var honey = form.querySelector('input[name="_honey"]');
    if (honey && honey.value) {
      // Bot detected — giả vờ thành công
      _showToast('success', form);
      form.reset();
      return;
    }

    // Validation
    if (!_validate(form)) return;

    // Thu thập dữ liệu
    var data = _collectData(form, type);

    // Chọn adapter
    var cfg = window.__CONTACT_CONFIG || {};
    var adapter = cfg.adapter || 'blogger';

    _setLoading(form, true);

    if (adapter === 'gas' && cfg.gasWebhookUrl) {
      _submitGAS(cfg.gasWebhookUrl, data, form);
    } else if (adapter === 'formsubmit' && cfg.adminEmail) {
      _submitFormSubmit(cfg.adminEmail, data, form);
    } else {
      // Mặc định: Blogger native
      _submitBlogger(data, form);
    }
  }

  // ── Validation ──────────────────────────────────────────────────
  function _validate(form) {
    var valid = true;
    var required = form.querySelectorAll('[required]');
    required.forEach(function (field) {
      _clearError(field);
      var val = field.value.trim();
      if (!val) {
        _showError(field, 'Trường này không được để trống.');
        valid = false;
      } else if (field.type === 'email' && !_isValidEmail(val)) {
        _showError(field, 'Địa chỉ email không hợp lệ.');
        valid = false;
      }
    });
    if (!valid) {
      // Scroll đến lỗi đầu tiên
      var firstErr = form.querySelector('.contact-field-error');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return valid;
  }

  function _isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function _showError(field, msg) {
    field.classList.add('is-invalid');
    var err = field.parentNode.querySelector('.contact-field-error');
    if (!err) {
      err = document.createElement('span');
      err.className = 'contact-field-error';
      field.parentNode.appendChild(err);
    }
    err.textContent = msg;
  }

  function _clearError(field) {
    field.classList.remove('is-invalid');
    var err = field.parentNode.querySelector('.contact-field-error');
    if (err) err.remove();
  }

  // ── Thu thập dữ liệu từ form ────────────────────────────────────
  function _collectData(form, type) {
    var data = { type: type };
    var fields = form.querySelectorAll('input:not([type=hidden]):not([name=_honey]), textarea, select');
    fields.forEach(function (f) {
      if (f.name) data[f.name] = f.value.trim();
    });
    return data;
  }

  // ── Adapter A: Google Apps Script Webhook ────────────────────────
  function _submitGAS(url, data, form) {
    var params = new URLSearchParams();
    Object.keys(data).forEach(function (k) { params.append(k, data[k]); });

    fetch(url, {
      method: 'POST',
      mode: 'no-cors', // GAS yêu cầu no-cors khi gọi từ domain khác
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })
      .then(function () {
        _setLoading(form, false);
        _showToast('success', form);
        form.reset();
      })
      .catch(function () {
        _setLoading(form, false);
        _showToast('error', form);
      });
  }

  // ── Adapter B: Blogger Native ContactForm (Proxy Method) ─────────
  function _submitBlogger(data, form) {
    var isGuest = data.type === 'guest_post';
    var lines = [];
    if (isGuest) {
      lines.push('[Gửi Bài Viết]');
      if (data.post_title)   lines.push('✔ Tiêu đề: '    + data.post_title);
      if (data.content)      lines.push('✔ Bản thảo/Link:\n' + data.content);
      if (data.author_bio)   lines.push('✔ Bio: '           + data.author_bio);
      if (data.author_avatar) lines.push('✔ Avatar URL: '   + data.author_avatar);
      if (data.author_social) lines.push('✔ Social/Web: '   + data.author_social);
    } else {
      lines.push('[Liên Hệ Thông Thường]');
      if (data.subject) lines.push('✔ Chủ đề: ' + data.subject);
      if (data.message) lines.push('✔ Nội dung:\n' + data.message);
    }
    var messageStr = lines.join('\n');
    var nameStr  = data.author_name || data.name || 'Anonymous';
    var emailStr = data.author_email || data.email || 'no-reply@blogger.com';

    // Tìm các trường ẩn của ContactForm1
    var nativeName = document.getElementById('ContactForm1_contact-form-name');
    var nativeEmail = document.getElementById('ContactForm1_contact-form-email');
    var nativeMessage = document.getElementById('ContactForm1_contact-form-email-message');
    var nativeSubmit = document.getElementById('ContactForm1_contact-form-submit');
    var nativeSuccess = document.getElementById('ContactForm1_contact-form-success-message');
    var nativeError = document.getElementById('ContactForm1_contact-form-error-message');

    if (!nativeName || !nativeSubmit) {
      alert('Không tìm thấy tiện ích ContactForm gốc của Blogger. Hãy đảm bảo bạn đã cài đặt mã mới nhất.');
      _setLoading(form, false);
      return;
    }

    // Gán dữ liệu
    nativeName.value = nameStr;
    nativeEmail.value = emailStr;
    nativeMessage.value = messageStr;

    // Reset thông báo cũ
    if (nativeSuccess) nativeSuccess.innerHTML = '';
    if (nativeError) nativeError.innerHTML = '';

    // Bấm nút gửi ảo
    nativeSubmit.click();

    // Dùng MutationObserver để theo dõi phản hồi từ server Blogger
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.target.innerHTML.trim() !== '') {
          observer.disconnect();
          _setLoading(form, false);
          if (mutation.target === nativeSuccess) {
            _showToast('success', form);
            form.reset();
          } else {
            _showToast('error', form);
          }
        }
      });
    });

    if (nativeSuccess) observer.observe(nativeSuccess, { childList: true, characterData: true, subtree: true });
    if (nativeError) observer.observe(nativeError, { childList: true, characterData: true, subtree: true });
    
    // Timeout phòng hờ (10s)
    setTimeout(function() {
      observer.disconnect();
      _setLoading(form, false);
    }, 10000);
  }

  // ── Adapter C: FormSubmit ──────────────────────────────────────
  function _submitFormSubmit(adminEmail, data, form) {
    var url = 'https://formsubmit.co/ajax/' + encodeURIComponent(adminEmail);
    var payload = {
      _subject: data.type === 'guest_post'
        ? '[Gửi Bài] ' + (data.post_title || data.author_name)
        : '[Liên Hệ] ' + (data.name || data.author_name),
      _captcha: 'false'
    };
    Object.keys(data).forEach(function (k) { payload[k] = data[k]; });

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        _setLoading(form, false);
        console.log('FormSubmit response:', res);
        if (res && (res.success === 'true' || res.success === true || res.success === 'false' /* some edge cases? no wait */)) {
          // Note: sometimes formsubmit returns success=false if not activated?
          if (res.success === 'false' && res.message && res.message.includes('activate')) {
             alert('FormSubmit yêu cầu kích hoạt. Vui lòng kiểm tra email của bạn để kích hoạt form trước!');
             return;
          }
          if (res.success === 'true' || res.success === true) {
            _showToast('success', form);
            form.reset();
          } else {
            _showToast('error', form);
          }
        } else {
          _showToast('error', form);
        }
      })
      .catch(function (err) {
        console.error('FormSubmit error:', err);
        _setLoading(form, false);
        _showToast('error', form);
      });
  }

  // ── UX Helpers ──────────────────────────────────────────────────
  function _setLoading(form, isLoading) {
    var submitBtn = form.querySelector('[type="submit"]');
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    if (isLoading) {
      submitBtn.dataset.originalText = submitBtn.textContent;
      submitBtn.innerHTML = '<span class="contact-spinner"></span> Đang gửi...';
    } else {
      submitBtn.textContent = submitBtn.dataset.originalText || 'Gửi';
    }
  }

  function _showToast(type, form) {
    // Tìm hoặc tạo toast container
    var app = document.getElementById('editorial-contact-app');
    var toast = (app || document).querySelector('.contact-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'contact-toast';
      if (app) app.insertBefore(toast, app.firstChild);
      else document.body.appendChild(toast);
    }

    toast.className = 'contact-toast contact-toast--' + type + ' contact-toast--visible';
    toast.textContent = type === 'success'
      ? 'Cảm ơn bạn! Bài viết đã được gửi tới hòm thư ban biên tập. Chúng mình sẽ phản hồi qua email trong vòng 24–48 giờ.'
      : 'Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ trực tiếp qua email.';

    // Scroll lên đầu form
    toast.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Tự ẩn sau 8 giây
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(function () {
      toast.classList.remove('contact-toast--visible');
    }, 8000);
  }

})();
