import React, { useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
// Styles now imported globally via main.tsx
import { logWarn, logError, logDebug } from '../utils/logger';

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
  const scannerIdRef = useRef(
    `qr-scanner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );
  const isInitializingRef = useRef(false);
  const isMountedRef = useRef(true);
  const isCleaningUpRef = useRef(false);

  // Cleanup function with proper error handling
  const cleanup = useCallback(async () => {
    if (!html5QrCodeRef.current || isCleaningUpRef.current) return;

    isCleaningUpRef.current = true;

    try {
      // Check if scanner is in scanning state
      const state = html5QrCodeRef.current.getState();
      if (state === 2) {
        // Html5QrcodeScannerState.SCANNING
        await html5QrCodeRef.current.stop();
      }
    } catch (err) {
      // Suppress known stop errors
      const msg = String(err);
      if (
        !msg.includes('scanner is not running') &&
        !msg.includes('scanner is not running or paused') &&
        !msg.includes('Cannot stop, scanner is not running or paused.')
      ) {
        logWarn('QR Scanner stop error', 'QrScanner', err);
      }
    }

    try {
      // Clear the scanner
      html5QrCodeRef.current.clear();
    } catch (err) {
      // Suppress known clear errors
      const msg = String(err);
      if (!msg.includes('Cannot clear while scan is ongoing')) {
        logWarn('QR Scanner clear error', 'QrScanner', err);
      }
    }

    html5QrCodeRef.current = null;
    isCleaningUpRef.current = false;
  }, []);

  useEffect(() => {
    if (
      !scannerRef.current ||
      isInitializingRef.current ||
      !isMountedRef.current
    )
      return;

    // Clear any existing scanner first to prevent duplicates
    if (html5QrCodeRef.current) {
      cleanup();
    }

    isInitializingRef.current = true;
    isMountedRef.current = true;

    const html5QrCode = new Html5Qrcode(scannerIdRef.current);
    html5QrCodeRef.current = html5QrCode;

    // Initialize scanner with proper error handling for AbortError
    const initializeScanner = async () => {
      try {
        logDebug('Initializing QR Scanner', 'QrScanner', {
          userAgent: navigator.userAgent,
          protocol: window.location.protocol,
          isSecure:
            window.location.protocol === 'https:' ||
            window.location.hostname === 'localhost',
        });

        // Check if camera is available first
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access not supported in this browser');
        }

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps,
            qrbox: { width: qrbox, height: qrbox },
            aspectRatio: 1.0,
            disableFlip: false,
            // Add mobile-specific configurations
            videoConstraints: {
              facingMode: 'environment',
              width: { ideal: qrbox },
              height: { ideal: qrbox },
            },
          },
          decodedText => {
            logDebug('QR Code scanned', 'QrScanner', { decodedText });
            if (isMountedRef.current) {
              onScan(decodedText);
            }
          },
          errorMessage => {
            // Only report non-routine scanning errors
            if (
              isMountedRef.current &&
              onError &&
              !errorMessage.includes('NotFoundException') &&
              !errorMessage.includes('No MultiFormat Readers')
            ) {
              logWarn('QR Scan Error', 'QrScanner', { errorMessage });
              onError(new Error(errorMessage));
            }
          }
        );

        logDebug('QR Scanner initialized successfully', 'QrScanner');
      } catch (err) {
        logError('QR Scanner initialization failed', 'QrScanner', err);
        // Handle specific errors
        const errorMsg = String(err);
        if (
          errorMsg.includes('AbortError') ||
          errorMsg.includes('media was removed')
        ) {
          // This is expected when the component unmounts during initialization
          logDebug(
            'QR Scanner initialization aborted - component unmounted',
            'QrScanner'
          );
        } else if (isMountedRef.current && onError) {
          onError(err as Error);
        }
      } finally {
        isInitializingRef.current = false;
      }
    };

    initializeScanner();

    return () => {
      isMountedRef.current = false;
      isInitializingRef.current = false;
      cleanup();
    };
  }, [onScan, onError, fps, qrbox, cleanup]);

  return (
    <div
      id={scannerIdRef.current}
      ref={scannerRef}
      style={{
        width: qrbox,
        height: qrbox,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {/* Loading indicator while camera initializes */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#fff',
          fontSize: '14px',
          textAlign: 'center',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        <div>📷</div>
        <div style={{ marginTop: '8px', fontSize: '12px' }}>
          Loading camera...
        </div>
      </div>
    </div>
  );
};

export default QrScanner;
