import React from 'react';
import RSVPForm from '../components/RSVP/RSVPForm';
import { RSVPPageSEO } from '../components/SEO';

const RSVPStandalonePage: React.FC = () => {
  return (
    <>
      <RSVPPageSEO />
      <main className="standalone-page rsvp-standalone-page">
        <div className="rsvp-page">
          <div className="rsvp-page-hero">
            <h1 className="rsvp-title">Join Us in Celebration</h1>
            <p className="rsvp-philosophy">
              Your presence would make our special day even more meaningful.
              <br />
              Please let us know if you'll be celebrating with us!
            </p>
            <div className="rsvp-divider" aria-hidden="true" />
          </div>
          <RSVPForm />
        </div>
      </main>
    </>
  );
};

export default RSVPStandalonePage;
