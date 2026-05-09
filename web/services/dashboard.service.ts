import api from "@/lib/api";

export const dashboardService = {
  getStats: async (userId?: number) => {
    const url = userId ? `/Dashboard/stats?userId=${userId}` : "/Dashboard/stats";
    const response = await api.get(url);
    return response.data;
  },

  testNotification: async () => {
    const response = await api.get("/Dashboard/test-notification");
    return response.data;
  }
};
