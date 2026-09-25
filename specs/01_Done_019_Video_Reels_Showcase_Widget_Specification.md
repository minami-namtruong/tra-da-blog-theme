# ĐẶC TẢ KỸ THUẬT: TIỆN ÍCH VIDEO & VOICE REELS BÁN CHÉO NỘI DUNG (VIDEO & VOICE REELS SHOWCASE WIDGET)

- **Mã spec:** DONE_019 | **Phiên bản:** 2.0.0 | **Trạng thái:** Done | **Ngày:** 25/09/2026
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
- **Trăn trở cốt lõi về trải nghiệm (UX Core Problem):** Nếu khung hình Reels chỉ hiển thị ảnh đại diện tĩnh (static thumbnail) trơ trọi kèm nút Play, độc giả sẽ lướt qua như một bức ảnh thông thường, làm mất hoàn toàn tính hấp dẫn của định dạng Reels. Widget **phải chuyển động sống động (Living Canvas)**, mang đầy đủ các dấu hiệu nhận diện đặc trưng của Reels (hiệu ứng hover Cinematic Zoom phóng to mượt mà, sóng âm thanh nhảy múa, nốt nhạc chạy chữ, rạp chiếu Reels Lightbox chuyên dụng) mà vẫn không gây giật lag trang.
- **Tiến hóa thiết kế (Design Evolution v2.0):** Thay vì các khung thẻ hộp thô cứng có quá nhiều viền bao quanh (double border) hoặc kích thước chưa cân đối, giao diện được nâng cấp toàn diện theo ngôn ngữ thiết kế **Facebook Reels Feed**:
  1. Thẻ Unibody Full-Bleed 175px chuẩn 9:16 với Title Overlay chìm trên nền dải chuyển màu đen (dark gradient), mép trên thoáng sạch không có vạch kẻ thừa.
  2. Khung hộp Facebook Reels Shelf thanh lịch (`border: 1px solid var(--border-color); border-radius: 14px`), header tối giản gồm icon clapperboard và tiêu đề "Video" cùng nút menu `···`.
  3. Cột bên Sidebar tràn viền 100% (Edge-to-Edge) triệt tiêu viền thừa, tự động xoay tua video sau 6 giây (Auto-advance) kèm tính năng Tạm dừng thông minh (Smart Pause) và cặp nút điều hướng tròn kính mờ chỉ xuất hiện khi rê chuột (Hover Reveal).
  4. Căn chỉnh mép trên (Top alignment) đồng trục hoàn hảo giữa Main Content và Sidebar.

### 1.2. Mục tiêu kỹ thuật cốt lõi
1. **Tích hợp mở rộng vào hệ thống `special-posts` hiện có:** Kế thừa kiến trúc **Pluggable Pattern Strategy** sẵn có trong `src/scripts/special-posts.js` (`pattern: reels`), sử dụng chung bộ nạp feed song song, kế thừa cơ chế cache `sessionStorage` dùng chung của theme (có thể cấu hình thời gian sống qua `window.__EDITORIAL_CACHE_TTL__`, mặc định 60 phút), parser cấu hình và bộ chống giật khung hình (Zero-CLS Skeleton Shimmer).
2. **Khung hình đứng 9:16 Unibody 175px chuẩn Facebook Reels (Living Canvas):**
   - Thiết kế thẻ Unibody 175px: Toàn bộ ảnh thumbnail/video phủ trọn 100% diện tích thẻ từ trên xuống dưới (`aspect-ratio: 9 / 16; width: 175px; border-radius: 12px; background: #000`).
   - Tiêu đề bài viết phủ chìm trực tiếp lên thẻ (Title Overlay) trên nền dải chuyển màu đen mờ mịn ở đáy thẻ (`linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)`).
   - Nút menu hành động 3 chấm dọc `⋮` ở góc trên bên phải thẻ.
   - Nút Play trung tâm có hiệu ứng xung nhịp (Pulse ring animation) kích thước 42px.
   - **Hover Cinematic Zoom & Micro-interactions:** Phóng to nhẹ mượt mà (`scale(1.06)`), nút Play tỏa ánh hào quang khi rê chuột.
   - **Khung Poster Nhận Diện Thương Hiệu (Branded Fallback Poster):** Tự động render poster màu gradient phong cách mạng xã hội (Facebook Reel, TikTok neon, MP4, Audio) khi bài viết chưa đính kèm ảnh đại diện.
   - **Voice Equalizer Waveform:** Sóng nhạc dao động liên tục đối với các tệp Audio/Podcast để độc giả nhận diện tức thì đây là file âm thanh đang sẵn sàng nghe.
   - **Bộ nhận diện chuẩn Reels:** Huy hiệu `🔥 HOT`, thời lượng video (`0:45`), và dòng chữ âm thanh chạy ngang (Ticker Marquee). Giao diện mép trên tinh giản, thoáng đãng không dùng vạch kẻ phân đoạn.
3. **Cơ chế tương thích tỉ lệ khung hình (16:9 Landscape vs 9:16 Portrait Shorts):**
   - Áp dụng kỹ thuật **Blurred Background Fill** chuẩn mực của TikTok/Reels đối với các video ngang 16:9 truyền thống của YouTube: Giữ nguyên vẹn 100% hình ảnh không bị cắt xén, phủ nền mờ nghệ thuật phía sau và biến khoảng trống trên/dưới thành khu vực an toàn cho tiêu đề và tương tác.
   - Tràn viền 100% (`object-fit: cover`) đối với các video vốn dĩ đã là tỉ lệ dọc 9:16 (YouTube Shorts, TikTok).
4. **Phân cấp nội dung thông minh (`@video-hot` & `@video`):**
   - Phân loại rõ video chiến dịch bán chạy (`@video-hot`) và video thường (`@video`).
   - Ưu tiên hiển thị bài Hot ở các "Vị trí vàng" (Vị trí 1 và 2) để tối ưu hiển thị trên màn hình di động.
   - Tỷ lệ phân bổ mục tiêu: 60% Hot : 40% Thường, kèm cơ chế tự động bù trừ nếu thiếu bài.
5. **Cơ chế bóc tách đa nền tảng (Universal Media Extraction):** Tự động nhận diện YouTube (cả Shorts và link thường), TikTok, Facebook Reels, file trực tiếp HTML5 Video (`.mp4`, `.webm`) và Audio / Voice (`.mp3`, podcast).
6. **Hiệu năng cao — Kỹ thuật Facade (Click to Play):** Tuyệt đối không nhúng hàng loạt thẻ iframe khi tải trang ban đầu để bảo vệ điểm số Google PageSpeed / Lighthouse (100 điểm). Chỉ nạp player đầy đủ khi độc giả click vào nút Play.
7. **Rạp chiếu Reels Lightbox Theater Modal chuyên dụng:** Khi người dùng bấm Play ở chế độ `play-mode: modal` (mặc định), mở màn hình trình chiếu Reels toàn màn hình với nền mờ ảo diệu (`backdrop-filter: blur(16px)`), hỗ trợ điều hướng clip kế tiếp/clip trước bằng phím mũi tên bàn phím (`↑`/`↓` hoặc `←`/`→`) và cử chỉ vuốt touch (swipe up/down) chuẩn TikTok / Instagram Reels.
8. **Nhận diện ngữ cảnh hiển thị linh hoạt (Context-Aware):**
   - **Chế độ Main Content (Slider Mode):** Khung hộp Facebook Reels Shelf bo góc 14px, header icon + `"Video"` + `···`, thanh trượt ngang nhiều thẻ 175px có scroll snap và cặp nút điều hướng tròn trắng 40px nổi khối. Căn thẳng đỉnh (`margin-top: 0`) với Sidebar.
   - **Chế độ Cột bên (Sidebar / Single Mode):** Tràn viền 100% (Edge-to-Edge) loại bỏ viền và padding thừa của widget sidebar; ẩn tiêu đề lặp lại; tự động chuyển video mỗi 6 giây (Auto-advance) kèm tính năng Tạm dừng thông minh (Smart Pause); cặp nút Prev/Next kính mờ ẩn mặc định và chỉ hiện khi hover (Hover Reveal).
9. **Thích ứng linh hoạt theo dữ liệu (Dynamic Adaptive & Zero Waste):** Cấu hình tối đa từ `1` đến `10` khung hình. Nếu số video thực tế ít hơn thì tự động co lại đúng số lượng đó; nếu không có video nào thì widget tự động ẩn hoàn toàn khỏi DOM (`display: none`).

---

## 2. QUY CHUẨN NHÃN & CHIẾN LƯỢC NẠP DỮ LIỆU (LABELS & FEED STRATEGY)

### 2.1. Hệ thống Nhãn Phân Cấp (Hierarchical Label Tags)
Tuân thủ chuẩn quy tắc nhãn tính năng tiền tố `@` của theme:
- Nhãn cơ sở: **`@video`** — Gắn cho tất cả bài viết có chứa video hoặc audio/voice.
- Nhãn chiến dịch: **`@video-hot`** (hoặc alias **`@hotvideo`**) — Gắn thêm cho các bài viết có video bán chéo chủ lực, sản phẩm trong đợt khuyến mãi cao điểm hoặc nội dung viral cần đẩy mạnh. Hệ thống tự động nhận diện cả hai nhãn này.

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
  2. Bóc tách link media từ nội dung HTML của từng bài (đảm bảo mỗi bài viết chỉ xuất hiện tối đa 1 khung hình Reel).
  3. Áp dụng thuật toán Fisher-Yates Shuffle để xáo trộn ngẫu nhiên từng giỏ bài.
  4. Lấy các bài Hot đưa vào vị trí ưu tiên (Vị trí 1, 2) và bù các bài Thường vào các vị trí còn lại theo tỷ lệ 60:40 cho đến khi đủ số khung `limit`.
- **Cơ chế Cache `sessionStorage`:** Kết quả bóc tách được lưu tạm trong trình duyệt theo cơ chế cache dùng chung của theme (mặc định 60 phút, có thể tùy biến qua `window.__EDITORIAL_CACHE_TTL__`). Độc giả chuyển đổi giữa các bài viết trong phiên đọc sẽ không tốn bất kỳ request mạng nào (tốc độ hiển thị 0ms).

---

## 3. CƠ CHẾ BÓC TÁCH & TRẢI NGHIỆM CHUYỂN ĐỘNG SỐNG ĐỘNG (LIVING CANVAS & PLAYBACK ENGINE)

### 3.1. Ma trận Nhận diện Phương tiện (Platform Regex Matchers)

| Nền tảng | Dạng link hỗ trợ trong bài viết | Quy tắc trích xuất (Extraction Rule) | Nguồn Thumbnail & Preview Động | Phương thức phát khi Click Play |
| :--- | :--- | :--- | :--- | :--- |
| **YouTube (Chuẩn & Shorts)** | • `youtube.com/watch?v={id}`<br>• `youtu.be/{id}`<br>• `youtube.com/shorts/{id}`<br>• `youtube.com/embed/{id}` | Regex bắt Video ID (11 ký tự):<br>`/(?:youtu\.be\/\|v\/\|u\/\w\/\|embed\/\|shorts\/\|watch\?v=)([^#&?]*)/` | **Ảnh tĩnh:** `i.ytimg.com/vi/{id}/hqdefault.jpg`<br>**Hiệu ứng hover:** Cinematic Zoom `scale(1.06)` & Play Pulse Ring | Mở Reels Theater Modal hoặc chèn `<iframe>` với `src="https://www.youtube.com/embed/{id}?autoplay=1&playsinline=1"` trực tiếp tại khung |
| **TikTok** | • `tiktok.com/@{user}/video/{id}` | Regex bắt TikTok Video ID:<br>`/tiktok\.com\/@[\w.-]+\/video\/(\d+)/` | Ảnh đại diện bài viết hoặc **Branded TikTok Poster** (Neon Gradient & Logo) nếu chưa có ảnh | Chèn iframe embed chuẩn TikTok, tích hợp sẵn **Nút Bật/Tắt Tiếng (`unMute`)** qua `postMessage` |
| **Facebook Reels** | • `facebook.com/reel/{id}`<br>• `facebook.com/watch/?v={id}` | Bắt toàn bộ URL hợp lệ của Facebook | Ảnh đại diện bài viết hoặc **Branded Facebook Poster** (Gradient xanh & Logo) nếu chưa có ảnh | Chèn iframe `plugins/video.php` chính thức của Meta; người xem chạm 1 lần vào biểu tượng Loa (🔇) để bật tiếng |
| **Direct Video (MP4 / WebM)** | • Thẻ `<video src="...">`<br>• Đường link file `.mp4`, `.webm` | Regex: `/(https?:\/\/[^\s"'<>]+\.(?:mp4\|webm))/i` | Ảnh đại diện bài viết hoặc **Branded Video Poster** | Bật âm thanh, hiện full controls HTML5 video |
| **Audio / Voice / Podcast** | • Thẻ `<audio src="...">`<br>• Đường link file `.mp3`, `.m4a`<br>• Link Spotify / SoundCloud | Regex: `/(https?:\/\/[^\s"'<>]+\.(?:mp3\|m4a))/i` | Ảnh đại diện bài viết kết hợp **Hiệu ứng sóng âm dao động (Equalizer Waveform)** nhảy múa liên tục | Render thẻ HTML5 `<audio src="..." controls autoplay>` hoặc mini embed |

### 3.2. Cơ Chế Tương Tác Sống Động (Living Canvas & Hover Engine)

Widget tích hợp hệ thống hiệu ứng chuyển động đa tầng:

#### A. Hiệu Ứng Tương Tác Vi Mô (Cinematic Zoom & Hover Engine)
- **Trên máy tính (Desktop Hover):**
  - Khi chuột chưa rê vào: Khung hình hiển thị ảnh thumbnail sắc nét (HQ).
  - Khi rê chuột vào (`mouseenter` / `:hover`):
    - Thẻ card nhấc nổi nhẹ (`translateY(-3px)`), ảnh đại diện phóng to mượt mà (`transform: scale(1.06)`).
    - Nút Play trung tâm sáng rực và phóng to (`transform: scale(1.14)`), các vòng sóng xung nhịp (`sp-reel-play-pulse`) tỏa ra dồn dập.
    - Không sử dụng file `an_webp` cũ của Google để tránh mã lỗi HTTP 403 Forbidden do YouTube siết chặt chính sách bảo mật máy chủ.
  - Khi rời chuột (`mouseleave`): Trở về kích thước ban đầu mượt mà, giải phóng tài nguyên CPU.
- **Trên điện thoại di động (Smart In-View Optimization):**
  - Sử dụng CSS thuần tối ưu GPU, không chạy script nền nặng nề, đảm bảo thiết bị di động luôn mượt và mát máy.

#### B. Trực Quan Hóa Âm Thanh (Audio Equalizer Waveform & Vinyl Disc)
- Đối với các bài viết có file âm thanh/voice:
  - **Dải sóng âm chuyển động (Equalizer Waveform Bars):** 4–5 cột sóng nhảy lên xuống theo nhịp điệu CSS animation ở góc dưới, mô phỏng trực quan luồng âm thanh đang sẵn sàng phát.
  - **Icon đĩa than xoay nhẹ (Spinning Disc):** Mô phỏng đĩa nhạc quay phong cách TikTok/Instagram Reels.
  - **Dòng chữ nhạc chạy ngang (Audio Marquee Ticker):** Chạy dòng text `♫ Âm thanh bài viết - Trà Đá Blog...` kèm icon nốt nhạc rung rinh.

#### C. Bộ Nhận Diện Chi Tiết Chuẩn Reels (Reels Visual Cues)
1. **Mép trên tinh giản & thoáng đãng:** Không dùng vạch kẻ Story phân đoạn, giúp ảnh thumbnail hiển thị trọn vẹn, không bị rối mắt.
2. **Huy hiệu nổi bật (Top Badges):** Huy hiệu nhận diện `🔥 HOT` cho video chiến dịch, huy hiệu thời lượng (ví dụ `🎬 0:45` hoặc `🎙️ 2:15`) hiển thị rõ nét ở góc trên bên trái.
3. **Nút menu 3 chấm dọc (`⋮`):** Nằm ở góc trên bên phải thẻ, tăng tính chân thực chuẩn giao diện Reels.
4. **Nút Play phát xung nhịp (Pulse Animation):** Nút Play trung tâm có hiệu ứng sóng mờ tỏa ra liên tục (`pulse ring animation`), kích thích hành vi nhấp chuột của độc giả.
5. **Title Overlay đáy thẻ:** Tiêu đề bài viết phủ chìm trên dải màu chuyển tối ở chân thẻ, kèm nút CTA chuyển đổi cao.

---

## 4. THIẾT KẾ GIAO DIỆN & TƯƠNG THÍCH TỈ LỆ KHUNG HÌNH (UI/UX & ASPECT RATIO ADAPTATION)

### 4.1. Giải Pháp Hiển Thị Video Ngang 16:9 Trong Khung Dọc 9:16 (Blurred Background Fill)

Do phần lớn video YouTube được sản xuất ở định dạng **ngang truyền thống (16:9)**, nếu nhồi trực tiếp vào khung dọc 9:16 sẽ nảy sinh mâu thuẫn: phóng to thì bị cắt mất 2 bên mép (mất nội dung/phụ đề), để viền đen thì đơn điệu.

Widget áp dụng giải pháp **"Blurred Background Fill" (Nền Mờ Nghệ Thuật)** chuẩn mực của TikTok/Facebook Reels:

```
┌──────────────────────────────────────┐
│ [ 🎬 03:45 ]                           │  <-- Nửa trên: Huy hiệu thời lượng / HOT
│                                      │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  <-- Lớp nền mờ nghệ thuật
│ ┌──────────────────────────────────┐ │      (Chính là video/ảnh được zoom to
│ │                                  │ │       và làm mờ: blur 20px)
│ │      VIDEO 16:9 NẰM Ở GIỮA       │ │
│ │       (SẮC NÉT TRỌN VẸN 100%)    │ │  <-- Video 16:9 hiển thị trọn vẹn,
│ │                                  │ │      KHÔNG BỊ CẮT MẤT NỘI DUNG HAI BÊN!
│ └──────────────────────────────────┘ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                      │
│ [🔥 HOT]                             │  <-- Nửa dưới: Tận dụng khoảng trống
│ Tiêu đề bài viết bán chéo...         │      Title Overlay phủ chìm trên nền đen
│ [ Xem bài viết & Ưu đãi ➔ ]          │  <-- Nút CTA chuyển đổi cao
└──────────────────────────────────────┘
               │
               │ (Người dùng Click vào nút Play)
               ▼
[Trạng thái Rạp Chiếu Modal hoặc Inline Player]
┌────────────────────────────────────────────────────────┐
│  ✕ Đóng (Esc)                  Reels Theater Modal     │
│                                                        │
│  ◀ Clip trước    ┌──────────────────────────┐    ▶ Sau │
│  (Mũi tên Trái)  │ <iframe> YouTube 9:16    │  (Phím   │
│                  │ hoặc 16:9 Blurred Player │    Phải) │
│                  │ (Tự động phát có tiếng)  │          │
│                  └──────────────────────────┘          │
│                  [🔥 HOT] Tiêu đề bài viết...          │
│                  [ Mua ngay / Xem bài viết ➔ ]         │
└────────────────────────────────────────────────────────┘
```

#### Ưu thế vượt trội:
1. **Bảo toàn 100% hình ảnh:** Không bị crop mất nội dung, phụ đề hay góc quay của video.
2. **Khu vực vàng chuyển đổi:** Khoảng trống phía dưới được tận dụng hoàn hảo làm khu vực Title Overlay và nút CTA ("Xem chi tiết & Ưu đãi ➔").
3. **Thích ứng tự động (Auto-Aspect Detection):**
   - Nếu là **YouTube Shorts / TikTok** (đã là 9:16): Tự động hiển thị `object-fit: cover` tràn viền toàn bộ khung.
   - Nếu là **Video 16:9 thông thường**: Tự động kích hoạt chế độ **Blurred Background Fill**.

### 4.2. Quy chuẩn Thẩm mỹ Chuẩn Facebook Reels (Aesthetic Standards)

| Thành phần | Đặc tả kỹ thuật (CSS & Design Tokens) | Mô tả chi tiết |
| :--- | :--- | :--- |
| **Thẻ Unibody Card** | `width: 175px; aspect-ratio: 9 / 16; border-radius: 12px; background: #000; overflow: hidden;` | Kích thước thon gọn chuẩn Facebook Reels, toàn bộ media chiếm trọn 100% diện tích không viền ngăn cách. |
| **Title Overlay** | `linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)` | Tiêu đề bài viết phủ chìm trên dải gradient đen ở đáy thẻ, chữ màu trắng rõ ràng, không bị chói. |
| **Khung Hộp Facebook Shelf** | `border: 1px solid var(--border-color); border-radius: 14px; background: var(--bg-card); padding: 0.75rem 0.85rem 0.85rem;` | Khung viền đơn mảnh bao quanh hàng Reels ở Main Content, bo góc mềm mại 14px. |
| **Header Facebook Shelf** | `display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;` | Gồm cụm icon Clapperboard SVG + Tiêu đề **"Video"** (`1.05rem; font-weight: 700`) + nút menu `···`. |
| **Nút Trượt Tròn Nổi Khối** | `width: 40px; height: 40px; border-radius: 50%; background: #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.18);` | Nút tròn màu trắng có mũi tên xám đậm, lơ lửng tại 2 mép thẻ, tự ẩn khi không thể cuộn thêm. |
| **Nút Play Xung Nhịp** | `width: 42px; height: 42px; border-radius: 50%; animation: spPulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;` | Nút Play tròn màu trắng ở tâm thẻ, phát hiệu ứng sóng lan tỏa kích thích click. |
| **Căn Đỉnh Đồng Trục (Top Align)** | `#main-above-feed > :first-child { margin-top: 0 !important; }` | Khử hoàn toàn margin trên đỉnh của widget đầu tiên để mép trên của widget Reels thẳng hàng chuẩn xác với widget Sidebar. |

### 4.3. Ba Ngữ Cảnh Hiển Thị Tự Động (Three Display Contexts)

#### Chế độ A: Cột Bên (Sidebar / Single Mode — Không gian hẹp $\le 360px$)
- **Nhận diện:** Nằm bên trong `<aside class="sidebar">`, container hẹp hoặc cấu hình `mode: single`.
- **Thiết kế Tràn Viền Tuyệt Đối (Edge-to-Edge):**
  - Tự động gán selector `:has(.pattern-reels)` và class `.sidebar-widget--edge-to-edge` để triệt tiêu toàn bộ `padding: 0 !important`, `border: none !important`, `background: transparent !important`, `box-shadow: none !important` của widget sidebar cha.
  - Card chiếm trọn **100% bề rộng cột bên**, bo góc mềm mại `16px`, không còn hiện tượng "video lọt thỏm" hay viền lồng viền (double border).
  - Ẩn hoàn toàn header title thừa (`.sp-reels-header { display: none !important; }`).
- **Tự động chuyển clip sau 6 giây (Auto-advance Carousel):**
  - Cứ mỗi 6 giây, widget tự động chuyển sang video kế tiếp trong danh sách bài viết đã bóc tách.
  - Hiệu ứng chuyển cảnh trượt mượt mà (smooth crossfade & slide transition).
- **Tính năng Tạm dừng thông minh (Smart Pause):**
  - Tự động dừng bộ đếm 6s khi người dùng rê chuột vào card (`mouseenter`), khi đang mở rạp chiếu modal, hoặc khi video đang phát trực tiếp.
  - Tiếp tục đếm khi người dùng rời chuột (`mouseleave`).
- **Giao diện mép trên tinh giản:** Không dùng vạch kẻ Story phân đoạn, giữ trọn vẹn 100% diện tích ảnh bìa sắc nét.
- **Nút điều hướng Hover Reveal:**
  - Cặp nút tròn kính mờ Prev / Next (`.sp-reels-single-nav`) ẩn mặc định (`opacity: 0; pointer-events: none`).
  - Chỉ hiện mượt mà khi người dùng rê chuột vào card (`:hover`), cho phép chủ động bấm lướt clip bất cứ lúc nào.
  - Thay thế hoàn toàn nút "🎲 Xem clip khác" cũ.

#### Chế độ B: Đầu Trang (Wide / Above Feed) & Chế độ C: Trong Luồng Bài Viết (In-Feed)
- **Nhận diện:** Nằm ở vùng `main-above-feed` hoặc trong cột bài viết `.main-content`.
- **Giao diện:**
  - Được bọc trong khung Facebook Reels Shelf viền mảnh bo góc 14px, header icon + "Video" + `···`.
  - Dàn hàng ngang nhiều thẻ 175px unibody, hỗ trợ cảm ứng vuốt touch trên mobile và cuộn mượt bằng CSS Scroll Snap.
  - Cặp nút tròn trắng 40px nổi khối ở 2 đầu giúp cuộn trượt mượt mà trên desktop.
  - Căn thẳng hàng mép trên tuyệt đối với Cột bên Sidebar (`margin-top: 0`).

---

## 5. BẢNG THAM SỐ CẤU HÌNH (CONFIGURATION SPECIFICATION)

Người dùng có thể cấu hình widget bằng cách gõ cú pháp ngắn gọn trong ô Content của tiện ích HTML/JavaScript trên Blogger Layout:

| Tham số | Kiểu dữ liệu | Mặc định | Dải cho phép | Ý nghĩa & Hành vi |
| :--- | :---: | :---: | :---: | :--- |
| **`pattern`** | String | `reels` | `reels` | Bắt buộc, định danh kiểu hiển thị Reels Video Showcase. |
| **`title`** | String | `Video` | Văn bản bất kỳ | Tiêu đề hiển thị đầu widget (mặc định là `Video`, hỗ trợ song ngữ `VI \| EN`). |
| **`limit`** | Integer | `10` | `1` đến `10` | Số lượng khung video hiển thị tối đa trên thanh trượt. |
| **`fetch-count`** | Integer | `40` | `10` đến `100` | Số lượng bài viết nạp về từ Blogger Feed API để bóc tách video. |
| **`sort`** | Enum | `random` | `random` \| `latest` \| `oldest` | Thứ tự hiển thị các khung: ngẫu nhiên, mới nhất, hoặc cũ nhất. |
| **`labels`** | String | `@video` | Tên nhãn | Nhãn bài viết dùng để truy vấn feed. |
| **`hot-label`** | String | `@video-hot` | Tên nhãn | Nhãn bài viết ưu tiên cho chiến dịch bán chéo (`🔥 HOT`). |
| **`hot-ratio`** | Percentage | `60%` | `0%` đến `100%` | Tỷ lệ ưu tiên cho các bài Hot (tự động bù trừ nếu không đủ bài). |
| **`extract`** | Enum | `first` | `first` \| `random` | Cách chọn video khi bài viết có nhiều clip: lấy clip đầu tiên hay bốc ngẫu nhiên. |
| **`media`** | Enum | `all` | `all` \| `video` \| `audio` | Bộ lọc loại phương tiện: hiển thị cả video và audio, hoặc chỉ lấy 1 loại. |
| **`cta-text`** | String | `Xem chi tiết ➔` | Văn bản bất kỳ | Dòng chữ nút kêu gọi hành động dưới đáy khung Reel dẫn về bài viết. |
| **`mode`** | Enum | `auto` | `auto` \| `slider` \| `single` | `auto`: tự nhận diện theo vị trí; `slider`: ép thanh trượt ngang; `single`: ép 1 thẻ tràn viền Edge-to-Edge kèm 6s auto-advance và hover-reveal navigation. |
| **`play-mode`** | Enum | `modal` | `modal` \| `inline` | `modal`: Mở rạp chiếu Reels Lightbox Theater Modal toàn màn hình với phím mũi tên & vuốt touch; `inline`: Phát trực tiếp tại khung thẻ. |

### Ví dụ cấu hình thực tế:

**Ví dụ 1 — Widget Reels thanh trượt chuẩn phong cách Facebook (Đầu trang / In-Feed):**
```text
pattern: reels
title: Video
limit: 8
sort: random
hot-ratio: 60%
cta-text: Xem bài viết & Ưu đãi ➔
```

**Ví dụ 2 — Widget Reels tràn viền cho Cột bên Sidebar (Tự chuyển clip 6s + Hover Reveal):**
```text
pattern: reels
limit: 6
mode: single
```

**Ví dụ 3 — Widget chuyên đề Voice/Podcast tâm sự:**
```text
pattern: reels
title: 🎙️ Podcast & Voice
limit: 5
media: audio
cta-text: Nghe ngay ➔
```

---

## 6. KẾ HOẠCH TÍCH HỢP MÃ NGUỒN (CODEBASE ARCHITECTURE INTEGRATION)

### 6.1. Danh mục Tệp tin Đã Tác Động & Đồng Bộ
1. **[src/scripts/special-posts.js](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/src/scripts/special-posts.js):**
   - Đăng ký `reels: renderReelsPattern` vào bảng `PATTERN_RENDERERS` (dòng 32).
   - Module bóc tách media: `extractPostMedia(post, opts)` (hỗ trợ YouTube Shorts, YouTube thường, TikTok, FB, MP4, MP3).
   - Module `renderReelsWidget(container, opts)`:
     - Tự động nhận diện `inSidebar` để gắn class `.sidebar-widget--edge-to-edge`.
     - Phân loại Hot/Regular, thuật toán Fisher-Yates Shuffle, tỷ lệ 60:40, huy hiệu `🔥 HOT`.
     - Dựng cấu trúc thẻ Unibody 175px với Title Overlay, menu 3 chấm dọc `⋮`, nút Play Pulse; loại bỏ vạch Story để mép trên thông thoáng.
     - Tự động sinh Branded Fallback Poster mang logo mạng xã hội khi bài viết chưa đính kèm ảnh đại diện.
     - Bộ lọc Strict Label Filtering: Bắt buộc bài viết có nhãn `@video` hoặc `@video-hot`.
     - Khởi tạo bộ đếm thời gian 6s Auto-advance với Smart Pause (pause on hover / modal open / inline play) và cặp nút chuyển clip Hover Reveal trong chế độ `single`.
     - Khởi tạo Reels Lightbox Theater Modal với điều hướng phím mũi tên (`ArrowUp`/`ArrowDown`/`ArrowLeft`/`ArrowRight`), cử chỉ vuốt touch (swipe up/down), nút CTA và nút Bật tiếng TikTok qua `postMessage`.
2. **[src/styles/special-posts.css](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/src/styles/special-posts.css):**
   - `.sp-reels-shelf`: Khung hộp Facebook Reels Shelf có viền `1px solid var(--border-color)`, bo góc `14px`, `background: var(--bg-card)`.
   - `.sp-reels-header`: Header gồm icon clapperboard + tiêu đề "Video" + nút `···`.
   - `.sp-reel-card`: Thẻ Unibody kích thước `175px`, tỷ lệ `9 / 16`, bo góc `12px`, `background: #000`.
   - `.sp-reel-thumb-poster`: Poster chuyển sắc nhận diện thương hiệu cho Facebook, TikTok, MP4, Audio khi bài viết chưa có thumbnail.
   - `.sp-reel-title-overlay`: Lớp phủ tiêu đề chìm trên nền dải chuyển màu đen ở đáy thẻ.
   - `.sp-reels-nav-btn`: Cặp nút tròn màu trắng nổi khối 40px lơ lửng hai mép thẻ.
   - `.sidebar-widget--edge-to-edge`, `.sidebar-widget:has(.pattern-reels)`: Triệt tiêu viền, padding và bóng đổ của widget sidebar.
   - `.sp-reels-shelf--sidebar`: Xóa border và padding của shelf khi ở trong sidebar.
   - `.sp-reels-single-nav`: Cặp nút tròn kính mờ Prev/Next ẩn mặc định (`opacity: 0`), xuất hiện mượt mà khi hover (`:hover`).
   - `.sp-reels-modal`: Giao diện rạp chiếu Reels Lightbox Theater Modal toàn màn hình với `backdrop-filter: blur(16px)`.
3. **[src/styles/main.css](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/src/styles/main.css):**
   - Bổ sung quy tắc `#main-above-feed > :first-child { margin-top: 0 !important; }` để căn mép trên của widget đầu tiên thẳng hàng hoàn hảo với Cột bên Sidebar.
4. **[src/template.xml](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/src/template.xml):**
   - Bổ sung `<b:section id='top-wide-section' name='Tiện Ích Toàn Chiều Rộng Đầu Trang (Top Full Width)' showaddelement='yes'>` cùng widget mặc định `HTML19` (`🎬 Video &amp; Reels`) nằm độc lập giữa `category-tabs-section` và `layout-grid`.
5. **[src/preview.html](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/src/preview.html):**
   - Cung cấp demo trực quan của cả 2 chế độ:
     - Widget Slider Facebook Reels Feed toàn chiều rộng tại `#top-wide-section` (tràn 100% container từ lề trái sang lề phải giữa Category Tabs và nội dung bài viết).
     - Widget Reels Single Edge-to-Edge tự động xoay tua ở Cột bên Sidebar.
6. **[scripts/build.js](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/scripts/build.js):**
   - Tự động biên dịch mã nguồn thành [dist/theme.xml](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/dist/theme.xml).

---

## 7. TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)

- [x] **AC-1 (Thẻ Unibody 175px chuẩn Facebook Reels):** Các khung video hiển thị đúng tỉ lệ dọc 9:16 (`width: 175px`), hình ảnh tràn viền unibody, Title Overlay phủ chìm trên dải gradient đen ở đáy thẻ, nút menu 3 chấm dọc `⋮` ở góc trên, mép trên tinh giản không vạch kẻ thừa.
- [x] **AC-2 (Nhận diện Media đa nguồn):** Trích xuất chính xác Video ID và ảnh thumbnail HD từ các link YouTube (cả Shorts và thường), TikTok, Facebook, MP4 và MP3.
- [x] **AC-3 (Kỹ thuật Blurred Background Fill 16:9):** Đối với video ngang 16:9, video hiển thị sắc nét ở giữa không bị crop, nền mờ nghệ thuật phủ xung quanh. Đối với Shorts/TikTok 9:16, hiển thị tràn viền full-bleed.
- [x] **AC-4 (Hiệu ứng Hover Cinematic Zoom & Play Pulse):** Khi rê chuột vào khung video, ảnh đại diện phóng to mượt mà chuẩn điện ảnh (`scale(1.06)`), nút Play trung tâm tỏa sáng rực rỡ và phát xung nhịp dồn dập (`pulse ring`); với MP4 tự phát video câm.
- [x] **AC-5 (Sóng âm thanh Equalizer cho Voice):** Đối với tệp Voice/Audio/Podcast, hiển thị dải sóng nhạc Equalizer dao động nhịp nhàng và icon đĩa nhạc quay, nhận diện ngay là tệp âm thanh.
- [x] **AC-6 (Khung Hộp Facebook Reels Shelf & Top Alignment):** Bao bọc bởi hộp viền mảnh bo góc 14px, header clapperboard + tiêu đề "Video" + nút `···`, cặp nút điều hướng tròn trắng 40px nổi khối; mép trên căn thẳng hàng đồng trục với widget Cột bên.
- [x] **AC-7 (Phân cấp Hot / Regular):** Bài `@video-hot` được ưu tiên đứng ở vị trí 1 và 2, có huy hiệu `🔥 HOT` nổi bật và viền sáng khác biệt.
- [x] **AC-8 (Random không trùng lặp):** Khi bật chế độ `sort: random`, danh sách video được xáo trộn ngẫu nhiên; mỗi bài viết chỉ xuất hiện tối đa 1 lần trên widget.
- [x] **AC-9 (Thích ứng số lượng & Ẩn rỗng):** Nếu có $M < limit$ thì hiển thị đúng $M$ khung; nếu $M = 0$ thì widget ẩn hoàn toàn khỏi màn hình mà không để lại khoảng trắng.
- [x] **AC-10 (Sidebar Tràn Viền Edge-to-Edge, 6s Auto-advance & Hover Reveal):** Khi đặt trong Cột bên Sidebar, widget tự động chuyển sang 1 khung tràn viền 100% không viền thừa, không header thừa; tự động chuyển video mỗi 6 giây kèm tính năng Smart Pause khi hover/mở player; cặp nút điều hướng Prev/Next tròn kính mờ ẩn mặc định và chỉ hiện khi rê chuột.
- [x] **AC-11 (Hiệu năng Click-to-Play Facade):** Khi trang vừa tải xong, không có bất kỳ iframe video nặng bên thứ 3 nào được tải; chỉ khi người dùng click vào nút Play thì player tương ứng mới được nạp.
- [x] **AC-12 (Reels Lightbox Theater Modal):** Mở rạp chiếu toàn màn hình chuyên dụng khi click Play, hỗ trợ phím mũi tên máy tính và thao tác vuốt lướt clip trên màn hình cảm ứng di động; tích hợp nút Bật tiếng TikTok qua `postMessage`.
- [x] **AC-13 (Strict Label Filtering & Branded Poster Fallback):** Widget lọc nghiêm ngặt theo nhãn `@video` hoặc `@video-hot`, không quét nội dung bài viết ngoài danh mục để tối ưu hiệu năng; tự động render poster màu gradient kèm logo nền tảng khi bài viết chưa đính kèm ảnh bìa.
- [x] **AC-14 (Biên dịch thành công):** Lệnh `npm run build` hoàn tất không lỗi, `dist/theme.xml` được cập nhật đồng bộ.
