# ĐẶC TẢ KỸ THUẬT & GIAO DIỆN: HỆ THỐNG MINH BẠCH NỘI DUNG AI (AI TRANSPARENCY SYSTEM)

> **Mã tính năng**: `FEAT-AI-TRANSPARENCY-V1`  
> **Dự án**: Blogger Editorial Theme (Blogspot XML v3)  
> **Phiên bản đặc tả**: `v1.1.0` (Cập nhật Chi tiết Hiển thị Đa Ngữ Cảnh: Bài Viết Chi Tiết, Trang Chủ, Dòng Thời Gian & Các Tiện Ích Widgets)  
> **Trạng thái**: Bản thảo thiết kế kỹ thuật hoàn chỉnh (Design Specification)  
> **Tài liệu liên quan**: [THEME_SPECIFICATION.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/THEME_SPECIFICATION.md), [TIMELINE_ARCHIVE_PAGE_SPECIFICATION.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/TIMELINE_ARCHIVE_PAGE_SPECIFICATION.md), [FLEXIBLE_SPECIAL_POSTS_WIDGET_SPECIFICATION.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/FLEXIBLE_SPECIAL_POSTS_WIDGET_SPECIFICATION.md)

---

## 1. TỔNG QUAN & NGUYÊN TẮC CỐT LÕI

### 1.1. Bối cảnh & Tầm nhìn
Trong kỷ nguyên số, trí tuệ nhân tạo (AI) đã trở thành công cụ hỗ trợ đắc lực trong quá trình sáng tạo nội dung, nghiên cứu tư liệu và phát triển ý tưởng. Tuy nhiên, ranh giới giữa việc ứng dụng AI có trách nhiệm và việc tạo nội dung tự động thiếu kiểm chứng đang là mối bận tâm lớn của cả độc giả lẫn các công cụ tìm kiếm (Google E-E-A-T).

**Tính năng AI Transparency (Hệ Thống Minh Bạch AI)** được xây dựng nhằm:
1. **Minh bạch tuyệt đối với độc giả**: Tôn trọng quyền được biết của người đọc về nguồn gốc và mức độ tham gia của AI trong từng bài viết.
2. **Củng cố uy tín tác giả (Authority & Trust)**: Khẳng định vai trò làm chủ tư duy, trải nghiệm thực tế và trách nhiệm biên tập của tác giả (Nam Trương), tạo dựng sự tin cậy lâu dài.
3. **Chuẩn hóa SEO E-E-A-T**: Tuân thủ hướng dẫn khắt khe của Google Search Central về tính minh bạch của nội dung số có sự tham gia của AI.

---

### 1.2. Phân Định Rõ Ràng 3 Nhóm Nhãn Trong Toàn Hệ Thống

Để hệ thống vận hành tự động và mạch lạc, toàn bộ nhãn trên blog được phân định thành **3 nhóm có vai trò hoàn toàn riêng biệt**:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                     BẢNG PHÂN LOẠI 3 NHÓM NHÃN (LABEL ARCHITECTURE)                             │
├──────────────────────────┬───────────────────────────────┬──────────────────────────────────────┤
│ 1. NHÃN CHỦ ĐỀ           │ 2. NHÃN TÍNH NĂNG WIDGET      │ 3. CỜ MINH BẠCH AI                   │
│    (Taxonomy / Category) │    (Special Widget Labels)    │    (System Metadata Flags)           │
├──────────────────────────┼───────────────────────────────┼──────────────────────────────────────┤
│ • Quy cách: Chữ thường   │ • Quy cách: Tiền tố "@"       │ • Quy cách: Tiền tố "ai:" (Cố định)  │
│ • Ví dụ: `Thể thao`,     │ • Ví dụ: `@Nổi bật`,          │ • Ví dụ: `ai:assisted`,              │
│   `Công nghệ`, `Sách`    │   `@Điểm tin`, `@Quote`       │   `ai:product`, `ai:generated`       │
├──────────────────────────┼───────────────────────────────┼──────────────────────────────────────┤
│ 🎯 Vai trò:              │ 🎯 Vai trò:                   │ 🎯 Vai trò:                          │
│ Phân loại bài viết chính │ Điều khiển hiển thị trên các  │ Kích hoạt Huy hiệu Minh bạch AI và   │
│ thức, làm Menu, Footer.  │ Flexible Widgets (Ranked,     │ Khung thông cáo tác quyền theo       │
│ Luôn hiện ở Trang chủ.   │ Spotlight, Quote, Digest).    │ chuẩn Google E-E-A-T.                │
├──────────────────────────┼───────────────────────────────┼──────────────────────────────────────┤
│ ⚙️ Hành vi lọc:          │ ⚙️ Hành vi lọc:               │ ⚙️ Hành vi lọc:                      │
│ Hiển thị công khai ở     │ Chỉ ẩn bài nếu 100% nhãn của  │ TỰ ĐỘNG BỊ ẨN 100% khỏi Menu,       │
│ danh mục và tag cloud.   │ bài đều là nhãn "@".          │ Footer, và Widget Danh mục thường.   │
└──────────────────────────┴───────────────────────────────┴──────────────────────────────────────┘
```

> ⚠️ **Nguyên tắc bất biến**:
> Nhãn AI là **Cờ thuộc tính hệ thống (System Metadata Flag)**, **HOÀN TOÀN KHÔNG PHẢI là chuyên mục nội dung**. Chúng được mã nguồn Theme xử lý độc lập để tạo huy hiệu và tuyệt đối không xuất hiện như một thẻ tag hay danh mục thông thường.

---

## 2. QUY CHUẨN CỜ THUỘC TÍNH AI CỐ ĐỊNH (METADATA CONVENTIONS)

Tác giả sử dụng các nhãn cố định sau khi soạn thảo bài viết trong Blogger Admin:

| Nhãn quy ước (Labels) | Phân loại | Ý nghĩa thực tế | Huy hiệu & Biểu tượng |
| :--- | :--- | :--- | :--- |
| **`ai:assisted`** *(Phổ biến nhất)* | Hỗ trợ bởi AI | Tác giả tự viết, AI hỗ trợ nghiên cứu dữ liệu, gợi ý dàn ý, tóm tắt hoặc tinh chỉnh câu chữ. Tác giả thẩm định và chịu trách nhiệm 100%. | `✨ Hỗ trợ bởi AI` *(hoặc `✨ AI`)* |
| **`ai:product`** | Sản phẩm AI | Bài viết đánh giá, trải nghiệm, hướng dẫn sử dụng một công cụ hoặc giải pháp AI cụ thể (Claude, Cursor, ChatGPT, Midjourney...). | `🤖 Sản phẩm AI` |
| **`ai:generated`** | Tạo bởi AI | Toàn bộ hoặc phần lớn nội dung do AI tổng hợp theo prompt thử nghiệm của tác giả. | `⚡ Tạo bởi AI` |

*Lưu ý về định dạng*: Hệ thống nhận diện linh hoạt không phân biệt hoa thường và hỗ trợ cả dấu gạch ngang: `ai:assisted`, `AI-Assisted`, `ai-assisted`.

---

## 3. CƠ CHẾ KỸ THUẬT & CÁCH LY HỆ THỐNG (TAXONOMY ISOLATION)

```text
                               ┌──────────────────────────────────────────────┐
                               │             BÀI VIẾT XUẤT BẢN                │
                               │ Nhãn: ["Góc Nhìn", "@Nổi bật", "ai:assisted"]│
                               └──────────────────────┬───────────────────────┘
                                                      │
                                                      ▼
                       ┌──────────────────────────────────────────────────────────────┐
                       │             BỘ LỌC TỰ ĐỘNG CỦA THEME (THEME PARSER)          │
                       └──────────────┬───────────────────────────────┬───────────────┘
                                      │                               │
       (Lọc nhãn chuyên mục thật)     ▼                               ▼   (Bóc tách cờ thuộc tính AI)
 ┌─────────────────────────────────────────────────┐ ┌────────────────────────────────────────────────┐
 │ 1. DANH MỤC & MENU THÔNG THƯỜNG                 │ │ 2. HỆ THỐNG MINH BẠCH AI                       │
 │ • Chuyên mục hiển thị: "Góc Nhìn"               │ │ • Bắt được cờ: "ai:assisted"                   │
 │ • LOẠI BỎ 100% nhãn "ai:assisted" và "@Nổi bật" │ │ • Vẽ Huy hiệu AI đa ngữ cảnh (Single, Card,    │
 │   khỏi: Header Menu, Footer links, Thẻ Tag bài  │ │   Timeline Archive, Flexible Widgets)          │
 │   viết, và Widget Danh mục ở Sidebar            │ │ • Vẽ Khung Thông Cáo Minh Bạch ở đầu bài viết  │
 └─────────────────────────────────────────────────┘ └────────────────────────────────────────────────┘
```

### 3.1. Cơ chế lọc ở tầng Blogger XML v3
Trong mọi vòng lặp render danh mục của theme (`<b:loop values='data:post.labels' var='label'>`):
```xml
<!-- Loại trừ hoàn toàn nhãn AI (bắt đầu bằng ai: hoặc AI-) và nhãn widget (bắt đầu bằng @) -->
<b:if cond='not (data:label.name startsWith "ai:" or data:label.name startsWith "AI-" or data:label.name startsWith "@")'>
  <a class='post-category-tag' expr:href='data:label.url'>
    <data:label.name/>
  </a>
</b:if>
```

### 3.2. Cơ chế nhận diện cờ AI trong JavaScript Engine (`theme.js`)
```javascript
const AI_FLAG_DEFINITIONS = {
  assisted: {
    keys: ['ai:assisted', 'ai-assisted', 'hỗ trợ bởi ai'],
    name: 'Hỗ trợ bởi AI',
    shortName: 'AI',
    icon: '✨',
    className: 'ai-assisted',
    tooltip: 'Bài viết được hỗ trợ bởi AI trong khâu nghiên cứu và dàn ý. Nam Trương trực tiếp biên tập và chịu trách nhiệm nội dung.'
  },
  product: {
    keys: ['ai:product', 'ai-product', 'sản phẩm ai'],
    name: 'Sản phẩm AI',
    shortName: 'Product',
    icon: '🤖',
    className: 'ai-product',
    tooltip: 'Bài viết đánh giá, phân tích hoặc trải nghiệm về một sản phẩm/công cụ Trí tuệ Nhân tạo.'
  },
  generated: {
    keys: ['ai:generated', 'ai-generated', 'tạo bởi ai'],
    name: 'Tạo bởi AI',
    shortName: 'Generated',
    icon: '⚡',
    className: 'ai-generated',
    tooltip: 'Nội dung được tổng hợp và tạo ra bởi mô hình AI theo thử nghiệm của tác giả.'
  }
};

function getAiFlagInfo(labels) {
  if (!labels || !labels.length) return null;
  const lowerLabels = labels.map(l => (typeof l === 'string' ? l : l.name || '').toLowerCase().trim());
  
  for (const [type, def] of Object.entries(AI_FLAG_DEFINITIONS)) {
    if (lowerLabels.some(l => def.keys.includes(l))) {
      return { type, ...def };
    }
  }
  return null;
}
```

---

## 4. ĐẶC TẢ GIAO DIỆN HIỂN THỊ ĐA NGỮ CẢNH (MULTI-SURFACE UI SPECIFICATION)

Để tránh hiện tượng giao diện bị quá tải hoặc chật chội, Huy hiệu AI được thiết kế phân cấp thành **4 biến thể thích ứng (Variants)** tùy theo vị trí xuất hiện:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CÁC BIẾN THỂ CỦA HUY HIỆU MINH BẠCH AI                                                          │
├──────────────────────────┬───────────────────────────────┬──────────────────────────────────────┤
│ 1. FULL BADGE + BOX      │ 2. STANDARD BADGE             │ 3. MICRO BADGE / INLINE TAG          │
│ Dành cho Bài Viết Đơn    │ Dành cho Post Card & Hero     │ Dành cho Dòng Thời Gian & Widgets    │
│ (Single Post Detail)     │ (Trang Chủ & Widget Tiêu Điểm)│ (Timeline Archive & Ranked Widget)   │
└──────────────────────────┴───────────────────────────────┴──────────────────────────────────────┘
```

---

### 4.1. Ngữ cảnh 1: Trang Bài Viết Chi Tiết (Single Post Detail)

Đây là nơi độc giả đọc nội dung trọn vẹn, cần độ minh bạch cao nhất. Gồm **2 thành phần**:

#### A. Huy Hiệu Đầy Đủ (Full AI Badge) ở Post Header:
Nằm ngay dưới Tiêu đề bài viết, trong hàng thông tin tác giả và ngày đăng:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [Góc Nhìn & Tư Duy]                                                                    │
│ Sự Suy Tàn Của Khả Năng Tập Trung Trong Kỷ Nguyên Số                                    │
│                                                                                        │
│ 👤 Nam Trương   📅 10/09/2026   ⏱️ 6 phút đọc   [ ✨ Hỗ trợ bởi AI ▾ ]                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
* **Styling**: Chiều cao `24px`, bo tròn pill `rounded-full`, nền gradient tím nhạt công nghệ, viền mảnh `1px solid var(--border-ai)`. Hover hiện tooltip giải thích rõ ràng.

#### B. Khung Thông Cáo Minh Bạch (AI Disclosure Callout Box):
Nằm ở đầu bài viết, ngay trước đoạn văn mở đầu:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ✦ THÔNG CÁO MINH BẠCH VỀ NỘI DUNG (AI TRANSPARENCY DISCLOSURE)                         │
│                                                                                        │
│ Bài viết này được thực hiện với sự hỗ trợ của công cụ Trí tuệ Nhân tạo (AI) trong khâu │
│ nghiên cứu tư liệu, tra cứu dữ liệu và gợi ý cấu trúc dàn ý.                           │
│                                                                                        │
│ Toàn bộ góc nhìn, trải nghiệm thực tế, văn phong và việc kiểm chứng tính chính xác của │
│ thông tin đều do Nam Trương trực tiếp thực hiện và chịu trách nhiệm.                   │
│                                                                                        │
│ ℹ️ Tìm hiểu thêm về [Tiêu chuẩn biên tập & Ứng dụng AI của Blog »]                      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
* **Styling**: Khung viền bo góc `12px`, nền `var(--bg-surface)`, điểm nhấn viền trái đậm `3.5px solid #8b5cf6` (tím công nghệ).

---

### 4.2. Ngữ cảnh 2: Thẻ Bài Viết ở Trang Chủ & Chuyên Mục (Post Card)

Hiển thị dưới dạng **Huy hiệu Chuẩn (Standard Badge)** nằm trong hàng Metadata cạnh thời gian đọc:

```text
┌────────────────────────────────────────────────────────┐
│ ┌────────────────────────────────────────────────────┐ │
│ │                COVER IMAGE (16:9)                  │ │
│ └────────────────────────────────────────────────────┘ │
│ [Góc Nhìn & Tư Duy]                                    │
│ Sự Suy Tàn Của Khả Năng Tập Trung Trong Kỷ Nguyên Số    │
│ Tóm tắt bài viết 2 dòng ngắn gọn...                    │
│                                                        │
│ 📅 08/09/2026 • ⏱️ 6 phút • [ ✨ Hỗ trợ bởi AI ]        │
└────────────────────────────────────────────────────────┘
```
* **Styling**: Kích thước vừa vặn, chiều cao `22px`, font `0.75rem`, không làm gián đoạn việc lướt xem tiêu đề bài viết.

---

### 4.3. Ngữ cảnh 3: Trang Dòng Thời Gian (Timeline Archive - `/p/muc-luc.html`)

Trang Dòng thời gian là danh sách phẳng (Flat Horizontal Rows) ưu tiên tốc độ quét mắt. Do đó, huy hiệu xuất hiện dưới dạng **Huy hiệu Mini (Micro Badge)** đặt ngay sau Tiêu đề bài viết:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CÂY DÒNG THỜI GIAN - NĂM 2026                                                          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [Góc Nhìn]   Nghịch Lý Của Việc Chọn Lựa  [ ✨ AI ]              10/09/2026  →        │
│ [Sách Hay]   Review Tư Duy Nhanh Và Chậm                         05/09/2026  →        │
│ [Công Nghệ]  Sự Trỗi Dậy Của Autonomous Agents  [ ⚡ AI ]          01/09/2026  →        │
│ [Cuộc Sống]  30 Ngày Không Dùng Điện Thoại                       28/08/2026  →        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

* **Styling của Micro Badge**:
  - Font chữ: `0.72rem`, chữ đậm nhẹ `500`.
  - Padding siêu gọn: `1px 6px`, bo tròn góc `4px` hoặc `6px`.
  - Màu sắc: Nền tím nhạt trong suốt `rgba(168, 85, 247, 0.12)`, chữ tím `var(--ai-text)`.
  - Tooltip: Hover vào hiện tooltip ngắn: *"Bài viết có sự hỗ trợ của AI"*.
  - **Trên Mobile**: Tự động co gọn chỉ còn biểu tượng `✨` hoặc `⚡` để không chiếm diện tích dòng tiêu đề.

---

### 4.4. Ngữ cảnh 4: Trong các Tiện Ích Bài Viết Đặc Biệt (Flexible Special Posts Widgets)

Tùy theo từng mẫu Pattern hiển thị của widget, Huy hiệu AI được lồng ghép tự nhiên:

#### A. Trong Pattern `ranked` (Bảng xếp hạng số to `01, 02` - Chuẩn Mockup):
Được bố trí dưới dạng **Nhãn Nano (Inline Meta Tag)** nằm ở dòng metadata cạnh ngày xuất bản:

```text
┌────────────────────────────────────────────────────────┐
│ 🔥 BÀI VIẾT NỔI BẬT                     [Xem tất cả »] │
├────────────────────────────────────────────────────────┤
│ 01  ┌───────┐  Nghịch Lý Của Việc Chọn Lựa             │
│     │ THUMB │                                          │
│     └───────┘  09/09/2026 • ✨ AI • 5 phút đọc         │
├────────────────────────────────────────────────────────┤
│ 02  ┌───────┐  30 Ngày Không Dùng Điện Thoại           │
│     │ THUMB │                                          │
│     └───────┘  05/09/2026 • 8 phút đọc                 │
└────────────────────────────────────────────────────────┘
```
* **Styling**: Text inline siêu gọn `✨ AI` đi kèm dấu chấm ngăn cách `•`, không làm tăng chiều cao của từng hàng.

#### B. Trong Pattern `spotlight` (Bài viết Tiêu điểm Hero Card):
Vì thẻ có không gian rộng rãi, sử dụng **Huy hiệu Chuẩn** ở thanh tag trên cùng:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 🌟 BÀI VIẾT TIÊU ĐIỂM                                                  │
├────────────────────────────────────────────────────────────────────────┤
│ 🏷️ PHÂN TÍCH CHUYÊN SÂU • 📅 08/09/2026 • [ ✨ Hỗ trợ bởi AI ]        │
│                                                                        │
│ Sự Suy Tàn Của Khả Năng Tập Trung Trong Kỷ Nguyên Số                    │
│ [ Đọc tiếp bài viết → ]                                                │
└────────────────────────────────────────────────────────────────────────┘
```

#### C. Trong Pattern `digest` (Bản tin vắn / Dòng thời gian mini):
Hiển thị dạng biểu tượng điểm xuyết trên dòng ngày giờ:
```text
📅 Hôm nay, 08:30 • ✨ AI
✦ Ra mắt tính năng Dòng thời gian mới...
```

#### D. Trong Pattern `quote` (Trích dẫn / Chiêm nghiệm):
Nếu câu thơ hoặc đúc kết được AI hỗ trợ tổng hợp, biểu tượng `✨ AI` được đặt tinh tế cạnh phần ghi công tác giả:
```text
“ Sự đơn giản là đỉnh cao của sự tinh tế... ”
                               — Leonardo da Vinci  [✨ AI]
```

---

## 5. HỆ THỐNG MÀU SẮC & DESIGN TOKENS (LIGHT / DARK MODE)

Huy hiệu AI sử dụng tông màu **Futuristic Purple & Cyber Cyan** mang đậm hơi thở công nghệ hiện đại nhưng được tinh chỉnh để thanh lịch, không chói gắt:

```css
:root {
  /* Chế độ Sáng (Light Mode) */
  --ai-badge-bg: linear-gradient(135deg, rgba(243, 232, 255, 0.8) 0%, rgba(224, 242, 254, 0.8) 100%);
  --ai-badge-border: rgba(192, 132, 252, 0.45);
  --ai-badge-text: #6b21a8;
  --ai-callout-border: #8b5cf6;
  --ai-micro-bg: rgba(168, 85, 247, 0.1);
  --ai-micro-text: #7c3aed;
}

[data-theme='dark'] {
  /* Chế độ Tối (Dark Mode) */
  --ai-badge-bg: linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(59, 130, 246, 0.15) 100%);
  --ai-badge-border: rgba(168, 85, 247, 0.35);
  --ai-badge-text: #d8b4fe;
  --ai-callout-border: #a855f7;
  --ai-micro-bg: rgba(168, 85, 247, 0.2);
  --ai-micro-text: #c084fc;
}

/* Các lớp tiện ích (CSS Helper Classes) */
.ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--ai-badge-bg);
  border: 1px solid var(--ai-badge-border);
  color: var(--ai-badge-text);
  font-family: var(--font-sans);
  font-weight: 600;
  border-radius: 9999px;
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;
}

.ai-badge-full {
  height: 24px;
  padding: 2px 10px;
  font-size: 0.78rem;
}

.ai-badge-standard {
  height: 22px;
  padding: 1px 8px;
  font-size: 0.74rem;
}

.ai-badge-micro {
  height: 18px;
  padding: 1px 6px;
  font-size: 0.70rem;
  background: var(--ai-micro-bg);
  border: 1px solid var(--ai-badge-border);
  color: var(--ai-micro-text);
  border-radius: 4px;
  vertical-align: middle;
}

.ai-badge-inline {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--ai-micro-text);
}
```

---

## 6. QUẢN TRỊ & TÙY BIẾN CHO TÁC GIẢ (BLOGGER ADMIN WORKFLOW)

Tác giả vận hành tính năng này hoàn toàn đơn giản:

1. **Khi viết bài**:
   - Gõ nhãn **`ai:assisted`** vào ô nhãn của Blogger nếu bài có AI hỗ trợ nghiên cứu/dàn ý.
   - Gõ nhãn **`ai:product`** nếu bài viết review công cụ AI.
   - Hệ thống tự động phân phối Huy hiệu AI đến đúng tất cả các nơi: Bài chi tiết, Thẻ bài trang chủ, Dòng thời gian và Widget.
2. **Trong Blogger Theme Designer**:
   - Tác giả có thể bật/tắt hiển thị Khung Thông Cáo Minh Bạch (Disclosure Box) ở đầu bài viết chi tiết mà không ảnh hưởng tới các Huy hiệu nhỏ.

---

## 7. BẢNG TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA MATRIX)

| Hạng mục kiểm thử | Tiêu chuẩn kỹ thuật cần đạt | Đánh giá |
| :--- | :--- | :---: |
| **Cách ly nhãn AI** | Nhãn `ai:*` tuyệt đối KHÔNG xuất hiện trong menu Header, Footer links, hay Widget chuyên mục. | [ ] |
| **Huy hiệu Bài chi tiết** | Xuất hiện Huy hiệu đầy đủ `[ ✨ Hỗ trợ bởi AI ▾ ]` ở header bài viết và Khung thông cáo ở đầu bài. | [ ] |
| **Huy hiệu Post Card** | Thẻ bài viết ở Trang chủ và Chuyên mục hiển thị Huy hiệu chuẩn trong hàng metadata. | [ ] |
| **Dòng thời gian (Timeline)** | Trên `/p/muc-luc.html`: Bài viết có nhãn AI hiển thị Micro Badge `[ ✨ AI ]` ngay sau tiêu đề. | [ ] |
| **Widget Ranked (Mockup)** | Trong widget xếp hạng bài nổi bật: Hiển thị nhãn nano `09/09/2026 • ✨ AI • 5 phút đọc`. | [ ] |
| **Widget Spotlight** | Thẻ tiêu điểm hiển thị huy hiệu chuẩn trang trọng trên hàng tag cover. | [ ] |
| **Bài viết thường** | Bài viết KHÔNG có cờ `ai:*`: Tuyệt đối không xuất hiện bất kỳ huy hiệu hay ký hiệu AI nào. | [ ] |
| **Đồng bộ Sáng / Tối** | Cả 4 biến thể huy hiệu tự động đổi màu tương thích hoàn hảo giữa Light Mode và Dark Mode. | [ ] |
| **Tooltip giải thích** | Rê chuột vào huy hiệu: Tooltip giải thích bật lên tức thì, rõ ràng, không bị tràn màn hình. | [ ] |
| **Đáp ứng di động (Mobile)** | Trên màn hình hẹp: Micro Badge trên dòng thời gian tự thu gọn chỉ còn icon `✨`, không vỡ dòng. | [ ] |
