import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: true,
    host: true,
    proxy: { '/api': process.env.API_URL || 'http://localhost:8787' },
  },
  build: { outDir: 'dist', emptyOutDir: true },
});
