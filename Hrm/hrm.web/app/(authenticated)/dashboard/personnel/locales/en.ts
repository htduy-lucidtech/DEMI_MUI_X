export default {
  title: "Personnel Management",
  description: "Manage employee list, information, and work status.",
  table: {
    columns: {
      fullName: "Full Name",
      username: "Username",
      email: "Email",
      role: "Role",
      status: "Status",
      actions: "Actions",
      position: "Position",
      department: "Department"
    },
    status: {
      active: "Active",
      inactive: "Resigned"
    },
    search_placeholder: "Search employees...",
    add_new: "Add Employee",
    export_excel: "Export Excel"
  },
  details: {
    title: "Employee Details",
    tabs: {
      personal: "Personal",
      contact: "Contact",
      work: "Work",
      bank_salary: "Bank & Salary",
      evaluation: "Evaluation"
    },
    sections: {
      personal_info: "Personal Information",
      identity: "Identity Documents",
      bank_info: "Bank Account",
      insurance: "Social Insurance",
      salary_info: "Salary Information"
    },
    fields: {
      fullName: "Full Name",
      gender: "Gender",
      dob: "Date of Birth",
      address: "Address",
      phone: "Phone Number",
      identityCard: "ID/Passport Number",
      bankName: "Bank Name",
      bankAccount: "Account Number",
      insuranceNumber: "Insurance Number",
      position: "Position",
      department: "Department",
      manager: "Manager",
      baseSalary: "Base Salary",
      allowance: "Allowance"
    }
  },
  dialog: {
    add_title: "Add New Employee",
    edit_title: "Edit Information",
    save: "Save",
    cancel: "Cancel"
  }
};
