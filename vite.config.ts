import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base path is set for GitHub Pages project sites (https://<user>.github.io/workout/).
// Override with VITE_BASE=/ when deploying to a root domain (Vercel, Netlify, custom domain).
export default defineConfig({
  base: process.env.VITE_BASE ?? '/workout/',
  plugins: [react()],
  build: { outDir: 'dist', sourcemap: false },
});
