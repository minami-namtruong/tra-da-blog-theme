# ĐẶC TẢ KỸ THUẬT & GIAO DIỆN: HỆ THỐNG MINH BẠCH NỘI DUNG AI (AI TRANSPARENCY SYSTEM)

> **Mã tính năng**: `FEAT-AI-TRANSPARENCY-V1`  
> **Dự án**: Blogger Editorial Theme (Blogspot XML v3)  
> **Phiên bản đặc tả**: `v1.2.0` (Cập nhật Kiến trúc Phối Hợp Nhãn Đa Tầng: Song Ngữ `VI | EN`, Nhãn Tính Năng `@`, Cờ Thuộc Tính `ai:` & Xử Lý Triệt Để Xung Đột)  
> **Trạng thái**: Bản thảo thiết kế kỹ thuật hoàn chỉnh (Design Specification)  
> **Tài liệu liên quan**: [THEME_SPECIFICATION.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/THEME_SPECIFICATION.md), [BILINGUAL_VI_EN_SYSTEM_SPECIFICATION.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/BILINGUAL_VI_EN_SYSTEM_SPECIFICATION.md), [TIMELINE_ARCHIVE_PAGE_SPECIFICATION.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/TIMELINE_ARCHIVE_PAGE_SPECIFICATION.md), [FLEXIBLE_SPECIAL_POSTS_WIDGET_SPECIFICATION.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/FLEXIBLE_SPECIAL_POSTS_WIDGET_SPECIFICATION.md)

---

## 1. TỔNG QUAN & NGUYÊN TẮC CỐT LÕI

### 1.1. Bối cảnh & Tầm nhìn
Trong kỷ nguyên số, trí tuệ nhân tạo (AI) đã trở thành công cụ hỗ trợ đắc lực trong quá trình sáng tạo nội dung, nghiên cứu tư liệu và phát triển ý tưởng. Tuy nhiên, ranh giới giữa việc ứng dụng AI có trách nhiệm và việc tạo nội dung tự động thiếu kiểm chứng đang là mối bận tâm lớn của cả độc giả lẫn các công cụ tìm kiếm (Google E-E-A-T).

**Tính năng AI Transparency (Hệ Thống Minh Bạch AI)** được xây dựng nhằm:
1. **Minh bạch tuyệt đối với độc giả**: Tôn trọng quyền được biết của người đọc về nguồn gốc và mức độ tham gia của AI trong từng bài viết.
2. **Củng cố uy tín tác giả (Authority & Trust)**: Khẳng định vai trò làm chủ tư duy, trải nghiệm thực tế và trách nhiệm biên tập của tác giả (Nam Trương), tạo dựng sự tin cậy lâu dài.
3. **Chuẩn hóa SEO E-E-A-T**: Tuân thủ hướng dẫn khắt khe của Google Search Central về tính minh bạch của nội dung số có sự tham gia của AI.

---

### 1.2. Kiến Trúc 4 Nhóm Nhãn Khi Kết Hợp Trên Cùng Một Bài Viết

Trên blog cá nhân, một bài viết có thể được tác giả gắn đồng thời nhiều loại nhãn để phục vụ các mục đích khác nhau. Hệ thống phân chia toàn bộ nhãn thành **4 nhóm độc lập**:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   HỆ THỐNG 4 NHÓM NHÃN TRÊN BLOG (UNIFIED LABEL ARCHITECTURE)                    │
├──────────────────────────┬───────────────────────────────┬──────────────────────┬───────────────┤
│ 1. NHÃN THƯỜNG ĐƠN NGỮ   │ 2. NHÃN THƯỜNG SONG NGỮ       │ 3. NHÃN TÍNH NĂNG    │ 4. CỜ THUỘC   │
│    (Regular Monolingual) │    (Localized Regular)        │    WIDGET (Feature)  │    TÍNH AI    │
├──────────────────────────┼───────────────────────────────┼──────────────────────┼───────────────┤
│ • Không có ký tự đặc biệt│ • Chứa ký tự phân cách "|"    │ • Tiền tố "@"        │ • Tiền tố     │
│ • Ví dụ: `Thể thao`,     │ • Ví dụ: `Góc Nhìn |          │ • Ví dụ: `@Nổi bật`, │   "ai:"       │
│   `Công nghệ`            │   Perspectives`               │   `@Điểm tin`        │ • `ai:assisted│
├──────────────────────────┼───────────────────────────────┼──────────────────────┼───────────────┤
│ 🎯 Mục đích:             │ 🎯 Mục đích:                  │ 🎯 Mục đích:         │ 🎯 Mục đích:  │
│ Phân loại chuyên mục     │ Phân loại chuyên mục hiển thị │ Gom bài vào các      │ Kích hoạt huy │
│ bài viết chính thức.     │ song ngữ theo nút gạt VI/EN.  │ Flexible Widgets.    │ hiệu minh bạch│
├──────────────────────────┼───────────────────────────────┼──────────────────────┼───────────────┤
│ ⚙️ Hành vi xuất hiện:    │ ⚙️ Hành vi xuất hiện:         │ ⚙️ Hành vi xuất hiện:│ ⚙️ Hành vi:   │
│ Hiển thị ở Menu, Tab chủ │ Hiển thị ở Menu, Tab, Badge;  │ ẨN KHỎI CHUYÊN MỤC,  │ ẨN 100% KHỎI  │
│ đề, Badge thẻ bài.       │ tự động cắt chữ theo VI / EN. │ chỉ phục vụ Widget.  │ CHUYÊN MỤC.   │
└──────────────────────────┴───────────────────────────────┴──────────────────────┴───────────────┘
```

---

## 2. QUY CHUẨN CỜ THUỘC TÍNH AI & HỖ TRỢ SONG NGỮ (METADATA CONVENTIONS)

Các cờ AI là **nhãn hệ thống cố định**. Chúng tự động hỗ trợ chuyển ngữ song ngữ khi độc giả bấm chuyển `[ 🇻🇳 VI | 🇬🇧 EN ]`:

| Cờ thuộc tính (Label) | Ý nghĩa thực tế | Hiển thị chế độ `VI` | Hiển thị chế độ `EN` | Biểu tượng |
| :--- | :--- | :--- | :--- | :---: |
| **`ai:assisted`** *(Phổ biến nhất)* | Tác giả tự viết, AI hỗ trợ nghiên cứu tài liệu, gợi ý dàn ý hoặc tinh chỉnh câu chữ. Tác giả chịu trách nhiệm 100%. | **Hỗ trợ bởi AI** *(hoặc `AI`)* | **AI-Assisted** *(hoặc `AI`)* | `✨` |
| **`ai:product`** | Bài viết đánh giá, trải nghiệm, review công cụ/sản phẩm AI (Claude, Cursor, ChatGPT, Midjourney...). | **Sản phẩm AI** | **AI Product** | `🤖` |
| **`ai:generated`** | Toàn bộ hoặc phần lớn nội dung do AI tổng hợp theo prompt thử nghiệm công nghệ của tác giả. | **Tạo bởi AI** | **AI-Generated** | `⚡` |

*Lưu ý về định dạng nhận diện*: Hệ thống chấp nhận không phân biệt hoa thường và hỗ trợ cả dấu gạch ngang: `ai:assisted`, `AI-Assisted`, `ai-assisted`.

---

## 3. MA TRẬN PHỐI HỢP & QUY TẮC XỬ LÝ XUNG ĐỘT NHÃN (MULTI-LABEL MATRIX)

### 3.1. Tình huống kết hợp thực tế
Giả sử tác giả xuất bản một bài viết tâm huyết và điền vào ô Labels của Blogger:  
`Labels: Góc Nhìn & Tư Duy | Perspectives, @Nổi bật, ai:assisted`

Dưới đây là ma trận phân luồng hiển thị chuẩn mực của từng nhãn trên toàn bộ hệ thống:

```text
                               ┌──────────────────────────────────────────────────────────────┐
                               │                      BÀI VIẾT XUẤT BẢN                       │
                               │  Nhãn: ["Góc Nhìn | Perspectives", "@Nổi bật", "ai:assisted"]│
                               └──────────────────────────────┬───────────────────────────────┘
                                                              │
                                                              ▼
                               ┌──────────────────────────────────────────────────────────────┐
                               │          BỘ ĐIỀU PHỐI TRUNG TÂM (UNIFIED LABEL PARSER)       │
                               └──────────────┬────────────────┬────────────────┬─────────────┘
                                              │                │                │
            ┌─────────────────────────────────┘                │                └─────────────────────────────────┐
            ▼                                                  ▼                                                  ▼
┌───────────────────────────────┐              ┌───────────────────────────────┐              ┌───────────────────────────────┐
│ 1. NHÃN CHUYÊN MỤC THẬT       │              │ 2. NHÃN TÍNH NĂNG WIDGET      │              │ 3. CỜ MINH BẠCH AI            │
│ "Góc Nhìn | Perspectives"     │              │ "@Nổi bật"                    │              │ "ai:assisted"                 │
├───────────────────────────────┤              ├───────────────────────────────┤              ├───────────────────────────────┤
│ • Được chọn làm chuyên mục    │              │ • Dùng để đưa bài vào Widget  │              │ • Kích hoạt Huy hiệu AI đa    │
│   chính thức của bài viết.    │              │   Ranked (Top nổi bật 01, 02).│   ngữ cảnh (Single, Card,     │
│ • VI: Hiện "Góc Nhìn"         │              │ • BỊ LOẠI TRỪ 100% KHỎI:      │   Timeline, Widgets).         │
│ • EN: Hiện "Perspectives"     │              │   - Tab chủ đề dưới Banner    │ • Kích hoạt Khung Thông Cáo   │
│ • TUYỆT ĐỐI KHÔNG để lộ ký    │              │   - Badge thẻ bài (post-badge)│   Minh Bạch ở đầu bài viết.   │
│   tự "|" ra giao diện ngoài.  │              │   - Đường dẫn Breadcrumbs     │ • BỊ LOẠI TRỪ 100% KHỎI mọi   │
│                               │              │   - Thẻ danh mục trên Timeline│   menu, tab và thẻ danh mục.  │
└───────────────────────────────┘              └───────────────────────────────┘              └───────────────────────────────┘
```

---

### 3.2. Bảng quy tắc xử lý xung đột nhãn (Conflict Resolution Rules)

| Tình huống kết hợp | Xử lý Chuyên mục chính (`post-badge`, `breadcrumbs`, `tabs`) | Xử lý Widget | Xử lý Minh bạch AI |
| :--- | :--- | :--- | :--- |
| **`[Góc Nhìn \| Perspectives, @Nổi bật]`** | Chuyên mục là `Góc Nhìn` (VI) hoặc `Perspectives` (EN). **Bỏ qua `@Nổi bật`**. | Bài viết xuất hiện trong Widget `@Nổi bật`. | Không kích hoạt cờ AI. |
| **`[Công Nghệ, ai:assisted]`** | Chuyên mục là `Công Nghệ`. **Bỏ qua `ai:assisted`**. | Không có widget đặc biệt. | Kích hoạt Huy hiệu `✨ Hỗ trợ bởi AI`. |
| **`[Sách \| Books, @Tiêu điểm, ai:assisted]`** | Chuyên mục là `Sách` (VI) hoặc `Books` (EN). **Bỏ qua `@Tiêu điểm` và `ai:assisted`**. | Xuất hiện trong Widget `@Tiêu điểm`. | Kích hoạt Huy hiệu `✨ Hỗ trợ bởi AI`. |
| **`[@Điểm tin]`** *(Thuần nhãn `@`)* | **Ẩn 100% khỏi Trang chủ & Timeline**. Không có thẻ chuyên mục. | Xuất hiện trong Widget `@Điểm tin`. | Không có cờ AI. |

---

## 4. CƠ CHẾ KỸ THUẬT: CÁCH LY CHUYÊN MỤC & CHUYỂN NGỮ SONG NGỮ

Để khắc phục triệt để các lỗi rò rỉ nhãn `@` và ký tự `|` trong mã nguồn, hệ thống áp dụng cơ chế 2 tầng:

### 4.1. Tầng Blogger XML v3 (`scripts/build.js`)

#### A. Thanh Tab Chủ Đề Dưới Banner (`category-tabs-bar` / Widget `Label1`):
Chỉ lặp qua các nhãn **không bắt đầu bằng `@`** và **không bắt đầu bằng `ai:`**, đồng thời gắn cờ `data-bilingual="true"`:

```xml
<b:loop values='data:labels' var='label'>
  <!-- LOẠI TRỪ HOÀN TOÀN nhãn widget (@) và nhãn AI (ai:) -->
  <b:if cond='not (data:label.name startsWith "@" or data:label.name startsWith "ai:" or data:label.name startsWith "AI-")'>
    <a class='tab-pill' expr:href='data:label.url' data-bilingual='true'>
      <data:label.name/>
    </a>
  </b:if>
</b:loop>
```

#### B. Huy Hiệu Thẻ Bài (`post-badge`) & Đường Dẫn Phân Cấp (`breadcrumbs`):
Tuyệt đối không dùng `data:post.labels.first` (vì `@` đứng trước chữ cái trong bảng ASCII sẽ cướp mất vị trí). Thay vào đó, **lọc lấy danh sách nhãn thường trước**:

```xml
<!-- Lọc danh sách nhãn thường hợp lệ (loại trừ @ và ai:) -->
<b:with value='data:post.labels filter (l =&gt; not (l.name startsWith "@" or l.name startsWith "ai:" or l.name startsWith "AI-"))' var='normalLabels'>
  <b:if cond='data:normalLabels.notEmpty'>
    <!-- Lấy nhãn thường đầu tiên làm chuyên mục đại diện -->
    <a class='post-badge' expr:href='data:normalLabels.first.url' data-bilingual='true'>
      <data:normalLabels.first.name/>
    </a>
  </b:if>
</b:with>
```

---

### 4.2. Tầng JavaScript: Xử lý Song Ngữ & Phân Giải Nhãn Hợp Nhất

#### A. Mở rộng bộ chọn trong `src/scripts/bilingual.js`:
Bộ chọn chuyển ngữ song ngữ tự động bao gồm toàn bộ các thành phần nhãn:

```javascript
function applyBilingualElements(lang) {
  // Bổ sung các class nhãn chuyên mục vào danh sách xử lý VI | EN
  const targets = document.querySelectorAll(
    '[data-bilingual="true"], .post-badge, .tab-pill, .archive-post-cat-pill'
  );

  targets.forEach(el => {
    if (el.dataset.rawText === undefined) {
      el.dataset.rawText = el.textContent.trim();
    }

    const raw = el.dataset.rawText;
    if (raw.includes('|')) {
      const parts = raw.split('|').map(s => s.trim());
      el.textContent = (lang === 'en' ? parts[1] : parts[0]) || parts[0];
    }
  });
}
```

#### B. Hàm Chuẩn Hóa Nhãn Trong `archive-page.js` & `special-posts.js`:
Mọi script khi lấy nhãn đại diện từ Blogger Feed đều dùng chung một logic chuẩn hóa:

```javascript
/**
 * Trích xuất nhãn chuyên mục sạch:
 * 1. Bỏ qua các nhãn tính năng (@)
 * 2. Bỏ qua các nhãn thuộc tính AI (ai:)
 * 3. Tách chuỗi song ngữ "VI | EN" theo ngôn ngữ đang chọn
 */
function extractCleanCategory(labels, currentLang = 'vi') {
  if (!labels || !labels.length) return 'Góc Nhìn';
  
  // 1. Lọc nhãn thường hợp lệ
  const normalLabels = labels.filter(label => {
    const l = (typeof label === 'string' ? label : label.name || '').trim();
    return !l.startsWith('@') && !l.toLowerCase().startsWith('ai:');
  });

  if (!normalLabels.length) return 'Góc Nhìn';

  const rawCat = typeof normalLabels[0] === 'string' ? normalLabels[0] : normalLabels[0].name;

  // 2. Xử lý cú pháp song ngữ "VI | EN"
  if (rawCat.includes('|')) {
    const parts = rawCat.split('|').map(s => s.trim());
    return (currentLang === 'en' ? parts[1] : parts[0]) || parts[0];
  }

  return rawCat.trim();
}
```

---

## 5. ĐẶC TẢ GIAO DIỆN HIỂN THỊ ĐA NGỮ CẢNH (MULTI-SURFACE UI SPECIFICATION)

Huy hiệu AI được hiển thị phân cấp thành **4 biến thể thích ứng (Variants)** tương thích hoàn hảo giữa `VI` và `EN`:

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

### 5.1. Ngữ cảnh 1: Trang Bài Viết Chi Tiết (Single Post Detail)

Gồm 2 thành phần chính, tự động dịch câu chữ theo công tắc `VI | EN`:

#### A. Huy Hiệu Đầy Đủ (Full AI Badge) ở Post Header:
Nằm ngay dưới tiêu đề bài viết:
* **Chế độ VI**: `👤 Nam Trương   📅 10/09/2026   ⏱️ 6 phút đọc   [ ✨ Hỗ trợ bởi AI ▾ ]`
* **Chế độ EN**: `👤 Nam Truong   📅 10/09/2026   ⏱️ 6 min read   [ ✨ AI-Assisted ▾ ]`

#### B. Khung Thông Cáo Minh Bạch (AI Disclosure Callout Box):
Nằm ở đầu bài viết, phía trên đoạn mở đầu:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ✦ THÔNG CÁO MINH BẠCH VỀ NỘI DUNG (AI TRANSPARENCY DISCLOSURE)                         │
│                                                                                        │
│ [Bản tiếng Việt khi chọn VI]:                                                          │
│ Bài viết này được thực hiện với sự hỗ trợ của công cụ Trí tuệ Nhân tạo (AI) trong khâu │
│ nghiên cứu tư liệu, tra cứu dữ liệu và gợi ý cấu trúc dàn ý.                           │
│ Toàn bộ góc nhìn, trải nghiệm thực tế, văn phong và việc kiểm chứng tính chính xác của │
│ thông tin đều do Nam Trương trực tiếp thực hiện và chịu trách nhiệm.                   │
│                                                                                        │
│ [Bản tiếng Anh khi chọn EN]:                                                           │
│ This article was researched and outlined with the assistance of Artificial             │
│ Intelligence (AI) tools. All viewpoints, personal insights, narrative voice, and      │
│ rigorous fact-checking are conducted and owned entirely by Nam Truong.                 │
│                                                                                        │
│ ℹ️ [Tìm hiểu thêm / Learn more about our AI Policy »]                                  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 5.2. Ngữ cảnh 2: Thẻ Bài Viết ở Trang Chủ & Chuyên Mục (Post Card)

Hiển thị dưới dạng **Huy hiệu Chuẩn (Standard Badge)** nằm trong hàng Metadata:
* **Chế độ VI**: `📅 08/09/2026 • ⏱️ 6 phút • [ ✨ Hỗ trợ bởi AI ]`
* **Chế độ EN**: `📅 08/09/2026 • ⏱️ 6 min • [ ✨ AI-Assisted ]`

---

### 5.3. Ngữ cảnh 3: Trang Dòng Thời Gian (Timeline Archive - `/p/muc-luc.html`)

Hiển thị dưới dạng **Huy hiệu Mini (Micro Badge)** đặt ngay sau tiêu đề trên thanh bài viết phẳng:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CÂY DÒNG THỜI GIAN - NĂM 2026                                                          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [Góc Nhìn]   Nghịch Lý Của Việc Chọn Lựa  [ ✨ AI ]              10/09/2026  →        │
│ [Sách Hay]   Review Tư Duy Nhanh Và Chậm                         05/09/2026  →        │
│ [Công Nghệ]  Sự Trỗi Dậy Của Autonomous Agents  [ ⚡ AI ]          01/09/2026  →        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
* Trên thiết bị di động (Mobile): Micro Badge tự co gọn chỉ còn biểu tượng `✨` hoặc `⚡` có tooltip khi chạm vào, bảo đảm tiêu đề bài viết không bị tràn dòng.

---

### 5.4. Ngữ cảnh 4: Trong các Tiện Ích Bài Viết Đặc Biệt (Flexible Widgets)

* **Pattern `ranked` (Bảng xếp hạng 01, 02)**: Nhãn nano inline ở dòng metadata:  
  `01  [Thumb]  Nghịch Lý Của Việc Chọn Lựa`  
  `             09/09/2026 • ✨ AI • 5 phút đọc`
* **Pattern `spotlight` (Bài viết Tiêu điểm Hero Card)**: Huy hiệu chuẩn trên hàng tag cover:  
  `🏷️ PHÂN TÍCH CHUYÊN SÂU • 📅 08/09/2026 • [ ✨ Hỗ trợ bởi AI ]`
* **Pattern `digest` (Bản tin vắn)**: Điểm xuyết inline: `📅 Hôm nay, 08:30 • ✨ AI`.

---

## 6. HỆ THỐNG MÀU SẮC & DESIGN TOKENS (LIGHT / DARK MODE)

```css
:root {
  /* Chế độ Sáng (Light Mode) */
  --ai-badge-bg: linear-gradient(135deg, rgba(243, 232, 255, 0.85) 0%, rgba(224, 242, 254, 0.85) 100%);
  --ai-badge-border: rgba(192, 132, 252, 0.45);
  --ai-badge-text: #6b21a8;
  --ai-callout-border: #8b5cf6;
  --ai-micro-bg: rgba(168, 85, 247, 0.12);
  --ai-micro-text: #7c3aed;
}

[data-theme='dark'] {
  /* Chế độ Tối (Dark Mode) */
  --ai-badge-bg: linear-gradient(135deg, rgba(147, 51, 234, 0.22) 0%, rgba(59, 130, 246, 0.18) 100%);
  --ai-badge-border: rgba(168, 85, 247, 0.4);
  --ai-badge-text: #d8b4fe;
  --ai-callout-border: #a855f7;
  --ai-micro-bg: rgba(168, 85, 247, 0.22);
  --ai-micro-text: #c084fc;
}

/* Các lớp CSS tiện ích */
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

.ai-badge-full     { height: 24px; padding: 2px 10px; font-size: 0.78rem; }
.ai-badge-standard { height: 22px; padding: 1px 8px;  font-size: 0.74rem; }
.ai-badge-micro    { height: 18px; padding: 1px 6px;  font-size: 0.70rem; border-radius: 4px; }
.ai-badge-inline   { display: inline-flex; align-items: center; gap: 0.2rem; font-size: 0.72rem; font-weight: 600; color: var(--ai-micro-text); }
```

---

## 7. BẢNG TIÊU CHÍ NGHIỆM THU TỔNG HỢP (ACCEPTANCE CRITERIA)

| Hạng mục kiểm thử | Tiêu chuẩn kỹ thuật nghiệm thu bắt buộc | Đánh giá |
| :--- | :--- | :---: |
| **Xử lý nhãn song ngữ** | Nhãn `Góc Nhìn \| Perspectives`: Chế độ VI hiện `Góc Nhìn`, chế độ EN hiện `Perspectives`. Tuyệt đối không lộ ký tự `\|`. | [ ] |
| **Cách ly nhãn `@`** | Nhãn `@Nổi bật` KHÔNG xuất hiện trên Tab chủ đề, Breadcrumbs, Badge thẻ bài hay Chuyên mục Timeline. | [ ] |
| **Cách ly cờ `ai:`** | Nhãn `ai:assisted` KHÔNG xuất hiện như một thẻ tag hay danh mục ở bất kỳ menu nào. | [ ] |
| **Xử lý `labels.first`** | Bài viết gắn `[@Nổi bật, Góc Nhìn \| Perspectives]`: Thẻ bài viết hiển thị chính xác chuyên mục `Góc Nhìn`, KHÔNG bị gán nhãn `@Nổi bật`. | [ ] |
| **Huy hiệu Bài chi tiết** | Xuất hiện Full Badge `[ ✨ Hỗ trợ bởi AI ]` và Khung thông cáo minh bạch ở đầu bài viết. | [ ] |
| **Huy hiệu Dòng thời gian** | Trên `/p/muc-luc.html`: Bài viết có nhãn AI hiển thị Micro Badge `[ ✨ AI ]` sau tiêu đề. | [ ] |
| **Huy hiệu Widget Ranked** | Trong widget xếp hạng bài nổi bật: Hiển thị nhãn nano inline `09/09/2026 • ✨ AI • 5 phút đọc`. | [ ] |
| **Chuyển ngữ toàn diện** | Bấm đổi sang `EN`: Huy hiệu AI, Khung thông cáo và toàn bộ nhãn chuyên mục đồng loạt đổi sang tiếng Anh mượt mà. | [ ] |
| **Đồng bộ Sáng / Tối** | Cả 4 biến thể huy hiệu tự động đổi màu tương thích hoàn hảo giữa Light Mode và Dark Mode. | [ ] |
