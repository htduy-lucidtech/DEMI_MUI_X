import api from "@/lib/api";

export interface PayrollRecord {
  userId: number;
  fullName: string;
  baseSalary: number;
  workDays: number;
  totalSalary: number;
}

export const payrollService = {
  calculate: async (month: number, year: number): Promise<PayrollRecord[]> => {
    const response = await api.get(`/Payroll/calculate/${month}/${year}`);
    return response.data;
  }
};
