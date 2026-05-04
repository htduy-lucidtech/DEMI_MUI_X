import api from "@/lib/api";

export interface LeaveRequest {
  id?: number;
  userId: number;
  fullName?: string;
  user?: { fullName: string };
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  createdAt?: string;
  approvedBy?: string;
  comment?: string;
}

export const leaveService = {
  getAll: async (): Promise<LeaveRequest[]> => {
    const response = await api.get("/LeaveRequests");
    return response.data;
  },

  getByUserId: async (userId: number): Promise<LeaveRequest[]> => {
    const response = await api.get(`/LeaveRequests/user/${userId}`);
    return response.data;
  },

  create: async (data: LeaveRequest) => {
    const response = await api.post("/LeaveRequests", data);
    return response.data;
  },

  updateStatus: async (id: number, status: string, approvedBy: string, comment?: string) => {
    const response = await api.patch(`/LeaveRequests/${id}/status`, { status, approvedBy, comment });
    return response.data;
  },

  update: async (id: number, data: Partial<LeaveRequest>) => {
    const response = await api.put(`/LeaveRequests/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/LeaveRequests/${id}`);
    return response.data;
  },

  bulkDelete: async (ids: number[]) => {
    const response = await api.post("/LeaveRequests/bulk-delete", ids);
    return response.data;
  },
};
