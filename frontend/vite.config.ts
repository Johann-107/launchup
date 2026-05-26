import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  preview: {
    allowedHosts: ['launchup.onrender.com']
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      // Proxy API requests to backend during local development
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
