import api from "@/lib/api";

export interface PerformanceReview {
    id: number;
    employeeId: number;
    employeeName: string;
    reviewerId: number;
    reviewerName: string;
    reviewDate: string;
    workQuality: number;
    teamwork: number;
    punctuality: number;
    totalScore: number;
    comments: string;
    goalsForNextPeriod: string;
    status: string;
}

export const performanceService = {
    getAll: async (): Promise<PerformanceReview[]> => {
        const response = await api.get('/PerformanceReviews');
        return response.data;
    },

    create: async (data: Partial<PerformanceReview>): Promise<PerformanceReview> => {
        const response = await api.post('/PerformanceReviews', data);
        return response.data;
    },

    update: async (id: number, data: Partial<PerformanceReview>) => {
        const response = await api.put(`/PerformanceReviews/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/PerformanceReviews/${id}`);
        return response.data;
    },
};
