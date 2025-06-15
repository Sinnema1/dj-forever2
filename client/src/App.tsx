import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./components/Navbar";
import HeroBanner from "./components/HeroBanner";

export default function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <HeroBanner />
        {/* TODO: Add Timeline, TheDetails, Gallery, WeddingParty, TravelGuide, FAQs, Registry, RSVP, Guestbook */}
      </main>
    </Router>
  );
}
