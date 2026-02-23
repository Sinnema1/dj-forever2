import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import coverPhoto from '../assets/images/cover_photo.jpeg';
// Styles now imported globally via main.tsx

/** Storage helper for consistent key naming (matches PersonalizedWelcome) */
const LS_NS = 'djforever';
const lsKey = (userId: string, ...parts: string[]) =>
  [LS_NS, userId, ...parts].join(':');

/** Current modal version - increment to re-show modal after redesign */
const MODAL_VERSION = 'v2';

/** Couple signature - source of truth for names */
const COUPLE_SIGNATURE = 'Love, Dominique & Justin';

/**
 * Welcome copy configuration
 * Allows easy iteration on messaging without changing component logic
 */
const WELCOME_COPY = {
  /** Default custom message when no relationship-specific copy exists */
  defaultMessage:
    "We're so happy you're here—thank you for being part of this season with us.",

  /** Utility line describing what's available on the site */
  utilityLine: 'Everything you need is here — details, travel, FAQs, and RSVP.',

  /** Relationship-specific greetings */
  relationships: {
    sister_bride: "We're so grateful to have you here, dear sister.",
    brother_bride: "We're honored to have you here, dear brother.",
    sister_groom: "We're so grateful to have you here, dear sister.",
    brother_groom: "We're honored to have you here, dear brother.",
    parent: 'Your love and support has meant everything to us.',
    friend_bride: "We're grateful to celebrate with you.",
    friend_groom: "We're grateful to celebrate with you.",
  },

  /** Group-based greetings */
  groups: {
    grooms_family: "Family means everything to us. We're so happy you're here.",
    brides_family: "Family means everything to us. We're so happy you're here.",
    friends: 'Your friendship has enriched our lives in countless ways.',
    extended_family: "We're delighted to have our extended family here.",
    other: "We're so grateful you're here to celebrate with us.",
  },
};

const WelcomeModal: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Define handleClose early so it can be used in useEffect
  const handleClose = useCallback(() => {
    setShowModal(false);
    if (user) {
      // Mark as seen so it doesn't show again (versioned)
      localStorage.setItem(`welcome-seen-${MODAL_VERSION}-${user._id}`, 'true');
      // Save timestamp to prevent RSVP banners from showing immediately after
      localStorage.setItem(
        lsKey(user._id, 'welcome', 'lastClosedAt'),
        String(Date.now())
      );
    }
  }, [user]);

  useEffect(() => {
    // Only show for logged-in users (but not admin users)
    // Double-check admin status to ensure robust exclusion
    if (!isLoggedIn || !user || user.isAdmin === true) {
      return undefined;
    }

    // Check if user has seen the welcome modal before
    const hasSeenWelcome = localStorage.getItem(
      `welcome-seen-${MODAL_VERSION}-${user._id}`
    );

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

  // Listen for custom event to reopen modal
  useEffect(() => {
    const handleReopenModal = () => {
      if (isLoggedIn && user && !user.isAdmin) {
        setShowModal(true);
      }
    };

    window.addEventListener('openWelcomeModal', handleReopenModal);
    return () => {
      window.removeEventListener('openWelcomeModal', handleReopenModal);
    };
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
  }, [showModal, handleClose]);

  if (!showModal || !isLoggedIn || !user || user.isAdmin === true) {
    return null;
  }

  // Generate greeting with household member names
  const getHouseholdGreeting = (): string => {
    const names: string[] = [user.fullName?.split(' ')[0] || 'Guest'];

    // Add household member first names
    if (user.householdMembers && user.householdMembers.length > 0) {
      user.householdMembers.forEach(member => {
        names.push(member.firstName);
      });
    }

    // Format names with proper grammar
    if (names.length === 1) {
      return names[0] || 'Guest';
    } else if (names.length === 2) {
      return `${names[0]} and ${names[1]}`;
    } else {
      const lastName = names.pop();
      return `${names.join(', ')}, and ${lastName}`;
    }
  };

  const householdGreeting = getHouseholdGreeting();

  // Generate personalized message based on relationship
  const getPersonalizedMessage = (): string => {
    // Use custom welcome message if set (highest priority)
    if (user.customWelcomeMessage) {
      return user.customWelcomeMessage;
    }

    // Relationship-specific messages
    if (user.relationshipToBride) {
      const relationship = user.relationshipToBride.toLowerCase();
      if (relationship.includes('sister')) {
        return WELCOME_COPY.relationships.sister_bride;
      }
      if (relationship.includes('brother')) {
        return WELCOME_COPY.relationships.brother_bride;
      }
      if (
        relationship.includes('mother') ||
        relationship.includes('mom') ||
        relationship.includes('father') ||
        relationship.includes('dad')
      ) {
        return WELCOME_COPY.relationships.parent;
      }
      if (relationship.includes('friend')) {
        return WELCOME_COPY.relationships.friend_bride;
      }
    }

    if (user.relationshipToGroom) {
      const relationship = user.relationshipToGroom.toLowerCase();
      if (relationship.includes('sister')) {
        return WELCOME_COPY.relationships.sister_groom;
      }
      if (relationship.includes('brother')) {
        return WELCOME_COPY.relationships.brother_groom;
      }
      if (
        relationship.includes('mother') ||
        relationship.includes('mom') ||
        relationship.includes('father') ||
        relationship.includes('dad')
      ) {
        return WELCOME_COPY.relationships.parent;
      }
      if (relationship.includes('friend')) {
        return WELCOME_COPY.relationships.friend_groom;
      }
    }

    // Group-based messages
    if (user.guestGroup && WELCOME_COPY.groups[user.guestGroup]) {
      return WELCOME_COPY.groups[user.guestGroup];
    }

    // Default message
    return WELCOME_COPY.defaultMessage;
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
            <h2 id="welcome-modal-title">Welcome, {householdGreeting}</h2>
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
              <p className="personal-message">{getPersonalizedMessage()}</p>
            </div>
          </div>

          <div className="welcome-modal-footer">
            <p className="utility-line">{WELCOME_COPY.utilityLine}</p>

            <p className="helper-text">
              This note is always available from the menu.
            </p>

            <div className="welcome-footer-actions">
              {!user.hasRSVPed && (
                <>
                  <a
                    href="/rsvp"
                    className="welcome-rsvp-btn"
                    onClick={handleClose}
                  >
                    RSVP
                  </a>
                  <button className="welcome-text-link" onClick={handleClose}>
                    Browse site
                  </button>
                </>
              )}
              {user.hasRSVPed && (
                <button className="welcome-explore-btn" onClick={handleClose}>
                  Browse site
                </button>
              )}
            </div>

            <div className="welcome-signature">
              <p className="names">{COUPLE_SIGNATURE}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
