import { Routes, Route } from 'react-router-dom';
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
import { PWAInstallBanner } from './hooks/usePWAInstall';
import { PWAUpdateToast } from './hooks/usePWAUpdate';

export default function App() {
  return (
    <ErrorBoundary>
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
