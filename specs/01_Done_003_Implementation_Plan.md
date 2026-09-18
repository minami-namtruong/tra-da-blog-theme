# ĐẶC TẢ KỸ THUẬT & KẾ HOẠCH PHÁT TRIỂN THEME BLOGSPOT ĐỘC BẢN
## Dự án: Editorial Profile Theme (Chuẩn SEO, AdSense, Affiliate & Song ngữ)

---

## 1. Mục tiêu Dự án
- Xây dựng bộ giao diện Blogspot (Blogger XML v3) độc bản, hiện đại theo phong cách **Editorial Profile Hybrid** (Substack/Medium/X kết hợp Magazine).
- Tối ưu hóa 100% trải nghiệm đọc (Typography-first), chuẩn SEO Google (Schema.org JSON-LD), tốc độ tải trang Core Web Vitals (PageSpeed 95-100).
- Sẵn sàng tích hợp kiếm tiền với các vị trí quảng cáo Google AdSense chống giật layout (Anti-CLS) và bộ UI Kit chuyển đổi cao cho Affiliate Marketing.
- Hỗ trợ cơ chế viết bài và chuyển đổi ngôn ngữ [VI / EN].
- **100% cấu hình động (No-Code Config)**: Quản lý Menu, Nhãn chuyên mục, Ảnh bìa, Avatar, Mạng xã hội và Footer trực quan qua tab **Bố cục (Layout)** của Blogger.

---

## 2. Thông số Kỹ thuật & Bố cục (Design Specs)

### 2.1. Kích thước & Lưới Responsive (Boxed Contained Layout)
- **Độ rộng tối đa toàn trang**: `1200px` căn giữa (`margin: 0 auto`), tạo khoảng trắng thanh lịch ở hai bên trên màn hình Desktop.
- **Tỷ lệ phân chia cột (Desktop >1024px)**:
  - Cột chính (`main`): 70% (~800px - 840px).
  - Cột bên (`sidebar`): 30% (~320px - 360px).
- **Breakpoints**:
  - `Desktop`: > 1024px (2 cột, Cover Banner cao 260px).
  - `Tablet`: 768px - 1024px (Lưới 2 cột, Cover Banner cao 200px).
  - `Mobile`: < 768px (1 cột tràn viền, Menu chuyển thành Drawer trượt mép trái, Cover Banner cao 160px).

### 2.2. Hệ thống Màu sắc (Design Tokens)
- Hỗ trợ Chế độ Sáng / Tối (Light/Dark Mode) qua CSS Custom Properties với Zero-FOUC script.

### 2.3. Typography chuẩn tiếng Việt
- Font gia đình: `Be Vietnam Pro`, `Inter`, system-ui, -apple-system, sans-serif.
- Cỡ chữ nội dung bài đọc: `18.5px`, `line-height: 1.75`.
- Khung đọc tối ưu: `max-width: 720px`.

---

## 3. Cấu trúc Thành phần Chi tiết
- **Header & Navigation**: Sticky top bar, Dynamic LinkList widget, Dark mode switcher, Search popup.
- **Profile Cover Hero**: Cover banner 16:5, Avatar tròn viền nổi, Tên tác giả + Bio, Social icons, Subscribe button.
- **Dynamic Category / Label Tabs**: Tab nhãn dạng pill lọc bài theo chủ đề.
- **Main Feed & Single Post**: Breadcrumbs, Thẻ H1 duy nhất, Metadata (Thời gian đọc, Ngày đăng, Nút song ngữ [VI|EN]), Auto Table of Contents (TOC), Vị trí AdSense chống CLS (Đầu/Giữa/Cuối bài), UI Kit Affiliate (Callouts, Review box, Button CTA), Author Bio box, Related posts, Comment system phẳng.
- **Sidebar (30%)**: About Me, Bài xem nhiều (01, 02..), Sticky AdSense banner, Form nhận bản tin.
- **Footer 4 Cột chuẩn Quốc tế**:
  - Cột 1: Thương hiệu & Sứ mệnh.
  - Cột 2: Khám phá chuyên mục.
  - Cột 3: Trang Pháp lý & SEO (Privacy Policy, Terms of Service, Affiliate Disclaimer, Contact & Work with me).
  - Cột 4: Mạng xã hội & Bản tin email.
  - Bottom Bar: Bản quyền + Nút cuộn lên đầu trang.

---

## 4. Lộ trình Triển khai Code & Đóng gói
1. Khởi tạo cấu trúc dự án độc lập với Node.js build system (`package.json`, `scripts/build.js`).
2. Viết toàn bộ hệ thống CSS module hóa trong `src/styles/`.
3. Viết toàn bộ động cơ JavaScript tương tác trong `src/scripts/`.
4. Viết các module Blogger XML v3 trong `src/template/`.
5. Tạo trang `src/preview.html` để kiểm tra trực tiếp trên trình duyệt local.
6. Build ra file `dist/theme.xml` chuẩn và tài liệu `README.md`.
