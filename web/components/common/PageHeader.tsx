"use client";

import React from "react";
import { Box, Typography, Stack, TextField, InputAdornment } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  actions,
}: PageHeaderProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
        bgcolor: "white",
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap" }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {onSearchChange && (
          <TextField
            placeholder={searchPlaceholder || "Tìm kiếm..."}
            size="small"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "text.disabled", fontSize: 18 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: { xs: "100%", md: 400 } }}
          />
        )}
      </Stack>

      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
        {actions}
      </Stack>
    </Box>
  );
}
