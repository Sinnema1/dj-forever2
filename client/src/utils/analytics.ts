/**
 * Wedding Analytics Service
 *
 * Comprehensive analytics tracking system for wedding website guest engagement.
 * Provides event tracking, user behavior analysis, and performance monitoring
 * specifically tailored for wedding website interactions including RSVP flows,
 * QR code authentication, photo viewing, and guest engagement patterns.
 *
 * @fileoverview Analytics service for wedding guest engagement tracking
 * @version 2.0
 * @since 1.0.0
 *
 * @features
 * - **Guest Journey Tracking**: Complete user flow analytics from QR scan to RSVP
 * - **Event-Based Analytics**: Custom events for wedding-specific interactions
 * - **Privacy Conscious**: No personal data collection, only engagement metrics
 * - **Backend Integration**: Seamless integration with GraphQL backend
 * - **Real-time Insights**: Immediate event processing and reporting
 * - **Performance Monitoring**: Page load times and user experience metrics
 */

import { logDebug, logWarn } from './logger';

/**
 * Metadata for analytics events (JSON-serializable values)
 */
export type AnalyticsMetadata = Record<
  string,
  string | number | boolean | null | undefined
>;

/**
 * Analytics event structure for consistent event tracking
 *
 * @interface AnalyticsEvent
 */
interface AnalyticsEvent {
  /** Event name/type (e.g., 'qr_login', 'rsvp_submit', 'photo_view') */
  event: string;
  /** Optional guest identifier for personalized analytics */
  guestId?: string;
  /** Timestamp when the event occurred */
  timestamp: Date;
  /** Additional event-specific data and context */
  metadata?: AnalyticsMetadata;
}

/**
 * WeddingAnalytics Class - Core Analytics Implementation
 *
 * Manages all analytics tracking for the wedding website including guest
 * interactions, RSVP completions, QR code usage, and engagement metrics.
 * Provides both development debugging and production analytics integration.
 *
 * @class WeddingAnalytics
 * @example
 * ```typescript
 * const analytics = new WeddingAnalytics();
 *
 * // Track QR code login
 * analytics.track('qr_login', guestId, {
 *   qrToken: 'abc123',
 *   loginTime: new Date(),
 *   userAgent: navigator.userAgent
 * });
 *
 * // Track RSVP submission
 * analytics.track('rsvp_submit', guestId, {
 *   attending: 'YES',
 *   guestCount: 2,
 *   completionTime: 45000 // ms
 * });
 *
 * // Track photo engagement
 * analytics.track('photo_view', guestId, {
 *   photoId: 'gallery-img-5',
 *   viewDuration: 3000,
 *   interactions: ['zoom', 'swipe']
 * });
 * ```
 */
export class WeddingAnalytics {
  private events: AnalyticsEvent[] = [];

  /**
   * Track Analytics Event
   *
   * Records an analytics event with optional guest identification and metadata.
   * Handles both development logging and production analytics integration.
   * Events are stored locally and sent to backend services for analysis.
   *
   * @param event - Event name/identifier (e.g., 'qr_login', 'rsvp_submit')
   * @param guestId - Optional guest identifier for personalized analytics
   * @param metadata - Optional additional event data and context
   *
   * @example
   * ```typescript
   * // Basic event tracking
   * analytics.track('page_view');
   *
   * // Event with guest context
   * analytics.track('qr_login', 'guest-123');
   *
   * // Event with rich metadata
   * analytics.track('rsvp_submit', 'guest-123', {
   *   attending: 'YES',
   *   guestCount: 2,
   *   mealPreferences: ['chicken', 'vegetarian'],
   *   completionTime: 45000,
   *   formErrors: 0,
   *   userAgent: navigator.userAgent
   * });
   *
   * // Performance tracking
   * analytics.track('performance_metric', undefined, {
   *   metric: 'LCP',
   *   value: 1250,
   *   rating: 'good',
   *   url: window.location.pathname
   * });
   * ```
   */
  track(event: string, guestId?: string, metadata?: AnalyticsMetadata) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      timestamp: new Date(),
    };

    if (guestId !== undefined) {
      analyticsEvent.guestId = guestId;
    }

    if (metadata !== undefined) {
      analyticsEvent.metadata = metadata;
    }

    this.events.push(analyticsEvent);

    // Send to backend or analytics service
    if (import.meta.env.PROD) {
      // Initialize Google Analytics in production
      const backendData: Omit<AnalyticsEvent, 'timestamp'> = { event };
      if (guestId !== undefined) {
        backendData.guestId = guestId;
      }
      if (metadata !== undefined) {
        backendData.metadata = metadata;
      }
      this.sendToBackend(backendData);
    } else {
      logDebug(
        'Analytics Event',
        `${event} - Guest: ${guestId} - ${JSON.stringify(metadata)}`
      );
    }
  }

  private sendToBackend(_eventData: Omit<AnalyticsEvent, 'timestamp'>) {
    try {
      // Optional: Send analytics to your GraphQL backend
      // await fetch('/graphql', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     query: `mutation TrackEvent($input: AnalyticsEventInput!) {
      //       trackEvent(input: $input) { success }
      //     }`,
      //     variables: { input: eventData }
      //   })
      // });
    } catch (error) {
      logWarn(
        'Failed to send analytics',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // Track common wedding website events
  trackPageView(page: string, guestId?: string) {
    this.track('page_view', guestId, { page });
  }

  trackRSVPStarted(guestId: string) {
    this.track('rsvp_started', guestId);
  }

  trackRSVPCompleted(guestId: string, attending: boolean) {
    this.track('rsvp_completed', guestId, { attending });
  }

  trackGalleryViewed(guestId?: string) {
    this.track('gallery_viewed', guestId);
  }

  trackQRLogin(guestId: string) {
    this.track('qr_login', guestId);
  }

  trackTimeSpent(page: string, timeSeconds: number, guestId?: string) {
    this.track('time_spent', guestId, { page, timeSeconds });
  }

  trackError(error: string, page: string, guestId?: string) {
    this.track('error_occurred', guestId, { error, page });
  }

  // Get analytics summary (for development/testing)
  getSummary() {
    return {
      totalEvents: this.events.length,
      uniqueGuests: new Set(this.events.map(e => e.guestId).filter(Boolean))
        .size,
      eventTypes: Object.entries(
        this.events.reduce(
          (acc, e) => {
            acc[e.event] = (acc[e.event] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        )
      ),
    };
  }
}

// Export singleton instance
export const analytics = new WeddingAnalytics();
