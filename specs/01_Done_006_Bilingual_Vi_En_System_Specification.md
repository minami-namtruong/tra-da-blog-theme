# ĐẶC TẢ KỸ THUẬT: HỆ THỐNG SONG NGỮ VI - EN TOÀN DIỆN (BILINGUAL VI | EN SYSTEM)

> **Mã tính năng**: `FEAT-BILINGUAL-VI-EN-V1`  
> **Dự án**: Blogger Editorial Theme (Blogspot XML v3)  
> **Phiên bản đặc tả**: `v1.0.0`  
> **Trạng thái**: Bản thảo thiết kế hoàn chỉnh (Design Specification)  
> **Tài liệu liên quan**: [THEME_SPECIFICATION.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/THEME_SPECIFICATION.md), [MODULAR_FOOTER_SPECIFICATION.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/MODULAR_FOOTER_SPECIFICATION.md)

---

## 1. TỔNG QUAN & NGUYÊN TẮC THIẾT KẾ

### 1.1. Bối cảnh & Nhu cầu
Nhằm mở rộng đối tượng độc giả tiếp cận từ trong nước sang quốc tế và kiều bào mà không làm tăng độ phức tạp trong vận hành kỹ thuật (không cần máy chủ serverless dịch AI, không cần tạo blog thứ hai), blog cần một **Hệ thống Song ngữ Hợp Nhất (Unified Bilingual System)** đạt các tiêu chí:
1. **Quản trị đơn giản 100%**: Tác giả có thể thêm menu, chuyên mục mới trực tiếp trong Blogger Admin bằng cú pháp trực quan `Tên Tiếng Việt | English Name`.
2. **Đồng bộ toàn diện (Synchronized Localization)**: Một cú click chuột vào công tắc `[ 🇻🇳 VI | 🇬🇧 EN ]` trên Header sẽ đồng thời chuyển đổi:
   - Menu trên cùng (Header Menu) & Chân trang (Footer Menu).
   - Nhãn chuyên mục (Category Badges / Labels).
   - Tiêu đề các Widget ở Sidebar.
   - Toàn bộ nút bấm, thông báo, thời gian đọc, mục lục cố định của theme.
   - Nội dung bài viết chi tiết (nếu bài có soạn song ngữ).
3. **Không phụ thuộc bên thứ ba (Zero External Dependencies)**: Vận hành nội bộ 100% trên trình duyệt bằng JavaScript siêu nhẹ (kích thước < 3KB), không gọi API ngoài, độ trễ chuyển đổi = 0.00 giây.

---

## 2. QUY CHUẨN CÚ PHÁP `VI | EN` (SYNTAX SPECIFICATION)

Cú pháp sử dụng ký tự gạch đứng `|` làm dấu phân cách giữa hai phần ngôn ngữ:

```text
[Văn bản Tiếng Việt] | [Văn bản Tiếng Anh]
```

### 2.1. Quy chuẩn áp dụng theo từng vị trí trong Blogger Admin

| Vị trí cấu hình | Cách gõ trong Blogger Admin | Hiển thị chế độ `VI` | Hiển thị chế độ `EN` |
| :--- | :--- | :--- | :--- |
| **Menu Header (LinkList)** | `Trang Chủ \| Home` | **Trang Chủ** | **Home** |
| | `Dòng Thời Gian \| Timeline` | **Dòng Thời Gian** | **Timeline** |
| | `Tủ Sách \| Bookshelf` | **Tủ Sách** | **Bookshelf** |
| **Nhãn Chuyên Mục (Labels)**| `Góc Nhìn & Tư Duy \| Perspectives` | **Góc Nhìn & Tư Duy** | **Perspectives** |
| | `Trải Nghiệm Sống \| Life Stories` | **Trải Nghiệm Sống** | **Life Stories** |
| | `Công Nghệ \| Technology` | **Công Nghệ** | **Technology** |
| **Tiêu đề Widget (Sidebar)** | `Bài Viết Nổi Bật \| Popular Posts` | **Bài Viết Nổi Bật** | **Popular Posts** |
| | `Điểm Tin Mỗi Ngày \| Daily Digest` | **Điểm Tin Mỗi Ngày** | **Daily Digest** |

### 2.2. Quy tắc xử lý chuỗi (String Sanitization & Fallback)
1. **Tự động cắt khoảng trắng thừa (`trim()`)**: Cú pháp `Tủ Sách | Bookshelf` hoặc `Tủ Sách|Bookshelf` đều được chuẩn hóa thành 2 chuỗi sạch: `"Tủ Sách"` và `"Bookshelf"`.
2. **Cơ chế An toàn (Graceful Fallback)**:
   - Nếu tác giả chỉ gõ `Tủ Sách` (không chứa ký tự `|`):
     - Ở chế độ `VI`: Hiển thị `"Tủ Sách"`.
     - Ở chế độ `EN`: Giữ nguyên `"Tủ Sách"`, **tuyệt đối không gây lỗi trang, không trắng màn hình**.

---

## 3. KIẾN TRÚC ĐIỀU PHỐI NGÔN NGỮ HỢP NHẤT (UNIFIED ORCHESTRATOR)

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│              CÔNG TẮC NGÔN NGỮ TRÊN HEADER: [ 🇻🇳 VI | 🇬🇧 EN ]                    │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ Click chuyển đổi
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   BỘ ĐIỀU PHỐI TRUNG TÂM (LANGUAGE ORCHESTRATOR)                 │
└───────┬────────────────────────────────┬─────────────────────────────────┬───────┘
        │                                │                                 │
        ▼                                ▼                                 ▼
┌───────────────────────┐  ┌───────────────────────────────┐  ┌────────────────────┐
│ 1. XỬ LÝ CÚ PHÁP      │  │ 2. TỪ ĐIỂN LÕI CỦA THEME      │  │ 3. NỘI DUNG BÀI    │
│    "VI | EN"          │  │    (CORE UI DICTIONARY)       │  │    VIẾT SONG NGỮ   │
├───────────────────────┤  ├───────────────────────────────┤  ├────────────────────┤
│ • Menu Header & Footer│  │ • Thời gian đọc (min read)    │  │ • data-lang="vi"   │
│ • Nhãn chuyên mục     │  │ • Bài trước / Bài sau         │  │ • data-lang="en"   │
│ • Tiêu đề Widget      │  │ • Mục lục bài viết (Auto-TOC) │  │ • Đồng bộ mục lục  │
│ • Nút điều hướng      │  │ • Nút Về đầu trang, Mời cà phê│  │   Auto-TOC theo EN │
└───────────────────────┘  └───────────────────────────────┘  └────────────────────┘
```

---

## 4. CHI TIẾT CÁC THÀNH PHẦN KỸ THUẬT

### 4.1. Công tắc Header (Header Language Switcher UI)
- **Vị trí**: Nằm trên thanh điều hướng cố định (Sticky Header), cạnh biểu tượng Tìm kiếm và nút gạt Dark/Light Mode.
- **Cấu trúc HTML**:
  ```html
  <div class="lang-switcher" role="group" aria-label="Chọn ngôn ngữ">
    <button class="btn-lang btn-lang-vi active" onclick="setLanguage('vi')" aria-pressed="true">
      <span class="lang-flag">🇻🇳</span> <span class="lang-text">VI</span>
    </button>
    <button class="btn-lang btn-lang-en" onclick="setLanguage('en')" aria-pressed="false">
      <span class="lang-flag">🇬🇧</span> <span class="lang-text">EN</span>
    </button>
  </div>
  ```
- **Styling**: Bo tròn hoàn toàn `border-radius: var(--radius-full)`, nền `var(--bg-surface)`, viền mỏng `1px solid var(--border-color)`. Nút active có nền `var(--primary)` và chữ trắng nổi bật.

---

### 4.2. Bộ xử lý chuỗi động (Dynamic String Parser)
Sử dụng thuộc tính `data-raw-text` trên từng phần tử DOM để lưu giữ bản gốc, ngăn chặn hiện tượng mất chuỗi gốc khi người dùng bấm chuyển đổi nhiều lần:

```javascript
function applyBilingualElements(lang) {
  // Bộ chọn toàn bộ các phần tử hỗ trợ cú pháp VI | EN
  const targets = document.querySelectorAll(
    '.nav-menu a, .footer-links a, .post-category-tag, .sidebar-widget-title, .footer-bottom-menu a'
  );

  targets.forEach(el => {
    // 1. Lưu lại nội dung gốc ban đầu
    if (el.dataset.rawText === undefined) {
      el.dataset.rawText = el.textContent.trim();
    }

    const raw = el.dataset.rawText;

    // 2. Nếu có chứa dấu phân cách "|"
    if (raw.includes('|')) {
      const parts = raw.split('|').map(s => s.trim());
      el.textContent = (lang === 'en' ? parts[1] : parts[0]) || parts[0];
    }
  });
}
```

---

### 4.3. Từ Điển Lõi Theme (Core UI Static Dictionary)
Áp dụng cho các chuỗi văn bản cố định của giao diện blog mà tác giả không cần cấu hình:

```javascript
const CORE_I18N = {
  vi: {
    searchPlaceholder: 'Tìm kiếm bài viết...',
    readingTime: 'phút đọc',
    tableOfContents: 'Mục Lục Bài Viết',
    previousPost: '« Bài trước',
    nextPost: 'Bài sau »',
    shareTitle: 'Chia sẻ bài viết:',
    copiedLink: 'Đã sao chép liên kết!',
    aboutAuthor: 'Về Tác Giả',
    buyMeACoffee: 'Mời tôi ly cà phê',
    newsletterTitle: 'Nhận bài viết mới',
    newsletterDesc: 'Nhận thông báo khi có bài viết mới qua email.',
    subscribeBtn: 'Đăng Ký',
    backToTop: '↑ Lên đầu trang',
    copyrightSuffix: 'Tất cả quyền được bảo lưu.'
  },
  en: {
    searchPlaceholder: 'Search articles...',
    readingTime: 'min read',
    tableOfContents: 'Table of Contents',
    previousPost: '« Previous Post',
    nextPost: 'Next Post »',
    shareTitle: 'Share this post:',
    copiedLink: 'Link copied to clipboard!',
    aboutAuthor: 'About The Author',
    buyMeACoffee: 'Buy me a coffee',
    newsletterTitle: 'Newsletter',
    newsletterDesc: 'Get thoughtful articles delivered to your inbox.',
    subscribeBtn: 'Subscribe',
    backToTop: '↑ Back to top',
    copyrightSuffix: 'All rights reserved.'
  }
};
```

---

### 4.4. Tích hợp Song ngữ Trong Bài Viết (`bilingual.js`)
Đồng bộ hóa trực tiếp với hệ thống bài viết song ngữ sẵn có:

1. Khi `setLanguage('en')` được gọi:
   - Các khối `<div data-lang="vi">` tự động ẩn (`display: none`).
   - Các khối `<div data-lang="en">` tự động hiển thị (`display: block`).
   - Nếu bài viết là bài thuần tiếng Việt (không có `data-lang="en"`): Giữ nguyên nội dung bài đọc, chỉ dịch toàn bộ khung menu, thời gian đọc, nút bấm xung quanh.
2. Kích hoạt sự kiện tùy biến:
   ```javascript
   window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));
   ```
   - Script `auto-toc.js` tự động lắng nghe sự kiện này để quét lại tiêu đề `h2`, `h3` tiếng Anh và dựng lại Mục lục bài viết tương ứng.

---

### 4.5. Lưu Trữ Tùy Chọn Người Dùng (Persistence)
- Tùy chọn ngôn ngữ được lưu trong `localStorage.setItem('user_lang', lang)`.
- Khi độc giả chuyển qua bài viết khác hoặc quay lại blog vào ngày hôm sau: Trang tự động nhận diện tùy chọn đã lưu và hiển thị đúng ngôn ngữ mà độc giả đã chọn trước đó.

---

## 5. HƯỚNG DẪN DÀNH CHO TÁC GIẢ (WORKFLOW)

### 5.1. Thêm một Menu mới trong Blogger Admin
1. Vào **Bố cục (Layout)** » Chỉnh sửa **Header Menu (LinkList)**.
2. Thêm liên kết mới:
   - **Tên trang web**: `Tủ Sách | Bookshelf`
   - **URL trang web**: `/p/tu-sach.html`
3. Bấm **Lưu**.

### 5.2. Thêm một Chuyên mục (Nhãn) mới khi viết bài
1. Trong màn hình soạn thảo bài viết của Blogger, tại ô **Nhãn (Labels)** bên phải:
2. Gõ: `Góc Nhìn & Tư Duy | Perspectives`
3. Bấm **Xuất bản**.

### 5.3. Viết bài viết song ngữ
Soạn bài theo cấu trúc 2 khối:
```html
<div data-lang="vi">
  <p>Nội dung bài viết bằng tiếng Việt...</p>
</div>

<div data-lang="en">
  <p>English content goes here...</p>
</div>
```

---

## 6. TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)

| Hạng mục | Tiêu chí đánh giá nghiệm thu | Đánh giá |
| :--- | :--- | :---: |
| **Xử lý cú pháp `VI \| EN`** | Menu `Tủ Sách \| Bookshelf`: Chế độ VI hiện `Tủ Sách`, chế độ EN hiện `Bookshelf`. | [ ] |
| **Không hiển thị ký tự `\|`** | Tuyệt đối không bao giờ để độc giả nhìn thấy dấu gạch đứng `\|` trên giao diện ngoài. | [ ] |
| **Xử lý khoảng trắng** | Cú pháp có khoảng trắng hoặc dính liền (`A \| B` hoặc `A\|B`) đều hiển thị sạch đẹp. | [ ] |
| **Cơ chế Fallback** | Từ chỉ có tiếng Việt (không có dấu `\|`): Giữ nguyên văn bản gốc, không lỗi giao diện. | [ ] |
| **Từ điển cố định** | Chuyển sang EN: Thời gian đọc, Mục lục, Bài trước/sau, Bản quyền tự động dịch chuẩn. | [ ] |
| **Đồng bộ bài viết song ngữ** | Chuyển sang EN: Khối `data-lang="vi"` ẩn đi, `data-lang="en"` hiện ra ngay lập tức. | [ ] |
| **Đồng bộ Mục lục Auto-TOC** | Khi chuyển ngôn ngữ: Mục lục tự động quét lại tiêu đề của ngôn ngữ đang active. | [ ] |
| **Lưu trạng thái** | Chọn EN -> Mở bài viết khác: Trang vẫn giữ nguyên giao diện tiếng Anh. | [ ] |
| **Tốc độ & Hiệu năng** | Quá trình chuyển đổi diễn ra tức thì (< 10ms), không giật màn hình (CLS = 0). | [ ] |
