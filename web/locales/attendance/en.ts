export default {
  title: "Real-time Attendance",
  description: "Record your daily working hours",
  checkIn: "Check In",
  checkOut: "Check Out",
  status: {
    title: "Today's Status",
    checkedIn: "You checked in at",
    checkedOut: "You checked out at",
    notYet: "You haven't started your shift today",
    late: "Late",
    onTime: "On Time",
    workingTime: "Working Time"
  },
  stats: {
    monthly: "Monthly Stats",
    workingDays: "Working Days",
    workingHours: "Total Hours",
    otHours: "OT Hours",
    lateDays: "Late Days"
  },
  regulations: {
    title: "Time Regulations",
    checkInTime: "Standard Check-In",
    checkOutTime: "Standard Check-Out",
    edit: "Time Configuration",
    saveSuccess: "Regulations updated successfully",
    shortTitle: "Rules (In/Out)"
  },
  late: {
    title: "Record Lateness",
    reasonPlaceholder: "Please enter a reason for being late...",
    reasonLabel: "Late Reason",
    submit: "Confirm & Check In",
    description: "Standard check-in time is <strong>{time}</strong>. Current time is late, please provide a reason."
  },
  history: "Company-wide Attendance History",
  columns: {
    employee: "Employee",
    date: "Date",
    checkIn: "Check In",
    checkOut: "Check Out",
    workHours: "Hours",
    otHours: "OT",
    duration: "Duration",
    status: "Status",
    lateReason: "Late Reason"
  },
  dialog: {
    save: "Save Changes",
    cancel: "Cancel",
    delete_bulk_title: "Confirm Bulk Delete",
    delete_bulk_confirm: "Are you sure you want to delete {count} selected records?",
    delete_all: "Delete Selected",
    search_placeholder: "Search by employee, date, time, status or reason",
    filter_all: "All Status",
    clear_filters: "Clear Filters"
  },
  messages: {
    successIn: "Check-in successful!",
    successOut: "Check-out successful!",
    error: "An error occurred, please try again."
  }
};
