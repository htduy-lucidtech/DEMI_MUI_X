import api from "@/lib/api";

export interface Department {
  id?: number;
  name: string;
  description?: string;
}

export const departmentsService = {
  getAll: async (): Promise<Department[]> => {
    const response = await api.get("/Departments");
    return response.data;
  },
  create: async (dept: Department) => {
    const response = await api.post("/Departments", dept);
    return response.data;
  },
  update: async (id: number, dept: Department) => {
    await api.put(`/Departments/${id}`, dept);
  },
  delete: async (id: number) => {
    await api.delete(`/Departments/${id}`);
  }
};
