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
import { useTranslations } from "next-intl";

interface EmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Employee>) => Promise<void>;
  employee?: Employee | null;
  title: string;
}

export default function EmployeeDialog({ open, onClose, onSave, employee, title }: EmployeeDialogProps) {
  const t = useTranslations("Personnel");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState<Partial<Employee>>({
    fullName: "",
    email: "",
    phoneNumber: "",
    position: "",
    departmentId: undefined,
    baseSalary: 0,
    allowance: 0,
    hourlyRate: 0,
    hourlyRateOT: 0,
    gender: "Male",
    address: "",
    identityCardNumber: "",
    bankAccountNumber: "",
    bankName: "",
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
          hourlyRate: 0,
          hourlyRateOT: 0,
          gender: "Male",
          address: "",
          identityCardNumber: "",
          bankAccountNumber: "",
          bankName: "",
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
    setFormData((prev: Partial<Employee>) => ({
      ...prev,
      [name]: ["baseSalary", "allowance", "hourlyRate", "hourlyRateOT", "departmentId"].includes(name)
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
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>{t("dialog.sections.basic")}</Typography>
          </Box>
          
          <TextField
            fullWidth
            label={t("details.fields.fullName")}
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          
          <TextField
            fullWidth
            label={t("table.columns.email")}
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <TextField
            fullWidth
            label={t("details.fields.phone")}
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
          
          <TextField
            fullWidth
            select
            label={t("details.fields.gender")}
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <MenuItem value="Male">{t("details.genders.male")}</MenuItem>
            <MenuItem value="Female">{t("details.genders.female")}</MenuItem>
            <MenuItem value="Other">{t("details.genders.other")}</MenuItem>
          </TextField>

          <Box sx={{ gridColumn: '1 / -1' }}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>{t("dialog.sections.work_salary")}</Typography>
          </Box>
          
          <TextField
            fullWidth
            label={t("details.fields.position")}
            name="position"
            value={formData.position}
            onChange={handleChange}
          />
          
          <TextField
            fullWidth
            select
            label={t("details.fields.department")}
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
            label={t("details.fields.baseSalary")}
            name="baseSalary"
            value={formData.baseSalary}
            onChange={handleChange}
          />
          
          <TextField
            fullWidth
            type="number"
            label={t("details.fields.allowance")}
            name="allowance"
            value={formData.allowance}
            onChange={handleChange}
          />
          
          <TextField
            fullWidth
            type="number"
            label={t("details.fields.hourlyRate")}
            name="hourlyRate"
            value={formData.hourlyRate}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            type="number"
            label={t("details.fields.hourlyRateOT")}
            name="hourlyRateOT"
            value={formData.hourlyRateOT}
            onChange={handleChange}
          />

          <Box sx={{ gridColumn: '1 / -1' }}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>{t("dialog.sections.other")}</Typography>
          </Box>
          
          <Box sx={{ gridColumn: '1 / -1' }}>
            <TextField
              fullWidth
              label={t("details.fields.address")}
              name="address"
              value={formData.address}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </Box>
          
          <TextField
            fullWidth
            label={t("details.fields.identityCard")}
            name="identityCardNumber"
            value={formData.identityCardNumber}
            onChange={handleChange}
          />
          
          <TextField
            fullWidth
            label={t("details.fields.bankName")}
            name="bankName"
            value={formData.bankName || ""}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            label={t("details.fields.bankAccount")}
            name="bankAccountNumber"
            value={formData.bankAccountNumber || ""}
            onChange={handleChange}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={onClose} variant="outlined">{t("dialog.cancel")}</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">{t("dialog.save")}</Button>
      </DialogActions>
    </Dialog>
  );
}
