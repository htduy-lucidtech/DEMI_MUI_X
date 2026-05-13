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
    "PERSONNEL_CREATE": "Thêm mới nhân sự",
    "PERSONNEL_UPDATE": "Cập nhật nhân sự",
    "PERSONNEL_DELETE": "Xóa nhân sự",
    "LEAVE_REQUEST": "Đơn nghỉ phép",
    "ATTENDANCE_ADJUSTMENT": "Chỉnh sửa chấm công",
  },
  tabs: {
    pending: "Chờ xử lý",
    history: "Lịch sử",
  },
  common: {
    noData: "Không có dữ liệu",
    details: "Chi tiết",
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
