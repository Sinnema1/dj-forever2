import { Routes, Route } from 'react-router-dom';
import { useEffect, lazy } from 'react';
import { smoothScroll } from './utils/smoothScroll';
import Navbar from './components/Navbar';
import EnhancedSuspense from './components/EnhancedSuspense';
import HomePage from './pages/HomePage';
import RSVPStandalonePage from './pages/RSVPStandalonePage';
import RegistryStandalonePage from './pages/RegistryStandalonePage';
import QRTokenLogin from './pages/QRTokenLogin';
import LoginSuccess from './pages/LoginSuccess';
import QRInfoPage from './pages/QRInfoPage';
import NotFoundPage from './pages/NotFoundPage';

// Lazy-load AuthDebug — only available in development builds
const AuthDebug = lazy(() => import('./pages/AuthDebug'));
import InvitedRoute from './components/InvitedRoute';
import AdminRoute from './components/AdminRoute';
import PersonalizedWelcome from './components/PersonalizedWelcome';
import WelcomeModal from './components/WelcomeModal';
import ErrorBoundary from './components/ErrorBoundary';
import ConnectionStatus from './components/ConnectionStatus';
import PerformanceMonitor from './components/PerformanceMonitor';
import { ToastProvider } from './context/ToastContext';
import { PWAInstallBanner } from './hooks/usePWAInstall';
// import { PWAUpdateToast } from './hooks/usePWAUpdate'; // Disabled: autoUpdate configured in Vite
import performanceMonitor from './services/performanceMonitor';

// Lazy load admin page (only accessed by admins, reduces main bundle)
const AdminPage = lazy(() => import('./pages/AdminPage'));

/**
 * App - Main Application Component
 *
 * The root component for DJ Forever 2 wedding website. Provides the main
 * application structure with routing, authentication, error boundaries, and
 * performance monitoring. Features QR-code-only authentication and progressive
 * web app capabilities.
 *
 * @features
 * - **QR-Only Authentication**: No passwords - guests scan unique QR codes
 * - **Progressive Web App**: Installable with offline capabilities
 * - **Performance Monitoring**: Core Web Vitals tracking and analytics
 * - **Error Boundaries**: Comprehensive error handling and reporting
 * - **Responsive Design**: Mobile-first with desktop enhancements
 * - **Protected Routes**: RSVP access limited to invited guests only
 * - **Real-time Status**: Connection status and update notifications
 * - **Personalization**: Dynamic content based on guest authentication
 * - **React 18+ Concurrent Features**: Enhanced Suspense boundaries for all routes
 * - **Concurrent Rendering**: Optimized for React 18+ automatic batching and transitions
 *
 * @architecture
 * - Uses React Router for client-side routing
 * - Wrapped in ErrorBoundary for comprehensive error handling
 * - AuthProvider context provides authentication throughout the app
 * - ApolloProvider handles GraphQL state management
 * - Performance monitoring tracks user experience metrics
 *
 * @routes
 * - `/` - Main wedding website with all sections
 * - `/rsvp` - Protected RSVP form (invited guests only)
 * - `/registry` - Wedding registry links
 * - `/login/qr/:qrToken` - QR code authentication endpoint
 * - `/login/success` - Post-authentication confirmation
 * - `/qr-help` - QR code troubleshooting and help
 *
 * @component
 * @example
 * ```tsx
 * // App is wrapped with providers in main.tsx
 * <AuthProvider>
 *   <ApolloProvider client={apolloClient}>
 *     <App />
 *   </ApolloProvider>
 * </AuthProvider>
 * ```
 *
 * @dependencies
 * - `React Router` - Client-side routing and navigation
 * - `AuthProvider` - Authentication context and state management
 * - `ErrorBoundary` - Error handling and fallback UI
 * - `PerformanceMonitor` - Core Web Vitals and performance tracking
 * - `PWA Hooks` - Progressive Web App install notifications (updates handled automatically)
 */
export default function App() {
  // Track app initialization performance
  useEffect(() => {
    performanceMonitor.markStart('app-initialization');
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        {/* Skip Links for Keyboard Navigation - WCAG 2.4.1 (Bypass Blocks) */}
        <a
          href="#main-content"
          className="skip-link"
          onClick={e => {
            e.preventDefault();
            smoothScroll('main-content', 20);
          }}
        >
          Skip to main content
        </a>
        <a
          href="#navigation"
          className="skip-link"
          onClick={e => {
            e.preventDefault();
            smoothScroll('navigation', 20);
          }}
        >
          Skip to navigation
        </a>

        {/* Performance monitoring - tracks Core Web Vitals */}
        <PerformanceMonitor debug={import.meta.env?.DEV || false} />

        <ConnectionStatus />
        <PWAInstallBanner />
        {/* <PWAUpdateToast /> - Disabled: autoUpdate configured in Vite handles updates automatically */}
        <Navbar />
        <PersonalizedWelcome />
        <WelcomeModal />
        <main id="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <EnhancedSuspense
                  name="homepage"
                  loadingMessage="Loading our wedding website..."
                  enhanced
                >
                  <HomePage />
                </EnhancedSuspense>
              }
            />
            <Route
              path="/rsvp"
              element={
                <InvitedRoute>
                  <EnhancedSuspense
                    name="rsvp-page"
                    loadingMessage="Loading RSVP form..."
                    enhanced
                  >
                    <RSVPStandalonePage />
                  </EnhancedSuspense>
                </InvitedRoute>
              }
            />
            <Route
              path="/registry"
              element={
                <EnhancedSuspense
                  name="registry-page"
                  loadingMessage="Loading registry information..."
                  enhanced
                >
                  <RegistryStandalonePage />
                </EnhancedSuspense>
              }
            />
            <Route
              path="/login/qr/:qrToken"
              element={
                <EnhancedSuspense
                  name="qr-login"
                  loadingMessage="Processing QR authentication..."
                  enhanced
                >
                  <QRTokenLogin />
                </EnhancedSuspense>
              }
            />
            <Route
              path="/login/success"
              element={
                <EnhancedSuspense
                  name="login-success"
                  loadingMessage="Confirming authentication..."
                  enhanced
                >
                  <LoginSuccess />
                </EnhancedSuspense>
              }
            />
            <Route
              path="/qr-help"
              element={
                <EnhancedSuspense
                  name="qr-help"
                  loadingMessage="Loading help information..."
                  enhanced
                >
                  <QRInfoPage />
                </EnhancedSuspense>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <EnhancedSuspense
                    name="admin-dashboard"
                    loadingMessage="Loading admin dashboard..."
                    enhanced
                  >
                    <AdminPage />
                  </EnhancedSuspense>
                </AdminRoute>
              }
            />
            {/* Auth debug route — DEV only, tree-shaken from production builds */}
            {import.meta.env.DEV && (
              <Route
                path="/auth-debug"
                element={
                  <EnhancedSuspense
                    name="auth-debug"
                    loadingMessage="Loading debug info..."
                    enhanced={false}
                  >
                    <AuthDebug />
                  </EnhancedSuspense>
                }
              />
            )}
            {/* Catch-all 404 route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </ToastProvider>
    </ErrorBoundary>
  );
}
