import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
// Styles now imported globally via main.tsx

const PersonalizedWelcome: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [showWelcome, setShowWelcome] = useState<boolean>(false);

  useEffect(() => {
    if (isLoggedIn && user?.fullName) {
      if (user.isAdmin) {
        // Show admin access banner for admin users
        setWelcomeMessage(
          'Welcome, Admin! Access your dashboard to manage wedding details.'
        );
        setShowWelcome(true);

        // Keep admin banner visible longer (10 seconds)
        const timer = setTimeout(() => {
          setShowWelcome(false);
        }, 10000);

        return () => clearTimeout(timer);
      } else {
        // Create personalized welcome message for regular users
        const firstName = user.fullName.split(' ')[0];

        // Different messages based on RSVP status
        if (user.hasRSVPed) {
          setWelcomeMessage(
            `Welcome back, ${firstName}! Thanks for your RSVP.`
          );
        } else {
          setWelcomeMessage(
            `Welcome, ${firstName}! Don't forget to RSVP for our big day.`
          );
        }

        // Show welcome banner
        setShowWelcome(true);

        // Hide after 5 seconds
        const timer = setTimeout(() => {
          setShowWelcome(false);
        }, 5000);

        return () => clearTimeout(timer);
      }
    }
    // No cleanup needed when condition is false
    return undefined;
  }, [isLoggedIn, user]);

  if (!showWelcome || !isLoggedIn) return null;

  return (
    <div
      className="personalized-welcome-banner"
      data-testid="personalized-welcome-banner"
    >
      <p>{welcomeMessage}</p>
      {user?.isAdmin ? (
        <a href="/admin" className="btn btn-small admin-dashboard-btn">
          Admin Dashboard
        </a>
      ) : (
        !user?.hasRSVPed && (
          <a href="#rsvp" className="btn btn-small">
            RSVP Now
          </a>
        )
      )}
    </div>
  );
};

export default PersonalizedWelcome;
