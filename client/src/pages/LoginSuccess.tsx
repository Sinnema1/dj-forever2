import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginSuccess: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Redirect to home after countdown
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate('/');
    }
    return; // Satisfy TypeScript strict mode
  }, [countdown, navigate]);

  return (
    <div className="login-success-container">
      <div className="login-success-icon">✓</div>

      <h1 className="login-success-title">Login Successful!</h1>

      {user && (
        <h2 className="login-success-welcome">Welcome, {user.fullName}!</h2>
      )}

      <p className="login-success-message">
        Thank you for scanning your invitation QR code.
      </p>

      <p className="login-success-countdown">
        Redirecting to the wedding website in {countdown} seconds...
      </p>

      <button onClick={() => navigate('/')} className="login-success-button">
        Go to Wedding Website Now
      </button>
    </div>
  );
};

export default LoginSuccess;
