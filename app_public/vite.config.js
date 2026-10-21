import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Во развој (npm run dev) барањата кон /api одат до Express серверот на порта 3000
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:3000' },
  },
});
