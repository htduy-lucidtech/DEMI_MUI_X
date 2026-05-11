import api from "@/lib/api";

export const dashboardService = {
  getStats: async () => {
    // TỐI ƯU: Backend tự nhận diện User qua Token
    const response = await api.get("/Dashboard/stats");
    return response.data;
  },

  getAnalytics: async (params?: { range?: string, fromDate?: string, toDate?: string, referenceDate?: string }) => {
    const response = await api.get("/Dashboard/analytics", { params });
    return response.data;
  },

  testNotification: async () => {
    const response = await api.get("/Dashboard/test-notification");
    return response.data;
  }
};
