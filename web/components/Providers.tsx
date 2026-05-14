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
    borderRadius: 3, // Giảm xuống 3 để giao diện sắc nét và chuyên nghiệp hơn
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
          borderRadius: 3, // Đồng bộ với theme mới
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 3, // Đồng bộ với theme mới
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "16px",
          "&:last-child": { paddingBottom: "16px" },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        size: "small",
      },
      styleOverrides: {
        root: {
          boxShadow: "none",
          borderRadius: 2, // Giảm xuống 2px theo yêu cầu sắc nét
          "&:hover": { boxShadow: "none" },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
        variant: "outlined",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 2, // Đồng bộ 2px cho input
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        size: "small",
      },
    },
    MuiFormControl: {
      defaultProps: {
        size: "small",
      },
    },
    MuiTable: {
      defaultProps: {
        size: "small",
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: "0.8125rem",
          padding: "8px 12px", // Giảm padding để tăng mật độ thông tin
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
    MuiIconButton: {
      defaultProps: {
        size: "small",
      },
    },
    MuiList: {
      defaultProps: {
        dense: true,
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: "0.8125rem",
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
