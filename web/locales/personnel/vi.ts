export default {
  title: "Quản lý Nhân sự",
  description: "Quản lý danh sách, thông tin và trạng thái làm việc của nhân viên.",
  table: {
    title: "Danh sách nhân viên",
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
      allowance: "Phụ cấp",
      hourlyRate: "Lương theo giờ",
      hourlyRateOT: "Lương tăng ca (OT)",
      idCard: "Thẻ nhân viên"
    },
    genders: {
      male: "Nam",
      female: "Nữ",
      other: "Khác"
    }
  },
  dialog: {
    add_title: "Thêm nhân viên mới",
    edit_title: "Chỉnh sửa thông tin",
    delete_title: "Xác nhận xóa",
    delete_confirm: "Bạn có chắc chắn muốn xóa nhân viên này? Hành động này không thể hoàn tác.",
    delete_bulk_title: "Xác nhận xóa hàng loạt",
    delete_bulk_confirm: "Bạn có chắc chắn muốn xóa {count} nhân viên đã chọn? Hành động này không thể hoàn tác.",
    delete: "Xóa",
    delete_all: "Xóa tất cả",
    save: "Lưu",
    cancel: "Hủy",
    export_pdf: "Xuất PDF",
    print_card: "In thẻ",
    id_card_title: "Thẻ nhân viên",
    sections: {
      basic: "Thông tin cơ bản",
      work_salary: "Công việc & Lương",
      other: "Khác"
    }
  },
  messages: {
    request_sent: "Yêu cầu đã được gửi đi để phê duyệt.",
    save_success: "Cập nhật nhân sự thành công!",
    delete_success: "Đã xóa nhân sự!",
  }
};
