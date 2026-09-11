/**
 * BUILD SCRIPT — Editorial Profile Blogger Theme v1.0.0
 * Compiles src/styles/*.css + src/scripts/*.js → dist/theme.xml
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const stylesDir = path.join(root, "src", "styles");
const scriptsDir = path.join(root, "src", "scripts");
const distDir = path.join(root, "dist");

if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

// ──────────────────────────────────────────
// 1. Combine CSS
// ──────────────────────────────────────────
const cssFiles = [
  "variables.css",
  "typography.css",
  "header-banner.css",
  "post-layout.css",
  "affiliate-ui.css",
  "footer.css",
  "archive-page.css",
  "special-posts.css",
];
const combinedCss = cssFiles
  .map(f => fs.readFileSync(path.join(stylesDir, f), "utf8"))
  .join("\n\n");

// ──────────────────────────────────────────
// 2. Combine JS (body-end scripts)
// ──────────────────────────────────────────
const jsFiles = [
  "mobile-nav.js",
  "search-modal.js",
  "archive-page.js",
  "auto-toc.js",
  "bilingual.js",
  "reading-time.js",
  "footer.js",
  "special-posts.js",
];
const combinedJs = jsFiles
  .map(f => fs.readFileSync(path.join(scriptsDir, f), "utf8"))
  .join("\n\n");

// Dark mode script goes in <head> for Zero-FOUC
const darkModeJs = fs.readFileSync(path.join(scriptsDir, "dark-mode.js"), "utf8");

// ──────────────────────────────────────────
// 3. Blogger XML b:skin Theme Designer Variables
// ──────────────────────────────────────────
const bSkinVariables = `
<Variable name="body.background" description="Màu nền toàn trang" type="color" default="#f8fafc" value="#f8fafc"/>
<Variable name="card.background" description="Màu nền thẻ Card &amp; Bài viết" type="color" default="#ffffff" value="#ffffff"/>
<Variable name="primary.color" description="Màu chủ đạo (Buttons, Links, Badges)" type="color" default="#2563eb" value="#2563eb"/>
<Variable name="accent.color" description="Màu nhấn (Review, Đánh giá Sao)" type="color" default="#f59e0b" value="#f59e0b"/>
<Variable name="text.main" description="Màu chữ chính" type="color" default="#0f172a" value="#0f172a"/>
<Variable name="text.muted" description="Màu chữ phụ (Metadata, Snippet)" type="color" default="#475569" value="#475569"/>
<Variable name="font.family" description="Phông chữ chính" type="font" default="normal 400 16px 'Be Vietnam Pro', sans-serif" value="normal 400 16px 'Be Vietnam Pro', sans-serif"/>
`.trim();

// ──────────────────────────────────────────
// 4. Assemble Blogger XML
// ──────────────────────────────────────────
const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html b:css='false' b:responsive='true' b:version='2'
      xmlns='http://www.w3.org/1999/xhtml'
      xmlns:b='http://www.google.com/2005/gml/b'
      xmlns:data='http://www.google.com/2005/gml/data'
      xmlns:expr='http://www.google.com/2005/gml/expr'>
<head>
  <meta content='width=device-width, initial-scale=1, minimum-scale=1' name='viewport'/>
  <meta charset='UTF-8'/>

  <!-- Dynamic Title & Meta -->
  <b:if cond='data:view.isSingleItem'>
    <title><data:blog.pageName/> | <data:blog.title/></title>
    <meta expr:content='data:blog.metaDescription' name='description'/>
    <meta expr:content='data:blog.pageName' property='og:title'/>
    <meta expr:content='data:blog.metaDescription' property='og:description'/>
    <b:if cond='data:blog.postImageThumbnailUrl'>
      <meta expr:content='data:blog.postImageThumbnailUrl' property='og:image'/>
    </b:if>
    <meta content='article' property='og:type'/>
  <b:else/>
    <title><data:blog.pageTitle/></title>
    <meta expr:content='data:blog.metaDescription' name='description'/>
    <meta expr:content='data:blog.pageTitle' property='og:title'/>
    <meta content='website' property='og:type'/>
  </b:if>
  <meta expr:content='data:blog.url' property='og:url'/>
  <meta expr:content='data:blog.title' property='og:site_name'/>
  <meta content='summary_large_image' name='twitter:card'/>

  <!-- Canonical URL (strips ?m=1 / ?m=0 mobile params) -->
  <b:if cond='data:view.isSingleItem'>
    <link expr:href='data:post.url' rel='canonical'/>
  <b:else/>
    <link expr:href='data:blog.homepageUrl' rel='canonical'/>
  </b:if>

  <!-- Google Fonts -->
  <link rel='preconnect' href='https://fonts.googleapis.com'/>
  <link rel='preconnect' href='https://fonts.gstatic.com' crossorigin='anonymous'/>
  <link href='https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&amp;family=Lora:ital,wght@0,500;1,400&amp;display=swap' rel='stylesheet'/>

  <!-- Blogger head content (RSS, widgets, etc.) -->
  <b:include data='blog' name='all-head-content'/>

  <!-- Zero-FOUC Dark Mode (must be in <head>) -->
  <script>
  //<![CDATA[
${darkModeJs}
  //]]>
  </script>

  <!-- Blogger Theme Designer Variables + Styles -->
  <b:skin><![CDATA[
${bSkinVariables}

${combinedCss}

/* Blogger Theme Designer Dynamic Bindings (Overrides defaults with Theme Designer values) */
:root {
  --bg-body: $(body.background);
  --bg-card: $(card.background);
  --primary: $(primary.color);
  --primary-hover: $(primary.color);
  --accent: $(accent.color);
  --text-main: $(text.main);
  --text-muted: $(text.muted);
  --font-main: $(font.family);
}
  ]]></b:skin>

  <!-- SEO Schema.org JSON-LD -->
  <b:if cond='data:view.isHomepage'>
  <script type='application/ld+json'>
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "name": "<data:blog.title/>",
        "url": "<data:blog.homepageUrl/>",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "<data:blog.homepageUrl/>search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Person",
        "name": "<data:blog.title/>",
        "url": "<data:blog.homepageUrl/>"
      }
    ]
  }
  </script>
  </b:if>
  <b:if cond='data:view.isSingleItem'>
  <b:loop values='data:posts' var='post'>
  <script type='application/ld+json'>
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "<data:post.title/>",
    "description": "<data:post.snippet/>",
    "datePublished": "<data:post.date.iso8601/>",
    "dateModified": "<data:post.lastUpdated.iso8601/>",
    "author": {
      "@type": "Person",
      "name": "<data:post.author.name/>"
    },
    "publisher": {
      "@type": "Organization",
      "name": "<data:blog.title/>"
    },
    "url": "<data:post.url/>",
    "mainEntityOfPage": "<data:post.url/>",
    "image": "<data:post.featuredImage/>"
  }
  </script>
  <script type='application/ld+json'>
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Trang chủ",
        "item": "<data:blog.homepageUrl/>"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "<data:post.title/>",
        "item": "<data:post.url/>"
      }
    ]
  }
  </script>
  </b:loop>
  </b:if>
</head>
<body>

  <!-- Reading Progress Bar -->
  <div class='reading-progress-bar' id='reading-progress-bar'/>

  <!-- Search Modal -->
  <div class='search-modal-overlay' id='search-modal-overlay' role='dialog' aria-modal='true' aria-label='Tìm kiếm'>
    <div class='search-modal-box'>
      <div class='search-modal-header'>
        <span class='search-modal-title'>🔍 Tìm kiếm bài viết</span>
        <button class='search-close-btn' id='search-close-btn' aria-label='Đóng tìm kiếm'>✕</button>
      </div>
      <form class='search-input-wrap' id='search-form' role='search'>
        <input class='search-input' id='search-input' type='search' placeholder='Nhập từ khóa tìm kiếm...' autocomplete='off'/>
        <button class='search-submit-btn' type='submit'>Tìm</button>
      </form>
    </div>
  </div>

  <!-- Nav Drawer Backdrop -->
  <div class='nav-drawer-backdrop' id='nav-drawer-backdrop'/>

  <!-- Mobile Navigation Drawer (auto-synced from LinkList1) -->
  <nav class='nav-drawer' id='nav-drawer' aria-label='Menu điều hướng mobile'>
    <div class='nav-drawer-header'>
      <span class='brand-logo'><data:blog.title/><span class='dot'>.</span></span>
      <button class='nav-drawer-close' id='nav-drawer-close' aria-label='Đóng menu'>✕</button>
    </div>
    <ul class='nav-drawer-menu' id='nav-drawer-menu'>
      <!-- Auto-populated from Desktop Menu by mobile-nav.js -->
    </ul>
  </nav>

  <!-- ==========================================
       STICKY HEADER
       ========================================== -->
  <header class='site-header' id='site-header'>
    <div class='site-wrapper'>
      <div class='header-inner'>

        <!-- Brand Logo (Configurable via Layout > Header1: Text or Image) -->
        <b:section class='brand-logo-section' id='header-logo-section' maxwidgets='1' name='Tiêu Đề &amp; Logo Blog' showaddelement='no'>
          <b:widget id='Header1' locked='true' title='Tiêu Đề &amp; Logo Blog' type='Header' version='2'>
            <b:widget-settings>
              <b:widget-setting name='displayUrl'/>
              <b:widget-setting name='displayHeight'>0</b:widget-setting>
              <b:widget-setting name='sectionWidth'>-1</b:widget-setting>
              <b:widget-setting name='useImage'>false</b:widget-setting>
              <b:widget-setting name='shrinkToFit'>false</b:widget-setting>
              <b:widget-setting name='imagePlacement'>REPLACE</b:widget-setting>
              <b:widget-setting name='displayWidth'>0</b:widget-setting>
            </b:widget-settings>
            <b:includable id='main'>
              <div class='brand-logo'>
                <a expr:href='data:blog.homepageUrl' expr:title='data:title ? data:title : data:blog.title'>
                  <b:if cond='data:image'>
                    <img class='brand-logo-img' expr:alt='data:title ? data:title : data:blog.title' expr:src='data:image'/>
                  <b:else/>
                    <b:if cond='data:title'>
                      <data:title/><span class='dot'>.</span>
                    <b:else/>
                      <data:blog.title/><span class='dot'>.</span>
                    </b:if>
                  </b:if>
                </a>
              </div>
            </b:includable>
          </b:widget>
        </b:section>

        <!-- Desktop Navigation (Single Source of Truth) -->
        <b:section id='nav-menu-section' name='Menu Điều Hướng Chính' maxwidgets='1' showaddelement='yes'>
          <b:widget id='LinkList1' type='LinkList' version='2'>
            <b:includable id='main'>
              <nav class='nav-menu-wrapper' aria-label='Menu chính'>
                <ul class='nav-menu'>
                  <b:loop values='data:links' var='link'>
                    <b:if cond='data:link.name.startsWith(&quot;_&quot;)'>
                      <li class='has-dropdown'>
                        <a href='#'><data:link.name.substring(1)/></a>
                        <ul class='dropdown-menu'>
                          <li><a expr:href='data:link.target'><data:link.name.substring(1)/></a></li>
                        </ul>
                      </li>
                    <b:else/>
                      <li><a expr:href='data:link.target'><data:link.name/></a></li>
                    </b:if>
                  </b:loop>
                </ul>
              </nav>
            </b:includable>
          </b:widget>
        </b:section>

        <!-- Header Actions -->
        <div class='header-actions'>
          <!-- Search -->
          <button class='btn-icon' id='search-open-btn' aria-label='Tìm kiếm' title='Tìm kiếm'>🔍</button>
          <!-- Dark Mode Toggle -->
          <button class='btn-icon' id='theme-toggle-btn' onclick='toggleTheme()' aria-label='Đổi giao diện Sáng/Tối' title='Đổi giao diện'>🌙</button>
          <!-- Hamburger (mobile) -->
          <button class='hamburger-btn' id='hamburger-btn' aria-label='Mở menu' aria-expanded='false'>
            <span/>
            <span/>
            <span/>
          </button>
        </div>

      </div>
    </div>
  </header>

  <!-- ==========================================
       MAIN SITE WRAPPER
       ========================================== -->
  <div class='site-wrapper'>

    <!-- Profile Cover Hero Section (Persists Across Subpages) -->
    <b:section id='profile-hero-section' name='Ảnh Bìa &amp; Tác Giả' maxwidgets='2' showaddelement='yes'>
      <b:widget id='HTML1' type='HTML' version='2'>
        <b:includable id='main'>
          <b:if cond='data:content != &quot;&quot;'>
            <data:content/>
          <b:else/>
            <b:if cond='data:view.isHomepage or data:view.isMultipleItems or (data:view.isPage and (data:view.url.canonical.endsWith("p/muc-luc.html") or data:view.url.canonical.endsWith("p/archive.html")))'>
              <!-- Full Profile Cover on Homepage / Archive -->
              <div class='profile-cover-section' id='profile-cover-section'>
                <div class='cover-image-wrapper' id='cover-image-wrapper'
                     style='background-image: url(&quot;https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=1200&amp;auto=format&amp;fit=crop&amp;q=80&quot;);'>
                </div>
                <div class='cover-info-card'>
                  <div class='avatar-wrapper'>
                    <img class='profile-avatar'
                         src='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&amp;auto=format&amp;fit=crop&amp;q=80'
                         alt='Avatar tác giả'
                         width='120' height='120'/>
                  </div>
                  <div class='profile-meta'>
                    <h1 class='profile-name'><data:blog.title/></h1>
                    <p class='profile-bio'>Chia sẻ về trải nghiệm sống, góc nhìn cá nhân và những bài học trên hành trình khám phá bản thân.</p>
                  </div>
                  <div class='profile-cta-area'>
                    <a class='btn-subscribe' href='#newsletter'>💌 Nhận Bản Tin</a>
                  </div>
                </div>
              </div>
            <b:else/>
              <!-- Full Profile Cover on Single Post / Subpages (identical size to homepage) -->
              <div class='profile-cover-section' id='profile-cover-section'>
                <div class='cover-image-wrapper' id='cover-image-wrapper'
                     style='background-image: url(&quot;https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=1200&amp;auto=format&amp;fit=crop&amp;q=80&quot;);'>
                </div>
                <div class='cover-info-card'>
                  <div class='avatar-wrapper'>
                    <img class='profile-avatar'
                         src='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&amp;auto=format&amp;fit=crop&amp;q=80'
                         alt='Avatar tác giả'
                         width='120' height='120'/>
                  </div>
                  <div class='profile-meta'>
                    <div class='profile-name'><a expr:href='data:blog.homepageUrl'><data:blog.title/></a></div>
                    <p class='profile-bio'>Chia sẻ về trải nghiệm sống, góc nhìn cá nhân và những bài học trên hành trình khám phá bản thân.</p>
                  </div>
                  <div class='profile-cta-area'>
                    <a class='btn-subscribe' href='#newsletter'>💌 Nhận Bản Tin</a>
                  </div>
                </div>
              </div>
            </b:if>
          </b:if>
        </b:includable>
      </b:widget>
    </b:section>

    <!-- Dynamic Category Tabs (Visible Across Pages) -->
    <b:section id='category-tabs-section' name='Thanh Chủ Đề (Tabs)' maxwidgets='1' showaddelement='yes'>
      <b:widget id='Label1' type='Label' version='2'>
        <b:includable id='main'>
          <nav class='category-tabs-bar' aria-label='Lọc theo chủ đề'>
            <a class='tab-pill active' expr:href='data:blog.homepageUrl'>✦ Tất cả</a>
            <b:loop values='data:labels' var='label'>
              <a class='tab-pill' expr:href='data:label.url'><data:label.name/></a>
            </b:loop>
          </nav>
        </b:includable>
      </b:widget>
    </b:section>

    <!-- ==========================================
         MAIN LAYOUT GRID (Posts + Sidebar)
         ========================================== -->
    <div class='layout-grid'>

      <!-- Main Content Column -->
      <main class='main-content' id='main-content'>
        <b:section id='main' name='Nội Dung Bài Viết' maxwidgets='1' showaddelement='yes'>
          <b:widget id='Blog1' type='Blog' version='2'>
            <b:includable id='main'>

              <!-- ── HOMEPAGE / ARCHIVE VIEW ── -->
              <b:if cond='data:view.isMultipleItems'>
                <div class='posts-feed' role='feed'>
                  <b:loop values='data:posts' var='post' index='idx'>
                    <!-- ══ QUY TẮC VÀNG: Ẩn bài viết "độc quyền @" khỏi Trang chủ ══
                         isExclusiveFeaturePost = true chỉ khi 100% nhãn đều bắt đầu bằng "@".
                         Nếu bài có cả nhãn thường (VD: Thể thao) → luôn hiển thị bình thường. -->
                    <b:with value='data:post.labels every (label =&gt; label.name startsWith "@")' var='isExclusiveFeaturePost'>
                    <b:if cond='not (data:view.isHomepage and data:isExclusiveFeaturePost)'>
                    <article class='post-card' itemscope='itemscope' itemtype='https://schema.org/BlogPosting'>
                      <div class='post-card-body'>
                        <div>
                          <b:if cond='data:post.labels'>
                            <a class='post-badge' expr:href='data:post.labels.first.url'><data:post.labels.first.name/></a>
                          </b:if>
                          <h2 class='post-card-title' itemprop='headline'>
                            <a expr:href='data:post.url' itemprop='url'><data:post.title/></a>
                          </h2>
                          <div class='post-card-snippet'><data:post.snippet/></div>
                        </div>
                        <div class='post-card-meta'>
                          <span>📅 <time expr:datetime='data:post.date.iso8601'><data:post.date/></time></span>
                          <span>⏱️ <span class='read-time-est'>5 phút</span></span>
                        </div>
                      </div>
                      <b:if cond='data:post.featuredImage'>
                        <b:if cond='data:idx == 0'>
                          <img class='post-card-thumb' expr:src='data:post.featuredImage' expr:alt='data:post.title'
                               width='220' height='150' fetchpriority='high' decoding='async'/>
                        <b:else/>
                          <img class='post-card-thumb' expr:src='data:post.featuredImage' expr:alt='data:post.title'
                               width='220' height='150' loading='lazy' decoding='async'/>
                        </b:if>
                      </b:if>
                    </article>
                    </b:if><!-- /isExclusiveFeaturePost -->
                    </b:with>
                  </b:loop>
                </div>

                <!-- Numbered Pagination -->
                <div class='blog-pager' role='navigation' aria-label='Phân trang'>
                  <b:if cond='data:newerPageUrl'>
                    <a class='blog-pager-newer-link' expr:href='data:newerPageUrl'>« Mới hơn</a>
                  </b:if>
                  <b:if cond='data:olderPageUrl'>
                    <a class='blog-pager-older-link' expr:href='data:olderPageUrl'>Cũ hơn »</a>
                  </b:if>
                </div>

              <!-- ── STATIC PAGE OR SINGLE POST VIEW ── -->
              <b:else/>
                <!-- ── SPECIAL VIEW: DEDICATED ARCHIVE / MỤC LỤC TOÀN THƯ PAGE ── -->
                <b:if cond='data:view.isPage and (data:view.url.canonical.endsWith("p/muc-luc.html") or data:view.url.canonical.endsWith("p/archive.html"))'>
                  <div class='editorial-archive-page' id='editorial-archive-app'>
                    <!-- Thanh Tìm Kiếm Tức Thì -->
                    <div class='archive-search-wrap'>
                      <span class='archive-search-icon' aria-hidden='true'>🔍</span>
                      <input class='archive-search-input' id='archive-search-input' type='search'
                             placeholder='Nhập từ khóa tìm tên bài, chủ đề hoặc năm (VD: 2025, sách, thói quen)...'
                             autocomplete='off' aria-label='Tìm kiếm bài viết'/>
                      <button type='button' class='archive-search-clear' id='archive-search-clear' aria-label='Xóa tìm kiếm' style='display:none;'>✕</button>
                    </div>

                    <!-- Khung danh sách bài viết -->
                    <div id='archive-app-body' class='archive-tree-container' aria-live='polite'>
                      <div class='archive-loading'>
                        <div class='archive-spinner'/>
                        <span>Đang đồng bộ danh mục bài viết...</span>
                      </div>
                    </div>
                  </div>
                <b:else/>
                  <b:loop values='data:posts' var='post'>
                  <article class='single-post-container' itemscope='itemscope' itemtype='https://schema.org/BlogPosting'>

                    <!-- Breadcrumbs -->
                    <nav class='breadcrumbs' aria-label='Điều hướng phân cấp'>
                      <a expr:href='data:blog.homepageUrl'>🏠 Trang chủ</a>
                      <span class='separator'>›</span>
                      <b:if cond='data:post.labels'>
                        <a expr:href='data:post.labels.first.url'><data:post.labels.first.name/></a>
                        <span class='separator'>›</span>
                      </b:if>
                      <span><data:post.title/></span>
                    </nav>

                    <!-- Post H1 Title -->
                    <h1 class='single-post-title' itemprop='headline'><data:post.title/></h1>

                    <!-- Post Meta Row -->
                    <div class='post-meta-header'>
                      <div class='author-meta-inline'>
                        <img class='author-avatar-sm'
                             src='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&amp;auto=format&amp;fit=crop&amp;q=80'
                             alt='Tác giả' width='44' height='44'/>
                        <div class='author-meta-text'>
                          <div class='author-name-link' itemprop='author' itemscope='itemscope' itemtype='https://schema.org/Person'>
                            <span itemprop='name'><data:post.author.name/></span>
                          </div>
                          <div class='author-meta-details'>
                            <span>📅 <time expr:datetime='data:post.date.iso8601' itemprop='datePublished'><data:post.date/></time></span>
                            <span>•</span>
                            <span>⏱️ <span id='reading-time-val'>...</span></span>
                          </div>
                        </div>
                      </div>
                      <!-- Bilingual Switcher (auto-shown by JS if bilingual content detected) -->
                      <div class='bilingual-switcher-wrapper'>
                        <div class='bilingual-switcher' role='group' aria-label='Chọn ngôn ngữ'>
                          <button class='lang-btn lang-btn-vi active' onclick="switchLanguage('vi')" aria-pressed='true'>🇻🇳 VI</button>
                          <button class='lang-btn lang-btn-en' onclick="switchLanguage('en')" aria-pressed='false'>🇬🇧 EN</button>
                        </div>
                      </div>
                    </div>

                    <!-- AdSense Slot 1: Above the fold -->
                    <div class='adsense-slot adsense-top' aria-label='Quảng cáo'>
                      <!-- Google AdSense code here -->
                    </div>

                    <!-- Auto Table of Contents -->
                    <div class='table-of-contents' id='auto-toc' aria-label='Mục lục bài viết'/>

                    <!-- Post Body -->
                    <div class='post-body' itemprop='articleBody'>
                      <data:post.body/>
                    </div>

                    <!-- AdSense Slot 2: Bottom of post -->
                    <div class='adsense-slot adsense-bottom' aria-label='Quảng cáo'>
                      <!-- Google AdSense code here -->
                    </div>

                    <!-- Social Share Bar -->
                    <div class='social-share-bar' role='group' aria-label='Chia sẻ bài viết'>
                      <span class='share-title'>Chia sẻ:</span>
                      <a class='btn-share btn-share-fb'
                         expr:href='&quot;https://www.facebook.com/sharer/sharer.php?u=&quot; + data:post.url'
                         target='_blank' rel='nofollow noopener' aria-label='Chia sẻ lên Facebook'>
                        <b>f</b> Facebook
                      </a>
                      <a class='btn-share btn-share-tw'
                         expr:href='&quot;https://twitter.com/intent/tweet?url=&quot; + data:post.url + &quot;&amp;text=&quot; + data:post.title'
                         target='_blank' rel='nofollow noopener' aria-label='Chia sẻ lên X'>
                        𝕏 X
                      </a>
                      <a class='btn-share btn-share-li'
                         expr:href='&quot;https://www.linkedin.com/sharing/share-offsite/?url=&quot; + data:post.url'
                         target='_blank' rel='nofollow noopener' aria-label='Chia sẻ lên LinkedIn'>
                        in LinkedIn
                      </a>
                      <button class='btn-share btn-share-copy' id='copy-link-btn' aria-label='Sao chép link bài viết'>
                        🔗 Sao chép link
                      </button>
                    </div>

                    <!-- Author Bio Box -->
                    <div class='author-bio-box'>
                      <img class='author-bio-avatar'
                           src='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&amp;auto=format&amp;fit=crop&amp;q=80'
                           alt='Ảnh tác giả' width='80' height='80'/>
                      <div class='author-bio-content'>
                        <div class='author-bio-label'>Về tác giả</div>
                        <h3 class='author-bio-name'><data:post.author.name/></h3>
                        <p class='author-bio-text'>Tôi viết về hành trình khám phá bản thân, trải nghiệm sống chân thực và những công cụ tư duy giúp tôi sống có ý nghĩa hơn mỗi ngày. Nếu bài viết này có ích với bạn, hãy mua tôi một ly cà phê nhé!</p>
                        <div class='author-bio-actions'>
                          <a class='btn-coffee' href='https://www.buymeacoffee.com/' target='_blank' rel='noopener noreferrer'>☕ Mời tôi ly cà phê</a>
                          <a class='btn-subscribe' href='#newsletter'>💌 Đăng ký bản tin</a>
                        </div>
                      </div>
                    </div>

                    <!-- Next / Prev Post Navigation -->
                    <div class='post-nav-container'>
                      <b:if cond='data:newerPageUrl'>
                        <a class='post-nav-link post-nav-prev' expr:href='data:newerPageUrl'>
                          <span class='post-nav-direction'>« Bài trước</span>
                          <span class='post-nav-title'>Bài viết mới hơn</span>
                        </a>
                      <b:else/>
                        <div/>
                      </b:if>
                      <b:if cond='data:olderPageUrl'>
                        <a class='post-nav-link post-nav-next' expr:href='data:olderPageUrl'>
                          <span class='post-nav-direction'>Bài sau »</span>
                          <span class='post-nav-title'>Bài viết cũ hơn</span>
                        </a>
                      </b:if>
                    </div>

                    <!-- Related Posts -->
                    <div class='related-posts-section'>
                      <h3 class='related-posts-title'>📚 Bài Viết Liên Quan</h3>
                      <b:if cond='data:post.labels'>
                        <div class='related-posts-grid'>
                          <b:loop values='data:posts' var='relPost' index='rIdx'>
                            <b:if cond='data:rIdx lt 3 and data:relPost.id != data:post.id'>
                              <a class='related-post-card' expr:href='data:relPost.url'>
                                <b:if cond='data:relPost.featuredImage'>
                                  <img class='related-post-thumb'
                                       expr:src='data:relPost.featuredImage'
                                       expr:alt='data:relPost.title'
                                       loading='lazy' decoding='async'/>
                                </b:if>
                                <span class='related-post-title'><data:relPost.title/></span>
                                <span class='related-post-date'>📅 <data:relPost.date/></span>
                              </a>
                            </b:if>
                          </b:loop>
                        </div>
                      </b:if>
                    </div>

                    <!-- Comments -->
                    <div class='comments-section'>
                      <b:include name='comment-form'/>
                    </div>

                  </article>
                </b:loop>
              </b:if>
            </b:if>

            </b:includable>
          </b:widget>
        </b:section>

        <!-- 3rd Party Widgets Under Post -->
        <b:section id='under-post-widgets' name='Tiện Ích Dưới Bài Viết (Bên Thứ 3)' showaddelement='yes'/>

        <!-- Special Posts Widget — Bên dưới danh sách bài (Main Content) -->
        <!-- Hiển thị trong Main Content, tự động chuyển sang grid 2-3 cột nhờ Container Queries -->
        <b:section id='main-special-posts-section' name='Tiện Ích Bài Đặc Biệt (Main Content)' showaddelement='yes'>
          <b:widget id='HTML_SP_MainRanked' type='HTML' version='2' title='📊 Top Bài Đọc Nhiều (Main Content)'>
            <b:includable id='main'>
              <b:if cond='data:view.isHomepage or data:view.isMultipleItems'>
                <!-- Widget Ranked rộng trong Main — tự động dàn 2-3 cột khi đủ chỗ -->
                <div class='special-posts-widget'
                     id='widget-top-bai-doc'
                     data-pattern='ranked'
                     data-sort='views'
                     data-limit='6'
                     data-title='📊 Bài Viết Được Đọc Nhiều'
                     data-view-all-text='Xem tất cả »'>
                </div>
              </b:if>
            </b:includable>
          </b:widget>
        </b:section>
      </main>

      <!-- ==========================================
           SIDEBAR (30%)
           ========================================== -->
      <aside class='sidebar' id='sidebar' aria-label='Cột bên'>
        <b:section id='sidebar-section' name='Cột Bên (Sidebar)' showaddelement='yes'>

          <!-- Widget: Bài Viết Nổi Bật (Pattern: ranked) -->
          <!-- Hiển thị Top 5 bài mới nhất có nhãn @Nổi bật hoặc bài đọc nhiều nhất -->
          <b:widget id='HTML_SP_Ranked' type='HTML' version='2' title='🔥 Bài Viết Nổi Bật'>
            <b:includable id='main'>
              <div class='sidebar-widget'>
                <!-- HƯỚNG DẪN TÙNG CHỈNH:
                     data-labels: nhãn cần lấy bài (phân tách bằng dấu phẩy)
                     data-sort:   latest | views | random
                     data-limit:  số bài hiển thị (1-10)
                     data-title:  tiêu đề widget (để trống sẽ không hiển thị header)
                -->
                <div class='special-posts-widget'
                     id='widget-bai-viet-noi-bat'
                     data-pattern='ranked'
                     data-labels='@Nổi bật'
                     data-sort='latest'
                     data-limit='5'
                     data-title='🔥 Bài Viết Nổi Bật'
                     data-view-all-text='Xem tất cả »'>
                </div>
              </div>
            </b:includable>
          </b:widget>

          <!-- Widget: Chiêm Nghiệm Hôm Nay (Pattern: quote) -->
          <!-- Bốc ngẫu nhiên 1 câu trích dẫn từ nhãn @Quote mỗi lần tải trang -->
          <b:widget id='HTML_SP_Quote' type='HTML' version='2' title='☕ Chiêm Nghiệm Hôm Nay'>
            <b:includable id='main'>
              <div class='sidebar-widget'>
                <div class='special-posts-widget'
                     id='widget-chiem-nghiem'
                     data-pattern='quote'
                     data-labels='@Quote'
                     data-sort='random'
                     data-limit='1'
                     data-title='☕ Chiêm Nghiệm Hôm Nay'>
                </div>
              </div>
            </b:includable>
          </b:widget>

          <!-- Widget: Điểm Tin Mỗi Ngày (Pattern: digest) -->
          <!-- Lấy bài mới nhất từ nhãn @Điểm tin -->
          <b:widget id='HTML_SP_Digest' type='HTML' version='2' title='⚡ Điểm Tin Mỗi Ngày'>
            <b:includable id='main'>
              <div class='sidebar-widget'>
                <div class='special-posts-widget'
                     id='widget-diem-tin'
                     data-pattern='digest'
                     data-labels='@Điểm tin'
                     data-sort='latest'
                     data-limit='4'
                     data-title='⚡ Điểm Tin Mỗi Ngày'
                     data-view-all-text='Xem tất cả »'>
                </div>
              </div>
            </b:includable>
          </b:widget>

          <!-- Widget: Bài Viết Tiêu Điểm — Sidebar (Pattern: spotlight, nhỏ gọn) -->
          <!-- 1 bài tiêu điểm thu nhỏ, phù hợp sidebar -->
          <b:widget id='HTML_SP_Spotlight' type='HTML' version='2' title='🌟 Bài Viết Tiêu Điểm'>
            <b:includable id='main'>
              <div class='sidebar-widget'>
                <div class='special-posts-widget'
                     id='widget-tieu-diem'
                     data-pattern='spotlight'
                     data-labels='@Tiêu điểm'
                     data-sort='latest'
                     data-limit='1'
                     data-title='🌟 Bài Viết Tiêu Điểm'>
                </div>
              </div>
            </b:includable>
          </b:widget>

          <!-- Widget: About Me -->
          <b:widget id='HTML2' type='HTML' version='2'>
            <b:includable id='main'>
              <div class='sidebar-widget'>
                <h3 class='sidebar-widget-title'>👤 Về Tác Giả</h3>
                <img class='sidebar-about-avatar'
                     src='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&amp;auto=format&amp;fit=crop&amp;q=80'
                     alt='Avatar tác giả' width='64' height='64'/>
                <p class='sidebar-about-text'>Tôi viết về hành trình khám phá bản thân, trải nghiệm sống và những công cụ hữu ích giúp sống tốt hơn mỗi ngày.</p>
                <div class='sidebar-socials'>
                  <a class='social-icon-link' href='#' target='_blank' rel='noopener' aria-label='Facebook'>f</a>
                  <a class='social-icon-link' href='#' target='_blank' rel='noopener' aria-label='X'>𝕏</a>
                  <a class='social-icon-link' href='#' target='_blank' rel='noopener' aria-label='LinkedIn'>in</a>
                </div>
              </div>
            </b:includable>
          </b:widget>

          <!-- Widget: Popular Posts -->
          <b:widget id='PopularPosts1' type='PopularPosts' version='2'>
            <b:includable id='main'>
              <div class='sidebar-widget'>
                <h3 class='sidebar-widget-title'>🔥 Bài Viết Nổi Bật</h3>
                <ul class='popular-posts-list'>
                  <b:loop values='data:posts' var='ppPost' index='ppIdx'>
                    <li>
                      <a class='popular-post-item' expr:href='data:ppPost.url'>
                        <span class='popular-post-num'><b:if cond='data:ppIdx lt 9'>0</b:if><data:ppIdx + 1/></span>
                        <b:if cond='data:ppPost.featuredImage'>
                          <img class='popular-post-thumb' expr:src='data:ppPost.featuredImage'
                               expr:alt='data:ppPost.title' loading='lazy' width='60' height='60'/>
                        </b:if>
                        <div class='popular-post-info'>
                          <div class='popular-post-title'><data:ppPost.title/></div>
                          <div class='popular-post-date'>📅 <data:ppPost.date/></div>
                        </div>
                      </a>
                    </li>
                  </b:loop>
                </ul>
              </div>
            </b:includable>
          </b:widget>

          <!-- Widget: Newsletter -->
          <b:widget id='HTML4' type='HTML' version='2'>
            <b:includable id='main'>
              <div class='sidebar-widget'>
                <h3 class='sidebar-widget-title'>📨 Nhận Bài Viết Mới</h3>
                <p class='sidebar-newsletter-text'>Đăng ký để nhận thông báo khi có bài viết mới. Không spam, chỉ nội dung chất lượng.</p>
                <div class='sidebar-newsletter-form'>
                  <input class='sidebar-email-input' type='email' placeholder='Email của bạn...' aria-label='Địa chỉ email'/>
                  <button class='sidebar-submit-btn' type='button'>💌 Đăng Ký</button>
                </div>
              </div>
            </b:includable>
          </b:widget>

          <!-- Widget: AdSense Sidebar (Sticky ở cuối cùng) -->
          <b:widget id='HTML3' type='HTML' version='2'>
            <b:includable id='main'>
              <div class='adsense-slot adsense-sidebar' aria-label='Quảng cáo'>
                <!-- Google AdSense 300x250 / 300x600 code here -->
              </div>
            </b:includable>
          </b:widget>

        </b:section>
      </aside>

    </div><!-- /.layout-grid -->
  </div><!-- /.site-wrapper -->

  <!-- ==========================================
       FOOTER — 3-TIER MODULAR (FEAT-MODULAR-FOOTER-V3)
       ========================================== -->
  <footer class='site-footer' id='site-footer'>

    <!-- ═══════════════════════════════════════════════════
         TẦNG 1: NỘI DUNG & TƯƠNG TÁC CHÍNH
         ═══════════════════════════════════════════════════ -->
    <div class='site-wrapper'>
      <div class='footer-tier1'>

        <!-- ── CỘT 1: THƯƠNG HIỆU, CẢM ƠN & MỜI CÀ PHÊ ── -->
        <b:section id='footer-brand-section' class='footer-section-col' name='Footer: Cột 1 (Thương Hiệu &amp; Cà Phê)' maxwidgets='2' showaddelement='yes'>
          <b:widget id='HTML3' type='HTML' version='2' title='Thương Hiệu &amp; Lời Cảm Ơn'>
            <b:includable id='main'>
              <div class='footer-col-brand'>
                <a class='footer-brand-logo' expr:href='data:blog.homepageUrl'><data:blog.title/><span class='dot'>.</span></a>
                <p class='footer-tagline'>Cảm ơn bạn đã dành thời gian ghé thăm blog. Hy vọng những chia sẻ tại đây mang lại cho bạn chút cảm hứng, tri thức hữu ích hoặc sự đồng điệu trên hành trình khám phá và phát triển bản thân.</p>
              </div>
            </b:includable>
          </b:widget>
          <b:widget id='HTML7' type='HTML' version='2' title='Mời Cà Phê Mini ☕'>
            <b:includable id='main'>
              <div class='footer-coffee-wrapper'>
                <a class='btn-coffee-compact' href='https://buymeacoffee.com/yourname' target='_blank' rel='noopener noreferrer'>
                  <span class='coffee-icon'>☕</span>
                  <span class='coffee-label'>Mời tôi ly cà phê</span>
                </a>
              </div>
            </b:includable>
          </b:widget>
        </b:section>

        <!-- ── CỘT 2: CHÍNH SÁCH & PHÁP LÝ ── -->
        <b:section id='footer-legal-section' class='footer-section-col' name='Footer: Cột 2 (Chính Sách)' maxwidgets='1' showaddelement='yes'>
          <b:widget id='LinkList3' type='LinkList' version='2' title='⚖️ Chính Sách &amp; Minh Bạch'>
            <b:includable id='main'>
              <div class='footer-col-legal'>
                <h4 class='footer-col-title'><data:title/></h4>
                <ul class='footer-links'>
                  <b:loop values='data:links' var='llink'>
                    <li><a expr:href='data:llink.target'><data:llink.name/></a></li>
                  </b:loop>
                </ul>
              </div>
            </b:includable>
          </b:widget>
        </b:section>

        <!-- ── CỘT 3: NHẬN BẢN TIN & MẠNG XÃ HỘI ── -->
        <b:section id='footer-newsletter-section' class='footer-section-col' name='Footer: Cột 3 (Bản Tin &amp; Kết Nối)' maxwidgets='2' showaddelement='yes'>
          <b:widget id='HTML4' type='HTML' version='2' title='📬 Nhận Bài Viết Mới'>
            <b:includable id='main'>
              <div class='footer-col-newsletter'>
                <h4 class='footer-col-title'>📬 Nhận Bài Viết Mới</h4>
                <p class='footer-newsletter-desc'>Nhận bài viết mới và các chiêm nghiệm giá trị qua email. Không spam.</p>
                <form class='newsletter-form' onsubmit='return false;'>
                  <input class='input-email' id='footer-email-input' type='email' placeholder='email@của-bạn.com' aria-label='Email đăng ký bản tin'/>
                  <button class='btn-submit' id='footer-subscribe-btn' type='submit'>Đăng Ký</button>
                </form>
              </div>
            </b:includable>
          </b:widget>
          <b:widget id='LinkList4' type='LinkList' version='2' title='🌐 Kết Nối'>
            <b:includable id='main'>
              <div class='footer-col-social'>
                <div class='footer-social-grid'>
                  <b:loop values='data:links' var='slink'>
                    <a class='footer-social-icon'
                       expr:href='data:slink.target'
                       target='_blank'
                       rel='noopener noreferrer'
                       expr:aria-label='data:slink.name'
                       expr:title='data:slink.name'><data:slink.name/></a>
                  </b:loop>
                </div>
              </div>
            </b:includable>
          </b:widget>
        </b:section>

      </div><!-- /.footer-tier1 -->
    </div><!-- /.site-wrapper (Tầng 1) -->

    <!-- ═══════════════════════════════════════════════════
         TẦNG 2: ĐIỀU HƯỚNG ĐÁY TRANG & BẢN QUYỀN
         Full-width wrapper — borders kéo dài suốt màn hình
         ═══════════════════════════════════════════════════ -->
    <div class='footer-bottom-wrapper'>
      <div class='site-wrapper'>
        <div class='footer-bottom'>

          <!-- Bên trái: Bản quyền -->
          <b:section id='footer-copyright-section' name='Footer Tầng 2: Bản Quyền' maxwidgets='1' showaddelement='yes'>
            <b:widget id='HTML5' type='HTML' version='2' title='Dòng Bản Quyền'>
              <b:includable id='main'>
                <span class='footer-copyright'>© 2026 <data:blog.title/>. Tất cả quyền được bảo lưu.</span>
              </b:includable>
            </b:widget>
          </b:section>

          <!-- Ở giữa: Bottom Navigation Menu -->
          <b:section id='footer-bottom-menu-section' name='Footer Tầng 2: Bottom Menu' maxwidgets='1' showaddelement='yes'>
            <b:widget id='LinkList5' type='LinkList' version='2' title='Bottom Navigation Menu'>
              <b:includable id='main'>
                <nav aria-label='Footer navigation'>
                  <ul class='footer-bottom-nav'>
                    <b:loop values='data:links' var='bmlink'>
                      <li><a expr:href='data:bmlink.target'><data:bmlink.name/></a></li>
                    </b:loop>
                  </ul>
                </nav>
              </b:includable>
            </b:widget>
          </b:section>

        </div><!-- /.footer-bottom -->
      </div><!-- /.site-wrapper (Tầng 2) -->

      <!-- Bên phải: Nút về đầu trang (Built-in) -->
      <button class='scroll-top-btn' id='scroll-to-top' aria-label='Cuộn về đầu trang'>
        <svg viewBox='0 0 24 24' stroke='currentColor' stroke-width='2.5' fill='none' stroke-linecap='round' stroke-linejoin='round'><polyline points='18 15 12 9 6 15'></polyline></svg>
      </button>
    </div><!-- /.footer-bottom-wrapper -->

    <!-- ═══════════════════════════════════════════════════
         TẦNG 3: QUẢNG CÁO CHÂN TRANG (MONETIZATION SLOT)
         ═══════════════════════════════════════════════════ -->
    <div class='site-wrapper'>
      <b:section id='footer-ads-section' name='Footer Tầng 3: Quảng Cáo Đáy Trang' maxwidgets='1' showaddelement='yes'>
        <b:widget id='HTML6' type='HTML' version='2' title='Banner Quảng Cáo Đáy Trang'>
          <b:includable id='main'>
            <div class='footer-ads-tier'>
              <div class='footer-ads-slot'>
                📣 Vùng Quảng Cáo Đáy Trang (AdSense / Sponsor Banner)
              </div>
            </div>
          </b:includable>
        </b:widget>
      </b:section>
    </div><!-- /.site-wrapper (Tầng 3) -->

  </footer>

  <!-- Body-end Scripts -->
  <script>
  //<![CDATA[
${combinedJs}
  //]]>
  </script>

</body>
</html>`;

// ──────────────────────────────────────────
// 5. Write output
// ──────────────────────────────────────────
fs.writeFileSync(path.join(distDir, "theme.xml"), xml, "utf8");

const sizeKB = (Buffer.byteLength(xml, "utf8") / 1024).toFixed(1);
console.log(`✅ dist/theme.xml compiled successfully! (${sizeKB} KB)`);
