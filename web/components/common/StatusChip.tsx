"use client";

import React from "react";
import { Chip, ChipProps } from "@mui/material";

export type StatusType = "success" | "warning" | "error" | "info" | "default" | "pending" | "approved" | "rejected";

interface StatusChipProps extends Omit<ChipProps, "color"> {
  status: StatusType | string;
  label: string;
}

export default function StatusChip({ status, label, sx, ...props }: StatusChipProps) {
  const getStatusColor = (s: string): any => {
    switch (s.toLowerCase()) {
      case "success":
      case "approved":
      case "active":
        return {
          bgcolor: "#f0fdf4",
          color: "#166534",
          border: "1px solid #bbf7d0",
        };
      case "warning":
      case "pending":
        return {
          bgcolor: "#fffbeb",
          color: "#92400e",
          border: "1px solid #fef3c7",
        };
      case "error":
      case "rejected":
      case "inactive":
        return {
          bgcolor: "#fef2f2",
          color: "#991b1b",
          border: "1px solid #fee2e2",
        };
      case "info":
        return {
          bgcolor: "#eff6ff",
          color: "#1e40af",
          border: "1px solid #dbeafe",
        };
      default:
        return {
          bgcolor: "#f8fafc",
          color: "#475569",
          border: "1px solid #e2e8f0",
        };
    }
  };

  const statusStyles = getStatusColor(status);

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        fontWeight: 600,
        fontSize: "0.75rem",
        height: 24,
        ...statusStyles,
        ...sx,
      }}
      {...props}
    />
  );
}
