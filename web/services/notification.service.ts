import api from "@/lib/api";

export interface Notification {
    id: number;
    userId: number;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    type: string;
}

export const notificationService = {
    getAll: async (): Promise<Notification[]> => {
        const response = await api.get("/Notifications");
        return response.data;
    },

    getUserNotifications: async (userId: number): Promise<Notification[]> => {
        const response = await api.get(`/Notifications/user/${userId}`);
        return response.data;
    },

    create: async (data: Partial<Notification>) => {
        const response = await api.post("/Notifications", data);
        return response.data;
    },

    update: async (id: number, data: Partial<Notification>) => {
        const response = await api.put(`/Notifications/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/Notifications/${id}`);
        return response.data;
    },

    markAsRead: async (id: number): Promise<void> => {
        await api.put(`/Notifications/${id}/read`);
    },

    markAllAsRead: async (userId: number): Promise<void> => {
        await api.put(`/Notifications/user/${userId}/read-all`);
    }
};
