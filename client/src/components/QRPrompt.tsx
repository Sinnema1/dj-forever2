import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import '../assets/qr-prompt.css';

const QRPrompt: React.FC = () => {
  const { isLoggedIn } = useAuth();
  
  // If already logged in, redirect to home
  if (isLoggedIn) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="qr-prompt-container">
      <div className="qr-prompt-content">
        <h2>Login Required</h2>
        <p>To access this content, please scan your invitation QR code.</p>
        <div className="qr-instructions">
          <div className="instruction-step">
            <div className="step-number">1</div>
            <p>Find your save-the-date invitation</p>
          </div>
          <div className="instruction-step">
            <div className="step-number">2</div>
            <p>Locate the QR code on the invitation</p>
          </div>
          <div className="instruction-step">
            <div className="step-number">3</div>
            <p>Use your phone's camera to scan the code</p>
          </div>
        </div>
        <p className="qr-help-text">
          Need help? Contact us if you can't find your invitation.
        </p>
      </div>
    </div>
  );
};

export default QRPrompt;
