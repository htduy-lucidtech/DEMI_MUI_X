import api from "@/lib/api";

export const dashboardService = {
  getStats: async () => {
    const response = await api.get("/Dashboard/stats");
    return response.data;
  },
  
  testNotification: async () => {
    const response = await api.get("/Dashboard/test-notification");
    return response.data;
  }
};
