import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import coverPhoto from '../assets/images/cover_photo.jpeg';
// Styles now imported globally via main.tsx

const WelcomeModal: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    // Only show for logged-in users (but not admin users)
    // Double-check admin status to ensure robust exclusion
    if (!isLoggedIn || !user || user.isAdmin === true) {
      return undefined;
    }

    // Check if user has seen the welcome modal before
    const hasSeenWelcome = localStorage.getItem(`welcome-seen-${user._id}`);

    if (!hasSeenWelcome) {
      // Small delay to allow page to load
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 1000);

      return () => clearTimeout(timer);
    }

    // No cleanup needed when modal shouldn't show
    return undefined;
  }, [isLoggedIn, user]);

  // Focus management and keyboard trap
  useEffect(() => {
    if (!showModal) {
      return undefined;
    }

    // Store currently focused element for restoration
    previousActiveElement.current = document.activeElement;

    // Focus the modal
    setTimeout(() => {
      modalRef.current?.focus();
    }, 100);

    // Keyboard event handler for ESC and focus trap
    const handleKeyDown = (event: KeyboardEvent) => {
      // Close on Escape
      if (event.key === 'Escape') {
        handleClose();
        return;
      }

      // Focus trap - Tab key cycling
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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

      // Restore focus when modal closes
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [showModal]);

  const handleClose = () => {
    setShowModal(false);
    if (user) {
      // Mark as seen so it doesn't show again
      localStorage.setItem(`welcome-seen-${user._id}`, 'true');
    }
  };

  if (!showModal || !isLoggedIn || !user || user.isAdmin === true) {
    return null;
  }

  const firstName = user.fullName.split(' ')[0];

  // Generate personalized greeting based on relationship
  const getPersonalizedGreeting = (): string => {
    // Use custom welcome message if set
    if (user.customWelcomeMessage) {
      return user.customWelcomeMessage;
    }

    // Relationship-based greetings
    if (user.relationshipToBride) {
      const relationship = user.relationshipToBride.toLowerCase();
      if (relationship.includes('sister')) {
        return `We are so blessed to have you, dear sister of the bride, celebrating with us!`;
      }
      if (relationship.includes('brother')) {
        return `We are so honored to have you, brother of the bride, celebrating with us!`;
      }
      if (relationship.includes('mother') || relationship.includes('mom')) {
        return `Your love and support has meant everything to us. We're so grateful to share this day with you!`;
      }
      if (relationship.includes('father') || relationship.includes('dad')) {
        return `Your love and support has meant everything to us. We're so grateful to share this day with you!`;
      }
      if (relationship.includes('friend')) {
        return `We're thrilled to celebrate our special day with such a wonderful friend of the bride!`;
      }
    }

    if (user.relationshipToGroom) {
      const relationship = user.relationshipToGroom.toLowerCase();
      if (relationship.includes('sister')) {
        return `We are so blessed to have you, dear sister of the groom, celebrating with us!`;
      }
      if (relationship.includes('brother')) {
        return `We are so honored to have you, brother of the groom, celebrating with us!`;
      }
      if (relationship.includes('mother') || relationship.includes('mom')) {
        return `Your love and support has meant everything to us. We're so grateful to share this day with you!`;
      }
      if (relationship.includes('father') || relationship.includes('dad')) {
        return `Your love and support has meant everything to us. We're so grateful to share this day with you!`;
      }
      if (relationship.includes('friend')) {
        return `We're thrilled to celebrate our special day with such a wonderful friend of the groom!`;
      }
    }

    // Group-based greetings
    if (user.guestGroup) {
      switch (user.guestGroup) {
        case 'grooms_family':
          return `Family means everything to us! We're so happy to celebrate this special day with the groom's family.`;
        case 'brides_family':
          return `Family means everything to us! We're so happy to celebrate this special day with the bride's family.`;
        case 'friends':
          return `Your friendship has enriched our lives in countless ways. We're thrilled you're here!`;
        case 'extended_family':
          return `We're delighted to have our extended family here to share in our joy!`;
        case 'other':
          return `We're so grateful you're here to celebrate with us on our special day!`;
      }
    }

    // Default greeting
    return `We are absolutely thrilled that you are here and that you will be celebrating with us on our special day!`;
  };

  return (
    // Backdrop closes only when the user clicks the overlay (not the modal
    // itself). Add keyboard activation so Enter/Space also close the backdrop.
    <div
      className="welcome-modal-overlay"
      onClick={e => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Close welcome modal"
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="welcome-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
        tabIndex={-1}
      >
        <button
          className="welcome-modal-close"
          onClick={handleClose}
          aria-label="Close welcome message"
        >
          ×
        </button>

        <div className="welcome-modal-content">
          <div className="welcome-modal-header">
            <div className="welcome-hearts">💕</div>
            <h2 id="welcome-modal-title">
              Welcome to Our Wedding Website, {firstName}!
            </h2>
          </div>

          <div className="welcome-modal-body">
            <div className="welcome-couple-photo">
              <img
                src={user.personalPhoto || coverPhoto}
                alt="Dominique and Justin"
                className="couple-image"
                onError={e => {
                  // Fallback to cover photo if personal photo fails to load
                  const target = e.target as HTMLImageElement;
                  if (target.src !== coverPhoto) {
                    target.src = coverPhoto;
                  }
                }}
              />
            </div>

            <div className="welcome-message">
              <p className="welcome-greeting">{getPersonalizedGreeting()}</p>

              <p className="welcome-details">
                This website contains everything you need to know about our
                wedding - from the venue details and travel information to our
                registry and photo gallery. We have created this special space
                just for our loved ones.
              </p>

              {user.plusOneAllowed && (
                <p className="welcome-plus-one">
                  <strong>💝 Plus One Invited:</strong> We'd love for you to
                  bring a guest! Please include their information when you RSVP.
                </p>
              )}

              {user.specialInstructions && (
                <div className="welcome-special-instructions">
                  <p>
                    <strong>📋 Important Information:</strong>
                  </p>
                  <p className="special-instructions-text">
                    {user.specialInstructions}
                  </p>
                </div>
              )}

              <p className="welcome-personal">
                Your presence means the world to us, and we cannot wait to share
                this magical moment with you. Thank you for being such an
                important part of our journey!
              </p>

              <div className="welcome-signature">
                <p>With all our love,</p>
                <p className="names">Dominique & Justin</p>
              </div>
            </div>
          </div>

          <div className="welcome-modal-footer">
            {!user.hasRSVPed && (
              <a
                href="/rsvp"
                className="welcome-rsvp-btn"
                onClick={handleClose}
              >
                RSVP Now 💌
              </a>
            )}
            <button className="welcome-explore-btn" onClick={handleClose}>
              Explore the Website ✨
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
