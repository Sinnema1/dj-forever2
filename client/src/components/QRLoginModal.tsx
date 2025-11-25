import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Props interface for QRLoginModal component
 */
interface QRLoginModalProps {
  /** Controls modal visibility state */
  isOpen: boolean;
  /** Callback function to close the modal */
  onClose: () => void;
  /** Callback function executed on successful authentication */
  onLoginSuccess: () => void;
  /** Optional test scan value for development/testing (bypasses QR scanning) */
  testScanValue?: string;
}

/**
 * QRLoginModal - QR Code Authentication Modal
 *
 * Interactive modal component for QR code authentication with manual token input
 * fallback. Provides multiple authentication methods including QR scanning
 * recommendations and manual token entry for guests who need alternative login
 * options beyond scanning invitation QR codes.
 *
 * @features
 * - **QR Code Guidance**: Instructions for optimal QR scanning experience
 * - **Manual Token Input**: Fallback option for manual token entry
 * - **Real-time Validation**: Input validation and loading states
 * - **Error Handling**: User-friendly error messages and recovery
 * - **Test Integration**: Development testing utilities and quick tokens
 * - **Accessibility**: Full keyboard navigation and screen reader support
 * - **Mobile Optimization**: Touch-friendly interface for mobile devices
 * - **Body Scroll Lock**: Prevents background scrolling when modal is open
 *
 * @userFlow
 * 1. User clicks login button to open modal
 * 2. Modal shows QR scanning recommendations
 * 3. User can scan QR code OR manually enter token
 * 4. Authentication attempt with loading state
 * 5. Success: Execute callback and close modal
 * 6. Error: Display error message with retry option
 *
 * @accessibility
 * - ARIA modal role with proper labeling
 * - Keyboard navigation support (Enter to submit, Escape to close)
 * - Focus management for modal open/close
 * - Screen reader announcements for status changes
 * - High contrast error states
 *
 * @testingSupport
 * - Development-only test token buttons
 * - `testScanValue` prop for automated testing
 * - Quick access to common test scenarios
 *
 * @component
 * @example
 * ```tsx
 * function LoginButton() {
 *   const [showModal, setShowModal] = useState(false);
 *
 *   return (
 *     <>
 *       <button onClick={() => setShowModal(true)}>
 *         Login with QR Code
 *       </button>
 *       <QRLoginModal
 *         isOpen={showModal}
 *         onClose={() => setShowModal(false)}
 *         onLoginSuccess={() => {
 *           setShowModal(false);
 *           // Handle successful login
 *         }}
 *       />
 *     </>
 *   );
 * }
 * ```
 *
 * @dependencies
 * - `useAuth` - Authentication context for login operations
 * - CSS classes for modal styling (defined globally)
 * - Body scroll lock for mobile UX
 */
export default function QRLoginModal(props: QRLoginModalProps) {
  const { isOpen, onClose, onLoginSuccess, testScanValue } = props;
  // For testing: simulate a scan if testScanValue is provided
  React.useEffect(() => {
    if (testScanValue) {
      handleTokenSubmit(testScanValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testScanValue]);

  const { loginWithQrToken } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const modalRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElement = React.useRef<Element | null>(null);

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setError('');
      setLoading(false);
      setTokenInput('');
      // Lock body scroll on mobile
      document.body.classList.add('modal-open');

      // Store and restore focus
      previousActiveElement.current = document.activeElement;
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
    } else {
      // Unlock body scroll
      document.body.classList.remove('modal-open');

      // Restore focus
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  // Focus trap implementation
  React.useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Close on Escape
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap - Tab key cycling
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            event.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleTokenSubmit = async (token: string) => {
    if (!token.trim() || loading) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await loginWithQrToken(token.trim());
      setTimeout(() => {
        onLoginSuccess();
        onClose();
      }, 800);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Login failed. Please check your token and try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTokenSubmit(tokenInput);
    }
  };

  if (!isOpen) {
    return null;
  }

  return createPortal(
    // Overlay is an interactive backdrop intended to close the modal when
    // clicked. We make it keyboard-accessible (role/button + tabIndex + onKeyDown)
    // and provide a visible Close button for screen reader and keyboard users.
    <div
      className="modal-overlay"
      onClick={e => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-login-title"
        // Make the dialog programmatically focusable so it's treated as interactive
        tabIndex={-1}
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close QR login modal"
        >
          ×
        </button>
        <h2 id="qr-login-title">Login with QR Code</h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              backgroundColor: '#e8f5e8',
              border: '1px solid #4caf50',
              padding: '1.5rem',
              borderRadius: '8px',
            }}
          >
            <h3
              style={{
                margin: '0 0 0.75rem 0',
                fontSize: '1.1rem',
                color: '#2e7d32',
              }}
            >
              📱 Easy QR Code Login
            </h3>
            <p
              style={{
                margin: '0 0 0.75rem 0',
                fontSize: '0.95rem',
                lineHeight: '1.5',
              }}
            >
              <strong>Recommended:</strong> Use your phone's camera app to scan
              the QR code on your invitation. It will automatically open this
              website and log you in!
            </p>

            <p style={{ margin: '0', fontSize: '0.9rem', color: '#555' }}>
              Or enter your QR token manually below:
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="token-input"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              fontSize: '1rem',
            }}
          >
            Enter Your QR Token:
          </label>
          <input
            id="token-input"
            type="text"
            value={tokenInput}
            onChange={e => setTokenInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type or paste your token here..."
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #ddd',
              borderRadius: '6px',
              fontSize: '1rem',
              marginBottom: '0.75rem',
              outline: 'none',
              transition: 'border-color 0.2s',
              ...(tokenInput && { borderColor: '#4caf50' }),
            }}
          />
          <button
            onClick={() => handleTokenSubmit(tokenInput)}
            disabled={!tokenInput.trim() || loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading ? '#ccc' : '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading || !tokenInput.trim() ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #f3f3f3',
                  borderTop: '2px solid #4caf50',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              Verifying your token...
            </div>
          </div>
        )}

        {/* Quick test section for development */}
        {import.meta.env.DEV && (
          <details style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
            <summary style={{ cursor: 'pointer', color: '#666' }}>
              🧪 Developer Testing
            </summary>
            <div
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem',
                backgroundColor: '#f8f8f8',
                borderRadius: '4px',
              }}
            >
              <p style={{ margin: '0 0 0.5rem 0' }}>
                Quick test tokens (🔧 = Admin):
              </p>
              <button
                onClick={() => handleTokenSubmit('r24gpj3wntgqwqfberlas')}
                disabled={loading}
                style={{
                  margin: '2px',
                  padding: '4px 8px',
                  fontSize: '0.8rem',
                  backgroundColor: loading ? '#f0f0f0' : '#e0e0e0',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
                title="Alice Johnson"
              >
                Alice
              </button>
              <button
                onClick={() => handleTokenSubmit('ssq7b7bkfqqpd2724vlcol')}
                disabled={loading}
                style={{
                  margin: '2px',
                  padding: '4px 8px',
                  fontSize: '0.8rem',
                  backgroundColor: loading ? '#f0f0f0' : '#e0e0e0',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
                title="Bob Smith"
              >
                Bob
              </button>
              <button
                onClick={() => handleTokenSubmit('ss0qx6mg20f2qaiyl9hnl7')}
                disabled={loading}
                style={{
                  margin: '2px',
                  padding: '4px 8px',
                  fontSize: '0.8rem',
                  backgroundColor: loading ? '#f0f0f0' : '#e0e0e0',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
                title="Charlie Williams"
              >
                Charlie
              </button>
              <button
                onClick={() => handleTokenSubmit('obnzixyen8f6fzr5xwznda')}
                disabled={loading}
                style={{
                  margin: '2px',
                  padding: '4px 8px',
                  fontSize: '0.8rem',
                  backgroundColor: loading ? '#f0f0f0' : '#d4edda',
                  border: '1px solid #28a745',
                  borderRadius: '3px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  color: '#155724',
                  fontWeight: 'bold',
                }}
                title="Admin User - Full admin access"
              >
                🔧 Admin
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
          <p style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>
            Need help? Contact us if you can't find your invitation or token.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>,
    document.body
  );
}
