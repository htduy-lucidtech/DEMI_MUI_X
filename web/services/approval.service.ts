import api from "@/lib/api";

export enum ApprovalStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Cancelled = 3
}

export interface ApprovalRequest {
  id: number;
  requestType: string;
  entityName: string;
  description: string;
  status: ApprovalStatus;
  createdAt: string;
  requesterName: string;
  dataJson: string;
}

export const approvalService = {
  getPending: async () => {
    const response = await api.get<ApprovalRequest[]>("/Approvals");
    return response.data;
  },
  
  approve: async (id: number, note: string) => {
    await api.post(`/Approvals/${id}/approve`, note);
  },
  
  reject: async (id: number, note: string) => {
    await api.post(`/Approvals/${id}/reject`, note);
  }
};
