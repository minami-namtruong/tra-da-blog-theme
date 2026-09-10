# ĐẶC TẢ KỸ THUẬT & GIAO DIỆN: TIỆN ÍCH BÀI VIẾT ĐẶC BIỆT ĐA NĂNG (FLEXIBLE SPECIAL POSTS WIDGET)

> **Mã tính năng**: `FEAT-FLEXIBLE-SPECIAL-POSTS-WIDGET-V1`  
> **Dự án**: Blogger Editorial Theme (Blogspot XML v3)  
> **Phiên bản đặc tả**: `v1.0.0`  
> **Trạng thái**: Bản thảo thiết kế hoàn chỉnh (Design Specification)  
> **Tài liệu liên quan**: [THEME_SPECIFICATION.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/THEME_SPECIFICATION.md), [TIMELINE_ARCHIVE_PAGE_SPECIFICATION.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/TIMELINE_ARCHIVE_PAGE_SPECIFICATION.md)

---

## 1. TỔNG QUAN & TẦM NHÌN THIẾT KẾ

### 1.1. Bối cảnh & Vấn đề thực tế
Trên một blog cá nhân định hướng nội dung chất lượng cao (Editorial / Thought Leadership), tác giả thường có hai nhu cầu xuất bản song song:
1. **Bài viết chuyên sâu (Long-form Essays)**: 1,500 – 4,000 từ, đòi hỏi nhiều thời gian nghiên cứu, biên tập, là trụ cột tạo nên uy tín của blog.
2. **Nội dung ngắn, điểm tin, ghi chép nhanh (Micro-posts / Daily Digest / Quick Notes)**: 100 – 400 từ, chia sẻ suy nghĩ trong ngày, điểm tin công nghệ/sách, trích dẫn hay, ghi chú ngắn.

**Vấn đề nan giải trên Blogger truyền thống**:
- Nếu đăng các bài ngắn này như bài viết thông thường, chúng sẽ **chiếm trọn trang chủ và dòng thời gian**, đẩy các bài viết chuyên sâu xuống dưới, làm "loãng" và giảm tính trang trọng của blog.
- Nếu không có cơ chế tách biệt, độc giả sẽ cảm thấy luồng đọc bị vụn vặt và thiếu nhất quán.

### 1.2. Mục tiêu giải pháp
Xây dựng tính năng **Flexible Special Posts Widget** đáp ứng trọn vẹn các tiêu chuẩn:
1. **Cách ly luồng nội dung tự động (Zero-pollution Main Feed)**:
   - Các bài viết đặc biệt (được đánh dấu bằng tiền tố, ví dụ `@Điểm tin`) sẽ **tự động ẩn 100%** khỏi luồng bài viết chính ở Trang chủ và trang Dòng thời gian (Timeline Archive), không làm loãng kho nội dung dài.
2. **Linh hoạt đa vị trí (Flexible & Context-Adaptive Layout)**:
   - Widget có thể đặt tại **Cột bên (Sidebar)**, **Đầu trang chủ (Main Content Hero / Banner)**, hoặc **Giữa các khối nội dung** mà không bị vỡ giao diện.
   - Giao diện tự động co giãn và chuyển đổi bố cục thông minh theo kích thước container chứa nó.
3. **Cơ chế động không giới hạn (Dynamic Multiple Instances)**:
   - Tác giả có thể tạo bao nhiêu widget tuỳ thích (`@Điểm tin`, `@Ghi chép`, `@Sách hay`, `@Quotes`...) trực tiếp từ giao diện quản trị **Bố cục (Layout)** của Blogger mà không cần can thiệp vào mã nguồn XML.
4. **Trải nghiệm đọc tinh tế (Clean UI Presentation)**:
   - Tự động lọc sạch ký tự tiền tố `@` ở giao diện người dùng. Độc giả chỉ nhìn thấy nhãn nguyên bản như *"Điểm tin"*, *"Ghi chép"*.

---

## 2. KIẾN TRÚC KỸ THUẬT & LUỒNG DỮ LIỆU (DATA PIPELINE)

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             TÁC GIẢ SOẠN BÀI VIẾT                                │
│                     (Gắn nhãn có tiền tố: "@Điểm tin")                           │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ Xuất bản
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                          DATABASE CỦA GOOGLE BLOGGER                             │
└──────────────────┬────────────────────────────────────────────┬──────────────────┘
                   │                                            │
        (Lọc điều kiện XML v3)                         (Blogger JSON Feed API)
                   ▼                                            ▼
┌──────────────────────────────────────┐     ┌─────────────────────────────────────┐
│ 1. TRANG CHỦ & MAIN BLOG LOOP        │     │ 2. FLEXIBLE SPECIAL POSTS WIDGET    │
│ - Tự động phát hiện nhãn có "@"      │     │ - Gọi feed: /feeds/posts/summary/   │
│ - ẨN bài khỏi danh sách chính        │     │   -/@Điểm%20tin?alt=json            │
│ - Danh mục Menu tự bỏ nhãn "@"       │     │ - Lọc bỏ "@" -> Hiển thị "Điểm tin" │
│                                      │     │ - Hỗ trợ Sidebar & Khung ngang rộng │
├──────────────────────────────────────┤     └──────────────────┬──────────────────┘
│ 3. TRANG DÒNG THỜI GIAN (TIMELINE)   │                        │
│ - Tự động loại bỏ các bài có "@"     │            (Click "Xem tất cả »")
│ - Giữ cho Timeline bài dài luôn sạch │                        ▼
└──────────────────────────────────────┘     ┌─────────────────────────────────────┐
                                             │ 3. TRANG LƯU TRỮ CHUYÊN ĐỀ RIÊNG    │
                                             │ /search/label/@Điểm%20tin           │
                                             │ - Tự động đổi tít thành: "Điểm tin" │
                                             └─────────────────────────────────────┘
```

### 2.1. Quy ước tiền tố nhãn (Label Prefix Convention)
- **Ký tự quy ước**: Ký tự `@` ở đầu tên nhãn (ví dụ: `@Điểm tin`, `@Bản tin sáng`, `@Ghi chú`, `@Review ngắn`).
- **Quy tắc gán nhãn**: Tác giả có thể gán nhiều nhãn cho 1 bài viết. Miễn là bài viết chứa ít nhất một nhãn bắt đầu bằng `@`, hệ thống sẽ coi đó là bài viết dạng đặc biệt.

### 2.2. Cơ chế lọc ẩn ở tầng máy chủ Blogger XML v3
Trong widget hiển thị bài viết chính (`<b:widget id='Blog1' type='Blog'>`):
```xml
<!-- Bộ lọc loại trừ bài viết có tiền tố "@" trên trang chủ và trang danh mục thường -->
<b:loop values='data:posts' var='post'>
  <!-- Kiểm tra xem bài viết có nhãn đặc biệt nào bắt đầu bằng ký tự "@" không -->
  <b:with value='data:post.labels any (label =&gt; label.name startsWith "@")' var='isSpecialPost'>
    <!-- Nếu là bài viết đặc biệt và đang ở Trang chủ/Chuyên mục thường -> ẨN ĐI -->
    <b:if cond='not (data:view.isHomepage and data:isSpecialPost)'>
      <!-- Render thẻ bài viết chuẩn (post-card) -->
      <article class='post-card'>
        ...
      </article>
    </b:if>
  </b:with>
</b:loop>
```
> **Đảm bảo**: Khi người dùng vào chính trang nhãn của bài viết đó (ví dụ `/search/label/@Điểm tin`), bài viết vẫn hiển thị đầy đủ và chuẩn xác.

### 2.3. Cơ chế loại trừ trên Trang Dòng Thời Gian (Timeline Archive)
Trong logic fetch feed của trang `/p/muc-luc.html` (hoặc `/p/archive.html`):
- Khi nạp dữ liệu từ `/feeds/posts/summary?alt=json`:
  ```javascript
  // Bỏ qua các bài viết có nhãn bắt đầu bằng ký tự @
  const isSpecial = post.category?.some(cat => cat.term.startsWith('@'));
  if (isSpecial) return; // Không đưa vào cây Dòng thời gian bài viết chính
  ```

### 2.4. Thu thập dữ liệu cho Widget (Blogger JSON Feed API)
Widget sử dụng API bất đồng bộ (Asynchronous AJAX/Fetch) để lấy bài viết mới nhất:
- **URL Endpoint**:
  ```http
  GET /feeds/posts/summary/-/{EncodedLabel}?alt=json&max-results={Limit}
  ```
  *Ví dụ*: `/feeds/posts/summary/-/%40%C4%90i%E1%BB%83m%20tin?alt=json&max-results=5`
- **Dữ liệu trích xuất**:
  - `id`: Định danh bài viết.
  - `title`: Tiêu đề bài viết.
  - `url`: Đường dẫn bài viết.
  - `published`: Ngày giờ xuất bản (định dạng ISO, chuyển đổi sang định dạng thân thiện: `Hôm nay 08:30`, `Hôm qua`, hoặc `DD/MM/YYYY`).
  - `snippet`: Đoạn tóm tắt văn bản ngắn (cắt gọn ~120 ký tự, loại bỏ toàn bộ thẻ HTML).
- **Bộ nhớ đệm (Caching)**:
  - Dữ liệu feed được cache nhẹ trong `sessionStorage` theo khóa `special_feed_{label}_{limit}` với thời hạn 5 phút nhằm giảm tải request và mang lại tốc độ tức thì khi chuyển trang.

---

## 3. THIẾT KẾ LINH HOẠT ĐA VỊ TRÍ (FLEXIBLE ADAPTIVE LAYOUT)

Điểm cốt lõi của widget này là **khả năng thích ứng với mọi vị trí đặt trên trang**:
1. **Vị trí Cột bên (Sidebar)**: Chiều rộng hẹp (~280px – 360px).
2. **Vị trí Nội dung chính (Main Content / Above Feed)**: Chiều rộng trung bình đến rộng (~680px – 1100px).
3. **Vị trí Chân trang hoặc Toàn màn hình (Wide Banner)**: Chiều rộng 100%.

### 3.1. Kỹ thuật thích ứng: Container Queries & Bố cục tự động
Sử dụng CSS Container Queries hiện đại kết hợp Class tiền tố ngữ cảnh:
```css
/* Container ngữ cảnh */
.special-posts-widget {
  container-type: inline-size;
  container-name: special-widget;
}
```

---

### 3.2. Bố cục chế độ HẸP (Sidebar Mode / Width < 450px)
Phù hợp khi đặt trong `aside.sidebar`:

```text
┌──────────────────────────────────────────────┐
│ ⚡ ĐIỂM TIN MỖI NGÀY                 [Xem tất cả »]
├──────────────────────────────────────────────┤
│ 📅 Hôm nay, 08:15                            │
│ ✦ Ra mắt tính năng Dòng thời gian mới        │
│   Một cập nhật nhỏ giúp bạn tra cứu bài viết...│
├──────────────────────────────────────────────┤
│ 📅 08/09/2026                                │
│ ✦ 3 công cụ ghi chú tối giản tôi dùng mỗi ngày│
│   Ghi chép không cần phức tạp, quan trọng là...│
├──────────────────────────────────────────────┤
│ 📅 07/09/2026                                │
│ ✦ Chiêm nghiệm về sự tĩnh lặng buổi sáng     │
└──────────────────────────────────────────────┘
```

- **Đặc điểm UI**:
  - Dạng danh sách thẻ dọc (Vertical Stack Cards).
  - Khoảng cách padding vừa vặn (`1rem`), viền bo mềm mại (`12px`).
  - Huy hiệu ngày tháng tinh gọn đặt trên đầu tiêu đề.
  - Đoạn text trích dẫn giới hạn 1–2 dòng (CSS `line-clamp: 2`).
  - Nút "Xem tất cả »" tinh tế ở góc trên cùng bên phải của tiêu đề widget.

---

### 3.3. Bố cục chế độ RỘNG (Main Content Mode / Width >= 450px)
Phù hợp khi đặt ở vùng nội dung chính (ví dụ: phía trên danh sách bài viết trang chủ, ngay dưới Cover Banner):

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ⚡ ĐIỂM TIN MỖI NGÀY                                                              [Xem tất cả »] │
│ Những mẩu tin vắn, góc nhìn nhanh và cập nhật ngắn trong ngày                                   │
├────────────────────────────────┬────────────────────────────────┬───────────────────────────────┤
│ 📅 Hôm nay, 08:15              │ 📅 08/09/2026                  │ 📅 07/09/2026                 │
│ ✦ Ra mắt tính năng Dòng thời   │ ✦ 3 công cụ ghi chú tối giản   │ ✦ Chiêm nghiệm về sự tĩnh     │
│   gian mới                     │   tôi dùng mỗi ngày            │   lặng buổi sáng              │
│ Một cập nhật nhỏ giúp bạn tra  │ Ghi chép không cần phức tạp,   │ Bắt đầu ngày mới không màn    │
│ cứu bài viết nhanh chóng...    │ quan trọng là sự đều đặn...    │ hình điện thoại giúp tâm trí...│
└────────────────────────────────┴────────────────────────────────┴───────────────────────────────┘
```

- **Đặc điểm UI**:
  - Dạng lưới ngang (Grid: 2 hoặc 3 cột tự động co giãn `repeat(auto-fit, minmax(240px, 1fr))`).
  - Có thêm dòng phụ đề mô tả phong nhã (Sub-headline).
  - Thẻ con dạng Card nổi (Hover nâng nhẹ `translateY(-2px)` với bóng đổ mờ).
  - Tích hợp biểu tượng mũi tên chuyển tiếp `→` khi hover vào từng thẻ.

---

## 4. HƯỚNG DẪN CẤU HÌNH TRONG BLOGGER ADMIN (DÀNH CHO TÁC GIẢ)

Tác giả **không cần sửa code XML** mỗi khi muốn tạo thêm một widget mới. Mọi thao tác thực hiện 100% trong mục **Bố cục (Layout)** của Blogger:

### 4.1. Cách tạo một Widget mới
1. Mở **Blogger Admin** » Vào mục **Bố cục (Layout)**.
2. Tìm đến vị trí muốn đặt:
   - Nếu muốn đặt ở cột bên: Bấm **Thêm tiện ích (Add a Gadget)** trong vùng *Cột Bên (Sidebar)*.
   - Nếu muốn đặt ở trang chủ: Bấm **Thêm tiện ích (Add a Gadget)** trong vùng *Trên Nội Dung Chính (Main Content)*.
3. Chọn loại tiện ích: **HTML/JavaScript**.
4. Điền thông tin cấu hình:
   - **Tiêu đề**: Điền tên bạn muốn (ví dụ: `⚡ Điểm Tin Mỗi Ngày` hoặc `☕ Ghi Chú Ngắn`).
   - **Nội dung**: Dán đoạn mã thẻ sau:

```html
<div class="special-posts-widget" 
     data-label="@Điểm tin" 
     data-limit="4"
     data-show-snippet="true">
</div>
```

### 4.2. Bảng tham số tùy biến (Data Attributes)

| Thuộc tính (Attribute) | Kiểu dữ liệu | Mặc định | Ý nghĩa & Tùy chọn |
| :--- | :--- | :--- | :--- |
| `data-label` | String *(Bắt buộc)* | `@Điểm tin` | Nhãn bài viết cần lấy (luôn có tiền tố `@`). |
| `data-limit` | Number | `4` | Số lượng bài viết hiển thị (từ 1 đến 10 bài). |
| `data-show-snippet` | Boolean | `true` | `true`: Hiện 2 dòng tóm tắt; `false`: Chỉ hiện tít & ngày. |
| `data-style` | String | `auto` | `auto` (tự co giãn theo vị trí), `compact` (luôn ép kiểu cột dọc), `grid` (luôn ép kiểu lưới ngang). |
| `data-view-all-text`| String | `Xem tất cả »` | Nhãn chữ cho nút chuyển sang trang chuyên đề. |

---

## 5. ĐẶC TẢ GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG (UI/UX SPECIFICATION)

### 5.1. Hệ màu & Biến giao diện (Design Tokens)
Sử dụng 100% các biến CSS có sẵn của theme nhằm đảm bảo tính đồng bộ hoàn hảo giữa Dark Mode và Light Mode:
- **Nền widget**: `var(--bg-card)`
- **Viền widget**: `1px solid var(--border-color)`
- **Đổ bóng**: `var(--shadow-card)`
- **Tiêu đề widget**: Font `var(--font-sans)`, kích thước `1.05rem`, độ đậm `700`, màu `var(--text-main)`.
- **Tiêu đề bài viết con**: Font `var(--font-serif)` hoặc `var(--font-sans)`, kích thước `0.95rem`, độ đậm `600`, màu `var(--text-main)`. Khi hover đổi màu `var(--primary)`.
- **Nhãn ngày & Badge**: Font `var(--font-sans)`, kích thước `0.78rem`, chữ in hoa nhẹ hoặc có icon `📅`, màu `var(--text-light)`.
- **Đoạn tóm tắt**: Font `var(--font-sans)`, kích thước `0.85rem`, màu `var(--text-muted)`, chiều cao dòng `1.5`.

### 5.2. Trạng thái tải trang (Skeleton Loading State)
Trong thời gian 0.1s – 0.3s khi API đang tải feed, widget hiển thị khung xương mờ ảo (Shimmer Skeleton) tương ứng với số lượng `data-limit`:
- Khung chữ nhật ngày tháng màu xám nhạt bo góc.
- 2 dòng gạch ngang mô phỏng dòng chữ có hiệu ứng ánh sáng lướt qua (Pulse animation).
- Tránh hiện tượng giật layout (Cumulative Layout Shift - CLS = 0).

### 5.3. Trạng thái rỗng (Empty State Fallback)
Nếu tác giả vừa gắn widget nhưng chưa đăng bài viết nào có nhãn đó:
- Widget hiển thị thông báo nhẹ nhàng: *"Chưa có bài viết nào trong mục này."* (chỉ hiển thị mờ, không gây lỗi giao diện).

### 5.4. Lọc sạch tiền tố nhãn (Label Sanitization)
Trong toàn bộ mã nguồn script:
```javascript
function formatLabelName(rawLabel) {
  // Cắt bỏ ký tự @ hoặc _ ở đầu nhãn
  return rawLabel.replace(/^[@_~]/, '');
}
```
- Khi render tiêu đề trang `/search/label/@Điểm%20tin`:
  - Tiêu đề biến thành: **Điểm tin** (không còn dấu `@`).
- Khi render Breadcrumb:
  - `Trang chủ » Chuyên đề » Điểm tin`.

---

## 6. ĐIỀU HƯỚNG TỪ HEADER MENU (HEADER ANCHOR INTEGRATION)

Tác giả có thể đưa liên kết dẫn tới tiện ích này lên thanh Menu Header của blog:

1. **Điều hướng cuộn mượt (Anchor Scroll)**:
   - Widget tự động gắn một thẻ định danh ID dựa trên tên nhãn: ví dụ `id="widget-diem-tin"`.
   - Trong Menu Header của Blogger (tiện ích `LinkList1`), tác giả chỉ cần điền URL liên kết:
     `/#widget-diem-tin`
   - Khi độc giả bấm vào mục "Điểm tin" trên thanh Menu: Trang tự động cuộn mượt mà (smooth scroll) đến đúng vị trí của widget và kích hoạt hiệu ứng chớp sáng viền nhẹ (`highlight pulse`) trong 1.2 giây để độc giả chú ý ngay.
2. **Điều hướng sang trang chuyên đề đầy đủ**:
   - Nếu muốn bấm vào Menu mở luôn trang tập hợp toàn bộ tin:
     `/search/label/@Điểm tin`

---

## 7. TIÊU CHUẨN KIỂM THỬ & TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)

| Hạng mục | Tiêu chí nghiệm thu (Checklist) | Đánh giá |
| :--- | :--- | :---: |
| **Cách ly nội dung** | Đăng bài có nhãn `@Điểm tin`: Bài viết KHÔNG xuất hiện trên danh sách bài viết chính của Trang chủ. | [ ] |
| **Bảo toàn Dòng thời gian**| Trang `/p/muc-luc.html` (Timeline) KHÔNG chứa các bài có tiền tố `@`. | [ ] |
| **Độ linh hoạt vị trí** | Kéo thả widget vào Sidebar: Tự động chuyển sang bố cục thẻ dọc gọn gàng. | [ ] |
| **Bố cục hàng ngang** | Kéo thả widget vào Main Content: Tự động dàn lưới 2–3 cột thẻ card ngang. | [ ] |
| **Đa widget** | Tạo cùng lúc 2 widget (`@Điểm tin` và `@Ghi chép`): Cả hai tải dữ liệu độc lập, chính xác. | [ ] |
| **Hiển thị nhãn** | Không xuất hiện ký tự `@` trên thẻ tag, tiêu đề widget và tiêu đề trang chuyên đề. | [ ] |
| **Dark Mode** | Màu nền card, viền, chữ và hover chuyển đổi mượt mà theo nút gạt giao diện sáng/tối. | [ ] |
| **Tốc độ & Cache** | Tải lại trang: Dữ liệu widget xuất hiện tức thì từ `sessionStorage`, không giật trang. | [ ] |
| **Điều hướng Menu** | Bấm menu Header `/#widget-diem-tin`: Cuộn mượt đến widget và sáng viền nhẹ. | [ ] |
