# CẨM NANG HƯỚNG DẪN CẤU HÌNH & QUẢN TRỊ THEME
> Tài liệu hướng dẫn toàn diện dành cho Quản trị viên (Admin) và Tác giả nội dung. Giúp bạn khai thác tối đa mọi tính năng cao cấp của theme: Hệ thống Widget Bài viết, Chuỗi Chuyên đề (Series), Quy tắc gắn Nhãn (Labels), Tác giả Khách mời (Guest Author), Trang Liên hệ & Gửi bài, Đa ngôn ngữ (VI/EN), Minh bạch AI, Giao diện Theme Preset (Airy Pastel), và Trang Mục lục Tàu điện ngầm (Subway Timeline Archive).

---

## MỤC LỤC
1. [Chương 1: Quy Tắc Gắn Nhãn Bài Viết (Post Labels)](#chương-1-quy-tắc-gắn-nhãn-bài-viết-post-labels)
2. [Chương 2: Hệ Thống 5 Kiểu Widget Bài Viết Đặc Biệt](#chương-2-hệ-thống-5-kiểu-widget-bài-viết-đặc-biệt)
3. [Chương 3: Hướng Dẫn Cấu Hình Widget Có Sẵn Qua Trường "Content"](#chương-3-hướng-dẫn-cấu-hình-widget-có-sẵn-qua-trường-content)
4. [Chương 4: Cách Thêm Mới Widget Tùy Ý (+ Add a Gadget)](#chương-4-cách-thêm-mới-widget-tùy-ý--add-a-gadget)
5. [Chương 5: Chuỗi Bài Viết & Chuyên Đề (Post Series Navigator - `series:`)](#chương-5-chuỗi-bài-viết--chuyên-đề-post-series-navigator---series)
6. [Chương 6: Quản Lý Tác Giả Khách Mời (Guest Author Meta)](#chương-6-quản-lý-tác-giả-khách-mời-guest-author-meta)
7. [Chương 7: Trang Liên Hệ & Gửi Bài Viết Khách Mời (`/p/lien-he.html`) & 4 Vị Trí CTA](#chương-7-trang-liên-hệ--gửi-bài-viết-khách-mời-plien-hehtml--4-vị-trí-cta)
8. [Chương 8: Tạo Trang Mục Lục Toàn Thư (Subway Metro Timeline Archive v5.0)](#chương-8-tạo-trang-mục-lục-toàn-thư-subway-metro-timeline-archive-v50)
9. [Chương 9: Thiết Lập Nội Dung Song Ngữ (Bilingual VI / EN)](#chương-9-thiết-lập-nội-dung-song-ngữ-bilingual-vi--en)
10. [Chương 10: Hệ Thống Nhãn Minh Bạch AI (AI Transparency)](#chương-10-hệ-thống-nhãn-minh-bạch-ai-ai-transparency)
11. [Chương 11: Cấu Hình Phong Cách Giao Diện (Theme Presets & Dark/Light Mode)](#chương-11-cấu-hình-phong-cách-giao-diện-theme-presets--darklight-mode)
12. [Chương 12: Thanh Tiến Trình Đọc & Mục Lục Bài Viết Tự Động (Auto TOC)](#chương-12-thanh-tiến-trình-đọc--mục-lục-bài-viết-tự-động-auto-toc)
13. [Chương 13: Gợi Ý Tiếp Thị Liên Kết Minh Bạch (Affiliate Box)](#chương-13-gợi-ý-tiếp-thị-liên-kết-minh-bạch-affiliate-box)
14. [Chương 14: Cấu Hình Component Ẩn, Nút Cà Phê & Điểm Chạm (Widget `HTML88`)](#chương-14-cấu-hình-component-ẩn-nút-cà-phê--điểm-chạm-widget-html88)
15. [Chương 15: Quản Lý & Bật/Tắt Vị Trí Quảng Cáo (AdSense & Banners)](#chương-15-quản-lý--bậttắt-vị-trí-quảng-cáo-adsense--banners)
16. [Chương 16: Tiện Ích Video & Voice Reels Nổi Bật (Video & Reels Showcase Widget)](#chương-16-tiện-ích-video--voice-reels-nổi-bật-video--reels-showcase-widget)
17. [Bảng Tổng Hợp Tra Cứu Nhanh & Xử Lý Bộ Nhớ Đệm (Cheatsheet & Cache)](#bảng-tổng-hợp-tra-cứu-nhanh--xử-lý-bộ-nhớ-đệm-cheatsheet--cache)

---

## CHƯƠNG 1: QUY TẮC GẮN NHÃN BÀI VIẾT (POST LABELS)

Khi viết bài trên Blogger, bạn nhập các nhãn ở cột bên phải (**Bài đăng -> Cài đặt bài đăng -> Nhãn / Labels**). Theme phân loại nhãn thành **5 nhóm chức năng rõ ràng**:

```
                                HỆ THỐNG NHÃN (LABELS)
                                          │
       ┌──────────────────┬───────────────┼───────────────┬──────────────────┐
       ▼                  ▼               ▼               ▼                  ▼
 1. Nhãn Thường     2. Nhãn Độc Quyền  3. Nhãn Chuyên Đề  4. Nhãn Song Ngữ   5. Nhãn AI
   (Chủ đề feed)     (Bắt đầu bằng @)  (Bắt đầu series:)  (Dùng dấu |)     (Bắt đầu ai:)
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
  | `@video` | **🎬 Video & Reels Nổi Bật** | Bài viết chứa link video/audio, hiển thị trong widget Reels Showcase. |
  | `@video-hot` / `@hotvideo` | **🔥 Video Chiến Dịch Bán Chéo** | Video ưu tiên bán chéo, sẽ xuất hiện ở vị trí 1-2 trong widget Reels. |

> **Mẹo hay:** Nếu bạn muốn một bài viết **vừa hiện ở widget Tiêu điểm, vừa hiện bình thường ở trang chủ**, chỉ cần gắn 2 nhãn: `@Tiêu điểm, Sách hay`.

### 1.3. Nhãn Chuỗi Chuyên Đề (Post Series Labels - Bắt đầu bằng `series:`)
* **Mục đích:** Nhóm các bài viết thuộc cùng một chuỗi bài/chuyên đề nhiều phần (ví dụ: Chuỗi 5 bài về Chủ nghĩa Khắc kỷ).
* **Cú pháp:** `series:Tên Chuyên Đề` (hoặc `series:tên-chuyên-đề`)
* **Ví dụ:** `series:Triết Lý Khắc Kỷ`, `series:Kỹ Năng Viết Lách`
* **Cơ chế tự động:** Khi gắn nhãn này, theme sẽ tự động kích hoạt **Bộ điều hướng Chuyên đề (Post Series Navigator)** dưới bài viết và cho phép hiển thị widget chuỗi chuyên đề (`pattern: series`).

### 1.4. Nhãn Song Ngữ (Bilingual Labels)
* **Cú pháp:** `Tên Tiếng Việt | English Name`
* **Ví dụ:** `Triết Lý | Philosophy`, `Kỹ Năng | Skills`
* **Hiển thị:** Khi người đọc bấm nút chuyển ngôn ngữ **EN**, nhãn sẽ tự động đổi sang tiếng Anh.

### 1.5. Nhãn Minh Bạch AI (AI Transparency Labels - Bắt đầu bằng `ai:`)
* **Mục đích:** Khai báo và minh bạch mức độ can thiệp/hỗ trợ của Trí tuệ nhân tạo (AI) trong quá trình sáng tạo nội dung.
* **Cơ chế hoạt động:**
  * **Ẩn khỏi Thanh Chủ Đề:** Theme tự động loại trừ các nhãn `ai:` khỏi thanh Category Tabs để không làm rối menu chủ đề chính.
  * **Tự động gắn Huy hiệu (Badge):** Tự động render huy hiệu minh bạch ngay dưới tiêu đề bài viết (ở cả Feed trang chủ và trang đọc chi tiết).
  * **Kích hoạt Modal giải trình:** Khi người đọc bấm vào huy hiệu, cửa sổ popup hiển thị giải trình chi tiết về vai trò của con người và AI.
* **Bảng đầy đủ 6 nhãn AI được hỗ trợ:**
  | Tên Nhãn Nhập Vào | Huy Hiệu Hiển Thị | Tỷ Lệ AI | Ý Nghĩa Sử Dụng |
  | :--- | :---: | :---: | :--- |
  | `ai:generated` *(hoặc `AI-Generated`)* | ⚡ AI Tạo Lập | ~80-100% | Nội dung do AI khởi tạo hoàn toàn theo prompt/định hướng của tác giả. |
  | `ai:contributed` *(hoặc `AI-Contributed`)* | ✨ AI Đóng Góp | ~50-80% | AI trực tiếp nghiên cứu và xây dựng các đoạn nội dung chính dưới sự chỉ đạo của tác giả. |
  | `ai:assisted` *(hoặc `AI-Assisted`)* | ✨ AI Hỗ Trợ | ~20-50% | Tác giả tự viết, AI hỗ trợ tra cứu, sắp xếp thông tin, dàn ý hoặc ngữ pháp. |
  | `ai:product` *(hoặc `AI-Product`)* | 🤖 Sản Phẩm AI | N/A | Bài viết đánh giá, review thực tế về một công cụ hoặc sản phẩm AI. |
  | `ai:translated` *(hoặc `AI-Translated`)* | 🌐 AI Dịch Thuật | N/A | Bản dịch ngôn ngữ (VI ↔ EN) được thực hiện bởi công cụ AI dịch thuật. |
  | `ai:none` *(hoặc `AI-None`)* | ✍️ 100% Con Người | 0% | Bài viết sáng tác thủ công hoàn toàn, không sử dụng công cụ AI sinh nội dung. |

---

## CHƯƠNG 2: HỆ THỐNG 5 KIỂU WIDGET BÀI VIẾT ĐẶC BIỆT

Theme hỗ trợ **5 kiểu dáng widget (patterns)** được thiết kế theo phong cách tạp chí cao cấp:

| Kiểu (Pattern) | Tên Gọi | Mô Tả Giao Diện |
| :---: | :--- | :--- |
| **`spotlight`** | **Tiêu Điểm** | 1 bài viết to bản, ảnh bìa nổi bật, huy hiệu chủ đề, nút đọc ngay. Thích hợp đặt ở đầu trang hoặc đầu sidebar. |
| **`ranked`** | **Xếp Hạng** | Danh sách bài viết được đánh số thứ tự lớn trang trọng `01`, `02`, `03`... Thích hợp cho Top bài đọc nhiều. |
| **`quote`** | **Trích Dẫn** | Khung danh ngôn chiêm nghiệm thanh lịch, font serif, icon mở ngoặc kép tinh tế. |
| **`digest`** | **Điểm Tin** | Lưới thẻ card nhỏ gọn, có thumbnail, ngày tháng và tóm tắt nhanh. |
| **`series`** | **Chuỗi Chuyên Đề** | Khung trình diễn chuyên đề series kèm lộ trình các phần, thanh tiến trình và liên kết từng bài. |

---

## CHƯƠNG 3: HƯỚNG DẪN CHI TIẾT CẤU HÌNH WIDGET QUA TRƯỜNG "CONTENT"

Trong trang **Bố cục (Layout)** của Blogger, theme đã bố trí sẵn các vị trí widget đẹp nhất:
1. `main-above-feed`: Đầu luồng bài viết (🌟 Bài Viết Tiêu Điểm Tuần - Spotlight)
2. `main-in-feed-section`: Xen kẽ giữa các bài viết sau bài số 3 (☕ Trích Dẫn Chiêm Nghiệm - Quote)
3. `main-special-posts-section`: Dưới luồng bài viết chính (📊 Top Bài Đọc Nhiều - Ranked)
4. `sidebar-section`: Cột bên phải (Bài nổi bật, Chiêm nghiệm, Điểm tin, Tiêu điểm, Chuyên đề)

Khi bạn bấm nút hình **Cây bút (Chỉnh sửa / Edit)** tại bất kỳ widget nào:
* **Ô Title:** Đổi tiêu đề hiển thị trên blog.
* **Ô Content:** Nơi cấu hình tất cả các tùy chọn theo cú pháp ngắn gọn hoặc mã HTML nhúng.

---

### 3.1. Bảng Tổng Hợp Tất Cả Các Tham Số Cấu Hình

Mọi tùy chọn trên bộ điều khiển Interactive Playground của trang Preview đều có thể thiết lập trực tiếp thông qua ô **Content**:

| Tham Số | Thuộc Tính HTML Tương Ứng | Giá Trị Mặc Định | Giá Trị Hợp Lệ | Mô Tả Tác Dụng |
| :--- | :--- | :---: | :--- | :--- |
| **`pattern`** | `data-pattern` | `digest` | `spotlight`, `ranked`, `quote`, `digest`, `series` | Kiểu dáng giao diện hiển thị của widget. |
| **`label`** | `data-labels` | Theo widget | Tên nhãn (VD: `Triết lý`, `series:Khắc Kỷ`) | Lọc bài viết theo một hoặc nhiều nhãn chủ đề. |
| **`limit`** | `data-limit` | `1` đến `6` | Số nguyên từ `1` đến `10` | Số lượng bài viết hiển thị tối đa trong widget. |
| **`sort`** | `data-sort` | `latest` | `latest`, `random`, `views` (hoặc `popular`) | Tiêu chí sắp xếp (Mới nhất, Ngẫu nhiên, Đọc nhiều nhất). |
| **`timeRange`** | `data-time-range` | `all_time` | `all_time`, `last_year`, `last_30_days`, `last_7_days` | Khoảng thời gian tính lượt xem (khi sort là `views`). |
| **`thumb`** | `data-show-thumbnail` | `true` | `true`, `false` | Bật hoặc tắt hiển thị ảnh đại diện (thumbnail). |
| **`snippet`** | `data-show-snippet` | `true` | `true`, `false` | Bật hoặc tắt đoạn trích dẫn tóm tắt bài viết. |
| **`viewall`** | `data-view-all-text` | `Xem tất cả »` | Chuỗi văn bản tùy ý (VD: `Đọc thêm →`) | Chữ hiển thị trên nút liên kết ở cuối widget. |
| **`posts`** | `data-posts` | Trống | Danh sách link bài viết cách nhau dấu phẩy | **Chế độ chọn đích danh bài viết** (Handpicked URLs). |
| **`title`** | `data-title` | Lấy từ Title | Chuỗi văn bản tùy ý | Tiêu đề tùy biến ghi đè cho widget. |
| **`insertAfter`** | `data-insert-after` | `3` | Số nguyên | Vị trí bài viết để chèn xen kẽ (chỉ dùng cho In-Feed). |

---

### 3.2. Chi Tiết 5 Loại Widget & Mẫu Cấu Hình Cho Từng Loại

#### 🌟 1. Kiểu Tiêu Điểm (`pattern: spotlight`)
* **Mục đích:** Tạo điểm nhấn thị giác lớn cho bài viết then chốt của tuần/tháng (Editor's Choice), thường đặt ở đầu trang chủ (`main-above-feed`) hoặc đầu thanh Sidebar.
* **Cú pháp ô Content:** `label: Góc nhìn | thumb: true | snippet: true | viewall: Khám phá ngay »`
* **Mã HTML mẫu:**
  ```html
  <div class="special-posts-widget"
       data-pattern="spotlight"
       data-labels="Góc nhìn"
       data-limit="1"
       data-show-thumbnail="true"
       data-show-snippet="true"
       data-view-all-text="Khám phá ngay »">
  </div>
  ```

---

#### 🏆 2. Kiểu Bảng Xếp Hạng (`pattern: ranked`)
* **Mục đích:** Vinh danh các bài viết được đọc nhiều nhất hoặc các bài viết hay nhất được tuyển chọn theo thứ bậc.
* **Cú pháp ô Content:** `sort: views | timeRange: last_30_days | limit: 5`
* **Mã HTML mẫu:**
  ```html
  <div class="special-posts-widget"
       data-pattern="ranked"
       data-labels="Sách"
       data-sort="views"
       data-time-range="last_30_days"
       data-limit="5"
       data-show-thumbnail="true"
       data-view-all-text="Xem bảng xếp hạng đầy đủ »">
  </div>
  ```

---

#### ☕ 3. Kiểu Trích Dẫn Chiêm Nghiệm (`pattern: quote`)
* **Mục đích:** Hiển thị một đoạn trích dẫn tâm đắc, lời hay ý đẹp hoặc một mẩu suy ngẫm triết lý sâu sắc được trích ra từ các bài viết.
* **Cú pháp ô Content:** `label: Triết lý | sort: random`
* **Nhập trích dẫn trực tiếp trong ô Content:** Bạn có thể gõ trực tiếp câu danh ngôn vào ô Content mà không cần tạo bài viết Blogger:
  `"Sự đơn giản là đỉnh cao của tinh tế." - Leonardo da Vinci`

---

#### ⚡ 4. Kiểu Điểm Tin & Xu Hướng (`pattern: digest`)
* **Mục đích:** Hiển thị danh sách các bài viết vắn tắt, cập nhật tin tức nhanh, ghi chú ngắn theo dạng thẻ card hiện đại.
* **Cú pháp ô Content:** `label: Công nghệ | limit: 4`
* **Mã HTML mẫu:**
  ```html
  <div class="special-posts-widget"
       data-pattern="digest"
       data-labels="Công nghệ"
       data-limit="4"
       data-sort="latest"
       data-show-thumbnail="true"
       data-show-snippet="true">
  </div>
  ```

---

#### 📚 5. Kiểu Chuỗi Chuyên Đề (`pattern: series`)
* **Mục đích:** Hiển thị một chuyên đề series cụ thể ngay trên Sidebar hoặc trang chủ dưới dạng card chuyên đề chuyên nghiệp.
* **Cú pháp ô Content:** `pattern: series | label: series:Triết Lý Khắc Kỷ`
* **Mã HTML mẫu:**
  ```html
  <div class="special-posts-widget"
       data-pattern="series"
       data-labels="series:Triết Lý Khắc Kỷ"
       data-view-all-text="Xem toàn bộ chuyên đề »">
  </div>
  ```

---

### 3.3. Tính Năng Cao Cấp: Chọn Đích Danh Bài Viết Bằng URL (Handpicked Posts)
Nếu bạn không muốn lọc theo nhãn mà muốn **chỉ định chính xác tuyệt đối các bài viết** đưa lên widget:
* Nhập danh sách link bài viết (phân tách bởi dấu phẩy) vào ô `Content`:
  ```text
  posts: https://myblog.blogspot.com/2026/09/bai-viet-1.html, https://myblog.blogspot.com/2026/09/bai-viet-2.html
  ```

---

### 3.4. Cấu Hình Widget Ảnh Bìa & Tác Giả (Profile Cover Hero)
Khu vực ảnh bìa to bản và thông tin tác giả nằm ở đầu blog (trong khu vực **Ảnh Bìa & Tác Giả**). Theme đã tách bạch sẵn **3 tiện ích riêng biệt**:

1. **Tải Ảnh Bìa Banner (Widget `Image1` — `🖼️ 1. Tải Lên Ảnh Bìa Banner`):** Bấm chỉnh sửa ➔ Tải hình ảnh lên từ máy tính ➔ Lưu.
2. **Tải Avatar Tròn Tác Giả (Widget `Image2` — `👤 2. Tải Lên Avatar Tác Giả`):** Bấm chỉnh sửa ➔ Tải hình ảnh đại diện ➔ Lưu.
3. **Cài Đặt Tên & Lời Giới Thiệu (Widget `HTML1` — `✍️ 3. Tên & Lời Giới Thiệu Tác Giả`):**
   * **Tiêu đề (Title):** Nhập tên tác giả (VD: `Nam Trương`).
   * **Nội dung (Content):** Nhập lời giới thiệu tự nhiên.
   * **Tùy chọn nâng cao:** `banner: https://link-anh-bia.jpg | avatar: https://link-avatar.jpg | bio: Lời giới thiệu | name: Tên của bạn`

---

### 3.5. Cơ Chế Smart Fallback Tự Động
* **Tự động lấy bài mới nhất:** Nếu widget lọc nhãn `@` chưa có bài viết, theme sẽ tự động lấy bài mới nhất lấp đầy.
* **Trích dẫn dự phòng:** Widget `quote` tự động hiển thị câu danh ngôn mặc định nếu chưa có bài gắn nhãn `@Quote`.
* **Dự phòng Menu & Danh mục:** Đảm bảo giao diện luôn đầy đủ cấu trúc kể cả với blog mới khởi tạo.

---

### 3.6. Quản Lý Menu & Thanh Chủ Đề (Widget LinkList & Label)

| Widget | Vị Trí Trong Bố Cục | Chức Năng & Cách Cấu Hình |
| :--- | :--- | :--- |
| **`LinkList1`** | Header (`🧭 Menu Điều Hướng Chính`) | Thêm/Sửa/Xoá menu. Dùng gạch dưới `_` ở đầu tên để tạo Submenu đổ xuống (VD: `_Trải Nghiệm Sống`). |
| **`Label1`** | Dưới Banner (`🏷️ Thanh Chủ Đề`) | **Tự động 100%**: Mọi nhãn bài viết mới sẽ tự xuất hiện. Theme tự động lọc bỏ nhãn `@`, `series:` và `ai:`. |
| **`LinkList3`** | Footer Cột 2 | Các trang chính sách, điều khoản, liên hệ. |
| **`LinkList4`** | Footer Cột 3 | Mạng xã hội. Tự chọn màu thương hiệu và icon tròn theo tên (Facebook, X, GitHub, YouTube, Instagram). |
| **`LinkList5`** | Footer Tầng 2 (Thanh đáy) | Menu phụ tinh gọn (Trang chủ, Mục lục, RSS). |

---

## CHƯƠNG 4: CÁCH THÊM MỚI WIDGET TÙY Ý (+ ADD A GADGET)

Bạn có thể thêm widget mới bằng 2 cách:

### Cách 1: Gõ Cú Pháp Ngắn (Khuyên Dùng)
1. Bấm **"+ Thêm tiện ích"** ➔ Chọn **"HTML/JavaScript"**.
2. Nhập **Title** (Tên widget).
3. Ô **Content** gõ đúng 1 dòng:
   * **Trích dẫn:** `pattern: quote | label: Triết lý`
   * **Điểm tin:** `pattern: digest | label: Công nghệ | limit: 4`
   * **Top đọc nhiều:** `pattern: ranked | sort: views | limit: 5`
   * **Chuyên đề:** `pattern: series | label: series:Kỹ Năng Viết`
4. Bấm **SAVE**.

### Cách 2: Sao Chép Mã Trực Quan Từ Trang Preview (`preview.html`)
Mở file `src/preview.html` ➔ Mở bảng **Bộ Tạo Mã Tiện Ích** ➔ Tùy chỉnh thông số ➔ Bấm **"Sao chép mã widget"** ➔ Dán vào ô Content trên Blogger.

---

## CHƯƠNG 5: CHUỖI BÀI VIẾT & CHUYÊN ĐỀ (POST SERIES NAVIGATOR - `series:`)

Tính năng **Post Series Navigator** giúp bạn tự động liên kết các bài viết nhiều phần thành một chuyên đề hoàn chỉnh với trải nghiệm đọc trực quan.

### 5.1. Cách Tạo Một Chuỗi Bài Viết
1. Mở các bài viết thuộc cùng một series trong Blogger.
2. Tại cột bên phải (**Nhãn / Labels**), nhập nhãn có tiền tố `series:` giống hệt nhau cho tất cả các bài:
   `series:Triết Lý Khắc Kỷ` *(hoặc `series:Kỹ Năng Viết Lách`)*
3. Đăng bài. Theme sẽ tự động thu thập tất cả bài viết cùng series, sắp xếp theo thứ tự thời gian đăng (Phần 1, Phần 2, Phần 3...).

### 5.2. Các Thành Phần Giao Diện Tự Động Hiển Thị Trong Bài Viết
* **Huy hiệu Chuyên đề (Header Pill):** Hiển thị ở đầu bài viết với tên chuyên đề và tổng số phần.
* **Lộ trình Chuyên đề (Roadmap Box):** Đặt ở cuối bài viết, hiển thị:
  * Thanh tiến trình hoàn thành (VD: `Đã đọc 2/5 phần - 40%`).
  * Thẻ bài viết hiện tại (Active illuminated card - "Đang đọc").
  * Thẻ bài tiếp theo ("Tiếp theo") với nút CTA đọc bài tiếp theo.
  * Danh sách các bài đã đọc / chưa đọc với hiệu ứng Timeline Tàu điện ngầm rực rỡ.

---

## CHƯƠNG 6: QUẢN LÝ TÁC GIẢ KHÁCH MỜI (GUEST AUTHOR META)

Nếu bài viết do một tác giả khách mời (Guest Author) đóng góp, bạn có thể override toàn bộ thông tin tác giả (Avatar, Tên, Chức danh, Bio song ngữ, Mạng xã hội) cho duy nhất bài viết đó mà không ảnh hưởng đến hồ sơ chính của bạn.

### Cách Thiết Lập:
Khi soạn thảo bài viết ở chế độ **Xem HTML (HTML view)**, dán thẻ ẩn sau vào đầu hoặc cuối bài viết:

```html
<div class="guest-author-meta"
     data-author-name="Nguyễn Văn A"
     data-author-role="Nhà nghiên cứu Triết học"
     data-author-avatar="https://example.com/avatar-nguyen-van-a.jpg"
     data-author-bio-vi="Nguyễn Văn A là nhà nghiên cứu triết học độc lập với hơn 10 năm kinh nghiệm."
     data-author-bio-en="Nguyen Van A is an independent philosophy researcher with over 10 years of experience."
     data-author-website="https://nguyenvana.com"
     data-author-facebook="https://facebook.com/nguyenvana"
     data-author-twitter="https://x.com/nguyenvana"
     data-author-linkedin="https://linkedin.com/in/nguyenvana"
     data-author-email="contact@nguyenvana.com">
</div>
```

* **Hành vi tự động:** Theme sẽ phát hiện thẻ ẩn này, gắn huy hiệu **Khách mời | Guest**, cập nhật thông tin tên/avatar ở cả khung tác giả đầu bài và Bio Box cuối bài.
* **Avatar thông minh:** Nếu bạn bỏ trống `data-author-avatar`, theme sẽ tự động khởi tạo ảnh đại diện SVG với 2 chữ cái đầu của tên tác giả (Initials Avatar).

---

## CHƯƠNG 7: TRANG LIÊN HỆ & GỬI BÀI VIẾT KHÁCH MỜI (`/p/lien-he.html`) & 4 VỊ TRÍ CTA

Theme tích hợp sẵn ứng dụng **Trang Liên Hệ & Gửi Bài Viết Khách Mời** chuyên nghiệp.

### 7.1. Cách Tạo Trang
1. Trong Blogger ➔ Chọn **Trang (Pages)** ➔ Bấm **+ Trang mới**.
2. Tiêu đề: `Liên Hệ` (hoặc `Contact`).
3. Cột bên phải (**Đường dẫn cố định / Permalink**): Chọn *Đường dẫn cố định tùy chỉnh*, đặt tên là:
   `lien-he` *(Đường dẫn hoàn chỉnh sẽ là `.../p/lien-he.html`)*
4. Bấm **Xuất bản**. Theme sẽ tự động biến trang này thành ứng dụng 2 Tab:
   * **Tab 1: Gửi Bài Viết Khách Mời (Guest Post Submission):** Cho phép độc giả/tác giả gửi đề xuất bài viết, link Google Docs, tóm tắt và thông tin liên hệ.
   * **Tab 2: Liên Hệ Chung (General Contact):** Form gửi thắc mắc, phản hồi hoặc hợp tác.

### 7.2. 4 Vị Trí Nút Bấm / Điểm Chạm Mời Viết Bài (Guest Post Touchpoints)
Theme thiết lập 4 điểm chạm dẫn người đọc về trang `/p/lien-he.html`:
1. **Banner Profile Hero (Đầu trang chủ - `.btn-guest-hero`):** Mặc định **HIỂN THỊ** cạnh nút Bản tin.
2. **Chân bài viết (`.post-guest-cta`):** Thẻ mời gọi dưới khung tác giả cuối bài (Mặc định ẩn, bật qua `HTML88`).
3. **Cột bên Sidebar (`.sidebar-guest-cta`):** Widget mời viết bài trên Sidebar (Mặc định ẩn, bật qua `HTML88`).
4. **Thanh menu điều hướng (Header / Footer):** Thêm link `/p/lien-he.html` trong `LinkList1` hoặc `LinkList5`.

### 7.3. Cấu Hình Nhận Thư (Adapter Settings)
Mặc định form liên hệ hỗ trợ cơ chế chống spam Honeypot (`_honey`) và tự động gửi thông tin. Bạn có thể cấu hình Adapter gửi thư thông qua widget `HTML88` (xem Chương 14) hoặc dán mã cấu hình:

```html
<script>
  window.__CONTACT_CONFIG = {
    adapter: 'blogger', // Options: 'blogger' | 'gas' | 'formsubmit'
    adminEmail: 'your-email@gmail.com', // Thay bằng email nhận thư của bạn
    gasWebhookUrl: 'https://script.google.com/macros/s/.../exec'
  };
</script>
```

---

## CHƯƠNG 8: TẠO TRANG MỤC LỤC TOÀN THƯ (SUBWAY METRO TIMELINE ARCHIVE v5.0)

Theme sở hữu ứng dụng **Mục Lục Toàn Thư dạng Bản Đồ Tàu Điện Ngầm (Subway Metro Timeline Archive v5.0)** rực rỡ và hiện đại.

### Cách Thiết Lập:
1. Vào mục **Trang (Pages)** ➔ Bấm **+ Trang mới**.
2. Tiêu đề: `Mục Lục Toàn Thư` (hoặc `Archive`).
3. **Đường dẫn cố định tùy chỉnh (Permalink):**
   `muc-luc` *(Đường dẫn hoàn chỉnh `.../p/muc-luc.html`)*
4. Bấm **Xuất bản**.

### Các Tính Năng Nổi Bật Của Trang Mục Lục:
* **Giao diện Subway Metro Map:** Các năm xuất bản biến thành Trạm ga lớn (Year Stations), các bài viết rẽ nhánh thành lá bài thời gian (Post Leaves).
* **Dòng thời gian hợp nhất:** Hiển thị cả bài viết chính lẫn các ghi chép/trích dẫn độc quyền gắn nhãn `@`.
* **Bộ lọc đa tầng:**
  * Thanh Category Tabs dưới Banner.
  * Ô Tìm kiếm thời gian thực (Tự động lọc bỏ dấu tiếng Việt, gõ "triet hoc" vẫn tìm ra "Triết học").
  * Cửa sổ Popover bộ lọc nâng cao (Lọc theo nhãn `@`, nhãn AI, định dạng bài).
* **Di động & Dark Mode:** Tự động tối ưu dạng Bottom Sheet trên điện thoại và đồng bộ chế độ sáng/tối.

---

## CHƯƠNG 9: THIẾT LẬP NỘI DUNG SONG NGỮ (BILINGUAL VI / EN)

### 9.1. Với Nội Dung Ngắn (Tiêu đề menu, Tên widget, Tên nhãn)
Sử dụng dấu gạch đứng `|`:
```text
Trang Chủ | Home
Góc Nhìn | Perspectives
Bài Viết Nổi Bật | Featured Posts
```

### 9.2. Với Nội Dung Dài (Bài viết chi tiết, Giới thiệu tác giả, Footer)
Sử dụng 2 khối thẻ `div` tương ứng:
```html
<div data-lang="vi">
  <p>Chào mừng bạn đến với blog Trà Đá Triết Lý.</p>
</div>

<div data-lang="en">
  <p>Welcome to Tra Da Philosophy.</p>
</div>
```

---

## CHƯƠNG 10: HỆ THỐNG NHÃN MINH BẠCH AI (AI TRANSPARENCY)

Theme hỗ trợ tiêu chuẩn đạo đức AI và minh bạch nội dung cho độc giả:

### Bảng Đầy Đủ 6 Nhãn AI Được Hỗ Trợ:
| Tên Nhãn Nhập Vào | Huy Hiệu Hiển Thị | Tỷ Lệ AI | Ý Nghĩa Sử Dụng |
| :--- | :---: | :---: | :--- |
| `ai:generated` *(hoặc `AI-Generated`)* | ⚡ AI Tạo Lập | ~80-100% | Nội dung do AI khởi tạo hoàn toàn theo prompt/định hướng của tác giả. |
| `ai:contributed` *(hoặc `AI-Contributed`)* | ✨ AI Đóng Góp | ~50-80% | AI trực tiếp nghiên cứu và xây dựng các đoạn nội dung chính dưới sự chỉ đạo của tác giả. |
| `ai:assisted` *(hoặc `AI-Assisted`)* | ✨ AI Hỗ Trợ | ~20-50% | Tác giả tự viết, AI hỗ trợ tra cứu, sắp xếp thông tin, dàn ý hoặc ngữ pháp. |
| `ai:product` *(hoặc `AI-Product`)* | 🤖 Sản Phẩm AI | N/A | Bài viết đánh giá, review thực tế về một công cụ hoặc sản phẩm AI. |
| `ai:translated` *(hoặc `AI-Translated`)* | 🌐 AI Dịch Thuật | N/A | Bản dịch ngôn ngữ (VI ↔ EN) được thực hiện bởi công cụ AI dịch thuật. |
| `ai:none` *(hoặc `AI-None`)* | ✍️ 100% Con Người | 0% | Bài viết sáng tác thủ công hoàn toàn, không sử dụng công cụ AI sinh nội dung. |

> **Đặc điểm:** Toàn bộ nhãn `ai:` tự động ẩn khỏi menu Category Tabs và tự động kích hoạt **Huy hiệu Minh Bạch AI** kèm popup giải trình khi độc giả click vào!

---

## CHƯƠNG 11: CẤU HÌNH PHONG CÁCH GIAO DIỆN (THEME PRESETS & DARK/LIGHT MODE)

Theme hỗ trợ chuyển đổi phong cách thiết kế cao cấp và chế độ sáng/tối thông minh.

### 11.1. Chế Độ Sáng / Tối (Light & Dark Mode)
* **Công tắc trên Header:** Độc giả bấm nút `☀️` / `🌙` trên thanh điều hướng để chuyển đổi giữa Sáng và Tối.
* **Tự động nhận diện thiết bị:** Mặc định tự động nhận diện chế độ hệ thống của độc giả (`prefers-color-scheme`).
* **Lưu trạng thái:** Lưu trữ lựa chọn trong `localStorage` với key `theme` (`light` hoặc `dark`).

### 11.2. Theme Preset: Airy Minimalist & Pastel Gradient (`airy-pastel`)
* **Mô tả:** Phong cách giao diện lấy cảm hứng từ các tạp chí số và sản phẩm công nghệ hiện đại (*tatca.ai*, *Linear*, *Stripe*, *Refactoring*). Sử dụng viền Hairline siêu mỏng, hiệu ứng Gradient Pastel mềm mại và hiệu ứng kính mờ Frosted Glass.
* **Cách kích hoạt:** Được tích hợp mặc định trong theme hoặc khai báo tại thẻ HTML đầu file template:
  ```xml
  <html b:css='false' b:responsive='true' b:version='2'
        data-theme='light'
        data-theme-preset='airy-pastel'>
  ```

### 11.3. Hệ Thống Design Tokens & Biến CSS Toàn Cục (`variables.css`)
Toàn bộ màu sắc, khoảng cách, font chữ và bo góc tuân thủ nghiêm ngặt hệ thống Design Tokens (CSS Variables):

| Nhóm Token | Tên Biến CSS | Ý Nghĩa / Giá Trị Mặc Định |
| :--- | :--- | :--- |
| **Thương Hiệu & Màu Chính** | `--primary`, `--primary-hover`, `--primary-light` | Màu xanh chủ đạo (`#2563eb`), hover (`#1d4ed8`), nền nhạt (`#eff6ff`) |
| **Kênh Màu RGB (Dùng cho Alpha)** | `--primary-rgb` | `37, 99, 235` (Light mode) và `59, 130, 246` (Dark mode) |
| **Gradients Cao Cấp** | `--primary-gradient`, `--primary-gradient-hover` | Dải màu gradient tuyến tính cho các nút kêu gọi hành động CTA |
| **Trạng Thái & Cảnh Báo** | `--success`, `--warning`, `--danger`, `--error` | Xanh lục (`#10b981`), Hổ phách (`#f59e0b`), Đỏ nguy hiểm (`#ef4444`) |
| **Kiểu Chữ (Typography)** | `--font-main`, `--font-serif`, `--font-heading`, `--font-mono` | Be Vietnam Pro (chính), Lora (tiêu đề/chân phương), Fira Code (mã nguồn) |
| **Bo Góc (Radius Scale)** | `--radius-xs` (4px), `--radius-sm` (8px), `--radius-md` (12px), `--radius-lg` (16px), `--radius-full` (9999px) | Thang bo góc đồng nhất chuẩn hóa |
| **Mặt Nền & Đổ Bóng** | `--bg-body`, `--bg-card`, `--bg-surface`, `--shadow-sm`, `--shadow-md`, `--shadow-lg` | Tự động đồng bộ và đảo màu khi chuyển Dark/Light mode |

---

## CHƯƠNG 12: THANH TIẾN TRÌNH ĐỌC & MỤC LỤC BÀI VIẾT TỰ ĐỘNG (AUTO TOC)

### 12.1. Thanh Tiến Trình Đọc (Reading Progress Bar) & Thời Gian Đọc
* **Thanh tiến trình:** Tự động hiển thị một đường chỉ màu chạy ở đỉnh màn hình khi độc giả cuộn đọc bài viết.
* **Thời gian đọc:** Tự động tính toán số phút đọc dựa trên tổng số từ trong bài (~200 từ/phút) và hiển thị huy hiệu thời gian đọc ở đầu bài.

### 12.2. Mục Lục Bài Viết Tự Động (Auto Table of Contents)
* **Cơ chế:** Theme tự động quét các thẻ tiêu đề `<h2>` và `<h3>` trong nội dung bài viết để tạo ra khung **Mục Lục Bài Viết** đẹp mắt ở đầu bài.
* **Tính năng:**
  * Cho phép bấm ẩn/hiện mục lục.
  * Bấm vào từng mục để cuộn mượt (smooth scroll) đến đoạn tương ứng.
  * Tự động phát sáng tiêu đề mục lục đang đọc theo vị trí cuộn màn hình.

---

## CHƯƠNG 13: GỢI Ý TIẾP THỊ LIÊN KẾT MINH BẠCH (AFFILIATE BOX)

Khi giới thiệu sách hoặc sản phẩm kèm liên kết affiliate, dán đoạn mã sau vào bài viết (ở chế độ xem HTML):

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

## CHƯƠNG 14: CẤU HÌNH COMPONENT ẨN, NÚT CÀ PHÊ & ĐIỂM CHẠM (WIDGET `HTML88`)

Widget `⚙️ Cấu hình component ẩn | Hide Component Setting` (`HTML88`) nằm ở đáy trang quản trị **Bố cục (Layout)** là trung tâm điều chỉnh toàn bộ các tính năng ẩn và điểm chạm hành động của blog.

### 14.1. Vị trí quản lý trong Blogger Admin
1. Vào **Blogger Dashboard -> Bố cục (Layout)**.
2. Cuộn xuống phần dưới cùng của trang: Khu vực **`⚙️ CẤU HÌNH COMPONENT ẨN`**.
3. Bấm vào cây bút chì chỉnh sửa widget **`⚙️ Cấu hình component ẩn | Hide Component Setting`** (Mã widget: `HTML88`).

---

### 14.2. Hướng dẫn BẬT / ẨN từng Component cụ thể

#### 1. Nút "☕ Mời Tôi Ly Cà Phê" (Buy Me A Coffee Button)
Mặc định nút này được ẩn để giữ giao diện tối giản. Nếu bạn muốn nhận ủng hộ từ độc giả:
* **Cách BẬT:** Trong ô Content của `HTML88`, tìm thẻ `<a class="btn-coffee" ...>` và sửa `style="display:none;"` thành `style="display:inline-flex;"`.
* **Thay link ủng hộ:** Sửa thuộc tính `href="https://www.buymeacoffee.com/your-id"` thành đường dẫn BuyMeACoffee, Ko-fi hoặc MoMo của bạn.
* **Cách ẨN lại:** Sửa thành `style="display:none;"`.

```html
<!-- BẬT NÚT MỜI CÀ PHÊ -->
<a class="btn-coffee" href="https://www.buymeacoffee.com/id-cua-ban" target="_blank" rel="noopener noreferrer" style="display:inline-flex;">
  <span data-bilingual="true">☕ Mời tôi ly cà phê | ☕ Buy me a coffee</span>
</a>
```

---

#### 2. Nút "✍️ Viết Cùng Chúng Mình / Gửi Bài" (Guest Post Hero Button)
* **Vị trí hiển thị:** Nằm trên Banner Hero đầu trang chủ, bên cạnh nút Đăng ký Bản tin.
* **Cách BẬT:** Sửa `style="display:none;"` thành `style="display:inline-flex;"`.
* **Cách ẨN:** Sửa `style="display:inline-flex;"` thành `style="display:none;"`.

```html
<!-- BẬT NÚT MỜI VIẾT BÀI ĐẦU TRANG CHỦ -->
<a class="btn-guest-hero" href="/p/lien-he.html" style="display:inline-flex;" data-bilingual="true">
  ✍️ Viết Cùng Chúng Mình | Write With Us
</a>
```

---

#### 3. Thẻ Mời Viết Bài Ở Cuối Bài Viết (`.post-guest-cta`)
* **Vị trí hiển thị:** Khối thẻ callout nằm ngay dưới khung tác giả cuối mỗi bài viết.
* **Cách BẬT:** Sửa `style="display:none;"` thành `style="display:block;"`.

```html
<!-- BẬT THẺ MỜI GỬI BÀI CUỐI BÀI VIẾT -->
<div class="post-guest-cta" style="display:block;">
  <p><span data-bilingual="true">☕ Bạn có góc nhìn muốn chia sẻ cùng độc giả? | ☕ Have a story to share with our readers?</span></p>
  <a class="btn-guest-post-link" href="/p/lien-he.html" data-bilingual="true">Gửi bài viết đóng góp ➔ | Submit a guest post ➔</a>
</div>
```

---

#### 4. Quảng Cáo Google AdSense Trong Bài Viết (In-Article Ads)
Nếu bạn không muốn bật quảng cáo qua widget ô riêng mà muốn nhúng mã AdSense tự động vào bài viết:
* **Cách BẬT:** Đổi `style="display:none;"` thành `style="display:block;"`.
* Dán mã AdSense vào giữa 2 thẻ `<div class="ad-top-code">` (Đầu bài) và `<div class="ad-bottom-code">` (Cuối bài).

```html
<!-- BẬT QUẢNG CÁO TRONG BÀI VIẾT -->
<div class="in-post-ads-config" style="display:block;">
  <div class="ad-top-code">
    <!-- Dán mã nhúng AdSense Đầu bài viết tại đây -->
  </div>
  <div class="ad-bottom-code">
    <!-- Dán mã nhúng AdSense Cuối bài viết tại đây -->
  </div>
</div>
```

---

#### 5. Cấu Hình Backend Trang Liên Hệ (`__CONTACT_CONFIG`)
* Quản lý email nhận thông tin phản hồi từ độc giả và chọn Adapter backend:
  * `'blogger'`: Gửi thư qua comment/feed mặc định của Blogger (Miễn phí, gửi về Gmail chủ blog).
  * `'gas'`: Gửi webhook về Google Apps Script (Lưu tự động vào Google Sheets + báo Gmail).
  * `'formsubmit'`: Gửi qua dịch vụ FormSubmit.co.

```html
<script>
  window.__CONTACT_CONFIG = {
    adapter: 'blogger', // 'blogger' | 'gas' | 'formsubmit'
    adminEmail: 'your-email@gmail.com', // Thay bằng email nhận thư thật của bạn
    gasWebhookUrl: 'https://script.google.com/macros/s/YOUR_GAS_ID/exec'
  };
</script>
```

---

## CHƯƠNG 15: QUẢN LÝ & BẬT/TẮT VỊ TRÍ QUẢNG CÁO (ADSENSE & BANNERS)

Theme thiết lập mặc định **ẨN** toàn bộ quảng cáo để giao diện tinh gọn. Khi blog đủ điều kiện, bạn bật 4 vị trí sau từ **Bố cục (Layout)**:

| STT | Vị Trí Quảng Cáo | Tên Widget Trong Bố Cục | Kích Thước Khuyến Nghị |
| :--- | :--- | :--- | :--- |
| 1 | **Trang Chủ (Kết luồng)** | `Quảng Cáo Kết Luồng (Trên Nút Phân Trang)` (`HTML14`) | 728x90, 970x250, hoặc Responsive Banner |
| 2 | **Cột Bên (Sidebar Sticky)** | `Quảng Cáo Sidebar (Sticky)` (`HTML3`) | 300x250 hoặc 300x600 (Trượt theo khi cuộn) |
| 3 | **Chân Trang (Footer Tầng 3)** | `Banner Quảng Cáo Đáy Trang` (`HTML6`) | 728x90 hoặc 970x90 Leaderboard |
| 4 | **Trong Bài Viết (Đầu & Cuối)**| `Quảng Cáo Đầu Bài Viết` (`HTML21`) & `Quảng Cáo Cuối Bài Viết` (`HTML22`) | Responsive In-Article Ads |

**Cách bật:** Bấm cây bút chỉnh sửa widget ➔ Tích chọn **"Hiển thị HTML/JavaScript"** ➔ Dán mã AdSense vào ô Content ➔ Bấm **Lưu**.

---

## BẢNG TỔNG HỢP TRA CỨU NHANH & XỬ LÝ BỘ NHỚ ĐỆM (CHEATSHEET & CACHE)

### Bảng Tra Cứu Thao Tác Nhanh
| Thao Tác Cần Thực Hiện | Cách Làm Nhanh Nhất |
| :--- | :--- |
| **Đổi chế độ Sáng / Tối** | Bấm nút công tắc `☀️` / `🌙` ở góc trên bên phải. |
| **Chuyển đổi Tiếng Việt / Tiếng Anh** | Bấm nút chuyển đổi `VI` / `EN` trên thanh điều hướng. |
| **Tạo chuỗi chuyên đề bài viết** | Gắn nhãn `series:Tên Chuyên Đề` cho các bài thuộc chuỗi. |
| **Hiển thị widget Chuyên đề** | Bấm `+ Thêm tiện ích` ➔ Ô Content gõ `pattern: series \| label: series:TênChuyênĐề`. |
| **Thêm tác giả khách mời** | Dán thẻ `<div class="guest-author-meta" data-author-name="..."></div>` vào nội dung bài viết. |
| **Tạo trang Liên hệ & Gửi bài** | Tạo Trang mới ➔ Permalink đặt là `lien-he`. |
| **Tạo trang Mục lục Tàu điện ngầm** | Tạo Trang mới ➔ Permalink đặt là `muc-luc`. |
| **Đưa bài viết lên vị trí Tiêu Điểm** | Gắn nhãn `@Tiêu điểm` cho bài viết đó. |
| **Biến bài viết thành Trích Dẫn ngẫu nhiên** | Gắn nhãn `@Quote` cho bài viết đó. |
| **Ẩn bài viết ngắn khỏi Trang Chủ** | Gắn bất kỳ nhãn nào bắt đầu bằng ký tự `@` (VD: `@Quote`, `@TinNhanh`). |
| **Khai báo bài viết có AI hỗ trợ** | Gắn nhãn `ai:assisted`. |
| **Khai báo bài viết dịch bằng AI** | Gắn nhãn `ai:translated`. |
| **Khai báo bài viết là review sản phẩm AI** | Gắn nhãn `ai:product`. |
| **Tạo menu song ngữ** | Nhập tên liên kết dạng `Tên Việt \| English Name`. |
| **Đổi nhãn cho widget** | Mở widget trong Bố cục, gõ tên nhãn vào ô `Content` (VD: `Sách hay`). |
| **Thêm widget mới** | Bấm `+ Thêm tiện ích` ➔ Chọn `HTML/JavaScript` ➔ Ô Content gõ `pattern: digest \| label: TênNhãn`. |
| **Bật quảng cáo hoặc nút Cà phê / Guest CTA** | Vào **Bố cục (Layout)** ➔ Chỉnh sửa widget tương ứng (hoặc widget `HTML88`) và chọn **Hiển thị**. |
| **Hiển thị widget Video & Reels Nổi Bật** | Gắn nhãn `@video` cho bài có video, rồi thêm widget với `pattern: reels`. |
| **Đẩy video bán chéo lên đầu Reels** | Gắn thêm nhãn `@video-hot` cho bài viết Video đó. |

### 💡 Lưu Ý Quan Trọng Về Bộ Nhớ Đệm (SessionStorage Caching)
Để đảm bảo tốc độ tải trang cực nhanh (Load dưới 0.5s), theme sử dụng bộ nhớ đệm tạm thời `sessionStorage` (thời hạn 3 - 5 phút cho widget bài viết, **60 phút cho widget Reels**) cho Widget Bài Viết, Chuyên Đề và Trang Mục Lục. 
* **Nếu bạn vừa đăng bài viết mới hoặc vừa sửa nhãn bài viết nhưng chưa thấy widget cập nhật ngay:** Hãy đóng tab trình duyệt và mở lại, hoặc nhấn phím `Ctrl + Shift + R` (`Cmd + Shift + R` trên Mac) để xóa cache SessionStorage và tải lại dữ liệu mới nhất từ Blogger API.

---

## CHƯƠNG 16: TIỆN ÍCH VIDEO & VOICE REELS NỔI BẬT (VIDEO & REELS SHOWCASE WIDGET)

> **Spec:** DONE_019 | Video & Voice Reels Showcase Widget — Living Canvas, Blurred BG Fill, Equalizer Waveform, Click-to-Play Facade.

### 16.1. Tổng Quan
Widget `pattern: reels` biến các bài viết có chứa link video/audio thành một **Khung Video & Reels chuẩn phong cách Facebook**:
- 📦 **Khung Viền & Tiêu Đề Chuẩn Facebook**: Bao bọc bởi hộp thẻ viền mảnh thanh lịch (`border: 1px solid var(--border-color)`), bo góc mềm mại `14px`, tiêu đề gọn gàng **"Video"** kèm icon clapperboard đặc trưng và nút tùy chọn `···` ở góc phải.
- 📱 **Thẻ Unibody Full-Bleed Chuẩn Facebook Reels (175px, Tỷ lệ 9:16)**: Hình ảnh/video chiếm trọn 100% diện tích thẻ từ trên xuống dưới, bo góc `12px`, có nút 3 chấm `⋮` ở góc trên và tiêu đề bài viết phủ chìm trên nền dải chuyển màu đen (dark gradient) ở đáy thẻ.
- 🔘 **Nút Điều Hướng Tròn Nổi Khối**: Nút chuyển clip trái/phải hình tròn màu trắng tinh tế lơ lửng ngay mép thẻ tương tự nút trượt trên Facebook.
- 🎬 Preview động khi rê chuột (YouTube animated WebP 6s)
- 🔊 Sóng âm Equalizer nhảy múa cho file Audio/Podcast
- ▶️ Nút Play xung nhịp (Pulse ring animation)
- 📽️ Vạch Story ở mép trên, huy hiệu thời lượng
- 🌫️ Nền mờ nghệ thuật (Blurred Background Fill) cho video 16:9 YouTube
- ⚡ Click-to-Play Facade: không tải iframe nặng cho đến khi người dùng bấm Play
- 🎭 Rạp chiếu Reels Lightbox Theater Modal cực kỳ WOW với phím mũi tên & cử chỉ vuốt touch mobile.

### 16.2. Nhãn Bài Viết Cần Gắn

| Nhãn | Mục Đích | Vị Trí Ưu Tiên |
| :--- | :--- | :---: |
| `@video` | Đánh dấu bài có video/audio cần xuất hiện trong widget Reels | Tất cả |
| `@video-hot` hoặc `@hotvideo` | Đánh dấu video bán chéo chủ lực, đẩy lên vị trí 1-2 | Vị trí 1 & 2 |

> **Lưu ý:** Cả 2 nhãn đều bắt đầu bằng `@` nên sẽ **tự động ẩn khỏi feed trang chủ và thanh Category Tabs**.

### 16.3. Cách Nhúng Link Video Vào Bài Viết
Widget tự động quét nội dung bài viết và bóc tách link media. Bạn chỉ cần dán link vào bài viết bình thường:

| Nền Tảng | Link Ví Dụ | Ghi Chú |
| :--- | :--- | :--- |
| YouTube (Chuẩn) | `https://www.youtube.com/watch?v=dQw4w9WgXcQ` | Tự động nhận diện, dùng Blurred BG Fill |
| YouTube Shorts | `https://www.youtube.com/shorts/dQw4w9WgXcQ` | Hiển thị tràn viền (cover) |
| TikTok | `https://www.tiktok.com/@user/video/123456789` | Dùng ảnh đại diện bài viết |
| Facebook Reel | `https://www.facebook.com/reel/123456789` | Dùng ảnh đại diện bài viết |
| File MP4/WebM | `https://cdn.example.com/video.mp4` | Tự phát không tiếng khi hover |
| File MP3/M4A | `https://cdn.example.com/audio.mp3` | Hiển thị Equalizer sóng nhạc |

### 16.4. Thêm Widget Video & Reels Qua Blogger Layout
Vào **Bố cục (Layout)** ➔ Bấm **+ Thêm tiện ích** ➔ Chọn **HTML/JavaScript** ➔ Nhập vào ô **Content**:

```text
pattern: reels
title: Video
limit: 8
sort: random
hot-ratio: 60%
cta-text: Xem bài viết & Ưu đãi ➔
```

### 16.5. Bảng Tham Số Cấu Hình Đầy Đủ

| Tham Số | Mặc Định | Giải Thích |
| :--- | :---: | :--- |
| `pattern` | `reels` | Bắt buộc, định danh widget Reels. |
| `title` | `Video` | Tiêu đề đầu widget (mặc định là `Video`). Hỗ trợ song ngữ `VI \| EN`. |
| `limit` | `10` | Số khung video tối đa (1–10). |
| `fetch-count` | `40` | Số bài nạp từ feed để bóc tách video (10–100). |
| `sort` | `random` | Thứ tự: `random` \| `latest` \| `oldest`. |
| `labels` | `@video` | Nhãn truy vấn feed. |
| `hot-label` | `@video-hot` | Nhãn bài ưu tiên bán chéo. |
| `hot-ratio` | `60%` | Tỷ lệ bài Hot trong tổng số khung (0%–100%). |
| `extract` | `first` | Chọn clip đại diện: `first` (clip đầu) hoặc `random` (bốc ngẫu nhiên). |
| `media` | `all` | Bộ lọc: `all` \| `video` \| `audio`. |
| `cta-text` | `Xem chi tiết ➔` | Dòng chữ nút CTA dẫn về bài viết. |
| `mode` | `auto` | `auto` (tự nhận ngữ cảnh) \| `slider` (ép thanh trượt) \| `single` (ép 1 khung). |
| `play-mode` | `modal` | `modal` (Mở màn hình Reels Theater chuẩn TikTok/IG với phím mũi tên & lướt clip) \| `inline` (Phát trực tiếp tại khung thẻ). |

### 16.6. Trải Nghiệm Reels Lightbox Theater Modal
Khi `play-mode: modal` (mặc định), người dùng bấm Play sẽ mở ra **Màn hình rạp chiếu Reels chuyên dụng**:
- 🎬 Khung hình 9:16 sắc nét ở trung tâm với phông nền mờ đen (`backdrop-filter: blur(16px)`).
- 🔄 **Lướt clip liên tục**: Có nút điều hướng **Clip trước / Clip kế tiếp**, hỗ trợ phím mũi tên `↑` / `↓` hoặc `←` / `→` trên bàn phím máy tính.
- 📱 **Vuốt ngón tay trên điện thoại**: Vuốt lên để chuyển clip sau, vuốt xuống để xem lại clip trước y hệt TikTok / Instagram Reels.
- ✕ Đóng nhanh bằng phím `Esc` hoặc bấm ra ngoài màn hình mà không làm mất vị trí cuộn trang.
- 🔗 Nút CTA nổi bật dẫn thẳng vào bài viết gốc.

### 16.7. Ba Ngữ Cảnh Hiển Thị Tự Động

| Vị Trí | Chế Độ Tự Động | Giao Diện |
| :--- | :--- | :--- |
| **Cột bên (Sidebar)** | `single` — 1 khung tràn viền tự động | Thẻ Reel tràn viền 100% cột bên (Edge-to-Edge) không tiêu đề thừa, tự động chuyển clip sau 6s (hover tạm dừng), nút điều hướng Prev/Next ẩn tinh tế và chỉ hiển thị khi rê chuột (Hover Reveal) |
| **Đầu trang / Main Content** | `slider` — thanh trượt ngang | Khung Facebook Reels có border, tiêu đề "Video", 3–5 khung hiển thị cùng lúc, nút ◀ ▶ |
| **Cột bên hẹp (≤ 360px)** | Container Query tự thu nhỏ | Card 160px, nút Play nhỏ hơn |

### 16.8. Ví Dụ Thực Tế

**Ví dụ 1 — Widget Reels cho sidebar (tự động xoay tua 6s + Prev/Next):**
```text
pattern: reels
limit: 6
mode: single
```

**Ví dụ 2 — Widget Reels slider đầu trang (nhiều khung):**
```text
pattern: reels
title: Video
limit: 8
sort: random
hot-ratio: 60%
cta-text: Mua ngay & Ưu đãi ➔
```

**Ví dụ 3 — Chỉ hiển thị file âm thanh/Podcast:**
```text
pattern: reels
title: 🎙️ Podcast & Voice
limit: 5
media: audio
cta-text: Nghe ngay ➔
```
