# ĐẶC TẢ KỸ THUẬT & GIAO DIỆN: HỆ THỐNG MINH BẠCH NỘI DUNG AI (AI TRANSPARENCY SYSTEM)

> **Mã tính năng**: `FEAT-AI-TRANSPARENCY-V1`  
> **Dự án**: Blogger Editorial Theme (Blogspot XML v3)  
> **Phiên bản đặc tả**: `v1.0.0`  
> **Trạng thái**: Bản thảo thiết kế hoàn chỉnh (Design Specification)  
> **Tài liệu liên quan**: [THEME_SPECIFICATION.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/THEME_SPECIFICATION.md), [MODULAR_FOOTER_SPECIFICATION.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/MODULAR_FOOTER_SPECIFICATION.md)

---

## 1. TỔNG QUAN & NGUYÊN TẮC CỐT LÕI

### 1.1. Bối cảnh & Tầm nhìn
Trong kỷ nguyên số, trí tuệ nhân tạo (AI) đã trở thành công cụ hỗ trợ đắc lực trong quá trình sáng tạo nội dung, nghiên cứu tư liệu và phát triển ý tưởng. Tuy nhiên, ranh giới giữa việc ứng dụng AI có trách nhiệm và việc tạo nội dung tự động thiếu kiểm chứng đang là mối bận tâm lớn của cả độc giả lẫn các công cụ tìm kiếm (Google E-E-A-T).

**Tính năng AI Transparency (Hệ Thống Minh Bạch AI)** được xây dựng nhằm:
1. **Minh bạch tuyệt đối với độc giả**: Tôn trọng quyền được biết của người đọc về nguồn gốc và cách thức bài viết được tạo ra.
2. **Củng cố niềm tin & Uy tín (Authority & Trust)**: Khẳng định vai trò làm chủ tư duy và biên tập của tác giả con người (Nam Trương), không để độc giả có cảm giác "bị lừa" bởi nội dung tự động.
3. **Chuẩn hóa SEO E-E-A-T**: Tuân thủ hướng dẫn mới nhất của Google Search Central về nội dung có sự tham gia của AI.

### 1.2. NGUYÊN TẮC BẮT BUỘC: Nhãn Thuộc Tính (Metadata Flag), KHÔNG Phải Chuyên Mục Nội Dung (Taxonomy)
> ⚠️ **Quy tắc quan trọng nhất**:
> Nhãn AI là một **Cờ thuộc tính chức năng (System / Feature Flag)** để gắn cờ đặc tính của bài viết, **HOÀN TOÀN KHÔNG PHẢI là một chuyên mục (Category)** dùng để phân loại chủ đề bài viết.

* **Không làm rác danh mục**: Nhãn AI sẽ **tự động bị lọc ẩn 100%** khỏi tiện ích Chuyên mục (Categories / Labels widget), menu Header, và chân trang.
* **Bảo toàn chuyên mục chủ đề**: Một bài viết về *“Tư duy phản biện thời đại số”* vẫn thuộc chuyên mục chính là **`Góc Nhìn & Tư Duy`**. Nhãn AI chỉ đóng vai trò là một lớp huy hiệu minh bạch đi kèm.

---

## 2. QUY CHUẨN ĐẶT CỜ THUỘC TÍNH (METADATA LABEL CONVENTION)

Tác giả chỉ cần sử dụng một trong các nhãn quy ước sau khi soạn thảo bài viết trong Blogger Admin:

| Nhãn quy ước (Labels) | Phân loại | Ý nghĩa thực tế | Huy hiệu hiển thị (Badge) |
| :--- | :--- | :--- | :--- |
| **`ai:assisted`** (hoặc `AI-Assisted`) | Hỗ trợ bởi AI *(Phổ biến nhất)* | Tác giả tự viết, AI hỗ trợ nghiên cứu tài liệu, gợi ý dàn ý, tóm tắt dữ liệu hoặc sửa lỗi ngữ pháp. Tác giả kiểm chứng 100%. | `✨ Hỗ trợ bởi AI` |
| **`ai:product`** (hoặc `AI-Product`) | Sản phẩm / Công cụ AI | Bài viết đánh giá, review, hướng dẫn sử dụng một công cụ/ứng dụng trí tuệ nhân tạo cụ thể (như Claude, Cursor, ChatGPT). | `🤖 Sản phẩm AI` |
| **`ai:generated`** (hoặc `AI-Generated`) | Nội dung AI tổng hợp | Toàn bộ hoặc phần lớn nội dung do AI tổng hợp theo prompt của tác giả (ví dụ: bài thử nghiệm công nghệ). | `⚡ Tạo bởi AI` |

---

## 3. KIẾN TRÚC KỸ THUẬT & CƠ CHẾ CÁCH LY (TAXONOMY ISOLATION)

```text
                               ┌──────────────────────────────────────────────┐
                               │             BÀI VIẾT XUẤT BẢN                │
                               │  Nhãn: ["Góc Nhìn & Tư Duy", "ai:assisted"]  │
                               └──────────────────────┬───────────────────────┘
                                                      │
                                                      ▼
                      ┌──────────────────────────────────────────────────────────────┐
                      │             BỘ LỌC TỰ ĐỘNG CỦA THEME (THEME PARSER)          │
                      └──────────────┬───────────────────────────────┬───────────────┘
                                     │                               │
        (Lọc nhãn chuyên mục thật)   ▼                               ▼   (Bóc tách cờ thuộc tính AI)
 ┌────────────────────────────────────────────────┐  ┌────────────────────────────────────────────────┐
 │ 1. DANH MỤC THÔNG THƯỜNG                       │  │ 2. HỆ THỐNG MINH BẠCH AI                      │
 │ • Chuyên mục hiển thị: "Góc Nhìn & Tư Duy"     │  │ • Cờ: "ai:assisted"                            │
 │ • Tự động LOẠI BỎ nhãn "ai:assisted" khỏi:     │  │ • Render: Huy hiệu "✨ Hỗ trợ bởi AI"         │
 │   - Header Menu & Footer links                 │  │ • Render: Khung "AI Disclosure Box" ở đầu bài  │
 │   - Widget Danh mục ở Sidebar                  │  │ • Render: Tooltip giải thích khi hover          │
 │   - Thẻ Tag thông thường dưới chân bài         │  │                                                │
 └────────────────────────────────────────────────┘  └────────────────────────────────────────────────┘
```

### 3.1. Cơ chế lọc ở tầng Blogger XML v3
Trong các vòng lặp hiển thị danh sách nhãn (`<b:loop values='data:post.labels' var='label'>`):
```xml
<!-- Chỉ hiển thị nhãn nếu KHÔNG phải là nhãn thuộc tính AI -->
<b:if cond='not (data:label.name startsWith "ai:" or data:label.name startsWith "AI-")'>
  <a class='post-category-tag' expr:href='data:label.url'>
    <data:label.name/>
  </a>
</b:if>
```

### 3.2. Cơ chế nhận diện cờ AI trong JavaScript (theme.js)
```javascript
const AI_FLAGS = {
  ASSISTED: ['ai:assisted', 'ai-assisted', 'hỗ trợ bởi ai'],
  PRODUCT: ['ai:product', 'ai-product', 'sản phẩm ai'],
  GENERATED: ['ai:generated', 'ai-generated', 'tạo bởi ai']
};

function detectAiFlag(labels) {
  if (!labels || !labels.length) return null;
  const lowerLabels = labels.map(l => l.toLowerCase().trim());
  if (lowerLabels.some(l => AI_FLAGS.ASSISTED.includes(l))) return 'assisted';
  if (lowerLabels.some(l => AI_FLAGS.PRODUCT.includes(l))) return 'product';
  if (lowerLabels.some(l => AI_FLAGS.GENERATED.includes(l))) return 'generated';
  return null;
}
```

---

## 4. ĐẶC TẢ GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG (UI/UX SPECIFICATION)

Tính năng kết hợp **Cách 1 (Huy hiệu Badge)** và **Cách 2 (Khung Thông Cáo Minh Bạch)** thành một trải nghiệm liền mạch:

### 4.1. Thành Phần 1: Huy Hiệu Minh Bạch AI (AI Transparency Badge)

#### Vị trí hiển thị:
1. **Trên Thẻ Bài Viết (Post Card) ở Trang Chủ / Danh Mục**:
   - Nằm cạnh dòng ngày tháng và thời gian đọc (Metadata row).
2. **Ở Đầu Bài Viết Chi Tiết (Single Post Header)**:
   - Nằm ngay dưới tiêu đề bài viết (Post Title), cạnh Avatar tác giả và ngày đăng.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [Góc Nhìn & Tư Duy]                                                                    │
│ Tiêu Đề Bài Viết Về Trí Tuệ Nhân Tạo Và Con Người                                      │
│ 📅 10/09/2026   ⏱️ 6 phút đọc   [ ✨ Hỗ trợ bởi AI ▾ ]                                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Thiết kế giao diện (Visual Styling):
- **Kích thước**: Cao `24px`, padding `2px 10px`, bo tròn hoàn toàn `border-radius: 9999px`.
- **Hệ màu nhận diện (Futuristic Tech Palette)**:
  - *Light Mode*: Nền gradient tím - xanh công nghệ nhạt `linear-gradient(135deg, #f3e8ff 0%, #e0f2fe 100%)`, viền `1px solid #c084fc`, chữ màu tím thẫm `#6b21a8`.
  - *Dark Mode*: Nền `linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)`, viền `1px solid rgba(168, 85, 247, 0.4)`, chữ tím sáng `#d8b4fe`.
- **Icon**:
  - `✨` đối với bài `ai:assisted`.
  - `🤖` đối với bài `ai:product`.
  - `⚡` đối với bài `ai:generated`.
- **Hiệu ứng Hover & Tooltip**:
  - Khi rê chuột vào: Huy hiệu sáng nhẹ, con trỏ dạng `help`.
  - Hiển thị Tooltip nổi:
    > *"Bài viết được hỗ trợ bởi công cụ AI trong khâu nghiên cứu và dàn ý. Nội dung và quan điểm được Nam Trương trực tiếp biên tập & chịu trách nhiệm."*

---

### 4.2. Thành Phần 2: Khung Thông Cáo Minh Bạch (AI Disclosure Callout Box)

#### Vị trí hiển thị:
- **Chỉ xuất hiện trên Trang Bài Viết Chi Tiết (Single Post)**.
- Nằm ngay trước đoạn văn mở đầu của bài viết (phía trên nội dung chính), đóng vai trò như một lời mở đầu minh bạch, lịch thiệp gửi tới độc giả.

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

#### Thiết kế giao diện (Visual Styling):
- **Khung viền**: Bo góc `12px`, viền mỏng `1px solid var(--border-color)`, điểm nhấn viền trái đậm `3.5px solid #8b5cf6` (tím công nghệ).
- **Màu nền**: `var(--bg-surface)` có độ tương phản nhẹ so với nền trang, tạo cảm giác một khối ghi chú trang trọng.
- **Typography**:
  - Tiêu đề thông cáo: Font `var(--font-sans)`, `font-size: 0.85rem`, `font-weight: 700`, chữ in hoa nhẹ, màu `var(--text-main)`.
  - Đoạn văn mô tả: Font `var(--font-sans)`, `font-size: 0.88rem`, màu `var(--text-muted)`, chiều cao dòng `1.6`.
- **Liên kết minh bạch**: Dẫn tới trang tĩnh chính sách (ví dụ `/p/chinh-sach-ai.html` nếu tác giả muốn xuất bản trang riêng).

---

## 5. TÙY BIẾN TRONG BLOGGER ADMIN (DÀNH CHO TÁC GIẢ)

Tác giả có toàn quyền kiểm soát tính năng này mà không cần động đến code:

### 5.1. Khi viết bài
* Bạn chỉ cần gõ thêm nhãn **`ai:assisted`** (hoặc `ai:product`) vào ô Nhãn bài viết bên phải.
* Hệ thống sẽ tự động kích hoạt cả **Huy hiệu Badge** và **Khung Disclosure Box**.

### 5.2. Công tắc Tùy chỉnh trong Blogger Theme Designer
Trong **Blogger Admin > Chủ đề (Theme) > Tùy chỉnh (Customize) > Nâng cao**:
* **Công tắc bật/tắt Khung Thông Cáo (Show AI Disclosure Box)**:
  - Cho phép tác giả chọn: *Chỉ hiện Huy hiệu Badge nhỏ* HOẶC *Hiện cả Huy hiệu Badge lẫn Khung Thông Cáo to ở đầu bài*.
* **Tùy biến câu chữ**: Tác giả có thể sửa lại đoạn văn thông cáo minh bạch theo phong cách cá nhân nếu muốn.

---

## 6. BẢNG TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)

| Hạng mục | Tiêu chí kiểm thử nghiệm thu | Đánh giá |
| :--- | :--- | :---: |
| **Cách ly nhãn tuyệt đối** | Nhãn `ai:assisted` KHÔNG xuất hiện trong widget Chuyên mục, Footer links, hay Header menu. | [ ] |
| **Bảo toàn chuyên mục chính**| Bài viết gắn `[Công Nghệ, ai:assisted]` thì thẻ chuyên mục hiển thị chỉ là `Công Nghệ`. | [ ] |
| **Hiển thị Badge thẻ bài** | Trên Post Card ở trang chủ: Hiển thị huy hiệu `✨ Hỗ trợ bởi AI` nhỏ gọn, tinh tế. | [ ] |
| **Hiển thị Disclosure Box** | Vào đọc chi tiết bài viết: Khung Thông Cáo Minh Bạch hiển thị trang trọng ở đầu bài viết. | [ ] |
| **Bài viết thông thường** | Bài viết KHÔNG có nhãn `ai:*`: Tuyệt đối không xuất hiện huy hiệu hay khung thông cáo nào. | [ ] |
| **Chế độ Sáng / Tối** | Cả Huy hiệu và Khung thông cáo tự động thích ứng hoàn hảo với Dark Mode và Light Mode. | [ ] |
| **Tooltip giải thích** | Rê chuột vào Huy hiệu: Tooltip giải thích bật lên mượt mà, không bị che khuất. | [ ] |
| **Tính di động (Mobile)** | Trên điện thoại: Huy hiệu và Khung thông cáo co giãn cân đối, không tràn lề màn hình. | [ ] |
