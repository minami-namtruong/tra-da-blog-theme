---
name: spec-naming
description: >-
  Standard workflow and naming conventions for creating, updating, and managing
  specification documents in the specs/ directory. Use this skill whenever the user
  asks to create, rename, organize, or update specifications or track feature lifecycles.
---

# Quy Chuẩn Đặt Tên & Vòng Đời Spec

## 1. Cấu Trúc Đặt Tên File
`StatusID_Status_STT_Name_Of_Document.md`
- Không dùng ngoặc vuông để hỗ trợ gõ `@` gợi ý file trong IDE.
- Phân tách bằng dấu gạch dưới `_`, **không dùng khoảng trắng**.
- `StatusID`: 2 chữ số cố định gắn liền với Status (`01` đến `07`), giúp sắp xếp việc đã xong lên đầu và việc đang/chuẩn bị làm xuống đáy cùng.
- `STT`: 3 chữ số tăng dần (`001`, `002`... = max hiện tại + 1).
- `Name`: Viết hoa chữ đầu mỗi từ (TitleCase), đuôi `_Specification.md`.

## 2. Vòng Đời 7 Trạng Thái & Bảng Mã StatusID (Xếp Từ Đã Xong ➡️ Đang Làm)
- `01_Done`: Đã code xong, nghiệm thu đạt yêu cầu (Đẩy lên đầu trang để lưu trữ).
- `02_Cancel`: Ý tưởng/spec bị hủy hoặc thay thế bởi giải pháp khác (Lưu trữ).
- `03_Pending`: Đang làm dở nhưng tạm dừng (chờ bên thứ 3, blocker).
- `04_Idea`: Ý tưởng sơ khởi, định hướng tương lai, chưa có thiết kế chi tiết.
- `05_Draft`: Bản thảo đặc tả đang viết dở, chưa chốt duyệt.
- `06_Open`: Đặc tả hoàn chỉnh, sẵn sàng đem ra code (Việc chuẩn bị làm tiếp theo).
- `07_Doing`: Đang trong quá trình lập trình (Nằm ở đáy cùng để click mở nhanh).

## 3. Quy Tắc Thao Tác
- Khi đổi trạng thái: Luôn dùng `git mv` để giữ lịch sử commit (ví dụ: `git mv specs/06_Open_016_... specs/07_Doing_016_...`).
- Metadata đầu file spec:
```markdown
# [TÊN TÍNH NĂNG]
- **Mã spec:** [STATUS]_[STT] | **Phiên bản:** 1.0.0 | **Trạng thái:** [Status] | **Ngày:** DD/MM/YYYY
```

