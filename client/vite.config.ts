import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import { imagetools } from "vite-imagetools"; // Temporarily disabled
import compression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';
import viteImagemin from 'vite-plugin-imagemin';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    // imagetools(), // Temporarily disabled to fix development errors

    // Image optimization - selective approach
    // Only optimize PNG/SVG files to avoid JPEG compression issues
    // JPEG files are already optimized and don't benefit from further compression
    viteImagemin({
      gifsicle: {
        optimizationLevel: 3,
      },
      // Skip JPEG optimization to prevent build errors - they're already optimized
      // mozjpeg: {
      //   quality: 80,
      //   progressive: true,
      // },
      pngquant: {
        quality: [0.65, 0.8],
      },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: false },
        ],
      },
      verbose: false,
      // Additional safety: can be disabled via env var if needed
      disable: process.env.SKIP_IMAGEMIN === 'true',
    }),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'offline.html'],
      devOptions: {
        enabled: false, // set to true only if you want to test SW in dev
      },
      manifest: {
        name: "Dominique & Justin's Wedding",
        short_name: 'D&J Wedding',
        description: 'Join us for our special day - November 8, 2026',
        theme_color: '#C9A66B',
        background_color: '#FAF6F0',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        categories: ['lifestyle', 'social'],
        icons: [
          {
            src: 'favicon.svg',
            sizes: '32x32 64x64 128x128 256x256',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
        shortcuts: [
          {
            name: 'RSVP',
            short_name: 'RSVP',
            description: 'Submit your wedding RSVP',
            url: '/rsvp',
            icons: [{ src: 'favicon.svg', sizes: '96x96' }],
          },
          {
            name: 'Gallery',
            short_name: 'Photos',
            description: 'View wedding photos',
            url: '/#gallery',
            icons: [{ src: 'favicon.svg', sizes: '96x96' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // Enhanced PWA capabilities
        ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^v$/, /^_/],
        dontCacheBustURLsMatching: /\.\w{8}\./,
        // Background sync and push notifications support
        additionalManifestEntries: [{ url: '/offline.html', revision: null }],
        manifestTransforms: [
          manifestEntries => {
            // Remove any duplicate entries with different revisions
            const uniqueEntries = new Map();
            manifestEntries.forEach(entry => {
              const url = entry.url.split('?')[0]; // Remove query parameters for comparison
              uniqueEntries.set(url, entry);
            });
            return { manifest: Array.from(uniqueEntries.values()) };
          },
        ],
        runtimeCaching: [
          // GraphQL API - Network first with offline fallback
          {
            urlPattern: ({ url }) => url.pathname === '/graphql',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'wedding-graphql-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 600, // 10 minutes
              },
              networkTimeoutSeconds: 5,
            },
          },
          // Images - Cache first with long expiration
          {
            urlPattern: /\.(png|jpg|jpeg|svg|webp|gif|avif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'wedding-images-cache',
              expiration: {
                maxEntries: 150,
                maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxAgeSeconds: 7 * 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 365 * 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 3600,
              },
            },
          },
        ],
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
      },
    }),
    // Bundle analyzer (only in analyze mode)
    process.env.NODE_ENV === 'analyze' &&
      visualizer({
        filename: 'dist/stats.html',
        open: false, // Don't auto-open to avoid browser dependency
        gzipSize: true,
        brotliSize: true,
        template: 'treemap', // Better visualization for bundle analysis
      }),
  ].filter(Boolean),
  server: {
    host: true, // ✅ reachable on LAN (iPhone)
    port: 3002,
    // https: true,                // ✅ commented out - causing mobile connectivity issues
    hmr: {
      // Point this to your machine's LAN IP for iPhone HMR.
      // Replace with your IP (e.g., "192.168.1.23").
      host: 'localhost',
      protocol: 'ws', // ✅ back to regular websockets
      port: 3002,
    },
    proxy: {
      '/graphql': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: ['es2019', 'safari14'], // ✅ safer for older mobile Safari
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          apollo: ['@apollo/client'],
          ui: ['react-router-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
