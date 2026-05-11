"use client";

import React from "react";
import { useAuth } from "@/app/context/AuthContext";

interface HasPermissionProps {
  permission?: string;
  permissions?: string[];
  role?: string;
  roles?: string[];
  operator?: "AND" | "OR";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component to conditionally render content based on user permissions or roles.
 */
export default function HasPermission({
  permission,
  permissions,
  role,
  roles,
  operator = "OR",
  children,
  fallback = null,
}: HasPermissionProps) {
  const { hasPermission, activeRole } = useAuth();

  let isAuthorized = false;

  // Check roles first (Admin usually has all access)
  if (activeRole === "Admin") {
    isAuthorized = true;
  } else {
    // Check specific roles
    if (role && activeRole === role) {
      isAuthorized = true;
    }
    if (roles && roles.includes(activeRole || "")) {
      isAuthorized = true;
    }

    // Check permissions if not already authorized by role
    if (!isAuthorized) {
      if (permission) {
        isAuthorized = hasPermission(permission);
      }

      if (permissions && permissions.length > 0) {
        if (operator === "OR") {
          isAuthorized = permissions.some((p) => hasPermission(p));
        } else {
          isAuthorized = permissions.every((p) => hasPermission(p));
        }
      }
    }
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
