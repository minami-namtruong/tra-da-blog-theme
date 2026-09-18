# ĐẶC TẢ GIAO DIỆN PRESET: AIRY MINIMALIST & PASTEL GRADIENT (THEME PRESET AIRY PASTEL SPECIFICATION)

> **Mã đặc tả**: `PRESET-AIRY-PASTEL-V1`  
> **Dự án**: Blogger Editorial Theme (Blogspot XML v3)  
> **Phiên bản**: `v1.0.0`  
> **Trạng thái**: Hoàn thiện thiết kế kỹ thuật (Ready for Implementation)  
> **Tài liệu nền tảng**: [CSS_DESIGN_TOKENS_AND_ARCHITECTURE_STANDARDIZATION_SPECIFICATION.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/CSS_DESIGN_TOKENS_AND_ARCHITECTURE_STANDARDIZATION_SPECIFICATION.md)

---

## 1. CẢM HỨNG & TẦM NHÌN THIẾT KẾ (DESIGN INSPIRATION & MOODBOARD)

### 1.1. Cảm hứng cốt lõi
Preset **Airy Pastel** được lấy cảm hứng từ các giao diện sản phẩm công nghệ và tạp chí số thế hệ mới (như *tatca.ai*, *Linear*, *Stripe*, *Refactoring*, *Substack*):
- **Cảm giác chủ đạo**: **Nhẹ nhàng, Thanh thoát, Tươi sáng, Có Gu (Airy, Minimalist, Refreshing & Sophisticated)**.
- **Triết lý thị giác**:
  1. **Đường nét Hairline siêu mảnh (Micro-borders)**: Loại bỏ các khung viền xám thô cứng, thay thế bằng viền mờ `1px` hòa sắc tự nhiên với nền.
  2. **Gradient Pastel sống động (Subtle Vivid Pastel Gradients)**: Mang lại sinh khí và vẻ hiện đại cho các nút bấm hành động (CTA) và nhãn phân loại (Category Badges), không bị già nua hay buồn tẻ.
  3. **Hiệu ứng Kính Mờ Thủy Tinh (Frosted Glass / Soft Halo)**: Header lơ lửng, bóng đổ tán xạ dịu mắt như ánh sáng ban mai.
  4. **Tôn vinh trải nghiệm đọc (Content-First & Typography)**: Khổ chữ tiêu chuẩn, nhịp điệu dòng thoáng đãng, mắt đọc lướt êm ái hàng giờ mà không mỏi.

---

## 2. BẢNG MÀU CHỦ ĐẠO & MA TRẬN CHUYỂN ĐỔI SẮC THÁI (COLOR PALETTE MATRIX)

### 2.1. Hệ màu Nhận Diện (Primary Palette)
- **Primary Hue (Màu chủ đạo)**: San Hô & Hồng Đào Ấm Áp (**Warm Coral & Peach**).
  - Tượng trưng cho sự sáng tạo, cởi mở, thân thiện và giàu năng lượng nội dung.
- **Dải Gradient Nút chính (Action Gradient)**:
  ```css
  --primary-gradient: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  ```
- **Hào quang tỏa sáng (Primary Glow)**:
  ```css
  --primary-glow: 0 4px 16px 0 rgba(255, 107, 107, 0.35);
  ```

### 2.2. Bảng Phối Màu Danh Mục Pastel (Multi-Category Pastel Palette)
Mỗi nhóm chuyên mục có thể mang một dải Gradient Pastel êm dịu, tuân thủ nguyên tắc: **Nền mờ 10% – Viền hairline 22% – Chữ đậm tương phản cao (Đạt chuẩn WCAG 2.1 AA)**:

| Nhóm chuyên mục | Tên phối màu | Dải Gradient Nền (Background) | Viền Hairline (Border) | Màu Chữ (Text Color) |
| :--- | :--- | :--- | :--- | :--- |
| **Góc nhìn & Tư duy** | *Warm Coral* | `linear-gradient(135deg, rgba(255,107,107,0.1) 0%, rgba(255,142,83,0.1) 100%)` | `1px solid rgba(255,107,107,0.25)` | `#d93838` |
| **Công nghệ & AI** | *Lavender Sky* | `linear-gradient(135deg, rgba(167,139,250,0.12) 0%, rgba(96,165,250,0.12) 100%)` | `1px solid rgba(167,139,250,0.30)` | `#6d28d9` |
| **Đời sống & Trải nghiệm**| *Mint Emerald* | `linear-gradient(135deg, rgba(52,211,153,0.12) 0%, rgba(16,185,129,0.12) 100%)` | `1px solid rgba(52,211,153,0.28)` | `#047857` |
| **Sách & Chiêm nghiệm** | *Honey Amber* | `linear-gradient(135deg, rgba(251,191,36,0.14) 0%, rgba(245,158,11,0.14) 100%)` | `1px solid rgba(245,158,11,0.30)` | `#b45309` |
| **Mặc định chung** | *Soft Slate* | `linear-gradient(135deg, rgba(100,116,139,0.08) 0%, rgba(148,163,184,0.08) 100%)`| `1px solid rgba(100,116,139,0.20)` | `#334155` |

---

## 3. CẤU HÌNH THIẾT KẾ ĐẶC TRÙ: AIRY PASTEL PRESET

Toàn bộ các giá trị ghi đè (Override Tokens) được áp dụng khi blog kích hoạt `data-theme-preset="airy-pastel"`:

```css
/* ============================================================
   THEME PRESET: AIRY MINIMALIST & PASTEL GRADIENT
   ============================================================ */
:root[data-theme-preset="airy-pastel"],
[data-theme="light"][data-theme-preset="airy-pastel"] {
  /* 1. Nền trang thái & Mặt phẳng */
  --surface-page:     #fafafa;                     /* Trắng kem nhẹ, dịu mắt hơn trắng tinh */
  --surface-card:     #ffffff;                     /* Thẻ trắng sạch sẽ */
  --surface-surface:  #f4f5f7;                     /* Nền phụ siêu nhạt */
  --surface-overlay:  rgba(255, 255, 255, 0.85);   /* Kính mờ Header */

  /* 2. Màu chữ thanh nhã */
  --text-primary:     #0f172a;                     /* Slate 900 - Đen mực mềm */
  --text-secondary:   #475569;                     /* Slate 600 - Xám đọc sách */
  --text-muted:       #94a3b8;                     /* Slate 400 - Thông tin phụ */

  /* 3. Chuẩn mực Hairline & Shadow nhẹ tênh */
  --border-hairline:  rgba(15, 23, 42, 0.055);    /* Đường kẻ chỉ mờ 5.5% */
  --border-subtle:    rgba(15, 23, 42, 0.10);     /* Phân vùng nhẹ 10% */
  --border-divider:   rgba(15, 23, 42, 0.04);     /* Vạch kẻ giữa dòng */
  --shadow-hairline:  0 1px 2px 0 rgba(0, 0, 0, 0.02);
  --shadow-ambient:   0 4px 24px -2px rgba(15, 23, 42, 0.04);
  --shadow-float:     0 12px 36px -4px rgba(15, 23, 42, 0.07);

  /* 4. Màu thương hiệu & Nút bấm Gradient */
  --action-primary:         #ff5757;
  --primary-gradient:       linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  --btn-primary-bg-gradient: var(--primary-gradient);
  --btn-primary-text-color:  #ffffff;
  --btn-primary-radius:     var(--radius-md);     /* Bo cong mềm 10px */
  --btn-primary-shadow:     0 4px 14px 0 rgba(255, 107, 107, 0.32);
  --btn-primary-shadow-hover: 0 6px 22px 0 rgba(255, 107, 107, 0.45);

  /* 5. Nhãn Danh mục (Category Badge) */
  --badge-bg-gradient: linear-gradient(135deg, rgba(255, 107, 107, 0.09) 0%, rgba(255, 142, 83, 0.09) 100%);
  --badge-border:      1px solid rgba(255, 107, 107, 0.22);
  --badge-text-color:  #d93838;
  --badge-radius:      var(--radius-full);
  --badge-padding-y:   4px;
  --badge-padding-x:   11px;
  --badge-font-size:   0.72rem;
  --badge-font-weight: 700;

  /* 6. Thẻ Bài Viết (Post Card) */
  --post-card-bg:           var(--surface-card);
  --post-card-border:       var(--stroke-hairline) solid var(--border-hairline);
  --post-card-border-hover: var(--stroke-hairline) solid rgba(255, 107, 107, 0.35);
  --post-card-radius:       16px;
  --post-card-padding:      1.5rem;
  --post-card-shadow:       var(--shadow-hairline);
  --post-card-shadow-hover: var(--shadow-ambient);
  --post-card-hover-y:      -3px;
  --post-thumb-radius:      12px;

  /* 7. Icon Strokes mỏng thanh mảnh */
  --icon-stroke-default: 1.5px;
}
```

---

## 4. MA TRẬN DARK MODE CHO PRESET AIRY PASTEL

Trong chế độ tối, preset Airy Pastel chuyển sang **phong cách Dạ Lam Phát Quang (Luminescent Obsidian & Neon Halo)**:
- Nền đen than chì sâu thẳm (`#090d16`), không bị đen tuyền 100% để bảo vệ mắt.
- Viền hairline đổi thành ánh sáng bạc mờ (`rgba(255, 255, 255, 0.075)`).
- Các khối Gradient Pastel phát ra ánh sáng huỳnh quang êm ái (Soft Neon Glow).

```css
[data-theme="dark"][data-theme-preset="airy-pastel"] {
  /* 1. Nền bóng đêm sang trọng */
  --surface-page:     #090d16;                     /* Deep Obsidian Navy */
  --surface-card:     #111726;                     /* Khối card xanh than */
  --surface-surface:  #172033;
  --surface-overlay:  rgba(17, 23, 38, 0.85);

  /* 2. Màu chữ ban đêm */
  --text-primary:     #f8fafc;                     /* Trắng sáng dịu */
  --text-secondary:   #94a3b8;                     /* Xám bạc */
  --text-muted:       #64748b;

  /* 3. Hairline trong bóng đêm */
  --border-hairline:  rgba(255, 255, 255, 0.075); /* Viền mỏng như sợi tơ bạc */
  --border-subtle:    rgba(255, 255, 255, 0.12);
  --border-divider:   rgba(255, 255, 255, 0.05);

  /* 4. Nút bấm & Hào quang Dạ quang */
  --action-primary:         #ff6b6b;
  --primary-gradient:       linear-gradient(135deg, #ff758c 0%, #ff8e53 100%);
  --btn-primary-shadow:     0 4px 18px 0 rgba(255, 107, 107, 0.40);
  --btn-primary-shadow-hover: 0 6px 26px 0 rgba(255, 107, 107, 0.55);

  /* 5. Nhãn Danh mục trong tối */
  --badge-bg-gradient: linear-gradient(135deg, rgba(255, 107, 107, 0.18) 0%, rgba(255, 142, 83, 0.18) 100%);
  --badge-border:      1px solid rgba(255, 107, 107, 0.40);
  --badge-text-color:  #fca5a5;                    /* Hồng san hô nhạt, sáng rõ */

  /* 6. Thẻ Card ban đêm */
  --post-card-bg:           var(--surface-card);
  --post-card-border:       var(--stroke-hairline) solid var(--border-hairline);
  --post-card-border-hover: var(--stroke-hairline) solid rgba(255, 107, 107, 0.5);
  --post-card-shadow-hover: 0 8px 30px -4px rgba(0, 0, 0, 0.5);
}
```

---

## 5. CÁC HIỆU ỨNG TƯƠNG TÁC ĐẶC SẮC (MICRO-INTERACTIONS & REFINEMENTS)

### 5.1. Nút Bấm Kêu Gọi Hành Động (CTA Button)
- Khi rê chuột (`:hover`): Nút nâng nhẹ `-2px`, vầng hào quang bên dưới tỏa rộng (`shadow-glow`), độ bão hòa màu tăng nhẹ `filter: brightness(1.04)`.
- Khi nhấp chuột (`:active`): Co nhẹ `transform: scale(0.98)` đem lại cảm giác đàn hồi chân thực.

### 5.2. Category Badges (Hiệu ứng Kẹo Thủy Tinh Mờ)
- Bình thường: Nhẹ nhàng, nằm êm trên card, không lấn át ảnh thumbnail.
- Khi hover: Chuyển động lướt nhẹ `transform: translateY(-1px)`, màu viền sáng lên 1 nấc.

### 5.3. Trích Dẫn Triết Lý (Quote Widget trong Preset này)
- Thay vì khối vàng đặc truyền thống, Quote trong Airy Pastel sử dụng:
  - Nền gradient kem đào trong veo: `linear-gradient(135deg, rgba(255, 241, 242, 0.6) 0%, rgba(255, 247, 237, 0.4) 100%)`.
  - Viền hairline hồng đào `1px solid rgba(255, 159, 164, 0.25)`.
  - Dấu ngoặc kép thanh mảnh màu san hô nhạt.

---

## 6. HƯỚNG DẪN KÍCH HOẠT VÀ TÍCH HỢP

Tác giả blog có thể kích hoạt phong cách này theo 2 cách:

1. **Cách 1: Chọn trực tiếp trong file cấu hình build** (`scripts/build.js`):
   ```javascript
   // Đặt theme preset mặc định khi compile ra theme.xml
   const DEFAULT_THEME_PRESET = "airy-pastel";
   ```
2. **Cách 2: Chuyển đổi linh hoạt tại thẻ HTML của Blogger**:
   ```xml
   <html b:css='false' b:responsive='true' b:version='2' 
         data-theme='light' 
         data-theme-preset='airy-pastel'>
   ```

---

## 7. TỔNG KẾT
Preset **Airy Pastel** kết hợp cùng hệ thống **CSS Design Tokens 3 tầng** mang đến một diện mạo hoàn hảo cho blog sáng tạo nội dung: **đủ thanh lịch để giữ chân độc giả đọc bài dài, đủ hiện đại và sắc sảo để tạo nên dấu ấn thương hiệu cá nhân đẳng cấp.**
