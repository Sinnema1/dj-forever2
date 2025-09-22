import { Request, Response, NextFunction } from "express";
// import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';
import { logger } from "../utils/logger";

/**
 * Security middleware for rate limiting
 * Note: Requires express-rate-limit package
 */
export const createRateLimiter = (
  windowMs: number = 15 * 60 * 1000,
  max: number = 100
) => {
  // TODO: Install express-rate-limit package and uncomment
  // return rateLimit({
  //   windowMs, // 15 minutes by default
  //   max, // limit each IP to max requests per windowMs
  //   message: {
  //     error: 'Too many requests from this IP, please try again later.',
  //     code: 'RATE_LIMIT_EXCEEDED'
  //   },
  //   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  //   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  //   handler: (req: Request, res: Response) => {
  //     logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
  //       ip: req.ip,
  //       userAgent: req.get('User-Agent'),
  //       path: req.path
  //     });

  //     res.status(429).json({
  //       error: 'Too many requests from this IP, please try again later.',
  //       code: 'RATE_LIMIT_EXCEEDED',
  //       retryAfter: Math.round(windowMs / 1000)
  //     });
  //   }
  // });

  // Simple in-memory rate limiter as placeholder
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const window = requests.get(key);

    if (!window || now > window.resetTime) {
      requests.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (window.count >= max) {
      logger.warn(`Rate limit exceeded for IP: ${key}`, {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        path: req.path,
      });

      return res.status(429).json({
        error: "Too many requests from this IP, please try again later.",
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: Math.round((window.resetTime - now) / 1000),
      });
    }

    window.count++;
    next();
  };
};

/**
 * Security middleware for helmet (security headers)
 * Note: Requires helmet package
 */
export const securityHeaders = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  // TODO: Install helmet package and use proper helmet middleware
  // Basic security headers as placeholder
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  next();
};

/**
 * Request logging middleware
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  // Log request
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    contentType: req.get("Content-Type"),
  });

  // Log response when finished
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? "warn" : "info";

    logger[logLevel](`${req.method} ${req.path} - ${res.statusCode}`, {
      ip: req.ip,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get("Content-Length"),
    });
  });

  next();
};

/**
 * Error handling middleware
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error("Unhandled error:", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Don't expose stack traces in production
  const isDevelopment = process.env.NODE_ENV === "development";

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    code: err.code || "INTERNAL_ERROR",
    ...(isDevelopment && { stack: err.stack }),
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  logger.warn(`404 Not Found: ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  res.status(404).json({
    error: "Not Found",
    code: "NOT_FOUND",
    path: req.path,
  });
};

/**
 * Health check middleware
 */
export const healthCheck = (_req: Request, res: Response): void => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
};
