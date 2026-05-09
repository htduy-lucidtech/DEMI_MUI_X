import React from "react";
import PayrollClient from "./PayrollClient";
import { fetchServer } from "@/lib/api";

export default async function PayrollPage() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  let initialData = [];
  try {
    // Fetch current month payroll on server
    initialData = await fetchServer(`/Payroll/calculate/${month}/${year}`);
  } catch (error) {
    console.error("Failed to fetch initial payroll on server:", error);
  }

  return (
    <PayrollClient 
      initialData={initialData} 
      currentMonth={month} 
      currentYear={year} 
    />
  );
}
