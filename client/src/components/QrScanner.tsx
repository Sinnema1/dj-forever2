import React, { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QrScannerProps {
  onScan: (result: string) => void;
  onError?: (error: Error) => void;
  fps?: number;
  qrbox?: number;
}

const QrScanner: React.FC<QrScannerProps> = ({
  onScan,
  onError,
  fps = 10,
  qrbox = 250,
}) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!scannerRef.current) return;
    const html5QrCode = new Html5Qrcode(scannerRef.current.id);
    html5QrCodeRef.current = html5QrCode;

    html5QrCode
      .start(
        { facingMode: "environment" },
        {
          fps,
          qrbox,
        },
        (decodedText) => {
          onScan(decodedText);
        },
        (errorMessage) => {
          if (onError) onError(new Error(errorMessage));
        }
      )
      .catch((err) => {
        if (onError) onError(err);
      });

    return () => {
      // Only call stop if scanner is running
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop().catch((err) => {
            // Suppress known error from html5-qrcode when scanner is not running or paused
            const msg = String(err);
            if (
              msg.includes("scanner is not running") ||
              msg.includes("scanner is not running or paused") ||
              msg.includes("Cannot stop, scanner is not running or paused.")
            ) {
              // Ignore
              return;
            }
            if (onError) onError(err);
          });
        } catch (err) {
          // Suppress synchronous errors as well
          const msg = String(err);
          if (
            msg.includes("scanner is not running") ||
            msg.includes("scanner is not running or paused") ||
            msg.includes("Cannot stop, scanner is not running or paused.")
          ) {
            // Ignore
          } else if (onError) onError(err as Error);
        }
        html5QrCodeRef.current.clear();
      }
    };
  }, [onScan, onError, fps, qrbox]);

  return (
    <div
      id="qr-scanner"
      ref={scannerRef}
      style={{ width: qrbox, height: qrbox }}
    />
  );
};

export default QrScanner;
