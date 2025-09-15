/**
 * Production-ready logging utility
 * Provides environment-aware logging with different levels
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  timestamp: string;
  userAgent?: string;
}

class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
  }

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
