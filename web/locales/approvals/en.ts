const approvalsEn = {
  title: "Approval Requests",
  subtitle: "Review and process data change requests in the system",
  columns: {
    requester: "Requester",
    type: "Request Type",
    status: "Status",
    createdAt: "Created At",
    actions: "Actions",
  },
  types: {
    PersonnelChange: "Personnel Change",
    LeaveRequest: "Leave Request",
    AttendanceAdjustment: "Attendance Adjustment",
  },
  status: {
    Pending: "Pending",
    Approved: "Approved",
    Rejected: "Rejected",
  },
  dialog: {
    title: "Request Details",
    info: "Basic Info",
    data: "Proposed Data",
    notes: "Processing Notes",
    placeholder: "Enter reason for approval or rejection...",
    approve: "Approve",
    reject: "Reject",
    close: "Close",
  },
  messages: {
    success: "Request processed successfully!",
    error: "An error occurred during processing.",
  }
};

export default approvalsEn;
