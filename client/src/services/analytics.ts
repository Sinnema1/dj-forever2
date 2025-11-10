/**
 * @fileoverview Google Analytics 4 (GA4) integration service
 *
 * Provides type-safe GA4 event tracking with automatic initialization
 * and intelligent error handling. Supports custom events, user properties,
 * and performance monitoring integration.
 *
 * @module Analytics
 * @version 1.0.0
 * @author DJ Forever Wedding Team
 *
 * @example
 * ```typescript
 * import { analytics } from './services/analytics';
 *
 * // Track custom event
 * analytics.track('rsvp_submitted', undefined, {
 *   guestCount: 2,
 *   dietaryRestrictions: true
 * });
 *
 * // Track performance metric
 * analytics.trackPerformance({
 *   metric_name: 'LCP',
 *   metric_value: 2300,
 *   metric_rating: 'good'
 * });
 * ```
 *
 * @see {@link https://developers.google.com/analytics/devguides/collection/ga4} GA4 Documentation
 */

/**
 * Properties for analytics event tracking
 */
export interface AnalyticsProperties {
  [key: string]: string | number | boolean | undefined | null;
}

/**
 * Performance metric data for analytics tracking
 */
export interface PerformanceMetricData {
  metric?: string;
  value?: number;
  rating?: string;
  delta?: number;
  id?: string;
  navigationType?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * GA4 gtag interface extension
 * Extends Window interface to include Google Analytics gtag function
 */
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Google Analytics 4 Service
 * Handles all GA4 event tracking with type safety and error handling
 *
 * @class Analytics
 */
class Analytics {
  private measurementId: string | undefined;
  private isInitialized = false;
  private isDevelopment = import.meta.env?.DEV || false;

  /**
   * Initialize GA4 tracking
   * Automatically loads GA4 script and configures measurement ID
   *
   * @param measurementId - GA4 Measurement ID (format: G-XXXXXXXXXX)
   */
  constructor(measurementId?: string) {
    this.measurementId =
      measurementId || import.meta.env?.VITE_GA4_MEASUREMENT_ID;

    if (this.measurementId && !this.isDevelopment) {
      this.initialize();
    } else if (this.isDevelopment) {
      console.log('[Analytics] Development mode - GA4 tracking disabled');
    } else {
      console.warn('[Analytics] GA4 Measurement ID not configured');
    }
  }

  /**
   * Initialize Google Analytics 4
   * Loads GA4 script and configures tracking
   * @private
   */
  private initialize() {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      // Load GA4 script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
      document.head.appendChild(script);

      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];

      // Initialize gtag function
      window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer?.push(arguments);
      };

      // Configure GA4
      window.gtag('js', new Date());
      window.gtag('config', this.measurementId!, {
        send_page_view: true,
        cookie_flags: 'SameSite=None;Secure',
      });

      this.isInitialized = true;
      console.log('[Analytics] GA4 initialized:', this.measurementId);
    } catch (error) {
      console.error('[Analytics] Failed to initialize GA4:', error);
    }
  }

  /**
   * Track custom event with optional user ID and properties
   *
   * @param event - Event name (snake_case recommended)
   * @param userId - Optional user ID for user tracking
   * @param properties - Optional event properties
   *
   * @example
   * ```typescript
   * analytics.track('rsvp_submitted', 'user123', {
   *   guestCount: 2,
   *   attending: true
   * });
   * ```
   */
  public track(
    event: string,
    userId?: string,
    properties?: AnalyticsProperties
  ): void {
    if (this.isDevelopment) {
      console.log('[Analytics] Event:', { event, userId, properties });
      return;
    }

    if (!this.isInitialized || !window.gtag) {
      console.warn('[Analytics] GA4 not initialized, skipping event:', event);
      return;
    }

    try {
      const eventData: AnalyticsProperties = {
        ...properties,
        ...(userId && { user_id: userId }),
      };

      window.gtag('event', event, eventData);
    } catch (error) {
      console.error('[Analytics] Failed to track event:', error);
    }
  }

  /**
   * Track performance metrics to GA4
   * Sends Core Web Vitals and custom performance data
   *
   * @param data - Performance metric data
   *
   * @example
   * ```typescript
   * analytics.trackPerformance({
   *   metric_name: 'LCP',
   *   metric_value: 2300,
   *   metric_rating: 'good'
   * });
   * ```
   */
  public trackPerformance(data: PerformanceMetricData): void {
    if (this.isDevelopment) {
      console.log('[Analytics] Performance:', data);
      return;
    }

    if (!this.isInitialized || !window.gtag) {
      return;
    }

    try {
      // Send as custom event to GA4
      window.gtag('event', 'performance_metric', {
        event_category: 'Performance',
        event_label: data.metric || data.metric_name,
        value: data.value || data.metric_value,
        metric_rating: data.rating || data.metric_rating,
        metric_id: data.id || data.metric_id,
        metric_delta: data.delta || data.metric_delta,
        page_path: window.location.pathname,
      });
    } catch (error) {
      console.error('[Analytics] Failed to track performance:', error);
    }
  }

  /**
   * Set user properties for analytics
   * Useful for tracking user cohorts and segments
   *
   * @param properties - User properties to set
   *
   * @example
   * ```typescript
   * analytics.setUserProperties({
   *   is_invited: true,
   *   is_admin: false,
   *   guest_group: 'family'
   * });
   * ```
   */
  public setUserProperties(properties: AnalyticsProperties): void {
    if (this.isDevelopment) {
      console.log('[Analytics] User Properties:', properties);
      return;
    }

    if (!this.isInitialized || !window.gtag) {
      return;
    }

    try {
      window.gtag('set', 'user_properties', properties);
    } catch (error) {
      console.error('[Analytics] Failed to set user properties:', error);
    }
  }

  /**
   * Track page view (automatic on route change with React Router)
   * @param path - Page path
   * @param title - Page title
   */
  public trackPageView(path: string, title?: string): void {
    if (this.isDevelopment) {
      console.log('[Analytics] Page View:', { path, title });
      return;
    }

    if (!this.isInitialized || !window.gtag) {
      return;
    }

    try {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: title || document.title,
        page_location: window.location.href,
      });
    } catch (error) {
      console.error('[Analytics] Failed to track page view:', error);
    }
  }
}

// Create singleton instance
// Measurement ID should be set in .env as VITE_GA4_MEASUREMENT_ID
export const analytics = new Analytics();

export default analytics;
