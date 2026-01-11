import React from 'react';
import Registry from './Registry';
import { RegistryPageSEO } from '../components/SEO';

const RegistryStandalonePage: React.FC = () => {
  return (
    <>
      <RegistryPageSEO />
      <main className="standalone-page registry-standalone-page">
        <Registry />
      </main>
    </>
  );
};

export default RegistryStandalonePage;
