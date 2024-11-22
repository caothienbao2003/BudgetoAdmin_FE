import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7013',
        changeOrigin: true,
        secure: false, // Disable SSL verification for local development
      },
    },
  },
});