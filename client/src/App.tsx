import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import RSVPStandalonePage from "./pages/RSVPStandalonePage";
import RegistryStandalonePage from "./pages/RegistryStandalonePage";
import QRTokenLogin from "./pages/QRTokenLogin";
import LoginSuccess from "./pages/LoginSuccess";
import QRInfoPage from "./pages/QRInfoPage";
import InvitedRoute from "./components/InvitedRoute";
import PersonalizedWelcome from "./components/PersonalizedWelcome";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <Navbar />
      <PersonalizedWelcome />
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
