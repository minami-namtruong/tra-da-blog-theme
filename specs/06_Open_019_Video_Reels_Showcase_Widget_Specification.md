# ĐẶC TẢ KỸ THUẬT: TIỆN ÍCH VIDEO & VOICE REELS BÁN CHÉO NỘI DUNG (VIDEO & VOICE REELS SHOWCASE WIDGET)

- **Mã spec:** OPEN_019 | **Phiên bản:** 1.0.0 | **Trạng thái:** Open | **Ngày:** 21/09/2026
- **Dự án:** Trà Đá Blog (Blogger Editorial Theme - Blogspot XML v3)
- **Tài liệu tham chiếu:** [01_Done_007_Flexible_Special_Posts_Widget_Specification.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/01_Done_007_Flexible_Special_Posts_Widget_Specification.md), [01_Done_018_Standalone_Series_Showcase_Widget_Specification.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/01_Done_018_Standalone_Series_Showcase_Widget_Specification.md), [04_Idea_017_Editorial_Theme_Backlog_And_Widget_Enhancements_Specification.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/04_Idea_017_Editorial_Theme_Backlog_And_Widget_Enhancements_Specification.md)

---

## 1. TỔNG QUAN & MỤC TIÊU DỰ ÁN (OVERVIEW & OBJECTIVES)

### 1.1. Bối cảnh & Nhu cầu nghiệp vụ
Trong kỷ nguyên tiêu thụ nội dung đa phương tiện, các nền tảng mạng xã hội (Facebook Reels, TikTok, YouTube Shorts) đã định hình thói quen tiếp nhận thông tin dạng video/âm thanh ngắn tỉ lệ dọc (9:16). 

Đối với **Trà Đá Blog** — một blog định hình theo phong cách **Editorial Profile & Thought Leadership**:
- Tác giả thường xuyên sản xuất nội dung kết hợp: bài viết phân tích chuyên sâu đi kèm clip ngắn, video đánh giá thực tế, hoặc tập âm thanh tâm sự (voice/podcast).
- Tác giả triển khai **chiến lược bán chéo nội dung (Cross-sale Content & Affiliate Marketing)** trên diện rộng: phần lớn bài viết đều gắn các đường link video giới thiệu hoặc voice chia sẻ sản phẩm / dịch vụ.
- Cần một tiện ích **Trình diễn Video & Voice Reels (Video & Voice Reels Showcase Widget)** có giao diện trực quan, linh động ở mọi vị trí trên blog, vừa gia tăng thời gian độc giả ở lại trang (Time-on-Site), vừa tối ưu hóa tỷ lệ chuyển đổi nhấp chuột vào bài viết bán hàng.

### 1.2. Mục tiêu kỹ thuật cốt lõi
1. **Tích hợp mở rộng vào hệ thống `special-posts` hiện có:** Kế thừa kiến trúc **Pluggable Pattern Strategy** sẵn có trong `src/scripts/special-posts.js` (`pattern: reels`), sử dụng chung bộ nạp feed song song, cơ chế cache `sessionStorage` (5 phút), parser cấu hình và bộ chống giật khung hình (Zero-CLS Skeleton Shimmer).
2. **Khung hình đứng 9:16 phong cách Reels:** Dàn hàng ngang có thanh trượt cảm ứng (Touch Slider / Carousel), hỗ trợ cuộn mượt bằng CSS Scroll Snap và 2 nút điều hướng Trái / Phải.
3. **Phân cấp nội dung thông minh (`@video-hot` & `@video`):**
   - Phân loại rõ video chiến dịch bán chạy (`@video-hot`) và video thường (`@video`).
   - Ưu tiên hiển thị bài Hot ở các "Vị trí vàng" (Vị trí 1 và 2) để tối ưu hiển thị trên màn hình di động.
   - Tỷ lệ phân bổ mục tiêu: 60% Hot : 40% Thường, kèm cơ chế tự động bù trừ nếu thiếu bài.
4. **Cơ chế bóc tách đa nền tảng (Universal Media Extraction):** Tự động nhận diện YouTube (cả Shorts và link thường), TikTok, Facebook Reels, file trực tiếp HTML5 Video (`.mp4`, `.webm`) và Audio / Voice (`.mp3`, podcast).
5. **Hiệu năng cao — Kỹ thuật Facade (Click to Play):** Tuyệt đối không nhúng hàng loạt thẻ iframe khi tải trang ban đầu để bảo vệ điểm số Google PageSpeed / Lighthouse (100 điểm). Chỉ nạp player khi độc giả click vào nút Play.
6. **Thích ứng linh hoạt theo dữ liệu (Dynamic Adaptive & Zero Waste):** Cấu hình tối đa từ `1` đến `10` khung hình. Nếu số video thực tế ít hơn thì tự động co lại đúng số lượng đó; nếu không có video nào thì widget tự động ẩn hoàn toàn khỏi DOM (`display: none`).
7. **Nhận diện ngữ cảnh hiển thị (Context-Aware):** Tự động chuyển sang chế độ **1 Frame xoay tua ngẫu nhiên** khi đặt ở Cột bên (Sidebar), hoặc chế độ **Thanh trượt dàn ngang** khi đặt ở Đầu trang hoặc Trong luồng bài viết chính.

---

## 2. QUY CHUẨN NHÃN & CHIẾN LƯỢC NẠP DỮ LIỆU (LABELS & FEED STRATEGY)

### 2.1. Hệ thống Nhãn Phân Cấp (Hierarchical Label Tags)
Tuân thủ chuẩn quy tắc nhãn tính năng tiền tố `@` của theme:
- Nhãn cơ sở: **`@video`** — Gắn cho tất cả bài viết có chứa video hoặc audio/voice.
- Nhãn chiến dịch: **`@video-hot`** — Gắn thêm cho các bài viết có video bán chéo chủ lực, sản phẩm trong đợt khuyến mãi cao điểm hoặc nội dung viral cần đẩy mạnh.

> [!NOTE]
> Nhãn có tiền tố `@` đã được lọc tự động bởi `src/components/category-tabs.xml` nên sẽ **không bao giờ xuất hiện làm rối thanh chuyên mục chính** trên đầu trang blog.

### 2.2. Chiến lược Tối Ưu Nạp Feed (Single-Request Feed Optimization)
- Để đảm bảo tốc độ tải trang nhanh nhất ngay cả khi blog có hàng trăm/hàng nghìn bài viết, widget **không tải toàn bộ blog về máy khách**, mà chỉ gửi **đúng 1 request feed duy nhất**:
  ```text
  /feeds/posts/default/-/@video?alt=json&max-results=40&orderby=published
  ```
- **Xử lý phía Client-side (JavaScript RAM):**
  1. Quét 40 bài trả về và phân loại ngay vào 2 mảng:
     - `poolHot`: Các bài viết có chứa nhãn `@video-hot`.
     - `poolRegular`: Các bài viết chỉ có nhãn `@video`.
  2. Bóc tách link media từ nội dung HTML của từng bài.
  3. Áp dụng thuật toán Fisher-Yates Shuffle để xáo trộn ngẫu nhiên từng giỏ bài.
  4. Lấy các bài Hot đưa vào vị trí ưu tiên (Vị trí 1, 2) và bù các bài Thường vào các vị trí còn lại theo tỷ lệ 60:40 cho đến khi đủ số khung `limit`.
- **Cơ chế Cache `sessionStorage`:** Toàn bộ kết quả bóc tách được lưu tạm trong trình duyệt trong **5 phút**. Độc giả chuyển đổi giữa các bài viết trong phiên đọc sẽ không tốn bất kỳ request mạng nào (tốc độ hiển thị 0ms).

---

## 3. CƠ CHẾ BÓC TÁCH & PHÁT PHƯƠNG TIỆN (MEDIA EXTRACTION & PLAYBACK ENGINE)

### 3.1. Ma trận Nhận diện Phương tiện (Platform Regex Matchers)

| Nền tảng | Dạng link hỗ trợ trong bài viết | Quy tắc trích xuất (Extraction Rule) | Nguồn Thumbnail | Phương thức phát khi Click Play |
| :--- | :--- | :--- | :--- | :--- |
| **YouTube (Chuẩn & Shorts)** | • `youtube.com/watch?v={id}`<br>• `youtu.be/{id}`<br>• `youtube.com/shorts/{id}`<br>• `youtube.com/embed/{id}` | Regex bắt Video ID (11 ký tự):<br>`/(?:youtu\.be\/\|v\/\|u\/\w\/\|embed\/\|shorts\/\|watch\?v=)([^#&?]*)/` | `https://i.ytimg.com/vi/{id}/hqdefault.jpg` *(Miễn phí, chuẩn HD, 0ms tải)* | Chèn `<iframe>` với `src="https://www.youtube.com/embed/{id}?autoplay=1&playsinline=1"` trực tiếp tại khung |
| **TikTok** | • `tiktok.com/@{user}/video/{id}` | Regex bắt TikTok Video ID:<br>`/tiktok\.com\/@[\w.-]+\/video\/(\d+)/` | Ảnh đại diện bài viết (Featured Image) | Chèn iframe embed chuẩn của TikTok: `https://www.tiktok.com/embed/v2/{id}` |
| **Facebook Reels** | • `facebook.com/reel/{id}`<br>• `facebook.com/watch/?v={id}` | Bắt toàn bộ URL hợp lệ của Facebook | Ảnh đại diện bài viết (Featured Image) | Chèn iframe Plugin Facebook Video Player chính thức |
| **Direct Video (MP4 / WebM)** | • Thẻ `<video src="...">`<br>• Đường link file `.mp4`, `.webm` | Regex: `/(https?:\/\/[^\s"'<>]+\.(?:mp4\|webm))/i` | Ảnh đại diện bài viết (hoặc poster video) | Render thẻ HTML5 `<video src="..." controls autoplay playsinline>` |
| **Audio / Voice / Podcast** | • Thẻ `<audio src="...">`<br>• Đường link file `.mp3`, `.m4a`<br>• Link Spotify / SoundCloud | Regex: `/(https?:\/\/[^\s"'<>]+\.(?:mp3\|m4a))/i` | Ảnh đại diện bài viết kèm hoạt ảnh sóng âm (Equalizer Waveform) | Render thẻ HTML5 `<audio src="..." controls autoplay>` hoặc mini embed |

### 3.2. Quy tắc Xử lý Nhiều Video Trong Cùng Một Bài (Multiple Videos Handling)
- **Quy tắc Bất Di Bất Dịch (Unique Post Guarantee):** Trong cùng một thời điểm hiển thị trên widget, **mỗi bài viết chỉ được xuất hiện tối đa 1 khung hình Reel duy nhất** (tránh tình trạng một bài viết chứa 3 video làm chiếm trọn 3 khung hình cạnh nhau, gây cảm giác lặp bài nhàm chán).
- **Cơ chế chọn clip đại diện (`extract` parameter):**
  - `extract: first` *(Mặc định)*: Luôn lấy video/voice đầu tiên tìm thấy trong bài viết.
  - `extract: random`: Nếu bài viết có $N$ video ($N \ge 2$), thuật toán bốc ngẫu nhiên 1 trong $N$ video đó làm đại diện cho bài viết.

### 3.3. Trải nghiệm Phát Phương Tiện (Facade Performance Pattern)
```
[Trạng thái Tĩnh - Mặc định]
┌───────────────────────────────┐
│ [🔥 HOT REEL]                 │  <-- Huy hiệu phân cấp
│                               │
│       Ảnh Thumbnail HD        │
│          ┌─────────┐          │
│          │   ▶    │          │  <-- Nút Play nổi bật
│          └─────────┘          │
│                               │
│  Tiêu đề bài viết ngắn gọn... │  <-- Gradient phủ tối
│  [ Xem chi tiết ➔ ]           │  <-- Nút CTA Cross-sale
└───────────────────────────────┘
               │
               │ (Người dùng Click vào nút Play)
               ▼
[Trạng thái Đang Phát - Inline Swap]
┌───────────────────────────────┐
│ <iframe> YouTube / TikTok     │
│ hoặc HTML5 Video / Audio      │
│ (Tự động phát - Autoplay)     │
│ [✕ Đóng]      [Xem bài viết ➔]│
└───────────────────────────────┘
```

---

## 4. THIẾT KẾ GIAO DIỆN & KHẢ NĂNG THÍCH ỨNG (UI/UX & CONTEXT MODES)

### 4.1. Quy chuẩn Thẩm mỹ & Tỉ lệ Khung Hình
- **Tỉ lệ khung hình (Aspect Ratio):** Chuẩn `9 / 16`. Kích thước cơ sở đề xuất trên desktop: chiều rộng `200px`, chiều cao `355px`.
- **Bo góc & Đổ bóng:** `border-radius: var(--radius-lg, 12px)`, `box-shadow: var(--shadow-sm)`.
- **Huy hiệu bài Hot (`.sp-reel-badge-hot`):** Nền gradient đỏ cam nổi bật, viền phát sáng nhẹ (`box-shadow: 0 0 12px rgba(255, 107, 107, 0.45)`).
- **Nút Kêu gọi hành động CTA (`.sp-reel-cta`):** Đặt gọn gàng ở đáy khung hình, chữ trắng có nền mờ chống lóa (`backdrop-filter: blur(8px); background: rgba(255,255,255,0.2)`), click mở bài viết trong tab mới hoặc chuyển trang.

### 4.2. Ba Ngữ Cảnh Hiển Thị Tự Động (Three Display Contexts)

#### Chế độ A: Cột Bên (Sidebar - Không gian hẹp $\le 360px$)
- **Nhận diện:** Nằm bên trong `<aside class="sidebar">` hoặc `@container (max-width: 360px)`.
- **Giao diện:** 
  - Chỉ hiển thị **đúng 1 khung Reel 9:16 duy nhất**, căn giữa hoặc chiếm 100% độ rộng widget.
  - Video được chọn ngẫu nhiên từ kho bài khi tải trang (ưu tiên bài Hot).
  - Có nút bấm nhỏ: **"🎲 Xem clip khác"** dưới chân để đổi sang video khác mà không cần tải lại trang.

#### Chế độ B: Đầu Trang / Dưới Category Banner (Wide / Full-width)
- **Nhận diện:** Nằm ở khu vực `main-above-feed` hoặc container rộng toàn màn hình.
- **Giao diện:**
  - Dàn hàng ngang từ mép trái sang mép phải.
  - Hiển thị từ 4 đến 5 khung hình cùng lúc trên màn hình lớn.
  - Hai nút điều hướng tròn trượt Trái / Phải (`sp-reels-btn-prev`, `sp-reels-btn-next`) nằm ở hai mép.

#### Chế độ C: Trong Luồng Bài Viết (Main Content / In-Feed / In-Post)
- **Nhận diện:** Nằm trong `.main-content` (bề rộng khoảng 750px – 800px, có sidebar ở cạnh).
- **Giao diện:**
  - Giới hạn chuẩn trong độ rộng của cột nội dung, **tuyệt đối không tràn lấn sang sidebar**.
  - Desktop: Hiển thị 3–4 khung cùng lúc.
  - Mobile: Hiển thị 1.5 khung hình để tạo gợi ý trực quan cho người dùng vuốt trượt ngang.

### 4.3. Cơ Chế Thích Ứng Số Lượng & Ẩn Rỗng (Zero-Waste Dynamic Adaptation)
Gọi $K$ là giới hạn cấu hình (`limit`, từ 1 đến 10, mặc định 10), và $M$ là số video thực tế tìm được:
- **Trường hợp $M = 0$:** Toàn bộ widget tự động ẩn hoàn toàn khỏi DOM (`container.style.display = 'none'`), không để lại bất kỳ tiêu đề thừa hay khoảng trống nào trên trang.
- **Trường hợp $M = 1$:** Chỉ hiển thị đúng 1 khung duy nhất, tự động ẩn 2 nút mũi tên trượt.
- **Trường hợp $1 < M < K$:** Hiển thị đúng $M$ khung hình (không hiển thị khung rỗng hay skeleton giả).
- **Trường hợp $M \ge K$:** Hiển thị đủ $K$ khung hình theo tỷ lệ phân bổ Hot : Thường.
- **Tự động ẩn nút mũi tên:** Khi tổng chiều rộng của các khung nhỏ hơn hoặc bằng chiều rộng hiển thị của khung chứa (`scrollWidth <= clientWidth`), nút mũi tên tự động ẩn đi.

---

## 5. BẢNG THAM SỐ CẤU HÌNH (CONFIGURATION SPECIFICATION)

Người dùng có thể cấu hình widget bằng cách gõ cú pháp ngắn gọn trong ô Content của tiện ích HTML/JavaScript trên Blogger Layout:

| Tham số | Kiểu dữ liệu | Mặc định | Dải cho phép | Ý nghĩa & Hành vi |
| :--- | :---: | :---: | :---: | :--- |
| **`pattern`** | String | `reels` | `reels` | Định danh kiểu hiển thị Reels Video Showcase. |
| **`title`** | String | `🎬 Video & Reels Nổi Bật` | Văn bản bất kỳ | Tiêu đề hiển thị đầu widget (hỗ trợ song ngữ dạng `VI \| EN`). |
| **`limit`** | Integer | `10` | `1` đến `10` | Số lượng khung video hiển thị tối đa trên thanh trượt. |
| **`fetch-count`** | Integer | `40` | `10` đến `100` | Số lượng bài viết nạp về từ Blogger Feed API để bóc tách video. |
| **`sort`** | Enum | `random` | `random` \| `latest` \| `oldest` | Thứ tự hiển thị các khung: ngẫu nhiên, mới nhất, hoặc cũ nhất. |
| **`labels`** | String | `@video` | Tên nhãn | Nhãn bài viết dùng để truy vấn feed. |
| **`hot-label`** | String | `@video-hot` | Tên nhãn | Nhãn bài viết ưu tiên cho chiến dịch bán chéo. |
| **`hot-ratio`** | Percentage | `60%` | `0%` đến `100%` | Tỷ lệ ưu tiên cho các bài Hot (tự động bù trừ nếu không đủ bài). |
| **`extract`** | Enum | `first` | `first` \| `random` | Cách chọn video khi bài viết có nhiều clip: lấy clip đầu tiên hay bốc ngẫu nhiên. |
| **`media`** | Enum | `all` | `all` \| `video` \| `audio` | Bộ lọc loại phương tiện: hiển thị cả video và audio, hoặc chỉ lấy 1 loại. |
| **`cta-text`** | String | `Xem chi tiết ➔` | Văn bản bất kỳ | Dòng chữ nút kêu gọi hành động dưới đáy khung Reel dẫn về bài viết. |
| **`mode`** | Enum | `auto` | `auto` \| `slider` \| `single` | Ép kiểu hiển thị: tự động nhận diện theo vị trí, hoặc ép buộc thanh trượt, hoặc ép buộc 1 khung. |

### Ví dụ cấu hình thực tế:

```text
pattern: reels
title: 🔥 Video & Đánh Giá Nổi Bật | Featured Reels
limit: 8
sort: random
hot-ratio: 60%
cta-text: Mua ngay & Ưu đãi ➔
```

---

## 6. KẾ HOẠCH TÍCH HỢP MÃ NGUỒN (CODEBASE ARCHITECTURE INTEGRATION)

### 6.1. Danh mục Tệp tin Cần Tác Động
1. **[MODIFY] [src/scripts/special-posts.js](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/src/scripts/special-posts.js):**
   - Đăng ký `reels: renderReelsPattern` vào bảng `PATTERN_RENDERERS` (dòng 29).
   - Bổ sung module bóc tách media: `extractPostMedia(post, opts)` (hỗ trợ YouTube, TikTok, FB, MP4, MP3).
   - Xây dựng hàm `renderReelsPattern(posts, opts)` xử lý phân loại Hot/Regular, thuật toán Fisher-Yates Shuffle, tỷ lệ 60:40, và cấu trúc HTML khung 9:16.
   - Thêm sự kiện Click to Play (Facade swap) và nút điều hướng trượt ngang (Prev / Next với `scrollBy`).
   - Xử lý nút "🎲 Đổi video khác" cho chế độ Sidebar.
2. **[MODIFY] [src/styles/special-posts.css](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/src/styles/special-posts.css):**
   - Thêm CSS cho khối container `.sp-reels-container`, thanh trượt `.sp-reels-track` (`overflow-x: auto; scroll-snap-type: x mandatory;`).
   - Style cho thẻ `.sp-reel-card` với `aspect-ratio: 9 / 16;`, gradient che bóng, badge Hot/Regular, nút Play trung tâm, nút CTA đáy thẻ.
   - Container Query `@container (max-width: 360px)` tối ưu riêng cho Sidebar.
3. **[MODIFY] [src/preview.html](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/src/preview.html):**
   - Bổ sung demo trực quan của `pattern: reels` ở 2 vị trí:
     - 1 widget Slider ngang rộng ở khu vực Main Content.
     - 1 widget Single Reel Card xoay tua ở Cột bên Sidebar.
4. **[COMPILE] [scripts/build.js](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/scripts/build.js):**
   - Biên dịch tự động ra [dist/theme.xml](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/dist/theme.xml).

---

## 7. TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)

- [ ] **AC-1 (Hiển thị 9:16 chuẩn):** Các khung video hiển thị đúng tỉ lệ dọc 9:16, không bị méo ảnh, bo góc và đổ bóng đồng bộ với Design System của theme.
- [ ] **AC-2 (Nhận diện Media đa nguồn):** Trích xuất chính xác Video ID và ảnh thumbnail HD từ các link YouTube (cả Shorts và thường), TikTok, Facebook, MP4 và MP3.
- [ ] **AC-3 (Phân cấp Hot / Regular):** Bài `@video-hot` được ưu tiên đứng ở vị trí 1 và 2, có huy hiệu nổi bật và viền sáng khác biệt.
- [ ] **AC-4 (Random không trùng lặp):** Khi bật chế độ `sort: random`, danh sách video được xáo trộn ngẫu nhiên; mỗi bài viết chỉ xuất hiện tối đa 1 lần trên widget.
- [ ] **AC-5 (Thích ứng số lượng & Ẩn rỗng):** Nếu có $M < limit$ thì hiển thị đúng $M$ khung; nếu $M = 0$ thì widget ẩn hoàn toàn khỏi màn hình mà không để lại khoảng trắng.
- [ ] **AC-6 (Chế độ Sidebar):** Khi đặt trong Cột bên Sidebar, widget tự động chuyển sang 1 khung duy nhất, có nút "🎲 Đổi video khác" hoạt động mượt mà.
- [ ] **AC-7 (Hiệu năng Click-to-Play):** Khi trang vừa tải xong, không có bất kỳ iframe video bên thứ 3 nào được tải; chỉ khi người dùng click vào nút Play thì player tương ứng mới được nạp và phát video.
- [ ] **AC-8 (Biên dịch thành công):** Lệnh `npm run build` hoàn tất không lỗi, `dist/theme.xml` được cập nhật đồng bộ.
