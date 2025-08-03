import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { LOGIN_WITH_QR_TOKEN } from "../features/auth/graphql/loginWithQrToken";
import { useAuth } from "../context/AuthContext";
import QRHelpModal from "../components/QRHelpModal";
import { analytics } from "../utils/analytics";

const QRTokenLogin: React.FC = () => {
  const { qrToken } = useParams<{ qrToken: string }>();
  const [loginWithQrToken] = useMutation(LOGIN_WITH_QR_TOKEN);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    if (!qrToken) return;
    if (isLoggedIn) {
      navigate("/", { replace: true });
      return;
    }
    (async () => {
      try {
        const { data } = await loginWithQrToken({ variables: { qrToken } });
        const authToken = data?.loginWithQrToken?.token;
        const authUser = data?.loginWithQrToken?.user;
        if (!authToken || !authUser) throw new Error("Invalid QR login");
        localStorage.setItem("id_token", authToken);
        localStorage.setItem("user", JSON.stringify(authUser));

        // Track successful QR login
        analytics.trackQRLogin(authUser.id);

        // Redirect to success page instead of home
        navigate("/login/success", { replace: true });
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
        } else if (errorMessage.includes("Network Error")) {
          setError(
            "Unable to connect to the server. Please check your internet connection and try again."
          );
        } else {
          setError(
            "Login failed. Please try scanning your QR code again or contact the hosts for help."
          );
        }

        // Redirect after a longer delay to give user time to read the message
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 5000);
      }
    })();
  }, [qrToken, isLoggedIn, loginWithQrToken, navigate]);

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
          <button
            onClick={() => navigate("/")}
            style={{
              backgroundColor: "#4caf50",
              color: "white",
              border: "none",
              padding: "10px 15px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Go to Home Page Now
          </button>
          <button
            onClick={() => setShowHelpModal(true)}
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
      <h2>Logging you in...</h2>

      {/* Loading spinner */}
      <div
        style={{
          margin: "30px auto",
          width: "40px",
          height: "40px",
          border: "4px solid rgba(0, 0, 0, 0.1)",
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

      <p>If you are not redirected, please try scanning your QR code again.</p>

      <button
        onClick={() => setShowHelpModal(true)}
        style={{
          backgroundColor: "transparent",
          color: "#2196f3",
          border: "1px solid #2196f3",
          padding: "8px 15px",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
          marginTop: "20px",
        }}
      >
        Having trouble logging in?
      </button>

      {showHelpModal && <QRHelpModal onClose={() => setShowHelpModal(false)} />}
    </div>
  );
};

export default QRTokenLogin;
