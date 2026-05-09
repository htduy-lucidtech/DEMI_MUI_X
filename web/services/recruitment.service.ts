import api from "@/lib/api";

export interface JobPosting {
  id?: number;
  title: string;
  description: string;
  department: string;
  location: string;
  minSalary: number;
  maxSalary: number;
  status: string;
  expiryDate: string;
  createdAt?: string;
  candidates?: Candidate[];
}

export interface Candidate {
  id?: number;
  fullName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  status: string;
  jobPostingId: number;
  jobPosting?: JobPosting;
  appliedAt?: string;
}

export const recruitmentService = {
  getJobs: async (): Promise<JobPosting[]> => {
    const response = await api.get("/Recruitment/jobs");
    return response.data;
  },

  createJob: async (data: JobPosting) => {
    const response = await api.post("/Recruitment/jobs", data);
    return response.data;
  },

  updateJob: async (id: number, data: Partial<JobPosting>) => {
    const response = await api.put(`/Recruitment/jobs/${id}`, data);
    return response.data;
  },

  deleteJob: async (id: number) => {
    const response = await api.delete(`/Recruitment/jobs/${id}`);
    return response.data;
  },

  getCandidates: async (): Promise<Candidate[]> => {
    const response = await api.get("/Recruitment/candidates");
    return response.data;
  },

  createCandidate: async (data: Candidate) => {
    const response = await api.post("/Recruitment/candidates", data);
    return response.data;
  },

  updateCandidate: async (id: number, data: Partial<Candidate>) => {
    const response = await api.put(`/Recruitment/candidates/${id}`, data);
    return response.data;
  },

  deleteCandidate: async (id: number) => {
    const response = await api.delete(`/Recruitment/candidates/${id}`);
    return response.data;
  },

  updateCandidateStatus: async (id: number, status: string) => {
    const response = await api.patch(`/Recruitment/candidates/${id}/status`, `"${status}"`, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  }
};
