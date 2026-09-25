---
name: theme-coding
description: >-
  Standard architecture, rules, and workflow for developing, modifying, and building
  this Blogger XML Editorial Theme. Use this skill whenever writing or editing
  template XML, components, CSS styles, JavaScript modules, design tokens, or building dist/theme.xml.
---

# Quy Chuẩn Lập Trình Theme (Blogger Editorial Theme Development)

Tài liệu này định nghĩa kiến trúc mã nguồn, quy tắc lập trình, quy chuẩn design token và quy trình biên dịch dành cho dự án Blogspot Editorial Theme.

---

## 1. Kiến Trúc Mã Nguồn (Modular Architecture)

Dự án áp dụng cấu trúc module hóa cao cấp, tách biệt hoàn toàn giữa mã nguồn phát triển (`src/`) và bản phân phối cuối cùng (`dist/`):

```
├── src/
│   ├── components/         # Các khối XML widget độc lập (header, footer, sidebar,...)
│   ├── styles/             # Modular CSS (variables, typography, layout,...)
│   ├── scripts/            # Modular Vanilla JavaScript (ES6+ / IIFE)
│   ├── template.xml        # Master shell XML của Blogger (chứa placeholder {{INCLUDE:...}})
│   └── preview.html        # Môi trường chạy thử nghiệm local (hỗ trợ chuyển đổi 4 view)
├── scripts/
│   └── build.js            # Trình biên dịch: gộp template + components + styles + scripts
├── dist/
│   └── theme.xml           # File XML hoàn chỉnh để cài đặt lên Blogger
└── guider/
    └── guider.md           # Tài liệu hướng dẫn sử dụng & cấu hình toàn thư
```

---

## 2. Quy Chuẩn Design Tokens & Styling (BẮT BUỘC)

Tất cả các định dạng giao diện phải tuân thủ nghiêm ngặt hệ thống token tại [`src/styles/variables.css`](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/src/styles/variables.css).

### 2.1. Quy Tắc Gọi Biến CSS
- **Màu sắc chính & trạng thái:** Dùng `var(--primary)`, `var(--primary-hover)`, `var(--primary-light)`, `var(--success)`, `var(--warning)`, `var(--danger)`, `var(--error)`.
- **Độ trong suốt (Alpha/Opacity):** 
  - **ĐÚNG:** `rgba(var(--primary-rgb), 0.15)` hoặc `color-mix(in srgb, var(--primary) 12%, transparent)`.
  - **SAI:** Hardcode mã hex như `#2563eb26` hay `rgba(37, 99, 235, 0.15)`.
- **Typography:** Dùng `var(--font-main)` (nội dung), `var(--font-heading)` / `var(--font-serif)` (tiêu đề), `var(--font-mono)` (code).
- **Thang Bo Góc (Radius Scale):** Dùng `var(--radius-xs)` (4px), `var(--radius-sm)` (8px), `var(--radius-md)` (12px), `var(--radius-lg)` (16px), `var(--radius-full)` (9999px). **Không tự ý gán bo góc ngẫu nhiên** (`5px`, `7px`, `100px`...).
- **Đổ bóng (Shadows):** Dùng `var(--shadow-sm)`, `var(--shadow-md)`, `var(--shadow-lg)`.

### 2.2. Quy Tắc Dark Mode
- Dark mode được điều khiển bởi thuộc tính `[data-theme="dark"]`.
- Toàn bộ màu nền thẻ, viền, chữ tự động đảo theo biến CSS: `var(--bg-body)`, `var(--bg-card)`, `var(--bg-surface)`, `var(--border-color)`, `var(--text-main)`.
- **TUYỆT ĐỐI KHÔNG** tạo bảng màu Dark mode tự phát trong các file CSS con (ví dụ: hardcode `#111827`, `#1f2937`...).

### 2.3. Cấm Inline Styling trong JavaScript & XML
- **Không nhúng `style.cssText` trực tiếp trong script:** Khi hiển thị toast, đổi trạng thái nút hoặc input lỗi, hãy sử dụng các class utility toàn cục:
  - Thông báo nổi: `.theme-floating-toast` (kèm `.theme-floating-toast--success`, `.theme-floating-toast--error`).
  - Nút thành công: `.theme-btn-success-state`.
  - Viền lỗi: Gán class `.is-invalid` hoặc `style.borderColor = 'var(--danger)'`.
- **Không viết `style="..."` lớn trong template XML:** Hãy tạo class định danh trong CSS và gọi class trong XML.

---

## 3. Quy Chuẩn Không Hardcode & Không Dùng Dữ Liệu Cá Nhân

Mã nguồn phải đảm bảo tính tổng quát, độc lập và bảo mật, có thể áp dụng cho bất kỳ blog nào mà không cần can thiệp sửa code lõi:

1. **Tuyệt đối không gán cứng (hardcode) tên blog hoặc tên cá nhân:**
   - Dùng thẻ Blogger `<data:blog.title/>` hoặc câu chữ trung tính chung (ví dụ: `"cùng độc giả"`, `"Blog"`, `"chúng mình"` thay vì viết cứng một tên blog cụ thể).
2. **Tuyệt đối không đưa thông tin liên hệ riêng (email, số điện thoại, link cá nhân) vào mã nguồn:**
   - Trong code mẫu/template chỉ dùng placeholder chung: `contact@yourblog.com`, `#`...
   - Mọi thông tin thực tế phải được cấu hình linh hoạt qua giao diện Bố cục (Layout) hoặc widget cài đặt (`HTML88` / `window.__CONTACT_CONFIG`).
3. **Bọc Guard cho Dữ Liệu Mẫu (Mock Data):**
   - Dữ liệu mẫu phục vụ phát triển (ảnh Unsplash, bài viết giả lập...) **chỉ được phép kích hoạt trên môi trường Preview/Dev**:
     ```javascript
     const isLocalDev = typeof window !== 'undefined' && 
       (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
     ```
   - Trên blog thật (production), nếu feed trả về rỗng thì widget phải tự động ẩn (`container.style.display = 'none'`) hoặc hiện empty state, **tuyệt đối không để lộ bài viết mẫu**.

---

## 4. Cú Pháp Blogger XML & Cấu Trúc Widget

1. **Cấu trúc Section & Widget chuẩn Blogger:**
   - Sử dụng đúng cú pháp: `<b:section>`, `<b:widget>`, `<b:widget-setting>`, `<b:includable id='main'>`.
   - Các widget hệ thống bắt buộc:
     - `Header1`: Tiêu đề & Logo (Hỗ trợ cả dạng Text và Image).
     - `LinkList1`: Menu điều hướng chính (tự động đồng bộ sang Mobile Nav Drawer).
     - `Label1`: Thanh phân loại chủ đề Category Tabs.
     - `Blog1`: Vòng lặp bài viết chính (hỗ trợ phân trang, đa ngôn ngữ, in-feed widget).
     - `HTML88` (`hidden-global-config`): Khối cài đặt cấu hình ngầm (chứa `__CONTACT_CONFIG`, bật tắt CTA, mã AdSense ngầm).
2. **Escape Ký Tự Trong Biểu Thức XML:**
   - `&` ➔ `&amp;`
   - `<` ➔ `&lt;`
   - `>` ➔ `&gt;`
   - `"` trong thuộc tính expr ➔ `&quot;` (hoặc bọc `'...'`).

---

## 5. Quy Chuẩn Đa Ngôn Ngữ (Bilingual VI / EN)

- Đối với text cố định trong XML: Bổ sung thuộc tính `data-bilingual='true'` với cú pháp `"Tiếng Việt | English"`.
  ```html
  <span data-bilingual='true'>Đọc tiếp ➔ | Read more ➔</span>
  ```
- Đối với placeholder ô nhập liệu: Dùng `data-bilingual-placeholder='Nhập email... | Enter email...'`.
- Hệ thống [`bilingual.js`](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/src/scripts/bilingual.js) sẽ tự động phân tách và render đúng theo ngôn ngữ người dùng lựa chọn trong `localStorage` (`user_lang`).

---

## 6. Quy Trình Phát Triển & Kiểm Tra Chuẩn (Workflow)

Khi thêm tính năng mới hoặc sửa đổi code:

```
[1. Sửa/Thêm Code trong src/]
       │
       ├── CSS: src/styles/*.css (Tuân thủ Design Tokens)
       ├── JS: src/scripts/*.js (IIFE / Không inline CSS cứng)
       └── XML: src/components/*.xml hoặc src/template.xml
       │
[2. Kiểm Tra Local Preview]
       │
       └── Mở file src/preview.html hoặc chạy `npm run dev`
       │
[3. Biên Dịch Theme Hoàn Chỉnh]
       │
       └── Chạy lệnh: `npm run build`
       └── Kiểm tra dist/theme.xml được tạo thành công
       │
[4. Đồng Bộ Guider (GUIDER SYNC RULE)]
       │
       └── BẮT BUỘC rà soát và cập nhật hướng dẫn/mã mẫu vào guider/guider.md
```
