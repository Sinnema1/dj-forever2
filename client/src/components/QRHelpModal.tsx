import React, { useState, useEffect, useRef } from 'react';
import { logDebug } from '../utils/logger';
import { PUBLIC_LINKS } from '../config/publicLinks';

const QRHelpModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Focus management
  useEffect(() => {
    // Store current focus
    previousActiveElement.current = document.activeElement;

    // Focus modal
    setTimeout(() => {
      modalRef.current?.focus();
    }, 100);

    // Keyboard handler for ESC and focus trap
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap
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
    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [onClose]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logDebug(
      'QR Help request submitted',
      `Email: ${email}, Message: ${message}`
    );
    setSubmitted(true);
  };
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={e => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-help-title"
        tabIndex={-1}
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close help modal"
          style={{
            position: 'absolute',
            right: '20px',
            top: '15px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
          }}
        >
          ×
        </button>

        <h2 id="qr-help-title">Need Help with Your QR Code?</h2>

        {!submitted ? (
          <>
            <p>
              If you're having trouble with your QR code, please provide your
              email and we'll send you a new login link.
            </p>

            <form onSubmit={handleContactSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: 'bold',
                  }}
                >
                  Your Email:
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                  }}
                  placeholder="Enter the email you used for your RSVP"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label
                  htmlFor="message"
                  style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: 'bold',
                  }}
                >
                  What issue are you experiencing?
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    minHeight: '100px',
                  }}
                  placeholder="Please describe what's happening when you try to scan your QR code"
                />
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  width: '100%',
                }}
              >
                Send Help Request
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <p>
                {PUBLIC_LINKS.contactEmail ? (
                  <>
                    Or contact us directly at: <br />
                    <a href={`mailto:${PUBLIC_LINKS.contactEmail}`}>
                      {PUBLIC_LINKS.contactEmail}
                    </a>
                  </>
                ) : (
                  'Or reach out to the couple directly for assistance.'
                )}
              </p>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                backgroundColor: '#4caf50',
                color: 'white',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '30px',
              }}
            >
              ✓
            </div>

            <h3>Thank You!</h3>
            <p>
              We've received your request and will get back to you shortly with
              assistance for logging in.
            </p>
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '15px',
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRHelpModal;
