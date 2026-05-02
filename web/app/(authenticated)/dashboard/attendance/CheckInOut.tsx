"use client";

import React, { useState } from "react";
import { Button, Stack, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import { Login as LoginIcon, Logout as LogoutIcon } from "@mui/icons-material";
import { attendanceService } from "@/services/attendance.service";
import { useAuth } from "@/app/context/AuthContext";

export default function CheckInOut({
  status,
  onRefresh,
}: {
  status: any;
  onRefresh: () => Promise<void>;
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const t = useTranslations("Attendance");

  const performCheckIn = async (lateReason?: string) => {
    setLoading(true);
    try {
      await attendanceService.checkIn(user?.id || 0, lateReason);
      await onRefresh();
    } catch (e) {
      console.error(e);
      alert(t("messages.error") || "Lỗi khi chấm công vào");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = () => {
    // simple prompt for late reason if needed
    if (status) {
      const [h, m] = status.regulations.checkIn.split(":").map(Number);
      const standard = new Date();
      standard.setHours(h, m, 0, 0);
      const now = new Date();
      if (now > standard) {
        const reason = prompt(
          t("late.prompt") || "Bạn đi muộn. Lý do (tùy chọn):",
          "",
        );
        performCheckIn(reason || undefined);
        return;
      }
    }
    performCheckIn();
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      await attendanceService.checkOut(user?.id || 0);
      await onRefresh();
    } catch (e) {
      console.error(e);
      alert(t("messages.error") || "Lỗi khi chấm công ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BoxContainer
      status={status}
      loading={loading}
      onCheckIn={handleCheckIn}
      onCheckOut={handleCheckOut}
      t={t}
    />
  );
}

function BoxContainer({ status, loading, onCheckIn, onCheckOut, t }: any) {
  return (
    <div style={{ marginTop: 8 }}>
      {status && !status.hasCheckedIn ? (
        <Button
          variant="contained"
          color="inherit"
          size="medium"
          startIcon={<LoginIcon />}
          onClick={onCheckIn}
          sx={{
            color: "primary.main",
            fontWeight: 700,
            borderRadius: 8,
            width: "100%",
          }}
        >
          {t("checkIn")}
        </Button>
      ) : status && !status.hasCheckedOut ? (
        <Stack spacing={1}>
          <Typography variant="caption">{t("status.workingTime")}</Typography>
          <Button
            variant="contained"
            color="secondary"
            size="medium"
            startIcon={<LogoutIcon />}
            onClick={onCheckOut}
            disabled={loading}
            sx={{ fontWeight: 700, borderRadius: 8, width: "100%" }}
          >
            {loading ? "..." : t("checkOut")}
          </Button>
        </Stack>
      ) : (
        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            padding: 12,
            borderRadius: 8,
          }}
        >
          <Typography variant="subtitle2" style={{ fontWeight: 700 }}>
            {t("status.checkedOut")}
          </Typography>
        </div>
      )}
    </div>
  );
}
