"use client";

import React from "react";
import { Box, Typography } from "@mui/material";

interface SectionHeaderProps {
  title: string;
  sx?: any;
}

export default function SectionHeader({ title, sx }: SectionHeaderProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, ...sx }}>
      <Box
        sx={{
          width: 4,
          height: 16,
          bgcolor: "primary.main",
          borderRadius: 1,
        }}
      />
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 800,
          color: "primary.main",
          textTransform: "uppercase",
          letterSpacing: "0.025em",
        }}
      >
        {title}
      </Typography>
    </Box>
  );
}
