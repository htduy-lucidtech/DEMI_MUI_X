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
    getUserNotifications: async (userId: number): Promise<Notification[]> => {
        const response = await api.get(`/Notifications/user/${userId}`);
        return response.data;
    },

    markAsRead: async (id: number): Promise<void> => {
        await api.put(`/Notifications/${id}/read`);
    },

    markAllAsRead: async (userId: number): Promise<void> => {
        await api.put(`/Notifications/user/${userId}/read-all`);
    }
};
