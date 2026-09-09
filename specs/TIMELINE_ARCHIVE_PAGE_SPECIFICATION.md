# ĐẶC TẢ KỸ THUẬT & GIAO DIỆN: TRANG MỤC LỤC TOÀN THƯ (DEDICATED ARCHIVE PAGE)

> **Mã tính năng**: `FEAT-TIMELINE-PAGE-V3`  
> **Dự án**: Blogger Editorial Theme (Blogspot XML v3)  
> **Phiên bản đặc tả**: `v1.0.0`  
> **Trạng thái**: Bản thảo thiết kế (Design Specification)  
> **Đường dẫn mục tiêu**: `https://[domain-blog]/p/muc-luc.html` (hoặc `/p/archive.html`)

---

## 1. TỔNG QUAN & MỤC ĐÍCH

### 1.1. Bối cảnh & Lý do chuyển đổi
Trước đây, tính năng Mục lục được thiết kế dạng Modal/Overlay toàn màn hình. Mặc dù mang lại khả năng xem lướt tức thì, giải pháp này gặp các rào cản lớn về trải nghiệm:
- **Xung đột điều hướng (Navigation Friction)**: Khi người dùng bấm nút Back trình duyệt, nút Back trên Android, hoặc vuốt màn hình (Swipe Back) trên iPhone, trình duyệt sẽ thoát hẳn ra khỏi blog thay vì đóng mục lục.
- **Giá trị SEO hạn chế**: Công cụ tìm kiếm (Google) không coi Modal/Overlay là một trang nội dung có thể lập chỉ mục (indexable page).
- **Thiếu URL vĩnh viễn (Permalink)**: Không thể chia sẻ một đường dẫn chuẩn sạch lên Bio mạng xã hội hoặc email bản tin.

### 1.2. Mục tiêu giải pháp
Biến Mục Lục thành một **Trang Tĩnh Độc Lập (Dedicated Static Page)** chuẩn mực của Blogger:
1. **Điều hướng tự nhiên 100%**: Nút Back trình duyệt, vuốt mép màn hình, hoặc liên kết quay lại hoạt động hoàn hảo theo chuẩn của web.
2. **SEO HTML Sitemap**: Đóng vai trò như một bản đồ cấu trúc liên kết nội bộ (Internal Linking) mạnh mẽ giúp Google Bot cào và index toàn bộ bài viết của blog.
3. **Tìm kiếm & Lọc tức thì (Instant Client-side Search & Filter)**: Giữ nguyên khả năng tìm kiếm siêu tốc trong 0.01 giây, lọc theo Chuyên mục (Category Pills), và đóng/mở theo Năm (Year Accordions) mà không cần tải lại trang.
4. **Đồng bộ nhận diện thương hiệu (Visual Harmony)**: Sử dụng đầy đủ Header cố định, Hero Banner, thanh điều hướng và Footer 4 cột đồng nhất với trang chủ.

---

## 2. KIẾN TRÚC KỸ THUẬT TRÊN BLOGGER (BLOGSPOT XML V3)

### 2.1. Cấu trúc URL & Nhận diện Trang
- **URL quy chuẩn**: `/p/muc-luc.html` hoặc `/p/archive.html`.
- **Thẻ điều kiện Blogger XML**:
  ```xml
  <b:if cond='data:view.isPage and (data:view.url.canonical.endsWith("p/muc-luc.html") or data:view.url.canonical.endsWith("p/archive.html"))'>
    <!-- Giao diện chuyên biệt của Trang Mục Lục Toàn Thư -->
  </b:if>
  ```
- **Fallback Content Container**: Khi tác giả tạo trang tĩnh trên Blogger, nội dung trang có thể chỉ cần đặt một thẻ định danh `<div id="editorial-archive-app"></div>`. Theme sẽ tự động render toàn bộ giao diện vào khối này.

### 2.2. Cơ chế Thu thập Dữ liệu Tự động (Automated Feed Sync)
- **API nguồn**: Sử dụng Blogger JSON Feed API chính chủ:
  ```http
  GET /feeds/posts/summary?alt=json&max-results=500
  ```
- **Xử lý dữ liệu (Data Pipeline)**:
  1. Trích xuất: `Tiêu đề (Title)`, `Đường dẫn (URL)`, `Ngày xuất bản (Published ISO Date)`, `Nhãn chuyên mục (Category/Label)`, `Thời gian đọc ước tính`.
  2. Phân loại theo năm: Gom nhóm danh sách bài viết theo từng năm `[2026, 2025, 2024, ...]`.
  3. Sắp xếp: Giảm dần theo thời gian (Bài mới nhất luôn hiển thị ở trên cùng).
- **Bộ nhớ đệm (Caching Strategy)**:
  - Lưu trữ kết quả trong `sessionStorage['blogger_archive_posts']` để người dùng quay lại trang Mục Lục nhiều lần mà không phải gọi lại network request.

---

## 3. ĐẶC TẢ BỐ CỤC GIAO DIỆN (UI/UX SPECIFICATION)

### 3.1. Cấu trúc Khung Trang (Page Hierarchy)
```text
┌─────────────────────────────────────────────────────────────┐
│ 1. Sticky Header (Logo, Menu có tab 'Mục Lục' active, Icons) │
├─────────────────────────────────────────────────────────────┤
│ 2. Hero Header (Breadcrumb, Tiêu đề lớn, Lời tựa, Thống kê) │
├─────────────────────────────────────────────────────────────┤
│ 3. Thanh Công Cụ Tìm Kiếm & Lọc (Search Input + Cat Pills)  │
├─────────────────────────────────────────────────────────────┤
│ 4. Thanh Điều Khiển Thu Gọn (Mở tất cả / Thu gọn)           │
├─────────────────────────────────────────────────────────────┤
│ 5. Cây Dòng Thời Gian Dọc (Year Groups + Flat Post Cards)   │
│    ├── Năm 2026 (5 bài viết) [▾]                            │
│    │   ├── [Góc Nhìn] Tiêu đề bài viết 1 ... [08/09] [→]     │
│    │   └── [Sách]     Tiêu đề bài viết 2 ... [15/08] [→]     │
│    └── Năm 2025 (4 bài viết) [▾]                            │
│        └── ...                                              │
├─────────────────────────────────────────────────────────────┤
│ 6. Footer 4 Cột Chuẩn Mực                                    │
└─────────────────────────────────────────────────────────────┘
```

### 3.2. Chi tiết từng Component

#### A. Hero Header Khu Vực Mục Lục
- **Đường dẫn điều hướng (Breadcrumb)**:
  `Trang chủ » Mục Lục Toàn Thư`
- **Tiêu đề chính**:
  `Kho Lưu Trữ Bài Viết.` (hoặc `Mục Lục Toàn Thư.`)
  - Font: `var(--font-serif)` (Lora / Georgia), kích thước `2.5rem - 3rem`, chữ đậm.
  - Điểm nhấn: Dấu chấm màu `--primary` ở cuối tiêu đề.
- **Lời đề tựa (Tagline)**:
  *"Toàn bộ bài viết, suy ngẫm và bài học trên hành trình viết lách của tôi — được sắp xếp theo dòng thời gian."*
- **Huy hiệu thống kê (Stats Badges)**:
  - `[ 📚 12 Bài viết ]`
  - `[ 🗓️ 3 Năm xuất bản ]`
  - `[ 🏷️ 6 Chủ đề ]`

#### B. Thanh Tìm Kiếm Tức Thì (Instant Search Toolbar)
- **Vị trí**: Nằm ngay dưới phần mô tả Hero.
- **Giao diện**:
  - Khung nhập liệu bo góc `12px`, nền `var(--bg-card)`, viền `1.5px solid var(--border-color)`.
  - Icon kính lúp 🔍 bên trái.
  - Placeholder: *"Nhập từ khóa tìm tên bài, chủ đề hoặc năm (VD: 2025, sách, thói quen)..."*
- **Cơ chế tìm kiếm**:
  - Debounce `150ms` để tăng tốc độ gõ phím.
  - Tìm kiếm không phân biệt hoa thường và hỗ trợ tiếng Việt có dấu.
  - Khớp với: Tiêu đề bài, Chuyên mục, Năm, và Ngày tháng.
  - Kết quả hiển thị tức thì trong `0.01s` mà không reload trang.

#### C. Thanh Lọc Chuyên Mục (Dynamic Category Filter Pills)
- **Giao diện**: Dạng thanh cuộn ngang chứa các viên thuốc (Pill tabs) bo tròn:
  - `[ ✦ Tất cả ]` (mặc định active)
  - `[ Góc Nhìn & Tư Duy ]`
  - `[ Trải Nghiệm Sống ]`
  - `[ Sách & Công Cụ ]`
  - `[ Phát Triển Bản Thân ]`
- **Hành vi**:
  - Bấm vào pill nào thì chỉ giữ lại các bài viết có gắn nhãn đó.
  - Tự động cập nhật số lượng bài đếm được sau khi lọc.

#### D. Bộ Điều Khiển Năm (Collapsible Year Accordions)
- **Node Năm (Year Header)**:
  - Số năm hiển thị nổi bật (`font-size: 1.65rem; font-weight: 800`).
  - Huy hiệu đếm số lượng bài của năm đó (`5 bài viết`).
  - Đường chỉ ngang thanh mảnh nối liền sang icon chevron `▾`.
  - **Không trôi (`no sticky`)**: Cuộn trang xuống thì node năm trôi tự nhiên theo nhịp đọc.
- **Tương tác Đóng/Mở**:
  - Click vào thanh tiêu đề năm để thu gọn hoặc mở bung danh sách bài của năm đó.
  - Cụm nút nhanh ở góc trên: `[ Mở tất cả / Thu gọn ]` cho phép gập toàn bộ các năm lại để nhìn lướt nhanh theo từng thời kỳ.

#### E. Thẻ Bài Viết Dạng Phẳng (Flat Horizontal Post Cards)
- **Cấu trúc thẻ**:
  - Cột 1 (Trái): Huy hiệu chuyên mục bo tròn (`.post-cat-pill`).
  - Cột 2 (Giữa): Tiêu đề bài viết (`.post-card-title`), font `var(--font-main)` hoặc `var(--font-serif)`, chữ đậm, hover chuyển màu `--primary`.
  - Cột 3 (Phải): Ngày đăng dạng số (`📅 15/08`) + Mũi tên chỉ dẫn `→`.
- **Hiệu ứng Hover**:
  - Thẻ nổi nhẹ `translateY(-2px) translateX(3px)`, viền chuyển sang màu `--primary`, đổ bóng mềm mại `var(--shadow-md)`.

---

## 4. HỖ TRỢ ĐIỀU HƯỚNG BẰNG THAM SỐ URL (URL QUERY PARAMETERS)

Một lợi thế vượt trội khi chuyển thành Trang độc lập là hỗ trợ đường link trực tiếp có tham số:

| URL Mẫu | Hành vi trên trang |
| :--- | :--- |
| `/p/muc-luc.html` | Hiển thị toàn bộ bài viết của tất cả các năm. |
| `/p/muc-luc.html?q=sách` | Tự động điền "sách" vào ô tìm kiếm và lọc danh sách ngay khi tải trang. |
| `/p/muc-luc.html?cat=goc-nhin` | Tự động chọn tab chuyên mục "Góc Nhìn". |
| `/p/muc-luc.html?year=2025` | Mở sẵn năm 2025 và thu gọn các năm khác. |

---

## 5. QUY TRÌNH THIẾT LẬP DÀNH CHO TÁC GIẢ BLOG (ADMIN SETUP WORKFLOW)

Sau khi mã nguồn theme được triển khai, tác giả blog chỉ cần thực hiện đúng **3 bước (làm 1 lần duy nhất)**:

1. **Tạo Trang Tĩnh Trên Blogger**:
   - Truy cập trang quản trị Blogger ➔ Chọn menu **Trang (Pages)** ➔ Bấm **+ Trang mới**.
   - Tiêu đề trang: Nhập `Dòng Thời Gian` (hoặc `Mục Lục`).
   - Tùy chọn đường dẫn: Blogger sẽ tự động gán đường dẫn là `/p/muc-luc.html`.
   - Nội dung bài viết: Để trống hoặc nhập một đoạn văn bản giới thiệu ngắn tuỳ ý.
   - Bấm **Xuất bản (Publish)**.
2. **Gắn Liên Kết Lên Menu Header**:
   - Vào menu **Bố cục (Layout)** ➔ Tìm widget **Menu Điều Hướng Chính (`LinkList1`)**.
   - Thêm một mục mới: Tên hiển thị là `Dòng Thời Gian`, liên kết là `/p/muc-luc.html`.
3. **Vận hành trong tương lai**:
   - **Tự động 100%**: Mỗi khi bạn xuất bản một bài viết mới, bài viết đó sẽ tự động xuất hiện trên trang `/p/muc-luc.html` theo đúng Năm, Tháng, Ngày và Chuyên mục mà không cần cập nhật thủ công.

---

## 6. KẾ HOẠCH BÀO CHẾ MÃ NGUỒN (SOURCE CODE IMPLEMENTATION PLAN)

| Thành phần | File tác động | Mô tả công việc |
| :--- | :--- | :--- |
| **Giao diện CSS** | `src/styles/archive-page.css` | Kế thừa các class tối ưu từ `timeline-modal.css`, loại bỏ các thuộc tính fixed overlay/modal, chuyển thành container trang chuẩn. |
| **Logic JavaScript** | `src/scripts/archive-page.js` | Tự động kiểm tra nếu đang ở trang `/p/muc-luc.html` (hoặc container `#editorial-archive-app`), kích hoạt feed fetch, render category pills, search input và URL query handler. |
| **Template Blogger** | `scripts/build.js` | Bổ sung thẻ điều kiện nhận diện trang `/p/muc-luc.html`, thay đổi liên kết trên Header/Mobile Menu từ `#timeline` sang `/p/muc-luc.html`. |
| **Xem trước (Preview)** | `src/preview.html` | Bổ sung chế độ xem *"Trang Mục Lục Tĩnh"* trên thanh chuyển đổi chế độ xem thử (Preview Mode Toggle). |
| **File phân phối** | `dist/theme.xml` | Biên dịch bản XML hoàn chỉnh để tải lên Blogger. |

---

## 7. TIÊU CHUẨN KIỂM THỬ & NGHIỆM THU (ACCEPTANCE CRITERIA)

1. [ ] **Nút Back của trình duyệt**: Khi người dùng vào trang `/p/muc-luc.html` từ trang chủ hoặc bài viết đơn, bấm nút Back của trình duyệt / vuốt mép màn hình điện thoại phải quay lại chính xác trang trước đó mà không bị lỗi.
2. [ ] **Tìm kiếm tức thì**: Gõ từ khóa tiếng Việt có dấu/không dấu thì danh sách bài phải lọc ngay lập tức, không giật lag.
3. [ ] **Chuyên mục**: Bấm vào bất kỳ Pill chuyên mục nào danh sách phải cập nhật số lượng bài tương ứng.
4. [ ] **Đóng/Mở Năm**: Bấm vào từng năm để thu gọn/mở rộng hoạt động mượt mà. Bấm nút "Thu gọn tất cả" phải gập toàn bộ các năm.
5. [ ] **Responsive & Dark Mode**: Hiển thị đẹp mắt trên cả iPhone (màn hình nhỏ) và Desktop, chuyển đổi chế độ Sáng/Tối mượt mà không lỗi màu sắc.
