/**
 * @fileoverview Production-ready performance monitoring service for wedding website
 *
 * Comprehensive Core Web Vitals tracking with Google's latest recommendations.
 * Monitors user experience metrics, resource timing, and navigation performance
 * with intelligent thresholds and analytics integration for performance optimization.
 *
 * Features:
 * - Core Web Vitals tracking (CLS, INP, LCP, FCP, TTFB)
 * - Resource timing analysis with size and speed optimization
 * - Navigation timing metrics for page load optimization
 * - Performance threshold alerts with actionable insights
 * - Connection-aware performance analysis
 * - Custom performance measurement tools
 * - Analytics integration for performance trend analysis
 *
 * @module PerformanceMonitor
 * @version 2.0.0
 * @author DJ Forever Wedding Team
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Initialize performance monitoring (automatic)
 * import { performanceMonitor } from './services/performanceMonitor';
 *
 * // Custom performance measurements
 * performanceMonitor.markStart('photo-gallery-load');
 * // ... photo loading logic
 * performanceMonitor.markEnd('photo-gallery-load');
 *
 * // Get performance summary
 * const summary = performanceMonitor.getPerformanceSummary();
 * console.log('Current Core Web Vitals:', summary);
 * ```
 *
 * @see {@link https://web.dev/vitals/} Google Core Web Vitals
 * @see {@link https://web.dev/user-centric-performance-metrics/} User-centric metrics
 */

import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { analytics } from './analytics';

/**
 * Performance summary entry for a single metric
 */
export interface PerformanceSummaryEntry {
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  threshold: { good: number; needsImprovement: number } | null;
}

/**
 * Complete performance summary with all metrics
 */
export interface PerformanceSummary {
  [metricName: string]: PerformanceSummaryEntry;
}

/**
 * Debug logging utility for development environment
 * @internal
 * @param message - Log message
 * @param context - Component context for debugging
 * @param data - Optional data object to log
 */
const logDebug = (message: string, context: string, data?: unknown) => {
  if (import.meta.env?.DEV) {
    // eslint-disable-next-line no-console
    console.log(`[${context}] ${message}`, data || '');
  }
};

/**
 * Warning logging utility for performance issues
 * @internal
 * @param message - Warning message
 * @param context - Component context for debugging
 * @param data - Optional data object to log
 */
const logWarn = (message: string, context: string, data?: unknown) => {
  // eslint-disable-next-line no-console
  console.warn(`[${context}] ${message}`, data || '');
};

/**
 * Performance thresholds based on Google's Core Web Vitals recommendations
 * @interface PerformanceThresholds
 *
 * @see {@link https://web.dev/defining-core-web-vitals-thresholds/} Threshold definitions
 */
interface PerformanceThresholds {
  /** Cumulative Layout Shift - visual stability metric */
  CLS: { good: 0.1; needsImprovement: 0.25 };
  /** Interaction to Next Paint - responsiveness metric (replaces FID in 2024) */
  INP: { good: 200; needsImprovement: 500 };
  /** Largest Contentful Paint - loading performance metric */
  LCP: { good: 2500; needsImprovement: 4000 };
  /** First Contentful Paint - initial loading metric */
  FCP: { good: 1800; needsImprovement: 3000 };
  /** Time to First Byte - server response metric */
  TTFB: { good: 800; needsImprovement: 1800 };
}

/**
 * Google's recommended performance thresholds for Core Web Vitals
 * Values in milliseconds (except CLS which is a score)
 */
const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  CLS: { good: 0.1, needsImprovement: 0.25 },
  INP: { good: 200, needsImprovement: 500 },
  LCP: { good: 2500, needsImprovement: 4000 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
};

/**
 * Production-ready performance monitoring service
 *
 * Automatically tracks Core Web Vitals and provides intelligent performance analysis
 * for wedding website optimization. Integrates with analytics for trend monitoring
 * and provides real-time performance alerts for poor user experience detection.
 *
 * @class PerformanceMonitor
 * @version 2.0.0
 *
 * @example
 * ```typescript
 * // Automatic initialization on import
 * const monitor = new PerformanceMonitor();
 *
 * // Custom performance tracking
 * monitor.markStart('rsvp-submission');
 * await submitRSVP(formData);
 * monitor.markEnd('rsvp-submission');
 *
 * // Performance analysis
 * const summary = monitor.getPerformanceSummary();
 * if (summary.LCP?.rating === 'poor') {
 *   console.warn('LCP needs improvement:', summary.LCP.value);
 * }
 * ```
 *
 * @see {@link https://web.dev/vitals/} Core Web Vitals Guide
 */
class PerformanceMonitor {
  /** Internal storage for performance metrics */
  private metrics: Map<string, Metric> = new Map();
  /** Initialization flag to prevent duplicate setup */
  private isInitialized = false;

  /**
   * Initialize performance monitoring service
   * Automatically sets up Core Web Vitals tracking and resource monitoring
   */
  constructor() {
    this.initializeMonitoring();
  }

  /**
   * Initialize Core Web Vitals monitoring and resource tracking
   * Sets up observers for all performance metrics with proper error handling
   * @private
   */
  private initializeMonitoring() {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    logDebug('Initializing Core Web Vitals monitoring', 'PerformanceMonitor');

    // Track Core Web Vitals
    onCLS((metric: Metric) => this.handleMetric(metric));
    onINP((metric: Metric) => this.handleMetric(metric));
    onFCP((metric: Metric) => this.handleMetric(metric));
    onLCP((metric: Metric) => this.handleMetric(metric));
    onTTFB((metric: Metric) => this.handleMetric(metric));

    // Track custom performance metrics
    this.trackResourceTiming();
    this.trackNavigationTiming();

    this.isInitialized = true;
  }

  /**
   * Handle incoming performance metrics from web-vitals library
   * Stores metrics, sends to analytics, and checks performance thresholds
   * @private
   * @param metric - Performance metric from web-vitals
   */
  private handleMetric(metric: Metric) {
    const { name, value, rating } = metric;

    // Store metric
    this.metrics.set(name, metric);

    // Log performance data
    logDebug(`Core Web Vital: ${name}`, 'PerformanceMonitor', {
      value,
      rating,
      threshold: this.getThreshold(name as keyof PerformanceThresholds),
    });

    // Send to analytics
    this.sendToAnalytics(metric);

    // Check for performance issues
    this.checkPerformanceThreshold(metric);
  }

  private getThreshold(metricName: keyof PerformanceThresholds) {
    return PERFORMANCE_THRESHOLDS[metricName] || null;
  }

  private getRating(
    metricName: keyof PerformanceThresholds,
    value: number
  ): 'good' | 'needs-improvement' | 'poor' {
    const threshold = this.getThreshold(metricName);
    if (!threshold) {
      return 'good';
    }

    if (value <= threshold.good) {
      return 'good';
    }
    if (value <= threshold.needsImprovement) {
      return 'needs-improvement';
    }
    return 'poor';
  }

  private checkPerformanceThreshold(metric: Metric) {
    const { name, value } = metric;
    const rating = this.getRating(name as keyof PerformanceThresholds, value);

    if (rating === 'poor') {
      logWarn(
        `Poor performance detected: ${name} = ${value}`,
        'PerformanceMonitor',
        {
          metric: name,
          value,
          rating,
          threshold: this.getThreshold(name as keyof PerformanceThresholds),
        }
      );

      // Send performance alert to analytics
      const conn = this.getConnectionInfo();
      analytics.track('performance_issue', undefined, {
        metric: name,
        value,
        rating,
        userAgent: navigator.userAgent,
        connectionType: conn.effectiveType || 'unknown',
        connectionDownlink: conn.downlink || 0,
        connectionRtt: conn.rtt || 0,
      });
    }
  }

  private sendToAnalytics(metric: Metric) {
    const { name, value, id, delta } = metric;

    // Send Core Web Vitals to analytics
    analytics.trackPerformance({
      metric_name: name,
      metric_value: value,
      metric_id: id,
      metric_delta: delta,
      user_agent: navigator.userAgent,
      connection_type: this.getConnectionInfo().effectiveType,
      page_url: window.location.pathname,
      timestamp: Date.now(),
    });
  }

  private getConnectionInfo() {
    // NetworkInformation API type definition
    type NavigatorWithConnection = Navigator & {
      connection?: {
        effectiveType?: string;
        downlink?: number;
        rtt?: number;
        saveData?: boolean;
      };
      mozConnection?: {
        effectiveType?: string;
        downlink?: number;
        rtt?: number;
        saveData?: boolean;
      };
      webkitConnection?: {
        effectiveType?: string;
        downlink?: number;
        rtt?: number;
        saveData?: boolean;
      };
    };

    const nav = navigator as NavigatorWithConnection;
    const connection =
      nav.connection || nav.mozConnection || nav.webkitConnection;

    return {
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
      saveData: connection?.saveData || false,
    };
  }

  private trackResourceTiming() {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    try {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'resource') {
            this.analyzeResourceTiming(entry as PerformanceResourceTiming);
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    } catch (error) {
      logWarn(
        'Failed to setup resource timing observer',
        'PerformanceMonitor',
        { error }
      );
    }
  }

  private analyzeResourceTiming(entry: PerformanceResourceTiming) {
    const { name, transferSize, duration } = entry;

    // Track large resources
    if (transferSize > 500 * 1024) {
      // 500KB
      logWarn(`Large resource detected: ${name}`, 'PerformanceMonitor', {
        size: `${(transferSize / 1024).toFixed(2)} KB`,
        duration: `${duration.toFixed(2)}ms`,
      });

      analytics.track('large_resource_loaded', undefined, {
        resource_url: name,
        resource_size: transferSize,
        load_duration: duration,
      });
    }

    // Track slow resources
    if (duration > 2000) {
      // 2 seconds
      logWarn(`Slow resource detected: ${name}`, 'PerformanceMonitor', {
        duration: `${duration.toFixed(2)}ms`,
        size: transferSize
          ? `${(transferSize / 1024).toFixed(2)} KB`
          : 'unknown',
      });

      analytics.track('slow_resource_loaded', undefined, {
        resource_url: name,
        load_duration: duration,
        resource_size: transferSize,
      });
    }
  }

  private trackNavigationTiming() {
    // Wait for page load to complete
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.analyzeNavigationTiming();
      }, 0);
    });
  }

  private analyzeNavigationTiming() {
    if (!('performance' in window) || !window.performance.navigation) {
      return;
    }

    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;

    if (!navigation) {
      return;
    }

    const metrics = {
      dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp_connect: navigation.connectEnd - navigation.connectStart,
      request_response: navigation.responseEnd - navigation.requestStart,
      dom_parsing:
        navigation.domContentLoadedEventEnd -
        navigation.domContentLoadedEventStart,
      resource_loading:
        navigation.loadEventEnd - navigation.domContentLoadedEventEnd,
      total_load_time: navigation.loadEventEnd - navigation.fetchStart,
    };

    logDebug('Navigation timing metrics', 'PerformanceMonitor', metrics);

    // Send navigation metrics to analytics
    analytics.track('navigation_timing', undefined, {
      ...metrics,
      navigation_type: navigation.type,
      page_url: window.location.pathname,
    });
  }

  // Public API methods

  /**
   * Get a specific performance metric by name
   * @public
   * @param metricName - Name of the metric (CLS, INP, LCP, FCP, TTFB)
   * @returns The metric object or undefined if not found
   *
   * @example
   * ```typescript
   * const lcp = performanceMonitor.getMetric('LCP');
   * if (lcp && lcp.value > 2500) {
   *   console.warn('LCP is slower than recommended');
   * }
   * ```
   */
  public getMetric(metricName: string): Metric | undefined {
    return this.metrics.get(metricName);
  }

  /**
   * Get all collected performance metrics
   * @public
   * @returns Object containing all metrics keyed by metric name
   *
   * @example
   * ```typescript
   * const allMetrics = performanceMonitor.getAllMetrics();
   * Object.entries(allMetrics).forEach(([name, metric]) => {
   *   console.log(`${name}: ${metric.value}ms (${metric.rating})`);
   * });
   * ```
   */
  public getAllMetrics(): Record<string, Metric> {
    const metrics: Record<string, Metric> = {};
    this.metrics.forEach((metric, name) => {
      metrics[name] = metric;
    });
    return metrics;
  }

  /**
   * Get performance summary with ratings and thresholds
   * Provides actionable insights for each Core Web Vital
   * @public
   * @returns Summary object with ratings and threshold information
   *
   * @example
   * ```typescript
   * const summary = performanceMonitor.getPerformanceSummary();
   * if (summary.LCP?.rating === 'poor') {
   *   // Optimize images, use CDN, improve server response
   *   console.warn('LCP needs improvement:', summary.LCP.value);
   * }
   * ```
   */
  public getPerformanceSummary(): PerformanceSummary {
    const summary: PerformanceSummary = {};

    this.metrics.forEach((metric, name) => {
      const rating = this.getRating(
        name as keyof PerformanceThresholds,
        metric.value
      );
      summary[name] = {
        value: metric.value,
        rating,
        threshold: this.getThreshold(name as keyof PerformanceThresholds),
      };
    });

    return summary;
  }

  /**
   * Start custom performance measurement
   * Use for measuring specific operations like RSVP submission or photo loading
   * @public
   * @param name - Unique name for the performance measurement
   *
   * @example
   * ```typescript
   * // Measure photo gallery loading time
   * performanceMonitor.markStart('photo-gallery-load');
   * await loadPhotoGallery();
   * performanceMonitor.markEnd('photo-gallery-load');
   * ```
   */
  public markStart(name: string) {
    try {
      performance.mark(`${name}-start`);
    } catch (error) {
      logWarn(
        `Failed to create performance mark: ${name}-start`,
        'PerformanceMonitor',
        { error }
      );
    }
  }

  /**
   * End custom performance measurement and send to analytics
   * Automatically calculates duration and sends to analytics service
   * @public
   * @param name - Name matching the markStart() call
   *
   * @example
   * ```typescript
   * // Measure RSVP form submission
   * performanceMonitor.markStart('rsvp-submission');
   * try {
   *   await submitRSVP(formData);
   *   performanceMonitor.markEnd('rsvp-submission'); // Success measurement
   * } catch (error) {
   *   performanceMonitor.markEnd('rsvp-submission-error'); // Error measurement
   * }
   * ```
   */
  public markEnd(name: string) {
    try {
      performance.mark(`${name}-end`);

      // Check if start mark exists before measuring
      const startMarkName = `${name}-start`;
      const marks = performance.getEntriesByName(startMarkName, 'mark');

      if (marks.length === 0) {
        logWarn(
          `Performance start mark not found: ${startMarkName}`,
          'PerformanceMonitor'
        );
        return;
      }

      performance.measure(name, startMarkName, `${name}-end`);

      const measures = performance.getEntriesByName(name, 'measure');
      const measure = measures[measures.length - 1];

      if (measure) {
        logDebug(`Custom performance measure: ${name}`, 'PerformanceMonitor', {
          duration: `${measure.duration.toFixed(2)}ms`,
        });

        analytics.track('custom_performance_measure', undefined, {
          measure_name: name,
          duration: measure.duration,
        });
      }
    } catch (error) {
      logWarn(
        `Failed to create performance measure: ${name}`,
        'PerformanceMonitor',
        { error }
      );
    }
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export for use in components
export default performanceMonitor;
