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

  getCandidates: async (): Promise<Candidate[]> => {
    const response = await api.get("/Recruitment/candidates");
    return response.data;
  },

  updateCandidateStatus: async (id: number, status: string) => {
    const response = await api.patch(`/Recruitment/candidates/${id}/status`, `"${status}"`, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  }
};
