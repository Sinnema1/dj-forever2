import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import RSVPStandalonePage from "./pages/RSVPStandalonePage";
import RegistryStandalonePage from "./pages/RegistryStandalonePage";
import InvitedRoute from "./components/InvitedRoute";

export default function App() {
  return (
    <>
      <Navbar />
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
        </Routes>
      </main>
    </>
  );
}
