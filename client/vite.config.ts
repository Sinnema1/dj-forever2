import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { imagetools } from "vite-imagetools";
import compression from "vite-plugin-compression";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    imagetools(),
    compression({
      algorithm: "gzip",
      ext: ".gz",
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Our Wedding Website",
        short_name: "Wedding",
        description: "Join us for our special day",
        theme_color: "#C9A66B",
        background_color: "#FAF6F0",
        display: "standalone",
        icons: [
          {
            src: "favicon.svg",
            sizes: "32x32",
            type: "image/svg+xml",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg}"],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024, // 8MB to handle large images
        runtimeCaching: [
          {
            urlPattern:
              /^https:\/\/dj-forever2-backend\.onrender\.com\/graphql$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "graphql-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 300, // 5 minutes
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 3002,
    proxy: {
      "/graphql": {
        target: "http://localhost:3005",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          apollo: ["@apollo/client"],
          ui: ["react-router-dom"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
