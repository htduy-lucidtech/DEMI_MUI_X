import React from "react";
import LeaveRequestsClient from "./LeaveRequestsClient";
import { fetchServer } from "@/lib/api";

export default async function LeaveRequestsPage() {
  let initialData = [];
  try {
    // Attempt to fetch all requests on server
    // Note: If user is Employee, backend might filter or return error. 
    // Handled gracefully via try-catch.
    initialData = await fetchServer("/LeaveRequests");
  } catch (error) {
    console.error("Failed to fetch initial leave requests on server:", error);
  }

  return <LeaveRequestsClient initialData={initialData} />;
}
