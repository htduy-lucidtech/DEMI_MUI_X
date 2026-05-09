import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material",
      "@mui/x-data-grid",
      "@mui/x-date-pickers",
      "@mui/x-charts",
      "lucide-react",
    ],
  },
};


export default withNextIntl(nextConfig);
