# Hệ thống Phân quyền (RBAC) & Phê duyệt - MUI HRM

Hệ thống đã triển khai hoàn thiện mô hình RBAC động và quy trình phê duyệt đa cấp.

## 1. Mô hình Phân quyền (Dynamic RBAC)

Hệ thống sử dụng mô hình **User -> UserRoles -> Roles -> RolePermissions -> Permissions**.

### Các vai trò (Roles):
*   **Admin:** Quản trị viên hệ thống, có quyền USERS_MANAGE và toàn quyền cấu hình.
*   **General Manager:** Quản lý cấp cao, xem dữ liệu toàn công ty, duyệt mọi yêu cầu (APPROVE_ALL).
*   **Department Manager:** Quản lý cấp trung, xem dữ liệu và duyệt yêu cầu trong phòng ban (APPROVE_DEPT).
*   **Employee:** Nhân viên, xem và quản lý dữ liệu cá nhân.

### Danh sách Quyền hạn chính (Permissions):
| Code | Mô tả | Phạm vi |
| :--- | :--- | :--- |
| `USERS_MANAGE` | Quản lý tài khoản và gán Role | Admin |
| `APPROVE_ALL` | Duyệt mọi yêu cầu trong hệ thống | Admin, Gen Manager |
| `APPROVE_DEPT` | Duyệt yêu cầu thuộc phòng ban | Dept Manager |
| `EMP_VIEW_ALL` | Xem toàn bộ hồ sơ nhân sự | Admin, Gen Manager |
| `ATT_VIEW_DEPT` | Xem chấm công phòng ban | Dept Manager |
| `AUDIT_VIEW` | Xem nhật ký hệ thống | Admin, Gen Manager |

---

## 2. Hệ thống Phê duyệt (Approval Request)

Tính năng này cho phép kiểm duyệt mọi thay đổi dữ liệu nhạy cảm trước khi áp dụng vào cơ sở dữ liệu chính.

### Quy trình hoạt động:
1.  **Gửi yêu cầu:** Khi một hành động yêu cầu kiểm duyệt được thực hiện, hệ thống tạo một bản ghi `ApprovalRequest` với dữ liệu đề xuất (JSON).
2.  **Kiểm tra phạm vi:** 
    *   Yêu cầu được gắn kèm `DepartmentId` của người yêu cầu.
    *   `General Manager` thấy toàn bộ danh sách chờ.
    *   `Department Manager` chỉ thấy danh sách thuộc phòng ban mình.
3.  **Xử lý:** Người có thẩm quyền ấn **Duyệt (Approve)** hoặc **Từ chối (Reject)** kèm ghi chú.

---

## 3. Nhật ký hoạt động (Audit Logs)

Hệ thống tự động ghi lại các thao tác quan trọng để phục vụ mục đích tra soát:
*   **Timestamp:** Thời gian thực hiện.
*   **User:** Người thực hiện thao tác.
*   **Action:** Loại hành động (Create, Update, Delete, Login).
*   **Details:** Chi tiết thay đổi hoặc mô tả hành động.

---

## 4. Phân quyền theo Chi nhánh (Multi-branch)

Người dùng được gắn với một `BranchId`. 
*   Dữ liệu nhân sự và chấm công có thể được lọc theo Chi nhánh để hỗ trợ quản lý phân tán.
*   Admin có thể quản lý danh mục chi nhánh tại trang cấu hình hệ thống.

---

## 5. Trạng thái Triển khai
*   ✅ Backend: Migration, Entities, Controllers (Approvals, Roles, Users).
*   ✅ Frontend: UI Phê duyệt, UI Quản lý nhóm quyền, HasPermission component.
*   ✅ Seed Data: Dữ liệu mẫu 6 vai trò tiêu chuẩn.
