import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import RSVPStandalonePage from './pages/RSVPStandalonePage';
import RegistryStandalonePage from './pages/RegistryStandalonePage';
import QRTokenLogin from './pages/QRTokenLogin';
import LoginSuccess from './pages/LoginSuccess';
import QRInfoPage from './pages/QRInfoPage';
import InvitedRoute from './components/InvitedRoute';
import PersonalizedWelcome from './components/PersonalizedWelcome';
import WelcomeModal from './components/WelcomeModal';
import ErrorBoundary from './components/ErrorBoundary';
import ConnectionStatus from './components/ConnectionStatus';
import PerformanceMonitor from './components/PerformanceMonitor';
import { PWAInstallBanner } from './hooks/usePWAInstall';
import { PWAUpdateToast } from './hooks/usePWAUpdate';
import performanceMonitor from './services/performanceMonitor';

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
 * - `PWA Hooks` - Progressive Web App install and update notifications
 */
export default function App() {
  // Track app initialization performance
  useEffect(() => {
    performanceMonitor.markStart('app-initialization');
  }, []);

  return (
    <ErrorBoundary>
      {/* Performance monitoring - tracks Core Web Vitals */}
      <PerformanceMonitor debug={import.meta.env?.DEV || false} />

      <ConnectionStatus />
      <PWAInstallBanner />
      <PWAUpdateToast />
      <Navbar />
      <PersonalizedWelcome />
      <WelcomeModal />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/rsvp"
            element={
              <InvitedRoute>
                <RSVPStandalonePage />
              </InvitedRoute>
            }
          />
          <Route path="/registry" element={<RegistryStandalonePage />} />
          <Route path="/login/qr/:qrToken" element={<QRTokenLogin />} />
          <Route path="/login/success" element={<LoginSuccess />} />
          <Route path="/qr-help" element={<QRInfoPage />} />
        </Routes>
      </main>
    </ErrorBoundary>
  );
}
