# ĐẶC TẢ KỸ THUẬT & GIAO DIỆN: TIỆN ÍCH BÀI VIẾT ĐẶC BIỆT ĐA NĂNG (FLEXIBLE SPECIAL POSTS WIDGET)

> **Mã tính năng**: `FEAT-FLEXIBLE-SPECIAL-POSTS-WIDGET-V2`  
> **Dự án**: Blogger Editorial Theme (Blogspot XML v3)  
> **Phiên bản đặc tả**: `v2.1.0` (Chuẩn hóa: Hệ thống Nhãn Đa tầng, Cơ chế Lọc Độc quyền `@`, Widget Đa nhãn & Pluggable Patterns)  
> **Trạng thái**: Bản thảo thiết kế kỹ thuật hoàn chỉnh (Design Specification)  
> **Tài liệu liên quan**: [THEME_SPECIFICATION.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/THEME_SPECIFICATION.md), [TIMELINE_ARCHIVE_PAGE_SPECIFICATION.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/TIMELINE_ARCHIVE_PAGE_SPECIFICATION.md)

---

## 1. TỔNG QUAN & TẦM NHÌN THIẾT KẾ (OVERVIEW & PHILOSOPHY)

### 1.1. Bối cảnh & Bài toán biên tập
Trên một blog cá nhân định hướng nội dung chất lượng cao (Editorial / Thought Leadership / Personal Essays), tác giả xuất bản song song hai dòng nội dung:
1. **Bài viết chính thống / Chuyên sâu (Main Long-form Essays)**: Các bài viết phân tích, góc nhìn học thuật hoặc trải nghiệm dài (1,500 – 4,000 từ) thuộc các chủ đề như *Thể thao, Công nghệ, Triết học, Đọc sách*...
2. **Nội dung đặc biệt / Điểm nhấn / Nội dung vi mô (Special & Micro-content)**:
   - Các mẩu tin vắn, cập nhật nhanh trong ngày (Daily Digest).
   - Câu trích dẫn, đoản thi, châm ngôn kèm bình luận ngắn (Quotes & Insights).
   - Bài viết nổi bật được ghim lên top / bảng xếp hạng (Ranked / Must-read Highlights).
   - Bài viết tiêu điểm của tuần (Spotlight / Hero Post).

**Mâu thuẫn cần giải quyết**:
- Nếu tác giả viết một mẩu tin ngắn hoặc trích dẫn 50 từ mà đăng như bài viết thông thường, nó sẽ xuất hiện chình ình trên Trang chủ, làm "loãng" và giảm tính trang trọng của blog.
- Ngược lại, nếu tác giả viết một bài tiểu luận dài 3,000 từ về *Thể thao* và muốn đưa nó vào widget *Bài Viết Nổi Bật*, bài viết này **bắt buộc vẫn phải hiển thị bình thường trên Trang chủ** chứ không được phép bị ẩn đi.

### 1.2. Mục tiêu giải pháp v2.1
Xây dựng giải pháp **Flexible Special Posts Widget** với các trụ cột:
1. **Quy tắc Nhãn Độc quyền `@` (Exclusive Feature Label Exclusion)**:
   - Chỉ ẩn bài viết khỏi Trang chủ khi bài viết đó **CHỈ CHỨA DUY NHẤT các Feature Label (`@...`)**.
   - Nếu bài viết có **ít nhất một Regular Label (nhãn thường)** thì luôn hiển thị ở Trang chủ bình thường.
2. **Hỗ trợ Đa nhãn cho cả Bài viết & Widget (Multi-label Matching)**:
   - Bài viết có thể gắn nhiều nhãn (thường + `@`).
   - Widget có thể cấu hình lắng nghe nhiều nhãn (`data-labels="@Điểm tin, Thể thao"`). Cứ bài viết nào khớp 1 trong các nhãn thì đều được widget tiếp nhận.
3. **Kiến trúc Hiển thị Đa Mẫu Cắm Ghép (Pluggable Pattern Strategy)**:
   - Một Widget Engine duy nhất xử lý đa dạng giao diện qua thuộc tính `data-pattern` (`ranked`, `spotlight`, `quote`, `digest`, `video`, `slideshow`).
4. **Quản trị Kéo-thả Không chạm Code (Zero-code Blogger Layout)**:
   - Thêm, sửa, xóa, cấu hình tham số trực tiếp trên giao diện Bố cục của Blogger, tự động co giãn thích ứng qua CSS Container Queries.

---

## 2. QUY TẮC NHÃN & CƠ CHẾ ĐIỀU HƯỚNG HIỂN THỊ (LABEL MATRIX)

Hệ thống phân chia toàn bộ nhãn trên blog thành 2 nhóm duy nhất:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PHÂN LOẠI NHÃN (LABELS) TRÊN BLOG                                                               │
├────────────────────────────────────────────────┬────────────────────────────────────────────────┤
│ 1. NHÃN THƯỜNG (Regular Labels)                │ 2. NHÃN TÍNH NĂNG / WIDGET (Feature Labels)    │
│ - Định dạng: Chữ thường, KHÔNG có tiền tố "@"   │ - Định dạng: Luôn bắt đầu bằng tiền tố "@"     │
│ - Ví dụ: `Thể thao`, `Công nghệ`, `Triết học`  │ - Ví dụ: `@Điểm tin`, `@Quote`, `@Nổi bật`     │
│ - Vai trò: Phân loại danh mục bài viết chính   │ - Vai trò: Chỉ định đưa bài vào các Widget     │
└────────────────────────────────────────────────┴────────────────────────────────────────────────┘
```

---

### 2.1. Quy Tắc Vàng Ẩn Khỏi Trang Chủ (Golden Exclusion Rule)

> ⭐️ **QUY TẮC VÀNG**:  
> Một bài viết **CHỈ BỊ ẨN KHỎI TRANG CHỦ & TIMELINE ARCHIVE** khi và chỉ khi:  
> **100% nhãn gắn vào bài viết ĐỀU là Nhãn Tính Năng (Feature Label có tiền tố `@`) và KHÔNG CÓ BẤT KỲ nhãn thường nào.**

Bảng đối chiếu hành vi thực tế:

| Nhãn gắn vào bài viết | Loại bài viết thực tế | Hiển thị ở Trang chủ? | Hiển thị ở Widget? |
| :--- | :--- | :---: | :---: |
| `[@Điểm tin]` | Tin vắn ngắn, chỉ muốn độc giả xem ở widget | ❌ **ẨN** *(Không làm loãng blog)* | ✅ **HIỆN** ở Widget có config `@Điểm tin` |
| `[@Điểm tin, @Ghi chép]` | Đoản thi / trích dẫn thuần túy cho widget | ❌ **ẨN** *(100% là nhãn `@`)* | ✅ **HIỆN** ở Widget `@Điểm tin` hoặc `@Ghi chép` |
| `[Thể thao]` | Bài viết thể thao chuyên sâu bình thường | ✅ **HIỆN** bình thường | ✅ **HIỆN** nếu Widget có config `Thể thao` |
| `[Thể thao, @Điểm tin]` | Bài viết thể thao lớn muốn ghim thêm vào widget | ✅ **HIỆN** *(Vì có nhãn thường `Thể thao`)* | ✅ **HIỆN** ở Widget có config `@Điểm tin` hoặc `Thể thao` |
| `[Công nghệ, @Nổi bật]` | Bài viết phân tích công nghệ được gán mác Top | ✅ **HIỆN** *(Có nhãn thường `Công nghệ`)* | ✅ **HIỆN** ở Widget có config `@Nổi bật` (Ranked) |

---

### 2.2. Cơ chế lọc ở tầng Máy chủ Blogger XML v3

Trong tiện ích hiển thị bài viết chính của theme (`<b:widget id='Blog1' type='Blog'>`):

```xml
<!-- Bộ lọc loại trừ: ẨN bài viết nếu TẤT CẢ các nhãn của bài đều bắt đầu bằng "@" -->
<b:loop values='data:posts' var='post'>
  <!-- Kiểm tra xem 100% nhãn có phải là Feature Label hay không -->
  <b:with value='data:post.labels every (label =&gt; label.name startsWith "@")' var='isExclusiveFeaturePost'>
    <!-- Nếu là bài viết thuần Feature Label và đang ở Trang chủ -> ẨN ĐI -->
    <b:if cond='not (data:view.isHomepage and data:isExclusiveFeaturePost)'>
      <!-- Render thẻ bài viết chuẩn (post-card) cho các bài viết chính thống -->
      <article class='post-card'>
        ...
      </article>
    </b:if>
  </b:with>
</b:loop>
```

> **Hiệu quả**: 
> - Nếu bài viết có cả `Thể thao` và `@Điểm tin` ➔ `isExclusiveFeaturePost` trả về `false` ➔ Bài viết **hiển thị bình thường trên trang chủ**.
> - Chỉ khi tác giả cố tình chỉ gắn mỗi nhãn `@Điểm tin` ➔ `isExclusiveFeaturePost` là `true` ➔ Bài viết **ẩn hoàn toàn khỏi trang chủ**.

---

### 2.3. Lọc sạch ký tự tiền tố trên giao diện (Label Sanitization)
Độc giả không bao giờ thấy ký tự `@` trên giao diện người dùng. Hàm chuẩn hóa chạy xuyên suốt:
```javascript
function formatLabelName(rawLabel) {
  if (!rawLabel) return '';
  return decodeURIComponent(rawLabel).replace(/^[@#_~]/, '').trim();
}
```
*Ví dụ*: Nhãn `@Điểm tin` ➔ hiển thị trên thẻ bài và tiêu đề là **"Điểm tin"**.

---

## 3. CƠ CHẾ WIDGET ĐA NHÃN & NGUỒN DỮ LIỆU (MULTI-LABEL MATCHING)

### 3.1. Nguyên tắc Khớp nhãn của Widget (Matching Logic)
* **Nguyên tắc**: Bất kỳ bài viết nào chứa **ít nhất một trong các nhãn** được cấu hình trong `data-labels` của Widget đều được coi là hợp lệ (Quan hệ HỢP / OR).
* **Khử trùng lặp (Deduplication)**: Nếu một bài viết thỏa mãn 2 hoặc nhiều nhãn trong cùng một widget (ví dụ vừa có `Thể thao` vừa có `@Điểm tin`), hệ thống tự động loại bỏ trùng lặp để bài viết chỉ xuất hiện đúng 1 lần trên widget.

```text
Cấu hình Widget: data-labels="@Điểm tin, Thể thao"

             ┌──────────────────────┐
             │ BÀI 1: [@Điểm tin]   ├───── Khớp nhãn "@Điểm tin" ─────┐
             └──────────────────────┘                                 ▼
             ┌──────────────────────┐                     ┌───────────────────────┐
             │ BÀI 2: [Thể thao]    ├───── Khớp nhãn "Thể thao"  ────►│ HIỂN THỊ WIDGET       │
             └──────────────────────┘                                 │ (Sắp xếp theo newest) │
             ┌──────────────────────┐                                 └───────────────────────┘
             │ BÀI 3: [Triết học]   ├───── Không khớp nhãn nào (Bỏ qua)
             └──────────────────────┘
```

---

### 3.2. Tiêu chí Sắp xếp & Chọn bài (`data-sort` & `data-posts`)

| Tiêu chí (`data-sort`) | Ý nghĩa & Cách thức hoạt động | Phù hợp với |
| :--- | :--- | :--- |
| **`latest`** *(Mặc định)* | Lấy các bài mới xuất bản nhất khớp với nhãn (`orderby=published`). | Tiêu điểm, Điểm tin, Cập nhật mới |
| **`views`** *(hoặc `popular`)* | **Theo số lượt xem nhiều nhất**: Tự động liên kết với nguồn dữ liệu máy chủ `PopularPosts` của Google Blogger để xếp hạng bài được độc giả đọc nhiều nhất theo thời gian (`all_time`, `last_30_days`, `last_7_days`). | **Bài Viết Nổi Bật (Ranked 01, 02 - Mockup)**, Top Trending |
| **`random`** | Bốc bài ngẫu nhiên từ kho bài viết của các nhãn cấu hình. F5 trang sẽ tự đổi bài khác. | Trích dẫn, Đoản thi, Chiêm nghiệm |
| **`data-posts`** *(Handpicked)* | Tác giả điền danh sách URL bài viết cụ thể: Widget hiển thị chính xác theo thứ tự `01`, `02`, `03` mà tác giả muốn. | Bài viết nổi bật do tác giả tự tay chọn |

---

## 4. HỆ THỐNG MẪU HIỂN THỊ (PLUGGABLE DISPLAY PATTERNS)

Mọi pattern đều dùng chung một Container Shell và Data Fetcher, nhưng chuyển đổi linh hoạt qua thuộc tính `data-pattern`:

```text
                                  ┌───► 1. Pattern "ranked"     (Top bài viết số to 01, 02 - Mockup)
                                  │
                                  ├───► 2. Pattern "spotlight"  (Tiêu điểm 1 bài Hero Card + Summary + CTA)
                                  │
┌───────────────────────────────┐ ├───► 3. Pattern "quote"      (Trích dẫn / Đoản thi / Nghệ thuật chữ)
│ special-posts-widget          │ │
│ data-labels="..."             ├─┼───► 4. Pattern "digest"     (Bản tin vắn / Dòng thời gian mini)
│ data-pattern="..."            │ │
└───────────────────────────────┘ ├───► 5. Pattern "video"      (Video Spotlight: Play / Lightbox) [Mở rộng]
                                  │
                                  └───► 6. Pattern "slideshow"  (Băng chuyền ảnh trượt ngang) [Mở rộng]
```

---

### 4.1. Pattern 1: `ranked` – Bảng xếp hạng Top bài viết *(Chuẩn theo Mockup)*

Phù hợp nhất khi đặt ở **Cột bên (Sidebar)** cho widget **"🔥 Bài Viết Nổi Bật"**, **"Bài Đọc Nhiều"**.

```text
┌────────────────────────────────────────────────────────┐
│ 🔥 BÀI VIẾT NỔI BẬT                     [Xem tất cả »] │
├────────────────────────────────────────────────────────┤
│ 01  ┌───────┐  Nghịch Lý Của Việc Chọn Lựa             │
│     │ THUMB │                                          │
│     └───────┘  09/09/2026 • 5 phút đọc                 │
├────────────────────────────────────────────────────────┤
│ 02  ┌───────┐  30 Ngày Không Dùng Điện Thoại           │
│     │ THUMB │                                          │
│     └───────┘  05/09/2026 • 8 phút đọc                 │
├────────────────────────────────────────────────────────┤
│ 03  ┌───────┐  Review Sách: Tư Duy Nhanh và Chậm       │
│     │ THUMB │                                          │
│     └───────┘  01/09/2026 • 12 phút đọc                │
└────────────────────────────────────────────────────────┘
```

* **Đặc tả UI & Design Tokens**:
  - **Số thứ tự lớn làm mờ**: `01`, `02`, `03`... font Sans đậm (`font-weight: 800`), kích thước `1.65rem`, màu `var(--text-muted)` độ mờ `0.35`.
  - **Thumbnail ảnh vuông**: Kích thước `52x52px` hoặc `56x56px`, bo tròn góc mềm mại `14px`. Tự động thay đổi kích cỡ ảnh từ Blogger feed (`s72-c` ➔ `s200-c`) để ảnh luôn sắc nét trên màn hình Retina.
  - **Tiêu đề**: Font `var(--font-sans)`, `font-weight: 600`, chiều cao dòng `1.35`, giới hạn tối đa 2 dòng (`line-clamp: 2`). Đổi sang màu `var(--primary)` khi hover.
  - **Metadata**: Ngày đăng định dạng ngắn gọn `DD/MM/YYYY`.

---

### 4.2. Pattern 2: `spotlight` – Tiêu điểm bài viết (Hero Card)

Phù hợp khi đặt ở **Đầu trang chủ (Main Content Hero)** hoặc trên đỉnh Sidebar.

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 🌟 BÀI VIẾT TIÊU ĐIỂM                                                  │
├────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │                  COVER IMAGE (Tỷ lệ 16:9 sắc nét)                  │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ 🏷️ PHÂN TÍCH CHUYÊN SÂU • 📅 08/09/2026                               │
│                                                                        │
│ Sự Suy Tàn Của Khả Năng Tập Trung Trong Kỷ Nguyên Số                    │
│                                                                        │
│ Tại sao chúng ta ngày càng khó đọc trọn một cuốn sách hay ngồi yên một │
│ mình trong 15 phút? Bài viết này mổ xẻ cơ chế dopamin của mạng xã hội   │
│ và gợi ý phương pháp tái thiết lập khả năng tư duy sâu...              │
│                                                                        │
│ [ Đọc tiếp bài viết → ]                                                │
└────────────────────────────────────────────────────────────────────────┘
```

* **Đặc tả UI**:
  - Khung thẻ Card lớn, Cover image tự động lấy ảnh đầu tiên trong bài viết (chất lượng cao `s600`).
  - Đoạn tóm tắt `summary` cắt gọn 3 dòng (`line-clamp: 3`).
  - Nút kêu gọi hành động (CTA) phong cách Editorial: `[Đọc tiếp bài viết →]`.

---

### 4.3. Pattern 3: `quote` – Trích dẫn / Chiêm nghiệm / Đoản thi

Tạo khoảng nghỉ thẩm mỹ (Visual Breathing Space) trên blog tri thức.

```text
┌────────────────────────────────────────────────────────┐
│ ☕ CHIÊM NGHIỆM HÔM NAY                                │
├────────────────────────────────────────────────────────┤
│                                                        │
│   “ Sự đơn giản không phải là cái kết của sự nông cạn, │
│     mà là đỉnh cao của sự tinh tế sau khi đã thấu      │
│     suốt mọi điều phức tạp. ”                          │
│                                                        │
│                    — Leonardo da Vinci                 │
│                                                        │
│ ────────────────────────────────────────────────────── │
│ ✦ Vài suy nghĩ về sự tinh giản trong lối sống hiện đại │
│ [ Xem lời bình & phân tích → ]                         │
└────────────────────────────────────────────────────────┘
```

* **Đặc tả UI**:
  - **Không dùng thumbnail ảnh**: Tập trung 100% vào nghệ thuật chữ (Typography).
  - Dấu ngoặc kép lớn `“ ”`, font chữ Serif in nghiêng quý phái (`var(--font-serif)`), kích thước `1.05rem` – `1.15rem`.
  - Tên tác giả canh lề phải trang trọng.
  - Nút bấm `[Xem lời bình & phân tích →]` dẫn vào bài viết chi tiết.

---

### 4.4. Pattern 4: `digest` – Bản tin vắn / Dòng thời gian mini

Dành cho các cập nhật tin tức nhanh trong ngày.

```text
┌────────────────────────────────────────────────────────┐
│ ⚡ ĐIỂM TIN MỖI NGÀY                    [Xem tất cả »] │
├────────────────────────────────────────────────────────┤
│ 📅 Hôm nay, 08:15                                      │
│ ✦ Ra mắt tính năng Dòng thời gian mới                  │
│   Một cập nhật nhỏ giúp bạn tra cứu bài viết dễ dàng...│
├────────────────────────────────────────────────────────┤
│ 📅 08/09/2026                                          │
│ ✦ 3 công cụ ghi chú tối giản tôi dùng mỗi ngày         │
│   Ghi chép không cần phức tạp, quan trọng là sự đều đặn│
└────────────────────────────────────────────────────────┘
```

---

### 4.5. Các Pattern Mở Rộng Tương Lai (Extensible Patterns)

* **Pattern 5: `video` (Video Spotlight)**:
  - Tự động nhận diện ID video YouTube trong bài viết, hiển thị Player nhúng hoặc thumbnail có nút Play overlay.
* **Pattern 6: `slideshow` (Băng chuyền bài viết Carousel)**:
  - Hiển thị danh sách bài viết dạng trượt ngang mượt mà bằng CSS Scroll Snap, có nút điều hướng `‹` `›` và thanh chấm tròn chỉ mục (dots).

---

## 5. THÍCH ỨNG VỊ TRÍ ĐA NĂNG (CONTAINER QUERIES ADAPTIVE)

Widget tự động nhận diện độ rộng của container chứa nó để thay đổi layout phù hợp:

```css
/* Container cơ sở */
.special-posts-widget {
  container-type: inline-size;
  container-name: special-widget;
}

/* 1. Khi ở Cột bên (Sidebar / Chiều rộng < 480px) */
@container special-widget (max-width: 479px) {
  .special-posts-items {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }
}

/* 2. Khi ở Vùng chính (Main Content / Chiều rộng >= 480px) */
@container special-widget (min-width: 480px) {
  .pattern-digest .special-posts-items,
  .pattern-ranked .special-posts-items {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.25rem;
  }
  .pattern-spotlight {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 1.5rem;
    align-items: center;
  }
}
```

---

## 6. HƯỚNG DẪN CẤU HÌNH TRÊN GIAO DIỆN BLOGGER (DÀNH CHO TÁC GIẢ)

Tác giả **không cần chạm vào code XML theme**. Mọi việc được thực hiện trong **Bố cục (Layout)** của Blogger:

### 6.1. Bảng tham số cấu hình đầy đủ (Data Attributes)

| Tham số | Kiểu dữ liệu | Mặc định | Ý nghĩa & Mô tả |
| :--- | :---: | :---: | :--- |
| **`data-pattern`** | String | `digest` | Mẫu giao diện: `ranked`, `spotlight`, `quote`, `digest`, `video`, `slideshow`. |
| **`data-labels`** *(hoặc `data-label`)* | String | `@Điểm tin` | **Danh sách nhãn** cần lấy bài (phân tách bằng dấu phẩy, ví dụ: `@Điểm tin, Thể thao`). |
| **`data-sort`** | String | `latest` | Tiêu chí sắp xếp: `latest` (mới nhất), `views` (lượt đọc nhiều nhất) hoặc `random` (ngẫu nhiên). |
| **`data-time-range`** | String | `all_time` | Khoảng thời gian tính lượt xem (chỉ áp dụng khi `data-sort="views"`): `all_time`, `last_30_days`, `last_7_days`. |
| **`data-limit`** | Number | `4` | Số lượng bài viết hiển thị (từ 1 đến 10 bài). |
| **`data-posts`** | String | *(Trống)* | Danh sách URL bài viết cụ thể cần chỉ định hiển thị chính xác theo thứ tự `01, 02`. |
| **`data-show-thumbnail`** | Boolean | `true` | Bật/tắt ảnh đại diện. |
| **`data-show-snippet`** | Boolean | `true` | Bật/tắt đoạn tóm tắt văn bản. |
| **`data-view-all-text`** | String | `Xem tất cả »` | Nhãn của nút bấm chuyển sang trang chuyên đề bài viết. |

---

### 6.2. Các ví dụ cấu hình thực tế

#### Ví dụ 1: Widget Bảng xếp hạng Top bài đọc nhiều nhất theo Lượt Xem *(Chuẩn Mockup)*
```html
<div class="special-posts-widget" 
     data-pattern="ranked" 
     data-sort="views" 
     data-time-range="last_30_days"
     data-limit="5">
</div>
```

#### Ví dụ 2: Widget Bảng xếp hạng các bài mang nhãn `@Nổi bật` mới nhất
```html
<div class="special-posts-widget" 
     data-labels="@Nổi bật" 
     data-pattern="ranked" 
     data-limit="5">
</div>
```

#### Ví dụ 2: Widget Điểm tin gom cả nhãn `@Điểm tin` VÀ nhãn `Thể thao`
```html
<div class="special-posts-widget" 
     data-labels="@Điểm tin, Thể thao" 
     data-pattern="digest" 
     data-limit="4">
</div>
```

#### Ví dụ 3: Widget Bài viết Tiêu điểm (Spotlight Hero)
```html
<div class="special-posts-widget" 
     data-labels="@Tiêu điểm" 
     data-pattern="spotlight" 
     data-limit="1">
</div>
```

#### Ví dụ 4: Widget Chiêm nghiệm / Thơ (Bốc ngẫu nhiên mỗi lần xem)
```html
<div class="special-posts-widget" 
     data-labels="@Quote" 
     data-pattern="quote" 
     data-sort="random" 
     data-limit="1">
</div>
```

#### Ví dụ 5: Widget Chỉ định bài viết tâm đắc tự chọn (Handpicked URLs)
```html
<div class="special-posts-widget" 
     data-pattern="ranked"
     data-posts="
       /2026/09/nghich-ly-cua-viec-chon-lua.html,
       /2026/08/30-ngay-khong-dung-dien-thoai.html,
       /2026/07/tu-duy-nhanh-va-cham.html
     ">
</div>
```

---

## 7. ĐẶC TẢ JAVASCRIPT ENGINE XỬ LÝ ĐA NHÃN (`special-posts.js`)

Logic xử lý bất đồng bộ, hỗ trợ nạp song song nhiều feed và khử trùng lặp:

```javascript
/**
 * Blogger Special Posts Widget Engine v2.1
 * Multi-label Support & Pluggable Pattern Strategy
 */
(function() {
  'use strict';

  const CACHE_PREFIX = 'editorial_sp_';
  const CACHE_TTL = 5 * 60 * 1000; // 5 phút

  const PATTERN_RENDERERS = {
    ranked: renderRankedPattern,
    spotlight: renderSpotlightPattern,
    quote: renderQuotePattern,
    digest: renderDigestPattern,
    // Mở rộng tương lai
    video: renderVideoPattern,
    slideshow: renderSlideshowPattern
  };

  document.addEventListener('DOMContentLoaded', initSpecialPostWidgets);

  function initSpecialPostWidgets() {
    const widgets = document.querySelectorAll('.special-posts-widget');
    widgets.forEach(renderWidgetInstance);
  }

  async function renderWidgetInstance(container) {
    const pattern = container.dataset.pattern || 'digest';
    const rawLabels = container.dataset.labels || container.dataset.label || '';
    const limit = parseInt(container.dataset.limit, 10) || 4;
    const sort = container.dataset.sort || 'latest';
    const handpickedPosts = container.dataset.posts;

    // 1. Hiển thị Skeleton Loading chống giật trang (CLS = 0)
    renderSkeleton(container, pattern, limit);

    try {
      let posts = [];

      if (handpickedPosts) {
        // Nạp theo danh sách URL chỉ định
        posts = await fetchHandpickedPosts(handpickedPosts);
      } else if (sort === 'views' || sort === 'popular') {
        // Nạp theo bài đọc nhiều nhất (Popular Posts)
        const timeRange = container.dataset.timeRange || 'all_time';
        posts = await fetchPopularPosts(limit, timeRange, rawLabels);
      } else if (rawLabels) {
        // Tách các nhãn: ví dụ "@Điểm tin, Thể thao" -> ["@Điểm tin", "Thể thao"]
        const labelList = rawLabels.split(',').map(l => l.trim()).filter(Boolean);
        posts = await fetchMultiLabelPosts(labelList, limit, sort);
      }

      if (!posts || posts.length === 0) {
        renderEmptyState(container);
        return;
      }

      // 2. Gọi Pattern Renderer tương ứng
      const renderer = PATTERN_RENDERERS[pattern] || PATTERN_RENDERERS.digest;
      container.innerHTML = renderer(posts, container.dataset);

    } catch (err) {
      console.warn('[SpecialPostsWidget] Lỗi nạp dữ liệu:', err);
      container.innerHTML = '<div class="sp-error">Không thể tải nội dung mục này.</div>';
    }
  }

  // Thu thập dữ liệu từ nhiều nhãn và khử trùng lặp (Deduplication)
  async function fetchMultiLabelPosts(labels, limit, sort) {
    // Gọi song song các feed của từng nhãn
    const promises = labels.map(label => fetchSingleLabelFeed(label, limit));
    const results = await Promise.all(promises);

    // Gộp tất cả bài viết lại
    const allPosts = results.flat();

    // Khử trùng lặp theo URL bài viết (unique by url)
    const uniquePostsMap = new Map();
    allPosts.forEach(post => {
      if (!uniquePostsMap.has(post.url)) {
        uniquePostsMap.set(post.url, post);
      }
    });

    let mergedPosts = Array.from(uniquePostsMap.values());

    // Xử lý tiêu chí sắp xếp
    if (sort === 'random') {
      mergedPosts.sort(() => Math.random() - 0.5);
    } else {
      // Mặc định: bài mới nhất lên đầu
      mergedPosts.sort((a, b) => new Date(b.published) - new Date(a.published));
    }

    return mergedPosts.slice(0, limit);
  }

  // Tối ưu ảnh Thumbnail sắc nét
  function optimizeThumbnail(url, size = 's200-c') {
    if (!url) return '';
    return url.replace(/\/s[0-9]+(-c)?\//, `/${size}/`)
              .replace(/\/w[0-9]+-h[0-9]+(-c)?\//, `/${size}/`);
  }

  // BỘ DỰNG PATTERN RANKED (Số to 01, 02 - Chuẩn Mockup)
  function renderRankedPattern(posts, config) {
    const itemsHtml = posts.map((post, index) => {
      const rankNum = String(index + 1).padStart(2, '0');
      const thumb = post.thumbnail ? optimizeThumbnail(post.thumbnail, 's160-c') : '';
      return `
        <a href="${post.url}" class="sp-ranked-item">
          <span class="sp-rank-number">${rankNum}</span>
          ${thumb ? `<div class="sp-ranked-thumb"><img src="${thumb}" alt="${post.title}" loading="lazy"/></div>` : ''}
          <div class="sp-ranked-content">
            <h4 class="sp-ranked-title">${post.title}</h4>
            <span class="sp-ranked-date">${post.dateFormatted}</span>
          </div>
        </a>
      `;
    }).join('');

    return `
      <div class="special-posts-ranked-list">
        ${itemsHtml}
      </div>
    `;
  }

  // (Các hàm render khác: renderSpotlightPattern, renderQuotePattern, renderDigestPattern...)
})();
```

---

## 8. TIÊU CHUẨN THIẾT KẾ UI/UX & TOKENS ĐỒNG BỘ

1. **Tương thích Chế độ Sáng / Tối (Light / Dark Mode)**:
   - Sử dụng 100% biến CSS có sẵn của theme: `var(--bg-card)`, `var(--border-color)`, `var(--text-main)`, `var(--text-muted)`, `var(--primary)`.
   - Chuyển chế độ mượt mà không gây giật màu hoặc đổi sai tông chữ.
2. **Khung xương tải trang (Skeleton Shimmer - CLS = 0)**:
   - Trong thời gian mạng tải feed (0.1s – 0.3s), widget tự động vẽ khung Skeleton Shimmer đúng kích thước của pattern tương ứng, triệt tiêu 100% hiện tượng nhảy giao diện.
3. **Hiệu ứng viền phát sáng khi bấm Menu Header (Anchor Highlight Pulse)**:
   - Khi độc giả bấm liên kết trên menu Header dẫn tới `#widget-{label}`, trang tự động cuộn mượt đến widget và kích hoạt viền sáng trong 1.5 giây để thu hút ánh nhìn.

---

## 9. BẢNG TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA MATRIX)

| Hạng mục kiểm tra | Tiêu chí kỹ thuật cần đạt | Đánh giá |
| :--- | :--- | :---: |
| **Quy tắc Ẩn Độc quyền `@`** | Đăng bài **chỉ có nhãn `@Điểm tin`**: Bài viết **ẨN 100%** khỏi luồng bài viết chính của Trang chủ & Timeline Archive. | [ ] |
| **Bài viết hỗn hợp** | Đăng bài có nhãn **`[Thể thao, @Điểm tin]`**: Bài viết **VẪN HIỆN** trên Trang chủ bình thường VÀ đồng thời hiện ở Widget. | [ ] |
| **Cấu hình Đa nhãn** | Cấu hình `data-labels="@Điểm tin, Thể thao"`: Widget hiển thị bài từ cả 2 nhãn, tự động loại bỏ trùng lặp. | [ ] |
| **Hiển thị Pattern `ranked`** | Hiển thị chính xác số thứ tự lớn `01, 02...`, thumbnail vuông bo góc, tiêu đề và ngày tháng (chuẩn theo hình mockup). | [ ] |
| **Hiển thị Pattern `spotlight`**| Hiển thị 1 bài viết lớn gồm Cover 16:9, Title lớn, tóm tắt 3 dòng và nút CTA dẫn vào bài. | [ ] |
| **Hiển thị Pattern `quote`** | Hiển thị nghệ thuật Typography với dấu ngoặc kép `“ ”`, câu trích dẫn và nút đọc lời bình. | [ ] |
| **Tiêu chí `random`** | Cấu hình `data-sort="random"`: F5 trang nhiều lần, nội dung thay đổi ngẫu nhiên từ kho bài viết. | [ ] |
| **Tiêu chí `views`** | Cấu hình `data-sort="views"`: Widget nạp chính xác danh sách bài viết có lượt đọc nhiều nhất từ máy chủ Google. | [ ] |
| **Tiêu chí `data-posts`** | Điền danh sách URL bài viết: Widget nạp chính xác các bài đó theo đúng thứ tự chỉ định. | [ ] |
| **Thao tác Bố cục (Layout)** | Kéo thả widget giữa Sidebar và Main Content: Tự động co giãn theo Container Queries mượt mà. | [ ] |
| **Lọc sạch tiền tố** | Tiêu đề widget, thẻ tag và breadcrumb không hiển thị các ký tự `@`. | [ ] |
| **Khả năng mở rộng tương lai** | Cấu trúc code sẵn sàng tiếp nhận thêm hàm renderer cho `video` và `slideshow` mà không phải đổi schema. | [ ] |
