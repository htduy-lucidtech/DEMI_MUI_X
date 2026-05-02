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

    create: async (data: Partial<SystemSetting>) => {
        const response = await api.post('/Settings', data);
        return response.data;
    },

    update: async (id: number, data: SystemSetting): Promise<void> => {
        await api.put(`/Settings/${id}`, data);
    },

    delete: async (id: number) => {
        const response = await api.delete(`/Settings/${id}`);
        return response.data;
    }
};
