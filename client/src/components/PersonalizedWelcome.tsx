import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  id: string; // Stable banner ID (no user suffix - already scoped via lsKey)
  type: BannerType;
  message: string;
  actionLabel?: string | undefined;
  actionLink?: string | undefined;
  snoozeLabel?: string | undefined;
  priority: number; // Higher = more important
  dismissible: boolean;
}

// Storage helper functions for consistent key naming
const LS_NS = 'djforever';

const lsKey = (userId: string, ...parts: string[]) =>
  [LS_NS, userId, ...parts].join(':');

const getJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const setJson = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getNumber = (key: string, fallback = 0) => {
  const raw = localStorage.getItem(key);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : fallback;
};

// Simple hash function for content versioning
const hash = (s: string): string => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
};

const PersonalizedWelcome: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const [currentBanner, setCurrentBanner] = useState<Banner | null>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const bannerRef = useRef<HTMLDivElement | null>(null);

  // User-scoped dismissed banners (Patch 1)
  const getDismissedBanners = (userId: string): string[] => {
    return getJson<string[]>(lsKey(userId, 'banners', 'dismissed'), []);
  };

  const isBannerDismissed = useCallback(
    (userId: string, bannerId: string): boolean => {
      return getDismissedBanners(userId).includes(bannerId);
    },
    []
  );

  const dismissBanner = (userId: string, bannerId: string) => {
    const dismissed = new Set(getDismissedBanners(userId));
    dismissed.add(bannerId);
    setJson(lsKey(userId, 'banners', 'dismissed'), Array.from(dismissed));
    setShowBanner(false);
  };

  // User-scoped snooze (Patch 2)
  const isBannerSnoozed = useCallback(
    (userId: string, bannerId: string): boolean => {
      const key = lsKey(userId, 'banners', 'snoozeUntil', bannerId);
      const snoozedUntil = getNumber(key, 0);

      if (!snoozedUntil) {
        return false;
      }

      if (Date.now() > snoozedUntil) {
        localStorage.removeItem(key);
        return false;
      }

      return true;
    },
    []
  );

  const snoozeBanner = (userId: string, bannerId: string, hours: number) => {
    const key = lsKey(userId, 'banners', 'snoozeUntil', bannerId);
    const snoozeUntil = Date.now() + hours * 60 * 60 * 1000;
    localStorage.setItem(key, String(snoozeUntil));
    setShowBanner(false);
  };

  // Selective RSVP suppression (Patch 3) - only suppresses RSVP nudges
  const shouldSuppressRsvpBanners = useCallback((): boolean => {
    if (!user?._id) {
      return false;
    }

    const now = Date.now();
    const lastClosedAt = getNumber(
      lsKey(user._id, 'welcome', 'lastClosedAt'),
      0
    );
    if (!lastClosedAt) {
      return false;
    }

    // Ignore future timestamps (clock jump protection)
    if (lastClosedAt > now) {
      return false;
    }

    const fiveMinutesAgo = now - 5 * 60 * 1000;
    return lastClosedAt > fiveMinutesAgo;
  }, [user]);

  useEffect(() => {
    if (!isLoggedIn || !user?.fullName) {
      return undefined;
    }

    const banners: Banner[] = [];
    const firstName = user.fullName.split(' ')[0];
    const isHomePage = window.location.pathname === '/';

    // Admin banner (highest priority) - only show on homepage
    if (user.isAdmin && isHomePage) {
      const id = 'admin-access';
      if (!isBannerDismissed(user._id, id)) {
        banners.push({
          id,
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
    // Note: This date must match the deadline in FAQAccordion.tsx
    const rsvpDeadline = new Date('2026-09-08');
    const today = new Date();

    // Normalize dates to midnight UTC to avoid timezone issues
    const toMidnightUTC = (date: Date) =>
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    const daysUntilDeadline = Math.ceil(
      (toMidnightUTC(rsvpDeadline) - toMidnightUTC(today)) /
        (1000 * 60 * 60 * 24)
    );

    if (
      !user.hasRSVPed &&
      daysUntilDeadline <= 7 &&
      daysUntilDeadline > 0 &&
      !shouldSuppressRsvpBanners()
    ) {
      const id = 'rsvp-deadline-warning';
      if (!isBannerDismissed(user._id, id) && !isBannerSnoozed(user._id, id)) {
        const formattedDeadline = rsvpDeadline.toLocaleDateString('en-US', {
          timeZone: 'UTC',
          month: 'long',
          day: 'numeric',
        });
        banners.push({
          id,
          type: 'deadline',
          message: `${firstName}, please submit your RSVP by ${formattedDeadline} to help us finalize our plans.`,
          actionLabel: 'RSVP',
          actionLink: '/rsvp',
          snoozeLabel: 'Remind me tomorrow',
          priority: 90,
          dismissible: true,
        });
      }
    }

    // Special instructions banner (travel, accommodation, etc.)
    if (user.specialInstructions && !user.isAdmin) {
      // Version ID by content hash so new instructions break through dismissal
      const id = `special-instructions:${hash(user.specialInstructions.trim().toLowerCase())}`;
      if (!isBannerDismissed(user._id, id)) {
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
          id,
          type: bannerType,
          message: `📋 Important: ${user.specialInstructions}`,
          priority,
          dismissible: true,
        });
      }
    }

    // Thank you banner for completed RSVPs - context-aware based on attendance status
    if (user.hasRSVPed && !user.isAdmin) {
      const id = 'thank-you-rsvp';
      if (!isBannerDismissed(user._id, id)) {
        let message: string;
        const attendanceStatus = user.rsvp?.attending;

        if (attendanceStatus === 'YES') {
          message = `Thank you for your RSVP, ${firstName}! We can't wait to celebrate with you! 🎉`;
        } else if (attendanceStatus === 'NO') {
          message = `Thank you for letting us know, ${firstName}. You'll be missed, but we understand.`;
        } else if (attendanceStatus === 'MAYBE') {
          message = `Thank you for your response, ${firstName}. We hope you can join us—please update us when you decide.`;
        } else {
          // Fallback for legacy RSVPs without attending status
          message = `Thank you for your RSVP, ${firstName}!`;
        }

        banners.push({
          id,
          type: 'thank-you',
          message,
          priority: 60,
          dismissible: true,
        });
      }
    }

    // Regular RSVP reminder (lowest priority)
    if (
      !user.hasRSVPed &&
      !user.isAdmin &&
      daysUntilDeadline > 7 &&
      !shouldSuppressRsvpBanners()
    ) {
      const id = 'rsvp-reminder';
      if (!isBannerDismissed(user._id, id)) {
        banners.push({
          id,
          type: 'rsvp-reminder',
          message: `${firstName}, please RSVP when you have a moment so we can finalize our plans.`,
          actionLabel: 'RSVP',
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

        // Auto-hide dismissible banners after delay (longer on mobile)
        if (topBanner.dismissible) {
          const isMobile = window.matchMedia('(max-width: 768px)').matches;
          let delay: number;

          if (topBanner.type === 'admin') {
            delay = isMobile ? 12000 : 10000; // 12s mobile, 10s desktop
          } else {
            delay = isMobile ? 10000 : 7000; // 10s mobile, 7s desktop
          }

          const timer = setTimeout(() => {
            setShowBanner(false);
          }, delay);

          return () => clearTimeout(timer);
        }
      }
    }

    return undefined;
  }, [
    isLoggedIn,
    user,
    shouldSuppressRsvpBanners,
    isBannerDismissed,
    isBannerSnoozed,
  ]);

  if (!showBanner || !currentBanner || !isLoggedIn) {
    return null;
  }

  // Handle dismiss: deadline banner gets 12h snooze, others get permanent dismiss
  const handleDismiss = () => {
    if (!user) {
      return;
    }
    if (currentBanner.type === 'deadline') {
      snoozeBanner(user._id, currentBanner.id, 12); // Short snooze maintains urgency
    } else {
      dismissBanner(user._id, currentBanner.id);
    }
  };

  return (
    <div
      ref={bannerRef}
      className={`personalized-welcome-banner banner-${currentBanner.type}`}
      data-testid="personalized-welcome-banner"
      data-banner-type={currentBanner.type}
    >
      <p>{currentBanner.message}</p>
      <div className="banner-actions">
        {currentBanner.actionLabel && currentBanner.actionLink && (
          <a
            href={currentBanner.actionLink}
            className={`banner-cta ${currentBanner.type === 'admin' ? 'banner-cta-admin' : ''}`}
          >
            {currentBanner.actionLabel}
          </a>
        )}
        {currentBanner.snoozeLabel && (
          <button
            className="banner-snooze-btn"
            onClick={() => user && snoozeBanner(user._id, currentBanner.id, 24)}
            aria-label="Snooze banner for 24 hours"
            title="Snooze for 24 hours"
          >
            {currentBanner.snoozeLabel}
          </button>
        )}
        {currentBanner.dismissible && (
          <button
            className="banner-dismiss-btn"
            onClick={handleDismiss}
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
