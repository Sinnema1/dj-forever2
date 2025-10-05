/**
 * Performance Monitoring Service
 * Tracks Core Web Vitals and sends performance data to analytics
 */

import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

// Simple logger implementation
const logDebug = (message: string, context: string, data?: any) => {
  if (import.meta.env?.DEV) {
    console.log(`[${context}] ${message}`, data || '');
  }
};

const logWarn = (message: string, context: string, data?: any) => {
  console.warn(`[${context}] ${message}`, data || '');
};

// Analytics interface (will be implemented later)
interface AnalyticsService {
  track: (event: string, userId?: string, properties?: Record<string, any>) => void;
  trackPerformance: (data: Record<string, any>) => void;
}

// Simple analytics implementation
const analytics: AnalyticsService = {
  track: (event: string, userId?: string, properties?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', { event, userId, properties });
    }
    // TODO: Integrate with actual analytics service
  },
  trackPerformance: (data: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Data:', data);
    }
    // TODO: Integrate with actual analytics service
  }
};

interface PerformanceThresholds {
  // Core Web Vitals thresholds (Google's recommendations)
  CLS: { good: 0.1, needsImprovement: 0.25 };
  INP: { good: 200, needsImprovement: 500 }; // Interaction to Next Paint (replaces FID in 2024)
  LCP: { good: 2500, needsImprovement: 4000 };
  // Additional metrics
  FCP: { good: 1800, needsImprovement: 3000 };
  TTFB: { good: 800, needsImprovement: 1800 };
}

const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  CLS: { good: 0.1, needsImprovement: 0.25 },
  INP: { good: 200, needsImprovement: 500 },
  LCP: { good: 2500, needsImprovement: 4000 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
};

class PerformanceMonitor {
  private metrics: Map<string, Metric> = new Map();
  private isInitialized = false;

  constructor() {
    this.initializeMonitoring();
  }

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

  private getRating(metricName: keyof PerformanceThresholds, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = this.getThreshold(metricName);
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  private checkPerformanceThreshold(metric: Metric) {
    const { name, value } = metric;
    const rating = this.getRating(name as keyof PerformanceThresholds, value);

    if (rating === 'poor') {
      logWarn(`Poor performance detected: ${name} = ${value}`, 'PerformanceMonitor', {
        metric: name,
        value,
        rating,
        threshold: this.getThreshold(name as keyof PerformanceThresholds),
      });

      // Send performance alert to analytics
      analytics.track('performance_issue', undefined, {
        metric: name,
        value,
        rating,
        userAgent: navigator.userAgent,
        connection: this.getConnectionInfo(),
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
    // @ts-ignore - NetworkInformation is not in TypeScript types yet
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    return {
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
      saveData: connection?.saveData || false,
    };
  }

  private trackResourceTiming() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            this.analyzeResourceTiming(entry as PerformanceResourceTiming);
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    } catch (error) {
      logWarn('Failed to setup resource timing observer', 'PerformanceMonitor', { error });
    }
  }

  private analyzeResourceTiming(entry: PerformanceResourceTiming) {
    const { name, transferSize, duration } = entry;
    
    // Track large resources
    if (transferSize > 500 * 1024) { // 500KB
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
    if (duration > 2000) { // 2 seconds
      logWarn(`Slow resource detected: ${name}`, 'PerformanceMonitor', {
        duration: `${duration.toFixed(2)}ms`,
        size: transferSize ? `${(transferSize / 1024).toFixed(2)} KB` : 'unknown',
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

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (!navigation) return;

    const metrics = {
      dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp_connect: navigation.connectEnd - navigation.connectStart,
      request_response: navigation.responseEnd - navigation.requestStart,
      dom_parsing: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      resource_loading: navigation.loadEventEnd - navigation.domContentLoadedEventEnd,
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
  public getMetric(metricName: string): Metric | undefined {
    return this.metrics.get(metricName);
  }

  public getAllMetrics(): Record<string, Metric> {
    const metrics: Record<string, Metric> = {};
    this.metrics.forEach((metric, name) => {
      metrics[name] = metric;
    });
    return metrics;
  }

  public getPerformanceSummary() {
    const summary: Record<string, any> = {};
    
    this.metrics.forEach((metric, name) => {
      const rating = this.getRating(name as keyof PerformanceThresholds, metric.value);
      summary[name] = {
        value: metric.value,
        rating,
        threshold: this.getThreshold(name as keyof PerformanceThresholds),
      };
    });

    return summary;
  }

  // Manual performance tracking
  public markStart(name: string) {
    try {
      performance.mark(`${name}-start`);
    } catch (error) {
      logWarn(`Failed to create performance mark: ${name}-start`, 'PerformanceMonitor', { error });
    }
  }

  public markEnd(name: string) {
    try {
      performance.mark(`${name}-end`);
      
      // Check if start mark exists before measuring
      const startMarkName = `${name}-start`;
      const marks = performance.getEntriesByName(startMarkName, 'mark');
      
      if (marks.length === 0) {
        logWarn(`Performance start mark not found: ${startMarkName}`, 'PerformanceMonitor');
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
      logWarn(`Failed to create performance measure: ${name}`, 'PerformanceMonitor', { error });
    }
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export for use in components
export default performanceMonitor;