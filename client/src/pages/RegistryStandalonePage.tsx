import React from "react";
import Registry from "./Registry";

const RegistryStandalonePage: React.FC = () => {
  return (
    <main className="standalone-page registry-page">
      <div className="container">
        <h1 className="section-title">Registry</h1>
        <Registry />
      </div>
    </main>
  );
};

export default RegistryStandalonePage;
