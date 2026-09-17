# ĐẶC TẢ KỸ THUẬT GIAI ĐOẠN 1: TÁI CẤU TRÚC BASE THEME CHUẨN THƯƠNG MẠI V1.0
## (Component-Based Base Theme Architecture Specification)

- **Mã giai đoạn:** STEP-1-BASE-THEME
- **Phiên bản đích:** 1.0.0 (Release Base Version)
- **Kiến trúc:** Master Shell + Well-Formed XML Components
- **Tác giả & Chủ sở hữu:** Nam Trương & Antigravity Solution Architecture
- **Nền tảng:** Google Blogger / Blogspot XML Engine v3
- **Ngày cập nhật:** 17/09/2026

---

# MỤC LỤC
1. [Mục Tiêu & Triết Lý Kiến Trúc](#1-mục-tiêu--triết-lý-kiến-trúc)
2. [Cấu Trúc Thư Mục Chuẩn Hóa (Component-Based Directory Structure)](#2-cấu-trúc-thư-mục-chuẩn-hóa-component-based-directory-structure)
3. [Đặc Tả Master Shell (`src/template.xml`)](#3-đặc-tả-master-shell-srctemplatexml)
4. [Đặc Tả Chi Tiết Từng Component Độc Lập (`src/components/`)](#4-đặc-tả-chi-tiết-từng-component-độc-lập-srccomponents)
5. [Đặc Tả Trình Biên Dịch Build Compiler (`scripts/build.js`)](#5-đặc-tả-trình-biên-dịch-build-compiler-scriptsbuildjs)
6. [Kế Hoạch Dọn Dẹp Legacy Python Scripts](#6-kế-hoạch-dọn-dẹp-legacy-python-scripts)
7. [Tiêu Chuẩn Nghiệm Thu (Acceptance Criteria)](#7-tiêu-chuẩn-nghiệm-thu-acceptance-criteria)

---

## 1. MỤC TIÊU & TRIẾT LÝ KIẾN TRÚC

### 1.1. Bối cảnh & Thách thức
Trước đây, toàn bộ mã XML của Blogger (>1,380 dòng) bị gộp cứng trong chuỗi JavaScript của `scripts/build.js`, gây mất syntax highlighting và sinh ra nhiều script Python vá lỗi tạm thời (`make_sync2.py`, `fix_build.py`...).

Tuy nhiên, nếu chia nhỏ XML thành các mẩu vụn không hoàn chỉnh (Invalid XML Fragments), IDE sẽ báo lỗi cú pháp hàng loạt và dễ gây xung đột ID Widget.

### 1.2. Triết Lý Kiến Trúc: "Well-Formed Component Boundary"
> **Nguyên tắc cốt lõi:**  
> *"Mỗi file component phải là một khối XML độc lập, khép kín (đủ thẻ mở và thẻ đóng), bao trọn một khu vực chức năng hoặc Section của Blogger."*

1. **Master Shell (`src/template.xml`)**: Giữ thẻ `<head>`, bộ khung lưới Responsive Grid và Widget cốt lõi `Blog1` (quản lý luồng bài viết chính).
2. **Components (`src/components/*.xml`)**: Tách biệt hoàn toàn các vùng giao diện ngoại vi (Header, Profile Hero, Category Tabs, Sidebar, Footer, Modals).
3. **Build Compiler (`scripts/build.js`)**: Biên dịch nạp đệ quy các component và inject CSS/JS để tạo ra file sản phẩm duy nhất `dist/theme.xml`.

---

## 2. CẤU TRÚC THƯ MỤC CHUẨN HÓA (COMPONENT-BASED DIRECTORY STRUCTURE)

```text
blogspot-editorial-theme/
├── package.json                    <-- Định nghĩa build scripts
├── README.md                       <-- Tài liệu hướng dẫn sử dụng & thương mại
├── specs/                          <-- Thư mục chứa các tài liệu đặc tả kỹ thuật
│   ├── [Done]_001_Theme_Specification.md
│   ├── [Open]_015_Step_1_Base_Theme_Restructuring_Specification.md
│   └── [Open]_016_Step_2_Apps_And_Extensions_Architecture_Specification.md
│
├── scripts/
│   └── build.js                    <-- Compiler (~60 dòng, ghép components & inject CSS/JS)
│
├── src/
│   ├── template.xml                <-- MASTER SHELL: Bộ khung chính & Core Blog Widget
│   │
│   ├── components/                 <-- CÁC COMPONENT XML ĐỘC LẬP (WELL-FORMED)
│   │   ├── header.xml              <-- Sticky Header, Brand Logo, LinkList1
│   │   ├── profile-hero.xml        <-- Banner Cover 16:5 & Avatar tác giả
│   │   ├── category-tabs.xml       <-- Label1 Widget & thanh lọc chủ đề
│   │   ├── sidebar.xml             <-- Cột bên 30% (About, Bài nổi bật, Quote, Ads...)
│   │   ├── footer.xml              <-- Footer 3 tầng & Liên kết bản quyền
│   │   └── modals.xml              <-- Modal Tìm kiếm & Popup Đăng ký bản tin
│   │
│   ├── styles/                     <-- Core CSS Modules
│   │   ├── variables.css
│   │   ├── typography.css
│   │   ├── header-banner.css
│   │   ├── post-layout.css
│   │   ├── post-series.css
│   │   ├── affiliate-ui.css
│   │   ├── footer.css
│   │   ├── archive-page.css
│   │   ├── special-posts.css
│   │   └── ai-transparency.css
│   │
│   └── scripts/                    <-- Core JS Modules
│       ├── dark-mode.js            <-- Chạy trong <head> (Zero-FOUC)
│       ├── bilingual.js
│       ├── mobile-nav.js
│       ├── search-modal.js
│       ├── archive-page.js
│       ├── auto-toc.js
│       ├── reading-time.js
│       ├── post-series.js
│       ├── footer.js
│       ├── special-posts.js
│       ├── ai-transparency.js
│       └── homepage-interleaved.js
│
└── dist/
    └── theme.xml                   <-- File bản quyền hoàn thiện xuất bản lên Blogger
```

---

## 3. ĐẶC TẢ MASTER SHELL (`src/template.xml`)

File `src/template.xml` đóng vai trò là nhạc trưởng kết nối toàn bộ hệ thống. Dung lượng chỉ còn khoảng **350 dòng** (thay vì 1,474 dòng).

### 3.1. Cấu trúc Khung xương Master Shell:
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!-- Compiled at: ${nowIso} -->
<!DOCTYPE html>
<html b:css='false' b:defaultwidgetversion='2' b:layoutsVersion='3' b:responsive='true'
      xmlns='http://www.w3.org/1999/xhtml'
      xmlns:b='http://www.google.com/2005/gml/b'
      xmlns:data='http://www.google.com/2005/gml/data'
      xmlns:expr='http://www.google.com/2005/gml/expr'>
<head>
  <meta content='width=device-width, initial-scale=1, minimum-scale=1' name='viewport'/>
  <meta charset='UTF-8'/>

  <!-- SEO Meta & OpenGraph & Twitter Cards -->
  <!-- Google Fonts & Canonical -->
  <!-- Schema.org JSON-LD -->
  <b:include data='blog' name='all-head-content'/>

  <!-- Zero-FOUC Dark Mode -->
  <script>
  //<![CDATA[
  // {{INJECT_DARK_MODE_JS}}
  //]]>
  </script>

  <!-- Theme Designer Variables -->
  <b:skin><![CDATA[
  /* {{INJECT_BSKIN_VARIABLES}} */
  ]]></b:skin>

  <!-- Theme Core Stylesheet -->
  <style>
  /*<![CDATA[*/
  /* {{INJECT_COMBINED_CSS}} */
  /*]]>*/
  </style>
</head>
<body>
  <!-- Global Reading Progress & Modals -->
  <div class='reading-progress-bar' id='reading-progress-bar'></div>
  <!-- {{INCLUDE:components/modals.xml}} -->

  <!-- 1. STICKY HEADER -->
  <!-- {{INCLUDE:components/header.xml}} -->

  <!-- 2. MAIN SITE WRAPPER -->
  <div class='site-wrapper'>
    <!-- Profile Hero Section -->
    <!-- {{INCLUDE:components/profile-hero.xml}} -->

    <!-- Category Tabs -->
    <!-- {{INCLUDE:components/category-tabs.xml}} -->

    <!-- Layout Grid -->
    <div class='layout-grid'>
      <!-- Main Content Column: Giữ Blog1 Widget lõi -->
      <main class='main-content' id='main-content'>
        <!-- Special Posts (Hero/Spotlight), Core Feed, Single Post View -->
        <!-- In-feed Interleaved Widgets & Pre-pagination Newsletter -->
      </main>

      <!-- Sidebar Column -->
      <!-- {{INCLUDE:components/sidebar.xml}} -->
    </div>
  </div>

  <!-- 3. FOOTER 3 TẦNG -->
  <!-- {{INCLUDE:components/footer.xml}} -->

  <!-- Body-end Scripts -->
  <script>
  //<![CDATA[
  // {{INJECT_COMBINED_JS}}
  //]]>
  </script>
</body>
</html>
```

---

## 4. ĐẶC TẢ CHI TIẾT TỪNG COMPONENT ĐỘC LẬP (`src/components/`)

Mỗi component là một file XML hợp lệ, chứa các section đóng kín:

| Component File | Trách nhiệm & Phạm vi XML | Các Widget Blogger bên trong |
| :--- | :--- | :--- |
| **`header.xml`** | Chứa thẻ `<header class='site-header'>`, Logo thương hiệu, Desktop Menu, Nút DarkMode, Multi-lang, Mobile Drawer | `Header1` (Logo), `LinkList1` (Main Nav) |
| **`profile-hero.xml`** | Chứa `<b:section id='profile-hero-section'>`, Ảnh bìa Cover Banner 16:5, Avatar tác giả, Bio, CTA | `Image1` (Banner), `Image2` (Avatar), `HTML1` (Bio & Tên) |
| **`category-tabs.xml`** | Chứa `<b:section id='category-tabs-section'>`, lọc danh mục bài viết loại trừ các nhãn hệ thống (`@`, `series:`) | `Label1` (Chủ đề bài viết) |
| **`sidebar.xml`** | Chứa thẻ `<aside class='sidebar'>` (30% chiều rộng) | `HTML2` (About), `HTML14` (Nổi bật), `HTML15` (Quote), `HTML16` (Điểm tin), `HTML17` (Tiêu điểm), `PopularPosts1`, `HTML4` (Newsletter), `HTML3` (AdSense) |
| **`footer.xml`** | Chứa thẻ `<footer class='site-footer'>` thiết kế 3 tầng (Tầng 1: Cột thông tin; Tầng 2: Bản quyền & Menu đáy; Tầng 3: AdSense slot) + Section Cấu hình ẩn `HTML88` | `HTML8`, `HTML7` (Coffee), `LinkList3` (Pháp lý), `HTML9` (Mail), `LinkList4` (Social), `HTML5` (Bản quyền), `LinkList5`, `HTML6` (Ads), `HTML88` (Config) |
| **`modals.xml`** | Chứa Search Modal Overlay và Newsletter Subscription Popup | Modal HTML structures độc lập |

---

## 5. ĐẶC TẢ TRÌNH BIÊN DỊCH BUILD COMPILER (`scripts/build.js`)

Trình biên dịch mới hoạt động tự động theo quy trình 5 bước:

```text
┌────────────────────────┐
│  src/styles/*.css      │──(Gộp CSS)───────┐
└────────────────────────┘                   │
┌────────────────────────┐                   │
│  src/scripts/*.js      │──(Gộp JS)────────┼──► [scripts/build.js] ──► dist/theme.xml
└────────────────────────┘                   │     (Compiler)
┌────────────────────────┐                   │
│  src/template.xml      │──(Nạp Template)───┤
│  + src/components/*.xml│──(Nạp Components)─┘
└────────────────────────┘
```

### 5.1. Thuật toán xử lý (Processing Logic):
1. **Quét Component Placeholders**: Tìm tất cả chuỗi khớp biểu thức `<!-- {{INCLUDE:(.*?)}} -->` trong `template.xml`.
2. **Nạp & Thay thế đệ quy**: Đọc nội dung file tương ứng từ `src/[path]` và thay thế trực tiếp vào vị trí cờ giữ chỗ.
3. **Nạp & Gộp CSS**: Đọc 10 file CSS trong `src/styles/` theo thứ tự và gộp lại.
4. **Nạp & Gộp JS**: Đọc `dark-mode.js` (cho head) và 11 file JS còn lại (cho body-end).
5. **Ghi file an toàn**: Thay thế các placeholders `/* {{INJECT_COMBINED_CSS}} */` và `// {{INJECT_COMBINED_JS}}`, sau đó xóa file `dist/theme.xml` cũ và ghi file mới.

---

## 6. KẾ HOẠCH DỌN DẸP LEGACY PYTHON SCRIPTS

Ngay sau khi hệ thống component hoạt động ổn định và xác nhận lệnh `npm run build` thành công, toàn bộ 12 file Python tạm thời sẽ được xóa bỏ vĩnh viễn:
- `fix_build.py`, `fix_buttons.py`, `fix_cdata.py`, `fix_syntax.py`
- `force_new_widget.py`, `make_perfect.py`, `make_sync.py`, `make_sync2.py`
- `make_widget.py`, `move_widget.py`, `refactor_author.py`, `revert_to_hidden.py`

---

## 7. TIÊU CHUẨN NGHIỆM THU (ACCEPTANCE CRITERIA)

| Mã tiêu chuẩn | Tiêu chí đánh giá | Trạng thái bắt buộc |
| :--- | :--- | :--- |
| **AC-1.1** | **Tính hợp lệ của Components:** Mọi file trong `src/components/*.xml` đều mở/đóng thẻ đầy đủ, không báo lỗi đỏ XML trên VSCode. | PASS |
| **AC-1.2** | **Kích thước & Độ gọn gàng:** `scripts/build.js` giảm từ 1,474 dòng xuống dưới 70 dòng code. | PASS |
| **AC-1.3** | **Tương thích 100% Theme Output:** File `dist/theme.xml` sau khi build khớp toàn bộ các widget, section, tính năng song ngữ, SEO và giao diện so với phiên bản hiện tại. | PASS |
| **AC-1.4** | **Tốc độ Build:** Quá trình build hoàn thành trong thời gian < 100ms. | PASS |
| **AC-1.5** | **Sạch sẽ Thư mục gốc:** 12 script Python vá lỗi được dọn dẹp sạch sẽ, repository sẵn sàng cho việc thương mại hóa hoặc chuyển giao. | PASS |
