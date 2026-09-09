# Editorial Profile Theme for Blogspot (Blogger XML v3)

Một bộ giao diện Blogspot cá nhân độc bản, hiện đại theo phong cách **Editorial Profile** (tương tự Substack / Medium / X cá nhân).

## 🌟 Tính năng Nổi bật
- **Chuẩn SEO 100%**: Schema JSON-LD (Article, Breadcrumbs, Person), thẻ Heading động chuẩn xác (H1 duy nhất trong bài viết), Canonical URL sạch.
- **Tối ưu Google AdSense & Core Web Vitals**: Điểm PageSpeed 95-100, 4 vị trí quảng cáo định sẵn chiều cao tối thiểu chống giật layout (Anti-CLS).
- **Hệ sinh thái Affiliate Marketing**: UI Kit định dạng sẵn Callout box, Review box, Nút mua hàng CTA chuyển đổi cao.
- **Hỗ trợ Song ngữ [VI | EN]**: Gạt chuyển đổi ngôn ngữ mượt mà ngay trong bài viết.
- **100% Cấu hình Động qua Blogger Layout**: Quản lý Menu, Nhãn chuyên mục, Banner, Avatar, Mạng xã hội không cần chạm vào code XML.
- **Dark Mode & Typography chuẩn tiếng Việt**: Đọc êm mắt, tự động lưu cấu hình.

## 🚀 Hướng dẫn Bắt đầu Phát triển trong Antigravity IDE

1. **Cài đặt & Chạy Xem trước Trực tiếp (Live Preview)**:
   ```bash
   npm run dev
   ```
   Trình duyệt sẽ tự động mở trang xem trước `preview.html`. Mọi chỉnh sửa CSS/JS sẽ được cập nhật ngay lập tức.

2. **Đóng gói ra file XML để cài vào Blogger**:
   ```bash
   npm run build
   ```
   File kết quả hoàn chỉnh sẽ được tạo ra tại: `dist/theme.xml`.

3. **Cài đặt vào Blogspot**:
   - Truy cập **Blogger.com -> Chủ đề (Theme) -> Tùy chỉnh (dấu mũi tên cạnh Tùy chỉnh) -> Khôi phục (Restore) -> Tải lên (Upload)** -> Chọn file `dist/theme.xml`.
