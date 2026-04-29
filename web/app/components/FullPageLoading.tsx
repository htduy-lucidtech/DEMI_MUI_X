"use client";

import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

interface LoadingProps {
  message?: string;
}

export default function FullPageLoading({ message = "Đang tải dữ liệu..." }: LoadingProps) {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
      }}
    >
      <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
      <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
        {message}
      </Typography>
    </Box>
  );
}
