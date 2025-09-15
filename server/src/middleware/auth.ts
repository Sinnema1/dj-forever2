import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { logger } from "../utils/logger";

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
