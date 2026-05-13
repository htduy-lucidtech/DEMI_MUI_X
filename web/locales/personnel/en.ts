export default {
  title: "Personnel Management",
  description: "Manage employee list, information, and work status.",
  table: {
    title: "Employee List",
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
      allowance: "Allowance",
      hourlyRate: "Hourly Rate",
      hourlyRateOT: "Overtime Rate",
      idCard: "ID Card"
    },
    genders: {
      male: "Male",
      female: "Female",
      other: "Other"
    }
  },
  dialog: {
    add_title: "Add New Employee",
    edit_title: "Edit Information",
    delete_title: "Confirm Delete",
    delete_confirm: "Are you sure you want to delete this employee? This action cannot be undone.",
    delete_bulk_title: "Confirm Bulk Delete",
    delete_bulk_confirm: "Are you sure you want to delete {count} selected employees? This action cannot be undone.",
    delete: "Delete",
    delete_all: "Delete All",
    save: "Save",
    cancel: "Cancel",
    export_pdf: "Export PDF",
    print_card: "Print Card",
    id_card_title: "Employee ID Card",
    sections: {
      basic: "Basic Information",
      work_salary: "Work & Salary",
      other: "Other"
    }
  },
  messages: {
    request_sent: "Request has been sent for approval.",
    save_success: "Personnel updated successfully!",
    delete_success: "Personnel deleted!",
  }
};
