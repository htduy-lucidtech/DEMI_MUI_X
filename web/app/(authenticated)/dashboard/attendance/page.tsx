import React from "react";
import AttendanceClient from "./AttendanceClient";
import { fetchServer } from "@/lib/api";

export default async function AttendancePage() {
  let initialHistory = [];
  try {
    // Initial fetch on server for history
    initialHistory = await fetchServer("/Attendance");
  } catch (error) {
    console.error("Failed to fetch attendance history on server:", error);
  }

  return <AttendanceClient initialHistory={initialHistory} initialStatus={null} />;
}
