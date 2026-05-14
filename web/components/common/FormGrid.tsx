"use client";

import React from "react";
import { Box, BoxProps } from "@mui/material";

interface FormGridProps extends BoxProps {
  children: React.ReactNode;
  columns?: any;
  gap?: any;
}

export default function FormGrid({ children, sx, columns, gap, ...props }: FormGridProps) {
  return (
    <Box
      component="div"
      sx={{
        display: "grid",
        gridTemplateColumns: columns || { xs: "1fr", sm: "repeat(2, 1fr)" },
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
