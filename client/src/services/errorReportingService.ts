/**
 * Enhanced Error Reporting Service
 * Provides structured error reporting with context and external service integration
 */

import { logger, LogLevel } from '../utils/logger';

// Network connection information from Navigator API
export interface NetworkConnectionInfo {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

// GraphQL error details
export interface GraphQLErrorDetails {
  message?: string;
  locations?: Array<{ line: number; column: number }>;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  timestamp?: string;
  viewport?: { width: number; height: number };
  connection?: NetworkConnectionInfo;
  variables?: unknown;
  graphqlErrors?: GraphQLErrorDetails[];
  networkError?: Error | null;
  method?: string;
  componentStack?: string;
  errorBoundary?: boolean;
  async?: boolean;
  [key: string]: unknown;
}

// Stored error report structure (for localStorage)
export interface StoredErrorReport {
  error: {
    message: string;
    name: string;
  };
  context: ErrorContext;
  level: LogLevel;
  stack?: string;
  fingerprint?: string;
}

export interface ErrorReport {
  error: Error | string;
  context: ErrorContext;
  level: LogLevel;
  stack?: string;
  fingerprint?: string;
}

export class ErrorReportingService {
  private sessionId: string;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateFingerprint(
    error: Error | string,
    context: ErrorContext
  ): string {
    const errorMessage = error instanceof Error ? error.message : error;
    const component = context.component || 'unknown';
    const action = context.action || 'unknown';
    return `${component}-${action}-${errorMessage}`.replace(
      /[^a-zA-Z0-9-]/g,
      '_'
    );
  }

  private enrichContext(context: ErrorContext): ErrorContext {
    // Type assertion for non-standard Navigator API
    const navigatorWithConnection = navigator as Navigator & {
      connection?: {
        effectiveType?: string;
        downlink?: number;
        rtt?: number;
        saveData?: boolean;
      };
    };

    const result: ErrorContext = {
      ...context,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };

    // Only add connection info if available and has data
    if (navigatorWithConnection.connection) {
      const conn = navigatorWithConnection.connection;
      const connInfo: NetworkConnectionInfo = {};

      if (conn.effectiveType) {
        connInfo.effectiveType = conn.effectiveType;
      }
      if (conn.downlink !== undefined) {
        connInfo.downlink = conn.downlink;
      }
      if (conn.rtt !== undefined) {
        connInfo.rtt = conn.rtt;
      }
      if (conn.saveData !== undefined) {
        connInfo.saveData = conn.saveData;
      }

      if (Object.keys(connInfo).length > 0) {
        result.connection = connInfo;
      }
    }

    return result;
  }

  /**
   * Report a critical error that should be tracked and potentially sent to external services
   */
  reportError(error: Error | string, context: ErrorContext = {}): void {
    const enrichedContext = this.enrichContext(context);
    const errorInstance = error instanceof Error ? error : new Error(error);

    const report: ErrorReport = {
      error: errorInstance,
      context: enrichedContext,
      level: LogLevel.ERROR,
      fingerprint: this.generateFingerprint(error, enrichedContext),
    };

    if (errorInstance.stack) {
      report.stack = errorInstance.stack;
    }

    // Log to our internal logger
    logger.error(errorInstance.message, enrichedContext.component, {
      context: enrichedContext,
      stack: errorInstance.stack,
      fingerprint: report.fingerprint,
    });

    // Store for debugging and potential external service integration
    this.storeErrorReport(report);

    // In production, could send to external services
    if (!this.isDevelopment) {
      this.sendToExternalServices(report);
    }
  }

  /**
   * Report a warning that should be tracked but not critical
   */
  reportWarning(message: string, context: ErrorContext = {}): void {
    const enrichedContext = this.enrichContext(context);

    logger.warn(message, enrichedContext.component, {
      context: enrichedContext,
    });
  }

  /**
   * Report GraphQL errors with specific context
   */
  reportGraphQLError(
    error: {
      message?: string;
      graphQLErrors?: GraphQLErrorDetails[];
      networkError?: Error | null;
    },
    operation: string,
    variables?: unknown
  ): void {
    const context: ErrorContext = {
      component: 'GraphQL',
      action: operation,
      variables: this.isDevelopment ? variables : '[REDACTED]',
      ...(error.graphQLErrors && { graphqlErrors: error.graphQLErrors }),
      ...(error.networkError !== undefined && {
        networkError: error.networkError,
      }),
    };

    this.reportError(error.message || 'GraphQL operation failed', context);
  }

  /**
   * Report network errors with request context
   */
  reportNetworkError(error: Error, url: string, method?: string): void {
    const context: ErrorContext = {
      component: 'Network',
      action: `${method || 'REQUEST'} ${url}`,
      url,
      ...(method && { method }),
    };

    this.reportError(error, context);
  }

  /**
   * Report React component errors (for use in Error Boundaries)
   */
  reportComponentError(
    error: Error,
    errorInfo: React.ErrorInfo,
    componentName?: string
  ): void {
    const context: ErrorContext = {
      component: componentName || 'React Component',
      action: 'render',
      ...(errorInfo.componentStack && {
        componentStack: errorInfo.componentStack,
      }),
      errorBoundary: true,
    };

    this.reportError(error, context);
  }

  /**
   * Report async operation failures
   */
  reportAsyncError(
    error: Error,
    operation: string,
    context: ErrorContext = {}
  ): void {
    const enhancedContext: ErrorContext = {
      ...context,
      component: context.component || 'AsyncOperation',
      action: operation,
      async: true,
    };

    this.reportError(error, enhancedContext);
  }

  private storeErrorReport(report: ErrorReport): void {
    try {
      const stored = JSON.parse(localStorage.getItem('error_reports') || '[]');
      stored.push({
        ...report,
        error: {
          message:
            report.error instanceof Error ? report.error.message : report.error,
          name: report.error instanceof Error ? report.error.name : 'Error',
        },
      });

      // Keep only last 20 error reports
      if (stored.length > 20) {
        stored.shift();
      }
      localStorage.setItem('error_reports', JSON.stringify(stored));
    } catch (e) {
      // Silently fail if localStorage is not available
    }
  }

  private sendToExternalServices(report: ErrorReport): void {
    // Placeholder for external error reporting services
    // Examples:
    // - Sentry: Sentry.captureException(report.error, { contexts: { custom: report.context } })
    // - LogRocket: LogRocket.captureException(report.error)
    // - Bugsnag: Bugsnag.notify(report.error, { context: report.context })

    // For now, just ensure it's stored locally
    console.warn(
      'Error report ready for external service:',
      report.fingerprint
    );
  }

  /**
   * Get stored error reports for debugging
   */
  getStoredReports(): StoredErrorReport[] {
    try {
      return JSON.parse(localStorage.getItem('error_reports') || '[]');
    } catch (e) {
      return [];
    }
  }

  /**
   * Clear stored error reports
   */
  clearStoredReports(): void {
    try {
      localStorage.removeItem('error_reports');
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Get session information for debugging
   */
  getSessionInfo(): { sessionId: string; reports: number } {
    return {
      sessionId: this.sessionId,
      reports: this.getStoredReports().length,
    };
  }
}

// Export singleton instance
export const errorReporting = new ErrorReportingService();

// Convenience functions for common error reporting patterns
export const reportError = (error: Error | string, context?: ErrorContext) =>
  errorReporting.reportError(error, context);

export const reportWarning = (message: string, context?: ErrorContext) =>
  errorReporting.reportWarning(message, context);

export const reportGraphQLError = (
  error: {
    message?: string;
    graphQLErrors?: GraphQLErrorDetails[];
    networkError?: Error | null;
  },
  operation: string,
  variables?: unknown
) => errorReporting.reportGraphQLError(error, operation, variables);

export const reportNetworkError = (
  error: Error,
  url: string,
  method?: string
) => errorReporting.reportNetworkError(error, url, method);

export const reportComponentError = (
  error: Error,
  errorInfo: React.ErrorInfo,
  componentName?: string
) => errorReporting.reportComponentError(error, errorInfo, componentName);

export const reportAsyncError = (
  error: Error,
  operation: string,
  context?: ErrorContext
) => errorReporting.reportAsyncError(error, operation, context);
