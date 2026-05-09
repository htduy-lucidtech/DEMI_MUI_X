import api from "@/lib/api";

export interface AttendanceRecord {
  id?: number;
  userId: number;
  user?: any;
  fullName?: string;
  checkInTime: string;
  checkOutTime?: string;
  isLate: boolean;
  lateReason?: string;
  workedMinutes?: number;
  otMinutes?: number;
  note?: string;
}

export interface TodayStatus {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  isLate: boolean;
  lateReason?: string;
  workedMinutes?: number;
  otMinutes?: number;
  regulations: {
    checkIn: string;
    checkOut: string;
  };
}

export interface SystemSetting {
  id?: number;
  key: string;
  value: string;
  category: string;
  description?: string;
}

export const attendanceService = {
  getAll: async (): Promise<AttendanceRecord[]> => {
    const response = await api.get("/Attendance");
    return response.data;
  },

  getTodayStatus: async (): Promise<TodayStatus> => {
    // TỐI ƯU: Không cần userId trên URL, backend lấy từ Token
    const response = await api.get("/Attendance/today-status");
    return response.data;
  },

  checkIn: async (lateReason?: string) => {
    // TỐI ƯU: Backend tự lấy userId từ Token
    const response = await api.post("/Attendance/checkin", { lateReason });
    return response.data;
  },

  checkOut: async () => {
    // TỐI ƯU: Backend tự lấy userId từ Token
    const response = await api.post("/Attendance/checkout");
    return response.data;
  },

  update: async (id: number, data: Partial<AttendanceRecord>) => {
    const response = await api.put(`/Attendance/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/Attendance/${id}`);
    return response.data;
  },

  bulkDelete: async (ids: number[]) => {
    const response = await api.post("/Attendance/bulk-delete", ids);
    return response.data;
  },

  getRegulations: async (): Promise<SystemSetting[]> => {
    const response = await api.get("/Attendance/regulations");
    return response.data;
  },

  updateRegulations: async (settings: SystemSetting[]) => {
    const response = await api.post("/Attendance/regulations", settings);
    return response.data;
  }
};
