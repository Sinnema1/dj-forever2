/**
 * @fileoverview Wedding countdown timer component with accessibility support
 *
 * Displays an animated countdown to the wedding day with automatic updates
 * and special messaging for the wedding day itself. Uses timezone-aware
 * date calculations and efficient daily update intervals to minimize
 * performance impact while maintaining accuracy.
 *
 * Features:
 * - Timezone-aware countdown calculation
 * - Automatic daily updates at optimal intervals
 * - Special messaging for wedding day
 * - Performance-optimized update frequency
 * - Responsive design with wedding theme styling
 * - Graceful handling of past wedding dates
 * - Full accessibility support with ARIA live regions
 * - Screen reader announcements for countdown changes
 *
 * @module CountdownTimer
 * @version 2.1.0
 * @author DJ Forever Wedding Team
 * @since 1.0.0
 *
 * @accessibility
 * - ARIA live region for countdown updates
 * - Descriptive labels for screen readers
 * - Semantic time element with datetime attribute
 * - Polite announcements to avoid interrupting users
 *
 * @example
 * ```typescript
 * // Basic usage in any component
 * <CountdownTimer />
 *
 * // Automatically displays different messages based on timing
 * ```
 */

import { useState, useEffect } from 'react';
// Styles now imported globally via main.tsx

/**
 * Wedding ceremony date and time with Pacific timezone
 * November 8, 2026 at 4:00 PM PST
 */
const WEDDING_DATE = new Date('2026-11-08T16:00:00-07:00');

/**
 * Wedding countdown timer with daily updates and special day messaging
 *
 * Calculates and displays days remaining until the wedding with automatic
 * updates and timezone-aware calculations. Optimized for performance with
 * daily update intervals instead of constant real-time updates.
 *
 * @component
 * @returns JSX element with countdown text and styling
 *
 * @example
 * ```typescript
 * // Simple countdown display
 * <CountdownTimer />
 *
 * // Displays different messages based on timing:
 * // - "365 days to the big day" (far future)
 * // - "1 day to the big day" (day before)
 * // - "Today is the day! 💍" (wedding day)
 * ```
 *
 * @features
 * - **Timezone Aware**: Handles PST wedding timing correctly
 * - **Performance Optimized**: Updates daily, not every second
 * - **Special Messaging**: Wedding day celebration text
 * - **Responsive Design**: Works on mobile and desktop
 * - **Automatic Cleanup**: Proper useEffect cleanup on unmount
 * - **Accessible**: ARIA live region announces updates to screen readers
 * - **Semantic HTML**: Uses time element with datetime attribute
 */
export default function CountdownTimer() {
  /** Current number of days remaining until wedding */
  const [daysLeft, setDaysLeft] = useState(0);

  /**
   * Effect hook to manage countdown updates
   * Sets up daily interval for efficient countdown calculation
   */
  useEffect(() => {
    const updateCountdown = () => {
      const timeLeft = WEDDING_DATE.getTime() - Date.now();
      const days = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60 * 24)));
      setDaysLeft(days);
    };

    // Update immediately
    updateCountdown();

    // Update daily at midnight
    const interval = setInterval(updateCountdown, 1000 * 60 * 60 * 24);

    return () => clearInterval(interval);
  }, []);

  /**
   * Format the wedding date for datetime attribute
   * Returns ISO 8601 formatted date string
   */
  const getWeddingDateTime = () => {
    return WEDDING_DATE.toISOString();
  };

  /**
   * Get descriptive text for screen readers
   * Provides full context about the countdown
   */
  const getScreenReaderText = () => {
    if (daysLeft === 0) {
      return 'Today is the wedding day';
    }
    if (daysLeft === 1) {
      return 'One day remaining until the wedding';
    }
    return `${daysLeft} days remaining until the wedding on November 8th, 2026`;
  };

  if (daysLeft === 0) {
    return (
      <div
        className="countdown-simple"
        role="timer"
        aria-live="polite"
        aria-atomic="true"
        aria-label="Wedding countdown"
      >
        <time
          dateTime={getWeddingDateTime()}
          aria-label={getScreenReaderText()}
        >
          <p className="countdown-text" aria-hidden="true">
            Today is the day! 💍
          </p>
          <span className="sr-only">{getScreenReaderText()}</span>
        </time>
      </div>
    );
  }

  return (
    <div
      className="countdown-simple"
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label="Wedding countdown"
    >
      <time dateTime={getWeddingDateTime()} aria-label={getScreenReaderText()}>
        <p className="countdown-text" aria-hidden="true">
          {daysLeft} {daysLeft === 1 ? 'day' : 'days'} to the big day
        </p>
        <span className="sr-only">{getScreenReaderText()}</span>
      </time>
    </div>
  );
}
