export default {
  title: "Quản lý Nhân sự",
  description: "Quản lý danh sách, thông tin và trạng thái làm việc của nhân viên.",
  table: {
    columns: {
      fullName: "Họ và tên",
      username: "Tên đăng nhập",
      email: "Email",
      role: "Vai trò",
      status: "Trạng thái",
      actions: "Thao tác"
    },
    status: {
      active: "Hoạt động",
      inactive: "Đã nghỉ"
    },
    search_placeholder: "Tìm kiếm nhân viên...",
    add_new: "Thêm nhân viên",
    export_excel: "Xuất Excel"
  },
  dialog: {
    add_title: "Thêm nhân viên mới",
    edit_title: "Chỉnh sửa thông tin",
    save: "Lưu",
    cancel: "Hủy"
  }
};
