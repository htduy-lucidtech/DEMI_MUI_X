const leaveVi = {
  title: "Quản lý Nghỉ phép",
  subtitle: "Gửi và theo dõi các yêu cầu nghỉ phép của bạn",
  createRequest: "Tạo đơn mới",
  columns: {
    type: "Loại nghỉ",
    startDate: "Ngày bắt đầu",
    endDate: "Ngày kết thúc",
    reason: "Lý do",
    status: "Trạng thái",
    actions: "Thao tác",
    fullName: "Nhân viên",
    approvedBy: "Người duyệt",
  },
  common: {
    refresh: "Tải lại",
    approve: "Duyệt",
    reject: "Từ chối",
  },
  dialog: {
    title: "Tạo yêu cầu nghỉ phép",
    type: "Loại nghỉ phép",
    reason: "Lý do nghỉ",
    startDate: "Từ ngày",
    endDate: "Đến ngày",
    cancel: "Hủy",
    submit: "Gửi đơn",
  },
  messages: {
    success: "Gửi yêu cầu thành công!",
    error: "Có lỗi xảy ra, vui lòng thử lại.",
    updateSuccess: "Cập nhật trạng thái thành công!",
    updateError: "Lỗi khi cập nhật trạng thái.",
  },
  data: {
    type: {
      Annual: "Nghỉ phép năm",
      Sick: "Nghỉ ốm",
      Personal: "Việc riêng",
      Holiday: "Nghỉ lễ",
      "Annual Leave": "Nghỉ phép năm",
      "Sick Leave": "Nghỉ ốm",
    },
    status: {
      Pending: "Đang chờ",
      Approved: "Đã duyệt",
      Rejected: "Từ chối",
      Cancelled: "Đã hủy",
    },
  },
};

export default leaveVi;
