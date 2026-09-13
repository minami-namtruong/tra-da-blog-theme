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

### 1.4. Nhãn Minh Bạch AI (AI Transparency Labels - Bắt đầu bằng `ai:`)
* **Mục đích:** Khai báo và minh bạch mức độ can thiệp/hỗ trợ của Trí tuệ nhân tạo (AI) trong quá trình sáng tạo nội dung bài viết.
* **Cơ chế hoạt động:**
  * **Ẩn khỏi Thanh Chủ Đề:** Theme tự động loại trừ các nhãn `ai:` khỏi thanh Category Tabs để không làm rối menu chủ đề chính.
  * **Tự động gắn Huy hiệu (Badge):** Tự động render huy hiệu minh bạch ngay dưới tiêu đề bài viết (ở cả Feed trang chủ và trang đọc chi tiết).
  * **Kích hoạt Modal giải trình:** Khi người đọc bấm vào huy hiệu, một cửa sổ popup sẽ hiển thị giải trình chi tiết về vai trò của con người và AI.
* **Bảng các nhãn AI được hỗ trợ:**
  | Tên Nhãn Nhập Vào | Huy Hiệu Hiển Thị | Tỷ Lệ AI | Ý Nghĩa Sử Dụng |
  | :--- | :---: | :---: | :--- |
  | `ai:generated` *(hoặc `AI-Generated`)* | 🤖 AI Tạo Lập | ~80-100% | Bài viết do AI tạo lập nội dung chính theo prompt/định hướng của tác giả. |
  | `ai:assisted` *(hoặc `AI-Assisted`)* | ✨ AI Hỗ Trợ | ~20-50% | Tác giả tự viết, AI hỗ trợ chỉnh sửa ngữ pháp, dàn ý hoặc dịch thuật. |
  | `ai:none` *(hoặc `AI-None`)* | ✍️ 100% Con Người | 0% | Bài viết sáng tác thủ công hoàn toàn, không sử dụng công cụ AI sinh nội dung. |
* **Ví dụ gắn nhãn kết hợp thực tế:**
  `Công nghệ, Sách hay, ai:assisted`
  *(Bài viết vừa thuộc chủ đề Công nghệ, Sách hay, vừa có huy hiệu AI Hỗ Trợ).*

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

## CHƯƠNG 3: HƯỚNG DẪN CHI TIẾT CẤU HÌNH WIDGET QUA TRƯỜNG "CONTENT"

Trong trang **Bố cục (Layout)** của Blogger, theme đã bố trí sẵn các widget tại các vị trí đẹp nhất:
1. `main-above-feed`: Đầu luồng bài viết (🌟 Bài Viết Tiêu Điểm Tuần - Spotlight)
2. `main-in-feed-section`: Xen kẽ giữa các bài viết sau bài số 3 (☕ Trích Dẫn Chiêm Nghiệm - Quote)
3. `main-special-posts-section`: Dưới luồng bài viết chính (📊 Top Bài Đọc Nhiều - Ranked)
4. `sidebar-section`: Cột bên phải (Bài nổi bật, Chiêm nghiệm, Điểm tin, Tiêu điểm)

Khi bạn bấm nút hình **Cây bút (Chỉnh sửa / Edit)** tại bất kỳ widget nào:
* **Ô Title:** Đổi tiêu đề hiển thị trên blog.
* **Ô Content:** Là nơi bạn có toàn quyền cấu hình **toàn bộ các tùy chọn như trên trang Preview**!

---

### 3.1. Bảng Tổng Hợp Tất Cả Các Tham Số Cấu Hình (Như Demo Tại `preview.html`)

Mọi tùy chọn trên bộ điều khiển Interactive Playground của trang Preview đều có thể thiết lập trực tiếp thông qua ô **Content**:

| Tham Số | Thuộc Tính HTML Tương Ứng | Giá Trị Mặc Định | Giá Trị Hợp Lệ | Mô Tả Tác Dụng |
| :--- | :--- | :---: | :--- | :--- |
| **`pattern`** | `data-pattern` | `digest` | `spotlight`, `ranked`, `quote`, `digest` | Kiểu dáng giao diện hiển thị của widget. |
| **`label`** | `data-labels` | Theo widget | Tên nhãn (VD: `Triết lý`, `Sách, AI`) | Lọc bài viết theo một hoặc nhiều nhãn chủ đề. |
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

### 3.2. Chi Tiết 4 Loại Widget & Mẫu Cấu Hình Cho Từng Loại

#### 🌟 1. Kiểu Tiêu Điểm (`pattern: spotlight`)
* **Mục đích:** Tạo điểm nhấn thị giác lớn cho bài viết then chốt của tuần/tháng (Editor's Choice), thường đặt ở đầu trang chủ (`main-above-feed`) hoặc đầu thanh Sidebar.
* **Giao diện:** Ảnh bìa lớn tỉ lệ 16:9 sắc nét, huy hiệu chủ đề nổi bật, tiêu đề lớn, đoạn trích dẫn súc tích và nút CTA đọc bài viết.
* **Vị trí sẵn có:** Widget `HTML10` (Đầu luồng bài viết) & `HTML17` (Cột bên Sidebar).
* **Cấu hình mặc định:** Nhãn `@Tiêu điểm`, lấy 1 bài (`limit: 1`), sắp xếp `latest`.
* **Các mẫu cấu hình trong ô Content:**
  * *Chỉ đổi nhãn hiển thị:* `label: Góc nhìn` *(hoặc chỉ cần gõ thẳng chữ `Góc nhìn`)*
  * *Tắt ảnh thu nhỏ:* `thumb: false`
  * *Tắt đoạn tóm tắt:* `snippet: false`
  * *Đổi chữ nút đọc:* `viewall: Khám phá ngay »`
  * *Mẫu đầy đủ (Cú pháp ngắn gọn):*
    ```text
    label: Góc nhìn | thumb: true | snippet: true | viewall: Khám phá ngay »
    ```
  * *Mẫu đầy đủ (Mã HTML chuẩn copy từ Preview):*
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
* **Giao diện:** Đánh số thứ tự lớn nghệ thuật (`01`, `02`, `03`...), font chữ thanh lịch, layout tự động chuyển sang 2-3 cột khi đặt ở vùng Main content rộng và 1 cột khi đặt ở Sidebar.
* **Vị trí sẵn có:** Widget `HTML13` (Cuối luồng bài viết chính) & `HTML14` (Cột bên Sidebar).
* **Cấu hình mặc định:** Sắp xếp theo lượt đọc `sort: views`, lấy 5-6 bài (`limit: 5` hoặc `6`).
* **Các mẫu cấu hình trong ô Content:**
  * *Lấy Top 5 bài đọc nhiều nhất mọi thời đại (Toàn blog):*
    ```text
    sort: views | timeRange: all_time | limit: 5
    ```
  * *Lấy Top 4 bài đọc nhiều trong 30 ngày qua của chuyên mục Sách:*
    ```text
    label: Sách | sort: views | timeRange: last_30_days | limit: 4
    ```
  * *Lấy 5 bài mới nhất mang nhãn `@Nổi bật` (Do tác giả tự chọn):*
    ```text
    label: @Nổi bật | sort: latest | limit: 5
    ```
  * *Tắt ảnh thumbnail để danh sách xếp hạng tinh gọn:*
    ```text
    sort: views | limit: 5 | thumb: false
    ```
  * *Mẫu đầy đủ (Mã HTML chuẩn copy từ Preview):*
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
* **Giao diện:** Thiết kế hộp danh ngôn cao cấp, font chữ Serif trang trọng, dấu ngoặc kép mở đầu nghệ thuật, hiển thị ngẫu nhiên (random) mỗi lần người đọc tải lại trang.
* **Vị trí sẵn có:** Widget `HTML11` (Xen kẽ giữa các bài sau bài thứ 3) & `HTML15` (Cột bên Sidebar).
* **Cấu hình mặc định:** Nhãn `@Quote`, sắp xếp ngẫu nhiên `sort: random`, lấy 1 bài (`limit: 1`).
* **Các mẫu cấu hình trong ô Content:**
  * *Lấy ngẫu nhiên từ nhãn Triết Lý:*
    ```text
    label: Triết lý | sort: random
    ```
  * *Lấy câu trích dẫn từ bài viết mới nhất (không ngẫu nhiên):*
    ```text
    label: Chiêm nghiệm | sort: latest
    ```
  * *Mẫu đầy đủ (Mã HTML chuẩn copy từ Preview):*
    ```html
    <div class="special-posts-widget"
         data-pattern="quote"
         data-labels="Triết lý"
         data-sort="random"
         data-limit="1"
         data-insert-after="3">
    </div>
    ```
  * *Hoặc chèn một trích dẫn tĩnh cố định bằng HTML thuần (Không cần tạo bài viết Blogger):*
    ```html
    <div class="special-quote-box">
      <blockquote class="special-quote-text">"Sự đơn giản là đỉnh cao của tinh tế."</blockquote>
      <cite class="special-quote-author">— Leonardo da Vinci</cite>
    </div>
    ```

---

#### ⚡ 4. Kiểu Điểm Tin & Xu Hướng (`pattern: digest`)
* **Mục đích:** Hiển thị danh sách các bài viết vắn tắt, cập nhật tin tức nhanh, ghi chú ngắn theo dạng thẻ card hiện đại.
* **Giao diện:** Thẻ card nhỏ gọn, có thumbnail bo góc mềm mại, ngày tháng xuất bản định dạng rõ ràng, tiêu đề tinh tế và đoạn tóm tắt 2 dòng.
* **Vị trí sẵn có:** Widget `HTML16` (Cột bên Sidebar).
* **Cấu hình mặc định:** Nhãn `@Điểm tin`, lấy 4 bài (`limit: 4`), sắp xếp `latest`.
* **Các mẫu cấu hình trong ô Content:**
  * *Lấy 4 tin mới nhất nhãn Công Nghệ:*
    ```text
    label: Công nghệ | limit: 4
    ```
  * *Lọc từ nhiều nhãn cùng lúc:*
    ```text
    labels: AI, Công nghệ | limit: 5
    ```
  * *Tắt hiển thị tóm tắt, chỉ giữ ảnh và tiêu đề:*
    ```text
    label: Tin tức | limit: 4 | snippet: false
    ```
  * *Mẫu đầy đủ (Mã HTML chuẩn copy từ Preview):*
    ```html
    <div class="special-posts-widget"
         data-pattern="digest"
         data-labels="Công nghệ"
         data-limit="4"
         data-sort="latest"
         data-show-thumbnail="true"
         data-show-snippet="true"
         data-view-all-text="Xem tất cả tin »">
    </div>
    ```

---

### 3.3. Tính Năng Cao Cấp: Chọn Đích Danh Bài Viết Bằng URL (Handpicked Posts)
Nếu bạn không muốn lọc theo nhãn mà muốn **chỉ định chính xác tuyệt đối các bài viết** muốn đưa lên widget:
* Nhập danh sách link bài viết (phân tách bởi dấu phẩy) vào ô `Content`:
  ```text
  posts: https://myblog.blogspot.com/2026/09/bai-viet-1.html, https://myblog.blogspot.com/2026/09/bai-viet-2.html
  ```
* Hoặc dạng thẻ HTML:
  ```html
  <div class="special-posts-widget"
       data-pattern="spotlight"
       data-posts="https://myblog.blogspot.com/2026/09/bai-viet-1.html">
  </div>
  ```

---

### 3.4. Cấu Hình Widget Ảnh Bìa & Tác Giả (Profile Cover Hero)
Khu vực ảnh bìa to bản và thông tin tác giả nằm ở đầu blog (trong khu vực **Ảnh Bìa & Tác Giả**). Theme đã tách bạch sẵn **3 tiện ích riêng biệt** để bạn thao tác nhanh chóng và thuận tiện nhất:

#### 1. Tải Ảnh Bìa Banner (Widget `Image1` — `🖼️ 1. Tải Lên Ảnh Bìa Banner (Từ Máy Tính)`)
1. Trong mục **Bố cục (Layout)** ➔ khu vực **Ảnh Bìa & Tác Giả**, bấm **Chỉnh sửa** tại widget `🖼️ 1. Tải Lên Ảnh Bìa Banner (Từ Máy Tính)`.
2. Tại mục **Hình ảnh (Image)**, chọn **"Tải hình ảnh lên từ máy tính"** ➔ Bấm nút **Chọn tệp (Choose File)** và chọn ảnh bìa từ máy của bạn.
3. Bấm **LƯU (SAVE)**. Theme sẽ tự động lấy ảnh này làm hình nền Banner toàn màn hình!

#### 2. Tải Avatar Tròn Tác Giả (Widget `Image2` — `👤 2. Tải Lên Avatar Tác Giả (Từ Máy Tính)`)
1. Bấm **Chỉnh sửa** tại widget `👤 2. Tải Lên Avatar Tác Giả (Từ Máy Tính)`.
2. Chọn **"Tải hình ảnh lên từ máy tính"** ➔ Bấm **Chọn tệp (Choose File)** và chọn ảnh đại diện của bạn.
3. Bấm **LƯU (SAVE)**. Theme tự động gán ảnh vào khung avatar tròn viền trắng sang trọng!

#### 3. Cài Đặt Tên & Lời Giới Thiệu (Widget `HTML1` — `✍️ 3. Tên & Lời Giới Thiệu Tác Giả`)
Bấm **Chỉnh sửa** widget này:
* **Đổi Tên Tác Giả:** Nhập trực tiếp tên bạn vào ô **Tiêu đề (Title)** (Ví dụ: `Nam Trương`).
* **Đổi Lời Giới Thiệu (Bio):** Nhập trực tiếp đoạn văn bản giới thiệu về bạn vào ô **Nội dung (Content)**.
  > Không cần phải nhớ cú pháp phức tạp! Bạn chỉ cần gõ văn bản tự nhiên, theme sẽ tự động nhận diện và cập nhật ngay lập tức.
* **Tùy chọn nâng cao:** Nếu bạn muốn dùng link ảnh trực tuyến ngoài thay vì tải từ máy tính, bạn có thể gõ vào ô Content:
  ```text
  banner: https://link-anh-bia.jpg | avatar: https://link-avatar.jpg | bio: Lời giới thiệu của bạn | name: Tên của bạn
  ```

---

### 3.5. Cơ Chế Smart Fallback Tự Động (Chống Lỗi Cho Blog Mới Cài Đặt)
Từ phiên bản này, theme tích hợp cơ chế **Smart Fallback** toàn diện:
* **Tự động lấy bài mới nhất:** Nếu bạn cấu hình widget lọc theo nhãn (như `@Tiêu điểm`, `@Nổi bật`, `@Điểm tin`,...) nhưng blog của bạn chưa kịp gắn nhãn đó, widget sẽ **tự động lấy các bài viết mới nhất** để hiển thị lấp đầy, thay vì báo lỗi "Không thể tải nội dung mục này."
* **Trích dẫn chiêm nghiệm dự phòng:** Nếu widget Trích dẫn (`quote`) chưa có bài gắn nhãn `@Quote`, theme sẽ tự động hiển thị câu danh ngôn triết lý nghệ thuật mặc định.
* **Gõ câu nói trực tiếp vào widget Trích dẫn:** Bạn có thể mở bất kỳ widget trích dẫn nào và gõ thẳng câu nói tâm đắc của bạn vào ô **Nội dung (Content)** (Ví dụ: `"Cuộc sống là một hành trình. - Khuyết danh"`), widget sẽ hiển thị ngay câu nói đó!
* **Dự phòng Menu & Danh mục khi blog mới:** Nếu bạn chưa kịp tạo menu (`LinkList1`), liên kết mạng xã hội (`LinkList4`) hay thanh danh mục (`Label1`), theme tự động hiển thị các đề mục mẫu hoàn chỉnh, đảm bảo blog luôn sống động và đầy đủ cấu trúc.

---

## CHƯƠNG 4: CÁCH THÊM MỚI WIDGET TÙY Ý (+ ADD A GADGET)

Bạn có thể thêm **bao nhiêu widget tùy thích** vào bất kỳ vị trí nào có nút **"+ Thêm tiện ích"** (+ Add a Gadget) theo 2 cách cực kỳ nhanh:

### Cách 1: Gõ Cú Pháp Ngắn (Khuyên Dùng)
1. Bấm **"+ Thêm tiện ích"** ➔ Chọn **"HTML/JavaScript"**.
2. Nhập **Title** (Tên widget của bạn).
3. Trong ô **Content**, chỉ cần gõ đúng 1 dòng:
   * **Tạo widget Trích dẫn:** `pattern: quote | label: Triết lý`
   * **Tạo widget Điểm tin:** `pattern: digest | label: Công nghệ | limit: 4`
   * **Tạo widget Top đọc nhiều:** `pattern: ranked | sort: views | limit: 5`
   * **Tạo widget Tiêu điểm:** `pattern: spotlight | label: Tiêu điểm`
4. Bấm **SAVE**. Theme sẽ tự động chuyển đổi thành widget bài viết tương ứng!

### Cách 2: Sao Chép Mã Trực Quan Từ Trang Preview (`preview.html`)
1. Mở file `src/preview.html` trên máy tính bằng trình duyệt.
2. Mở bảng **Bộ Tạo Mã Tiện Ích (Interactive Playground)**:
   * Chọn kiểu giao diện (Spotlight, Ranked, Quote, Digest).
   * Nhập tên nhãn, số lượng bài, tích chọn bật/tắt ảnh thu nhỏ hoặc đoạn tóm tắt.
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
