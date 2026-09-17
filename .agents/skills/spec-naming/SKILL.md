---
name: spec-naming
description: >-
  Standard workflow and naming conventions for creating, updating, and managing
  specification documents in the specs/ directory. Use this skill whenever the user
  asks to create, rename, organize, or update specifications or track feature lifecycles.
---

# Quy Chuẩn Đặt Tên & Vòng Đời Spec

## 1. Cấu Trúc Đặt Tên File
`[Status]_STT_Name_Of_Document.md`
- Phân tách bằng dấu gạch dưới `_`, **không dùng khoảng trắng**.
- `STT`: 3 chữ số tăng dần (`001`, `002`... = max hiện tại + 1).
- `Name`: Viết hoa chữ đầu mỗi từ (TitleCase), đuôi `_Specification.md`.

## 2. Vòng Đời 7 Trạng Thái (Status Lifecycle)
- `[Idea]`: Ý tưởng sơ khởi, định hướng tương lai, chưa có thiết kế chi tiết.
- `[Draft]`: Bản thảo đặc tả đang viết dở, chưa chốt duyệt.
- `[Open]`: Đặc tả hoàn chỉnh, sẵn sàng đem ra code.
- `[Doing]`: Đang trong quá trình lập trình.
- `[Pending]`: Đang làm dở nhưng tạm dừng (chờ bên thứ 3, blocker).
- `[Done]`: Đã code xong, nghiệm thu đạt yêu cầu.
- `[Cancel]`: Ý tưởng/spec bị hủy hoặc thay thế bởi giải pháp khác.

## 3. Quy Tắc Thao Tác
- Khi đổi trạng thái: Luôn dùng `git mv` để giữ lịch sử commit.
- Metadata đầu file spec:
```markdown
# [TÊN TÍNH NĂNG]
- **Mã spec:** [STATUS]_[STT] | **Phiên bản:** 1.0.0 | **Trạng thái:** [Status] | **Ngày:** DD/MM/YYYY
```
