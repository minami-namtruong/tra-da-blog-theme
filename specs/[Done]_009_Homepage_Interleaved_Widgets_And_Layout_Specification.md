# ĐẶC TẢ KỸ THUẬT & BỐ CỤC: HỆ THỐNG TIỆN ÍCH XEN KẼ VÀ LUỒNG NỘI DUNG TRANG CHỦ (HOMEPAGE INTERLEAVED WIDGETS & MAIN FEED LAYOUT)

> **Mã tính năng**: `FEAT-HOMEPAGE-INTERLEAVED-WIDGETS-V1`  
> **Dự án**: Blogger Editorial Theme (Blogspot XML v3)  
> **Phiên bản đặc tả**: `v1.0.0` (Bản thảo thiết kế hoàn chỉnh)  
> **Trạng thái**: Bản thảo thiết kế kỹ thuật hoàn chỉnh (Design Specification)  
> **Tài liệu liên quan**: [THEME_SPECIFICATION.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/THEME_SPECIFICATION.md), [FLEXIBLE_SPECIAL_POSTS_WIDGET_SPECIFICATION.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/FLEXIBLE_SPECIAL_POSTS_WIDGET_SPECIFICATION.md), [BILINGUAL_VI_EN_SYSTEM_SPECIFICATION.md](file:///Users/nam.truong/Documents/Viber%20Coding/blogspot-editorial-theme/specs/BILINGUAL_VI_EN_SYSTEM_SPECIFICATION.md)

---

## 1. TỔNG QUAN & TẦM NHÌN THIẾT KẾ (OVERVIEW & PHILOSOPHY)

### 1.1. Bối cảnh & Bài toán trải nghiệm người đọc
Trên một blog cá nhân định hướng nội dung chất lượng cao (Editorial / Thought Leadership / Long-form Essays), danh sách bài viết ở trang chủ thường gồm các thẻ bài viết lớn (Card 16:9, tiêu đề, đoạn tóm tắt, ngày đăng, thời lượng đọc).

**Vấn đề nan giải của giao diện danh sách truyền thống**:
1. **Sự đơn điệu & Mỏi mắt (Visual Fatigue)**: Khi cuộn qua một danh sách dài thuần túy các bài viết giống nhau, mắt độc giả dễ rơi vào trạng thái mệt mỏi, lướt qua nhanh mà không đọng lại ấn tượng sâu sắc.
2. **Lãng phí các điểm vàng chuyển đổi (Missed Conversion Points)**: Các vị trí có mức độ tập trung cao nhất của độc giả (đầu luồng, điểm nghỉ giữa chừng, và điểm kết thúc bài cuối cùng) thường bị bỏ trống hoặc bố trí vụng về.
3. **Thiếu linh hoạt trong quản trị**: Người viết blog muốn đổi vị trí đặt quảng cáo, khung nhận tin newsletter, hay trích dẫn chiêm nghiệm nhưng thường bị phụ thuộc vào việc phải sửa code XML phức tạp.

### 1.2. Mục tiêu giải pháp
Xây dựng **Hệ Thống Bố Cục Luồng Chính 3 Tầng Kết Hợp Widget Xen Kẽ** đạt chuẩn:
1. **Nhịp điệu đọc chuẩn mực (Editorial Cadence)**: Áp dụng nguyên tắc "Tỷ lệ vàng số 3" và tiêu chuẩn **7 bài viết / trang**, chia nhịp đọc thành các chặng tự nhiên, có điểm mở màn, khoảng thở giữa luồng và điểm kết thúc đắt giá.
2. **Vận hành Kéo - Thả 100% Không Chạm Code (Zero-Code Layout UI)**:
   - Mọi phân vùng đều được khai báo thành các `<b:section>` trực quan trong trang **Bố cục (Layout)** của Blogger. Tác giả chỉ việc dùng chuột kéo thả widget, cấu hình nội dung hoặc gạt công tắc **Ẩn / Tắt** tùy ý.
3. **Cơ chế Tự thích ứng khi Chuyển trang (Intelligent Page 2+ Behavior)**:
   - Widget Tiêu điểm ở đầu trang tự động biến mất khi sang Trang 2 để không làm vướng mắt khi độc giả đào sâu tìm bài cũ.
   - Widget Xen kẽ giữa luồng tự động đổi mới nội dung (random quote).
4. **An toàn tuyệt đối khi để trống (Graceful Empty State)**:
   - Nếu tác giả chưa cấu hình hoặc tắt widget đi, hệ thống **không sinh ra bất kỳ khoảng trắng thừa hay lỗi giao diện nào**; luồng bài viết tự động nối liền mạch tự nhiên.

---

## 2. KIẾN TRÚC BỐ CỤC 3 TẦNG TRÊN LUỒNG CHÍNH (MAIN FEED 3-TIER ARCHITECTURE)

Toàn bộ luồng nội dung chính của Trang chủ được tổ chức thành một dòng chảy nhịp nhàng:

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│ HEADER (Logo, Menu song ngữ VI/EN, Công tắc Dark/Light Mode, Tìm kiếm)           │
├──────────────────────────────────────────────────────────────────────────────────┤
│ THANH CHỦ ĐỀ: [ ✦ Tất cả ] [ Góc Nhìn & Tư Duy ] [ Sách & Công Cụ ] [ Cuộc Sống ]│
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│ ┌─ CỘT NỘI DUNG CHÍNH (Main Column) ───────────┐ ┌─ CỘT BÊN (Sidebar - 320px) ─┐ │
│ │                                              │ │                             │ │
│ │  📍 TẦNG 1: ĐẦU LUỒNG (Above Feed)           │ │  • Về Tác Giả (About Me)    │ │
│ │  ┌────────────────────────────────────────┐  │ │                             │ │
│ │  │ [🌟 Widget Tiêu Điểm / Spotlight Card] │  │ │  • Bảng Xếp Hạng            │ │
│ │  └────────────────────────────────────────┘  │ │    🔥 Bài Viết Nổi Bật      │ │
│ │                                              │ │    01 Nghịch lý lựa chọn... │ │
│ │  ── 📰 Bài viết 1 (Mới nhất) ──────────────  │ │    02 30 ngày không ĐT...   │ │
│ │  ── 📰 Bài viết 2 ─────────────────────────  │ │    03 Tư duy nhanh và chậm..│ │
│ │  ── 📰 Bài viết 3 ─────────────────────────  │ │                             │ │
│ │                                              │ │  • Tủ Sách Khuyên Đọc       │ │
│ │  📍 TẦNG 2: XEN KẼ GIỮA LUỒNG (In-Feed)      │ │                             │ │
│ │  ┌────────────────────────────────────────┐  │ │                             │ │
│ │  │ [☕ Widget Trích Dẫn “Quote” / Ghi Chép]│  │ │                             │ │
│ │  └────────────────────────────────────────┘  │ │                             │ │
│ │                                              │ │                             │ │
│ │  ── 📰 Bài viết 4 ─────────────────────────  │ │                             │ │
│ │  ── 📰 Bài viết 5 ─────────────────────────  │ │                             │ │
│ │  ── 📰 Bài viết 6 ─────────────────────────  │ │                             │ │
│ │  ── 📰 Bài viết 7 ─────────────────────────  │ │                             │ │
│ │                                              │ │                             │ │
│ │  📍 TẦNG 3: KẾT LUỒNG (Above Pagination)     │ │                             │ │
│ │  ┌────────────────────────────────────────┐  │ │                             │ │
│ │  │ [💌 Newsletter HOẶC 📢 Banner Quảng Cáo]│  │ │                             │ │
│ │  └────────────────────────────────────────┘  │ │                             │ │
│ │                                              │ │                             │ │
│ │  ── 🔘 NÚT PHÂN TRANG: [« Mới hơn / Cũ hơn »]  │ │                             │ │
│ └──────────────────────────────────────────────┘ └─────────────────────────────┘ │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│ FOOTER 4 CỘT CHUẨN MỰC (Thương hiệu, Bản tin, Chính sách & Bản quyền)            │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

### 2.1. Tầng 1: Đầu Luồng Bài Viết (`main-above-feed` - Above Feed / Hero Zone)
* **Vị trí**: Nằm ngay dưới Thanh Tab Chủ đề và nằm trên thẻ bài viết số 1.
* **Loại Widget thích hợp**:
  - **Pattern `spotlight` (Hero Card)**: Bài viết tiêu điểm của tuần (Cover 16:9 lớn, tiêu đề nổi bật, tóm tắt 3 dòng, nút `[Đọc tiếp →]`).
  - **Pattern `digest` (Dàn lưới ngang 2–3 cột)**: 2–3 mẩu tin vắn mới nhất trong ngày.
  - **Pattern `video`**: Video mới nhất từ kênh YouTube.
* **Hành vi khi chuyển trang (Trang 2, Trang 3...)**:
  - **TỰ ĐỘNG ẨN 100%**: Khi độc giả bấm `« Trang cũ hơn`, khối Tiêu điểm này biến mất để danh sách bài viết cũ hiển thị ngay ngắn trên đầu trang, giúp độc giả tập trung duyệt bài mà không bị cản trở.

---

### 2.2. Tầng 2: Xen Kẽ Giữa Luồng Bài Viết (`main-in-feed` - In-Feed Interleaved Zone)
* **Vị trí**: Nằm giữa cụm bài viết đợt 1 và cụm bài viết đợt 2 (mặc định: **ngay sau Bài viết số 3**).
* **Loại Widget thích hợp**:
  - **Pattern `quote` (Chiêm nghiệm / Đoản thi)**: Trích dẫn danh ngôn hoặc câu thơ với nghệ thuật xếp chữ Typography (dấu ngoặc kép `“ ”`, in nghiêng thanh nhã).
  - **Khung Đăng ký Nhận Tin Nhỏ (Mini Newsletter)**.
* **Tác dụng UX**: 
  - Tạo "khoảng thở thị giác" (Visual Breathing Space) giúp độc giả thư giãn mắt sau khi vừa quét qua 3 thẻ bài viết dài.
* **Hành vi khi chuyển trang**:
  - **Vẫn duy trì**: Nếu là widget `quote` với thuộc tính `data-sort="random"`, khi sang Trang 2 widget tự động bốc ngẫu nhiên một câu nói mới, tạo sự thích thú liên tục cho độc giả.

---

### 2.3. Tầng 3: Kết Luồng Bài Viết (`main-pre-pagination` - Above Pagination / Action Zone)
* **Vị trí chuẩn mực**: **Nằm ngay sau bài viết cuối cùng (Bài số 7) và NẰM TRÊN nút phân trang (`.blog-pager`)**.
* **Đặc tính Đa năng (Multi-purpose Slot)**: Tác giả có thể tùy biến thành một trong các mục đích sau:
  1. **Khung Đăng Ký Bản Tin (Newsletter Box - Khuyên dùng số 1)**: Độc giả cuộn đến bài 7 là người rất tâm huyết; tỷ lệ để lại email ở vị trí này cao gấp 3 lần so với Sidebar.
  2. **Vị trí Đặt Quảng Cáo Đắt Giá (Pre-Pagination Ad Unit - CTR cao nhất)**:
     - Đặt banner **Google AdSense Responsive** (tự co giãn 728x90 hoặc 300x250).
     - Đặt banner **Tiếp thị liên kết (Affiliate)**: Giới thiệu cuốn sách hay, công cụ làm việc.
     - Đặt banner **Đối tác tài trợ (Sponsorship)**.
  3. **Lộ trình đọc bài / Tủ sách khuyên đọc**: Gợi ý độc giả khám phá tiếp trang **Mục Lục Toàn Thư (`/p/muc-luc.html`)**.
  4. **Tùy chọn Ẩn / Tắt**: Gạt công tắc `OFF` trong cài đặt tiện ích, hoặc để trống ô này nếu chưa có nhu cầu dùng.

---

## 3. NGUYÊN TẮC NHỊP ĐIỆU 7 BÀI VIẾT & PHÂN TRANG (PAGINATION RULES)

### 3.1. Tiêu chuẩn 7 bài viết trên Trang chủ
* **Cài đặt trong Blogger Admin**:
  `Cài đặt (Settings) » Bài đăng (Posts) » Số bài đăng tối đa hiển thị trên trang chính: 7`.
* **Phân bổ nhịp điệu chi tiết**:
  - **Chặng 1 (First Fold)**: 1 Widget Tiêu Điểm Đầu Trang.
  - **Chặng 2 (Scroll 1)**: 3 Bài viết chính (`Bài 1, 2, 3`).
  - **Chặng 3 (Mid Pause)**: 1 Widget Xen Kẽ (Trích dẫn hoặc Ghi chép).
  - **Chặng 4 (Scroll 2)**: 4 Bài viết tiếp theo (`Bài 4, 5, 6, 7`).
  - **Chặng 5 (Action Zone)**: 1 Widget Kết Luồng (Newsletter hoặc Quảng cáo).
  - **Chặng 6 (Navigation)**: Cụm nút chuyển trang `[« Trang mới hơn]` và `[Trang cũ hơn »]`.

---

## 4. ĐẶC TẢ KỸ THUẬT TẦNG BLOGGER XML V3 (`scripts/build.js`)

Trong mã nguồn theme XML v3, chúng ta khai báo 3 vùng `<b:section>` tương ứng với 3 vị trí, đảm bảo tính trực quan 100% trong Blogger Layout:

```xml
<!-- ==========================================
     MAIN LAYOUT GRID (Posts + Sidebar)
     ========================================== -->
<div class='layout-grid'>

  <!-- Cột nội dung chính (Main Content Column) -->
  <main class='main-content' id='main-content'>

    <!-- ── VỊ TRÍ 1: ĐẦU LUỒNG BÀI VIẾT (Hero / Spotlight) ──
         Chỉ hiển thị ở Trang chủ đầu tiên (Page 1) qua điều kiện data:view.isHomepage -->
    <b:if cond='data:view.isHomepage'>
      <b:section id='main-above-feed' 
                 name='Đầu Luồng Bài Viết (Hero / Spotlight)' 
                 showaddelement='yes'/>
    </b:if>

    <!-- ── DANH SÁCH BÀI VIẾT CHÍNH (Blogger Core Blog Widget) ── -->
    <b:section id='main' name='Nội Dung Bài Viết' maxwidgets='1' showaddelement='yes'>
      <b:widget id='Blog1' type='Blog' version='2'>
        <b:includable id='main'>
          <b:if cond='data:view.isMultipleItems'>
            <div class='posts-feed' role='feed' id='posts-feed-container'>
              <b:loop values='data:posts' var='post' index='idx'>
                <!-- Lọc loại trừ bài viết độc quyền @ -->
                ...
                <article class='post-card' itemscope='itemscope' itemtype='https://schema.org/BlogPosting'>
                  ...
                </article>
              </b:loop>
            </div>

            <!-- ── VỊ TRÍ 3: KẾT LUỒNG BÀI VIẾT (Trên Nút Phân Trang) ──
                 Nằm ngay sau danh sách bài viết và TRÊN nút phân trang blog-pager.
                 Thích hợp đặt Form Newsletter, Banner Quảng Cáo AdSense hoặc Tủ Sách -->
            <b:section id='main-pre-pagination-section' 
                       name='Kết Luồng Bài Viết (Trên Nút Phân Trang / Quảng Cáo / Newsletter)' 
                       showaddelement='yes'/>

            <!-- ── NÚT PHÂN TRANG (Pagination Controls) ── -->
            <div class='blog-pager' role='navigation' aria-label='Phân trang'>
              <b:if cond='data:newerPageUrl'>
                <a class='blog-pager-newer-link' expr:href='data:newerPageUrl'>« Mới hơn</a>
              </b:if>
              <b:if cond='data:olderPageUrl'>
                <a class='blog-pager-older-link' expr:href='data:olderPageUrl'>Cũ hơn »</a>
              </b:if>
            </div>
          </b:if>
        </b:includable>
      </b:widget>
    </b:section>

    <!-- ── VỊ TRÍ 2: SECTION CHỨA TIỆN ÍCH XEN KẼ (In-Feed Interleaved) ──
         Section này xuất hiện trong Blogger Layout để tác giả kéo thả widget.
         JavaScript sẽ tự động di chuyển nội dung của nó chèn vào sau bài số 3 -->
    <b:section id='main-in-feed-section' 
               name='Xen Kẽ Giữa Các Bài (In-Feed)' 
               showaddelement='yes'/>

    <!-- Tiện ích bài viết đặc biệt dưới chân bài đọc đơn -->
    <b:section id='under-post-widgets' name='Tiện Ích Dưới Bài Viết (Bên Thứ 3)' showaddelement='yes'/>

  </main>

  <!-- Cột bên cố định (Sidebar Column) -->
  <aside class='sidebar-column' id='sidebar-column'>
    <b:section id='sidebar-section' name='Cột Bên (Sidebar)' showaddelement='yes'/>
  </aside>

</div>
```

---

## 5. ĐẶC TẢ JAVASCRIPT ĐIỀU HƯỚNG VỊ TRÍ XEN KẼ (`theme.js`)

Vì Blogger XML v3 không cho phép lồng một thẻ `<b:section>` trực tiếp vào giữa vòng lặp `<b:loop>` của danh sách bài viết, hệ thống sử dụng một thuật toán JavaScript siêu nhẹ (~0.5KB) để tự động định vị:

```javascript
/**
 * Tự động chèn tiện ích In-Feed vào sau bài viết chỉ định
 * Hỗ trợ tham số data-insert-after="N" (Mặc định: sau bài số 3)
 */
function initInFeedInterleaving() {
  const inFeedSection = document.getElementById('main-in-feed-section');
  if (!inFeedSection) return;

  // 1. Kiểm tra xem tác giả có kéo widget nào vào section này không
  const hasWidgets = inFeedSection.querySelectorAll('.widget, .special-posts-widget').length > 0;
  if (!hasWidgets) {
    inFeedSection.style.display = 'none';
    return;
  }

  // 2. Lấy danh sách các thẻ bài viết trên trang chủ
  const posts = document.querySelectorAll('#posts-feed-container > .post-card');
  if (!posts || posts.length === 0) return;

  // 3. Xác định vị trí chèn (Mặc định: sau bài số 3 -> index 2)
  let insertAfterIndex = 2; 
  const customConfigWidget = inFeedSection.querySelector('[data-insert-after]');
  if (customConfigWidget) {
    const customNum = parseInt(customConfigWidget.dataset.insertAfter, 10);
    if (!isNaN(customNum) && customNum > 0) {
      insertAfterIndex = customNum - 1;
    }
  }

  // Đảm bảo không vượt quá tổng số bài hiện có
  const targetIndex = Math.min(insertAfterIndex, posts.length - 1);

  // 4. Di chuyển mượt mà vào giữa luồng mà không làm reload DOM
  posts[targetIndex].after(inFeedSection);
  inFeedSection.classList.add('in-feed-active');
  inFeedSection.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', initInFeedInterleaving);
```

---

## 6. GIAO DIỆN QUẢN TRỊ BỐ CỤC TRONG BLOGGER ADMIN (DÀNH CHO TÁC GIẢ)

Tác giả quản lý toàn bộ hệ thống bằng chuột trực tiếp trong **Blogger Admin > Bố cục (Layout)**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ BLOGGER ADMIN » BỐ CỤC (LAYOUT)                                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [ Header & Menu ]                                                     │
│                                                                        │
│  [ Thanh Tab Chủ Đề (Tabs) ]                                           │
│                                                                        │
│  ┌─ 📍 VÙNG 1: ĐẦU LUỒNG BÀI VIẾT (Hero / Spotlight) ─────────────────┐ │
│  │  [::: Tiện ích: 🌟 Bài Viết Tiêu Điểm (Chỉ hiện Trang 1)         ] ◄┼┼── Kéo thả bằng chuột
│  │  [+ Thêm tiện ích]                                                │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ┌─ CỘT NỘI DUNG CHÍNH ───────────────┐ ┌─ CỘT BÊN (Sidebar) ────────┐ │
│  │                                    │ │                            │ │
│  │  [ Danh sách các bài viết Blog ]   │ │ [::: Tiện ích: Về Tác Giả] │ │
│  │                                    │ │                            │ │
│  │  ┌─ 📍 VÙNG 2: XEN KẼ GIỮA CÁC BÀI │ │ [::: Tiện ích: 🔥 Bài Top] ◄┼┼── Kéo qua lại
│  │  │ [::: Tiện ích: ☕ Trích Dẫn ] ◄┼┼─┤ │                            │ │   giữa Main
│  │  │ [+ Thêm tiện ích]             │ │ │ [+ Thêm tiện ích]          │ │   và Sidebar
│  │  └───────────────────────────────┘ │ └────────────────────────────┘ │
│  │                                    │                                │
│  │  ┌─ 📍 VÙNG 3: KẾT LUỒNG BÀI VIẾT ─┐ │                                │
│  │  │ [::: Tiện ích: 💌 Newsletter]   │ │                                │
│  │  │ [::: Tiện ích: 📢 Banner Ads]   │ │                                │
│  │  │ [+ Thêm tiện ích]             │ │                                │
│  │  └───────────────────────────────┘ │                                │
│  │                                    │                                │
│  │  [ Phân trang: Mới hơn / Cũ hơn ]  │                                │
│  └────────────────────────────────────┘                                │
│                                                                        │
│  [ Chân Trang (Footer 4 Cột) ]                                         │
└────────────────────────────────────────────────────────────────────────┘
```

### 6.1. Cách thao tác với từng tính năng:
* **Muốn đổi vị trí**: Giữ chuột và kéo widget từ **Vùng xen kẽ** sang **Cột bên** hoặc **Vùng kết luồng**.
* **Muốn đặt Quảng cáo hoặc Newsletter ở cuối bài**: Bấm `[+ Thêm tiện ích]` trong ô `Vùng 3: Kết Luồng Bài Viết` ➔ Chọn `AdSense`, `Hình ảnh`, hoặc `HTML/JavaScript`.
* **Muốn tạm ẩn widget**: Bấm vào widget đó ➔ Gạt công tắc **"Hiển thị tiện ích này"** sang `TẮT` ➔ Bấm **Lưu**.
* **Khi để trống ô**: Hệ thống tự động không hiển thị gì, bài viết nối liền mạch tự nhiên.

---

## 7. ĐẶC TẢ GIAO DIỆN & CSS DESIGN TOKENS (LIGHT / DARK MODE)

```css
/* Khoảng cách của vùng Đầu Luồng */
#main-above-feed {
  margin-bottom: 2.25rem;
}

/* Khoảng cách của vùng Xen Kẽ Giữa Các Bài */
#main-in-feed-section {
  width: 100%;
  margin: 0.75rem 0;
  display: none; /* Mặc định ẩn, JS kích hoạt khi chèn đúng vị trí */
}
#main-in-feed-section.in-feed-active {
  display: block;
}

/* Khoảng cách của vùng Kết Luồng Bài Viết (Trên nút phân trang) */
#main-pre-pagination-section {
  width: 100%;
  margin-top: 2rem;
  margin-bottom: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px dashed var(--border-color);
}

/* Tự động ẩn hoàn toàn nếu ô bị để trống (Zero CLS / No empty space) */
#main-above-feed:empty,
#main-in-feed-section:empty,
#main-pre-pagination-section:empty {
  display: none !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
}

/* Khi vào trang đọc bài chi tiết (Single Post): Ẩn các vùng widget trang chủ */
.single-post-container ~ #main-above-feed,
.single-post-container ~ #main-in-feed-section,
.single-post-container ~ #main-pre-pagination-section {
  display: none !important;
}
```

---

## 8. BẢNG TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA MATRIX)

| Hạng mục kiểm thử | Tiêu chuẩn kỹ thuật nghiệm thu bắt buộc | Đánh giá |
| :--- | :--- | :---: |
| **Vị trí Đầu Luồng** | Widget trong `main-above-feed` hiển thị chuẩn xác ở đầu Trang 1. Khi sang Trang 2 (`updated-max`), widget tự động ẩn đi. | [ ] |
| **Vị trí Xen Kẽ In-Feed** | Widget trong `main-in-feed-section` tự động được chèn chính xác vào sau bài viết số 3 (hoặc số N theo `data-insert-after`). | [ ] |
| **Vị trí Kết Luồng** | Widget trong `main-pre-pagination-section` hiển thị chính xác nằm SAU bài viết cuối cùng và TRÊN cụm nút phân trang. | [ ] |
| **Hỗ trợ Quảng cáo / AdSense**| Thêm tiện ích AdSense hoặc HTML Banner vào Vùng Kết Luồng: Banner hiển thị đẹp mắt, tự co giãn responsive. | [ ] |
| **Hỗ trợ Newsletter** | Thêm Form đăng ký nhận tin vào Vùng Kết Luồng: Giao diện căn chỉnh ngay ngắn, gửi form mượt mà. | [ ] |
| **Cơ chế Ẩn / Để trống** | Khi gạt công tắc `OFF` hoặc để trống ô section: Hoàn toàn không xuất hiện khoảng trắng thừa hay vỡ layout. | [ ] |
| **Chuyển trang mượt mà** | Bấm `« Trang cũ hơn`: Trang 2 tải nhanh, nhịp điệu bài viết tiếp tục giữ đúng cấu trúc. | [ ] |
| **Đồng bộ Sáng / Tối** | Tất cả các khối widget xen kẽ đổi màu tương thích hoàn hảo giữa Light Mode và Dark Mode. | [ ] |
| **Tính di động (Mobile)** | Trên điện thoại: Toàn bộ widget ở 3 vị trí co giãn 100% bề ngang màn hình, không tràn lề. | [ ] |
