# CẨM NANG HƯỚNG DẪN CẤU HÌNH & QUẢN TRỊ THEME
> Tài liệu hướng dẫn toàn diện dành cho Quản trị viên (Admin) và Tác giả nội dung. Giúp bạn khai thác tối đa mọi tính năng cao cấp của theme: Hệ thống Widget, Quy tắc gắn Nhãn (Labels), Đa ngôn ngữ (VI/EN), Minh bạch AI, và Trang Mục lục toàn thư.

---

## MỤC LỤC
1. [Chương 1: Quy Tắc Gắn Nhãn Bài Viết (Post Labels)](#chương-1-quy-tắc-gắn-nhãn-bài-viết-post-labels)
2. [Chương 2: Hệ Thống 4 Kiểu Widget Bài Viết Đặc Biệt](#chương-2-hệ-thống-4-kiểu-widget-bài-viết-đặc-biệt)
3. [Chương 3: Hướng Dẫn Cấu Hình Widget Có Sẵn](#chương-3-hướng-dẫn-cấu-hình-widget-có-sẵn)
4. [Chương 4: Cách Thêm Mới Widget Tùy Ý (+ Add a Gadget)](#chương-4-cách-thêm-mới-widget-tùy-ý--add-a-gadget)
5. [Chương 5: Thiết Lập Nội Dung Song Ngữ (Bilingual VI / EN)](#chương-5-thiết-lập-nội-dung-song-ngữ-bilingual-vi--en)
6. [Chương 6: Hệ Thống Nhãn Minh Bạch AI (AI Transparency)](#chương-6-hệ-thống-nhãn-minh-bạch-ai-ai-transparency)
7. [Chương 7: Tạo Trang Mục Lục Toàn Thư (Archive / Timeline Page)](#chương-7-tạo-trang-mục-lục-toàn-thư-archive--timeline-page)
8. [Chương 8: Gợi Ý Tiếp Thị Liên Kết Minh Bạch (Affiliate Box)](#chương-8-gợi-ý-tiếp-thị-liên-kết-minh-bạch-affiliate-box)

---

## CHƯƠNG 1: QUY TẮC GẮN NHÃN BÀI VIẾT (POST LABELS)

Khi viết bài trên Blogger, bạn nhập các nhãn ở cột bên phải (**Bài đăng -> Cài đặt bài đăng -> Nhãn / Labels**). Theme phân loại nhãn thành **4 nhóm chức năng rõ ràng**:

```
                            HỆ THỐNG NHÃN (LABELS)
                                      │
         ┌──────────────────┬─────────┴─────────┬──────────────────┐
         ▼                  ▼                   ▼                  ▼
   1. Nhãn Thường     2. Nhãn Độc Quyền    3. Nhãn Song Ngữ    4. Nhãn AI
     (Chủ đề feed)       (Bắt đầu bằng @)    (Dùng dấu |)     (Bắt đầu ai:)
```

### 1.1. Nhãn Chủ Đề Thường (Regular Labels)
* **Mục đích:** Phân loại bài viết chính trên blog, hiển thị trên **Thanh Chủ Đề (Category Tabs)** và trên từng thẻ bài viết.
* **Cách đặt:** Nhập chữ thông thường không có tiền tố đặc biệt.
* **Ví dụ:** `Triết lý`, `Sách hay`, `Công nghệ`, `Đời sống`

### 1.2. Nhãn Tính Năng Độc Quyền (Exclusive Feature Labels - Bắt đầu bằng `@`)
* **Mục đích:** Dành cho các bài viết ngắn, trích dẫn danh ngôn, hoặc tin nhanh mà bạn **CHỈ MUỐN HIỂN THỊ TRONG WIDGET**, không muốn bài này xuất hiện như một bài viết lớn ở dòng thời gian trang chủ (tránh làm rác feed).
* **Cơ chế thông minh:** Theme **tự động ẩn** tất cả các bài có nhãn `@` khỏi Feed trang chủ và thanh Category Tabs!
* **Bảng các nhãn `@` mặc định của theme:**
  | Tên Nhãn | Tương Ứng Với Widget | Mục Đích Sử Dụng |
  | :--- | :--- | :--- |
  | `@Tiêu điểm` | **🌟 Bài Viết Tiêu Điểm** | Bài viết quan trọng nhất tuần, làm nổi bật to ở đầu trang. |
  | `@Quote` | **☕ Trích Dẫn Chiêm Nghiệm** | Đoạn danh ngôn, trích dẫn sâu sắc (hiển thị ngẫu nhiên). |
  | `@Nổi bật` | **🔥 Bài Viết Nổi Bật** | Danh sách bài viết chọn lọc nhiều lượt đọc nhất. |
  | `@Điểm tin` | **⚡ Điểm Tin Mỗi Ngày** | Các tin vắn, cập nhật nhanh theo dạng thẻ card. |

> **Mẹo hay:** Nếu bạn muốn một bài viết **vừa hiện ở widget Tiêu điểm, vừa hiện bình thường ở trang chủ**, chỉ cần gắn 2 nhãn: `@Tiêu điểm, Sách hay`.

### 1.3. Nhãn Song Ngữ (Bilingual Labels)
* **Cú pháp:** `Tên Tiếng Việt | English Name`
* **Ví dụ:** `Triết Lý | Philosophy`, `Kỹ Năng | Skills`
* **Hiển thị:** Khi người đọc bấm nút chuyển ngôn ngữ **EN**, nhãn sẽ tự động đổi sang tiếng Anh.

---

## CHƯƠNG 2: HỆ THỐNG 4 KIỂU WIDGET BÀI VIẾT ĐẶC BIỆT

Theme hỗ trợ 4 kiểu dáng widget (patterns) được thiết kế theo phong cách tạp chí cao cấp:

| Kiểu (Pattern) | Tên Gọi | Mô Tả Giao Diện |
| :---: | :--- | :--- |
| **`spotlight`** | **Tiêu Điểm** | 1 bài viết to bản, ảnh bìa nổi bật, huy hiệu chủ đề, nút đọc ngay. Thích hợp đặt ở đầu trang hoặc đầu sidebar. |
| **`ranked`** | **Xếp Hạng** | Danh sách bài viết được đánh số thứ tự lớn trang trọng `01`, `02`, `03`... Thích hợp cho Top bài đọc nhiều. |
| **`quote`** | **Trích Dẫn** | Khung danh ngôn chiêm nghiệm thanh lịch, font serif, icon mở ngoặc kép tinh tế. |
| **`digest`** | **Điểm Tin** | Lưới thẻ card nhỏ gọn, có thumbnail, ngày tháng và tóm tắt nhanh. |

---

## CHƯƠNG 3: HƯỚNG DẪN CẤU HÌNH WIDGET CÓ SẴN

Trong trang **Bố cục (Layout)** của Blogger, theme đã bố trí sẵn các widget tại các vị trí đẹp nhất:
1. `main-above-feed`: Đầu luồng bài viết (🌟 Bài Viết Tiêu Điểm Tuần)
2. `main-in-feed-section`: Xen kẽ giữa các bài viết (☕ Trích Dẫn Chiêm Nghiệm)
3. `main-special-posts-section`: Dưới luồng bài viết chính (📊 Top Bài Đọc Nhiều)
4. `sidebar-section`: Cột bên phải (Bài nổi bật, Chiêm nghiệm, Điểm tin, Tiêu điểm)

### Cách Tùy Chỉnh Widget:
Bấm nút hình **Cây bút (Chỉnh sửa / Edit)** tại widget cần sửa:

```
┌──────────────────────────────────────────────┐
│ Configure HTML/JavaScript                    │
│                                              │
│ Title:    [ ☕ Trích Dẫn Chiêm Nghiệm      ] │
│ Content:  [                                ] │
│                                              │
│          [REMOVE]    [CANCEL]    [SAVE]      │
└──────────────────────────────────────────────┘
```

* **Ô Title:** Đổi tên hiển thị trên blog tùy ý.
* **Ô Content:** 
  * **Nếu để TRỐNG:** Widget tự động chạy theo cấu hình mặc định (lấy nhãn `@` tương ứng).
  * **Nếu muốn đổi sang nhãn khác:** Click vào ô `Content` và gõ thẳng tên nhãn:
    * Gõ: `Triết lý` (lọc bài có nhãn Triết lý)
    * Gõ: `Sách, Đời sống` (lọc nhiều nhãn)
    * Gõ: `Triết lý | limit: 3` (lấy đúng 3 bài)
  * Bấm **SAVE** là xong!

---

## CHƯƠNG 4: CÁCH THÊM MỚI WIDGET TÙY Ý (+ ADD A GADGET)

Bạn có thể thêm **bao nhiêu widget tùy thích** vào bất kỳ vị trí nào có nút **"+ Thêm tiện ích"** (+ Add a Gadget) theo 2 cách cực kỳ nhanh:

### Cách 1: Gõ Cú Pháp Ngắn (Khuyên Dùng)
1. Bấm **"+ Thêm tiện ích"** ➔ Chọn **"HTML/JavaScript"**.
2. Nhập **Title** (Tên widget của bạn).
3. Trong ô **Content**, chỉ cần gõ đúng 1 dòng theo bảng dưới đây:

| Bạn Muốn Tạo Kiểu Gì? | Gõ Cú Pháp Này Vào Ô Content |
| :--- | :--- |
| **Trích dẫn ngẫu nhiên** | `pattern: quote \| label: Triết lý` |
| **Lưới điểm tin (4 bài)** | `pattern: digest \| label: Công nghệ \| limit: 4` |
| **Top bài đọc nhiều (Ranked)**| `pattern: ranked` *(hoặc `pattern: ranked \| label: Sách`)* |
| **1 bài tiêu điểm nổi bật** | `pattern: spotlight \| label: Tiêu điểm` |

4. Bấm **SAVE**. Theme sẽ tự động chuyển đổi thành widget bài viết tương ứng!

### Cách 2: Sao Chép Mã Trực Quan Từ Trang Preview (`preview.html`)
1. Mở file `src/preview.html` trên máy tính bằng trình duyệt.
2. Cuộn xuống phần **Bộ Tạo Mã Tiện Ích (Interactive Playground)**:
   * Chọn kiểu giao diện (Spotlight, Ranked, Quote, Digest).
   * Nhập tên nhãn, số lượng bài, bật/tắt ảnh thu nhỏ.
3. Bấm nút **"Sao chép mã widget"**.
4. Mở widget trên Blogger, dán mã HTML đó vào ô **Content** ➔ Bấm **SAVE**.

---

## CHƯƠNG 5: THIẾT LẬP NỘI DUNG SONG NGỮ (BILINGUAL VI / EN)

Theme tích hợp sẵn bộ chuyển đổi ngôn ngữ trơn tru giữa Tiếng Việt (mặc định) và Tiếng Anh.

### 5.1. Với nội dung ngắn (Tiêu đề menu, Tên widget, Tên nhãn)
Sử dụng dấu gạch đứng `|`:
```text
Trang Chủ | Home
Góc Nhìn | Perspectives
Bài Viết Nổi Bật | Featured Posts
```

### 5.2. Với nội dung dài (Bài viết chi tiết, Giới thiệu tác giả, Footer)
Sử dụng 2 khối thẻ `div` tương ứng:
```html
<div data-lang="vi">
  <p>Chào mừng bạn đến với blog Trà Đá Triết Lý. Nơi chia sẻ những suy ngẫm sâu sắc về cuộc sống.</p>
</div>

<div data-lang="en">
  <p>Welcome to Tra Da Philosophy. A sanctuary for deep reflections and meaningful living.</p>
</div>
```
*Trình duyệt sẽ tự động ẩn khối tiếng Anh khi người đọc chọn Tiếng Việt và ngược lại.*

---

## CHƯƠNG 6: HỆ THỐNG NHÃN MINH BẠCH AI (AI TRANSPARENCY)

Theme tuân thủ tiêu chuẩn đạo đức AI và minh bạch nội dung cho độc giả:

### 6.1. Các nhãn AI được hỗ trợ:
Khi bài viết có sự tham gia của AI, gắn 1 trong các nhãn sau:

| Tên Nhãn Bài Viết | Mức Độ Minh Bạch | Ý Nghĩa Hiển Thị Trên Blog |
| :--- | :---: | :--- |
| `ai:generated` | 🤖 AI Tạo Lập | Bài viết do AI tạo ra phần lớn nội dung dưới sự định hướng của tác giả. |
| `ai:assisted` | ✨ AI Hỗ Trợ | Tác giả tự viết, AI hỗ trợ chỉnh sửa ngữ pháp, dàn ý hoặc dịch thuật. |
| `ai:none` | ✍️ 100% Con Người | Tác phẩm sáng tác thủ công hoàn toàn, không sử dụng công cụ AI. |

> **Đặc điểm:** Toàn bộ nhãn có tiền tố `ai:` sẽ **tự động ẩn khỏi thanh menu Category Tabs** để giữ thanh chủ đề luôn gọn gàng, đồng thời tự động kích hoạt **Huy hiệu Minh Bạch AI** và cửa sổ giải trình chi tiết khi bạn đọc click vào!

---

## CHƯƠNG 7: TẠO TRANG MỤC LỤC TOÀN THƯ (ARCHIVE / TIMELINE PAGE)

Theme có sẵn ứng dụng tìm kiếm bài viết và cây thư mục thời gian (Timeline) cực kỳ hiện đại.

### Cách Thiết Lập:
1. Vào trang quản trị Blogger ➔ Chọn mục **Trang (Pages)** ➔ Bấm **+ Trang mới**.
2. Đặt Tiêu đề trang: `Mục Lục Toàn Thư` (hoặc `Archive`).
3. Cột bên phải mục **Đường dẫn cố định (Permalink)**: Chọn *Đường dẫn cố định tùy chỉnh*, đặt tên là:
   ```text
   muc-luc
   ```
   *(Đường dẫn hoàn chỉnh sẽ là `.../p/muc-luc.html`)*
4. Bấm **Xuất bản (Publish)**.
5. **Hoàn thành!** Theme sẽ tự động biến trang này thành một ứng dụng Mục lục thông minh với thanh tìm kiếm thời gian thực, bộ đếm bài viết và phân loại theo năm.

---

## CHƯƠNG 8: GỢI Ý TIẾP THỊ LIÊN KẾT MINH BẠCH (AFFILIATE BOX)

Khi bạn muốn giới thiệu một cuốn sách hoặc sản phẩm tâm đắc trong bài viết kèm liên kết affiliate, hãy dán đoạn mã sau vào bài viết (ở chế độ xem HTML):

```html
<aside class="affiliate-box" aria-label="Gợi ý sản phẩm">
  <div class="affiliate-disclosure">
    <span>ℹ️ Liên kết minh bạch: Blog có thể nhận được một khoản hoa hồng nhỏ nếu bạn mua qua link này mà không tốn thêm bất kỳ chi phí nào.</span>
  </div>
  <div class="affiliate-card">
    <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200" alt="Tên sách" class="affiliate-thumb" />
    <div class="affiliate-info">
      <h4 class="affiliate-title">Chủ Nghĩa Khắc Kỷ — Từ Zeno Đến Marcus Aurelius</h4>
      <p class="affiliate-desc">Cuốn cẩm nang thực hành giúp bạn làm chủ tâm trí và sống an yên giữa cuộc đời biến động.</p>
      <a href="https://example.com/affiliate-link" target="_blank" rel="sponsored noopener" class="affiliate-btn">
        Xem cuốn sách này ↗
      </a>
    </div>
  </div>
</aside>
```

---

## BẢNG TỔNG HỢP TRA CỨU NHANH (CHEATSHEET)

| Thao Tác Cần Thực Hiện | Cách Làm Nhanh Nhất |
| :--- | :--- |
| **Đổi chế độ Sáng / Tối / Bạc hà** | Bấm nút công tắc 3 nấc `☀️` / `🌙` / `🍃` ở góc trên bên phải. |
| **Chuyển đổi Tiếng Việt / Tiếng Anh** | Bấm nút chuyển đổi `VI` / `EN` trên thanh điều hướng. |
| **Đưa bài viết lên vị trí Tiêu Điểm** | Gắn nhãn `@Tiêu điểm` cho bài viết đó. |
| **Biến bài viết thành Trích Dẫn ngẫu nhiên** | Gắn nhãn `@Quote` cho bài viết đó. |
| **Ẩn bài viết ngắn khỏi Trang Chủ** | Gắn bất kỳ nhãn nào bắt đầu bằng ký tự `@` (VD: `@Quote`, `@TinNhanh`). |
| **Khai báo bài viết có AI hỗ trợ** | Gắn nhãn `ai:assisted`. |
| **Tạo menu song ngữ** | Nhập tên liên kết dạng `Tên Việt \| English Name`. |
| **Đổi nhãn cho widget** | Mở widget trong Bố cục, gõ tên nhãn vào ô `Content` (VD: `Sách hay`). |
| **Thêm widget mới** | Bấm `+ Thêm tiện ích` ➔ Chọn `HTML/JavaScript` ➔ Ô Content gõ `pattern: digest \| label: TênNhãn`. |
