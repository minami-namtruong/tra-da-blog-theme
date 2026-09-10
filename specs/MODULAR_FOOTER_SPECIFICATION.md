# ĐẶC TẢ KỸ THUẬT & GIAO DIỆN: CHÂN TRANG ĐA TẦNG MODULE HÓA (3-TIER MODULAR FOOTER)

> **Mã tính năng**: `FEAT-MODULAR-FOOTER-V3`  
> **Dự án**: Blogger Editorial Theme (Blogspot XML v3)  
> **Phiên bản đặc tả**: `v1.0.0`  
> **Trạng thái**: Bản thảo thiết kế hoàn chỉnh (Design Specification)  
> **Tài liệu liên quan**: [THEME_SPECIFICATION.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/THEME_SPECIFICATION.md), [FLEXIBLE_SPECIAL_POSTS_WIDGET_SPECIFICATION.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/FLEXIBLE_SPECIAL_POSTS_WIDGET_SPECIFICATION.md)

---

## 1. TỔNG QUAN & TRIẾT LÝ THIẾT KẾ

### 1.1. Bối cảnh & Lý do tái cấu trúc
Chân trang (Footer) trước đây được kế thừa từ phong cách website doanh nghiệp / thương mại điện tử với 4 cột truyền thống. Trên một blog cá nhân định hướng nội dung chất lượng cao (Editorial Publication), mô hình này bộc lộ các bất cập lớn:
1. **Trùng lặp thông tin tác giả**: Lặp lại tiểu sử tác giả vốn đã xuất hiện ở Banner, Sidebar và Hộp tác giả cuối bài viết.
2. **Trùng lặp chuyên mục**: Bê nguyên danh sách chuyên mục từ Header xuống Footer gây dư thừa và hầu như không có lượt click.
3. **Thiếu tính module hóa**: Một số thành phần bị hardcode trong code XML, khiến tác giả không thể bật/tắt hoặc chỉnh sửa linh hoạt trong trang quản trị Blogger.

### 1.2. Mục tiêu kiến trúc
Tái thiết kế toàn diện Footer thành **Bố cục 3 Tầng Module Hóa (3-Tier Modular Footer)**:
1. **Tầng 1 (Nội dung & Tương tác)**: Tập trung vào **Lời cảm ơn chân thành**, **Chính sách pháp lý/minh bạch**, **Hộp nhận bản tin qua email**, và **Mạng xã hội**.
2. **Tầng 2 (Điều hướng đáy trang & Bản quyền)**: **Thanh Bottom Bar** thanh thoát gồm dòng bản quyền, **Bottom Menu** đồng bộ với menu chính, và nút **Về đầu trang** cuộn mượt.
3. **Tầng 3 (Quảng cáo chân trang)**: Khu vực dành riêng cho Google AdSense / Banner quảng cáo chuẩn monetization mà không gây phản cảm.
4. **100% Widget hóa (Zero Hardcoding)**: TẤT CẢ các thành phần trên đều là các widget độc lập trong trang quản trị **Bố cục (Layout)** của Blogger. Tác giả có thể **bật/tắt (ẩn/hiện)**, thay đổi thứ tự và sửa đổi văn bản/liên kết mà không cần đụng vào 1 dòng mã XML.

---

## 2. KIẾN TRÚC TỔNG THỂ & SƠ ĐỒ BỐ CỤC (LAYOUT HIERARCHY)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       SITE FOOTER CONTAINER                                      │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ─── TẦNG 1: NỘI DUNG & TƯƠNG TÁC CHÍNH (MAIN CONTENT TIER) ─────────────────────────────────── │
│ ┌─────────────────────────────┬─────────────────────────────┬──────────────────────────────────┐ │
│ │ CỘT 1: THƯƠNG HIỆU & LỜI CẢM│ CỘT 2: CHÍNH SÁCH & PHÁP LÝ │ CỘT 3: NHẬN BẢN TIN & KẾT NỐI    │ │
│ │ ÔN                          │                             │                                  │ │
│ │ • Logo thương hiệu Blog     │ • Chính sách bảo mật        │ • Ô nhập email đăng ký bản tin   │ │
│ │ • Lời cảm ơn ấm áp tới độc  │ • Điều khoản dịch vụ        │ • Nút gửi đăng ký                │ │
│ │   giả                       │ • Tuyên bố miễn trừ trách   │ ──────────────────────────────── │ │
│ │ • [Widget Buy Me A Coffee]  │   nhiệm / Affiliate         │ • Dãy icon mạng xã hội:          │ │
│ │   (Nút/Hộp mini nhỏ gọn ☕)  │ • Liên hệ & Hợp tác         │   Facebook, X, LinkedIn, RSS...  │ │
│ └─────────────────────────────┴─────────────────────────────┴──────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ─── TẦNG 2: ĐIỀU HƯỚNG ĐÁY TRANG & BẢN QUYỀN (NAVIGATION & COPYRIGHT TIER) ─────────────────── │
│ ┌─────────────────────────────┬─────────────────────────────┬──────────────────────────────────┐ │
│ │ Bên trái:                   │ Ở giữa:                     │ Bên phải:                        │ │
│ │ © 2026 Nam Trương.          │ Bottom Navigation Menu:     │ Nút Về đầu trang:                │ │
│ │ Tất cả quyền được bảo lưu.  │ Trang chủ · Về tôi · Liên hệ│ ↑ Lên đầu trang (cuộn mượt)      │ │
│ │                             │                             │                                  │ │
│ └─────────────────────────────┴─────────────────────────────┴──────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ─── TẦNG 3: VÙNG QUẢNG CÁO CHÂN TRANG (MONETIZATION / ADS TIER) ──────────────────────────────── │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ [Widget Quảng Cáo Đáy Trang - Google AdSense Slot]                                           │ │
│ │ Hỗ trợ kích thước: Leaderboard (728x90), Billboard (970x90/250) hoặc Responsive              │ │
│ │ • Công tắc bật/tắt (Show this widget) hoàn toàn độc lập trong Blogger Layout                  │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. CHI TIẾT TỪNG TẦNG & CẤU TRÚC WIDGET BLOGGER XML V3

Tất cả các khu vực đều được định nghĩa thông qua thẻ `<b:section>` của Blogger v3, cho phép kéo thả và tùy biến tiện ích trong giao diện đồ họa.

### 3.1. Tầng 1: Khối Nội Dung & Tương Tác Chính

#### Khối 1: Thương Hiệu & Lời Cảm Ơn
- **Blogger Section**: `<b:section id='footer-brand-section' name='Footer: Thương Hiệu & Lời Cảm Ơn' maxwidgets='1' showaddelement='yes'>`
- **Widget Type**: `HTML` (id: `HTML3` hoặc `Text2`)
- **Nội dung mặc định**:
  - Logo blog: `<a class='footer-brand-logo' href='/'>[Tên Blog]<span class='dot'>.</span></a>`
  - Lời cảm ơn: *"Cảm ơn bạn đã dành thời gian ghé thăm blog. Hy vọng những chia sẻ tại đây mang lại cho bạn chút cảm hứng, tri thức hữu ích hoặc sự đồng điệu trên hành trình khám phá và phát triển bản thân."*
- **Khả năng cấu hình**: Tác giả có thể vào Bố cục, mở widget này ra để sửa câu chữ lời cảm ơn tùy theo văn phong của mình, hoặc ẩn đi nếu không dùng.

#### Khối 2: Chính Sách & Pháp Lý
- **Blogger Section**: `<b:section id='footer-legal-section' name='Footer: Chính Sách & Pháp Lý' maxwidgets='1' showaddelement='yes'>`
- **Widget Type**: `LinkList` (id: `LinkList3`)
- **Tiêu đề Widget**: `⚖️ Chính Sách & Minh Bạch`
- **Danh sách link mặc định**:
  1. `Chính sách bảo mật (Privacy Policy)` -> `/p/chinh-sach-bao-mat.html`
  2. `Điều khoản dịch vụ (Terms of Service)` -> `/p/dieu-khoan.html`
  3. `Tuyên bố miễn trừ Affiliate` -> `/p/mien-tru-trach-nhiem.html`
  4. `Liên hệ & Hợp tác` -> `/p/lien-he.html`
- **Khả năng cấu hình**: Tác giả có thể thêm, bớt, đổi tên hoặc sửa đường dẫn các trang tĩnh trực tiếp bằng bảng danh sách của Blogger LinkList.

#### Khối 3: Nhận Bản Tin (Newsletter)
- **Blogger Section**: `<b:section id='footer-newsletter-section' name='Footer: Nhận Bản Tin' maxwidgets='1' showaddelement='yes'>`
- **Widget Type**: `HTML` (id: `HTML4`)
- **Tiêu đề Widget**: `📬 Nhận Bài Viết Mới`
- **Giao diện**:
  - Dòng mô tả ngắn: *"Nhận bài viết mới và các chiêm nghiệm giá trị qua email. Không spam."*
  - Ô nhập email + Nút `Đăng Ký`.
- **Khả năng cấu hình**: Tác giả có thể gạt tắt nếu chưa triển khai bản tin, hoặc dán mã nhúng form từ Substack, Mailchimp, Buttondown vào đây.

#### Khối 4: Mạng Xã Hội (Social Links)
- **Blogger Section**: `<b:section id='footer-social-section' name='Footer: Mạng Xã Hội' maxwidgets='1' showaddelement='yes'>`
- **Widget Type**: `LinkList` (id: `LinkList4`)
- **Tiêu đề Widget**: `🌐 Kết Nối`
- **Danh sách icon mặc định**:
  - `Facebook` (`f`), `X (Twitter)` (`𝕏`), `LinkedIn` (`in`), `YouTube` (`▶`), `RSS Feed` (`📶`).
- **Khả năng cấu hình**: Tác giả thêm đường dẫn trang cá nhân của mình vào danh sách link.

#### Khối 5: Tiện Ích Mời Cà Phê (Buy Me A Coffee - Kích Thước Nhỏ Gọn)
- **Blogger Section**: `<b:section id='footer-coffee-section' name='Footer: Mời Cà Phê (Buy Me a Coffee)' maxwidgets='1' showaddelement='yes'>`
- **Widget Type**: `HTML` (id: `HTML7`)
- **Vị trí bố trí**:
  - Tích hợp linh hoạt ngay bên dưới **Lời cảm ơn ở Cột 1** (vị trí chuyển đổi tự nhiên nhất sau khi người đọc cảm nhận sự chân thành của tác giả).
  - Hoặc có thể đặt gọn gàng ở **Cột 3** bên cạnh hộp Newsletter.
- **Quy chuẩn kích thước & Giao diện (Compact UI)**:
  - Thiết kế dạng **Mini Pill Badge / Compact Button** trang nhã, không chiếm dụng không gian:
    ```html
    <div class="footer-coffee-wrapper">
      <a class="btn-coffee-compact" href="https://buymeacoffee.com/yourname" target="_blank" rel="noopener noreferrer">
        <span class="coffee-icon">☕</span>
        <span class="coffee-label">Mời tôi ly cà phê</span>
      </a>
    </div>
    ```
  - **Styling**: Chiều cao tinh gọn `36px`, bo tròn góc `var(--radius-full)`, viền `1px solid var(--border-color)`, nền `var(--bg-surface)` hoặc màu vàng ấm `var(--coffee-bg, #fef3c7)`.
  - **Hiệu ứng hover**: Nhấc nhẹ `translateY(-2px)`, đổi màu ấm áp, hiển thị tooltip hoặc link ủng hộ.
  - Hỗ trợ tác giả chèn liên kết Buy Me a Coffee, Ko-fi, MoMo hoặc số tài khoản ngân hàng tùy ý. *(Xem chi tiết quy trình rút tiền Buy Me a Coffee qua Payoneer về ngân hàng Việt Nam tại [AI_CONTENT_PIPELINE_AND_ASSISTANT_SPECIFICATION.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/AI_CONTENT_PIPELINE_AND_ASSISTANT_SPECIFICATION.md#46-co-che-van-hanh--rut-tien-cua-buy-me-a-coffee-ve-viet-nam))*.
- **Khả năng cấu hình**: Có công tắc Bật/Tắt (Show this widget: ON/OFF) độc lập trong Blogger Layout. Khi tác giả chưa muốn nhận donate thì chỉ cần gạt Tắt.

---

### 3.2. Tầng 2: Điều Hướng Đáy Trang & Bản Quyền

Tầng 2 được bố trí thành một thanh ngang thanh mảnh (`.footer-bottom`), phân chia 3 cụm cân đối:

#### 1. Bên trái: Dòng Bản Quyền (Copyright)
- **Blogger Section**: `<b:section id='footer-copyright-section' name='Footer Tầng 2: Bản Quyền' maxwidgets='1' showaddelement='yes'>`
- **Widget Type**: `HTML` hoặc `Text` (id: `HTML5`)
- **Nội dung mặc định**: `© 2026 [Tên Blog]. Tất cả quyền được bảo lưu.`
- **Khả năng cấu hình**: Tác giả có thể chỉnh sửa câu chữ bản quyền hoặc chèn thêm câu slogan nhỏ tùy thích.

#### 2. Ở giữa: Bottom Navigation Menu
- **Blogger Section**: `<b:section id='footer-bottom-menu-section' name='Footer Tầng 2: Bottom Menu' maxwidgets='1' showaddelement='yes'>`
- **Widget Type**: `LinkList` (id: `LinkList5`)
- **Danh sách link mẫu (đồng bộ Header)**:
  - `Trang chủ` (`/`)
  - `Về tôi` (`/p/gioi-thieu.html`)
  - `Liên hệ` (`/p/lien-he.html`)
- **Trải nghiệm UX**: Độc giả sau khi cuộn hết bài không cần phải cuộn ngược hàng ngàn pixel lên đỉnh trang để tìm menu chuyển trang.
- **Khả năng cấu hình**: Thêm/sửa/xóa menu tự do bằng giao diện quản trị LinkList của Blogger.

#### 3. Bên phải: Nút "Về đầu trang" (Back to Top Button)
- **Cấu trúc HTML**:
  ```html
  <button class="scroll-top-btn" id="scroll-to-top" aria-label="Cuộn về đầu trang">
    <span>↑ Lên đầu trang</span>
  </button>
  ```
- **Hành vi JS**:
  ```javascript
  document.getElementById('scroll-to-top')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  ```
- **Styling**: Bo tròn (`radius-full`), viền nhẹ, hover chuyển màu chủ đạo `--primary`, chữ đậm thanh lịch.

---

### 3.3. Tầng 3: Khu Vực Quảng Cáo Chân Trang (Monetization Slot)

Tầng 3 được bố trí tách biệt ở dưới cùng của chân trang, được căn giữa trang trọng:
- **Blogger Section**: `<b:section id='footer-ads-section' name='Footer Tầng 3: Quảng Cáo Đáy Trang' maxwidgets='1' showaddelement='yes'>`
- **Widget Type**: `HTML` hoặc `AdSense` (id: `HTML6` hoặc `AdSense2`)
- **Kích thước hỗ trợ**:
  - Desktop: `728x90` (Leaderboard), `970x90` (Large Leaderboard) hoặc `Responsive`.
  - Mobile / Tablet: `320x100`, `300x250` hoặc tự động co giãn 100% chiều rộng.
- **Giao diện khi chưa dán code**:
  - Hiển thị khung placeholder trang nhã: `📣 Vùng Quảng Cáo Đáy Trang (AdSense / Sponsor Banner)`
- **Khả năng cấu hình**:
  - Khi chưa chạy quảng cáo: Tác giả chỉ cần gạt tắt **"Hiển thị tiện ích này"** trong Bố cục -> Toàn bộ Tầng 3 biến mất sạch sẽ, không để lại khoảng trống thừa.
  - Khi chạy quảng cáo: Dán mã script Google AdSense vào mục Nội dung là banner lập tức xuất hiện.

---

## 4. SƠ ĐỒ QUẢN TRỊ TRONG BLOGGER ADMIN (BỐ CỤC / LAYOUT)

Khi tác giả truy cập **Blogger Admin > Bố cục (Layout)**, khu vực Chân trang sẽ hiển thị trực quan theo đúng cây thư mục sau:

```text
========================================================================================
[BỐ CỤC BLOGGER] » KHU VỰC CHÂN TRANG (SITE FOOTER)
========================================================================================

▼ VÙNG FOOTER TẦNG 1: NỘI DUNG & TƯƠNG TÁC
  ├── [Sửa] Tiện ích: Thương Hiệu & Lời Cảm Ơn (HTML3)        [Bật/Tắt: ON]
  ├── [Sửa] Tiện ích: Mời Cà Phê Mini (HTML7)                [Bật/Tắt: TÙY CHỌN]
  ├── [Sửa] Tiện ích: Mục Chính Sách & Pháp Lý (LinkList3)    [Bật/Tắt: ON]
  ├── [Sửa] Tiện ích: Nhận Bản Tin Qua Email (HTML4)         [Bật/Tắt: ON]
  └── [Sửa] Tiện ích: Mạng Xã Hội (LinkList4)                 [Bật/Tắt: ON]

▼ VÙNG FOOTER TẦNG 2: ĐIỀU HƯỚNG & BẢN QUYỀN
  ├── [Sửa] Tiện ích: Dòng Bản Quyền (HTML5)                 [Bật/Tắt: ON]
  └── [Sửa] Tiện ích: Bottom Navigation Menu (LinkList5)      [Bật/Tắt: ON]
  * (Nút Lên đầu trang được tích hợp tự động)

▼ VÙNG FOOTER TẦNG 3: QUẢNG CÁO CHÂN TRANG
  └── [Sửa] Tiện ích: Banner Quảng Cáo Đáy Trang (HTML6)     [Bật/Tắt: TÙY CHỌN]
========================================================================================
```

---

## 5. ĐẶC TẢ GIAO DIỆN & ĐỘ THÍCH ỨNG (UI / RESPONSIVE SPECIFICATION)

### 5.1. Hệ màu & Design Tokens
Đồng bộ 100% với hệ thống biến giao diện của toàn theme:
* Nền Footer: `var(--bg-card)`
* Viền phân tách các tầng: `1px solid var(--border-color)`
* Màu chữ chính: `var(--text-main)`
* Màu chữ phụ/lời cảm ơn: `var(--text-muted)`
* Màu chữ bản quyền & ngày tháng: `var(--text-light)`
* Màu điểm nhấn (Hover, Nút submit, Dot logo): `var(--primary)`
* Nền input email: `var(--bg-input)`

### 5.2. Quy chuẩn Responsive (Đa thiết bị)

| Thiết bị | Màn hình | Bố cục Tầng 1 | Bố cục Tầng 2 | Bố cục Tầng 3 |
| :--- | :--- | :--- | :--- | :--- |
| **Desktop** | `>= 1024px` | 3 cột cân đối (`1.8fr 1.2fr 1.5fr`) | 3 cụm dàn ngang (Trái - Giữa - Phải) | Căn giữa banner 728px / 970px |
| **Tablet** | `768px – 1023px` | 2 hàng/cột thoáng đãng (`1fr 1fr`) | Bản quyền & Bottom menu dàn ngang | Banner responsive co giãn |
| **Mobile** | `< 768px` | Xếp chồng 1 cột dọc (`1fr`), căn lề đẹp | Xếp chồng 3 hàng dọc, căn giữa | Banner vuông 300x250 hoặc 320x100 |

### 5.3. Trải nghiệm tương tác (Micro-interactions)
1. **Logo hover**: Tên thương hiệu sáng nhẹ, dấu chấm `--primary` giữ nguyên nhận diện.
2. **Policy links hover**: Trượt nhẹ sang phải `3px`, đổi màu `--primary`.
3. **Social icons hover**: Nổi lên trên `translateY(-3px)`, nền chuyển sang màu chủ đạo, bóng mờ trang nhã.
4. **Back to top click**: Cuộn mượt với gia tốc tự nhiên (`behavior: 'smooth'`), đưa mắt người đọc trở về vị trí đầu trang.

---

## 6. TIÊU CHUẨN KIỂM THỬ & TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)

| Hạng mục | Tiêu chí kiểm thử nghiệm thu | Đánh giá |
| :--- | :--- | :---: |
| **Loại bỏ trùng lặp** | Không còn đoạn tiểu sử lặp lại; thay bằng Lời cảm ơn độc giả chân thành. | [ ] |
| **Không trùng chuyên mục** | Cột chuyên mục thừa được thay bằng Bottom Menu tinh gọn ở Tầng 2. | [ ] |
| **Widget Buy Me a Coffee** | Nút/Hộp cà phê nhỏ gọn hiển thị đẹp mắt, bấm chuyển tới trang ủng hộ; gạt tắt ẩn sạch sẽ. | [ ] |
| **Bật/Tắt Tầng 1** | Tắt thử widget Lời cảm ơn hoặc Bản tin trong Layout: Khu vực tự động co giãn cân đối. | [ ] |
| **Bật/Tắt Tầng 2** | Sửa link trong Bottom Menu: Giao diện cập nhật ngay lập tức mà không cần sửa code XML. | [ ] |
| **Bật/Tắt Tầng 3** | Gạt tắt widget Quảng cáo: Tầng 3 biến mất hoàn toàn, không để lại khoảng trống trắng. | [ ] |
| **Nút Về đầu trang** | Bấm nút "↑ Lên đầu trang": Màn hình cuộn mượt mà lên đỉnh trang trên cả Mobile và PC. | [ ] |
| **Dark Mode** | Toàn bộ 3 tầng đổi màu nền, màu chữ và viền chuẩn xác theo công tắc Dark/Light Mode. | [ ] |
| **Mobile UX** | Trên màn hình điện thoại 375px: Toàn bộ footer không bị tràn ngang, các nút bấm dễ chạm. | [ ] |
