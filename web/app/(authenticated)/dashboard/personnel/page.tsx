import React from "react";
import PersonnelClient from "./PersonnelClient";
import { fetchServer } from "@/lib/api";

export default async function PersonnelPage() {
  let employees = [];
  try {
    employees = await fetchServer("/Employees");
  } catch (error) {
    console.error("Failed to fetch initial employees on server:", error);
  }

  return <PersonnelClient initialData={employees} />;
}
