"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from "@mui/material";
import { Check, Close } from "@mui/icons-material";
import api from "@/lib/api";
import useRealtimeRefresh from "@/hooks/useRealtime";
import { useTranslations } from "next-intl";

interface CorrectionsPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function CorrectionsPanel({ open, onClose }: CorrectionsPanelProps) {
  const t = useTranslations("Attendance");
  const [items, setItems] = useState<any[]>([]);

  const fetch = async () => {
    try {
      const res = await api.get("/Attendance/corrections");
      setItems(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  useRealtimeRefresh((d) => {
    if (d?.type && d.type.startsWith("attendance:correction")) {
      fetch();
    }
  }, ["short"]);

  const handleApprove = async (id: number, approve: boolean) => {
    try {
      await api.post(`/Attendance/correction/${id}/approve`, {
        approve,
        comment: approve ? "Approved" : "Rejected",
      });
      await fetch();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t("corrections.title")}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>{t("corrections.columns.id")}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t("corrections.columns.requester")}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t("corrections.columns.requestedCheckIn")}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t("corrections.columns.requestedCheckOut")}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t("corrections.columns.reason")}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t("corrections.columns.action")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell>{it.id}</TableCell>
                    <TableCell>{it.userId}</TableCell>
                    <TableCell>{it.requestedCheckIn}</TableCell>
                    <TableCell>{it.requestedCheckOut}</TableCell>
                    <TableCell>{it.reason}</TableCell>
                    <TableCell>
                      <IconButton
                        color="success"
                        onClick={() => handleApprove(it.id, true)}
                      >
                        <Check />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleApprove(it.id, false)}
                      >
                        <Close />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} variant="outlined">{t("dialog.cancel")}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
