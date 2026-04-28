import api from "@/lib/api";

export interface SystemSetting {
    id: number;
    key: string;
    value: string;
    description: string;
    category: string;
}

export const settingsService = {
    getAll: async (): Promise<SystemSetting[]> => {
        const response = await api.get('/Settings');
        return response.data;
    },

    update: async (id: number, data: SystemSetting): Promise<void> => {
        await api.put(`/Settings/${id}`, data);
    }
};
