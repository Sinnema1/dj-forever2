import React from 'react';
import Registry from './Registry';
import { RegistryPageSEO } from '../components/SEO';
// Styles now imported globally via main.tsx

const RegistryStandalonePage: React.FC = () => {
  return (
    <>
      <RegistryPageSEO />
      <main className="standalone-page registry-standalone-page">
        <div className="registry-page-hero">
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title">Wedding Registry</h1>
              <p className="hero-subtitle">
                Your presence at our wedding is the greatest gift of all. If you
                wish to honor us with a gift, we&apos;ve registered at a few of
                our favorite places.
              </p>
              <div className="wedding-details">
                <div className="detail-item">
                  <span className="detail-icon">💕</span>
                  <span>Thank you for celebrating with us!</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="registry-content-section">
          <div className="container">
            <Registry />
          </div>
        </div>
      </main>
    </>
  );
};

export default RegistryStandalonePage;
