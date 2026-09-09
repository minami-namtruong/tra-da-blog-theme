# ĐẶC TẢ YÊU CẦU KỸ THUẬT & THIẾT KẾ THEME BLOGSPOT ĐỘC BẢN
## Tên dự án: Editorial Profile Blogger Theme (Minimalist Editorial + Personal Branding)
- **Phiên bản:** 1.0.0
- **Tác giả & Chủ sở hữu:** Nam Trương
- **Nền tảng đích:** Google Blogger / Blogspot (Blogger XML Engine Version 3)
- **Mục đích tài liệu:** Cung cấp tài liệu đặc tả toàn diện (Single Source of Truth) về thiết kế, kiến trúc kỹ thuật, cấu trúc dữ liệu, hệ thống monetization (AdSense + Affiliate), cơ chế song ngữ và quy chuẩn layout động để bất kỳ kỹ sư hoặc mô hình AI nào cũng có thể đọc hiểu và triển khai chính xác 100%.

---

# MỤC LỤC
1. [Tổng Quan Dự Án & Triết Lý Thiết Kế](#1-tổng-quan-dự-án--triết-lý-thiết-kế)
2. [Kiến Trúc Kỹ Thuật & Blogger Engine](#2-kiến-trúc-kỹ-thuật--blogger-engine)
3. [Hệ Thống Thiết Kế (Design System & Tokens)](#3-hệ-thống-thiết-kế-design-system--tokens)
4. [Đặc Tả Chi Tiết Từng Component & Bố Cục Giao Diện](#4-đặc-tả-chi-tiết-từng-component--bố-cục-giao-diện)
   - 4.1 [Sticky Top Navigation (Thanh Menu Cố Định)](#41-sticky-top-navigation)
   - 4.2 [Profile Cover Hero Section (Ảnh Bìa & Tác Giả)](#42-profile-cover-hero-section)
   - 4.3 [Dynamic Category Tabs (Thanh Lọc Chủ Đề Động)](#43-dynamic-category-tabs)
   - 4.4 [Trang Chủ & Feed Danh Sách Bài Viết (Homepage / Archive)](#44-trang-chủ--feed-danh-sách-bài-viết)
   - 4.5 [Trang Chi Tiết Bài Viết (Single Post Page)](#45-trang-chi-tiết-bài-viết)
   - 4.6 [Sidebar Thông Minh (Cột Phụ 30%)](#46-sidebar-thông-minh)
   - 4.7 [Footer 4 Cột & Hệ Thống Pháp Lý Chuẩn AdSense](#47-footer-4-cột--hệ-thống-pháp-lý-chuẩn-adsense)
5. [Đặc Tả Chiến Lược Kiếm Tiền: AdSense & Affiliate Marketing](#5-đặc-tả-chiến-lược-kiếm-tiền-adsense--affiliate-marketing)
6. [Đặc Tả Cơ Chế Bài Viết Song Ngữ (Bilingual Mechanism)](#6-đặc-tả-cơ-chế-bài-viết-song-ngữ-bilingual-mechanism)
7. [Đặc Tả Cấu Hình Động Không Cần Chạm Code (Blogger Layout Dynamic Architecture)](#7-đặc-tả-cấu-hình-động-không-cần-chạm-code)
8. [Tiêu Chuẩn Nghiệm Thu & Kiểm Thử Chất Lượng (QA & Acceptance Criteria)](#8-tiêu-chuẩn-nghiệm-thu--kiểm-thử-chất-lượng)

---

## 1. TỔNG QUAN DỰ ÁN & TRIẾT LÝ THIẾT KẾ

### 1.1. Bối cảnh & Mục đích
- Xây dựng một trang blog cá nhân độc bản, nơi tác giả chia sẻ các bài viết sâu sắc về trải nghiệm sống, góc nhìn, quan điểm cá nhân, review sách, công nghệ và phát triển bản thân.
- Không phục vụ bán hàng trực tiếp (E-commerce), nhưng được tối ưu hóa toàn diện để kiếm tiền thụ động qua:
  - **Google AdSense**: Bố trí sẵn các vị trí đặt quảng cáo có tỷ lệ nhấp (CTR) cao và đáp ứng 100% chính sách duyệt web của Google.
  - **Tiếp thị liên kết (Affiliate Marketing)**: Trang bị sẵn bộ công cụ giao diện (UI Kit) chuyển đổi cao (Callout, Review box, nút CTA nổi bật).
  - **Đăng ký nhận tin & Ủng hộ (Newsletter / Membership)**: Tích hợp sẵn form Substack/Mailchimp và nút ủng hộ tác giả (Buy Me a Coffee / Momo).

### 1.2. Triết lý Thiết kế (Core Philosophy)
1. **Editorial & Typography-first**: Trải nghiệm đọc là ưu tiên số 1. Phông chữ tiếng Việt chuẩn mực, độ tương phản sắc nét, khoảng cách dòng thoáng đãng, chiều rộng khối chữ tối ưu cho mắt nhìn.
2. **Personal Branding (Phong cách Profile Hero)**: Nhấn mạnh nhân hiệu tác giả qua khung ảnh bìa (Cover Banner 16:5) kết hợp Avatar tròn viền nổi và Bio ngắn gọn ngay từ đầu trang.
3. **Hiệu năng Tối đa (Core Web Vitals 95–100)**: Loại bỏ toàn bộ thư viện cồng kềnh (Không jQuery, không Bootstrap/Tailwind runtime). Chỉ sử dụng HTML5 ngữ nghĩa, CSS thuần mô đun hóa và Vanilla JavaScript siêu nhẹ.
4. **Không Giật Màn Hình (Zero-FOUC Dark Mode & Anti-CLS)**: Chuyển đổi giao diện sáng/tối mượt mà không chớp nháy; các khung quảng cáo và hình ảnh đều có kích thước giữ chỗ để tránh làm nhảy bài viết khi tải trang.
5. **Cấu hình Động 100% (No-Code Config)**: Người dùng có thể thay đổi Menu, Dropdown, Nhãn bài viết, Banner, Avatar, Mạng xã hội, Liên kết Footer ngay trong trang quản trị **Bố cục (Layout)** của Blogger.

---

## 2. KIẾN TRÚC KỸ THUẬT & BLOGGER ENGINE

### 2.1. Cấu hình Thẻ Gốc Blogger XML v3
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html b:css='false' b:responsive='true' b:version='2' 
      xmlns='http://www.w3.org/1999/xhtml' 
      xmlns:b='http://www.google.com/2005/gml/b' 
      xmlns:data='http://www.google.com/2005/gml/data' 
      xmlns:expr='http://www.google.com/2005/gml/expr'>
```
- `b:css='false'`: Tắt hoàn toàn CSS mặc định nặng nề của hệ thống Blogger cũ.
- `b:responsive='true'`: Bật chế độ tương thích đa thiết bị của Blogger.

### 2.2. Tối ưu SEO & Schema.org JSON-LD
Theme tự động sinh cấu trúc dữ liệu JSON-LD chuẩn xác theo Google Search Central:
- **Schema `WebSite`**: Khai báo tên website, URL chính thức và hộp tìm kiếm `SearchAction`.
- **Schema `Person`**: Khai báo thực thể tác giả (Tên, Ảnh đại diện, Nghề nghiệp, Các trang MXH) phục vụ tiêu chuẩn Google E-E-A-T.
- **Schema `Article` / `BlogPosting`** (trên trang bài viết):
  - `headline`: Tiêu đề bài viết.
  - `description`: Trích đoạn hoặc Search Description.
  - `datePublished` & `dateModified`: Ngày đăng và ngày sửa bài.
  - `author`: Liên kết đến Schema Person.
  - `image`: Ảnh đại diện chất lượng cao (Featured Image).
- **Schema `BreadcrumbList`**: Điều hướng phân cấp Trang chủ > Chuyên mục > Tiêu đề bài.
- **Xử lý Canonical URL động**: Loại bỏ hoàn toàn tham số trùng lặp URL di động `?m=1` và `?m=0`.

### 2.3. Tối ưu Hình ảnh với Blogger Image CDN Engine
- Tự động thay đổi tham số kích thước ảnh từ CDN của Google:
  - Ảnh Thumbnail trang chủ: `/w720-h400-c/` (cắt tỉ lệ 16:9 sắc nét, dung lượng siêu nhẹ WebP).
  - Ảnh Cover bài viết: `/s1600/` hoặc `/w1200-h630-c/`.
- Thiết lập `loading="lazy"`, `decoding="async"` cho toàn bộ ảnh dưới màn hình đầu tiên (Below the fold).
- Thiết lập `fetchpriority="high"` cho ảnh bài viết nổi bật đầu tiên để đạt chỉ số LCP < 1.8s.

---

## 3. HỆ THỐNG THIẾT KẾ (DESIGN SYSTEM & TOKENS)

### 3.1. Kích Thước & Lưới Khung Chứa (Boxed Contained Layout)
- **Độ rộng tối đa (`--max-width`)**: `1200px` căn giữa (`margin: 0 auto`).
- **Khung đọc bài viết (`--content-max-width`)**: `740px` (độ rộng vàng giúp mắt đọc liên tục 2.000–3.000 từ không mỏi).
- **Khoảng cách lề ngoài (Container Padding)**:
  - Desktop: `0 1.5rem` (~24px).
  - Mobile: `0 1rem` (~16px).
- **Hệ thống Bo góc (Border Radius)**:
  - `--radius-sm`: `8px` (nút nhỏ, tag badge).
  - `--radius-md`: `12px` (card nhỏ, ảnh minh họa, ô input).
  - `--radius-lg`: `16px` (Card bài viết, Banner, Hộp review, Footer).
  - `--radius-full`: `9999px` (Pill tag, nút tròn, avatar).

### 3.2. Bảng Màu Thiết Kế (Design Tokens)

```css
:root {
  /* Giao diện Sáng (Light Theme) */
  --bg-body: #f8fafc;
  --bg-card: #ffffff;
  --bg-surface: #f1f5f9;
  --bg-input: #ffffff;
  
  --text-main: #0f172a;       /* Slate 900 */
  --text-muted: #475569;      /* Slate 600 */
  --text-light: #94a3b8;      /* Slate 400 */
  
  --border-color: #e2e8f0;    /* Slate 200 */
  --border-hover: #cbd5e1;    /* Slate 300 */
  
  --primary: #2563eb;         /* Blue 600 */
  --primary-hover: #1d4ed8;   /* Blue 700 */
  --primary-light: #eff6ff;   /* Blue 50 */
  
  --accent: #f59e0b;          /* Amber 500 (Đánh giá / Điểm nhấn) */
  --success: #10b981;         /* Emerald 500 (Ưu điểm / Tip) */
  --warning: #f59e0b;         /* Amber 500 */
  --danger: #ef4444;          /* Red 500 (Nhược điểm / Cảnh báo) */

  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
  --shadow-md: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
  --shadow-lg: 0 10px 30px -4px rgba(0, 0, 0, 0.08);
  --transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

[data-theme="dark"] {
  /* Giao diện Tối (Dark Theme) */
  --bg-body: #090d16;        /* Deep Navy Night */
  --bg-card: #131b2e;        /* Dark Slate Card */
  --bg-surface: #1e293b;     /* Surface Elements */
  --bg-input: #1a233a;
  
  --text-main: #f1f5f9;       /* Slate 100 */
  --text-muted: #94a3b8;      /* Slate 400 */
  --text-light: #64748b;      /* Slate 500 */
  
  --border-color: #1e293b;
  --border-hover: #334155;
  
  --primary: #3b82f6;         /* Blue 500 */
  --primary-hover: #60a5fa;   /* Blue 400 */
  --primary-light: rgba(59, 130, 246, 0.15);

  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 20px -2px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 30px -4px rgba(0, 0, 0, 0.5);
}
```

### 3.3. Quy Chuẩn Typography Tiếng Việt
- **Font gia đình chính**: `"Be Vietnam Pro", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` (phông chữ được thiết kế tối ưu riêng cho dấu thanh tiếng Việt).
- **Font trích dẫn & văn chương (tùy chọn)**: `"Lora", "Merriweather", Georgia, serif`.
- **Cỡ chữ nội dung bài viết (`.post-body`)**: `1.15rem` (~`18.5px`), `line-height: 1.8`.
- **Thang đo Heading**:
  - `h1`: `2.25rem` (`36px`), font-weight 800, line-height 1.25.
  - `h2`: `1.75rem` (`28px`), font-weight 700, line-height 1.35, margin-top 2em.
  - `h3`: `1.35rem` (`22px`), font-weight 700, margin-top 1.6em.
  - `h4`: `1.15rem` (`18px`), font-weight 600.

---

## 4. ĐẶC TẢ CHI TIẾT TỪNG COMPONENT & BỐ CỤC GIAO DIỆN

### 4.1. Sticky Top Navigation (Thanh Menu Cố Định)
- **Vị trí**: Cố định ở mép trên cùng trình duyệt (`position: sticky; top: 0`), độ cao `64px`.
- **Hiệu ứng Kính Mờ (Glassmorphism)**: Nền bán trong suốt `rgba(255,255,255,0.85)` (Light) hoặc `rgba(19,27,46,0.85)` (Dark) với `backdrop-filter: blur(12px)`.
- **Thành phần**:
  1. *Bên trái*: Brand Logo / Tên Blog cá nhân (dấu chấm màu Primary `.`).
  2. *Ở giữa*: Menu điều hướng ngang lấy từ widget `LinkList1`.
     - Hỗ trợ Menu con xổ xuống (Dropdown) khi tên menu có dấu gạch dưới (VD: `_Góc nhìn cuộc sống`).
  3. *Bên phải*:
     - Nút bật/tắt Dark Mode (Icon Mặt trăng 🌙 / Mặt trời ☀️).
     - Nút Kính lúp mở ô tìm kiếm nhanh (Search Modal).
- **Mobile Responsive**: Màn hình <768px tự động ẩn menu ngang và hiển thị nút 3 gạch (Hamburger Menu). Bấm vào sẽ mở **Thanh trượt Navigation Drawer** từ mép trái ra cực kỳ mượt mà.

### 4.2. Profile Cover Hero Section (Ảnh Bìa & Tác Giả)
- **Vị trí**: Nằm ngay dưới Top Navigation, bao bọc trong khung Bo tròn `16px` có đổ bóng nhẹ.
- **Ảnh bìa (Cover Banner)**:
  - Tỉ lệ 16:5 (Desktop cao `240px - 260px`, Mobile cao `160px`).
  - Hỗ trợ thay ảnh nền tùy ý thông qua widget `HTML1` trong trang Bố cục (Layout).
- **Khung thông tin tác giả (Overlap Card)**:
  - **Avatar tròn**: Đường kính `120px` (Desktop) hoặc `90px` (Mobile), có viền trắng dày `4px` đè lên mép dưới ảnh bìa (`margin-top: -60px`).
  - **Tên tác giả & Slogan/Bio**: Hiển thị tên lớn (H1/H2) và dòng mô tả ngắn 1-2 câu về định vị bản thân.
  - **Thanh Mạng Xã Hội Cá Nhân**: Icon Facebook, X/Twitter, Threads, LinkedIn, Instagram,...
  - **Nút CTA Nổi bật**: Nút `[ 💌 Nhận Bản Tin ]` cuộn nhanh xuống form đăng ký nhận email.
- **Hành vi trên Trang Bài Viết**: Giữ nguyên kích thước chuẩn giống trang chủ (theo yêu cầu của tác giả), tối ưu SEO bằng cách đặt tên blog dạng link về trang chủ thay vì H1.

### 4.3. Fullscreen Editorial Timeline Archive (Mục Lục Toàn Thư & Cây Dòng Thời Gian Dọc)
- **Cơ chế kích hoạt**:
  - Bấm vào liên kết **"Mục Lục"** trên Menu ngang hoặc Menu Mobile Drawer.
  - Bấm vào icon cuộn giấy `📜` trên Top Header Actions.
  - Hỗ trợ bất kỳ liên kết nào có class `.timeline-open-trigger` hoặc `href="#timeline"`.
- **Giao diện Màn Trập Toàn Màn Hình (Fullscreen Editorial Canvas)**:
  - **Không dùng Popup hộp cứng**: Mở ra một không gian đọc toàn màn hình liền mạch, đồng bộ 100% màu nền (`var(--bg-body)`), font chữ (`--font-serif`) và triết lý thiết kế với trang chủ.
  - **Thanh Topbar tối giản (Sticky Topbar)**: Logo trang bên trái, nút đóng sang trọng `[ Quay lại trang  ESC  ✕ ]` bên phải giúp trở về trang đang đọc tức thì.
  - **Thanh công cụ lọc (Toolbar)**: Ô tìm kiếm tối giản (Search/Filter) hỗ trợ lọc bài viết tức thì theo từ khóa, chuyên mục hoặc năm kèm bộ đếm tổng số bài/năm và nút điều khiển nhanh `[ Mở tất cả / Thu gọn ]`.
  - **Node Năm tinh tế & Có thể Đóng/Mở (Collapsible Year Accordion)**:
    - Font Serif lớn thanh lịch (`1.75rem`), không có viền nút thô.
    - Đi kèm đường chỉ ngang và chevron tinh tế.
    - **Tương tác**: Click vào Năm để gập lại (collapse) hoặc mở ra (expand) danh sách bài của năm đó.
    - **Không trôi (No sticky)**: Node năm nằm trong luồng cuộn tự nhiên của trang, không di chuyển theo khi scroll xuống dưới.
  - **Thẻ Bài Viết Dạng Phẳng (Flat Post Cards - Nhất quán với trang chủ)**:
    - Thẻ ngang tinh tế: `[ 🏷️ Category Pill ] [ Tiêu đề bài viết ] [ 📅 DD/MM ] [ → ]`.
    - Bo góc `12px`, viền `1px solid var(--border-color)`, hiệu ứng hover nổi nhẹ `translateY(-2px) translateX(3px)`.
    - Category Filter Pills: Thanh viên thuốc danh mục ngang (`✦ Tất cả`, `Góc Nhìn`, `Trải Nghiệm`,...) tự động lọc danh sách tức thì khi bấm chọn.
  - **Tự động hóa 100% trên Blogger**: Sử dụng Blogger JSON Feed API (`/feeds/posts/summary?alt=json&max-results=500`) tự động quét và gom nhóm toàn bộ bài viết mà không cần nhập tay.

### 4.4. Dynamic Category Tabs (Thanh Lọc Chủ Đề Động)
- **Widget nguồn**: Sử dụng widget `Label1` chuẩn của Blogger.
- **Giao diện**: Dạng thanh trượt ngang chứa các viên thuốc (Pill tabs) bo tròn: `[ Tất cả ]`, `[ Góc nhìn & Tư duy ]`, `[ Trải nghiệm sống ]`, `[ Sách & Công cụ ]`,...
- **Tương tác**: Tab đang chọn có nền màu Primary nổi bật. Hỗ trợ vuốt ngang mượt mà trên điện thoại mà không lộ thanh cuộn xấu xí.

### 4.4. Trang Chủ & Feed Danh Sách Bài Viết (Homepage / Archive)
- **Bố cục Lưới 2 cột (Desktop)**:
  - Cột chính (70% ~ 800px): Danh sách bài viết.
  - Cột bên (30% ~ 340px): Sidebar.
- **Cấu trúc Post Card (Thẻ bài viết)**:
  - Thiết kế ngang 2 cột (Content bên trái + Thumbnail bên phải trên Desktop; tự động xếp dọc trên Mobile).
  - *Badge chuyên mục*: Chữ in hoa nhỏ màu Primary.
  - *Tiêu đề bài viết (H2)*: Font chữ đậm nét, hover chuyển màu.
  - *Trích đoạn ngắn (Snippet)*: Tự động cắt 2 dòng gọn gàng (`-webkit-line-clamp: 2`).
  - *Metadata*: Ngày đăng (📅) + Thời gian đọc ước tính (⏱️).
  - *Ảnh thumbnail*: Bo góc 12px, load ảnh WebP chuẩn tỉ lệ 16:9 từ CDN Blogger.
- **Phân trang số (Numbered Pagination)**: Hiển thị `[ 1 ]  [ 2 ]  [ 3 ]  [ Tiếp theo » ]` mượt mà.

### 4.5. Trang Chi Tiết Bài Viết (Single Post Page)
1. **Thanh Tiến Trình Đọc (Reading Progress Bar)**: Dải màu Gradient mỏng `3px` chạy theo độ cuộn bài viết ở mép trên cùng màn hình.
2. **Đường dẫn phân cấp (Breadcrumbs)**: `Trang chủ > Chuyên mục > Tiêu đề bài viết`.
3. **Tiêu đề bài viết (`<h1>` duy nhất)**: Đảm bảo chuẩn SEO tuyệt đối.
4. **Thanh Post Meta & Nút Chuyển Đổi Song Ngữ**:
   - Avatar tác giả nhỏ, tên tác giả, ngày xuất bản, ngày cập nhật, số phút đọc.
   - **Nút gạt Song ngữ [ 🇻🇳 Tiếng Việt | 🇬🇧 English ]**: Bấm chuyển ngôn ngữ nội dung tức thì.
5. **Vị trí AdSense 1 (Above the fold)**: Khung quảng cáo dưới tiêu đề có định sẵn chiều cao chống giật layout.
6. **Mục Lục Tự Động (Auto Table of Contents - TOC)**:
   - Tự động bóc tách toàn bộ thẻ `<h2>`, `<h3>` trong bài viết.
   - Có nút bấm **[Thu gọn ▲ / Mở rộng ▼]**.
   - Nhấp vào mục lục sẽ cuộn mượt (Smooth Scroll) tới đúng vị trí tiêu đề.
7. **Khung Nội Dung Bài Viết (`.post-body`)**:
   - Cỡ chữ `18.5px`, line-height `1.8`.
   - Khối trích dẫn (Blockquote) có viền màu nổi bật và nền mờ sang trọng.
   - **Bộ UI Kit Soạn Thảo Cho Affiliate & Content**:
     - `.callout-tip` (Khung viền xanh ngọc cho mẹo/kinh nghiệm).
     - `.callout-warning` (Khung viền cam hổ phách cho lưu ý quan trọng).
     - `.review-card` (Khung đánh giá sản phẩm: Tên sản phẩm, Đánh giá sao, Cột Ưu điểm/Nhược điểm, Nút CTA mua hàng).
     - `.btn-affiliate` (Nút bấm mua hàng/xem thêm có hiệu ứng hover bóng đổ thu hút click).
8. **Vị trí AdSense 2 (In-Article Ad)**: Tự động chèn giữa bài.
9. **Vị trí AdSense 3 (Bottom Post Ad)**: Đặt ở cuối bài viết trước phần bình luận.
10. **Thanh Chia Sẻ Mạng Xã Hội**: Nút chia sẻ trực tiếp lên Facebook, X/Twitter, Threads, LinkedIn và nút Copy Link (kèm thông báo "Đã sao chép link").
11. **Box Tác Giả (Author Bio)**: Ảnh đại diện, dòng giới thiệu chuyên sâu và nút `[ ☕ Mời tôi ly cà phê ]`.
12. **Điều Hướng Bài Trước / Bài Sau (Next / Prev Post)**: Card chuyển bài trực quan.
13. **Bài Viết Liên Quan (Related Posts)**: Lưới 3 bài viết cùng chuyên mục.
14. **Khu Vực Bình Luận**: Hệ thống bình luận mặc định Blogger được làm mới hoàn toàn theo phong cách phẳng, hỗ trợ tài khoản Google.

### 4.6. Sidebar Thông Minh (Cột Phụ 30%)
- **Widget 1: About Me Card**: Tóm tắt tiểu sử tác giả, link MXH.
- **Widget 2: Trending / Popular Posts**: Top bài viết xem nhiều nhất hiển thị dạng danh sách đánh số thanh lịch `01`, `02`, `03`.
- **Widget 3: Sticky AdSense Banner**: Khung banner quảng cáo 300x250 hoặc 300x600 dính theo màn hình khi cuộn chuột (`position: sticky; top: 80px`).
- **Widget 4: Newsletter Box**: Khung nhận bài viết mới qua email.

### 4.7. Footer 4 Cột & Hệ Thống Pháp Lý Chuẩn AdSense
Footer được chia làm **4 Cột trên Desktop** và co về 1-2 cột trên Mobile:
- **Cột 1: Thương Hiệu & Tuyên Ngôn**:
  - Logo blog, đoạn văn ngắn về sứ mệnh và giá trị của blog, biểu tượng bản quyền.
- **Cột 2: Khám Phá Chuyên Mục**:
  - Danh sách các chuyên mục/nhãn chính để người đọc tiện tra cứu.
- **Cột 3: Pháp Lý & Minh Bạch (Bắt buộc cho Google AdSense & Affiliate)**:
  - `Chính sách bảo mật (Privacy Policy)`: Khai báo Cookie, Google Analytics, AdSense.
  - `Điều khoản sử dụng (Terms of Service)`: Quy định bản quyền bài viết và ứng xử bình luận.
  - `Tuyên bố miễn trừ trách nhiệm (Affiliate Disclaimer)`: Minh bạch việc chèn link tiếp thị liên kết theo luật FTC & Google.
  - `Liên hệ & Hợp tác (Contact Us)`: Form và email liên hệ tài trợ/trao đổi.
- **Cột 4: Đăng Ký Bản Tin & Mạng Xã Hội**:
  - Form nhập email nhận bài viết mới.
  - Lưới Icon kết nối đa kênh: Facebook, X, Threads, LinkedIn, YouTube, Instagram, RSS Feed.
- **Thanh Dưới Cùng (Bottom Copyright Bar)**:
  - Dòng bản quyền: `© 2026 [Tên Blog]. All rights reserved.`
  - Nút `[ ⬆ Cuộn lên đầu trang ]` mượt mà.

---

## 5. ĐẶC TẢ CHIẾN LƯỢC KIẾM TIỀN: ADSENSE & AFFILIATE MARKETING

### 5.1. Chiến Lược Google AdSense Chống Giật Khung (Anti-CLS)
Mỗi khung quảng cáo được bao bọc trong class `.adsense-slot` với chiều cao tối thiểu định sẵn:
- `.adsense-top`: `min-height: 100px` (đặt dưới tiêu đề bài viết).
- `.adsense-infeed`: `min-height: 250px` (tự động xuất hiện giữa các đoạn văn).
- `.adsense-bottom`: `min-height: 250px` (đặt ở cuối nội dung bài).
- `.adsense-sidebar`: `min-height: 300px` (đặt ở sidebar bám dính khi cuộn).

*Lợi ích:* Khi Google AdSense mất 0.5s - 1.5s để tải mã quảng cáo, khung đã có sẵn khoảng trống vừa khít. Trang web không hề bị nhảy nội dung xuống dưới -> **Chỉ số CLS = 0 (đạt điểm xanh Core Web Vitals)**.

### 5.2. Chiến Lược Tiếp Thị Liên Kết (Affiliate Marketing) An Toàn & Chuyển Đổi Cao
- **Thuộc tính SEO an toàn tuyệt đối**: Mọi link Affiliate xuất phát từ nút `.btn-affiliate` hoặc trong khung review đều được gắn:
  `rel="nofollow sponsored" target="_blank"`
  (Tuân thủ 100% nguyên tắc chống thao túng PageRank của thuật toán Google SpamBrain).
- **Hộp Đánh Giá Sản Phẩm (`.review-card`)**: Cung cấp cấu trúc trực quan gồm Điểm đánh giá, Danh sách Ưu điểm (Pros - màu xanh), Danh sách Nhược điểm (Cons - màu đỏ), và Nút bấm CTA Gradient nổi bật kích thích tỷ lệ chuyển đổi nhấp chuột (CTR).

---

## 6. ĐẶC TẢ CƠ CHẾ BÀI VIẾT SONG NGỮ (BILINGUAL MECHANISM)

### 6.1. Phương Pháp In-Post Bilingual Switcher (Trong cùng bài viết)
- **Cách soạn thảo trong Blogger Editor**:
  ```html
  <div data-lang="vi">
    <!-- Toàn bộ nội dung bài viết bằng Tiếng Việt -->
  </div>

  <div data-lang="en" style="display:none;">
    <!-- Entire article content in English -->
  </div>
  ```
- **Hành vi của Theme**:
  - Theme tự động nhận diện nếu bài viết có chứa thẻ `data-lang="en"` thì sẽ hiển thị thanh gạt **[ 🇻🇳 Tiếng Việt | 🇬🇧 English ]** ở đầu bài.
  - Khi người đọc bấm **English**: Khối Tiếng Việt ẩn đi, khối Tiếng Anh hiện ra tức thì mà không cần tải lại trang.
  - Trạng thái chọn ngôn ngữ được lưu tạm vào `sessionStorage` để khi người đọc chuyển sang bài khác cùng có song ngữ, ngôn ngữ đã chọn sẽ được ưu tiên hiển thị trước.

---

## 7. ĐẶC TẢ CẤU HÌNH ĐỘNG KHÔNG CẦN CHẠM CODE (BLOGGER LAYOUT DYNAMIC ARCHITECTURE)

Toàn bộ các vùng chức năng được chia thành các `<b:section>` và `<b:widget>` có thể cấu hình 100% trong trang quản trị **Bố cục (Layout)** của Blogger:

| Khu vực (Section ID) | Loại Widget (Type) | Mục đích quản trị trực quan |
| :--- | :--- | :--- |
| `nav-menu-section` | `LinkList` | Thêm, sửa, xóa, sắp xếp menu chính & dropdown (quy ước `_`). |
| `profile-hero-section` | `HTML` hoặc `Profile` | Thay đổi link ảnh bìa, avatar, tên tác giả, bio và nút CTA. |
| `category-tabs-section` | `Label` | Chọn lọc các nhãn chuyên mục muốn hiển thị trên thanh Tab ngang. |
| `main` | `Blog` | Tự động render danh sách bài viết trang chủ và chi tiết bài viết. |
| `sidebar-section` | `HTML`, `PopularPosts` | Quản lý box About Me, Top bài đọc nhiều, Banner AdSense Sidebar. |
| `footer-legal-section` | `LinkList` | Quản lý link các trang pháp lý: Privacy, Terms, Disclaimer, Contact. |
| `footer-social-section` | `LinkList` | Quản lý danh sách URL mạng xã hội cá nhân. |

---

## 8. TIÊU CHUẨN NGHIỆM THU & KIỂM THỬ CHẤT LƯỢNG (QA & ACCEPTANCE CRITERIA)

| Hạng mục kiểm tra | Tiêu chuẩn bắt buộc | Phương pháp xác minh |
| :--- | :--- | :--- |
| **Cú pháp Blogger XML** | Hợp lệ 100%, không lỗi thẻ lồng nhau | Lưu thành công trong Blogger Theme Editor |
| **Tốc độ tải trang** | Mobile >= 90 điểm, Desktop >= 98 điểm | Google PageSpeed Insights |
| **Core Web Vitals** | LCP < 2.0s, CLS = 0, INP < 200ms | Chrome DevTools Performance & Web Vitals |
| **Dữ liệu có cấu trúc SEO** | Hợp lệ Schema `Article`, `BreadcrumbList`, `Person` | Google Rich Results Test Tool |
| **Chế độ Dark Mode** | Chuyển đổi mượt, không chớp trắng khi tải lại | Kiểm tra trên Chrome, Safari, Firefox |
| **Tính tương thích Thiết bị** | Không vỡ khung, không tràn viền ngang ở mọi kích thước từ 360px đến 2560px | Responsive Design Mode |
| **Cơ chế Song ngữ** | Chuyển đổi mượt mà giữa VI và EN | Test click trên bài viết mẫu |
| **Quản trị Bố cục** | Mọi thay đổi trong tab Layout hiển thị tức thì ra ngoài web | Test sửa LinkList và Label trong Blogger Admin |

---
**Tài liệu này là căn cứ kỹ thuật chuẩn mực để tiến hành lập trình toàn bộ mã nguồn của Theme.**\n
---

## 9. ĐẶC TẢ TÙY BIẾN MÀU SẮC (THEME DESIGNER) & NHÚNG WIDGET BÊN THỨ 3

### 9.1. Kiến Trúc Biến Màu Trực Quan (Blogger Theme Designer Variables)
Trong thẻ `<b:skin>`, theme khai báo đầy đủ các thẻ `<Variable>` để người dùng có thể đổi màu trực quan trong giao diện **Chủ đề -> Tùy chỉnh (Theme Customize)**:

```xml
<Variable name="body.background" description="Màu nền toàn trang" type="color" default="#f8fafc" value="#f8fafc"/>
<Variable name="card.background" description="Màu nền thẻ Card & Bài viết" type="color" default="#ffffff" value="#ffffff"/>
<Variable name="primary.color" description="Màu chủ đạo (Buttons, Links, Badges)" type="color" default="#2563eb" value="#2563eb"/>
<Variable name="accent.color" description="Màu nhấn (Review, Đánh giá)" type="color" default="#f59e0b" value="#f59e0b"/>
<Variable name="text.main" description="Màu chữ chính" type="color" default="#0f172a" value="#0f172a"/>
<Variable name="text.muted" description="Màu chữ phụ (Metadata, Snippet)" type="color" default="#475569" value="#475569"/>
<Variable name="font.family" description="Phông chữ chính" type="font" default="normal 400 16px 'Be Vietnam Pro', sans-serif" value="normal 400 16px 'Be Vietnam Pro', sans-serif"/>
```

### 9.2. Kiến Trúc Nhúng Widget & Script Bên Thứ 3 (Third-Party Integration)
Toàn bộ các vùng giao diện đều được cấu hình với thuộc tính `showaddelement="yes"` để cho phép người dùng bấm **"+ Thêm Tiện ích" (+ Add a Gadget)** -> chọn **HTML/JavaScript** để dán bất kỳ mã nhúng nào:

1. **Khung Nhúng Header / Top Bar**: Nhúng thông báo khẩn cấp, mã khuyến mãi hoặc thanh đếm ngược.
2. **Khung Nhúng Dưới Tiêu Đề Bài Viết**: Nhúng mã quảng cáo bên thứ 3, nút tài trợ nhanh.
3. **Khung Nhúng Sidebar**: Nhúng nút Buy Me A Coffee, form Substack/Mailchimp, Fanpage Facebook, Spotify player.
4. **Khung Nhúng Footer**: Nhúng Google Tag Manager, Meta Pixel, Chatbot Zalo/Messenger.
5. **Responsive Iframe Container trong Bài Viết**: Định dạng sẵn CSS để mọi iframe (YouTube, Spotify, CodePen, Bảng so sánh Affiliate) tự động co dãn 100% bề ngang, không bị tràn màn hình điện thoại.
