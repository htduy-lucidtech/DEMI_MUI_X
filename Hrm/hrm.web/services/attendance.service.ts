import api from "@/lib/api";

export interface AttendanceRecord {
  id?: number;
  userId: number;
  user?: any;
  checkInTime: string;
  checkOutTime?: string;
  note?: string;
}

export interface TodayStatus {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  checkInTime?: string;
  checkOutTime?: string;
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

  checkIn: async (userId: number) => {
    const response = await api.post("/Attendance/check-in", userId);
    return response.data;
  },

  checkOut: async (userId: number) => {
    const response = await api.post("/Attendance/check-out", userId);
    return response.data;
  }
};
