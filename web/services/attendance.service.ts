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
  note?: string;
}

export interface TodayStatus {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  isLate: boolean;
  lateReason?: string;
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

  getTodayStatus: async (userId: number): Promise<TodayStatus> => {
    const response = await api.get(`/Attendance/today-status/${userId}`);
    return response.data;
  },

  checkIn: async (userId: number, lateReason?: string) => {
    const response = await api.post("/Attendance/check-in", { userId, lateReason });
    return response.data;
  },

  checkOut: async (userId: number) => {
    const response = await api.post("/Attendance/check-out", userId);
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
