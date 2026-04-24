"use client";
import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { useTranslations } from "next-intl";

export default function DepartmentsPage() {
  const t = useTranslations("Departments");
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
        {t("title")}
      </Typography>
      <Paper sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
        {t("description")}
      </Paper>
    </Box>
  );
}
