import React from "react";
import RSVPForm from "../components/RSVP/RSVPForm";
import { RSVPPageSEO } from "../components/SEO";

const RSVPStandalonePage: React.FC = () => {
  return (
    <>
      <RSVPPageSEO />
      <main className="standalone-page rsvp-standalone-page">
        <div className="rsvp-page-hero">
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title">Join Us in Celebration</h1>
              <p className="hero-subtitle">
                Your presence would make our special day even more meaningful.
                Please let us know if you'll be celebrating with us!
              </p>
              <div className="wedding-details">
                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <span>September 15, 2025</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🕐</span>
                  <span>4:00 PM Ceremony</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📍</span>
                  <span>The Garden Estate</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rsvp-form-section">
          <div className="container">
            <RSVPForm />
          </div>
        </div>
      </main>
    </>
  );
};

export default RSVPStandalonePage;
