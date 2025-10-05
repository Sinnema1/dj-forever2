interface RSVPConfirmationProps {
  guestName?: string;
  email?: string;
  isAttending?: boolean;
  partySize?: number;
  onEditRsvp?: () => void;
}

export default function RSVPConfirmation({
  guestName,
  email,
  isAttending,
  partySize,
  onEditRsvp,
}: RSVPConfirmationProps) {
  return (
    <div className="rsvp-confirmation-container">
      <div className="rsvp-confirmation-card">
        {/* Success Icon */}
        <div className="confirmation-icon">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>

        {/* Confirmation Message */}
        <div className="confirmation-content">
          <h2 className="confirmation-title">
            {isAttending
              ? "We can't wait to celebrate with you!"
              : 'Thank you for letting us know'}
          </h2>

          <div className="confirmation-details">
            {guestName && (
              <p className="confirmation-detail">
                <strong>Name:</strong> {guestName}
              </p>
            )}

            {email && (
              <p className="confirmation-detail">
                <strong>Email:</strong> {email}
              </p>
            )}

            <p className="confirmation-detail">
              <strong>Attendance:</strong>{' '}
              {isAttending ? 'Will be attending' : 'Will not be attending'}
            </p>

            {isAttending && partySize && (
              <p className="confirmation-detail">
                <strong>Party Size:</strong> {partySize}{' '}
                {partySize === 1 ? 'person' : 'people'}
              </p>
            )}
          </div>

          {/* Next Steps */}
          <div className="confirmation-next-steps">
            {isAttending ? (
              <>
                <p className="next-steps-text">
                  We've sent a confirmation email with all the wedding details.
                  If you need to make any changes, you can update your RSVP
                  anytime.
                </p>
                <div className="next-steps-links">
                  <a href="/details" className="next-step-link">
                    View Wedding Details
                  </a>
                  <a href="/travel" className="next-step-link">
                    Travel Information
                  </a>
                </div>
              </>
            ) : (
              <p className="next-steps-text">
                We understand you can't make it, but we'll miss you on our
                special day! Feel free to browse our photo gallery after the
                wedding.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="confirmation-actions">
            {onEditRsvp && (
              <button
                onClick={onEditRsvp}
                className="btn-secondary"
                type="button"
              >
                Edit RSVP
              </button>
            )}
            <a href="/" className="btn-primary">
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
