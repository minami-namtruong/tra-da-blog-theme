# ĐẶC TẢ KỸ THUẬT & THIẾT KẾ: DÒNG THỜI GIAN ĐƯỜNG TÀU RẼ NHÁNH (SUBWAY METRO TIMELINE ARCHIVE)

> **Mã tính năng**: `FEAT-SUBWAY-TIMELINE-ARCHIVE-V5`  
> **Dự án**: Blogger Editorial Theme (Blogspot XML v3)  
> **Phiên bản đặc tả**: `v5.0.0` (Thay thế hoàn toàn bản thảo cũ `FEAT-BRANCHING-TIMELINE-V4-DRAFT`)  
> **Trạng thái**: Đặc tả thiết kế chính thức (Official Architecture & Design Specification)  
> **Đường dẫn mục tiêu**: `/p/muc-luc.html` (hoặc `/p/archive.html`, `/p/dong-thoi-gian.html`, Modal `#timeline-modal-overlay`)

---

## 1. TỔNG QUAN & TRIẾT LÝ THIẾT KẾ

### 1.1. Bối cảnh & Bài toán cần giải quyết
Trước đây, trang Dòng Thời Gian (`/p/muc-luc.html`) tuân thủ nghiêm ngặt quy tắc loại trừ: chỉ hiển thị bài viết thường (**Regular Posts**), còn toàn bộ bài viết mang nhãn tính năng độc quyền bắt đầu bằng `@` (`@Quote`, `@Điểm tin`, `@Tiêu điểm`...) đều bị ẩn.

Bản thảo v4 từng thử nghiệm chia đôi giao diện thành 2 nhánh rẽ riêng biệt (`Bài Viết` vs `Ghi Nhanh`) và chuyển đổi qua lại. Tuy nhiên, thiết kế đó gây gián đoạn trải nghiệm biên niên sử:
- **Nhu cầu thực tế của tác giả**: Tác giả muốn có **MỘT dòng thời gian duy nhất**, nơi toàn bộ các bài viết (cả bài tiểu luận dài lẫn các mẩu ghi chép, trích dẫn, điểm tin nhanh có nhãn `@`) cùng xuất hiện theo trình tự thời gian tự nhiên.
- **Yêu cầu thị giác**: Dòng thời gian phải trực quan, có **đường line thẳng và rẽ nhánh** (dạng **Timeline đường tàu / Subway Metro Line**), sử dụng màu sắc, hình thái thẻ và "thòi thụt" (indentation / visual offset) để phân biệt rạch ròi giữa bài dài và ghi chép ngắn.
- **Yêu cầu bộ lọc**: Không làm rối thanh chuyên mục dưới banner hiện tại, đồng thời cung cấp khả năng lọc nâng cao cho các nhãn tính năng `@`.

### 1.2. Định danh cốt lõi & Hình tượng "Timeline Đường Tàu" (Subway Metro Map)
Dòng thời gian được thiết kế theo hình tượng **Bản đồ tàu điện ngầm (Metro / Subway Line)** thanh lịch:
1. **Node Gốc (Origin Root Node)**:
   - Nằm trên đỉnh của dòng thời gian.
   - Mang nhãn chuẩn mực: **`[ ✦ Bài viết | Articles ]`** (hoặc tên kho lưu trữ).
2. **Đường Line Chính (Main Track / Trunk Line)**:
   - Trục đường ray thẳng đứng xuất phát từ Node Gốc chạy xuyên suốt từ trên xuống dưới.
   - Đại diện cho trục thời gian tổng thể của toàn bộ blog.
3. **Node Tròn Trạm Năm (Year Station Node)**:
   - Đặt ngay trên Line chính, đại diện cho từng mốc năm biên niên (2026, 2025, 2024...).
   - Từ mỗi Node trạm này, có một **đường nhánh ngang (Horizontal Connector)** rẽ sang nối với một **Lá Năm (Year Leaf)**.
4. **Lá Năm (Year Leaf `[ 🗓️ 2026 (Tổng số) ▾ ]`)**:
   - Thẻ mốc năm đóng vai trò là "Nhà ga năm".
   - **Tương tác**: Có khả năng click để **Đóng / Mở (Expand / Collapse)** toàn bộ Line năm tương ứng.
5. **Đường Line Năm (Year Sub-track / Branch Line)**:
   - Xuất phát từ Lá Năm và chạy dọc xuống.
   - Trên Line Năm này sẽ bố trí các **Node trạm bài viết** nối sang các **Lá Bài Viết (Post Leaves)**.
6. **Lá Bài Viết (Post Leaf Cards)**:
   - Chứa thông tin bài viết: Tiêu đề bài viết, Huy hiệu chuyên mục, Ngày tháng (DD/MM), URL, Micro-badge AI.
   - Hỗ trợ hiển thị hỗn hợp: Cả bài viết dài lẫn các mẩu ghi chép `@Quote`, `@Điểm tin`, `@Tiêu điểm` với phong cách thẻ và màu sắc đặc thù.

---

## 2. KIẾN TRÚC GIAO DIỆN & MÔ HÌNH THỜI GIAN ĐƯỜNG TÀU

### 2.1. Sơ đồ Cấu trúc Tổng thể (Visual Architecture)

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│ 1. Header & Navigation Bar                                                        │
├───────────────────────────────────────────────────────────────────────────────────┤
│ 2. Thanh Chuyên Mục Dưới Banner (Giữ nguyên như hiện tại - Topic Category Bar)   │
│    [ ✦ Tất cả (58) ]   [ Triết Lý ]   [ Sách Hay ]   [ Công Nghệ ]   [ Nhiếp Ảnh ]│
├───────────────────────────────────────────────────────────────────────────────────┤
│ 3. Ô Tìm Kiếm Tức Thì (Instant Live Search) + Nút Bộ Lọc Nâng Cao (@)             │
│    ┌───────────────────────────────────────────────────────┬────────────────────┐ │
│    │ 🔍 Nhập từ khóa tìm tên bài, chủ đề, năm...           │ [ ⚙️ Bộ lọc @ (1) ] │ │
│    └───────────────────────────────────────────────────────┴─────────┬──────────┘ │
│                                                                      │            │
│         ┌────────────────────────────────────────────────────────────▼──────────┐ │
│         │ ⚡ BỘ LỌC TÍNH NĂNG NÂNG CAO (Feature Filter Popover)                 │ │
│         │ • Định dạng:  [● Tất cả]  [📚 Bài viết dài]  [⚡ Ghi chép @]           │ │
│         │ • Nhãn @:     [ 💬 @Quote ]  [ ⚡ @Điểm Tin ]  [ 🌟 @Tiêu Điểm ]       │ │
│         │ • AI:         [ ✨ Do AI tạo ]  [ ✍️ AI hỗ trợ ]                       │ │
│         │               [ ↺ Đặt lại ]                       [ Áp dụng (5) ]     │ │
│         └───────────────────────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────────────────────────────┤
│ 4. Dòng Thời Gian Đường Tàu Rẽ Nhánh (Subway Metro Timeline Tree)                 │
│                                                                                   │
│                        ✦ [ Bài Viết | Articles ] (Root Node)                      │
│                                   │                                               │
│                         (Đường line chính)                                        │
│                                   │                                               │
│                                   ○ (Node trạm năm)                               │
│                                   │                                               │
│                                   ├───► [ 🗓️ 2026 (12 bài) ▾ ] (Lá Năm - Click)   │
│                                   │     │                                         │
│                                   │     │ (Line năm)                              │
│                                   │     │                                         │
│                                   │     ├───○──► [ Triết Lý ] Bàn về sự tĩnh lặng... (15/08) │
│                                   │     │        (Lá bài viết thường: Chuẩn phẳng)│
│                                   │     │                                         │
│                                   │     ├───○──► [ 💬 @Quote ] "Kẻ chiến thắng..." (12/08)   │
│                                   │     │        (Lá bài @: Font nghiêng, tông ấm)│
│                                   │     │                                         │
│                                   │     └───○──► [ ⚡ @Điểm Tin ] AI tuần 32 (05/08)         │
│                                   │              (Lá bài @: Viền nét đứt, icon sét)│
│                                   │                                               │
│                                   ○ (Node trạm năm)                               │
│                                   │                                               │
│                                   ├───► [ 🗓️ 2025 (28 bài) ▸ ] (Lá Năm thu gọn)    │
│                                   │                                               │
│                                   ○ (Node trạm năm)                               │
│                                   │                                               │
│                                   └───► [ 🗓️ 2024 (15 bài) ▸ ]                    │
│                                   ▼                                               │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. HỆ THỐNG BỘ LỌC ĐA TẦNG (MULTI-TIER FILTERING SYSTEM)

Hệ thống bộ lọc được phân tách rành mạch thành 2 cơ chế độc lập nhưng đồng bộ kết quả:

### 3.1. Thanh Chuyên Mục Dưới Banner (`category-tabs-bar`)
- **Vị trí**: Nằm dưới banner blog, tạo bởi Widget `Label1` (hoặc render đồng bộ).
- **Phạm vi hiển thị**: **Chỉ hiển thị các chuyên mục thường** (`Triết lý`, `Sách hay`, `Công nghệ`...). Tuyệt đối **KHÔNG** hiển thị các nhãn kỹ thuật `@`, `ai:`, `series:` tại đây để giữ trọn vẹn thẩm mỹ thanh lịch của toàn trang.
- **Vai trò**: Lọc theo **Chủ Đề (Topic Filter)**.
- **Hành vi khi click**:
  - Khi chọn một chuyên mục (VD: `Triết Lý`): Cây timeline đường tàu sẽ lọc và chỉ hiển thị các bài viết thuộc chuyên mục đó; các năm không có bài viết nào sẽ tự động ẩn đi; các số đếm trên Lá Năm tự động cập nhật lại.

### 3.2. Nút Bộ Lọc Nâng Cao Trong Ô Search (`Search Filter Popover`)
- **Vị trí**: Nằm ở phía cuối (mép phải) của ô tìm kiếm tức thì:
  ```html
  <div class="archive-search-wrap">
    <span class="archive-search-icon">🔍</span>
    <input class="archive-search-input" ... />
    <button type="button" class="archive-search-clear" ...>✕</button>
    <button type="button" class="archive-filter-trigger-btn" id="archive-filter-trigger-btn" aria-label="Mở bộ lọc nâng cao">
      <svg class="icon-filter" ...>...</svg>
      <span class="filter-badge-dot" id="archive-filter-dot" style="display:none;"></span>
    </button>
  </div>
  ```
- **Hành vi khi click vào icon filter**:
  - Mở ra một hộp thoại nổi (**Popover / Floating Modal**) ngay bên dưới thanh search.
- **Nội dung bên trong Popover**:
  1. **Nhóm 1: Hình thái bài viết (Post Format)**:
     - `[ ● Tất cả ]`: Hiển thị hỗn hợp cả bài dài và bài ghi chú `@`.
     - `[ 📚 Bài viết dài ]`: Chỉ hiển thị các bài viết thông thường (loại bỏ bài độc quyền `@`).
     - `[ ⚡ Ghi chép @ ]`: Chỉ hiển thị các bài viết mang tiền tố `@`.
  2. **Nhóm 2: Nhãn tính năng chuyên biệt (Feature `@` Labels)**:
     - Danh sách các tag pill có icon: `[ 💬 @Quote ]`, `[ ⚡ @Điểm Tin ]`, `[ 🌟 @Tiêu Điểm ]`, `[ 🖼️ @Gallery ]`, `[ 🎧 @Audio ]`...
     - Người dùng có thể click chọn 1 nhãn tính năng cụ thể để xem riêng.
  3. **Nhóm 3: Minh bạch AI (AI Transparency - nếu có bài khai báo)**:
     - `[ ✨ Do AI tạo ]` (`ai:generated`)
     - `[ ✍️ AI hỗ trợ ]` (`ai:assisted`)
  4. **Thanh công cụ chân Popover**:
     - Nút `[ ↺ Đặt lại ]`: Xóa toàn bộ bộ lọc nâng cao về mặc định.
     - Nút `[ Áp dụng (N) ]`: Đóng popover và cập nhật kết quả trên cây timeline.
- **Trạng thái Active (Active Indicator)**:
  - Khi có bất kỳ bộ lọc `@` hoặc hình thái nào đang kích hoạt, nút icon filter sẽ:
    - Đổi màu viền và nền sang tông Accent (`var(--primary)`).
    - Hiển thị chấm tròn nhỏ hoặc badge số lượng điều kiện đang lọc (VD: `• 1`).

---

## 4. CHI TIẾT THIẾT KẾ CÂY DÒNG THỜI GIAN ĐƯỜNG TÀU (SUBWAY TIMELINE TREE)

### 4.1. Node Gốc & Đường Line Chính (Main Track)
- **Node Gốc (`.subway-root-node`)**:
  - Đặt ở đỉnh giữa cây. Kiểu dáng huy hiệu nổi khối sang trọng với icon ngôi sao 4 cánh `✦`, nhãn: `Bài Viết | Articles`.
- **Đường Line chính (`.subway-main-line`)**:
  - Đoạn đường ray thẳng đứng: `width: 3px`, `background: var(--border-color)`.
  - Nằm ở lề trái (cách lề trái `24px` trên mobile, `32px` trên desktop).
- **Node Trạm Năm (`.subway-station-node`)**:
  - Vòng tròn đồng tâm đường kính `16px`, viền `3px solid var(--primary)`, nền `var(--bg-card)`.
  - Khi hover: Vòng tròn phóng to nhẹ `scale(1.25)` và tỏa sáng nhẹ (`box-shadow: 0 0 10px rgba(var(--primary-rgb), 0.4)`).
- **Đường Nhánh Ngang Nối Sang Lá Năm (`.subway-branch-connector`)**:
  - Đoạn kẻ ngang từ Node trạm sang Lá Năm: `width: 28px`, `height: 2px`, `background: var(--border-color)`.

### 4.2. Lá Năm (Year Leaf) & Cơ Chế Expand / Collapse
- **Khung Lá Năm (`.subway-year-leaf`)**:
  - Là nút bấm tương tác (Button / Interactive Card) bo góc `8px`, nền `var(--bg-card)`, viền tóc `var(--border-color)`.
  - Chứa: Icon lịch `🗓️`, số năm `2026`, huy hiệu số lượng bài `(12 bài)`, mũi tên trạng thái `▾` / `▸`.
- **Hành vi Expand / Collapse**:
  - **Mặc định khi tải trang**: Năm gần nhất (năm mới nhất) tự động mở (**Expanded**); các năm cũ hơn tự động thu gọn (**Collapsed**) để trang không bị quá dài.
  - Khi click vào Lá Năm: Chuyển đổi trạng thái giữa `is-expanded` và `is-collapsed` với hiệu ứng trượt mượt mà (`max-height` và `opacity transition`).

### 4.3. Đường Line Năm (Year Sub-track) & Các Lá Bài Viết (Post Leaves)
- **Đường Line Năm (`.subway-year-line`)**:
  - Chạy dọc xuống từ đáy của Lá Năm: `width: 2px`, `border-left: 2px dashed var(--border-color)`.
  - Thụt lề vào trong so với Line chính (`margin-left: 14px`).
- **Node Trạm Bài Viết (`.subway-post-node`)**:
  - Chấm tròn nhỏ `8px` nằm ngay trên Line Năm, nối với Lá bài viết bằng một gạch ngang nhỏ `12px`.
- **Lá Bài Viết (Post Leaf Card)**:
  
#### A. Thẻ Bài Viết Thường (Regular Post Leaf):
- **Cấu trúc**: Thẻ phẳng 1 dòng sang trọng chuẩn xuất bản.
- **Thành phần**:
  1. Huy hiệu chủ đề: `[ Triết Lý ]` (Màu sắc theo token chuẩn).
  2. Tiêu đề bài viết: Rõ ràng, in đậm vừa phải, đổi màu khi hover.
  3. Micro-badge AI (nếu có): `[ ✨ AI ]`.
  4. Ngày đăng: `📅 15/08`.
  5. Mũi tên chuyển tiếp: `→`.

#### B. Thẻ Bài Viết Tính Năng `@` (Feature `@` Post Leaf):
- **Đặc điểm chung**: Được thụt lề nhẹ và mang phong cách nhận diện riêng:
  - **Với `@Quote` (Trích dẫn)**:
    - Nền thẻ ngả tông giấy ngà ấm (`background: rgba(var(--primary-rgb), 0.04)`), viền tóc mềm.
    - Font chữ Serif in nghiêng (Italic), hiển thị trích dẫn trong dấu ngoặc `“...”`.
    - Badge: `[ 💬 @Quote ]`.
  - **Với `@Điểm tin` (Bản tin vắn)**:
    - Viền nét đứt (`border: 1px dashed var(--border-color)`), icon tia sét `⚡`.
    - Tiêu đề tin vắn súc tích, hiển thị badge: `[ ⚡ @Điểm Tin ]`.
  - **Với `@Tiêu điểm` (Nổi bật)**:
    - Viền màu hổ phách/ánh kim sáng nhẹ, badge sao: `[ 🌟 @Tiêu Điểm ]`.

---

## 5. CƠ CHẾ KỸ THUẬT & LUỒNG DỮ LIỆU (DATA PIPELINE)

### 5.1. Thu Thập & Phân Loại Dữ Liệu
Chỉ sử dụng **1 lần nạp API duy nhất** từ Blogger JSON Feed (`500` bài):
```http
GET /feeds/posts/summary?alt=json&max-results=500
```

Thuật toán phân loại đối tượng bài viết trong `src/scripts/archive-page.js`:
```javascript
function parseEntry(entry) {
  var rawLabels = (entry.category || []).map(function(c) { return (c.term || '').trim(); }).filter(Boolean);
  
  var normalLabels = [];
  var featureLabels = [];
  var aiType = null;
  var seriesName = null;

  rawLabels.forEach(function(lbl) {
    var lower = lbl.toLowerCase();
    if (lbl.startsWith('@')) {
      featureLabels.push(lbl);
    } else if (lower.startsWith('ai:') || lower.startsWith('ai-')) {
      if (!aiType) aiType = lower.replace(/-/g, ':');
    } else if (lower.startsWith('series:')) {
      if (!seriesName) seriesName = lbl.replace(/^series:\s*/i, '').trim();
    } else {
      normalLabels.push(lbl);
    }
  });

  var isFeatureOnly = rawLabels.length > 0 && normalLabels.length === 0 && !seriesName && featureLabels.length > 0;
  var postType = isFeatureOnly ? 'feature' : 'regular';
  var primaryCategory = normalLabels.length > 0 ? normalLabels[0] : (seriesName || (featureLabels.length > 0 ? featureLabels[0] : 'Chưa phân loại'));

  return {
    title: entry.title ? entry.title.$t : 'Bài viết không có tiêu đề',
    url: extractAlternateLink(entry),
    published: entry.published ? entry.published.$t : '',
    year: getYear(entry.published),
    dateStr: formatDate(entry.published),
    timestamp: new Date(entry.published).getTime(),
    category: primaryCategory,
    normalLabels: normalLabels,
    featureLabels: featureLabels,
    postType: postType, // 'regular' | 'feature'
    aiType: aiType,
    seriesName: seriesName
  };
}
```

### 5.2. Quản Lý Trạng Thái Lọc Hợp Nhất (State Management)
Trạng thái lọc được kết hợp từ 4 nguồn điều kiện:
```javascript
var filterState = {
  searchQuery: '',        // Từ ô input search
  bannerCategory: 'all',  // Từ thanh tabs dưới banner
  featureFilter: 'all',   // 'all' | '@Quote' | '@Điểm tin' | ... (từ Popover)
  formatType: 'all',      // 'all' | 'regular' | 'feature' (từ Popover)
  aiFilter: 'all'         // 'all' | 'ai:generated' | 'ai:assisted'
};
```

**Quy tắc lọc (Filter Pipeline)**:
Một bài viết chỉ được hiển thị nếu thỏa mãn đồng thời:
1. **Search Query**: Tiêu đề hoặc nhãn khớp với từ khóa tìm kiếm (hỗ trợ tiếng Việt có dấu và không dấu).
2. **Banner Category**: 
   - Nếu `bannerCategory === 'all'`: Chấp nhận tất cả bài viết.
   - Nếu `bannerCategory !== 'all'`: Chỉ chấp nhận bài viết có `normalLabels` chứa chuyên mục này.
3. **Format Type**: Khớp với `regular` hoặc `feature` (nếu người dùng có chọn lọc dạng bài trong Popover).
4. **Feature Filter**: Khớp với nhãn `@` được chọn (nếu có).

### 5.3. Đồng Bộ Hóa URL Parameters
Hỗ trợ chia sẻ liên kết trực tiếp tới trạng thái bộ lọc:
- `?q=tu-khoa`: Tìm kiếm từ khóa.
- `?cat=triet-ly`: Lọc chuyên mục từ banner.
- `?feature=quote`: Lọc nhãn `@Quote`.
- `?type=notes`: Lọc dạng bài ghi chép.
- `?year=2026`: Tự động mở rộng năm 2026.

---

## 6. THÍCH ỨNG DI ĐỘNG & DARK MODE (RESPONSIVENESS & THEME)

1. **Trên Màn Hình Di Động (`≤ 768px`)**:
   - Khoảng cách Line chính lùi sát lề trái (`20px`), chừa trọn vẹn không gian cho Lá Năm và Lá Bài Viết.
   - Thẻ bài viết tự động xuống dòng mềm mại nếu tiêu đề dài.
   - Popover bộ lọc tự động chuyển thành **Bottom Sheet** (trượt từ cạnh dưới màn hình lên) để dễ thao tác bằng một tay.
2. **Hỗ Trợ Dark Mode**:
   - Sử dụng 100% biến CSS Design Tokens chuẩn của theme (`var(--bg-card)`, `var(--border-color)`, `var(--primary)`, `var(--text-main)`, `var(--text-muted)`).
   - Đảm bảo độ tương phản cao, các đường ray và node phát sáng tinh tế trong giao diện tối.

---

## 7. TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)

1. **Hiển Thị Cả Hai Loại Bài**: Toàn bộ bài viết dài và bài viết mang nhãn tính năng `@` đều cùng xuất hiện trên một dòng thời gian duy nhất theo trình tự biên niên.
2. **Hình Tượng Đường Tàu Chuẩn Mực**: Cây dòng thời gian có Line chính từ Root `Bài viết | Articles`, các Node trạm năm nối sang Lá Năm, và từ Lá Năm chạy ra Line năm chứa các Lá bài viết.
3. **Đóng/Mở Mượt Mà (Accordion)**: Lá Năm click được để thu gọn / mở rộng các bài viết của năm đó.
4. **Phân Biệt Thẻ Trực Quan**: Bài viết thường hiển thị phẳng editorial; bài `@Quote` hiển thị font nghiêng tông ấm; bài `@Điểm tin` có viền nét đứt và icon tia sét.
5. **Filter Dưới Banner Hoạt Động Ổn Định**: Thanh tabs dưới banner chỉ hiển thị nhãn thường và lọc cây timeline bình thường mà không gây xung đột hay chuyển trang ngoài ý muốn.
6. **Icon Filter Trong Ô Search & Popover**:
   - Nút icon filter nằm gọn trong ô search.
   - Bấm mở Popover cho phép lọc riêng các nhãn `@`, định dạng bài và nhãn AI.
   - Có chỉ báo (Active Dot / Accent Color) khi đang áp dụng bộ lọc nâng cao.
7. **Hiệu Năng & Tương Thích**: Chạy mượt mà bằng Vanilla JS + CSS thuần, hỗ trợ tiếng Việt có dấu/không dấu, Dark Mode và Responsive hoàn hảo.
