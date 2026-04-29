import api from "@/lib/api";

export interface Contract {
  id?: number;
  contractNumber: string;
  type: string;
  startDate: string;
  endDate?: string;
  salary: number;
  status: string;
  notes?: string;
  employeeId: number;
  employee?: any;
  createdAt?: string;
}

export const contractService = {
  getAll: async (): Promise<Contract[]> => {
    const response = await api.get("/Contracts");
    return response.data;
  },

  getById: async (id: number): Promise<Contract> => {
    const response = await api.get(`/Contracts/${id}`);
    return response.data;
  },

  getByEmployeeId: async (employeeId: number): Promise<Contract[]> => {
    const response = await api.get(`/Contracts/employee/${employeeId}`);
    return response.data;
  },

  create: async (data: Partial<Contract>) => {
    const response = await api.post("/Contracts", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Contract>) => {
    const response = await api.put(`/Contracts/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/Contracts/${id}`);
    return response.data;
  }
};
