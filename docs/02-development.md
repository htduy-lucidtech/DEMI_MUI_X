# Hướng dẫn Đa ngôn ngữ (i18n)

Hệ thống HRM sử dụng thư viện `next-intl` để triển khai đa ngôn ngữ với chiến lược "Không tiền tố" (No-prefix strategy), trong đó ngôn ngữ được xác định dựa trên Cookie.

## 1. Tóm tắt và Cách hoạt động

### Tổng quan
- **Thư viện**: `next-intl` (phiên bản mới nhất tương thích Next.js 15 App Router).
- **Ngôn ngữ hỗ trợ**: Tiếng Việt (`vi`) và Tiếng Anh (`en`). Ngôn ngữ mặc định là `vi`.
- **Cơ chế lưu trữ**: Ngôn ngữ được lưu trong Cookie có tên `NEXT_LOCALE`.
- **Phạm vi**: Áp dụng cho cả Server Components và Client Components.

### Luồng hoạt động
1. Người dùng thay đổi ngôn ngữ trên giao diện (Navbar).
2. Hệ thống cập nhật giá trị `vi` hoặc `en` vào Cookie `NEXT_LOCALE`.
3. Trang web được tải lại (`window.location.reload()`).
4. File `web/i18n.ts` đọc giá trị từ Cookie và cung cấp bộ tin nhắn (messages) tương ứng cho toàn bộ ứng dụng thông qua `NextIntlClientProvider` (trong `layout.tsx`).

---

## 2. Chi tiết triển khai vào code

### Cấu trúc thư mục locales (Centralized)
Để quản lý dễ dàng và tránh phân mảnh, toàn bộ các bản dịch được tập trung tại thư mục `web/locales/`.

Cấu trúc:
```text
web/locales/
├── personnel/           # Module Nhân sự
│   ├── vi.ts
│   └── en.ts
├── attendance/          # Module Chấm công
├── notification/        # Thông báo Realtime
└── ...
```

### Đăng ký module mới trong `web/i18n.ts`
Khi tạo module mới, bạn phải import và đăng ký vào `messagesMap` trong `web/i18n.ts`:

```typescript
// 1. Import (Luôn dùng đường dẫn tương đối từ gốc locales)
import myModuleVi from "./locales/my-module/vi";
import myModuleEn from "./locales/my-module/en";

// 2. Thêm vào messagesMap
const messagesMap = {
  vi: {
    // ... các module khác
    MyModule: myModuleVi,
  },
  en: {
    // ... các module khác
    MyModule: myModuleEn,
  }
};
```

### Sử dụng trong Code

#### A. Trong Client Components
Sử dụng hook `useTranslations`:

```tsx
"use client";
import { useTranslations } from "next-intl";

export default function MyComponent() {
  const t = useTranslations("MyModule"); // Key đã đăng ký trong messagesMap
  
  return <h1>{t("title")}</h1>;
}
```

#### B. Trong Server Components
Sử dụng hàm async `getTranslations`:

```tsx
import { getTranslations } from "next-intl/server";

export default async function MyServerPage() {
  const t = await getTranslations("MyModule");
  
  return <div>{t("description")}</div>;
}
```

### Cách thêm bản dịch mới
1. Tìm thư mục tương ứng trong `web/locales/` (hoặc tạo mới nếu là module mới).
2. Thêm key-value vào file `vi.ts`.
3. Thêm key tương tự vào file `en.ts` với giá trị tiếng Anh.
4. Sử dụng `t("key_vừa_thêm")` trong component.

---
*Lưu ý: Luôn đảm bảo tất cả các text hiển thị trên UI (nhãn, nút, thông báo, placeholder) đều được bọc qua hàm `t()` để đảm bảo tính nhất quán của hệ thống.*
