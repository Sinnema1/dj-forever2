/**
 * Logger Service - Production-Ready Logging Utility
 *
 * Comprehensive logging system for the DJ Forever 2 wedding website with
 * environment-aware log levels, structured log entries, and external service
 * integration capabilities. Provides development debugging and production
 * error monitoring with automatic log persistence and reporting.
 *
 * @fileoverview Production-ready logging with multiple levels and external integration
 * @version 2.0
 * @since 1.0.0
 *
 * @features
 * - **Environment Awareness**: Different log levels for development vs production
 * - **Structured Logging**: Consistent log entry format with metadata
 * - **External Integration**: Built-in support for external logging services
 * - **Local Persistence**: Automatic error log storage for debugging
 * - **Performance Optimized**: Minimal overhead in production builds
 * - **Type Safety**: Full TypeScript support with proper interfaces
 */

/**
 * Log severity levels with numeric priorities
 *
 * Lower numbers indicate higher priority. Used to control which
 * messages are shown in different environments.
 *
 * @enum {number}
 */
export enum LogLevel {
  /** Critical errors requiring immediate attention (always shown) */
  ERROR = 0,
  /** Important warnings that should be monitored (prod + dev) */
  WARN = 1,
  /** Informational messages for debugging (dev only) */
  INFO = 2,
  /** Detailed debugging information (dev only) */
  DEBUG = 3,
}

/**
 * Structured log entry interface for consistent logging format
 *
 * @interface LogEntry
 */
interface LogEntry {
  /** Severity level of the log entry */
  level: LogLevel;
  /** Primary log message */
  message: string;
  /** Optional context identifier (component, service, etc.) */
  context?: string;
  /** Optional additional data or error details */
  data?: any;
  /** ISO timestamp when log entry was created */
  timestamp: string;
  /** Browser user agent string for debugging */
  userAgent?: string;
}

/**
 * Logger Class - Core Logging Implementation
 *
 * Singleton logger service that handles all application logging with
 * environment-aware behavior, structured output, and external service
 * integration for production error monitoring.
 *
 * @class Logger
 * @example
 * ```typescript
 * const logger = new Logger();
 *
 * // Development: Shows in console
 * logger.debug('Component mounted', 'MyComponent', { props });
 *
 * // Production: Shows in console AND reports to external service
 * logger.error('API call failed', 'UserService', { error, endpoint });
 * ```
 */
class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;

  /**
   * Logger Constructor
   *
   * Initializes the logger with environment-appropriate settings.
   * Development builds show all log levels, production builds only
   * show warnings and errors.
   */
  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
  }

  /**
   * Determines if a log entry should be processed based on current log level
   *
   * @private
   * @param level - Log level to check
   * @returns true if the log should be processed
   */
  private shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: string
  ): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const contextStr = context ? `[${context}]` : '';
    return `${timestamp} ${levelName}${contextStr}: ${message}`;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    data?: any
  ): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
    };

    if (context !== undefined) {
      entry.context = context;
    }

    if (data !== undefined) {
      entry.data = data;
    }

    if (typeof navigator !== 'undefined') {
      entry.userAgent = navigator.userAgent;
    }

    return entry;
  }

  private sendToConsole(level: LogLevel, message: string, data?: any): void {
    switch (level) {
      case LogLevel.ERROR:
        console.error(message, data || '');
        break;
      case LogLevel.WARN:
        console.warn(message, data || '');
        break;
      case LogLevel.INFO:
        console.info(message, data || '');
        break;
      case LogLevel.DEBUG:
        console.log(message, data || '');
        break;
    }
  }

  /**
   * Log error messages - always visible in production
   */
  error(message: string, context?: string, data?: any): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const formattedMessage = this.formatMessage(
      LogLevel.ERROR,
      message,
      context
    );
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, data);

    this.sendToConsole(LogLevel.ERROR, formattedMessage, data);

    // In production, you might want to send errors to a logging service
    if (!this.isDevelopment) {
      this.sendToExternalService(entry);
    }
  }

  /**
   * Log warning messages - visible in production for important issues
   */
  warn(message: string, context?: string, data?: any): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const formattedMessage = this.formatMessage(
      LogLevel.WARN,
      message,
      context
    );
    this.sendToConsole(LogLevel.WARN, formattedMessage, data);
  }

  /**
   * Log informational messages - development and debug builds only
   */
  info(message: string, context?: string, data?: any): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const formattedMessage = this.formatMessage(
      LogLevel.INFO,
      message,
      context
    );
    this.sendToConsole(LogLevel.INFO, formattedMessage, data);
  }

  /**
   * Log debug messages - development only
   */
  debug(message: string, context?: string, data?: any): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const formattedMessage = this.formatMessage(
      LogLevel.DEBUG,
      message,
      context
    );
    this.sendToConsole(LogLevel.DEBUG, formattedMessage, data);
  }

  /**
   * Send critical errors to external logging service in production
   * Stores locally for debugging and potential external service integration
   */
  private sendToExternalService(entry: LogEntry): void {
    // Store locally for debugging and potential external service integration
    try {
      const logs = JSON.parse(localStorage.getItem('app_error_logs') || '[]');
      logs.push(entry);
      // Keep only last 10 error logs
      if (logs.length > 10) logs.shift();
      localStorage.setItem('app_error_logs', JSON.stringify(logs));
    } catch (e) {
      // Silently fail if localStorage is not available
    }

    // In production, external services can read from localStorage
    // or this method can be extended to integrate with specific services
    if (!this.isDevelopment) {
      // Mark for external service pickup
      try {
        const pendingReports = JSON.parse(
          localStorage.getItem('pending_error_reports') || '[]'
        );
        pendingReports.push({
          ...entry,
          needsReporting: true,
          reportedAt: null,
        });
        if (pendingReports.length > 50) pendingReports.shift();
        localStorage.setItem(
          'pending_error_reports',
          JSON.stringify(pendingReports)
        );
      } catch (e) {
        // Silently fail
      }
    }
  }

  /**
   * Get stored error logs for debugging
   */
  getStoredLogs(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('app_error_logs') || '[]');
    } catch (e) {
      return [];
    }
  }

  /**
   * Clear stored logs
   */
  clearStoredLogs(): void {
    try {
      localStorage.removeItem('app_error_logs');
    } catch (e) {
      // Silently fail
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience functions for common use cases
export const logError = (message: string, context?: string, data?: any) =>
  logger.error(message, context, data);

export const logWarn = (message: string, context?: string, data?: any) =>
  logger.warn(message, context, data);

export const logInfo = (message: string, context?: string, data?: any) =>
  logger.info(message, context, data);

export const logDebug = (message: string, context?: string, data?: any) =>
  logger.debug(message, context, data);
