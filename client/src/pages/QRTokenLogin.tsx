import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import QRHelpModal from "../components/QRHelpModal";
import { analytics } from "../utils/analytics";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

const QRTokenLogin: React.FC = () => {
  const { qrToken } = useParams<{ qrToken: string }>();
  const { isLoggedIn, loginWithQrToken, user } = useAuth();
  const { isOnline, isConnecting } = useNetworkStatus();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (!qrToken) return;
    if (isLoggedIn) {
      navigate("/", { replace: true });
      return;
    }

    // Wait for network connection before attempting login
    if (!isOnline && !isConnecting) {
      setError("No internet connection. Please check your connection and try again.");
      return;
    }

    if (!isOnline && isConnecting) {
      // Don't start login while reconnecting
      return;
    }

    const attemptLogin = async () => {
      try {
        console.log("QRTokenLogin: Starting login with token:", qrToken);

        // Use AuthContext's loginWithQrToken instead of direct mutation
        await loginWithQrToken(qrToken);

        console.log("QRTokenLogin: Login successful, user state:", user);

        // Track successful QR login
        analytics.trackQRLogin(qrToken);

        // Small delay to ensure AuthContext state is updated
        await new Promise((resolve) => setTimeout(resolve, 100));

        console.log("QRTokenLogin: Redirecting directly to home");

        // Redirect directly to home - no success page needed
        navigate("/", { replace: true });
      } catch (err) {
        // Provide more specific error messages based on the error
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";

        console.error("QR Login error:", errorMessage);

        // Track login error
        analytics.trackError(`QR Login failed: ${errorMessage}`, "qr-login");

        // Show user-friendly error message
        if (errorMessage.includes("Invalid QR token")) {
          setError(
            "This QR code is invalid or has expired. Please contact the hosts if you need assistance."
          );
        } else if (errorMessage.includes("Network Error") || !navigator.onLine) {
          setError(
            "Unable to connect to the server. Please check your internet connection and try again."
          );
        } else {
          setError(
            "Login failed. Please try scanning your QR code again or contact the hosts for help."
          );
        }

        // Don't auto-redirect on error - let user choose
      }
    };

    attemptLogin();
  }, [qrToken, isLoggedIn, loginWithQrToken, navigate, isOnline, isConnecting, user]);

  // Retry function for network errors
  const handleRetry = async () => {
    if (!qrToken || !isOnline) return;
    
    setIsRetrying(true);
    setError(null);
    
    try {
      await loginWithQrToken(qrToken);
      navigate("/", { replace: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage.includes("Network Error") || !navigator.onLine 
        ? "Still unable to connect. Please check your internet connection."
        : "Login failed. Please try scanning your QR code again."
      );
    } finally {
      setIsRetrying(false);
    }
  };

  if (error) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: 80,
          padding: "0 20px",
          maxWidth: "600px",
          margin: "80px auto",
        }}
      >
        <h2 style={{ color: "#d32f2f" }}>Login Failed</h2>
        <div
          style={{
            backgroundColor: "rgba(211, 47, 47, 0.1)",
            padding: "15px",
            borderRadius: "4px",
            margin: "20px 0",
          }}
        >
          <p style={{ margin: 0 }}>{error}</p>
        </div>
        <p>Redirecting to home page in a few seconds...</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
          {!isOnline ? (
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: "#ff9800",
                color: "white",
                border: "none",
                padding: "10px 15px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Check Connection
            </button>
          ) : (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              style={{
                backgroundColor: isRetrying ? "#ccc" : "#4caf50",
                color: "white",
                border: "none",
                padding: "10px 15px",
                borderRadius: "4px",
                cursor: isRetrying ? "not-allowed" : "pointer",
                fontSize: "16px",
              }}
            >
              {isRetrying ? "Retrying..." : "Try Again"}
            </button>
          )}
          <button
            onClick={() => navigate("/")}
            style={{
              backgroundColor: "#2196f3",
              color: "white",
              border: "none",
              padding: "10px 15px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Go to Home Page
          </button>
          <button
            onClick={() => setShowHelpModal(true)}
            style={{
              backgroundColor: "#9e9e9e",
              color: "white",
              border: "none",
              padding: "10px 15px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Need Help?
          </button>
        </div>

        {showHelpModal && (
          <QRHelpModal onClose={() => setShowHelpModal(false)} />
        )}
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: 80, padding: "0 20px" }}>
      {/* Minimal loading indicator - just show we're working */}
      <div
        style={{
          margin: "50px auto",
          width: "32px",
          height: "32px",
          border: "3px solid rgba(0, 0, 0, 0.1)",
          borderLeftColor: "#4caf50",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Only show help if there's a delay */}
      <button
        onClick={() => setShowHelpModal(true)}
        style={{
          backgroundColor: "transparent",
          color: "#999",
          border: "1px solid #ddd",
          padding: "6px 12px",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "12px",
          marginTop: "40px",
        }}
      >
        Having trouble?
      </button>

      {showHelpModal && <QRHelpModal onClose={() => setShowHelpModal(false)} />}
    </div>
  );
};

export default QRTokenLogin;
