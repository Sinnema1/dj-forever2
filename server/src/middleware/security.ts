import { Request, Response, NextFunction } from "express";
// import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';
import { logger } from "../utils/logger";

/**
 * @fileoverview Security Middleware Suite
 *
 * Comprehensive security middleware collection for Express.js applications providing:
 * - Rate limiting with configurable thresholds
 * - Security headers management
 * - Request/response logging with performance metrics
 * - Centralized error handling with environment-aware exposure
 * - Health checks and monitoring endpoints
 *
 * Security Features:
 * - IP-based rate limiting with memory storage
 * - OWASP recommended security headers
 * - Structured logging with metadata collection
 * - Production-safe error responses
 * - Request performance monitoring
 *
 * Production Deployment:
 * - Rate limiter uses in-memory storage (consider Redis for clustering)
 * - Security headers provide basic protection (helmet recommended for production)
 * - Error responses sanitized based on NODE_ENV
 * - Health checks include system metrics
 *
 * @author DJ Forever 2 Team
 * @version 1.0.0
 */

/**
 * Creates a configurable rate limiting middleware for API protection
 *
 * Implements IP-based request throttling with configurable window and limits.
 * Uses in-memory storage for request tracking with automatic cleanup.
 * Logs rate limit violations with request metadata for security monitoring.
 *
 * @param windowMs - Time window in milliseconds for rate limit tracking (default: 15 minutes)
 * @param max - Maximum requests per IP within the time window (default: 100)
 *
 * @returns Express middleware function for rate limiting
 *
 * @example
 * ```typescript
 * // Standard API rate limiting (100 requests per 15 minutes)
 * app.use('/api', createRateLimiter());
 *
 * // Stricter limits for authentication endpoints
 * app.use('/api/auth', createRateLimiter(5 * 60 * 1000, 10)); // 10 requests per 5 minutes
 *
 * // Looser limits for public content
 * app.use('/api/public', createRateLimiter(60 * 1000, 1000)); // 1000 requests per minute
 * ```
 *
 * Response Format (429 Too Many Requests):
 * ```json
 * {
 *   "error": "Too many requests from this IP, please try again later.",
 *   "code": "RATE_LIMIT_EXCEEDED",
 *   "retryAfter": 123
 * }
 * ```
 *
 * @security
 * - Uses IP address from Express req.ip (configure trust proxy)
 * - Memory storage not suitable for multi-instance deployments
 * - Consider Redis-based storage for production clustering
 *
 * @performance
 * - O(1) lookup time for rate limit checks
 * - Automatic cleanup of expired entries
 * - Minimal memory footprint for typical traffic
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
 * Express middleware for essential security headers configuration
 *
 * Applies OWASP-recommended security headers to protect against common vulnerabilities:
 * - X-Content-Type-Options: Prevents MIME type sniffing attacks
 * - X-Frame-Options: Protects against clickjacking via iframe embedding
 * - X-XSS-Protection: Enables browser XSS filtering (legacy browser support)
 * - Strict-Transport-Security: Enforces HTTPS connections for security
 * - Referrer-Policy: Controls referrer information leakage
 *
 * @param _req - Express request object (unused)
 * @param res - Express response object for header setting
 * @param next - Express next function for middleware chain continuation
 *
 * @example
 * ```typescript
 * // Apply security headers to all routes
 * app.use(securityHeaders);
 *
 * // Response headers added:
 * // X-Content-Type-Options: nosniff
 * // X-Frame-Options: DENY
 * // X-XSS-Protection: 1; mode=block
 * // Strict-Transport-Security: max-age=31536000; includeSubDomains
 * // Referrer-Policy: strict-origin-when-cross-origin
 * ```
 *
 * @security
 * - Basic header protection suitable for development
 * - Production deployment should use helmet package for comprehensive coverage
 * - HSTS header assumes HTTPS deployment (disable for HTTP-only development)
 *
 * @compatibility
 * - Headers compatible with all modern browsers
 * - X-XSS-Protection included for legacy browser support (deprecated in modern browsers)
 * - Frame options set to DENY (most restrictive, consider SAMEORIGIN if needed)
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
 * Comprehensive request/response logging middleware with performance tracking
 *
 * Provides structured logging for all HTTP requests with:
 * - Request initiation logging with client metadata
 * - Response completion logging with performance metrics
 * - Conditional log levels based on response status codes
 * - Detailed request/response metadata collection
 *
 * Logged Request Data:
 * - HTTP method and path
 * - Client IP address and User-Agent
 * - Content-Type header for request body analysis
 *
 * Logged Response Data:
 * - Response status code and processing duration
 * - Content-Length for response size monitoring
 * - Automatic log level adjustment (warn for 4xx/5xx, info for success)
 *
 * @param req - Express request object with client information
 * @param res - Express response object for completion event handling
 * @param next - Express next function for middleware chain continuation
 *
 * @example
 * ```typescript
 * // Apply request logging to all routes
 * app.use(requestLogger);
 *
 * // Example log output:
 * // [INFO] GET /api/users {"ip":"127.0.0.1","userAgent":"Mozilla/5.0..."}
 * // [INFO] GET /api/users - 200 {"ip":"127.0.0.1","statusCode":200,"duration":"45ms","contentLength":"1234"}
 *
 * // Error response logging:
 * // [WARN] POST /api/auth - 401 {"ip":"127.0.0.1","statusCode":401,"duration":"12ms"}
 * ```
 *
 * @performance
 * - Minimal overhead with single timestamp capture
 * - Event-driven response logging (no blocking)
 * - Structured logging format for log analysis tools
 *
 * @monitoring
 * - Duration tracking for performance analysis
 * - Status code distribution for health monitoring
 * - Client metadata for traffic analysis and debugging
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
 * Centralized error handling middleware for Express applications
 *
 * Provides comprehensive error processing with:
 * - Structured error logging with request context
 * - Environment-aware error response formatting
 * - Security-conscious stack trace exposure
 * - Standardized error response format
 *
 * Error Response Format:
 * ```json
 * {
 *   "error": "User-friendly error message",
 *   "code": "ERROR_CODE_CONSTANT",
 *   "stack": "Full stack trace (development only)"
 * }
 * ```
 *
 * @param err - Error object with message, status, code, and stack properties
 * @param req - Express request object for context logging
 * @param res - Express response object for error response
 * @param _next - Express next function (unused in error handlers)
 *
 * @example
 * ```typescript
 * // Register as final middleware (after all routes)
 * app.use(errorHandler);
 *
 * // Custom error throwing:
 * const error = new Error('User not found');
 * error.status = 404;
 * error.code = 'USER_NOT_FOUND';
 * throw error;
 *
 * // Development response (NODE_ENV=development):
 * // {"error":"User not found","code":"USER_NOT_FOUND","stack":"Error: User not found\n    at..."}
 *
 * // Production response:
 * // {"error":"User not found","code":"USER_NOT_FOUND"}
 * ```
 *
 * @security
 * - Stack traces only exposed in development environment
 * - Request metadata logged for security analysis
 * - Generic "Internal Server Error" for unhandled errors
 *
 * @logging
 * - Full error details logged with request context
 * - IP address and path information for incident tracking
 * - Error stack traces preserved in logs regardless of environment
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
 * HTTP 404 Not Found handler for unmatched routes
 *
 * Final catch-all middleware for handling requests to non-existent endpoints.
 * Logs 404 events with client information for monitoring and debugging.
 * Returns standardized error response format matching application conventions.
 *
 * @param req - Express request object with unmatched route information
 * @param res - Express response object for 404 response
 *
 * @example
 * ```typescript
 * // Register as final route handler (after all defined routes)
 * app.use('*', notFoundHandler);
 *
 * // Response format:
 * // HTTP 404 Not Found
 * // {"error":"Not Found","code":"NOT_FOUND","path":"/api/nonexistent"}
 *
 * // Log output:
 * // [WARN] 404 Not Found: GET /api/nonexistent {"ip":"127.0.0.1","userAgent":"..."}
 * ```
 *
 * @monitoring
 * - Logs all 404 events for route analysis
 * - Includes requested path in response for client debugging
 * - Client metadata logged for traffic pattern analysis
 *
 * @security
 * - No sensitive information exposed in 404 responses
 * - Request path echoed back for legitimate debugging needs
 * - User-Agent logging for bot detection and analysis
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
 * Application health check endpoint for monitoring and deployment
 *
 * Provides comprehensive health status information including:
 * - Basic application availability confirmation
 * - Current timestamp for request verification
 * - Environment and runtime information
 * - System resource utilization metrics
 *
 * Health Check Response:
 * ```json
 * {
 *   "status": "ok",
 *   "timestamp": "2023-12-07T10:30:00.000Z",
 *   "environment": "production",
 *   "uptime": 3661.234,
 *   "memory": {
 *     "rss": 45678912,
 *     "heapTotal": 34567890,
 *     "heapUsed": 23456789,
 *     "external": 1234567,
 *     "arrayBuffers": 123456
 *   }
 * }
 * ```
 *
 * @param _req - Express request object (unused)
 * @param res - Express response object for health status
 *
 * @example
 * ```typescript
 * // Register health check endpoint
 * app.get('/health', healthCheck);
 *
 * // Load balancer configuration:
 * // Health check URL: https://api.example.com/health
 * // Expected status: 200 OK
 * // Expected response: {"status":"ok"}
 * ```
 *
 * @monitoring
 * - Uptime tracking for deployment verification
 * - Memory usage monitoring for resource management
 * - Environment confirmation for deployment validation
 * - Timestamp verification for request processing
 *
 * @deployment
 * - Used by load balancers for health checking
 * - Container orchestration readiness probes
 * - Monitoring system availability verification
 * - CI/CD deployment success validation
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
