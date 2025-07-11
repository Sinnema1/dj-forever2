import React from "react";
import RSVPForm from "../components/RSVP/RSVPForm";

const RSVPStandalonePage: React.FC = () => {
  return (
    <main className="standalone-page rsvp-page">
      <div className="container">
        <h1 className="section-title">RSVP</h1>
        <RSVPForm />
      </div>
    </main>
  );
};

export default RSVPStandalonePage;
