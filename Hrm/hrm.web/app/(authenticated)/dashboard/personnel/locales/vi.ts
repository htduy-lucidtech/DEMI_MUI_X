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
      actions: "Thao tác",
      position: "Chức vụ",
      department: "Phòng ban"
    },
    status: {
      active: "Hoạt động",
      inactive: "Đã nghỉ"
    },
    search_placeholder: "Tìm kiếm nhân viên...",
    add_new: "Thêm nhân viên",
    export_excel: "Xuất Excel"
  },
  details: {
    title: "Chi tiết nhân sự",
    tabs: {
      personal: "Cá nhân",
      contact: "Liên hệ",
      work: "Công việc",
      bank_salary: "Ngân hàng & Lương",
      evaluation: "Đánh giá"
    },
    sections: {
      personal_info: "Thông tin cá nhân",
      identity: "Giấy tờ định danh",
      bank_info: "Tài khoản ngân hàng",
      insurance: "Bảo hiểm xã hội",
      salary_info: "Thông tin lương"
    },
    fields: {
      fullName: "Họ và tên",
      gender: "Giới tính",
      dob: "Ngày sinh",
      address: "Địa chỉ",
      phone: "Số điện thoại",
      identityCard: "Số CCCD",
      bankName: "Ngân hàng",
      bankAccount: "Số tài khoản",
      insuranceNumber: "Số sổ BHXH",
      position: "Chức vụ",
      department: "Phòng ban",
      manager: "Người quản lý",
      baseSalary: "Lương cơ bản",
      allowance: "Phụ cấp"
    }
  },
  dialog: {
    add_title: "Thêm nhân viên mới",
    edit_title: "Chỉnh sửa thông tin",
    save: "Lưu",
    cancel: "Hủy"
  }
};
