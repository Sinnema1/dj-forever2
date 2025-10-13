// vite.config.ts
import { defineConfig } from "file:///Users/justinmanning/repos/dj-forever2/client/node_modules/vite/dist/node/index.js";
import react from "file:///Users/justinmanning/repos/dj-forever2/client/node_modules/@vitejs/plugin-react/dist/index.js";
import compression from "file:///Users/justinmanning/repos/dj-forever2/client/node_modules/vite-plugin-compression/dist/index.mjs";
import { VitePWA } from "file:///Users/justinmanning/repos/dj-forever2/client/node_modules/vite-plugin-pwa/dist/index.js";
import viteImagemin from "file:///Users/justinmanning/repos/dj-forever2/client/node_modules/vite-plugin-imagemin/dist/index.mjs";
import { visualizer } from "file:///Users/justinmanning/repos/dj-forever2/client/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    // imagetools(), // Temporarily disabled to fix development errors
    // Image optimization - selective approach
    // Only optimize PNG/SVG files to avoid JPEG compression issues
    // JPEG files are already optimized and don't benefit from further compression
    viteImagemin({
      gifsicle: {
        optimizationLevel: 3
      },
      // Skip JPEG optimization to prevent build errors - they're already optimized
      // mozjpeg: {
      //   quality: 80,
      //   progressive: true,
      // },
      pngquant: {
        quality: [0.65, 0.8]
      },
      svgo: {
        plugins: [
          { name: "removeViewBox", active: false },
          { name: "removeEmptyAttrs", active: false }
        ]
      },
      verbose: false,
      // Additional safety: can be disabled via env var if needed
      disable: process.env.SKIP_IMAGEMIN === "true"
    }),
    compression({
      algorithm: "gzip",
      ext: ".gz"
    }),
    VitePWA({
      // AUTO UPDATE: Updates happen automatically without user intervention
      // This provides the best UX for wedding guests - no confusing notifications
      registerType: "autoUpdate",
      // Let Workbox handle all assets automatically via globPatterns
      devOptions: {
        enabled: false
        // set to true only if you want to test SW in dev
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
            purpose: "any maskable"
          }
        ],
        shortcuts: [
          {
            name: "RSVP",
            short_name: "RSVP",
            description: "Submit your wedding RSVP",
            url: "/rsvp",
            icons: [{ src: "favicon.svg", sizes: "96x96" }]
          },
          {
            name: "Gallery",
            short_name: "Photos",
            description: "View wedding photos",
            url: "/#gallery",
            icons: [{ src: "favicon.svg", sizes: "96x96" }]
          }
        ]
      },
      workbox: {
        globPatterns: [
          "**/*.{js,css,html}",
          "assets/**/*.{png,svg,jpg,jpeg,webp}",
          // Only assets folder for images
          "images/**/*.{png,svg,jpg,jpeg,webp}",
          // Images in public/images
          "favicon.svg",
          // Root favicon
          "offline.html",
          // Offline page
          "manifest.webmanifest"
          // PWA manifest
        ],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        // AUTOMATIC UPDATE CONFIGURATION
        skipWaiting: true,
        // New SW takes control immediately
        clientsClaim: true,
        // SW controls all clients immediately
        cleanupOutdatedCaches: true,
        // Enhanced PWA capabilities
        ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^v$/, /^_/],
        dontCacheBustURLsMatching: /\.\w{8}\./,
        // Explicitly exclude files to prevent double inclusion
        globIgnores: ["**/node_modules/**/*"],
        // FIXED: Remove navigateFallback to prevent offline.html duplication
        navigateFallback: null,
        runtimeCaching: [
          // GraphQL API - Network first with offline fallback
          {
            urlPattern: ({ url }) => url.pathname === "/graphql",
            handler: "NetworkFirst",
            options: {
              cacheName: "wedding-graphql-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 600
                // 10 minutes
              },
              networkTimeoutSeconds: 5
            }
          },
          // Images - Cache first with long expiration
          {
            urlPattern: /\.(png|jpg|jpeg|svg|webp|gif|avif)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "wedding-images-cache",
              expiration: {
                maxEntries: 150,
                maxAgeSeconds: 60 * 24 * 60 * 60
                // 60 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
              expiration: {
                maxAgeSeconds: 7 * 24 * 60 * 60
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 365 * 24 * 60 * 60
              }
            }
          },
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 3600
              }
            }
          }
        ]
      }
    }),
    // Bundle analyzer (multiple templates for comprehensive analysis)
    process.env.ANALYZE === "true" && visualizer({
      filename: "dist/bundle-analysis.html",
      open: false,
      // Don't auto-open to avoid browser dependency
      gzipSize: true,
      brotliSize: true,
      template: "treemap",
      // Best for identifying large chunks
      title: "Bundle Analysis - DJ Forever 2 Wedding Site"
    }),
    // Generate additional analysis formats
    process.env.ANALYZE === "true" && visualizer({
      filename: "dist/bundle-sunburst.html",
      template: "sunburst",
      // Good for hierarchical view
      gzipSize: true,
      brotliSize: true,
      title: "Bundle Hierarchy Analysis"
    })
  ].filter(Boolean),
  server: {
    host: true,
    // ✅ reachable on LAN (iPhone)
    port: 3002,
    // https: true,                // ✅ commented out - causing mobile connectivity issues
    hmr: {
      // Point this to your machine's LAN IP for iPhone HMR.
      // Replace with your IP (e.g., "192.168.1.23").
      host: "localhost",
      protocol: "ws",
      // ✅ back to regular websockets
      port: 3002
    },
    proxy: {
      "/graphql": {
        target: "http://localhost:3001",
        changeOrigin: true
      }
    }
  },
  build: {
    target: ["es2019", "safari14"],
    // ✅ safer for older mobile Safari
    outDir: "dist",
    assetsDir: "assets",
    // Performance Budget Configuration
    chunkSizeWarningLimit: 400,
    // Stricter limit for better performance (was 500KB)
    // Enhanced build optimizations for smaller bundles
    minify: "esbuild",
    // Fastest and most efficient minifier
    reportCompressedSize: true,
    // Report compressed bundle sizes
    // CSS optimization
    cssMinify: "esbuild",
    cssCodeSplit: true,
    // Split CSS per route/chunk
    rollupOptions: {
      // Enhanced tree-shaking configuration (more conservative)
      treeshake: {
        preset: "recommended",
        moduleSideEffects: "no-external",
        // Less aggressive - keep side effects for internal modules
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false
      },
      onwarn(warning, warn) {
        if (warning.code === "CIRCULAR_DEPENDENCY") return;
        if (warning.code === "THIS_IS_UNDEFINED") return;
        if (warning.code === "EVAL") return;
        warn(warning);
      },
      output: {
        manualChunks: {
          // Core React dependencies (most stable)
          vendor: [
            "react",
            "react-dom",
            "react-router-dom",
            "react-helmet-async"
          ],
          // Apollo Client and GraphQL (large, optimize separately)
          apollo: ["@apollo/client", "graphql"],
          // UI and utility libraries
          ui: ["react-icons", "web-vitals", "html5-qrcode"]
        },
        // Performance optimization
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split(".").pop();
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType ?? "")) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(extType ?? "")) {
            return `assets/styles/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvanVzdGlubWFubmluZy9yZXBvcy9kai1mb3JldmVyMi9jbGllbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9qdXN0aW5tYW5uaW5nL3JlcG9zL2RqLWZvcmV2ZXIyL2NsaWVudC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvanVzdGlubWFubmluZy9yZXBvcy9kai1mb3JldmVyMi9jbGllbnQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG4vLyBpbXBvcnQgeyBpbWFnZXRvb2xzIH0gZnJvbSBcInZpdGUtaW1hZ2V0b29sc1wiOyAvLyBUZW1wb3JhcmlseSBkaXNhYmxlZFxuaW1wb3J0IGNvbXByZXNzaW9uIGZyb20gJ3ZpdGUtcGx1Z2luLWNvbXByZXNzaW9uJztcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnO1xuaW1wb3J0IHZpdGVJbWFnZW1pbiBmcm9tICd2aXRlLXBsdWdpbi1pbWFnZW1pbic7XG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSAncm9sbHVwLXBsdWdpbi12aXN1YWxpemVyJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgLy8gaW1hZ2V0b29scygpLCAvLyBUZW1wb3JhcmlseSBkaXNhYmxlZCB0byBmaXggZGV2ZWxvcG1lbnQgZXJyb3JzXG5cbiAgICAvLyBJbWFnZSBvcHRpbWl6YXRpb24gLSBzZWxlY3RpdmUgYXBwcm9hY2hcbiAgICAvLyBPbmx5IG9wdGltaXplIFBORy9TVkcgZmlsZXMgdG8gYXZvaWQgSlBFRyBjb21wcmVzc2lvbiBpc3N1ZXNcbiAgICAvLyBKUEVHIGZpbGVzIGFyZSBhbHJlYWR5IG9wdGltaXplZCBhbmQgZG9uJ3QgYmVuZWZpdCBmcm9tIGZ1cnRoZXIgY29tcHJlc3Npb25cbiAgICB2aXRlSW1hZ2VtaW4oe1xuICAgICAgZ2lmc2ljbGU6IHtcbiAgICAgICAgb3B0aW1pemF0aW9uTGV2ZWw6IDMsXG4gICAgICB9LFxuICAgICAgLy8gU2tpcCBKUEVHIG9wdGltaXphdGlvbiB0byBwcmV2ZW50IGJ1aWxkIGVycm9ycyAtIHRoZXkncmUgYWxyZWFkeSBvcHRpbWl6ZWRcbiAgICAgIC8vIG1vempwZWc6IHtcbiAgICAgIC8vICAgcXVhbGl0eTogODAsXG4gICAgICAvLyAgIHByb2dyZXNzaXZlOiB0cnVlLFxuICAgICAgLy8gfSxcbiAgICAgIHBuZ3F1YW50OiB7XG4gICAgICAgIHF1YWxpdHk6IFswLjY1LCAwLjhdLFxuICAgICAgfSxcbiAgICAgIHN2Z286IHtcbiAgICAgICAgcGx1Z2luczogW1xuICAgICAgICAgIHsgbmFtZTogJ3JlbW92ZVZpZXdCb3gnLCBhY3RpdmU6IGZhbHNlIH0sXG4gICAgICAgICAgeyBuYW1lOiAncmVtb3ZlRW1wdHlBdHRycycsIGFjdGl2ZTogZmFsc2UgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgICB2ZXJib3NlOiBmYWxzZSxcbiAgICAgIC8vIEFkZGl0aW9uYWwgc2FmZXR5OiBjYW4gYmUgZGlzYWJsZWQgdmlhIGVudiB2YXIgaWYgbmVlZGVkXG4gICAgICBkaXNhYmxlOiBwcm9jZXNzLmVudi5TS0lQX0lNQUdFTUlOID09PSAndHJ1ZScsXG4gICAgfSksXG4gICAgY29tcHJlc3Npb24oe1xuICAgICAgYWxnb3JpdGhtOiAnZ3ppcCcsXG4gICAgICBleHQ6ICcuZ3onLFxuICAgIH0pLFxuICAgIFZpdGVQV0Eoe1xuICAgICAgLy8gQVVUTyBVUERBVEU6IFVwZGF0ZXMgaGFwcGVuIGF1dG9tYXRpY2FsbHkgd2l0aG91dCB1c2VyIGludGVydmVudGlvblxuICAgICAgLy8gVGhpcyBwcm92aWRlcyB0aGUgYmVzdCBVWCBmb3Igd2VkZGluZyBndWVzdHMgLSBubyBjb25mdXNpbmcgbm90aWZpY2F0aW9uc1xuICAgICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXG4gICAgICAvLyBMZXQgV29ya2JveCBoYW5kbGUgYWxsIGFzc2V0cyBhdXRvbWF0aWNhbGx5IHZpYSBnbG9iUGF0dGVybnNcbiAgICAgIGRldk9wdGlvbnM6IHtcbiAgICAgICAgZW5hYmxlZDogZmFsc2UsIC8vIHNldCB0byB0cnVlIG9ubHkgaWYgeW91IHdhbnQgdG8gdGVzdCBTVyBpbiBkZXZcbiAgICAgIH0sXG4gICAgICBtYW5pZmVzdDoge1xuICAgICAgICBuYW1lOiBcIkRvbWluaXF1ZSAmIEp1c3RpbidzIFdlZGRpbmdcIixcbiAgICAgICAgc2hvcnRfbmFtZTogJ0QmSiBXZWRkaW5nJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdKb2luIHVzIGZvciBvdXIgc3BlY2lhbCBkYXkgLSBOb3ZlbWJlciA4LCAyMDI2JyxcbiAgICAgICAgdGhlbWVfY29sb3I6ICcjQzlBNjZCJyxcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyNGQUY2RjAnLFxuICAgICAgICBkaXNwbGF5OiAnc3RhbmRhbG9uZScsXG4gICAgICAgIG9yaWVudGF0aW9uOiAncG9ydHJhaXQnLFxuICAgICAgICBzdGFydF91cmw6ICcvJyxcbiAgICAgICAgc2NvcGU6ICcvJyxcbiAgICAgICAgY2F0ZWdvcmllczogWydsaWZlc3R5bGUnLCAnc29jaWFsJ10sXG4gICAgICAgIGljb25zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnZmF2aWNvbi5zdmcnLFxuICAgICAgICAgICAgc2l6ZXM6ICczMngzMiA2NHg2NCAxMjh4MTI4IDI1NngyNTYnLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3N2Zyt4bWwnLFxuICAgICAgICAgICAgcHVycG9zZTogJ2FueSBtYXNrYWJsZScsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgc2hvcnRjdXRzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1JTVlAnLFxuICAgICAgICAgICAgc2hvcnRfbmFtZTogJ1JTVlAnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdTdWJtaXQgeW91ciB3ZWRkaW5nIFJTVlAnLFxuICAgICAgICAgICAgdXJsOiAnL3JzdnAnLFxuICAgICAgICAgICAgaWNvbnM6IFt7IHNyYzogJ2Zhdmljb24uc3ZnJywgc2l6ZXM6ICc5Nng5NicgfV0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnR2FsbGVyeScsXG4gICAgICAgICAgICBzaG9ydF9uYW1lOiAnUGhvdG9zJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVmlldyB3ZWRkaW5nIHBob3RvcycsXG4gICAgICAgICAgICB1cmw6ICcvI2dhbGxlcnknLFxuICAgICAgICAgICAgaWNvbnM6IFt7IHNyYzogJ2Zhdmljb24uc3ZnJywgc2l6ZXM6ICc5Nng5NicgfV0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgICB3b3JrYm94OiB7XG4gICAgICAgIGdsb2JQYXR0ZXJuczogW1xuICAgICAgICAgICcqKi8qLntqcyxjc3MsaHRtbH0nLFxuICAgICAgICAgICdhc3NldHMvKiovKi57cG5nLHN2ZyxqcGcsanBlZyx3ZWJwfScsIC8vIE9ubHkgYXNzZXRzIGZvbGRlciBmb3IgaW1hZ2VzXG4gICAgICAgICAgJ2ltYWdlcy8qKi8qLntwbmcsc3ZnLGpwZyxqcGVnLHdlYnB9JywgLy8gSW1hZ2VzIGluIHB1YmxpYy9pbWFnZXNcbiAgICAgICAgICAnZmF2aWNvbi5zdmcnLCAvLyBSb290IGZhdmljb25cbiAgICAgICAgICAnb2ZmbGluZS5odG1sJywgLy8gT2ZmbGluZSBwYWdlXG4gICAgICAgICAgJ21hbmlmZXN0LndlYm1hbmlmZXN0JywgLy8gUFdBIG1hbmlmZXN0XG4gICAgICAgIF0sXG4gICAgICAgIG1heGltdW1GaWxlU2l6ZVRvQ2FjaGVJbkJ5dGVzOiAxMCAqIDEwMjQgKiAxMDI0LFxuICAgICAgICAvLyBBVVRPTUFUSUMgVVBEQVRFIENPTkZJR1VSQVRJT05cbiAgICAgICAgc2tpcFdhaXRpbmc6IHRydWUsIC8vIE5ldyBTVyB0YWtlcyBjb250cm9sIGltbWVkaWF0ZWx5XG4gICAgICAgIGNsaWVudHNDbGFpbTogdHJ1ZSwgLy8gU1cgY29udHJvbHMgYWxsIGNsaWVudHMgaW1tZWRpYXRlbHlcbiAgICAgICAgY2xlYW51cE91dGRhdGVkQ2FjaGVzOiB0cnVlLFxuICAgICAgICAvLyBFbmhhbmNlZCBQV0EgY2FwYWJpbGl0aWVzXG4gICAgICAgIGlnbm9yZVVSTFBhcmFtZXRlcnNNYXRjaGluZzogWy9edXRtXy8sIC9eZmJjbGlkJC8sIC9ediQvLCAvXl8vXSxcbiAgICAgICAgZG9udENhY2hlQnVzdFVSTHNNYXRjaGluZzogL1xcLlxcd3s4fVxcLi8sXG4gICAgICAgIC8vIEV4cGxpY2l0bHkgZXhjbHVkZSBmaWxlcyB0byBwcmV2ZW50IGRvdWJsZSBpbmNsdXNpb25cbiAgICAgICAgZ2xvYklnbm9yZXM6IFsnKiovbm9kZV9tb2R1bGVzLyoqLyonXSxcbiAgICAgICAgLy8gRklYRUQ6IFJlbW92ZSBuYXZpZ2F0ZUZhbGxiYWNrIHRvIHByZXZlbnQgb2ZmbGluZS5odG1sIGR1cGxpY2F0aW9uXG4gICAgICAgIG5hdmlnYXRlRmFsbGJhY2s6IG51bGwsXG4gICAgICAgIHJ1bnRpbWVDYWNoaW5nOiBbXG4gICAgICAgICAgLy8gR3JhcGhRTCBBUEkgLSBOZXR3b3JrIGZpcnN0IHdpdGggb2ZmbGluZSBmYWxsYmFja1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHVybFBhdHRlcm46ICh7IHVybCB9KSA9PiB1cmwucGF0aG5hbWUgPT09ICcvZ3JhcGhxbCcsXG4gICAgICAgICAgICBoYW5kbGVyOiAnTmV0d29ya0ZpcnN0JyxcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiAnd2VkZGluZy1ncmFwaHFsLWNhY2hlJyxcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xuICAgICAgICAgICAgICAgIG1heEVudHJpZXM6IDUwLFxuICAgICAgICAgICAgICAgIG1heEFnZVNlY29uZHM6IDYwMCwgLy8gMTAgbWludXRlc1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBuZXR3b3JrVGltZW91dFNlY29uZHM6IDUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgLy8gSW1hZ2VzIC0gQ2FjaGUgZmlyc3Qgd2l0aCBsb25nIGV4cGlyYXRpb25cbiAgICAgICAgICB7XG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXFwuKHBuZ3xqcGd8anBlZ3xzdmd8d2VicHxnaWZ8YXZpZikkLyxcbiAgICAgICAgICAgIGhhbmRsZXI6ICdDYWNoZUZpcnN0JyxcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiAnd2VkZGluZy1pbWFnZXMtY2FjaGUnLFxuICAgICAgICAgICAgICBleHBpcmF0aW9uOiB7XG4gICAgICAgICAgICAgICAgbWF4RW50cmllczogMTUwLFxuICAgICAgICAgICAgICAgIG1heEFnZVNlY29uZHM6IDYwICogMjQgKiA2MCAqIDYwLCAvLyA2MCBkYXlzXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC9mb250c1xcLmdvb2dsZWFwaXNcXC5jb20vLFxuICAgICAgICAgICAgaGFuZGxlcjogJ1N0YWxlV2hpbGVSZXZhbGlkYXRlJyxcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiAnZ29vZ2xlLWZvbnRzLXN0eWxlc2hlZXRzJyxcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xuICAgICAgICAgICAgICAgIG1heEFnZVNlY29uZHM6IDcgKiAyNCAqIDYwICogNjAsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC9mb250c1xcLmdzdGF0aWNcXC5jb20vLFxuICAgICAgICAgICAgaGFuZGxlcjogJ0NhY2hlRmlyc3QnLFxuICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdnb29nbGUtZm9udHMtd2ViZm9udHMnLFxuICAgICAgICAgICAgICBleHBpcmF0aW9uOiB7XG4gICAgICAgICAgICAgICAgbWF4RW50cmllczogMzAsXG4gICAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogMzY1ICogMjQgKiA2MCAqIDYwLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHVybFBhdHRlcm46ICh7IHJlcXVlc3QgfSkgPT4gcmVxdWVzdC5kZXN0aW5hdGlvbiA9PT0gJ2RvY3VtZW50JyxcbiAgICAgICAgICAgIGhhbmRsZXI6ICdOZXR3b3JrRmlyc3QnLFxuICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdwYWdlcy1jYWNoZScsXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHtcbiAgICAgICAgICAgICAgICBtYXhFbnRyaWVzOiAxMCxcbiAgICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiAzNjAwLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICB9KSxcbiAgICAvLyBCdW5kbGUgYW5hbHl6ZXIgKG11bHRpcGxlIHRlbXBsYXRlcyBmb3IgY29tcHJlaGVuc2l2ZSBhbmFseXNpcylcbiAgICBwcm9jZXNzLmVudi5BTkFMWVpFID09PSAndHJ1ZScgJiZcbiAgICAgIHZpc3VhbGl6ZXIoe1xuICAgICAgICBmaWxlbmFtZTogJ2Rpc3QvYnVuZGxlLWFuYWx5c2lzLmh0bWwnLFxuICAgICAgICBvcGVuOiBmYWxzZSwgLy8gRG9uJ3QgYXV0by1vcGVuIHRvIGF2b2lkIGJyb3dzZXIgZGVwZW5kZW5jeVxuICAgICAgICBnemlwU2l6ZTogdHJ1ZSxcbiAgICAgICAgYnJvdGxpU2l6ZTogdHJ1ZSxcbiAgICAgICAgdGVtcGxhdGU6ICd0cmVlbWFwJywgLy8gQmVzdCBmb3IgaWRlbnRpZnlpbmcgbGFyZ2UgY2h1bmtzXG4gICAgICAgIHRpdGxlOiAnQnVuZGxlIEFuYWx5c2lzIC0gREogRm9yZXZlciAyIFdlZGRpbmcgU2l0ZScsXG4gICAgICB9KSxcblxuICAgIC8vIEdlbmVyYXRlIGFkZGl0aW9uYWwgYW5hbHlzaXMgZm9ybWF0c1xuICAgIHByb2Nlc3MuZW52LkFOQUxZWkUgPT09ICd0cnVlJyAmJlxuICAgICAgdmlzdWFsaXplcih7XG4gICAgICAgIGZpbGVuYW1lOiAnZGlzdC9idW5kbGUtc3VuYnVyc3QuaHRtbCcsXG4gICAgICAgIHRlbXBsYXRlOiAnc3VuYnVyc3QnLCAvLyBHb29kIGZvciBoaWVyYXJjaGljYWwgdmlld1xuICAgICAgICBnemlwU2l6ZTogdHJ1ZSxcbiAgICAgICAgYnJvdGxpU2l6ZTogdHJ1ZSxcbiAgICAgICAgdGl0bGU6ICdCdW5kbGUgSGllcmFyY2h5IEFuYWx5c2lzJyxcbiAgICAgIH0pLFxuICBdLmZpbHRlcihCb29sZWFuKSxcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogdHJ1ZSwgLy8gXHUyNzA1IHJlYWNoYWJsZSBvbiBMQU4gKGlQaG9uZSlcbiAgICBwb3J0OiAzMDAyLFxuICAgIC8vIGh0dHBzOiB0cnVlLCAgICAgICAgICAgICAgICAvLyBcdTI3MDUgY29tbWVudGVkIG91dCAtIGNhdXNpbmcgbW9iaWxlIGNvbm5lY3Rpdml0eSBpc3N1ZXNcbiAgICBobXI6IHtcbiAgICAgIC8vIFBvaW50IHRoaXMgdG8geW91ciBtYWNoaW5lJ3MgTEFOIElQIGZvciBpUGhvbmUgSE1SLlxuICAgICAgLy8gUmVwbGFjZSB3aXRoIHlvdXIgSVAgKGUuZy4sIFwiMTkyLjE2OC4xLjIzXCIpLlxuICAgICAgaG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgICBwcm90b2NvbDogJ3dzJywgLy8gXHUyNzA1IGJhY2sgdG8gcmVndWxhciB3ZWJzb2NrZXRzXG4gICAgICBwb3J0OiAzMDAyLFxuICAgIH0sXG4gICAgcHJveHk6IHtcbiAgICAgICcvZ3JhcGhxbCc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAxJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBidWlsZDoge1xuICAgIHRhcmdldDogWydlczIwMTknLCAnc2FmYXJpMTQnXSwgLy8gXHUyNzA1IHNhZmVyIGZvciBvbGRlciBtb2JpbGUgU2FmYXJpXG4gICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgYXNzZXRzRGlyOiAnYXNzZXRzJyxcbiAgICAvLyBQZXJmb3JtYW5jZSBCdWRnZXQgQ29uZmlndXJhdGlvblxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogNDAwLCAvLyBTdHJpY3RlciBsaW1pdCBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlICh3YXMgNTAwS0IpXG5cbiAgICAvLyBFbmhhbmNlZCBidWlsZCBvcHRpbWl6YXRpb25zIGZvciBzbWFsbGVyIGJ1bmRsZXNcbiAgICBtaW5pZnk6ICdlc2J1aWxkJywgLy8gRmFzdGVzdCBhbmQgbW9zdCBlZmZpY2llbnQgbWluaWZpZXJcbiAgICByZXBvcnRDb21wcmVzc2VkU2l6ZTogdHJ1ZSwgLy8gUmVwb3J0IGNvbXByZXNzZWQgYnVuZGxlIHNpemVzXG5cbiAgICAvLyBDU1Mgb3B0aW1pemF0aW9uXG4gICAgY3NzTWluaWZ5OiAnZXNidWlsZCcsXG4gICAgY3NzQ29kZVNwbGl0OiB0cnVlLCAvLyBTcGxpdCBDU1MgcGVyIHJvdXRlL2NodW5rXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgLy8gRW5oYW5jZWQgdHJlZS1zaGFraW5nIGNvbmZpZ3VyYXRpb24gKG1vcmUgY29uc2VydmF0aXZlKVxuICAgICAgdHJlZXNoYWtlOiB7XG4gICAgICAgIHByZXNldDogJ3JlY29tbWVuZGVkJyxcbiAgICAgICAgbW9kdWxlU2lkZUVmZmVjdHM6ICduby1leHRlcm5hbCcsIC8vIExlc3MgYWdncmVzc2l2ZSAtIGtlZXAgc2lkZSBlZmZlY3RzIGZvciBpbnRlcm5hbCBtb2R1bGVzXG4gICAgICAgIHByb3BlcnR5UmVhZFNpZGVFZmZlY3RzOiBmYWxzZSxcbiAgICAgICAgdHJ5Q2F0Y2hEZW9wdGltaXphdGlvbjogZmFsc2UsXG4gICAgICB9LFxuXG4gICAgICBvbndhcm4od2FybmluZywgd2Fybikge1xuICAgICAgICAvLyBQZXJmb3JtYW5jZSBidWRnZXQgd2FybmluZ3NcbiAgICAgICAgaWYgKHdhcm5pbmcuY29kZSA9PT0gJ0NJUkNVTEFSX0RFUEVOREVOQ1knKSByZXR1cm47XG4gICAgICAgIGlmICh3YXJuaW5nLmNvZGUgPT09ICdUSElTX0lTX1VOREVGSU5FRCcpIHJldHVybjtcbiAgICAgICAgaWYgKHdhcm5pbmcuY29kZSA9PT0gJ0VWQUwnKSByZXR1cm47IC8vIFN1cHByZXNzIGV2YWwgd2FybmluZ3MgZm9yIGRldiB0b29sc1xuICAgICAgICB3YXJuKHdhcm5pbmcpO1xuICAgICAgfSxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAvLyBDb3JlIFJlYWN0IGRlcGVuZGVuY2llcyAobW9zdCBzdGFibGUpXG4gICAgICAgICAgdmVuZG9yOiBbXG4gICAgICAgICAgICAncmVhY3QnLFxuICAgICAgICAgICAgJ3JlYWN0LWRvbScsXG4gICAgICAgICAgICAncmVhY3Qtcm91dGVyLWRvbScsXG4gICAgICAgICAgICAncmVhY3QtaGVsbWV0LWFzeW5jJyxcbiAgICAgICAgICBdLFxuXG4gICAgICAgICAgLy8gQXBvbGxvIENsaWVudCBhbmQgR3JhcGhRTCAobGFyZ2UsIG9wdGltaXplIHNlcGFyYXRlbHkpXG4gICAgICAgICAgYXBvbGxvOiBbJ0BhcG9sbG8vY2xpZW50JywgJ2dyYXBocWwnXSxcblxuICAgICAgICAgIC8vIFVJIGFuZCB1dGlsaXR5IGxpYnJhcmllc1xuICAgICAgICAgIHVpOiBbJ3JlYWN0LWljb25zJywgJ3dlYi12aXRhbHMnLCAnaHRtbDUtcXJjb2RlJ10sXG4gICAgICAgIH0sXG4gICAgICAgIC8vIFBlcmZvcm1hbmNlIG9wdGltaXphdGlvblxuICAgICAgICBjaHVua0ZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzJyxcbiAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcycsXG4gICAgICAgIGFzc2V0RmlsZU5hbWVzOiBhc3NldEluZm8gPT4ge1xuICAgICAgICAgIGNvbnN0IGV4dFR5cGUgPSBhc3NldEluZm8ubmFtZT8uc3BsaXQoJy4nKS5wb3AoKTtcbiAgICAgICAgICBpZiAoL3BuZ3xqcGU/Z3xzdmd8Z2lmfHRpZmZ8Ym1wfGljby9pLnRlc3QoZXh0VHlwZSA/PyAnJykpIHtcbiAgICAgICAgICAgIHJldHVybiBgYXNzZXRzL2ltYWdlcy9bbmFtZV0tW2hhc2hdW2V4dG5hbWVdYDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKC9jc3MvaS50ZXN0KGV4dFR5cGUgPz8gJycpKSB7XG4gICAgICAgICAgICByZXR1cm4gYGFzc2V0cy9zdHlsZXMvW25hbWVdLVtoYXNoXVtleHRuYW1lXWA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBgYXNzZXRzL1tuYW1lXS1baGFzaF1bZXh0bmFtZV1gO1xuICAgICAg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
