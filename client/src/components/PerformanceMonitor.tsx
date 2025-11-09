/**
 * Performance Monitor Component
 * Integrates Core Web Vitals tracking with the React app
 */
/* eslint-disable react-refresh/only-export-components */
// This file exports both PerformanceMonitor component and utility functions - a cohesive performance module

import { useEffect, useRef } from 'react';
import performanceMonitor from '../services/performanceMonitor';

interface PerformanceMonitorProps {
  /** Enable debug logging in development */
  debug?: boolean;
  /** Custom performance thresholds */
  thresholds?: Record<string, { good: number; needsImprovement: number }>;
}

/**
 * Performance monitoring component that tracks Core Web Vitals
 * Should be included once at the app root level
 */
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  debug = false,
}) => {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) {
      return;
    }

    // Only initialize once
    isInitialized.current = true;

    if (debug && import.meta.env?.DEV) {
      // eslint-disable-next-line no-console
      console.log('Performance monitoring initialized');

      // Log performance summary after a delay
      setTimeout(() => {
        const summary = performanceMonitor.getPerformanceSummary();
        // eslint-disable-next-line no-console
        console.table(summary);
      }, 5000);
    }

    // Track component mount performance - add a small delay to ensure App's useEffect runs first
    setTimeout(() => {
      performanceMonitor.markEnd('app-initialization');
    }, 0);
  }, [debug]);

  // This component renders nothing - it's just for side effects
  return null;
};

/**
 * Hook for manual performance tracking in components
 */
export const usePerformanceTracking = () => {
  const trackStart = (measureName: string) => {
    performanceMonitor.markStart(measureName);
  };

  const trackEnd = (measureName: string) => {
    performanceMonitor.markEnd(measureName);
  };

  const getMetric = (metricName: string) => {
    return performanceMonitor.getMetric(metricName);
  };

  const getPerformanceSummary = () => {
    return performanceMonitor.getPerformanceSummary();
  };

  return {
    trackStart,
    trackEnd,
    getMetric,
    getPerformanceSummary,
  };
};

/**
 * Higher-order component for tracking component performance
 */
export function withPerformanceTracking<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  measureName?: string
) {
  const ComponentWithPerformanceTracking = (props: T) => {
    const componentName =
      measureName ||
      WrappedComponent.displayName ||
      WrappedComponent.name ||
      'Component';

    useEffect(() => {
      performanceMonitor.markStart(`${componentName}-render`);

      return () => {
        performanceMonitor.markEnd(`${componentName}-render`);
      };
    }, [componentName]);

    return <WrappedComponent {...props} />;
  };

  ComponentWithPerformanceTracking.displayName = `withPerformanceTracking(${WrappedComponent.displayName || WrappedComponent.name})`;

  return ComponentWithPerformanceTracking;
}

export default PerformanceMonitor;
