import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

interface QRLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  testScanValue?: string; // For testing only
}

const QRLoginModal: React.FC<QRLoginModalProps> = (props) => {
  const { isOpen, onClose, onLoginSuccess, testScanValue } = props;
  // For testing: simulate a scan if testScanValue is provided
  React.useEffect(() => {
    if (testScanValue) {
      handleTokenSubmit(testScanValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testScanValue]);

  const { loginWithQrToken } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenInput, setTokenInput] = useState("");

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setError("");
      setLoading(false);
      setTokenInput("");
      // Lock body scroll on mobile
      document.body.classList.add("modal-open");
    } else {
      // Unlock body scroll
      document.body.classList.remove("modal-open");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTokenSubmit = async (token: string) => {
    if (!token.trim() || loading) return;

    setLoading(true);
    setError("");

    try {
      await loginWithQrToken(token.trim());
      setTimeout(() => {
        onLoginSuccess();
        onClose();
      }, 800);
    } catch (err: any) {
      setError(
        err.message || "Login failed. Please check your token and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTokenSubmit(tokenInput);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-login-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close QR login modal"
        >
          &times;
        </button>
        <h2 id="qr-login-title">Login with QR Code</h2>

        <div style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              backgroundColor: "#e8f5e8",
              border: "1px solid #4caf50",
              padding: "1.5rem",
              borderRadius: "8px",
            }}
          >
            <h3
              style={{
                margin: "0 0 0.75rem 0",
                fontSize: "1.1rem",
                color: "#2e7d32",
              }}
            >
              📱 Easy QR Code Login
            </h3>
            <p
              style={{
                margin: "0 0 0.75rem 0",
                fontSize: "0.95rem",
                lineHeight: "1.5",
              }}
            >
              <strong>Recommended:</strong> Use your phone's camera app to scan
              the QR code on your invitation. It will automatically open this
              website and log you in!
            </p>
            <p style={{ margin: "0", fontSize: "0.9rem", color: "#555" }}>
              Or enter your QR token manually below:
            </p>
          </div>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label
            htmlFor="token-input"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "600",
              fontSize: "1rem",
            }}
          >
            Enter Your QR Token:
          </label>
          <input
            id="token-input"
            type="text"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type or paste your token here..."
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "2px solid #ddd",
              borderRadius: "6px",
              fontSize: "1rem",
              marginBottom: "0.75rem",
              outline: "none",
              transition: "border-color 0.2s",
              ...(tokenInput && { borderColor: "#4caf50" }),
            }}
            autoFocus
          />
          <button
            onClick={() => handleTokenSubmit(tokenInput)}
            disabled={!tokenInput.trim() || loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: loading ? "#ccc" : "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: loading || !tokenInput.trim() ? "not-allowed" : "pointer",
              transition: "background-color 0.2s",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        {loading && (
          <div className="modal-status" aria-live="polite">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  border: "2px solid #f3f3f3",
                  borderTop: "2px solid #4caf50",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              ></div>
              Verifying your token...
            </div>
          </div>
        )}

        {/* Quick test section for development */}
        {process.env.NODE_ENV === "development" && (
          <details style={{ marginTop: "1rem", fontSize: "0.85rem" }}>
            <summary style={{ cursor: "pointer", color: "#666" }}>
              🧪 Developer Testing
            </summary>
            <div
              style={{
                marginTop: "0.5rem",
                padding: "0.5rem",
                backgroundColor: "#f8f8f8",
                borderRadius: "4px",
              }}
            >
              <p style={{ margin: "0 0 0.5rem 0" }}>Quick test tokens:</p>
              <button
                onClick={() => handleTokenSubmit("r24gpj3wntgqwqfberlas")}
                disabled={loading}
                style={{
                  margin: "2px",
                  padding: "4px 8px",
                  fontSize: "0.8rem",
                  backgroundColor: loading ? "#f0f0f0" : "#e0e0e0",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                title="Alice Johnson"
              >
                Alice
              </button>
              <button
                onClick={() => handleTokenSubmit("ssq7b7bkfqqpd2724vlcol")}
                disabled={loading}
                style={{
                  margin: "2px",
                  padding: "4px 8px",
                  fontSize: "0.8rem",
                  backgroundColor: loading ? "#f0f0f0" : "#e0e0e0",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                title="Bob Smith"
              >
                Bob
              </button>
              <button
                onClick={() => handleTokenSubmit("ss0qx6mg20f2qaiyl9hnl7")}
                disabled={loading}
                style={{
                  margin: "2px",
                  padding: "4px 8px",
                  fontSize: "0.8rem",
                  backgroundColor: loading ? "#f0f0f0" : "#e0e0e0",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                title="Charlie Williams"
              >
                Charlie
              </button>
            </div>
          </details>
        )}

        <div className="qr-instructions">
          <p>
            <strong>Where to find your QR token:</strong>
          </p>
          <ul>
            <li>Check your wedding invitation for a QR code</li>
            <li>The token is also printed on your save-the-date card</li>
            <li>
              Each family/guest has a unique token for personalized access
            </li>
          </ul>
          <p style={{ fontSize: "0.9rem", color: "#666", fontStyle: "italic" }}>
            Need help? Contact us if you can't find your invitation or token.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default QRLoginModal;
