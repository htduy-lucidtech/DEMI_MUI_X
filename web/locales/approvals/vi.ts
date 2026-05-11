const approvalsVi = {
  title: "Phê duyệt yêu cầu",
  subtitle: "Xem xét và xử lý các yêu cầu thay đổi dữ liệu trong hệ thống",
  columns: {
    requester: "Người yêu cầu",
    type: "Loại yêu cầu",
    status: "Trạng thái",
    createdAt: "Ngày tạo",
    actions: "Thao tác",
  },
  types: {
    PersonnelChange: "Thay đổi nhân sự",
    LeaveRequest: "Đơn nghỉ phép",
    AttendanceAdjustment: "Chỉnh sửa chấm công",
  },
  status: {
    Pending: "Đang chờ",
    Approved: "Đã duyệt",
    Rejected: "Từ chối",
  },
  dialog: {
    title: "Chi tiết yêu cầu",
    info: "Thông tin cơ bản",
    data: "Dữ liệu đề xuất",
    notes: "Ghi chú xử lý",
    placeholder: "Nhập lý do duyệt hoặc từ chối...",
    approve: "Phê duyệt",
    reject: "Từ chối",
    close: "Đóng",
  },
  messages: {
    success: "Xử lý yêu cầu thành công!",
    error: "Có lỗi xảy ra khi xử lý.",
  }
};

export default approvalsVi;
