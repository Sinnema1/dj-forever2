// Performance monitoring utility for wedding website
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Core Web Vitals monitoring
    if ("PerformanceObserver" in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          renderTime: number;
          loadTime: number;
        };

        const lcp = lastEntry.renderTime || lastEntry.loadTime;
        this.metrics.set("lcp", lcp);

        if (lcp > 2500) {
          console.warn(`⚠️ LCP is slow: ${lcp}ms (target: <2500ms)`);
        }
      });

      try {
        lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn("LCP observer not supported");
      }

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEntry & {
            processingStart: number;
            startTime: number;
          };
          const fid = fidEntry.processingStart - fidEntry.startTime;
          this.metrics.set("fid", fid);

          if (fid > 100) {
            console.warn(`⚠️ FID is slow: ${fid}ms (target: <100ms)`);
          }
        });
      });

      try {
        fidObserver.observe({ entryTypes: ["first-input"] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn("FID observer not supported");
      }
    }
  }

  // Track custom performance metrics
  startTimer(name: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.metrics.set(name, duration);

      // Log slow operations
      if (duration > 1000) {
        console.warn(`⚠️ Slow operation "${name}": ${duration.toFixed(2)}ms`);
      }
    };
  }

  // Track page load times
  trackPageLoad(pageName: string) {
    if (typeof window !== "undefined" && window.performance) {
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;

      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        const domContentLoaded =
          navigation.domContentLoadedEventEnd - navigation.fetchStart;

        this.metrics.set(`${pageName}_load_time`, loadTime);
        this.metrics.set(`${pageName}_dom_ready`, domContentLoaded);

        console.log(`📊 ${pageName} Performance:`, {
          loadTime: `${loadTime.toFixed(2)}ms`,
          domReady: `${domContentLoaded.toFixed(2)}ms`,
        });
      }
    }
  }

  // Track component render times
  trackComponentRender(componentName: string) {
    return this.startTimer(`${componentName}_render`);
  }

  // Get performance summary
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  // Get performance score (simplified)
  getPerformanceScore(): { score: number; issues: string[] } {
    const lcp = this.metrics.get("lcp") || 0;
    const fid = this.metrics.get("fid") || 0;
    const issues: string[] = [];

    let score = 100;

    if (lcp > 2500) {
      score -= 30;
      issues.push("LCP too slow (images might be too large)");
    }

    if (fid > 100) {
      score -= 20;
      issues.push("FID too slow (JavaScript might be blocking)");
    }

    return { score: Math.max(0, score), issues };
  }

  // Clean up observers
  disconnect() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();
