import React from "react";
import UsersClient from "./UsersClient";
import { fetchServer } from "@/lib/api";

export default async function UsersPage() {
  let initialUsers = [];
  try {
    initialUsers = await fetchServer("/Users");
  } catch (error) {
    console.error("Failed to fetch users on server:", error);
  }

  return <UsersClient initialUsers={initialUsers} />;
}
