import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
// Styles now imported globally via main.tsx

type BannerType =
  | 'deadline'
  | 'travel'
  | 'accommodation'
  | 'wedding-party'
  | 'thank-you'
  | 'admin'
  | 'rsvp-reminder';

interface Banner {
  type: BannerType;
  message: string;
  actionLabel?: string | undefined;
  actionLink?: string | undefined;
  priority: number; // Higher = more important
  dismissible: boolean;
}

const PersonalizedWelcome: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const [currentBanner, setCurrentBanner] = useState<Banner | null>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);

  // Get dismissed banners from localStorage
  const getDismissedBanners = (): string[] => {
    const dismissed = localStorage.getItem('dismissedBanners');
    return dismissed ? JSON.parse(dismissed) : [];
  };

  // Dismiss banner and save to localStorage
  const dismissBanner = (bannerId: string) => {
    const dismissed = getDismissedBanners();
    dismissed.push(bannerId);
    localStorage.setItem('dismissedBanners', JSON.stringify(dismissed));
    setShowBanner(false);
  };

  // Check if banner has been dismissed
  const isBannerDismissed = (bannerId: string): boolean => {
    return getDismissedBanners().includes(bannerId);
  };

  useEffect(() => {
    if (!isLoggedIn || !user?.fullName) {
      return undefined;
    }

    const banners: Banner[] = [];
    const firstName = user.fullName.split(' ')[0];
    const isHomePage = window.location.pathname === '/';

    // Admin banner (highest priority) - only show on homepage
    if (user.isAdmin && isHomePage) {
      const bannerId = 'admin-access';
      if (!isBannerDismissed(bannerId)) {
        banners.push({
          type: 'admin',
          message:
            'Welcome, Admin! Access your dashboard to manage wedding details.',
          actionLabel: 'Admin Dashboard',
          actionLink: '/admin',
          priority: 100,
          dismissible: true,
        });
      }
    }

    // RSVP deadline warning (high priority)
    // Check if RSVP deadline is within 7 days
    const rsvpDeadline = new Date('2026-10-08');
    const today = new Date();
    const daysUntilDeadline = Math.ceil(
      (rsvpDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (!user.hasRSVPed && daysUntilDeadline <= 7 && daysUntilDeadline > 0) {
      const bannerId = 'rsvp-deadline-warning';
      if (!isBannerDismissed(bannerId)) {
        banners.push({
          type: 'deadline',
          message: `⏰ RSVP deadline is in ${daysUntilDeadline} day${daysUntilDeadline === 1 ? '' : 's'}! Please respond soon.`,
          actionLabel: 'RSVP Now',
          actionLink: '/rsvp',
          priority: 90,
          dismissible: false, // Don't allow dismissing urgent deadline
        });
      }
    }

    // Special instructions banner (travel, accommodation, etc.)
    if (user.specialInstructions && !user.isAdmin) {
      const bannerId = `special-instructions-${user._id}`;
      if (!isBannerDismissed(bannerId)) {
        // Determine banner type based on keywords
        const instructions = user.specialInstructions.toLowerCase();
        let bannerType: BannerType = 'travel';
        let priority = 70;

        if (
          instructions.includes('hotel') ||
          instructions.includes('accommodation') ||
          instructions.includes('booking')
        ) {
          bannerType = 'accommodation';
          priority = 80;
        } else if (
          instructions.includes('wedding party') ||
          instructions.includes('groomsman') ||
          instructions.includes('bridesmaid')
        ) {
          bannerType = 'wedding-party';
          priority = 85;
        }

        banners.push({
          type: bannerType,
          message: `📋 Important: ${user.specialInstructions}`,
          priority,
          dismissible: true,
        });
      }
    }

    // Thank you banner for completed RSVPs
    if (user.hasRSVPed && !user.isAdmin) {
      const bannerId = 'thank-you-rsvp';
      if (!isBannerDismissed(bannerId)) {
        banners.push({
          type: 'thank-you',
          message: `Thank you for your RSVP, ${firstName}! We can't wait to celebrate with you! 🎉`,
          priority: 60,
          dismissible: true,
        });
      }
    }

    // Regular RSVP reminder (lowest priority)
    if (!user.hasRSVPed && !user.isAdmin && daysUntilDeadline > 7) {
      const bannerId = 'rsvp-reminder';
      if (!isBannerDismissed(bannerId)) {
        banners.push({
          type: 'rsvp-reminder',
          message: `Welcome, ${firstName}! Don't forget to RSVP for our big day.`,
          actionLabel: 'RSVP Now',
          actionLink: '/rsvp',
          priority: 50,
          dismissible: true,
        });
      }
    }

    // Sort by priority (highest first) and show the top banner
    if (banners.length > 0) {
      banners.sort((a, b) => b.priority - a.priority);
      const topBanner = banners[0];
      if (topBanner) {
        setCurrentBanner(topBanner);
        setShowBanner(true);

        // Auto-hide dismissible banners after delay
        if (topBanner.dismissible) {
          const delay = topBanner.type === 'admin' ? 10000 : 7000;
          const timer = setTimeout(() => {
            setShowBanner(false);
          }, delay);

          return () => clearTimeout(timer);
        }
      }
    }

    return undefined;
  }, [isLoggedIn, user]);

  if (!showBanner || !currentBanner || !isLoggedIn) {
    return null;
  }

  // Generate unique banner ID for dismissal
  const bannerId =
    currentBanner.type === 'admin'
      ? 'admin-access'
      : currentBanner.type === 'deadline'
        ? 'rsvp-deadline-warning'
        : currentBanner.type === 'thank-you'
          ? 'thank-you-rsvp'
          : currentBanner.type === 'rsvp-reminder'
            ? 'rsvp-reminder'
            : `special-instructions-${user?._id}`;

  return (
    <div
      className={`personalized-welcome-banner banner-${currentBanner.type}`}
      data-testid="personalized-welcome-banner"
      data-banner-type={currentBanner.type}
    >
      <p>{currentBanner.message}</p>
      <div className="banner-actions">
        {currentBanner.actionLabel && currentBanner.actionLink && (
          <a
            href={currentBanner.actionLink}
            className={`btn btn-small ${currentBanner.type === 'admin' ? 'admin-dashboard-btn' : ''}`}
          >
            {currentBanner.actionLabel}
          </a>
        )}
        {currentBanner.dismissible && (
          <button
            className="banner-dismiss-btn"
            onClick={() => dismissBanner(bannerId)}
            aria-label="Dismiss banner"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default PersonalizedWelcome;
