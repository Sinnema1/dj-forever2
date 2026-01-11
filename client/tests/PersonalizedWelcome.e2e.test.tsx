import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PersonalizedWelcome from '../src/components/PersonalizedWelcome';
import type { User } from '../src/models/userTypes';
import type { AuthContextType } from '../src/models/userTypes';

/**
 * PersonalizedWelcome E2E Test Suite (Phase 3)
 *
 * Tests the enhanced banner system with:
 * - 7 banner types with priority system
 * - localStorage dismissal persistence
 * - Keyword-based banner detection
 * - RSVP deadline warnings
 * - Auto-hide timers
 */

// Mock the useAuth hook with module-level state
let mockUser: User | null = null;
let mockIsLoggedIn = false;

vi.mock('../src/context/AuthContext', () => ({
  useAuth: () =>
    ({
      user: mockUser,
      isLoggedIn: mockIsLoggedIn,
      token: mockIsLoggedIn ? 'mock-token' : null,
      isLoading: false,
      loginWithQrToken: vi.fn(),
      logout: vi.fn(),
    }) as AuthContextType,
}));

// Clear localStorage and reset mock state before each test
beforeEach(() => {
  localStorage.clear();
  mockUser = null;
  mockIsLoggedIn = false;
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('PersonalizedWelcome - Banner System', () => {
  describe('Banner Priority System', () => {
    it('should show admin banner (priority 100) over other banners', () => {
      mockUser = {
        _id: 'admin-1',
        fullName: 'Admin User',
        email: 'admin@test.com',
        isInvited: true,
        isAdmin: true,
        hasRSVPed: false,
        specialInstructions: 'Please book hotel early',
      };
      mockIsLoggedIn = true;

      render(<PersonalizedWelcome />);

      const banner = screen.getByTestId('personalized-welcome-banner');
      expect(banner).toHaveAttribute('data-banner-type', 'admin');
      expect(banner).toHaveTextContent('Welcome, Admin!');
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    it('should show RSVP deadline warning (priority 90) over accommodation banner', () => {
      // Set date to 5 days before deadline (Jan 1, 2026)
      vi.setSystemTime(new Date('2026-09-03')); // 5 days before Sep 8, 2026

      mockUser = {
        _id: 'user-1',
        fullName: 'John Doe',
        email: 'john@test.com',
        isInvited: true,
        isAdmin: false,
        hasRSVPed: false,
        specialInstructions: 'Hotel: Book at the Grand Plaza',
      };
      mockIsLoggedIn = true;

      render(<PersonalizedWelcome />);

      const banner = screen.getByTestId('personalized-welcome-banner');
      expect(banner).toHaveAttribute('data-banner-type', 'deadline');
      expect(banner).toHaveTextContent(/RSVP deadline is in 5 days/i);
    });

    it('should show accommodation banner (priority 80) over travel banner', () => {
      // Set date to after deadline
      vi.setSystemTime(new Date('2026-02-01'));

      mockUser = {
        _id: 'user-2',
        fullName: 'Jane Smith',
        email: 'jane@test.com',
        isInvited: true,
        isAdmin: false,
        hasRSVPed: true,
        specialInstructions:
          'Please book your hotel accommodation at the Grand Plaza',
      };
      mockIsLoggedIn = true;

      render(<PersonalizedWelcome />);

      const banner = screen.getByTestId('personalized-welcome-banner');
      expect(banner).toHaveAttribute('data-banner-type', 'accommodation');
      expect(banner).toHaveTextContent(/Please book your hotel accommodation/i);
    });

    it('should show wedding party banner (priority 85) over general instructions', () => {
      vi.setSystemTime(new Date('2026-02-01'));

      mockUser = {
        _id: 'user-3',
        fullName: 'Best Man',
        email: 'bestman@test.com',
        isInvited: true,
        isAdmin: false,
        hasRSVPed: true,
        specialInstructions:
          'You are a groomsman! Please attend the rehearsal dinner on Friday.',
      };
      mockIsLoggedIn = true;

      render(<PersonalizedWelcome />);

      const banner = screen.getByTestId('personalized-welcome-banner');
      expect(banner).toHaveAttribute('data-banner-type', 'wedding-party');
      expect(banner).toHaveTextContent(/groomsman/i);
    });
  });

  describe('Keyword Detection', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date('2026-02-01'));
    });

    it('should detect "hotel" keyword and show accommodation banner', () => {
      mockUser = {
        _id: 'user-4',
        fullName: 'Guest One',
        email: 'guest1@test.com',
        isInvited: true,
        isAdmin: false,
        hasRSVPed: true,
        specialInstructions: 'Book your hotel room before December 1st',
      };
      mockIsLoggedIn = true;

      render(<PersonalizedWelcome />);

      const banner = screen.getByTestId('personalized-welcome-banner');
      expect(banner).toHaveAttribute('data-banner-type', 'accommodation');
    });

    it('should detect "wedding party" keywords and show wedding-party banner', () => {
      mockUser = {
        _id: 'user-5',
        fullName: 'Bridesmaid',
        email: 'bridesmaid@test.com',
        isInvited: true,
        isAdmin: false,
        hasRSVPed: true,
        specialInstructions:
          'As a bridesmaid, please wear the specified dress color',
      };
      mockIsLoggedIn = true;

      render(<PersonalizedWelcome />);

      const banner = screen.getByTestId('personalized-welcome-banner');
      expect(banner).toHaveAttribute('data-banner-type', 'wedding-party');
    });

    it('should default to travel banner for generic instructions', () => {
      mockUser = {
        _id: 'user-6',
        fullName: 'Out of Town Guest',
        email: 'guest2@test.com',
        isInvited: true,
        isAdmin: false,
        hasRSVPed: true,
        specialInstructions: 'Airport shuttle available from 9am-5pm',
      };
      mockIsLoggedIn = true;

      render(<PersonalizedWelcome />);

      const banner = screen.getByTestId('personalized-welcome-banner');
      expect(banner).toHaveAttribute('data-banner-type', 'travel');
    });
  });

  describe('RSVP Deadline Warnings', () => {
    it('should show deadline warning within 7 days of RSVP deadline', () => {
      vi.setSystemTime(new Date('2026-09-04')); // 4 days before Sep 8, 2026

      mockUser = {
        _id: 'user-7',
        fullName: 'Procrastinator',
        email: 'late@test.com',
        isInvited: true,
        isAdmin: false,
        hasRSVPed: false,
      };
      mockIsLoggedIn = true;

      render(<PersonalizedWelcome />);

      const banner = screen.getByTestId('personalized-welcome-banner');
      expect(banner).toHaveAttribute('data-banner-type', 'deadline');
      expect(banner).toHaveTextContent(/RSVP deadline is in 4 days/i);
      expect(screen.getByText('RSVP Now')).toHaveAttribute('href', '/rsvp');
    });

    it('should show "1 day" (singular) when deadline is tomorrow', () => {
      vi.setSystemTime(new Date('2026-09-07')); // 1 day before Sep 8, 2026

      mockUser = {
        _id: 'user-8',
        fullName: 'Last Minute',
        email: 'lastminute@test.com',
        isInvited: true,
        isAdmin: false,
        hasRSVPed: false,
      };
      mockIsLoggedIn = true;

      render(<PersonalizedWelcome />);

      const banner = screen.getByTestId('personalized-welcome-banner');
      expect(banner).toHaveTextContent(/RSVP deadline is in 1 day!/i);
    });

    it('should not show deadline warning if already RSVPed', () => {
      vi.setSystemTime(new Date('2025-12-28'));

      mockUser = {
        _id: 'user-9',
        fullName: 'On Time Guest',
        email: 'ontime@test.com',
        isInvited: true,
        isAdmin: false,
        hasRSVPed: true,
      };
      mockIsLoggedIn = true;

      render(<PersonalizedWelcome />);

      // Should show thank-you banner instead of deadline
      const banner = screen.queryByTestId('personalized-welcome-banner');
      if (banner) {
        expect(banner).toHaveAttribute('data-banner-type', 'thank-you');
      }
    });

    it('should not show deadline warning more than 7 days before deadline', () => {
      vi.setSystemTime(new Date('2025-12-20')); // 12 days before Jan 1, 2026

      mockUser = {
        _id: 'user-10',
        fullName: 'Early Guest',
        email: 'early@test.com',
        isInvited: true,
        isAdmin: false,
        hasRSVPed: false,
      };
      mockIsLoggedIn = true;

      render(<PersonalizedWelcome />);

      const banner = screen.getByTestId('personalized-welcome-banner');
      // Should show RSVP reminder instead
      expect(banner).toHaveAttribute('data-banner-type', 'rsvp-reminder');
      expect(banner).toHaveTextContent(/Don't forget to RSVP/i);
    });
  });

  describe('LocalStorage Dismissal', () => {
    it('should allow dismissing a dismissible banner', () => {
      vi.setSystemTime(new Date('2026-02-01'));

      mockUser = {
        _id: 'user-11',
        fullName: 'Thank You User',
        email: 'thankyou@test.com',
        isInvited: true,
        isAdmin: false,
        hasRSVPed: true,
      };
      mockIsLoggedIn = true;

      const { unmount } = render(<PersonalizedWelcome />);

      expect(
        screen.getByTestId('personalized-welcome-banner')
      ).toBeInTheDocument();

      const dismissBtn = screen.getByLabelText(/dismiss/i);
      fireEvent.click(dismissBtn);

      expect(
        screen.queryByTestId('personalized-welcome-banner')
      ).not.toBeInTheDocument();

      unmount();
    });

    it('should persist dismissed banners across renders', () => {
      vi.setSystemTime(new Date('2026-02-01'));

      mockUser = {
        _id: 'user-12',
        fullName: 'Persistent User',
        email: 'persist@test.com',
        isInvited: true,
        isAdmin: false,
        hasRSVPed: true,
      };
      mockIsLoggedIn = true;

      // First render - show banner
      const { unmount } = render(<PersonalizedWelcome />);

      expect(
        screen.getByTestId('personalized-welcome-banner')
      ).toBeInTheDocument();
      const dismissBtn = screen.getByLabelText('Dismiss banner');
      fireEvent.click(dismissBtn);

      // Unmount component
      unmount();

      // Second render - simulate page reload
      render(<PersonalizedWelcome />);

      // Banner should not appear
      expect(
        screen.queryByTestId('personalized-welcome-banner')
      ).not.toBeInTheDocument();
    });

    it('should not show dismiss button for non-dismissible deadline banner', () => {
      vi.setSystemTime(new Date('2026-09-04')); // 4 days before Sep 8, 2026

      mockUser = {
        _id: 'user-13',
        fullName: 'Urgent User',
        email: 'urgent@test.com',
        isInvited: true,
        isAdmin: false,
        hasRSVPed: false,
      };
      mockIsLoggedIn = true;

      render(<PersonalizedWelcome />);

      const banner = screen.getByTestId('personalized-welcome-banner');
      expect(banner).toHaveAttribute('data-banner-type', 'deadline');
      expect(screen.queryByLabelText('Dismiss banner')).not.toBeInTheDocument();
    });
  });

  describe('Banner Display Logic', () => {
    it('should not show banner if user is not logged in', () => {
      mockUser = null;
      mockIsLoggedIn = false;

      render(<PersonalizedWelcome />);

      expect(
        screen.queryByTestId('personalized-welcome-banner')
      ).not.toBeInTheDocument();
    });

    it('should show thank-you banner after RSVP completion', () => {
      vi.setSystemTime(new Date('2026-02-01'));

      mockUser = {
        _id: 'user-14',
        fullName: 'Happy Guest',
        email: 'happy@test.com',
        isInvited: true,
        isAdmin: false,
        hasRSVPed: true,
      };
      mockIsLoggedIn = true;

      render(<PersonalizedWelcome />);

      const banner = screen.getByTestId('personalized-welcome-banner');
      expect(banner).toHaveAttribute('data-banner-type', 'thank-you');
      expect(banner).toHaveTextContent(/Thank you for your RSVP, Happy!/i);
      expect(banner).toHaveTextContent(/We can't wait to celebrate with you/i);
    });

    it('should show RSVP reminder for guests who have not RSVPed (outside deadline window)', () => {
      vi.setSystemTime(new Date('2025-12-15'));

      mockUser = {
        _id: 'user-15',
        fullName: 'Reminder User',
        email: 'reminder@test.com',
        isInvited: true,
        isAdmin: false,
        hasRSVPed: false,
      };
      mockIsLoggedIn = true;

      render(<PersonalizedWelcome />);

      const banner = screen.getByTestId('personalized-welcome-banner');
      expect(banner).toHaveAttribute('data-banner-type', 'rsvp-reminder');
      expect(banner).toHaveTextContent(/Welcome, Reminder!/i);
      expect(banner).toHaveTextContent(/Don't forget to RSVP/i);
      expect(screen.getByText('RSVP Now')).toHaveAttribute('href', '/rsvp');
    });
  });
});
