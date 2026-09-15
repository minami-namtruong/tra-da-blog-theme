# [BẢN THẢO CŨ - KHÔNG SỬ DỤNG] ĐẶC TẢ KỸ THUẬT: CÂY DÒNG THỜI GIAN RẼ NHÁNH (BRANCHING TIMELINE ARCHIVE)

> ⚠️ **TRẠNG THÁI: KHÔNG SỬ DỤNG (DEPRECATED / ARCHIVED DRAFT)**  
> **Lý do hủy bỏ**: Thiết kế chia 2 nhánh riêng biệt (Bài viết vs Ghi nhanh) đã được thay thế bằng thiết kế **Dòng thời gian đường tàu rẽ nhánh (Subway Metro Timeline)** hợp nhất trên một dòng thời gian với hệ thống Filter nâng cao trong ô Search.  
> **Đặc tả chính thức mới**: Vui lòng tham khảo file [`specs/SUBWAY_TIMELINE_ARCHIVE_SPECIFICATION.md`](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/SUBWAY_TIMELINE_ARCHIVE_SPECIFICATION.md).
>
> ---
> **Mã tính năng cũ**: `FEAT-BRANCHING-TIMELINE-V4-DRAFT`  
> **Dự án**: Blogger Editorial Theme (Blogspot XML v3)

## 1. TỔNG QUAN & TRIẾT LÝ THIẾT KẾ

### 1.1. Bối cảnh & Bài toán cần giải quyết
Trước đây, trang Dòng Thời Gian (`/p/muc-luc.html`) tuân thủ nghiêm ngặt quy tắc loại trừ: chỉ hiển thị các bài viết thường (**Regular Posts**), còn toàn bộ bài viết mang nhãn tính năng độc quyền bắt đầu bằng `@` (`@Quote`, `@Điểm tin`, `@Tiêu điểm`...) đều bị ẩn khỏi trang này để tránh làm "rác feed".

Tuy nhiên, nhu cầu thực tế của tác giả phát sinh:
- **Tác giả muốn có một không gian lưu trữ tập trung** cho cả những mẩu ghi chép ngắn, danh ngôn tâm đắc, hoặc bản tin vắn trên Dòng Thời Gian.
- **Xung đột bản chất nội dung**:
  - Nhóm 1: **Bài viết tâm huyết (Long-form/Heartfelt)** — Các bài tiểu luận, chuyên đề, bài viết sâu sắc đòi hỏi nhiều công sức và thời gian nghiền ngẫm.
  - Nhóm 2: **Ghi chép nhanh / AI Generate (Short-form/Snippets)** — Các câu trích dẫn ngắn lượm lặt khi đọc sách, cảm hứng vụt qua, hoặc tin vắn cập nhật nhanh hàng ngày (thường có sự hỗ trợ của AI).
- **Rào cản thiết kế**: Nếu chia Tab (`Tabs switcher`) thì giao diện thô kệch và mất chất văn chương; nếu lồng Filter 2 cấp thì thao tác phức tạp; nếu chia 2 cột thì khung đọc bị chật hẹp; nếu tách 2 trang thì gây phân mảnh trải nghiệm.

### 1.2. Định danh cốt lõi (Core Naming)
Để phản ánh chính xác bản chất thực tế mà không gây cảm giác "cấn" hay phân cấp sai lệch giá trị:
- **`✦ Bài Viết`** *(Articles)*: Dành cho toàn bộ bài viết chuyên sâu, tâm huyết có nhãn chủ đề thông thường (`Triết lý`, `Công nghệ`, `Sách hay`...).
- **`⚡ Ghi Nhanh`** *(Quick Notes / Snippets)*: Dành cho toàn bộ bài viết ngắn, trích dẫn, điểm tin mang nhãn tính năng `@` (`@Quote`, `@Điểm tin`, `@Tiêu điểm`...).
- **Hỗ trợ Song ngữ chuẩn (VI | EN)**:
  - `Bài Viết | Articles`
  - `Ghi Nhanh | Quick Notes` (hoặc `Notes`)

### 1.3. Ý tưởng đột phá: "Cây Dòng Thời Gian Rẽ Nhánh" (The Branching Tree)
Thay vì một danh sách phẳng đơn điệu, trang Dòng Thời Gian được biến thành một **tác phẩm thị giác giàu chất thơ**:
1. Từ **Node Gốc (Root / Origin)** ở đầu trang, dòng thời gian rẽ nhánh uyển chuyển thành 2 nhánh với **2 Node biểu tượng**:
   - **`🌿 Node Bài Viết`** (Bài viết dài tâm huyết)
   - **`⚡ Node Ghi Nhanh`** (Ghi chép vắn tắt, danh ngôn, điểm tin)
2. Người đọc có thể bấm trực tiếp vào từng Node để dòng thời gian chuyển nhánh tương ứng.
3. Thanh Chuyên Mục (Category Bar) bên dưới banner hiển thị đầy đủ cả 2 cụm nhãn, đồng bộ tương tác 2 chiều nhịp nhàng với 2 Node trên cây.

---

## 2. BỐ CỤC GIAO DIỆN (UI ARCHITECTURE)

### 2.1. Cấu trúc Khung Trang Tổng Thể (Page Hierarchy)
```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. Header Cố Định (Sticky Header & Nav Bar)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. Hero Header & Thống Kê                                                   │
│    "Kho Lưu Trữ Toàn Thư."                                                  │
│    [ 📚 42 Bài Viết ]    [ ⚡ 16 Ghi Nhanh ]    [ 🗓️ 3 Năm ]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. Thanh Tìm Kiếm Tức Thì (Instant Live Search)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. Thanh Chuyên Mục 2 Cụm (Two-Cluster Category Bar)                        │
│    [ ✦ Bài Viết ] [ Triết Lý ] [ Sách ]  ┆ ✦ ┆  [ ⚡ Ghi Nhanh ] [ @Quote ]...│
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. Cây Dòng Thời Gian Rẽ Nhánh Nghệ Thuật (The Branching SVG Tree)          │
│                               ✦ (Node Gốc)                                  │
│                               │                                             │
│                       ╭───────┴───────╮ (Đường cong SVG uốn lượn)          │
│                       ▼               ▼                                     │
│               [🌿 Node Bài Viết]   [⚡ Node Ghi Nhanh]                      │
│                       │                                                     │
│             (Trục thân chính tiếp nối theo nhánh được chọn)                  │
│                       │                                                     │
│                       ├─○ NĂM 2026                                          │
│                       │ │                                                   │
│                       │ ├───● Bài viết / Ghi chép 1                         │
│                       │ └───● Bài viết / Ghi chép 2                         │
│                       ▼                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. Footer 4 Cột Chuẩn Mực                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. CHI TIẾT CÁC THÀNH PHẦN GIAO DIỆN (COMPONENT SPECIFICATION)

### 3.1. Thanh Chuyên Mục 2 Cụm (Two-Cluster Category Bar)
Nằm dưới thanh tìm kiếm và trên Cây dòng thời gian, được bố trí trên cùng 1 hàng cuộn ngang mượt mà (Horizontal Scroll), phân chia rõ rệt thành 2 vùng nhận diện:

```text
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│ [ ✦ Bài Viết (42) ] [ Triết Lý ] [ Sách Hay ] [ Công Nghệ ]  ┆ ✦ ┆  [ ⚡ Ghi Nhanh (16) ] [ 💬 @Quote ] [ ⚡ @Điểm Tin ] │
│ └────────────────── CỤM BÀI VIẾT (REGULAR) ─────────────────┘       └────────────── CỤM GHI NHANH (FEATURE @) ─────────────┘ │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### A. Cụm 1: Bài Viết (Regular Cluster)
- **Nút đại diện (Head Pill)**: `[ ✦ Bài Viết (Tổng số) ]`
  - Đóng vai trò là nút "Tất cả" của nhánh Bài Viết.
  - Khi click: Node `Bài Viết` trên cây kích hoạt (Active), hiển thị toàn bộ bài viết dài tâm huyết.
- **Các nút chuyên mục con**: `[ Triết Lý ]`, `[ Sách Hay ]`, `[ Công Nghệ ]`...
  - Kiểu dáng: Bo góc `6px`, nền thẻ `var(--bg-card)`, viền tóc `var(--border-color)`.

#### B. Vạch Phân Cách Nghệ Thuật (Silk Separator)
- Nằm giữa 2 cụm: Gồm 2 đường kẻ đứng mờ kẹp giữa một ký hiệu điểm xuyết `┆ ✦ ┆`.
- Giúp người đọc nhận diện rõ ràng ranh giới giữa 2 luồng nội dung mà không cần phân cấp lồng dòng.

#### C. Cụm 2: Ghi Nhanh (Feature @ Cluster)
- **Nút đại diện (Head Pill)**: `[ ⚡ Ghi Nhanh (Tổng số) ]`
  - Đóng vai trò là nút "Tất cả" của nhánh Ghi Nhanh.
  - Khi click: Node `Ghi Nhanh` trên cây kích hoạt (Active), hiển thị toàn bộ các bài viết ngắn mang nhãn `@`.
  - Kiểu dáng: Có ánh màu hổ phách/accent (`var(--primary)`), viền bo tròn đầy đặn (Full rounded).
- **Các nút tính năng con**: `[ 💬 @Quote ]`, `[ ⚡ @Điểm Tin ]`, `[ 🌟 @Tiêu Điểm ]`...
  - Kiểu dáng: Có tiền tố icon đặc thù, viền nét đứt nhẹ hoặc hiệu ứng mềm hơn để biểu thị tính chất ghi chú/tin vắn.

---

### 3.2. Cây Dòng Thời Gian Rẽ Nhánh (The Branching SVG Tree)

#### A. Cấu trúc Đồ họa & Rẽ Nhánh
Khu vực rẽ nhánh được dựng bằng đồ họa vector **SVG thuần (Pure SVG)** kết hợp phần tử HTML định vị tuyệt đối:

1. **Điểm Khởi Nguồn (Origin Root)**:
   - Một điểm sáng tròn nhỏ trên đỉnh với biểu tượng ngôi sao 4 cánh `✦`, đại diện cho dòng chảy thời gian của blog.
2. **Đường Rẽ Nhánh Uốn Lượn (Bifurcation Paths)**:
   - Sử dụng 2 đường cong Bezier khối đối xứng (`cubic-bezier` SVG Path):
     - Một đường cong uốn lượn mềm mại sang trái dẫn tới **Node Bài Viết**.
     - Một đường cong uốn lượn mềm mại sang phải dẫn tới **Node Ghi Nhanh**.
   - Nét vẽ: Độ dày `2px`, màu `var(--border-color)`. Khi một nhánh active, đường cong dẫn tới nhánh đó sẽ phát sáng chuyển sang màu `var(--primary)` hoặc gradient ánh kim.
3. **Hai Node Nhánh Lớn (Branch Gateways)**:
   - **Node Bài Viết (`🌿`)**: Nằm ở điểm kết thúc của nhánh rẽ trái.
     - Vòng tròn tương tác đường kính `44px` - `48px`.
     - Nhãn đi kèm: `Bài Viết` (kèm số lượng bài).
   - **Node Ghi Nhanh (`⚡`)**: Nằm ở điểm kết thúc của nhánh rẽ phải.
     - Vòng tròn tương tác đường kính `44px` - `48px`.
     - Nhãn đi kèm: `Ghi Nhanh` (kèm số lượng bài).
   - **Hiệu ứng khi Active**: Node được bao quanh bởi một vòng hào quang phát sáng nhẹ (`box-shadow: 0 0 16px rgba(var(--primary-rgb), 0.35)`), biểu tượng bên trong có animation chuyển động nhẹ khi hover.

```text
                               ✦ (Root Node)
                               │
                       ╭───────┴───────╮ (SVG Curved Paths)
                      ╭╯               ╰╮
                     ╭╯                 ╰╮
           (Active) 🌿                   ⚡ (Inactive)
            [ ✦ Bài Viết ]           [ ⚡ Ghi Nhanh ]
                    │
           ═════════╧═════════ (Trục dọc tiếp nối xuống Cây Năm)
```

#### B. Trục Dọc Dòng Thời Gian & Các Node Bài Viết
Bên dưới nhánh được chọn, trục thời gian dọc (`spine-line`) tiếp tục chạy xuống:
- **Node Năm (Year Marker)**: Vòng tròn mốc năm `○ 2026` với đường kẻ ngang nối sang tiêu đề năm có khả năng đóng/mở (Accordion).
- **Node Bài Viết (Entry Nodes `●`)**:
  - Nằm ngay trên đường trục dọc.
  - Mỗi bài viết nối với trục bằng một đường cong nhỏ mềm mại.
  - Hiệu ứng: Khi rê chuột vào thẻ bài viết, Node `●` tương ứng trên trục sẽ phóng to nhẹ (`scale(1.3)`) và đổi màu sáng.

---

### 3.3. Định Dạng Thẻ Hiển Thị (Card Styling)

Để phù hợp với bản chất từng nhóm, thẻ hiển thị trên dòng thời gian có sự phân hóa trực quan:

#### A. Thẻ thuộc nhánh "Bài Viết" (Editorial Card)
- **Cấu trúc**: Thẻ phẳng 1 dòng sang trọng chuẩn xuất bản.
- **Thành phần**:
  1. Huy hiệu chuyên mục: `[ Triết Lý ]` (Màu sắc theo token quy chuẩn).
  2. Tiêu đề bài viết: Font chữ rõ ràng, in đậm nhẹ, gạch chân khi hover.
  3. Huy hiệu AI Transparency: Micro badge `[ ✨ AI ]` (nếu bài viết có khai báo nhãn AI).
  4. Ngày đăng: `📅 15/08`.
  5. Mũi tên điều hướng: `→`.

#### B. Thẻ thuộc nhánh "Ghi Nhanh" (Snippet / Note Card)
- **Cấu trúc**: Thẻ ghi chú mềm mại, phản ánh đúng tính chất tin vắn hoặc danh ngôn.
- **Biến thể theo từng nhãn `@`**:
  - **Với `@Quote` (Trích dẫn)**:
    - Hiển thị theo phong cách danh ngôn: Font Serif nghiêng, dấu ngoặc kép trích dẫn `“...”`, tác giả/nguồn trích dẫn bên dưới, ngày đăng mờ ở góc.
  - **Với `@Điểm tin` (Bản tin nhanh)**:
    - Có icon tia sét `⚡`, tiêu đề ngắn gọn, đoạn tóm tắt 1-2 dòng, nút `Đọc tiếp →`.
  - **Với `@Tiêu điểm` (Nổi bật)**:
    - Thẻ có viền vi kim loại sáng hoặc badge `🌟 Tiêu Điểm` nổi bật.

---

## 4. QUY TẮC TƯƠNG TÁC 2 CHIỀU & QUẢN LÝ TRẠNG THÁI (STATE MANAGEMENT)

### 4.1. Bảng Ma Trận Tương Tác (Interaction Matrix)

| Hành động của người dùng | Nhánh Active | Category Pill Active | Danh sách hiển thị bên dưới |
| :--- | :---: | :---: | :--- |
| **Mặc định khi vào trang** | **`🌿 Bài Viết`** | `✦ Bài Viết` | Toàn bộ bài viết dài tâm huyết |
| **Click vào `[ ✦ Bài Viết ]`** (hoặc click quả cầu Node Bài Viết) | **`🌿 Bài Viết`** | `✦ Bài Viết` | Toàn bộ bài viết dài tâm huyết |
| **Click vào chuyên mục thường** *(VD: `Triết Lý`)* | **`🌿 Bài Viết`** | `Triết Lý` | Chỉ bài viết dài thuộc chuyên mục Triết Lý |
| **Click vào `[ ⚡ Ghi Nhanh ]`** (hoặc click quả cầu Node Ghi Nhanh) | **`⚡ Ghi Nhanh`** | `⚡ Ghi Nhanh` | **Toàn bộ các bài viết ngắn mang nhãn `@`** |
| **Click vào nhãn tính năng con** *(VD: `💬 @Quote`)* | **`⚡ Ghi Nhanh`** | `💬 @Quote` | Chỉ các bài trích dẫn mang nhãn `@Quote` |
| **Click vào nhãn `⚡ @Điểm Tin`** | **`⚡ Ghi Nhanh`** | `⚡ @Điểm Tin` | Chỉ các bài tin vắn mang nhãn `@Điểm tin` |

### 4.2. Tương tác với Ô Tìm Kiếm (Live Search Integration)
- Khi người dùng gõ từ khóa vào ô tìm kiếm:
  - Nếu đang ở nhánh **Bài Viết**: Tìm kiếm tiêu đề và nội dung của các bài viết dài.
  - Nếu đang ở nhánh **Ghi Nhanh**: Tìm kiếm trong các câu quote, trích dẫn, điểm tin nhanh.
  - Nếu kết quả của nhánh hiện tại trống nhưng nhánh kia có kết quả: Hệ thống hiển thị gợi ý thông minh: *"Tìm thấy 3 kết quả bên nhánh Ghi Nhanh. [Chuyển nhánh để xem →]"*.

### 4.3. Đồng Bộ Trạng Thái URL (URL Parameter Synchronization)
Để người dùng có thể chia sẻ trực tiếp liên kết tới từng nhánh hoặc bộ lọc:
- Nhánh Bài Viết (Mặc định): `/p/muc-luc.html` (hoặc `/p/muc-luc.html?stream=articles`)
- Lọc theo chuyên mục thường: `/p/muc-luc.html?cat=triet-ly`
- Nhánh Ghi Nhanh: `/p/muc-luc.html?stream=notes`
- Lọc theo nhãn tính năng: `/p/muc-luc.html?stream=notes&cat=quote`

---

## 5. CƠ CHẾ KỸ THUẬT (DATA PIPELINE & IMPLEMENTATION)

### 5.1. Nạp Dữ Liệu & Phân Nhánh Client-side
Chỉ sử dụng **1 lần fetch duy nhất** qua Blogger Feed API chính thống để tiết kiệm tối đa tài nguyên:
```http
GET /feeds/posts/summary?alt=json&max-results=500
```

Trong vòng lặp xử lý dữ liệu (`Data Pipeline`):
```javascript
var articles = []; // Chứa bài viết tâm huyết (Regular)
var notes = [];    // Chứa ghi chép ngắn (Feature @)

feedEntries.forEach(function(entry) {
  var allLabels = extractLabels(entry);
  var normalLabels = allLabels.filter(function(l) { return !l.startsWith('@') && !l.startsWith('ai:') && !l.startsWith('series:'); });
  var featureLabels = allLabels.filter(function(l) { return l.startsWith('@'); });

  // 1. Phân loại vào Nhánh Ghi Nhanh
  if (featureLabels.length > 0) {
    notes.push(createNoteObject(entry, featureLabels));
  }

  // 2. Phân loại vào Nhánh Bài Viết
  // Điều kiện: Có ít nhất 1 nhãn thường HOẶC thuộc một Series bài viết
  if (normalLabels.length > 0 || hasSeriesLabel(entry)) {
    articles.push(createArticleObject(entry, normalLabels));
  }
});
```

> **Lưu ý đặc biệt (Hybrid Posts)**: Nếu một bài viết vừa có nhãn `@Tiêu điểm` vừa có nhãn `Sách hay`:
> - Bài này sẽ xuất hiện ở **Nhánh Bài Viết** (dưới chủ đề `Sách hay`).
> - Đồng thời cũng xuất hiện ở **Nhánh Ghi Nhanh** (dưới nhóm `@Tiêu điểm`).

### 5.2. Đồ Họa Vector SVG Cho Đường Rẽ Nhánh
Đường cong rẽ nhánh được dựng bằng thẻ SVG linh hoạt, đảm bảo sắc nét 100% trên mọi kích thước màn hình:
```html
<svg class="timeline-tree-svg" viewBox="0 0 800 120" preserveAspectRatio="none" aria-hidden="true">
  <!-- Đường thân gốc -->
  <path class="tree-trunk-root" d="M 400 0 L 400 30" />
  
  <!-- Nhánh rẽ trái dẫn sang Node Bài Viết -->
  <path class="tree-branch-left" id="tree-branch-articles" d="M 400 30 C 400 70, 220 50, 220 110" />
  
  <!-- Nhánh rẽ phải dẫn sang Node Ghi Nhanh -->
  <path class="tree-branch-right" id="tree-branch-notes" d="M 400 30 C 400 70, 580 50, 580 110" />
</svg>
```

### 5.3. Khả Năng Thích Ứng Trên Di Động (Mobile Responsiveness)
- Trên màn hình nhỏ (`≤ 768px`):
  - Tọa độ SVG tự động co giãn tỷ lệ (Vector Scaling).
  - Khoảng cách giữa 2 Node rẽ nhánh được thu gọn vừa vặn trong chiều rộng màn hình điện thoại (mỗi Node chiếm khoảng `140px`, đặt cân đối 2 bên mép).
  - Thanh Category 2 cụm hỗ trợ vuốt chạm cảm ứng mượt mà (Touch-friendly horizontal momentum scroll), tự động căn giữa (Scroll into view) nút đang được kích hoạt.

---

## 6. TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)

1. **Hiển Thị Đầy Đủ**: Cả bài viết dài lẫn bài viết ngắn có nhãn `@` đều được lưu trữ và truy cập thuận tiện trên trang `/p/muc-luc.html`.
2. **Không Gian Tách Bạch**: Nội dung `@` không bị lẫn lộn làm loãng cây bài viết dài; mỗi nhóm có không gian riêng biệt qua cơ chế rẽ nhánh.
3. **Thẩm Mỹ Cao Cấp**: Cây thời gian có đường nét uốn lượn uyển chuyển, hiệu ứng ánh sáng (Glow / Active transition) mượt mà, đúng chuẩn Editorial.
4. **Tương Tác 2 Chiều Chuẩn Xác**:
   - Bấm `[ ✦ Bài Viết ]` ➔ Node Bài Viết active ➔ Hiện toàn bộ bài dài.
   - Bấm `[ ⚡ Ghi Nhanh ]` ➔ Node Ghi Nhanh active ➔ Hiện toàn bộ ghi chép `@`.
   - Bấm trực tiếp vào các Node trên cây ➔ Thanh Category cập nhật tương ứng.
5. **Hiệu Năng Cao**: Hoạt động 100% bằng Vanilla JS và CSS/SVG thuần, thời gian chuyển nhánh tức thì (`< 10ms`), không gây giật lag.
6. **Tương Thích Toàn Diện**: Hỗ trợ đầy đủ Dark Mode, Song ngữ (VI | EN), và hiển thị Micro Badge minh bạch AI (`ai:generated`, `ai:assisted`, `ai:none`).
