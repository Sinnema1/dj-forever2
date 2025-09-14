import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import { imagetools } from "vite-imagetools"; // Temporarily disabled
import compression from "vite-plugin-compression";
import { VitePWA } from "vite-plugin-pwa";
import viteImagemin from "vite-plugin-imagemin";

export default defineConfig({
  plugins: [
    react(),
    // imagetools(), // Temporarily disabled to fix development errors
    // Image optimization for production builds only
    process.env.NODE_ENV === "production" && viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      mozjpeg: { quality: 85 }, // Reduce quality from default 90 to 85
      pngquant: { quality: [0.6, 0.8] },
      webp: { quality: 85 }, // Generate WebP versions
    }),
    compression({
      algorithm: "gzip",
      ext: ".gz",
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "offline.html"],
      devOptions: {
        enabled: false, // set to true only if you want to test SW in dev
      },
      manifest: {
        name: "Dominique & Justin's Wedding",
        short_name: "D&J Wedding",
        description: "Join us for our special day - November 8, 2026",
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
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
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
                maxAgeSeconds: 600,
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
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
              expiration: {
                maxAgeSeconds: 7 * 24 * 60 * 60,
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
                maxAgeSeconds: 365 * 24 * 60 * 60,
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
                maxAgeSeconds: 3600,
              },
            },
          },
        ],
        navigateFallback: "/offline.html",
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
      },
    }),
  ].filter(Boolean),
  server: {
    host: true, // ✅ reachable on LAN (iPhone)
    port: 3002,
    // https: true,                // ✅ commented out - causing mobile connectivity issues
    hmr: {
      // Point this to your machine's LAN IP for iPhone HMR.
      // Replace with your IP (e.g., "192.168.1.23").
      host: "localhost",
      protocol: "ws", // ✅ back to regular websockets
      port: 3002,
    },
    proxy: {
      "/graphql": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  build: {
    target: ["es2019", "safari14"], // ✅ safer for older mobile Safari
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
