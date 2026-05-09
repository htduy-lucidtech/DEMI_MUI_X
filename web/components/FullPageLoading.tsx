"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { useTranslations } from "next-intl";

interface LoadingProps {
  message?: string;
}

export default function FullPageLoading({ message }: LoadingProps) {
  const t = useTranslations("Layout");
  const defaultSteps = [
    t("loadingSteps.compiling"),
    t("loadingSteps.building"),
    t("loadingSteps.almostReady")
  ];

  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [dots, setDots] = useState("");


  // Animate progress bar (fake progress that slows near 90%)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev + 0.2;
        if (prev >= 70) return prev + 0.8;
        return prev + 2.5;
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  // Cycle through step labels
  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % defaultSteps.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const label = message || defaultSteps[stepIndex];

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
        bgcolor: "rgba(255, 255, 255, 0.8)", // Làm nền hơi trong suốt để thấy lỗi bên dưới nếu có
        backdropFilter: "blur(4px)", // Tạo hiệu ứng mờ chuyên nghiệp
        zIndex: 1000, // Giảm zIndex để không đè lên các thông báo lỗi hệ thống quan trọng
      }}
    >
      {/* Top progress bar */}
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 10000 }}>
        <LinearProgress
          variant="determinate"
          value={Math.min(progress, 99)}
          sx={{
            height: 3,
            bgcolor: "transparent",
            "& .MuiLinearProgress-bar": {
              bgcolor: "primary.main",
              transition: "transform 0.12s linear",
            },
          }}
        />
      </Box>

      {/* Center content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2.5,
          px: 3,
        }}
      >
        {/* Logo mark */}
        <Box
          sx={{
            width: 48,
            height: 48,
            bgcolor: "primary.main",
            borderRadius: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 900,
            fontSize: "1.4rem",
            boxShadow: "0 8px 24px rgba(79,70,229,0.35)",
            animation: "pulse 1.8s ease-in-out infinite",
            "@keyframes pulse": {
              "0%, 100%": { transform: "scale(1)", opacity: 1 },
              "50%": { transform: "scale(1.06)", opacity: 0.85 },
            },
          }}
        >
          H
        </Box>

        {/* Status text */}
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              fontFamily: "'Courier New', monospace",
              letterSpacing: "0.04em",
              minWidth: 180,
              display: "inline-block",
            }}
          >
            {label}
            <span style={{ opacity: 0.6 }}>{dots}</span>
          </Typography>
        </Box>

        {/* Mini progress track */}
        <Box
          sx={{
            width: 160,
            height: 4,
            bgcolor: "divider",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: "100%",
              bgcolor: "primary.main",
              borderRadius: 4,
              width: `${Math.min(progress, 99)}%`,
              transition: "width 0.15s ease-out",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
