# UI Design System & Component Guidelines

Tài liệu này quy định các tiêu chuẩn thiết kế và phát triển giao diện người dùng (UI) cho hệ thống HRM, nhằm đảm bảo tính đồng nhất (consistency) trên tất cả các trang, form và thành phần trong ứng dụng.

## 1. Nguyên tắc thiết kế chung (Design Principles)
- **Sạch sẽ & Hiện đại**: Sử dụng khoảng trắng hợp lý, màu sắc nhẹ nhàng nhưng chuyên nghiệp.
- **Tập trung vào dữ liệu**: Ưu tiên mật độ thông tin cao (compact mode) cho các bảng dữ liệu nhưng vẫn đảm bảo dễ đọc.
- **Trải nghiệm nhất quán**: Tất cả các hành động tương tự (thêm, sửa, xóa, xem chi tiết) phải có cách trình bày và vị trí giống nhau.

## 2. Hệ thống màu sắc (Color Palette)

### 2.1. Màu thương hiệu (Brand Colors)
- **Primary (Blue)**: `#4361ee` (Xanh công nghệ - Hiện đại & Dịu mắt).
  - Light: `#f0f3ff`
  - Dark: `#3730a3`
- **Secondary (Cyan)**: `#4cc9f0` (Xanh ngọc bổ trợ).

### 2.2. Màu hệ thống (System Colors)
- **Background**: `#f8fafc` (Slate nhạt - Màu nền sương mù).
- **Surface (Paper)**: `#ffffff` (Trắng tuyệt đối).
- **Border**: `#e2e8f0` (Xám nhạt cho viền Card/Table).

### 2.3. Màu văn bản (Typography Colors)
- **Text Primary**: `#1e293b` (Slate đậm - Thay thế đen thuần để giảm mỏi mắt).
- **Text Secondary**: `#64748b` (Xám Slate cho nhãn và mô tả).
- **Text Disabled**: `#94a3b8`.

## 3. Hệ thống Typography

- **Font Family**: `Inter, Roboto, sans-serif`.
- **Kích thước font tiêu chuẩn**:
  - `h4`: 1.375rem (22px) - Bold 600 - Dùng cho tiêu đề trang lớn.
  - `h5`: 1.125rem (18px) - Bold 600.
  - `h6`: 1rem (16px) - Bold 600 - Dùng cho tiêu đề Card hoặc Section.
  - `body1`: 0.875rem (14px) - Mặc định cho nội dung chính.
  - `body2`: 0.8125rem (13px) - Dùng cho bảng dữ liệu và thông tin phụ.
  - `caption`: 0.75rem (12px) - Dùng cho label trong form hoặc ghi chú nhỏ.

## 4. Spacing & Layout

- **Border Radius**: 
  - Card/Paper: `6px`.
  - Button: `4px`.
  - Input: `4px`.
- **Gaps (MUI System)**:
  - Container Gap: `1.5` (12px).
  - Section Spacing: `3` (24px).
  - Form field spacing: `2` (16px).
- **Shadows**:
  - `boxShadow`: `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`. (Subtle shadow).

## 5. Quy chuẩn thành phần (Common Components)

### 5.1. Bảng dữ liệu (DataGrid)
- **Density**: `compact`.
- **Header Style**:
  - Background: `#f8fafc`.
  - Font weight: 700.
  - Font size: `0.75rem`.
  - Case: `UPPERCASE`.
  - Letter spacing: `0.05em`.
- **Cell Style**:
  - Font size: `0.8125rem`.
  - Padding: `8px 12px`.
- **Toolbar**: Luôn bao gồm Search bên trái và các Action Buttons (Add, Export, Refresh) bên phải.

### 5.2. Form & Inputs
- **Kích thước**: Luôn sử dụng `size="small"`.
- **Variant**: `outlined`.
- **Layout**: 
  - Sử dụng CSS Grid cho Form: `display: 'grid'`, `gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }`.
  - Khoảng cách giữa các field (gap): `2.5` (20px).
- **Section Headers**: Để phân chia các nhóm thông tin trong form, sử dụng cấu trúc:
  ```tsx
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
    <Box sx={{ width: 4, height: 16, bgcolor: 'primary.main', borderRadius: 1 }} />
    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
      TIÊU ĐỀ NHÓM
    </Typography>
  </Box>
  ```
- **Label**: Ưu tiên sử dụng label mặc định của MUI TextField để tiết kiệm diện tích, hoặc sử dụng `Typography variant="caption"` với `fontWeight: 700` phía trên input cho các form phức tạp.

### 5.3. Nút bấm (Buttons)
- **Kích thước**: `small`.
- **Shadow**: `none` (Không đổ bóng cho button để giữ giao diện phẳng hiện đại).
- **Primary Button**: `variant="contained"`.
- **Secondary/Cancel**: `variant="outlined"`.
- **Action Icons**: Dùng `IconButton size="small"`.

### 5.4. Dialog & Drawer
- **Dialog**: Dùng cho Form nhập liệu ngắn (Thêm/Sửa).
- **Drawer (Right)**: Dùng cho xem chi tiết thông tin (Details View) với độ rộng chuẩn `550px`.

## 6. Quy tắc đặt tên và Cấu trúc (Standardized Naming)

- **Trang danh sách**: `[Entity]Page.tsx`
- **Component Dialog**: `[Entity]Dialog.tsx`
- **Service API**: `[Entity].service.ts`

## 7. Trạng thái phản hồi (Feedback)

- **Loading**: Sử dụng `FullPageLoading` hoặc Skeleton cho từng Card.
- **Success/Error**: Sử dụng `Snackbar` với `Alert` ở góc dưới bên phải (`bottom-right`).

## 8. Chiến lược Duy trì và Đồng bộ hóa (Maintenance & Sync Strategy)

Để code dễ bảo trì và tránh việc "mỗi trang một kiểu", chúng ta sẽ áp dụng các phương án sau:

### 8.1. Component hóa các UI Pattern (Reusable UI Components)
Thay vì viết lại cấu trúc JSX ở mỗi trang, ta sẽ xây dựng bộ thành phần dùng chung tại `web/components/common`:
- **`PageHeader`**: Bao gồm tiêu đề trang, thanh tìm kiếm và bộ nút hành động.
- **`FormGrid`**: Một wrapper component sử dụng CSS Grid với các thông số gap chuẩn (2.5).
- **`SectionHeader`**: Thành phần tiêu đề có thanh dọc màu xanh đã định nghĩa ở mục 5.2.
- **`StatusChip`**: Thành phần hiển thị trạng thái (Active, Pending, Rejected) với màu sắc đồng nhất.

### 8.2. Tận dụng tối đa Theme Overrides (MUI Theme)
Mọi thay đổi về "Look & Feel" (như Border Radius, Padding) phải được thực hiện tại `web/components/Providers.tsx`. 
- **Hạn chế dùng `sx` cho các thuộc tính cơ bản**: Tránh `sx={{ borderRadius: '2px' }}` ở khắp nơi. Nếu muốn đổi bo góc toàn hệ thống, chỉ cần sửa một chỗ trong Theme.
- **Định nghĩa "Global Spacing"**: Sử dụng hệ thống `spacing` của MUI (ví dụ: `p: 2` thay vì `p: '16px'`).

### 8.3. Chuẩn hóa Cấu trúc Dữ liệu UI (Types & Constants)
- **`ui.constants.ts`**: Lưu trữ các thông số như `DRAWER_WIDTH = 550`, `MAX_CONTENT_WIDTH = 1200`.
- **Shared Types**: Định nghĩa các interface cho các props chung (ví dụ: `BaseDialogProps`).

### 8.4. Cơ chế Xác nhận (Global Confirmations)
Xây dựng một hook hoặc component `ConfirmDialog` dùng chung cho tất cả các hành động nguy hiểm (Xóa, Hủy bỏ) để đảm bảo giao diện xác nhận giống hệt nhau ở mọi module.

---
**Mục tiêu**: Giảm 50% lượng code giao diện lặp lại và đảm bảo khi thay đổi 1 thông số Design (ví dụ: đổi từ bo góc sang vuông cạnh), toàn bộ hệ thống sẽ cập nhật ngay lập tức.
