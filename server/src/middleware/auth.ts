/**
 * @fileoverview Authentication Middleware for DJ Forever 2 Wedding Website
 * @module middleware/auth
 * @version 1.0.0
 *
 * Express middleware for JWT token authentication and user context management.
 * Provides comprehensive authentication handling including token validation,
 * user extraction, and authorization levels for the wedding website API.
 *
 * Authentication Flow:
 * 1. Extract Bearer token from Authorization header
 * 2. Validate JWT signature and expiration
 * 3. Decode user payload from token
 * 4. Populate req.user with authenticated user data
 * 5. Continue to protected routes or handle authentication errors
 *
 * Middleware Functions:
 * - authMiddleware: Optional authentication (sets req.user or null)
 * - requireAuth: Required authentication (returns 401 if not authenticated)
 * - requireAdmin: Admin-only access (returns 403 if not admin)
 * - optionalAuth: Alias for authMiddleware for clarity
 *
 * Security Features:
 * - JWT signature validation prevents token tampering
 * - Token expiration checking prevents stale token usage
 * - Graceful error handling without exposing sensitive data
 * - Request logging for security monitoring
 * - Proper HTTP status codes for different auth failures
 *
 * Integration:
 * - Used by GraphQL context creation for user authentication
 * - Applied to protected REST endpoints
 * - Integrates with authService for token generation
 * - Compatible with QR-based authentication flow
 *
 * @example
 * // Apply to all routes:
 * // app.use(authMiddleware);
 *
 * @example
 * // Protect specific route:
 * // app.get('/admin', requireAuth, requireAdmin, handler);
 *
 * @dependencies
 * - express: HTTP request/response handling
 * - jsonwebtoken: JWT token validation and decoding
 * - ../config: JWT secret configuration
 * - ../utils/logger: Security event logging
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { logger } from "../utils/logger";

/**
 * Extended Express Request interface with authenticated user context.
 * Adds user property to store JWT payload data for authenticated requests.
 *
 * @interface AuthenticatedRequest
 * @extends Request
 * @property {Object | null} user - Authenticated user data from JWT token or null if not authenticated
 * @property {string} user.userId - User's database ID
 * @property {string} user.email - User's email address
 * @property {string} user.fullName - User's full name
 * @property {boolean} user.isAdmin - Administrative privileges flag
 * @property {number} user.iat - Token issued at timestamp
 * @property {number} user.exp - Token expiration timestamp
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    fullName: string;
    isAdmin: boolean;
    iat: number;
    exp: number;
  } | null;
}

export function authMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    let token = req.headers.authorization || "";

    // Extract bearer token
    if (token.startsWith("Bearer ")) {
      token = token.slice(7);
    } else if (!token) {
      // No token provided, continue with null user
      req.user = null;
      return next();
    }

    // Verify JWT token
    try {
      const decoded = jwt.verify(token, config.auth.jwtSecret) as any;

      // Validate token structure
      if (!decoded.userId || !decoded.email) {
        logger.warn("Invalid token structure:", { decoded });
        req.user = null;
        return next();
      }

      // Check token expiration
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTime) {
        logger.warn("Token expired:", {
          exp: decoded.exp,
          current: currentTime,
        });
        req.user = null;
        return next();
      }

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        fullName: decoded.fullName,
        isAdmin: decoded.isAdmin || false,
        iat: decoded.iat,
        exp: decoded.exp,
      };

      logger.debug("User authenticated successfully:", {
        userId: decoded.userId,
        email: decoded.email,
      });
    } catch (jwtError) {
      if (jwtError instanceof jwt.JsonWebTokenError) {
        logger.warn("Invalid JWT token:", jwtError.message);
      } else if (jwtError instanceof jwt.TokenExpiredError) {
        logger.warn("JWT token expired:", jwtError.message);
      } else {
        logger.error("JWT verification error:", jwtError);
      }
      req.user = null;
    }
  } catch (error) {
    logger.error("Auth middleware error:", error);
    req.user = null;
  }

  next();
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Response | void {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
      code: "AUTH_REQUIRED",
    });
  }
  next();
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Response | void {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
      code: "AUTH_REQUIRED",
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      error: "Admin access required",
      code: "ADMIN_REQUIRED",
    });
  }

  next();
}

export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  // This is just an alias for authMiddleware for clarity
  authMiddleware(req, res, next);
}
