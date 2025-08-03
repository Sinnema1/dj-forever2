import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import coverPhoto from "../assets/images/cover_photo.jpeg";
import "../assets/welcome-modal.css";

const WelcomeModal: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Only show for logged-in users
    if (!isLoggedIn || !user) return;

    // Check if user has seen the welcome modal before
    const hasSeenWelcome = localStorage.getItem(`welcome-seen-${user._id}`);

    if (!hasSeenWelcome) {
      // Small delay to allow page to load
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, user]);

  const handleClose = () => {
    setShowModal(false);
    if (user) {
      // Mark as seen so it doesn't show again
      localStorage.setItem(`welcome-seen-${user._id}`, "true");
    }
  };

  if (!showModal || !isLoggedIn || !user) return null;

  const firstName = user.fullName.split(" ")[0];

  return (
    <div className="welcome-modal-overlay" onClick={handleClose}>
      <div className="welcome-modal" onClick={(e) => e.stopPropagation()}>
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
            <h2>Welcome to Our Wedding Website, {firstName}!</h2>
          </div>

          <div className="welcome-modal-body">
            <div className="welcome-couple-photo">
              <img
                src={coverPhoto}
                alt="Couple photo"
                className="couple-image"
              />
            </div>

            <div className="welcome-message">
              <p className="welcome-greeting">
                We are absolutely thrilled that you're here and that you'll be
                celebrating with us on our special day!
              </p>

              <p className="welcome-details">
                This website contains everything you need to know about our
                wedding - from the venue details and travel information to our
                registry and photo gallery. We've created this special space
                just for our loved ones.
              </p>

              <p className="welcome-personal">
                Your presence means the world to us, and we can't wait to share
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
              <a href="/rsvp" className="welcome-rsvp-btn">
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
