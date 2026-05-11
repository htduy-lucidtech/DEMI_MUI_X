export default {
  title: "System Settings",
  description: "Manage operational parameters and company regulations",
  sections: {
    general: "General Settings",
    workingTime: "Working Hours",
    notifications: "Notifications"
  },
  fields: {
    companyName: "Company Name",
    startTime: "Start Time",
    endTime: "End Time",
    lateThreshold: "Late Threshold (minutes)",
    emailNotify: "Email Notifications",
    realtimeNotify: "Real-time Notifications"
  },
  save: "Save Settings",
  success: "Updated successfully!",
  roles: {
    title: "System Permissions",
    add: "Add Role",
    edit: "Edit Role",
    name: "Role Name",
    description: "Description",
    permissions: "Permission List",
    save: "Save Changes",
    cancel: "Cancel"
  }
};
