import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import RSVPStandalonePage from "./pages/RSVPStandalonePage";
import RegistryStandalonePage from "./pages/RegistryStandalonePage";
import QRTokenLogin from "./pages/QRTokenLogin";
import InvitedRoute from "./components/InvitedRoute";
import PersonalizedWelcome from "./components/PersonalizedWelcome";

export default function App() {
  return (
    <>
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
        </Routes>
      </main>
    </>
  );
}
