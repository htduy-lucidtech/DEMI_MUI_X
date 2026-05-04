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
import useRealtimeRefresh from "@/lib/useRealtime";

export default function CorrectionsPanel() {
  const [open, setOpen] = useState(false);
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
      // open panel and refresh
      setOpen(true);
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
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Yêu cầu chỉnh sửa chấm công</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Người yêu cầu</TableCell>
                  <TableCell>Requested CheckIn</TableCell>
                  <TableCell>Requested CheckOut</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Action</TableCell>
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
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
