import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  transpilePackages: [
    "@mui/material", 
    "@mui/system", 
    "@mui/icons-material", 
    "@heroicons/react"
  ],
};

export default withNextIntl(nextConfig);
