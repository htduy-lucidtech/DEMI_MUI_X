"use client";

import { AuthProvider } from "@/app/context/AuthContext";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4361ee", // Xanh công nghệ (Soft Tech Blue) - Dịu và hiện đại hơn
      light: "#f0f3ff",
      dark: "#3730a3",
    },
    secondary: {
      main: "#4cc9f0", // Xanh ngọc bổ trợ
    },
    background: {
      default: "#f8fafc", // Màu nền sương mù nhẹ (Slate nhạt)
      paper: "#ffffff",
    },
    text: {
      primary: "#1e293b", // Slate đậm - dịu hơn đen thuần
      secondary: "#64748b",
    },
  },
  shape: {
    borderRadius: 8, // Giảm từ 12 xuống 8 theo mẫu
  },
  typography: {
    fontFamily: "Inter, Roboto, sans-serif",
    h4: { fontSize: "1.375rem", fontWeight: 600, letterSpacing: "-0.02em" }, // ~22px
    h5: { fontSize: "1.125rem", fontWeight: 600 },
    h6: { fontSize: "1rem", fontWeight: 600 },
    body1: { fontSize: "0.875rem" }, // 14px
    body2: { fontSize: "0.8125rem" }, // 13px
    button: { textTransform: "none", fontWeight: 600, fontSize: "0.875rem" },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
          border: "1px solid #e2e8f0",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          borderRadius: 6, // Nút bo ít hơn theo mẫu
          "&:hover": { boxShadow: "none" },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: "0.8125rem", // 13px cho nội dung bảng
          padding: "12px 16px",
        },
        head: {
          fontWeight: 700,
          backgroundColor: "#f8fafc",
          color: "#64748b",
          textTransform: "uppercase",
          fontSize: "0.75rem",
          letterSpacing: "0.05em",
        },
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
