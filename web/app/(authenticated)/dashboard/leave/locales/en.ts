const leaveEn = {
  title: "Leave Management",
  subtitle: "Submit and track your leave requests",
  createRequest: "Create New Request",
  columns: {
    type: "Leave Type",
    startDate: "Start Date",
    endDate: "End Date",
    reason: "Reason",
    status: "Status",
    actions: "Actions",
    fullName: "Employee",
    approvedBy: "Approved By",
  },
  common: {
    refresh: "Refresh",
    approve: "Approve",
    reject: "Reject",
  },
  dialog: {
    title: "Create Leave Request",
    type: "Leave Type",
    reason: "Reason",
    startDate: "Start Date",
    endDate: "End Date",
    cancel: "Cancel",
    submit: "Submit",
  },
  messages: {
    success: "Request submitted successfully!",
    error: "An error occurred, please try again.",
    updateSuccess: "Status updated successfully!",
    updateError: "Failed to update status.",
  },
  data: {
    type: {
      Annual: "Annual Leave",
      Sick: "Sick Leave",
      Personal: "Personal Leave",
      Holiday: "Holiday",
      "Annual Leave": "Annual Leave",
      "Sick Leave": "Sick Leave",
    },
    status: {
      Pending: "Pending",
      Approved: "Approved",
      Rejected: "Rejected",
      Cancelled: "Cancelled",
    },
  },
};

export default leaveEn;
