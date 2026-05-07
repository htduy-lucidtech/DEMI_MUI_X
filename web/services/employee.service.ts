import api from "@/lib/api";

export interface Employee {
  id?: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  identityCardNumber?: string;
  bankAccountNumber?: string;
  bankName?: string;
  socialInsuranceNumber?: string;
  position?: string;
  departmentId?: number;
  department?: any;
  baseSalary: number;
  allowance: number;
  hourlyRate?: number;
  hourlyRateOT?: number;
  account?: any;
}

export const employeeService = {
  getAll: async (): Promise<Employee[]> => {
    const response = await api.get("/Employees");
    return response.data;
  },
  
  getById: async (id: number): Promise<Employee> => {
    const response = await api.get(`/Employees/${id}`);
    return response.data;
  },
  
  create: async (data: Partial<Employee>) => {
    const response = await api.post("/Employees", data);
    return response.data;
  },
  
  update: async (id: number, data: Partial<Employee>) => {
    const response = await api.put(`/Employees/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/Employees/${id}`);
    return response.data;
  },

  bulkDelete: async (ids: number[]) => {
    const response = await api.post("/Employees/bulk-delete", ids);
    return response.data;
  },

  exportExcel: async (ids?: number[]): Promise<Blob> => {
    const params = ids ? { ids: ids.join(',') } : {};
    const response = await api.get('/Employees/export/excel', {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};
