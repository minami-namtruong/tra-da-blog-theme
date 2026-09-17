---
name: git-branching
description: >-
  Standard Git branching strategy and workflow for multi-theme architecture and
  component sharing. Use this skill whenever branching, creating new themes,
  merging base updates, or cherry-picking widgets across theme branches.
---

# Quy Chuẩn Quản Lý Git Branch Cho Đa Theme

## 1. Phân Loại Nhánh (Branch Taxonomy)
- **`main`**: Base Theme Core v1.0.0 (khung xương chuẩn, sạch sẽ, không chứa nội dung/tùy biến cá nhân).
- **`refactor/*`**: Nhánh tái cấu trúc hệ thống (ví dụ: `refactor/base-theme-components`).
- **`theme/<name>`**: Nhánh phát triển một theme con cụ thể (ví dụ: `theme/tra-da-editorial`, `theme/magazine`).
- **`feature/*`**: Nhánh phát triển tính năng hoặc hệ sinh thái app (ví dụ: `feature/apps-ecosystem`).

## 2. Các Lệnh Thao Tác Chuẩn (Runbook)

### Tạo một Theme mới từ Base Core:
```bash
git checkout main
git checkout -b theme/<ten-theme-moi>
```

### Đồng bộ cập nhật Core từ `main` vào Theme con:
*(Khi Base Theme sửa lỗi hoặc tối ưu SEO/Core)*
```bash
git checkout theme/<ten-theme>
git merge main
```

### "Bốc" một Component/Widget từ theme này sang theme khác:
*(Nhặt trực tiếp file component mà không dính líu code khác)*
```bash
git checkout theme/<target-theme>
git checkout <source-theme-branch> -- src/components/<widget>.xml src/styles/<widget>.css
git commit -m "feat: import <widget> from <source-theme-branch>"
```

### Bê nguyên một Commit tính năng sang nhánh khác:
```bash
git checkout theme/<target-theme>
git cherry-pick <commit-hash>
```

### Đóng gói Theme giao cho Khách:
Chỉ export từ nhánh `theme/<client-name>`, đảm bảo chạy `npm run build` tạo `dist/theme.xml`.
