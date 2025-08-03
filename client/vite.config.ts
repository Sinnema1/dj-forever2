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
      includeAssets: ["favicon.svg", "offline.html"],
      manifest: {
        name: "Dominique & Justin's Wedding",
        short_name: "DJ Wedding",
        description: "Join us for our special day - September 15, 2025",
        theme_color: "#C9A66B",
        background_color: "#FAF6F0",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        categories: ["lifestyle", "social"],
        icons: [
          {
            src: "favicon.svg",
            sizes: "32x32 64x64 128x128 256x256",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
        shortcuts: [
          {
            name: "RSVP",
            short_name: "RSVP",
            description: "Submit your wedding RSVP",
            url: "/rsvp",
            icons: [{ src: "favicon.svg", sizes: "96x96" }],
          },
          {
            name: "Gallery",
            short_name: "Photos",
            description: "View wedding photos",
            url: "/#gallery",
            icons: [{ src: "favicon.svg", sizes: "96x96" }],
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg}"],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB for high-res wedding photos
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern:
              /^https:\/\/dj-forever2-backend\.onrender\.com\/graphql$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "graphql-cache",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 600, // 10 minutes
              },
            },
          },
          {
            urlPattern: /\.(png|jpg|jpeg|svg|webp|gif)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "wedding-images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
              expiration: {
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 3600, // 1 hour
              },
            },
          },
        ],
        navigateFallback: "/offline.html",
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
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
