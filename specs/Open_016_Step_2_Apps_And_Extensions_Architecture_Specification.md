# ĐẶC TẢ KỸ THUẬT GIAI ĐOẠN 2: KIẾN TRÚC MỞ RỘNG CÁC ỨNG DỤNG TƯƠNG TÁC (TAROT, TỬ VI, AI CHAT...)
## (Component-Inherited Apps & Extensions Architecture Specification)

- **Mã giai đoạn:** STEP-2-APPS-EXTENSIONS
- **Phiên bản đích:** 1.1.0+ (Apps Expansion Version)
- **Kế thừa kiến trúc:** Kế thừa 100% Component-Based Base Theme từ Giai đoạn 1
- **Tác giả & Chủ sở hữu:** Nam Trương & Antigravity Solution Architecture
- **Nền tảng:** Blogger Static Pages + React / Web Components + Backend API
- **Ngày cập nhật:** 17/09/2026

---

# MỤC LỤC
1. [Mục Tiêu & Triết Lý Kế Thừa Kiến Trúc](#1-mục-tiêu--triết-lý-kế-thừa-kiến-trúc)
2. [Cấu Trúc Thư Mục Mở Rộng (`src/apps/` & `src/components/`)](#2-cấu-trúc-thư-mục-mở-rộng-srcapps--srccomponents)
3. [Điểm Tiếp Hợp Trong Component (Component Integration Points)](#3-điểm-tiếp-hợp-trong-component-component-integration-points)
4. [Đặc Tả Quy Trình Phát Triển & Nhúng App (React / Vanilla JS)](#4-đặc-tả-quy-trình-phát-triển--nhúng-app-react--vanilla-js)
5. [Đặc Tả Hạ Tầng Kết Nối Backend API & SEO Hybrid](#5-đặc-tả-hạ-tầng-kết-nối-backend-api--seo-hybrid)
6. [Quy Chuẩn Quản Lý Git Branch (`main` vs `feature/apps-integration`)](#6-quy-chuẩn-quản-lý-git-branch-main-vs-featureapps-integration)
7. [Tiêu Chuẩn Nghiệm Thu Giai Đoạn 2](#7-tiêu-chuẩn-nghiệm-thu-giai-đoạn-2)

---

## 1. MỤC TIÊU & TRIẾT LÝ KẾ THỪA KIẾN TRÚC

### 1.1. Bối cảnh & Định hướng
Sau khi hoàn tất Giai đoạn 1 với mô hình **Component-Based Base Theme** (`src/template.xml` + `src/components/*.xml`), hệ thống bước vào Giai đoạn 2 để phát triển các trang ứng dụng tương tác thực thụ (Tarot, Tử Vi, Lịch vạn niên, Chat AI, Mini-games...) theo 3 nguyên tắc bất di bất dịch:
1. **Kế thừa nguyên vẹn 100% Base Theme:** Không viết đè hay làm phình to cấu trúc của Base Theme đã chuẩn hóa.
2. **Lợi dụng 100% hạ tầng Google Blogger:** Sử dụng Trang tĩnh Blogger (`/p/tarot.html`, `/p/tu-vi.html`) để hưởng trọn hosting miễn phí, chịu tải cực lớn và thừa hưởng trọn vẹn điểm số uy tín SEO Domain của Blog.
3. **Cắm rút qua Component Slot:** Các shortcut, widget truy cập nhanh hoặc menu của App được cắm trực tiếp vào các component đã tách ở Giai đoạn 1 (`header.xml`, `sidebar.xml`).

---

## 2. CẤU TRÚC THƯ MỤC MỞ RỘNG (`src/apps/` & `src/components/`)

Trên branch `feature/apps-integration`, cấu trúc thư mục được bổ sung thêm thư mục `src/apps/` mà vẫn giữ trọn các components của Giai đoạn 1:

```text
blogspot-editorial-theme/
├── (Cấu trúc Base Theme từ Bước 1 giữ nguyên 100%)
├── src/
│   ├── template.xml                <-- Master Shell (Kế thừa từ Step 1)
│   │
│   ├── components/                 <-- Các components kế thừa từ Step 1
│   │   ├── header.xml              <-- Cấu hình thêm Menu link tới /p/tarot.html
│   │   ├── sidebar.xml             <-- Thêm Widget Banner Shortcut dẫn vào App
│   │   ├── footer.xml
│   │   ├── profile-hero.xml
│   │   ├── category-tabs.xml
│   │   └── modals.xml
│   │
│   ├── apps/                       <-- [THƯ MỤC MỚI CỦA GIAI ĐOẠN 2]
│   │   ├── tarot/                  <-- Ứng dụng Tarot (React / Vite hoặc Vanilla)
│   │   │   ├── src/                <-- Source code App (Components, State, Logic lật bài)
│   │   │   ├── dist/               <-- File JS đã build (tarot-app.bundle.js)
│   │   │   ├── package.json        <-- Vite / Build config riêng của App
│   │   │   └── snippet.html        <-- Mã HTML/JS dán vào bài viết Blogger /p/tarot.html
│   │   │
│   │   ├── tu-vi/                  <-- Ứng dụng Lập lá số Tử Vi
│   │   │   ├── src/
│   │   │   ├── dist/               <-- tuvi-app.bundle.js
│   │   │   └── snippet.html
│   │   │
│   │   └── ai-chat/                <-- Ứng dụng Chat AI Trợ Lý
│   │       ├── src/
│   │       ├── dist/               <-- aichat-app.bundle.js
│   │       └── snippet.html
│   │
│   └── page-templates/             <-- Chứa các bài viết SEO mẫu để dán kèm App
```

---

## 3. ĐIỂM TIẾP HỢP TRONG COMPONENT (COMPONENT INTEGRATION POINTS)

Nhờ mô hình tách component ở Giai đoạn 1, việc kết nối Theme với các App trở nên cực kỳ tinh gọn và không lo xung đột:

### 3.1. Tiếp hợp Menu Header (`src/components/header.xml`)
Trong widget `LinkList1` (Menu điều hướng chính), ta cấu hình thêm các đường link tĩnh:
- `🔮 Bói Bài Tarot` $\rightarrow$ `expr:href='data:blog.homepageUrl + "p/tarot.html"'`
- `🐉 Tử Vi Số Mệnh` $\rightarrow$ `expr:href='data:blog.homepageUrl + "p/tu-vi.html"'`
*(Người dùng có thể bật/tắt hoặc đổi thứ tự trực tiếp trong giao diện Blogger Layout > Menu Điều Hướng).*

### 3.2. Tiếp hợp Shortcut Sidebar (`src/components/sidebar.xml`)
Bổ sung một Widget HTML vào Sidebar làm banner lối tắt dẫn vào App:
```xml
<!-- Widget Shortcut Ứng Dụng Nổi Bật -->
<b:widget id='HTML30' type='HTML' version='2' title='🔮 Trải Bài Tarot Hôm Nay'>
  <b:includable id='main'>
    <div class='sidebar-widget sidebar-app-shortcut'>
      <h3 class='sidebar-widget-title'>🔮 Trải Bài Tarot</h3>
      <p>Lắng nghe thông điệp và năng lượng vũ trụ gửi gắm đến bạn hôm nay.</p>
      <a class='btn-app-action' expr:href='data:blog.homepageUrl + "p/tarot.html"'>Trải Bài Ngay »</a>
    </div>
  </b:includable>
</b:widget>
```

---

## 4. ĐẶC TẢ QUY TRÌNH PHÁT TRIỂN & NHÚNG APP (REACT / VANILLA JS)

### 4.1. Quy trình phát triển độc lập
1. Lập trình viên vào `src/apps/tarot/` và code bình thường như một dự án React độc lập.
2. Kiểm thử ứng dụng trên môi trường local dev server (`npm run dev`).
3. Chạy `npm run build` để xuất ra file duy nhất `dist/tarot-app.bundle.js`.

### 4.2. Quy trình nhúng vào Trang Tĩnh Blogger (`/p/tarot.html`)
Trong trang quản trị Blogger, tạo Trang mới (Pages > New Page), đặt URL là `tarot.html`, dán nội dung từ file `snippet.html`:

```html
<!-- 1. Bài viết SEO (Chuẩn SEO để Googlebot lập chỉ mục) -->
<div class="tarot-seo-content">
  <h2>Khám Phá Năng Lượng & Lời Khuyên Tarot Hôm Nay</h2>
  <p>Tarot là tấm gương phản chiếu trực giác và tâm thức của bạn. Hãy thả lỏng, hít sâu 3 lần và chọn tụ bài bạn cảm thấy được thu hút nhất...</p>
</div>

<!-- 2. Khung gắn ứng dụng React (Mount Target) -->
<div id="tarot-react-root"></div>

<!-- 3. Toàn bộ mã JS ứng dụng đã đóng gói -->
<script>
  //<![CDATA[
  // Toàn bộ code bundle JS của Tarot App dán trực tiếp vào đây
  //]]>
</script>
```

---

## 5. ĐẶC TẢ HẠ TẦNG KẾT NỐI BACKEND API & SEO HYBRID

### 5.1. Kiến Trúc SEO Hybrid
* **Tầng 1 (Crawlable SEO)**: Bài viết giới thiệu nằm ở định dạng HTML thuần ngay trong trang Blogger. Googlebot khi cào dữ liệu sẽ ghi nhận từ khóa, tiêu đề, nội dung phân tích $\rightarrow$ Đạt thứ hạng tìm kiếm cao.
* **Tầng 2 (Interactive Client-Side App)**: React App gắn vào thẻ `<div>` sau khi tải xong trang, cung cấp trải nghiệm lật bài, chọn lá bài, hiệu ứng âm thanh sống động cho người dùng.

### 5.2. Kết Nối Backend API
* Mọi dữ liệu nhạy cảm (API Keys của OpenAI/Gemini, thuật toán luận giải Tử Vi chuyên sâu, Database quẻ bài) đều được lưu trữ và xử lý an toàn tại **Backend Server riêng** (`https://api.yourdomain.com`).
* Phía Client React App chỉ gửi request bảo mật HTTPS nhận JSON để hiển thị.

---

## 6. QUY CHUẨN QUẢN LÝ GIT BRANCH (`main` VS `feature/apps-integration`)

1. **Branch `main`**:
   - Chứa mã nguồn sạch của **Component-Based Base Theme v1.0.0** (từ Giai đoạn 1).
   - Dùng để xuất bản theme, bán cho khách hàng hoặc nhân bản làm theme mới.
2. **Branch `feature/apps-integration`**:
   - Rẽ nhánh từ `main`.
   - Chứa thêm thư mục `src/apps/` và cấu hình shortcut kết nối trong `sidebar.xml`, `header.xml`.
   - Khi có bất kỳ bản vá hoặc nâng cấp nào ở `main`, chỉ cần chạy `git merge main` để đồng bộ mà không lo xung đột mã nguồn.

---

## 7. TIÊU CHUẨN NGHIỆM THU GIAI ĐOẠN 2

| Mã tiêu chuẩn | Tiêu chí đánh giá | Trạng thái bắt buộc |
| :--- | :--- | :--- |
| **AC-2.1** | **Tính nguyên vẹn của Base Theme:** Không làm xáo trộn cấu trúc component hay làm tăng kích thước bundle của Base Theme. | PASS |
| **AC-2.2** | **Tính độc lập của App:** Mỗi app trong `src/apps/` có thể chạy và build độc lập mà không cần khởi động toàn bộ theme. | PASS |
| **AC-2.3** | **Nhúng 100% Blogger:** Nhúng thành công file bundle vào trang tĩnh `/p/tarot.html` trên hạ tầng Blogger của Google, mount đúng ID, chạy mượt mà. | PASS |
| **AC-2.4** | **Bảo mật API:** 100% API key và logic máy chủ được bảo vệ tại Backend Server, không bị lộ ra mã JavaScript Client-side. | PASS |
| **AC-2.5** | **Tương thích Di động (Responsive):** Ứng dụng hiển thị hoàn hảo trên cả điện thoại (Mobile view) và máy tính (Desktop view). | PASS |
