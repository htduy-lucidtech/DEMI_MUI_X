import api from "@/lib/api";

export interface LeaveRequest {
  id?: number;
  userId: number;
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
  }
};
