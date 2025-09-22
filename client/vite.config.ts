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
    // Image optimization for production builds only
    process.env.NODE_ENV === 'production' &&
      viteImagemin({
        gifsicle: { optimizationLevel: 7 },
        mozjpeg: { quality: 82 }, // Optimized for wedding photos
        pngquant: { quality: [0.65, 0.8] }, // Better quality for UI elements
        webp: { quality: 82 }, // Generate WebP versions for better compression
        svgo: {
          plugins: [
            { name: 'removeViewBox', active: false }, // Keep viewBox for responsive SVGs
            { name: 'cleanupIDs', active: false }, // Prevent ID conflicts
          ],
        },
      }),
    // Gzip compression for better performance
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Brotli compression for even better compression ratios
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      compressionOptions: {
        level: 11,
      },
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
        theme_color: '#b4946c', // Matches --color-gold-accent from website theme
        background_color: '#f2efea', // Matches --color-cream page background
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
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // Fix cache conflicts by using unique revision hashing
        dontCacheBustURLsMatching: /\.\w{8}\./,
        mode: 'production',
        // Exclude problematic files that cause cache conflicts
        globIgnores: ['**/node_modules/**/*'],
        modifyURLPrefix: {
          'assets/': 'assets/',
        },
        runtimeCaching: [
          {
            // GraphQL API - NetworkFirst for fresh RSVP data
            urlPattern:
              /^https:\/\/dj-forever2-backend\.onrender\.com\/graphql$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'graphql-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 600, // 10 minutes - important for RSVP freshness
              },
              networkTimeoutSeconds: 10, // Fallback to cache after 10s
            },
          },
          {
            // Wedding images - CacheFirst for performance
            urlPattern: /\.(png|jpg|jpeg|svg|webp|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'wedding-images-cache',
              expiration: {
                maxEntries: 150, // More images for wedding gallery
                maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days for wedding photos
              },
            },
          },
          {
            // Google Fonts stylesheets
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            // Google Fonts webfonts
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
              },
            },
          },
          {
            // App shell and pages - NetworkFirst for updates
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              expiration: {
                maxEntries: 15, // More pages for wedding site
                maxAgeSeconds: 24 * 60 * 60, // 24 hours
              },
              networkTimeoutSeconds: 5, // Faster fallback for pages
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
  define: {
    // Define app version for cache busting if needed
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
  // Optimize dependencies for faster dev server startup
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@apollo/client',
      'graphql',
    ],
    exclude: ['html5-qrcode'], // Exclude problematic dependencies
  },
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
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'], // Modern browsers with good mobile support
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable source maps in production for smaller bundle
    chunkSizeWarningLimit: 1000, // Reasonable limit for wedding site
    rollupOptions: {
      output: {
        manualChunks: id => {
          // Ensure ALL React-related packages stay together to prevent context errors
          if (
            id.includes('react') ||
            id.includes('react-dom') ||
            id.includes('react/') ||
            id.includes('react-dom/') ||
            id.includes('react-router') ||
            id.includes('scheduler') || // React scheduler
            id.includes('use-sync-external-store') // React 18 hook
          ) {
            return 'react-core';
          }
          // Apollo GraphQL and related utilities - ensure ALL Apollo dependencies stay together
          if (
            id.includes('@apollo/client') || 
            id.includes('graphql') ||
            id.includes('apollo') ||
            id.includes('@apollo') ||
            id.includes('apollo-link') ||
            id.includes('@apollo/client/link') ||
            id.includes('apollo-utilities')
          ) {
            return 'apollo';
          }
          // QR code library (relatively large)
          if (id.includes('html5-qrcode')) {
            return 'qr';
          }
          // Large image/media libraries
          if (id.includes('swiper') || id.includes('lightbox')) {
            return 'media';
          }
          // Other large vendor libraries get their own chunks
          if (id.includes('node_modules')) {
            // Group smaller vendor libraries together
            return 'vendor';
          }
        },
        // Optimize chunk names for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});
