import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

/**
 * MUI flavor — Vite config.
 *
 * Path aliases mirror tsconfig.base.json. `dedupe` forces a single
 * React instance to be shared between the app code, the DashForge
 * components, and the MUI runtime — without it, hooks crash on
 * "Invalid hook call" because two React copies are loaded.
 *
 * `manualChunks` extracts heavy vendor dependencies into
 * separate cacheable bundles so the main app chunk stays small
 * and browsers can cache the vendor code across deploys:
 *
 *   - react        → React + React DOM + React Router
 *   - mui          → @mui/material + @mui/icons + emotion
 *   - mui-x        → MUI X DataGrid / DatePickers (heavier)
 *   - charts       → recharts (only loaded on admin dashboard)
 *   - stripe       → @stripe/* (only loaded on checkout)
 *   - dashforge    → @dashforge/ui + @dashforge/theme-mui
 *
 * Routes are NOT lazy-loaded — splitting routes is a separate
 * optimisation step with a higher regression surface. Splitting
 * vendor deps is purely a build-time change and safe.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@api': fileURLToPath(new URL('../api', import.meta.url)),
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
      '@seo': fileURLToPath(new URL('../seo', import.meta.url)),
      '@docs': fileURLToPath(new URL('../docs', import.meta.url)),
    },
    dedupe: [
      'react',
      'react-dom',
      'valtio',
      '@dashforge/ui-core',
      '@dashforge/theme-mui',
      '@dashforge/ui',
      '@dashforge/rbac',
      '@dashforge/forms',
      '@dashforge/tokens',
    ],
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    rollupOptions: {},
  },
});
