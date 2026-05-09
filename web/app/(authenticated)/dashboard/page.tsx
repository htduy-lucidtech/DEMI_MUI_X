import React from "react";
import DashboardClient from "./DashboardClient";
import { fetchServer } from "@/lib/api";

export default async function DashboardPage() {
  let statsData = null;
  try {
    // Initial fetch on server for faster render
    statsData = await fetchServer("/Dashboard/stats");
  } catch (error) {
    console.error("Failed to fetch initial dashboard stats on server:", error);
    // Continue rendering, the client will try to fetch again
  }

  return <DashboardClient initialData={statsData} />;
}
