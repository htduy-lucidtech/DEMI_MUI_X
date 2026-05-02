import api from "@/lib/api";

export interface User {
  id?: number;
  employeeId: number;
  employee?: {
    id?: number;
    fullName: string;
    gender?: string;
    address?: string;
    identityCardNumber?: string;
    position?: string;
    bankAccountNumber?: string;
    bankName?: string;
    department?: {
      name: string;
    };
  };
  username: string;
  email: string;
  password?: string;
  role: string;
  isActive: boolean;
  phone?: string;
  securityScore?: number;
}

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get("/Users");
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/Users/${id}`);
    return response.data;
  },

  create: async (data: Partial<User>) => {
    const response = await api.post("/Users", data);
    return response.data;
  },

  update: async (id: number, data: Partial<User>) => {
    const response = await api.put(`/Users/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/Users/${id}`);
    return response.data;
  },

  changePassword: async (id: number, data: any) => {
    const response = await api.post(`/Users/${id}/change-password`, data);
    return response.data;
  }
};
