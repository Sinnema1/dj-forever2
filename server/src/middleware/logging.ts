/**
 * @fileoverview Request ID Middleware
 * @module middleware/logging
 * @version 1.0.0
 *
 * Generates unique request IDs for request tracing and correlation.
 * Attaches request ID to Express request context and response headers.
 *
 * @author DJ Forever 2 Team
 */

import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

/**
 * Extend Express Request type to include context object
 *
 * Context provides request-scoped data that persists through the request lifecycle.
 * Used by services and resolvers for logging and tracing.
 */
declare module "express-serve-static-core" {
  interface Request {
    context?: {
      requestId?: string;
      userId?: string;
    };
  }
}

/**
 * Request ID middleware
 *
 * Generates a unique UUID for each request and attaches it to:
 * 1. req.context.requestId - Available to all route handlers and services
 * 2. X-Request-ID response header - Visible to clients for debugging
 *
 * Usage in services:
 * ```typescript
 * logger.info("Operation completed", {
 *   requestId: req.context?.requestId,
 *   userId: req.context?.userId,
 *   ...metadata
 * });
 * ```
 *
 * @middleware
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 *
 * @example
 * // In server.ts
 * import { withRequestId } from './middleware/logging.js';
 * app.use(withRequestId);
 *
 * // In service
 * export function someService(req: Request) {
 *   logger.info("Processing request", {
 *     requestId: req.context?.requestId
 *   });
 * }
 */
export const withRequestId: RequestHandler = (req, res, next) => {
  const id = randomUUID();
  req.context = { ...(req.context || {}), requestId: id };
  res.setHeader("X-Request-ID", id);
  next();
};
