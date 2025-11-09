import React, { useState } from 'react';
import { logDebug } from '../utils/logger';

const QRHelpModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

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
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <button
          onClick={onClose}
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
          &times;
        </button>

        <h2>Need Help with Your QR Code?</h2>

        {!submitted ? (
          <>
            <p>
              If you&apos;re having trouble with your QR code, please provide
              your email and we&apos;ll send you a new login link.
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
                Or contact us directly at: <br />
                <a href="mailto:wedding@example.com">wedding@example.com</a>
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
              We&apos;ve received your request and will get back to you shortly
              with assistance for logging in.
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
