/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

const testsDir = path.resolve(__dirname, './').replace(/\\/g, '/');
const projectRoot = path.resolve(testsDir, '..').replace(/\\/g, '/');
const webRoot = projectRoot + '/web';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [testsDir + '/vitest.setup.ts'],
    include: [testsDir + '/web/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
  server: {
    fs: {
      allow: [projectRoot],
    },
  },
  resolve: {
    alias: {
      '@': webRoot,
      'react': webRoot + '/node_modules/react',
      'react-dom': webRoot + '/node_modules/react-dom',
      '@testing-library/react': webRoot + '/node_modules/@testing-library/react',
      '@testing-library/jest-dom': webRoot + '/node_modules/@testing-library/jest-dom',
      'vitest': webRoot + '/node_modules/vitest',
    },
  },
});
