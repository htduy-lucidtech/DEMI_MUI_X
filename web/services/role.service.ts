import api from "@/lib/api";

export interface Role {
  id: number;
  name: string;
  description: string;
  permissionCount?: number;
  permissions?: string[];
}

export interface Permission {
  id: number;
  code: string;
  name: string;
  module: string;
}

export const roleService = {
  getRoles: async () => {
    const response = await api.get<Role[]>("/Roles");
    return response.data;
  },

  getRole: async (id: number) => {
    const response = await api.get<Role>(`/Roles/${id}`);
    return response.data;
  },

  getPermissions: async () => {
    const response = await api.get<Permission[]>("/Roles/permissions");
    return response.data;
  },

  createRole: async (role: Omit<Role, 'id'>) => {
    const response = await api.post<Role>("/Roles", role);
    return response.data;
  },

  updateRole: async (id: number, role: Omit<Role, 'id'>) => {
    await api.put(`/Roles/${id}`, role);
  },

  deleteRole: async (id: number) => {
    await api.delete(`/Roles/${id}`);
  }
};
