/**
 * @fileoverview Centralized Logging System
 *
 * Configurable structured logging utility providing:
 * - Environment-aware log level filtering
 * - Consistent message formatting with timestamps
 * - Metadata attachment for structured logging
 * - Production-safe logging with level controls
 *
 * Log Levels (ascending verbosity):
 * - ERROR (0): Critical errors requiring immediate attention
 * - WARN (1): Warning conditions that should be investigated
 * - INFO (2): General operational information
 * - DEBUG (3): Detailed debugging information
 *
 * Configuration:
 * - Log level controlled via config.logging.level
 * - Supports structured metadata attachment
 * - ISO timestamp formatting for log aggregation
 *
 * Production Considerations:
 * - Set log level to ERROR or WARN in production
 * - Consider external log aggregation (ELK, Datadog, etc.)
 * - Metadata should not contain sensitive information
 *
 * @author DJ Forever 2 Team
 * @version 1.0.0
 */

import { config } from "../config/index.js";

/**
 * Log level enumeration defining severity hierarchy
 *
 * Numeric values allow efficient level comparison filtering.
 * Lower numbers indicate higher priority/severity levels.
 */
export interface LogLevel {
  /** Critical application errors requiring immediate attention */
  ERROR: 0;
  /** Warning conditions that should be monitored and investigated */
  WARN: 1;
  /** General informational messages about application operations */
  INFO: 2;
  /** Detailed debugging information for development and troubleshooting */
  DEBUG: 3;
}

const LOG_LEVELS: LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

/**
 * Centralized logging utility with configurable output levels
 *
 * Provides structured logging with:
 * - Environment-based log level configuration
 * - Consistent timestamp and metadata formatting
 * - Efficient level-based filtering
 * - JSON metadata serialization
 *
 * @example
 * ```typescript
 * import { logger } from './utils/logger';
 *
 * // Basic logging
 * logger.info('User created successfully');
 * logger.warn('Rate limit approaching');
 * logger.error('Database connection failed');
 *
 * // Structured logging with metadata
 * logger.info('User login', {
 *   userId: '123',
 *   ip: '192.168.1.1',
 *   userAgent: 'Mozilla/5.0...'
 * });
 *
 * // Error logging with context
 * logger.error('Payment processing failed', {
 *   orderId: 'ord_123',
 *   amount: 99.99,
 *   error: error.message
 * });
 * ```
 */
class Logger {
  /** Current active log level threshold */
  private logLevel: number;

  /**
   * Initialize logger with environment-configured log level
   *
   * Reads log level from application config with INFO fallback.
   * Invalid log levels default to INFO for safe operation.
   */
  constructor() {
    const envLogLevel = config.logging.level || "INFO";
    this.logLevel =
      LOG_LEVELS[envLogLevel as keyof LogLevel] ?? LOG_LEVELS.INFO;
  }

  /**
   * Determine if a message should be logged based on current level threshold
   *
   * @param level - Numeric log level to check against current threshold
   * @returns True if level is at or above current log level threshold
   */
  private shouldLog(level: number): boolean {
    return level <= this.logLevel;
  }

  /**
   * Format log message with timestamp, level, and optional metadata
   *
   * Creates structured log format:
   * [ISO_TIMESTAMP] LEVEL: message {"key":"value"}
   *
   * @param level - Log level string for display
   * @param message - Primary log message
   * @param meta - Optional metadata object for structured logging
   * @returns Formatted log string ready for output
   */
  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  }

  /**
   * Log ERROR level messages for critical application failures
   *
   * Use for:
   * - Database connection failures
   * - Unhandled exceptions
   * - Security violations
   * - System resource exhaustion
   *
   * @param message - Error description
   * @param meta - Additional error context (stack traces, request data, etc.)
   */
  error(message: string, meta?: any): void {
    if (this.shouldLog(LOG_LEVELS.ERROR)) {
      console.error(this.formatMessage("ERROR", message, meta));
    }
  }

  /**
   * Log WARN level messages for concerning but non-critical conditions
   *
   * Use for:
   * - Rate limit violations
   * - Deprecated API usage
   * - Performance degradation
   * - Configuration issues
   *
   * @param message - Warning description
   * @param meta - Warning context and diagnostic information
   */
  warn(message: string, meta?: any): void {
    if (this.shouldLog(LOG_LEVELS.WARN)) {
      console.warn(this.formatMessage("WARN", message, meta));
    }
  }

  /**
   * Log INFO level messages for general application operations
   *
   * Use for:
   * - User authentication events
   * - Business logic milestones
   * - Service startup/shutdown
   * - Configuration changes
   *
   * @param message - Informational description
   * @param meta - Operational context and metrics
   */
  info(message: string, meta?: any): void {
    if (this.shouldLog(LOG_LEVELS.INFO)) {
      console.info(this.formatMessage("INFO", message, meta));
    }
  }

  /**
   * Log DEBUG level messages for detailed troubleshooting information
   *
   * Use for:
   * - Function entry/exit tracing
   * - Variable state inspection
   * - Algorithm step-by-step execution
   * - External service interactions
   *
   * @param message - Debug description
   * @param meta - Detailed debugging context and variable states
   */
  debug(message: string, meta?: any): void {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      console.debug(this.formatMessage("DEBUG", message, meta));
    }
  }
}

/**
 * Global logger instance for application-wide logging
 *
 * Pre-configured with environment settings from application config.
 * Use this singleton throughout the application for consistent logging.
 *
 * @example
 * ```typescript
 * import { logger } from '../utils/logger';
 *
 * // Application startup
 * logger.info('Server starting', { port: 3001, environment: 'production' });
 *
 * // Error handling
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   logger.error('Operation failed', {
 *     operation: 'riskyOperation',
 *     error: error.message,
 *     stack: error.stack
 *   });
 * }
 * ```
 */
export const logger = new Logger();
