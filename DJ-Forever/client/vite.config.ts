import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/bundle-visualizer.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/graphql': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
            '@apollo/client',
            '@mui/material',
            '@emotion/react',
            '@emotion/styled',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Raise warning limit to 1000kb
  },
});
