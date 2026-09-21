/**
 * GUEST AUTHOR ENGINE — OPEN_020
 * Phát hiện thẻ ẩn .guest-author-meta trong bài viết để override
 * author avatar/tên/bio/social links. Fallback về profile chủ blog.
 *
 * @spec 07_Doing_020_Guest_Author_And_Contact_Submission_Specification.md
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    // Chỉ chạy logic thay thế tác giả trên trang bài viết đơn
    var body = document.body;
    var isPostView = body.classList.contains('view-item') ||
      body.classList.contains('item-view') ||
      !!document.querySelector('.single-post-container');
    if (!isPostView) return;

    var metaEl = document.querySelector('.post-body .guest-author-meta');
    if (!metaEl) return; // Không có guest author → fallback (logic hiện tại chạy)

    var d = metaEl.dataset;
    var name     = d.authorName     || '';
    var role     = d.authorRole     || '';
    var avatar   = d.authorAvatar   || '';
    var bioVi    = d.authorBioVi    || '';
    var bioEn    = d.authorBioEn    || '';
    var website  = d.authorWebsite  || '';
    var facebook = d.authorFacebook || '';
    var twitter  = d.authorTwitter  || '';
    var linkedin = d.authorLinkedin || '';
    var email    = d.authorEmail    || '';

    if (!name) return; // Tên bắt buộc

    // ── 1. Tạo initials avatar fallback ──────────────────────────────
    function makeInitialsAvatar(nameStr) {
      var parts = nameStr.trim().split(/\s+/);
      var initials = parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : nameStr.slice(0, 2).toUpperCase();
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">' +
        '<rect width="80" height="80" rx="40" fill="#4f7cac"/>' +
        '<text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" ' +
        'font-family="Be Vietnam Pro,sans-serif" font-size="28" font-weight="700" fill="#fff">' +
        initials + '</text></svg>'
      );
    }
    var avatarSrc = avatar || makeInitialsAvatar(name);

    // ── 2. Override Post Header (.author-meta-inline) ─────────────────
    var inlineEl = document.querySelector('.author-meta-inline');
    if (inlineEl) {
      var smImg = inlineEl.querySelector('.author-avatar-sm');
      if (smImg) { smImg.src = avatarSrc; smImg.alt = name; }
      var nameEl = inlineEl.querySelector('[itemprop="name"]');
      if (nameEl) nameEl.textContent = name;
      if (!inlineEl.querySelector('.author-badge-guest')) {
        var metaText = inlineEl.querySelector('.author-meta-text');
        if (metaText) {
          var badge = document.createElement('span');
          badge.className = 'author-badge-guest';
          badge.setAttribute('data-bilingual', 'true');
          badge.textContent = 'Khách mời | Guest';
          metaText.insertBefore(badge, metaText.firstChild);
        }
      }
    }

    // ── 3. Override Author Bio Box (#post-author-bio-container) ────────
    var container = document.getElementById('post-author-bio-container');
    if (container) {
      var socialLinks = [
        { url: website,  icon: '🌐', label: 'Website'      },
        { url: facebook, icon: '📘', label: 'Facebook'     },
        { url: twitter,  icon: '✖',  label: 'X (Twitter)'  },
        { url: linkedin, icon: '💼', label: 'LinkedIn'      },
        { url: email,    icon: '✉️', label: 'Email'        },
      ];
      var socialHtml = socialLinks
        .filter(function (s) { return s.url; })
        .map(function (s) {
          return '<a class="author-social-btn" href="' + _esc(s.url) + '" ' +
            'target="_blank" rel="noopener noreferrer" ' +
            'title="' + _esc(s.label) + '" aria-label="' + _esc(s.label) + '">' +
            '<span class="social-icon-emoji">' + s.icon + '</span>' +
            '<span class="social-label">' + _esc(s.label) + '</span></a>';
        }).join('');

      container.innerHTML =
        '<img class="author-bio-avatar" alt="' + _esc(name) + '" ' +
             'width="80" height="80" src="' + _esc(avatarSrc) + '"/>' +
        '<div class="author-bio-content">' +
          '<div class="author-bio-label guest-label" data-bilingual="true">' +
            'Về tác giả khách mời | About guest author' +
          '</div>' +
          '<div class="author-bio-name-wrap">' +
            '<h3 class="author-bio-name">' + _esc(name) + '</h3>' +
            (role ? '<span class="author-bio-role">' + _esc(role) + '</span>' : '') +
          '</div>' +
          (bioVi ? '<div class="author-bio-text lang-vi">' + bioVi + '</div>' : '') +
          (bioEn ? '<div class="author-bio-text lang-en">' + bioEn + '</div>' : '') +
          (socialHtml ? '<div class="author-bio-actions author-social-links">' + socialHtml + '</div>' : '') +
        '</div>';

      container.classList.add('is-guest-author');
    }

    // ── 4. Schema.org JSON-LD Person ──────────────────────────────────
    _updateJsonLdPerson({
      name: name, url: website, image: avatar,
      description: bioEn || bioVi,
      sameAs: [facebook, twitter, linkedin].filter(Boolean),
    });

    // ── 5. Guest Post Callout cuối bài ────────────────────────────────
    var globalConfig = document.getElementById('HTML88');
    if (globalConfig) {
      var calloutConfig = globalConfig.querySelector('.post-guest-callout-config');
      var calloutEl     = document.querySelector('.post-guest-callout');
      if (calloutConfig && calloutEl) {
        var show = calloutConfig.style.display && calloutConfig.style.display !== 'none';
        if (show) {
          calloutEl.style.display = 'block';
          if (!calloutEl.children.length) calloutEl.innerHTML = calloutConfig.innerHTML;
        }
      }
    }
  }); // END DOMContentLoaded guest author

  // ── 6. Render CTA buttons từ #HTML88 config (mọi trang) ──────────────
  document.addEventListener('DOMContentLoaded', function () {
    var globalConfig = document.getElementById('HTML88');
    if (!globalConfig) return;

    // Nút btn-guest-hero trên Banner Hero
    var configBtn = globalConfig.querySelector('.btn-guest-hero-config');
    if (configBtn && configBtn.style.display !== 'none') {
      var ctaArea = document.querySelector('.profile-cta-area');
      if (ctaArea && !ctaArea.querySelector('.btn-guest-hero')) {
        var btn = document.createElement('a');
        btn.className = 'btn-guest-hero';
        btn.href = configBtn.getAttribute('href') || '/p/lien-he.html';
        btn.setAttribute('data-bilingual', 'true');
        var span = configBtn.querySelector('[data-bilingual]');
      var rawLabel = span ? span.textContent.trim() : '✍️ Viết cùng Trà Đá | ✍️ Write with us';
      var lang = (typeof localStorage !== 'undefined' && localStorage.getItem('user_lang')) || 'vi';
      btn.setAttribute('data-bilingual', 'true');
      btn.setAttribute('data-raw-label', rawLabel);
      btn.textContent = window.parseBilingualText ? window.parseBilingualText(rawLabel, lang) : rawLabel;
        ctaArea.appendChild(btn);
      }
    }

    // Sidebar Guest Card
    var cardConfig = globalConfig.querySelector('.sidebar-guest-card-config');
    if (cardConfig && cardConfig.style.display !== 'none') {
      var sidebarWrapper = document.querySelector('.sidebar-wrapper');
      if (sidebarWrapper && !sidebarWrapper.querySelector('.sidebar-guest-card')) {
        var card = document.createElement('div');
        card.className = 'sidebar-guest-card';
        card.innerHTML = cardConfig.innerHTML;
        sidebarWrapper.appendChild(card);
      }
    }
  });

  // ── Utils ─────────────────────────────────────────────────────────────
  function _esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function _updateJsonLdPerson(p) {
    try {
      var node = { '@context': 'https://schema.org', '@type': 'Person', 'name': p.name };
      if (p.url)         node['url']         = p.url;
      if (p.image)       node['image']       = p.image;
      if (p.description) node['description'] = p.description;
      if (p.sameAs && p.sameAs.length) node['sameAs'] = p.sameAs;

      var scripts = document.querySelectorAll('script[type="application/ld+json"]');
      var target  = null;
      for (var i = 0; i < scripts.length; i++) {
        try {
          var parsed = JSON.parse(scripts[i].textContent);
          if (parsed['@type'] === 'BlogPosting') {
            parsed.author = node;
            scripts[i].textContent = JSON.stringify(parsed);
            return;
          }
          if (parsed['@type'] === 'Person') { target = scripts[i]; }
        } catch (_) {}
      }
      if (target) { target.textContent = JSON.stringify(node); return; }
      var s = document.createElement('script');
      s.type = 'application/ld+json';
      s.textContent = JSON.stringify(node);
      document.head.appendChild(s);
    } catch (_) {}
  }

})();
