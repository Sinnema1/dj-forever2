import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
      navigate("/");
    }
  }, [countdown, navigate]);

  return (
    <div
      style={{
        textAlign: "center",
        maxWidth: "600px",
        margin: "80px auto",
        padding: "30px 20px",
        backgroundColor: "#f8f8f8",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          backgroundColor: "#4caf50",
          color: "white",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          fontSize: "30px",
        }}
      >
        ✓
      </div>

      <h1 style={{ color: "#4caf50" }}>Login Successful!</h1>

      {user && (
        <h2 style={{ fontWeight: "normal" }}>Welcome, {user.fullName}!</h2>
      )}

      <p style={{ fontSize: "18px", margin: "20px 0" }}>
        Thank you for scanning your invitation QR code.
      </p>

      <p>Redirecting to the wedding website in {countdown} seconds...</p>

      <button
        onClick={() => navigate("/")}
        style={{
          backgroundColor: "#4caf50",
          color: "white",
          border: "none",
          padding: "12px 24px",
          borderRadius: "4px",
          fontSize: "16px",
          cursor: "pointer",
          marginTop: "20px",
        }}
      >
        Go to Wedding Website Now
      </button>
    </div>
  );
};

export default LoginSuccess;
