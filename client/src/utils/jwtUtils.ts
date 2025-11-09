/**
 * JWT Token Utilities
 *
 * Utility functions for JWT token validation, expiration checking, and decoding.
 * Provides secure token handling without requiring external JWT libraries by
 * using browser-native base64 decoding.
 *
 * @fileoverview JWT token utilities for authentication management
 * @version 1.0.0
 *
 * @features
 * - Token expiration validation
 * - Expiration time extraction
 * - Session warning thresholds
 * - Secure token decoding
 * - Type-safe interfaces
 */

import { logWarn, logError } from './logger';

/**
 * Decoded JWT payload interface
 */
export interface DecodedToken {
  /** User ID from token */
  _id?: string;
  /** User email from token */
  email?: string;
  /** Token issued at timestamp (seconds) */
  iat?: number;
  /** Token expiration timestamp (seconds) */
  exp?: number;
  /** Any other claims in the token */
  [key: string]: unknown;
}

/**
 * Token expiration status
 */
export interface TokenExpirationInfo {
  /** Whether the token is expired */
  isExpired: boolean;
  /** Whether to show expiration warning */
  shouldWarn: boolean;
  /** Time remaining in milliseconds (negative if expired) */
  timeRemaining: number;
  /** Expiration timestamp (milliseconds) */
  expiresAt: number | null;
}

/**
 * Decode JWT token without verification (client-side only)
 *
 * Extracts and parses the payload from a JWT token. This does NOT verify
 * the token signature - verification must be done server-side. This is safe
 * for client-side use to read token metadata like expiration time.
 *
 * @param token - JWT token string
 * @returns Decoded token payload or null if invalid
 *
 * @example
 * ```typescript
 * const token = localStorage.getItem('id_token');
 * const decoded = decodeToken(token);
 * if (decoded?.exp) {
 *   console.log('Token expires at:', new Date(decoded.exp * 1000));
 * }
 * ```
 *
 * @security
 * - Does not verify token signature (server must verify)
 * - Safe for reading token metadata on client
 * - Never trust decoded data for authorization decisions
 */
export function decodeToken(token: string | null): DecodedToken | null {
  if (!token) {
    return null;
  }

  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) {
      logWarn('Invalid JWT format - expected 3 parts', 'jwtUtils', {
        token: '[REDACTED]',
      });
      return null;
    }

    // Decode base64url payload (second part)
    const payload = parts[1];

    // Base64url to base64 conversion
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding if needed
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '='
    );

    // Decode and parse JSON
    const decoded = JSON.parse(atob(padded));

    return decoded as DecodedToken;
  } catch (error) {
    logError('Failed to decode JWT token', 'jwtUtils', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Check if JWT token is expired
 *
 * Validates token expiration by comparing the exp claim with current time.
 * Returns true if token is expired or invalid.
 *
 * @param token - JWT token string
 * @returns true if token is expired or invalid, false otherwise
 *
 * @example
 * ```typescript
 * const token = localStorage.getItem('id_token');
 * if (isTokenExpired(token)) {
 *   // Auto-logout user
 *   logout();
 * }
 * ```
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) {
    return true;
  }

  const decoded = decodeToken(token);
  if (!decoded?.exp) {
    logWarn('Token missing expiration claim', 'jwtUtils');
    return true;
  }

  // JWT exp is in seconds, Date.now() is in milliseconds
  const now = Date.now() / 1000;
  return decoded.exp < now;
}

/**
 * Get token expiration timestamp
 *
 * Extracts the expiration time from a JWT token.
 *
 * @param token - JWT token string
 * @returns Expiration timestamp in milliseconds, or null if invalid
 *
 * @example
 * ```typescript
 * const expiresAt = getTokenExpirationTime(token);
 * if (expiresAt) {
 *   console.log('Token expires:', new Date(expiresAt).toLocaleString());
 * }
 * ```
 */
export function getTokenExpirationTime(token: string | null): number | null {
  const decoded = decodeToken(token);
  if (!decoded?.exp) {
    return null;
  }

  // Convert seconds to milliseconds
  return decoded.exp * 1000;
}

/**
 * Check if session expiration warning should be shown
 *
 * Determines if user should be warned about upcoming session expiration.
 * Warning threshold is configurable (default: 5 minutes).
 *
 * @param token - JWT token string
 * @param warningThresholdMs - Milliseconds before expiration to show warning (default: 5 minutes)
 * @returns true if warning should be shown, false otherwise
 *
 * @example
 * ```typescript
 * if (shouldWarnExpiration(token)) {
 *   showToast('Your session will expire in 5 minutes', 'warning');
 * }
 * ```
 */
export function shouldWarnExpiration(
  token: string | null,
  warningThresholdMs: number = 5 * 60 * 1000 // 5 minutes
): boolean {
  const expiresAt = getTokenExpirationTime(token);
  if (!expiresAt) {
    return false;
  }

  const now = Date.now();
  const timeRemaining = expiresAt - now;

  // Show warning if token expires within threshold but hasn't expired yet
  return timeRemaining > 0 && timeRemaining <= warningThresholdMs;
}

/**
 * Get comprehensive token expiration information
 *
 * Returns detailed information about token expiration status including
 * whether it's expired, whether to warn, and time remaining.
 *
 * @param token - JWT token string
 * @param warningThresholdMs - Milliseconds before expiration to show warning (default: 5 minutes)
 * @returns Token expiration information object
 *
 * @example
 * ```typescript
 * const info = getTokenExpirationInfo(token);
 * if (info.isExpired) {
 *   logout();
 * } else if (info.shouldWarn) {
 *   const minutes = Math.floor(info.timeRemaining / 60000);
 *   showToast(`Session expires in ${minutes} minutes`, 'warning');
 * }
 * ```
 */
export function getTokenExpirationInfo(
  token: string | null,
  warningThresholdMs: number = 5 * 60 * 1000
): TokenExpirationInfo {
  const expiresAt = getTokenExpirationTime(token);
  const now = Date.now();

  if (!expiresAt) {
    return {
      isExpired: true,
      shouldWarn: false,
      timeRemaining: 0,
      expiresAt: null,
    };
  }

  const timeRemaining = expiresAt - now;
  const isExpired = timeRemaining <= 0;
  const shouldWarn = !isExpired && timeRemaining <= warningThresholdMs;

  return {
    isExpired,
    shouldWarn,
    timeRemaining,
    expiresAt,
  };
}

/**
 * Format time remaining as human-readable string
 *
 * Converts milliseconds to a user-friendly time string.
 *
 * @param ms - Milliseconds
 * @returns Formatted time string (e.g., "5 minutes", "30 seconds")
 *
 * @example
 * ```typescript
 * const remaining = info.timeRemaining;
 * console.log(`Session expires in ${formatTimeRemaining(remaining)}`);
 * // "Session expires in 4 minutes"
 * ```
 */
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) {
    return 'expired';
  }

  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  return `${seconds} second${seconds !== 1 ? 's' : ''}`;
}
