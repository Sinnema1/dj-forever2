import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import QrScanner from "./QrScanner";

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
      handleScan(testScanValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testScanValue]);
  const { loginWithQrToken } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);

  if (!isOpen) return null;

  const handleScan = async (data: string) => {
    if (data && !scanned) {
      setScanned(true);
      setLoading(true);
      setError("");
      try {
        await loginWithQrToken(data);
        setTimeout(() => {
          onLoginSuccess();
          onClose();
        }, 800);
      } catch (err: any) {
        setError(err.message || "Login failed");
        setScanned(false);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleError = (err: Error) => {
    setError("Camera error: " + (err?.message || err));
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
        <h2 id="qr-login-title">Scan QR Code to Login</h2>
        <QrScanner onScan={handleScan} onError={handleError} qrbox={250} />
        {loading && (
          <div className="modal-status" aria-live="polite">
            Logging in...
          </div>
        )}
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        {!loading && !error && scanned && (
          <div className="modal-status success" aria-live="polite">
            Login successful! Redirecting...
          </div>
        )}
        <p>Point your camera at your invitation QR code.</p>
      </div>
    </div>
  );
};

export default QRLoginModal;
