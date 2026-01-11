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
      // AUTO UPDATE: Updates happen automatically without user intervention
      // This provides the best UX for wedding guests - no confusing notifications
      registerType: 'autoUpdate',
      // Let Workbox handle all assets automatically via globPatterns
      devOptions: {
        enabled: false, // Disabled for faster dev - enable only for PWA testing
      },
      manifest: {
        id: '/',
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
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
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
        globPatterns: [
          '**/*.{js,css,html,webmanifest}',
          'assets/**/*.{png,svg,jpg,jpeg,webp}',
          'images/**/*.{png,svg,jpg,jpeg,webp}',
          // Note: offline.html is included via *.html glob pattern above
        ],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        // AUTOMATIC UPDATE CONFIGURATION
        skipWaiting: true, // New SW takes control immediately
        clientsClaim: true, // SW controls all clients immediately
        cleanupOutdatedCaches: true,
        // Enhanced PWA capabilities
        ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^v$/, /^_/],
        dontCacheBustURLsMatching: /\.\w{8}\./,
        // Explicitly exclude files to prevent double inclusion
        globIgnores: ['**/node_modules/**/*'],
        // Enable offline fallback for navigation requests
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [
          /^\/(graphql|api)/, // Exclude API routes
          /\.[^/]+$/, // Exclude direct file requests
          /^\/(admin|rsvp|login|registry|qr-help|auth-debug)/, // Exclude all SPA routes (React Router handles these)
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
      },
    }),
    // Bundle analyzer (multiple templates for comprehensive analysis)
    process.env.ANALYZE === 'true' &&
      visualizer({
        filename: 'dist/bundle-analysis.html',
        open: false, // Don't auto-open to avoid browser dependency
        gzipSize: true,
        brotliSize: true,
        template: 'treemap', // Best for identifying large chunks
        title: 'Bundle Analysis - DJ Forever 2 Wedding Site',
      }),

    // Generate additional analysis formats
    process.env.ANALYZE === 'true' &&
      visualizer({
        filename: 'dist/bundle-sunburst.html',
        template: 'sunburst', // Good for hierarchical view
        gzipSize: true,
        brotliSize: true,
        title: 'Bundle Hierarchy Analysis',
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
    // Performance Budget Configuration
    chunkSizeWarningLimit: 400, // Stricter limit for better performance (was 500KB)

    // Enhanced build optimizations for smaller bundles
    minify: 'esbuild', // Fastest and most efficient minifier
    reportCompressedSize: true, // Report compressed bundle sizes

    // CSS optimization
    cssMinify: 'esbuild',
    cssCodeSplit: true, // Split CSS per route/chunk
    rollupOptions: {
      // Enhanced tree-shaking configuration (more conservative)
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: 'no-external', // Less aggressive - keep side effects for internal modules
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },

      onwarn(warning, warn) {
        // Performance budget warnings
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        if (warning.code === 'THIS_IS_UNDEFINED') return;
        if (warning.code === 'EVAL') return; // Suppress eval warnings for dev tools
        warn(warning);
      },
      output: {
        // Smart per-package chunking for optimal bundle splitting
        manualChunks(id) {
          if (!id) return;

          if (id.includes('node_modules')) {
            // Apollo and GraphQL grouped together (work best as single chunk)
            if (id.includes('@apollo/client') || id.includes('graphql')) {
              return 'apollo';
            }

            // Split React packages more granularly for better caching
            if (
              id.includes('react-router-dom') ||
              id.includes('react-router')
            ) {
              return 'vendor-react-router';
            }

            // React core (react + react-dom)
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }

            // React helmet
            if (id.includes('react-helmet-async')) {
              return 'vendor-react-helmet';
            }

            // Isolate react-icons (can be surprisingly large)
            if (id.includes('react-icons')) {
              return 'vendor-react-icons';
            }

            // Web vitals and QR code scanner
            if (id.includes('web-vitals') || id.includes('html5-qrcode')) {
              return 'vendor-utils';
            }

            // Default: create per-package vendor chunk to prevent monolithic bundles
            const parts = id.split('node_modules/')[1].split('/');
            const pkg = parts[0].startsWith('@')
              ? `${parts[0]}/${parts[1]}`
              : parts[0];
            // Sanitize package name for valid filenames
            return `vendor-${pkg.replace('@', '').replace('/', '-')}`;
          }
        },
        // Performance optimization
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: assetInfo => {
          const extType = assetInfo.name?.split('.').pop();
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType ?? '')) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(extType ?? '')) {
            return `assets/styles/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
  },
});
