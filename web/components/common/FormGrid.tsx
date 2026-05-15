"use client";

import React from "react";
import { Box, BoxProps } from "@mui/material";

interface FormGridProps extends BoxProps {
  children: React.ReactNode;
  columns?: any;
  gap?: any;
}

export default function FormGrid({ children, sx, columns, gap, ...props }: FormGridProps) {
  const getGridTemplate = (cols: any) => {
    if (!cols) return { xs: "1fr", sm: "repeat(2, 1fr)" };
    if (typeof cols === "number") return `repeat(${cols}, 1fr)`;
    if (typeof cols === "object") {
      const result: any = {};
      Object.entries(cols).forEach(([key, val]) => {
        result[key] = typeof val === "number" ? `repeat(${val}, 1fr)` : val;
      });
      return result;
    }
    return cols;
  };

  return (
    <Box
      component="div"
      sx={{
        display: "grid",
        gridTemplateColumns: getGridTemplate(columns),
        gap: gap !== undefined ? gap : 2.5,
        mt: 1,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
