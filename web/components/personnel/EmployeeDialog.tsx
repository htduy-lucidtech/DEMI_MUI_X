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
    socialInsuranceNumber: "",
    dateOfBirth: "",
  });

  useEffect(() => {
    if (open) {
      fetchDepartments();
      if (employee) {
        setFormData({ 
          ...employee,
          dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString('en-CA') : ""
        });
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
          socialInsuranceNumber: "",
          dateOfBirth: "",
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
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      slotProps={{
        paper: { sx: { borderRadius: 3 } }
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, p: 3, pb: 2, borderBottom: '1px solid #e2e8f0' }}>{title}</DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
          gap: 2.5, 
          mt: 1 
        }}>
          <Box sx={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Box sx={{ width: 4, height: 16, bgcolor: 'primary.main', borderRadius: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>{t("dialog.sections.basic")}</Typography>
          </Box>
          
          <TextField
            fullWidth
            size="small"
            label={t("details.fields.fullName")}
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          
          <TextField
            fullWidth
            size="small"
            label={t("table.columns.email")}
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <TextField
            fullWidth
            size="small"
            label={t("details.fields.phone")}
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
          
          <TextField
            fullWidth
            size="small"
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

          <TextField
            fullWidth
            size="small"
            type="date"
            label={t("details.fields.dob")}
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Box sx={{ gridColumn: '1 / -1', mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Box sx={{ width: 4, height: 16, bgcolor: 'primary.main', borderRadius: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>{t("dialog.sections.work_salary")}</Typography>
            </Box>
          </Box>
          
          <TextField
            fullWidth
            size="small"
            label={t("details.fields.position")}
            name="position"
            value={formData.position}
            onChange={handleChange}
          />
          
          <TextField
            fullWidth
            size="small"
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
            size="small"
            type="number"
            label={t("details.fields.baseSalary")}
            name="baseSalary"
            value={formData.baseSalary}
            onChange={handleChange}
          />
          
          <TextField
            fullWidth
            size="small"
            type="number"
            label={t("details.fields.allowance")}
            name="allowance"
            value={formData.allowance}
            onChange={handleChange}
          />
          
          <TextField
            fullWidth
            size="small"
            type="number"
            label={t("details.fields.hourlyRate")}
            name="hourlyRate"
            value={formData.hourlyRate}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            size="small"
            type="number"
            label={t("details.fields.hourlyRateOT")}
            name="hourlyRateOT"
            value={formData.hourlyRateOT}
            onChange={handleChange}
          />

          <Box sx={{ gridColumn: '1 / -1', mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Box sx={{ width: 4, height: 16, bgcolor: 'primary.main', borderRadius: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>{t("dialog.sections.other")}</Typography>
            </Box>
          </Box>
          
          <Box sx={{ gridColumn: '1 / -1' }}>
            <TextField
              fullWidth
              size="small"
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
            size="small"
            label={t("details.fields.identityCard")}
            name="identityCardNumber"
            value={formData.identityCardNumber}
            onChange={handleChange}
          />
          
          <TextField
            fullWidth
            size="small"
            label={t("details.fields.bankName")}
            name="bankName"
            value={formData.bankName || ""}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            size="small"
            label={t("details.fields.bankAccount")}
            name="bankAccountNumber"
            value={formData.bankAccountNumber || ""}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            size="small"
            label={t("details.fields.insuranceNumber")}
            name="socialInsuranceNumber"
            value={formData.socialInsuranceNumber || ""}
            onChange={handleChange}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined" sx={{ fontWeight: 700 }}>{t("dialog.cancel")}</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ px: 4, fontWeight: 700 }}>{t("dialog.save")}</Button>
      </DialogActions>
    </Dialog>
  );
}
