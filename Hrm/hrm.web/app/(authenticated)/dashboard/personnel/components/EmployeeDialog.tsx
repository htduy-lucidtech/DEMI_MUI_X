"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import { Employee } from "@/services/employee.service";
import { departmentsService, Department } from "@/services/departments.service";

interface EmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Employee>) => Promise<void>;
  employee?: Employee | null;
  title: string;
}

export default function EmployeeDialog({ open, onClose, onSave, employee, title }: EmployeeDialogProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState<Partial<Employee>>({
    fullName: "",
    email: "",
    phoneNumber: "",
    position: "",
    departmentId: undefined,
    baseSalary: 0,
    allowance: 0,
    gender: "Male",
    address: "",
    identityCardNumber: "",
  });

  useEffect(() => {
    if (open) {
      fetchDepartments();
      if (employee) {
        setFormData({ ...employee });
      } else {
        setFormData({
          fullName: "",
          email: "",
          phoneNumber: "",
          position: "",
          departmentId: undefined,
          baseSalary: 0,
          allowance: 0,
          gender: "Male",
          address: "",
          identityCardNumber: "",
        });
      }
    }
  }, [open, employee]);

  const fetchDepartments = async () => {
    try {
      const data = await departmentsService.getAll();
      setDepartments(data);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "baseSalary" || name === "allowance" || name === "departmentId" 
        ? Number(value) 
        : value,
    }));
  };

  const handleSubmit = async () => {
    await onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
          gap: 3, 
          mt: 1 
        }}>
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Thông tin cơ bản</Typography>
          </Box>
          
          <TextField
            fullWidth
            label="Họ và Tên"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <TextField
            fullWidth
            label="Số điện thoại"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
          
          <TextField
            fullWidth
            select
            label="Giới tính"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <MenuItem value="Male">Nam</MenuItem>
            <MenuItem value="Female">Nữ</MenuItem>
            <MenuItem value="Other">Khác</MenuItem>
          </TextField>

          <Box sx={{ gridColumn: '1 / -1' }}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Công việc & Lương</Typography>
          </Box>
          
          <TextField
            fullWidth
            label="Chức vụ"
            name="position"
            value={formData.position}
            onChange={handleChange}
          />
          
          <TextField
            fullWidth
            select
            label="Phòng ban"
            name="departmentId"
            value={formData.departmentId || ""}
            onChange={handleChange}
          >
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>
                {dept.name}
              </MenuItem>
            ))}
          </TextField>
          
          <TextField
            fullWidth
            type="number"
            label="Lương cơ bản"
            name="baseSalary"
            value={formData.baseSalary}
            onChange={handleChange}
          />
          
          <TextField
            fullWidth
            type="number"
            label="Phụ cấp"
            name="allowance"
            value={formData.allowance}
            onChange={handleChange}
          />

          <Box sx={{ gridColumn: '1 / -1' }}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Khác</Typography>
          </Box>
          
          <Box sx={{ gridColumn: '1 / -1' }}>
            <TextField
              fullWidth
              label="Địa chỉ"
              name="address"
              value={formData.address}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </Box>
          
          <TextField
            fullWidth
            label="Số CMND/CCCD"
            name="identityCardNumber"
            value={formData.identityCardNumber}
            onChange={handleChange}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={onClose} variant="outlined">Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">Lưu</Button>
      </DialogActions>
    </Dialog>
  );
}
