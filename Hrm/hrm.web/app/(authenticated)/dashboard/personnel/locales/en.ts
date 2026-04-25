export default {
  title: "Personnel Management",
  description: "Manage employee list, information, and employment status.",
  table: {
    columns: {
      fullName: "Full Name",
      username: "Username",
      email: "Email",
      role: "Role",
      status: "Status",
      actions: "Actions"
    },
    status: {
      active: "Active",
      inactive: "Inactive"
    },
    search_placeholder: "Search employees...",
    add_new: "Add Employee",
    export_excel: "Export Excel"
  },
  dialog: {
    add_title: "Add New Employee",
    edit_title: "Edit Information",
    save: "Save",
    cancel: "Cancel"
  }
};
