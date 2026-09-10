# ĐẶC TẢ KỸ THUẬT: HỆ SINH THÁI AI TOÀN DIỆN CHO BLOG (AI CONTENT PIPELINE, ASSISTANT & INTERACTIVE TOOLS)

> **Mã tính năng**: `FEAT-AI-ECOSYSTEM-V1`  
> **Dự án**: Blogger Editorial Theme (Blogspot XML v3)  
> **Phiên bản đặc tả**: `v1.1.0` (Bản thảo quy hoạch sơ bộ - Pre-development Spec)  
> **Trạng thái**: Sẵn sàng tinh chỉnh & phát triển (Draft / On-hold)  
> **Tài liệu liên quan**: [AI_TRANSPARENCY_SPECIFICATION.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/AI_TRANSPARENCY_SPECIFICATION.md), [FLEXIBLE_SPECIAL_POSTS_WIDGET_SPECIFICATION.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/FLEXIBLE_SPECIAL_POSTS_WIDGET_SPECIFICATION.md)

---

## 1. TỔNG QUAN & QUY HOẠCH HỆ SINH THÁI AI 3 TRỤ CỘT

Hệ thống AI dành cho Blog được thiết kế theo mô hình **Hệ sinh thái 3 Trụ Cột (3-Pillar AI Ecosystem)** nhằm hiện đại hóa blog cá nhân, giải phóng thời gian sáng tạo cho tác giả, bùng nổ lưu lượng truy cập (viral traffic) và mở ra nguồn thu nhập thụ động qua bán token dịch vụ:

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   HỆ SINH THÁI AI TOÀN DIỆN CHO BLOG                             │
├───────────────────────────────┬───────────────────────────────┬──────────────────────────────────┤
│ TRỤ CỘT 1: TỰ ĐỘNG XUẤT BẢN   │ TRỤ CỘT 2: TRỢ LÝ AI ĐỐI THOẠI│ TRỤ CỘT 3: CÔNG CỤ TỬ VI / THẦN  │
│ (AI Content Pipeline)         │ (Interactive Second Brain)    │ SỐ HỌC & BÁN TOKEN (Traffic/Mon) │
├───────────────────────────────┼───────────────────────────────┼──────────────────────────────────┤
│ • Lịch trình: Chạy mỗi sáng   │ • Vị trí: Chatbox góc phải    │ • Chạy 100% trên Blogspot tĩnh   │
│ • Engine: Gemini 1.5 Flash    │ • Trả lời: Theo kho bài viết  │ • Dịch vụ: Thần số học, Tử vi AI,│
│ • Định dạng: Bài 200–300 từ   │ • Tính năng: Gợi ý bài đọc,   │   Tarot trị liệu tâm lý          │
│ • Xuất bản: Blogger API v3    │   tóm tắt nhanh bài viết      │ • Phễu: Miễn phí xem tổng quan   │
│ • Gán nhãn: [@..., ai:gen]    │ • Persona: Bộ não thứ 2 của   │ • Thu phí: Quét VietQR 10k–20k   │
│   (Ẩn trang chủ, rơi widget)  │   tác giả Nam Trương          │   mở khóa luận giải chuyên sâu   │
└───────────────────────────────┴───────────────────────────────┴──────────────────────────────────┘
```

### Nguyên tắc kỹ thuật hàng đầu:
1. **Chi phí vận hành: 0 ĐỒNG vĩnh viễn**: Sử dụng 100% tài nguyên miễn phí:
   - Google Gemini API (Gói Free Tier: 15 RPM / 1,500 RPD).
   - GitHub Actions (2,000 phút cron tự động miễn phí mỗi tháng).
   - Google Blogger API v3 & Nền tảng hosting máy chủ tĩnh của Google Blogspot.
   - Cloudflare Workers (100,000 requests/ngày miễn phí).
2. **Triển khai 100% trên Blogspot**: Toàn bộ công cụ tương tác Tử Vi / Thần số học chạy ngay trên các trang tĩnh (`/p/than-so-hoc.html` hoặc `/p/tu-vi.html`), tận dụng trọn vẹn domain, SEO và giao diện theme có sẵn mà không tốn tiền thuê server ngoài.
3. **Định vị sang trọng & Minh bạch**: Nâng tầm từ bói toán dân gian thành *"Tâm linh Trí tuệ & Thấu hiểu Bản thân"*, giữ vững đẳng cấp của blog cá nhân Nam Trương.
4. **Không làm loãng Blog**: Toàn bộ nội dung AI tự động xuất bản đều qua cơ chế tiền tố `@` và huy hiệu minh bạch AI.

---

## 2. CÁNH TAY 1: PIPELINE TỰ ĐỘNG TẠO & XUẤT BẢN NỘI DUNG (CONTENT PIPELINE)

### 2.1. Quy trình vận hành tự động (Daily Automation Flow)

```text
  [07:00 AM - Hẹn giờ Cron]
             │
             ▼
  [GitHub Actions Runner thức dậy]
             │
             ▼
  [Bước 1: Gọi Google Gemini 1.5 Flash API]
  - Gửi System Prompt + Ngân hàng chủ đề
  - Nhận về: Tiêu đề + Nội dung HTML chuẩn + Tóm tắt
             │
             ▼
  [Bước 2: Chuẩn hóa & Gán nhãn tự động]
  - Format typography: trích dẫn blockquote, gạch đầu dòng
  - Gắn nhãn: ["@Kiến thức mỗi ngày", "ai:generated"]
             │
             ▼
  [Bước 3: Xác thực Google OAuth2 / Service Account]
  - Lấy Access Token từ Refresh Token an toàn trong GitHub Secrets
             │
             ▼
  [Bước 4: Gửi bài tới Blogger API v3]
  POST https://www.googleapis.com/blogger/v3/blogs/{BLOG_ID}/posts
             │
             ▼
  [Kết quả trên Blog]
  - Bài viết tự động chui vào widget "⚡ Kiến Thức Mỗi Ngày"
  - Tự động ẩn khỏi Trang chủ và Dòng thời gian chính
  - Tự động gắn huy hiệu "⚡ Tạo bởi AI"
```

---

### 2.2. Kỹ thuật Prompt Engineering (Định hình văn phong)

Để bài viết ngắn của AI không mang tính chung chung sáo rỗng (AI slop), prompt được thiết kế chặt chẽ:

```text
[SYSTEM PROMPT]:
Bạn là Trợ lý biên tập độc quyền cho blog cá nhân của Nam Trương.
Nhiệm vụ của bạn là viết một mẩu tin "Kiến thức mỗi ngày" (Daily Insight) ngắn gọn, sâu sắc và thực tế.

[QUY CHUẨN NỘI DUNG]:
1. Độ dài: 200 - 300 từ (đọc trong khoảng 1 phút).
2. Phong cách: Điềm đạm, khiêm tốn, truyền cảm hứng, hướng đến sự phát triển nội tâm và tư duy mạch lạc.
3. Cấu trúc bài viết:
   - Tiêu đề ngắn gọn, gợi mở (không giật tít câu view).
   - 1 câu danh ngôn hoặc đúc kết cốt lõi đặt trong thẻ <blockquote>.
   - Diễn giải bài học hoặc cơ chế tâm lý/thói quen bằng 2-3 đoạn văn ngắn.
   - 1 câu hỏi hoặc hành động gợi ý nhỏ cho độc giả áp dụng ngay trong ngày.
4. Định dạng đầu ra: Chuẩn HTML sạch (h3, p, blockquote, ul/li, strong). Không chứa markdown thô.
```

---

### 2.3. Cấu hình Kết nối Google Blogger API v3

1. **Google Cloud Console**:
   - Tạo Project miễn phí » Kích hoạt thư viện **Blogger API v3**.
   - Tạo thông tin xác thực OAuth 2.0 (Client ID, Client Secret, Refresh Token) với phạm vi `https://www.googleapis.com/auth/blogger`.
2. **GitHub Secrets (Bảo mật 100%)**:
   - `GEMINI_API_KEY`: Khóa API của Google Gemini.
   - `BLOGGER_BLOG_ID`: ID của blog Blogspot.
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`: Bộ xác thực OAuth2.
3. **Cơ chế 2 Nấc Xuất Bản (Dual-Mode Publishing)**:
   - **Chế độ 1 (Khuyên dùng ban đầu - Review Mode)**: Đặt `isDraft = true`. Bài viết đăng lên sẽ nằm trong mục **Bản nháp (Draft)** của Blogger. Tác giả mở điện thoại xem lướt 15s và bấm xuất bản thủ công.
   - **Chế độ 2 (Tự động hoàn toàn - Autopilot Mode)**: Đặt `isDraft = false`. Bài viết tự động xuất bản công khai đúng giờ hẹn.

---

## 3. CÁNH TAY 2: TRỢ LÝ AI TƯƠNG TÁC TRÊN GIAO DIỆN (INTERACTIVE AI ASSISTANT)

### 3.1. Định vị chức năng (Product Persona)
Trợ lý AI trên blog **không phải là bot CSKH bán hàng**, mà đóng vai trò là **"Bộ não thứ hai (Second Brain)"** đại diện cho kho tri thức của tác giả Nam Trương:
- Giọng điệu lịch thiệp, tôn trọng người đọc.
- Chỉ trả lời dựa trên những bài viết, quan điểm và tư liệu đã xuất bản trên blog.
- Nếu câu hỏi nằm ngoài phạm vi blog, AI trả lời khiêm tốn và gợi ý các chủ đề mà blog đang có.

---

### 3.2. Bốn Năng Lực Cốt Lõi

1. **Tra cứu & Tổng hợp Tri thức Blog (Blog RAG / Semantic Search)**:
   - Người đọc hỏi: *"Nam Trương nghĩ gì về việc trì hoãn?"*
   - AI tìm các bài viết liên quan, tóm tắt câu trả lời và trích dẫn: *"Trong bài viết [Chiêm Nghiệm Buổi Sáng], tác giả chia sẻ rằng sự trì hoãn thường bắt nguồn từ nỗi sợ thất bại..."*.
2. **Gợi ý Lộ trình đọc bài (Curated Reading Journey)**:
   - Người đọc hỏi: *"Tôi là người mới, tôi nên đọc những bài nào trước?"*
   - AI phân tích và đưa ra lộ trình 3 bài viết nền tảng kèm liên kết đọc ngay.
3. **Tóm tắt bài viết theo yêu cầu (On-Demand TL;DR)**:
   - Khi đang ở trong một bài đọc dài: Độc giả có thể bấm nút hỏi nhanh: *"Tóm tắt luận điểm chính của bài này"*.
4. **Hỏi đáp & Ghi nhận Ý kiến độc giả (Reader Feedback)**:
   - Cho phép độc giả gửi lời nhắn hoặc gợi ý chủ đề cho tác giả.

---

### 3.3. Kiến trúc Kỹ thuật trên Blogger (Cloudflare Worker Proxy)

```text
┌───────────────────────────────┐
│     GIAO DIỆN BLOGGER         │
│ • Floating Chat Bubble        │
│ • Khung chat Dark/Light Mode  │
└───────────────┬───────────────┘
                │ (Gửi câu hỏi của độc giả)
                ▼
┌───────────────────────────────┐
│   CLOUDFLARE WORKER PROXY     │
│ • Miễn phí 100,000 req/ngày   │
│ • Giữ bí mật Gemini API Key   │
│ • Nạp tóm tắt kho bài viết    │
└───────────────┬───────────────┘
                │ (Gọi AI có ngữ cảnh bài viết)
                ▼
┌───────────────────────────────┐
│    GOOGLE GEMINI 1.5 FLASH    │
│ • Sinh câu trả lời nhanh < 1s │
│ • Stream kết quả về blog      │
└───────────────────────────────┘
```

---

## 4. TRỤ CỘT 3: CÔNG CỤ TƯƠNG TÁC TỬ VI / THẦN SỐ HỌC AI & BÁN TOKEN TRÊN BLOGSPOT

### 4.1. Khả năng Triển khai Natively trên Blogger (100% Không Cần Thuê Server Ngoài)
Blogspot hoàn toàn có thể vận hành như một **Web App Tương Tác (Interactive Web App)** cao cấp:
- **Địa chỉ trang chuyên biệt**: Tạo trực tiếp trên trang tĩnh của Blogger, ví dụ:
  - `yourblog.blogspot.com/p/than-so-hoc.html` (Tra cứu Thần số học & Chỉ số đường đời)
  - `yourblog.blogspot.com/p/tu-vi.html` (Lập & Luận giải lá số Tử Vi AI)
  - `yourblog.blogspot.com/p/tarot.html` (Rút bài Tarot giải mã năng lượng tâm lý)
- **Tận dụng tối đa sức mạnh Blog**:
  - Thừa hưởng 100% nhận diện thương hiệu của theme (Header cố định, Dark/Light mode, font chữ Lora/Inter).
  - Tăng vọt lượng truy cập tự nhiên (Viral Traffic) và thời gian ở lại trang (Time-on-site), hỗ trợ trực tiếp cho SEO và doanh thu Google AdSense.
  - Chi phí lưu trữ (Hosting) = **0 đồng** do Google Blogspot gánh toàn bộ tải băng thông.

---

### 4.2. Trải nghiệm Người dùng & Giao diện Tương tác (Frontend UI/UX)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 🔮 GIAO DIỆN CÔNG CỤ THẦN SỐ HỌC & TỬ VI AI (TRÊN BLOGGER STATIC PAGE)                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [ Khung Nhập Liệu ]                                                                    │
│ • Họ và tên: [ Nguyễn Văn A                    ]                                       │
│ • Ngày/tháng/năm sinh: [ 15/08/1995            ]   Giờ sinh: [ 07:30 Sáng (Thìn)     ] │
│ • Giới tính: (○) Nam   ( ) Nữ                      Chủ đề quan tâm: [ Sự nghiệp ▾ ]   │
│                                                                                        │
│                                  [ ✨ LUẬN GIẢI NGAY » ]                               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [ Kết Quả Tầng 1: MIỄN PHÍ - Bật Mí Tổng Quan ]                                        │
│ • Số Chủ Đạo: Số 7 (Người kiếm tìm tri thức & chân lý)                                 │
│ • Tổng quan năng lượng: Bạn là người có tư duy phân tích sâu sắc...                    │
│ • [ Nút: Chia sẻ kết quả lên Facebook / Tải ảnh thẻ bài Infographic ]                  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [ Kết Quả Tầng 2: TRẢ PHÍ (TOKEN / VIETQR) - Mở Khóa Luận Giải Chuyên Sâu ]             │
│ 🔒 CÁC NỘI DUNG ĐANG BỊ KHÓA:                                                          │
│   - Chi tiết vận hạn sự nghiệp & tài chính 12 tháng năm nay                            │
│   - Bản đồ cơ hội & rủi ro cần tránh                                                   │
│   - Lời khuyên định hướng độc quyền từ AI Tử Vi Master                                 │
│                                                                                        │
│ [ Quét Mã VietQR Chuyển Khoản: 10.000đ (hoặc 50.000đ = 5 Tokens) ]                     │
│ 📱 [ Mã QR Ngân Hàng Tự Động ] -> Quét mã thành công, AI mở khóa ngay sau 2 giây!      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 4.3. Mô hình Kinh doanh: Phễu Traffic & Thanh toán Token Tự động

#### 1. Tầng Miễn phí (Free Hook & Viral Loop):
- Cung cấp miễn phí: Số chủ đạo, ý nghĩa tên gọi, bài học lớn của cuộc đời, hoặc quẻ Tarot ngắn trong ngày.
- Tích hợp nút **"Xuất ảnh Infographic"** (dùng `html2canvas` tạo ảnh thẻ bài lung linh kèm logo blog của Nam Trương) để độc giả chia sẻ lên Facebook, Story Instagram, Zalo -> kéo thêm hàng ngàn bạn bè vào blog tra cứu.

#### 2. Tầng Trả phí (Micro-payment / Token Sale):
- Mở khóa bài luận giải dài 1,500 – 2,500 từ đi sâu vào từng ngóc ngách vận hạn, tài vận, tình duyên.

---

### 4.4. Cơ Chế Nhận Diện Thanh Toán Tự Động Nội Địa (VietQR Động + Webhook Ngân Hàng)

Cách hệ thống nhận biết chính xác người dùng đã chuyển tiền trong 1–2 giây mà không cần con người can thiệp:

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   DÒNG CHẢY XÁC NHẬN THANH TOÁN VIETQR TỰ ĐỘNG (1–2S)            │
└──────────────────────────────────────────────────────────────────────────────────┘

 [1. Khách bấm "Mở khóa luận giải" (20.000đ)]
                 │
                 ▼
 [2. Hệ thống sinh Mã Đơn Hàng duy nhất (Ví dụ: "NAM108")]
                 │
                 ▼
 [3. Hiển thị mã VietQR Động]:
     • Số tài khoản: 0123456789 (Tài khoản ngân hàng của Nam Trương)
     • Số tiền: 20.000đ (Khóa cứng, khách không phải tự gõ)
     • Nội dung chuyển khoản: "NAM108" (Đã nhúng sẵn trong QR)
                 │
                 ▼
 [4. Khách quét mã QR bằng App Ngân Hàng -> Bấm "Chuyển tiền"]
     (Số tiền và mã "NAM108" tự động điền vào App -> Khách không thể gõ sai)
                 │
                 ▼
 [5. Tiền "ting ting" vào tài khoản ngân hàng của Nam Trương]
                 │
                 ▼
 [6. Cổng PayOS / Casso phát hiện biến động -> Bắn Webhook sang Cloudflare Worker]:
     "Tài khoản Nam Trương vừa nhận 20.000đ với nội dung NAM108!"
                 │
                 ▼
 [7. Cloudflare Worker xác thực đơn hàng thành công]
                 │
                 ▼
 [8. Màn hình Blogspot tự động đổi trạng thái (Polling mỗi 1.5s)]:
     • Đóng popup QR -> Bắn pháo hoa 🎉
     • AI lập tức gõ ra bài luận giải chuyên sâu trước mắt khách (Không cần F5)!
```

- **Giải pháp kết nối**: Sử dụng **PayOS** (hoàn toàn miễn phí, kết nối Open Banking trực tiếp với MBBank, VietinBank, VPBank, ACB, Techcombank, BIDV...). Tiền chuyển thẳng 100% vào tài khoản cá nhân của tác giả, không qua trung gian, không bị giam vốn.

---

### 4.5. Cổng Thanh Toán Quốc Tế & Phục Vụ Kiều Bào / Khách Nước Ngoài

Đối với tệp độc giả tại nước ngoài (Mỹ, Úc, Châu Âu, Nhật Bản...) có nhu cầu xem Tử vi / Thần số học / Tarot:

#### 1. Phương thức thanh toán quốc tế:
- **PayPal Smart Buttons**: Khách có thể thanh toán bằng số dư ví PayPal, hoặc quẹt trực tiếp các loại **Thẻ tín dụng / Ghi nợ quốc tế** (Visa, Mastercard, JCB, American Express).
- **Apple Pay & Google Pay**: Hỗ trợ chạm thanh toán 1 giây trên thiết bị di động.
- **Cách nhận tiền về Việt Nam**: Tiền USD đổ về ví PayPal của tác giả -> Bấm rút tiền về tài khoản ngân hàng Việt Nam (VCB, MB...), tiền quy đổi sang VNĐ về tài khoản sau 2–4 ngày làm việc.

#### 2. Tự động nhận diện vị trí khách (Geo-IP Smart Routing):
- Khách truy cập từ **IP Việt Nam**: Mặc định hiển thị tab **VietQR Ngân Hàng** (20.000đ).
- Khách truy cập từ **IP Quốc Tế**: Mặc định hiển thị tab **PayPal / Thẻ Quốc Tế / Apple Pay** ($0.99 – $1.99 USD).

---

### 4.6. Cơ Chế Vận Hành & Rút Tiền Của "Buy Me A Coffee" Về Việt Nam

Áp dụng cho cả widget ủng hộ blog ở Chân trang lẫn việc bán token/dịch vụ số:

1. **Cách độc giả thanh toán**:
   - Độc giả truy cập trang `buymeacoffee.com/[tên-tác-giả]`.
   - Chọn số ly cà phê ($3, $5...) hoặc mua sản phẩm số (Extras).
   - Thanh toán qua thẻ Visa/Mastercard hoặc Apple Pay / Google Pay.
2. **Phí nền tảng**: 5% trên mỗi giao dịch ủng hộ.
3. **Quy trình rút tiền về Ngân hàng Việt Nam (Payout Flow)**:
   - **Bước 1**: Đăng ký tài khoản **Payoneer** miễn phí bằng CCCD/Hộ chiếu tại Việt Nam.
   - **Bước 2**: Kết nối Payoneer vào mục *Settings > Payouts* trên Buy Me a Coffee.
   - **Bước 3**: Khi số dư đạt tối thiểu $10, tiền sẽ được chuyển tự động sang ví Payoneer.
   - **Bước 4**: Từ Payoneer, bấm *"Rút về ngân hàng Việt Nam"* -> Tiền tự quy đổi sang VNĐ và về tài khoản sau vài tiếng đến 1 ngày.
4. **Chiến lược kết hợp song song**:
   - Khách quốc tế: Nút dẫn sang **Buy Me a Coffee**.
   - Độc giả trong nước: Pop-up mã **VietQR / MoMo 30.000đ** (tiền về thẳng tài khoản tức thì, 0% phí).

---

### 4.7. Định vị Thương hiệu: "Tâm Linh Trí Tuệ & Thấu Hiểu Bản Thân"
Để bảo toàn hình ảnh editorial cao cấp của blog Nam Trương:
- **Ngôn ngữ**: Tránh hoàn toàn các từ ngữ mê tín dị đoan, phán xét hoang mang (như *"tai ương, tuyệt mạng"*).
- **Văn phong**: Đậm chất tâm lý học chiều sâu (Jungian Psychology), phát triển bản thân, khích lệ nội lực và định hướng tư duy ứng biến sáng suốt.
- **Disclaimer**: Luôn có dòng thông cáo: *"Công cụ mang tính chất chiêm nghiệm tri thức cổ học và thấu hiểu tâm lý cá nhân, giúp bạn có thêm góc nhìn tĩnh lặng để làm chủ cuộc đời."*

---

## 5. LỘ TRÌNH LÀM MỊN & TRIỂN KHAI (REFINEMENT ROADMAP)

Khi bạn sẵn sàng bắt tay vào phát triển, chúng ta sẽ lần lượt làm mịn các khía cạnh sau:

### Giai đoạn A: Làm mịn Pipeline Tạo nội dung (Trụ cột 1)
1. **Lựa chọn ngân hàng chủ đề**: Bạn muốn AI viết xoay quanh các chủ đề nào? (Ví dụ: Thói quen, Sách hay, Tư duy phản biện, Tâm lý học, Công nghệ).
2. **Thiết lập mức độ kiểm duyệt**: Chạy thử nghiệm ở chế độ Bản nháp (Draft) trong 1–2 tuần đầu tiên để đánh giá văn phong.
3. **Tinh chỉnh giờ xuất bản**: 06:30 sáng, 07:00 sáng hay 08:00 tối.

### Giai đoạn B: Làm mịn Trợ lý Tương tác (Trụ cột 2)
1. **Thiết kế giao diện Chatbox**: Nút tròn nổi (Floating Button) ở góc phải dưới hay một Thanh tìm kiếm thông minh (AI Search Bar) tích hợp vào Header?
2. **Xây dựng chỉ mục dữ liệu (Context Ingestion)**: Cơ chế nạp danh mục bài viết tự động từ sitemap của blog vào prompt.
3. **Câu chào mặc định & Gợi ý câu hỏi mẫu (Starter Prompts)**: Ví dụ: *“Giới thiệu về Nam Trương”*, *“Bài viết hay nhất về phát triển bản thân”*, *“Lộ trình đọc cho người mới”*.

### Giai đoạn C: Làm mịn Công cụ Tử Vi / Thần Số Học & Cổng Token (Trụ cột 3)
1. **Chọn dịch vụ mở màn**: Thần số học (Numerology) hay Bói bài Tarot trị liệu hay Lập lá số Tử Vi?
2. **Prompt Engine chuyên sâu**: Xây dựng bộ công thức tính toán và prompt chuẩn cho từng bộ môn cổ học.
3. **Cấu hình cổng VietQR**: Kết nối tài khoản ngân hàng qua cổng PayOS/SeAPay để nhận thông báo nạp token tự động.

---

## 6. TIÊU CHUẨN NGHIỆM THU DỰ KIẾN (ACCEPTANCE CRITERIA)

| Hạng mục | Tiêu chí đánh giá | Trạng thái |
| :--- | :--- | :---: |
| **Chi phí** | 100% không phát sinh bất kỳ khoản phí duy trì định kỳ nào. | Dự kiến |
| **Chạy đúng giờ** | Đúng giờ hẹn (ví dụ 07:00), bài viết mới tự động xuất hiện trên Blogger. | Dự kiến |
| **Phân luồng nội dung** | Bài AI xuất bản tự động rơi vào Widget riêng, không làm loãng Trang chủ. | Dự kiến |
| **Minh bạch AI** | Bài viết tự động gắn nhãn `@...` và huy hiệu `⚡ Tạo bởi AI`. | Dự kiến |
| **Văn phong AI** | Bài viết đạt chuẩn văn phong editorial, súc tích, không sáo rỗng. | Dự kiến |
| **Trợ lý Chatbox** | Trả lời chính xác dựa trên bài viết của blog, kèm đường link trích dẫn. | Dự kiến |
| **Công cụ Web App** | Chạy mượt mà trực tiếp trên trang tĩnh Blogspot, không bị lỗi CORS/giật lag. | Dự kiến |
| **Thanh toán VietQR** | Quét mã QR chuyển khoản: Hệ thống tự động xác nhận sau 2–3s và mở khóa kết quả. | Dự kiến |
| **Bảo mật** | Không để lộ API Key trên trình duyệt của người dùng. | Dự kiến |
