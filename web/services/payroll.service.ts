import api from "@/services/api";

export interface PayrollRecord {
  userId: number;
  fullName: string;
  baseSalary: number;
  hourlyRate: number;
  allowance: number;
  workHours: number;
  otHours: number;
  totalSalary: number;
}

export const payrollService = {
  calculate: async (month: number, year: number): Promise<PayrollRecord[]> => {
    const response = await api.get(`/Payroll/calculate/${month}/${year}`);
    return response.data;
  },
  
  exportExcel: async (month: number, year: number): Promise<Blob> => {
    const response = await api.get(`/Payroll/export/excel/${month}/${year}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  exportPdf: async (userId: number, month: number, year: number): Promise<Blob> => {
    const response = await api.get(`/Payroll/export/pdf/${userId}/${month}/${year}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
