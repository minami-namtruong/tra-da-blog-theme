# Hướng Dẫn Thiết Lập Nội Dung Song Ngữ (Bilingual Guide)

Tài liệu này hướng dẫn Admin cách nhập dữ liệu song ngữ trong giao diện Blogger Admin sao cho hệ thống tự động nhận diện và chuyển đổi trơn tru.

## 1. Đối với nội dung ngắn (Tiêu đề, Tên Menu, Label)
Sử dụng cú pháp **Tiếng Việt | Tiếng Anh** trực tiếp trong ô nhập liệu của Blogger.

**Phạm vi áp dụng:**
- Tên các liên kết trong Menu (LinkList).
- Tiêu đề của các Widget (Sidebar, Footer).
- Tên nhãn (Labels / Categories) khi gắn cho bài viết.
- Các đoạn text mô tả cực kỳ ngắn gọn (1 dòng).

**Ví dụ:**
- Tên liên kết Menu: `Trang Chủ | Home`
- Tiêu đề Widget: `Bài Viết Nổi Bật | Popular Posts`

*Lưu ý: Template đã được coder thiết lập sẵn thuộc tính `data-bilingual="true"` bao bọc quanh các vị trí này nên hệ thống sẽ tự động quét và phân tách chuỗi (split).*

---

## 2. Đối với nội dung dài (Đoạn văn, HTML, Bài viết, Giới thiệu)
Sử dụng cơ chế **Khối data-lang** để hệ thống ẩn/hiện toàn bộ khối theo ngôn ngữ đang chọn. 
**Tuyệt đối không dùng** cú pháp dấu gạch đứng `|` cho nội dung dài vì sẽ gây lỗi nếu trong văn bản có chứa ký tự `|` (ví dụ: "Tôi thích Đọc | Viết").

**Phạm vi áp dụng:**
- Toàn bộ nội dung bài viết chi tiết (Post body).
- Nội dung giới thiệu tác giả (About the Author) trong Widget HTML/Text.
- Nội dung lời cảm ơn ở Footer, mô tả của bản tin (Newsletter).

**Cách làm:**
Tạo/Chỉnh sửa widget **HTML/JavaScript** trong Blogger và nhập nội dung chia làm 2 khối `div` như sau:

```html
<!-- Khối hiển thị khi chọn Tiếng Việt -->
<div data-lang="vi">
  Cảm ơn bạn đã dành thời gian ghé thăm blog. Hy vọng những chia sẻ tại đây mang lại cho bạn chút cảm hứng, tri thức hữu ích hoặc sự đồng điệu trên hành trình khám phá và phát triển bản thân.
</div>

<!-- Khối hiển thị khi chọn Tiếng Anh -->
<div data-lang="en">
  Thank you for visiting my blog. I hope the sharings here bring you inspiration, useful knowledge, or a sense of resonance on your journey of self-discovery and personal growth.
</div>
```

**Ưu điểm:**
- Bạn có thể thoải mái sử dụng các thẻ HTML bên trong (in đậm `<b>`, xuống dòng `<br>`, chèn ảnh, list) mà không sợ vỡ giao diện.
- Trình duyệt sẽ tự động ẩn khối `<div data-lang="en">` khi người dùng đang xem Tiếng Việt và ngược lại, không cần bất kỳ thao tác cấu hình nào khác.
