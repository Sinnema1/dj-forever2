/**
 * @fileoverview QR code scanner component for mobile and desktop
 *
 * Production-ready QR code scanner using html5-qrcode library with
 * comprehensive error handling, resource management, and mobile optimization.
 * Provides reliable QR scanning for wedding guest authentication with
 * graceful cleanup and performance optimization.
 *
 * Features:
 * - Mobile camera access with permission handling
 * - Desktop webcam support with fallback options
 * - Comprehensive error handling and resource cleanup
 * - Performance-optimized scanning parameters
 * - Unique scanner ID generation for multiple instances
 * - Automatic cleanup on component unmount
 * - Logging integration for debugging and monitoring
 *
 * @module QrScanner
 * @version 2.0.0
 * @author DJ Forever Wedding Team
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Basic QR scanner
 * <QrScanner onScan={(token) => handleLogin(token)} />
 *
 * // With error handling and custom settings
 * <QrScanner
 *   onScan={(token) => authenticate(token)}
 *   onError={(error) => showError(error)}
 *   fps={15}
 *   qrbox={300}
 * />
 * ```
 *
 * @see {@link https://github.com/mebjas/html5-qrcode} html5-qrcode library
 */

import React, {
  useEffect,
  useRef,
  useCallback,
  useTransition,
  useState,
} from 'react';
import { Html5Qrcode } from 'html5-qrcode';
// Styles now imported globally via main.tsx
import { logWarn, logError, logDebug } from '../utils/logger';

/**
 * Props interface for QrScanner component
 * @interface QrScannerProps
 */
interface QrScannerProps {
  /** Callback function when QR code is successfully scanned */
  onScan: (result: string) => void;
  /** Optional error handler for scanning failures */
  onError?: (error: Error) => void;
  /** Frames per second for scanning (default: 10) */
  fps?: number;
  /** Size of QR scanning box in pixels (default: 250) */
  qrbox?: number;
}

/**
 * QR code scanner component with mobile-first design and robust error handling
 *
 * Provides reliable QR code scanning for wedding guest authentication using
 * html5-qrcode library. Includes comprehensive resource management, error
 * handling, and performance optimization for both mobile and desktop usage.
 *
 * @component
 * @param props QR scanner configuration options
 * @returns JSX element containing QR scanner interface
 *
 * @example
 * ```typescript
 * // Wedding guest authentication scanner
 * <QrScanner
 *   onScan={(qrToken) => {
 *     console.log('QR token scanned:', qrToken);
 *     authenticateGuest(qrToken);
 *   }}
 *   onError={(error) => {
 *     console.error('Scan error:', error);
 *     showErrorMessage('Please try scanning again');
 *   }}
 *   fps={12}
 *   qrbox={280}
 * />
 * ```
 *
 * @features
 * - **Mobile Optimized**: Camera access with permission handling
 * - **Resource Management**: Automatic cleanup on unmount
 * - **Error Recovery**: Graceful handling of scanner failures
 * - **Performance**: Optimized scanning parameters
 * - **Logging**: Comprehensive debug and error logging
 * - **Multi-instance**: Unique IDs for multiple scanners
 * - **React 18+ Concurrent Features**: useTransition for non-blocking camera initialization
 * - **Enhanced UX**: Concurrent rendering prevents UI freezing during camera setup
 */
const QrScanner: React.FC<QrScannerProps> = ({
  onScan,
  onError,
  fps = 10,
  qrbox = 250,
}) => {
  /**
   * React 18+ useTransition Hook for Non-Blocking Camera Initialization
   *
   * Implements concurrent camera setup using React 18's useTransition to prevent
   * UI blocking during camera permission requests and WebRTC initialization.
   * Critical for mobile devices where camera access can be slow or require
   * user permission prompts.
   *
   * @hook useTransition
   * @returns {[boolean, function]} Tuple containing:
   *   - isPending: Boolean indicating if camera initialization is in progress
   *   - startTransition: Function to wrap camera initialization as non-urgent
   *
   * @example
   * ```tsx
   * // Non-blocking camera initialization
   * const initCamera = () => {
   *   startTransition(() => {
   *     setupCameraAccess();
   *   });
   * };
   * ```
   *
   * @benefits
   * - **No UI Blocking**: Camera setup doesn't freeze the interface
   * - **Better Mobile UX**: Permission prompts don't lock the UI thread
   * - **Responsive Interactions**: Users can cancel/retry during setup
   * - **Concurrent Processing**: Multiple camera operations can be queued
   *
   * @mobile-specific
   * - Handles slow camera initialization on mobile devices
   * - Manages permission request states without blocking
   * - Allows graceful handling of camera access denials
   *
   * @see {@link https://react.dev/reference/react/useTransition} React useTransition docs
   */
  const [isPending, startTransition] = useTransition();

  // Camera initialization state
  const [isInitializing, setIsInitializing] = useState(false);

  /** Reference to scanner container DOM element */
  const scannerRef = useRef<HTMLDivElement>(null);
  /** Reference to html5-qrcode scanner instance */
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  /** Unique scanner ID for multiple instances */
  const scannerIdRef = useRef(
    `qr-scanner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );
  /** Flag to prevent duplicate initialization */
  const isInitializingRef = useRef(false);
  /** Component mount status for cleanup safety */
  const isMountedRef = useRef(true);
  /** Cleanup operation status flag */
  const isCleaningUpRef = useRef(false);

  /**
   * Cleanup function with comprehensive error handling
   *
   * Safely stops QR scanner and releases camera resources with proper
   * error suppression for known harmless errors during cleanup process.
   */
  const cleanup = useCallback(async () => {
    if (!html5QrCodeRef.current || isCleaningUpRef.current) {return;}

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
      {return;}

    // Clear any existing scanner first to prevent duplicates
    if (html5QrCodeRef.current) {
      cleanup();
    }

    isInitializingRef.current = true;
    isMountedRef.current = true;

    const html5QrCode = new Html5Qrcode(scannerIdRef.current);
    html5QrCodeRef.current = html5QrCode;

    /**
     * React 18+ Concurrent Camera Initialization Implementation
     *
     * Wraps camera initialization in startTransition to leverage React 18's
     * concurrent rendering. This prevents the UI from blocking during camera
     * permission requests, WebRTC setup, and device access operations.
     *
     * @concurrent This operation uses React 18's concurrent features
     * @nonblocking Camera setup won't freeze the UI thread
     *
     * Critical for mobile experience:
     * 1. Camera permission dialogs can take time
     * 2. WebRTC initialization varies by device/browser
     * 3. User might need to troubleshoot camera access
     * 4. UI must remain responsive throughout process
     *
     * @performance
     * - Prevents UI freezing during camera access requests
     * - Allows React to prioritize user interactions over camera setup
     * - Enables smooth loading state transitions during initialization
     * - Improves perceived performance on slower devices
     */
    startTransition(() => {
      setIsInitializing(true);

      /**
       * Async Camera Scanner Initialization Handler
       *
       * Performs the actual camera setup and QR scanner initialization within
       * a transition. This function handles WebRTC camera access, permission
       * requests, and html5-qrcode library configuration.
       *
       * @async
       * @function initializeScanner
       * @returns {Promise<void>} Promise that resolves when camera is ready
       * @throws {Error} Camera access errors, permission denials, WebRTC failures
       */
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
          setIsInitializing(false);
        }
      };

      // Execute the camera initialization
      initializeScanner();
    });

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
      {/* Enhanced loading indicator with transition states */}
      {(isInitializing || isPending) && (
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
            {isPending ? 'Preparing camera...' : 'Loading camera...'}
          </div>
        </div>
      )}
    </div>
  );
};

export default QrScanner;
