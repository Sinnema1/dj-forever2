/**
 * @fileoverview Health Check Routes
 * @module routes/health
 * @version 1.0.0
 *
 * Health check endpoints for monitoring and deployment validation.
 * Includes basic application health and SMTP connectivity checks.
 *
 * @author DJ Forever 2 Team
 */

import { Router } from "express";
import nodemailer from "nodemailer";
import { logger } from "../utils/logger.js";

export const healthRouter = Router();

/**
 * SMTP health check endpoint
 *
 * Verifies SMTP server connectivity and authentication.
 * Used by admin UI to display email system health badge.
 *
 * @route GET /health/smtp
 * @returns {object} 200 - SMTP healthy { healthy: true, ok: true, provider: 'smtp', latencyMs: number, message: string }
 * @returns {object} 500 - SMTP unhealthy { healthy: false, ok: false, error: string, message: string, missing?: string[] }
 *
 * @example
 * // Healthy response
 * GET /health/smtp
 * { "healthy": true, "ok": true, "provider": "smtp", "latencyMs": 234, "message": "SMTP is healthy" }
 *
 * @example
 * // Missing configuration
 * GET /health/smtp
 * { "healthy": false, "ok": false, "error": "SMTP not configured", "message": "SMTP not configured", "missing": ["SMTP_HOST", "SMTP_PASS"] }
 */
healthRouter.get("/smtp", async (req, res) => {
  const requestId = req.context?.requestId;
  const start = performance.now();

  try {
    const {
      SMTP_HOST: host,
      SMTP_PORT: portStr,
      SMTP_USER: user,
      SMTP_PASS: pass,
    } = process.env;
    const port = Number(portStr || 0);

    // Validate SMTP configuration
    if (!host || !port || !user || !pass) {
      logger.warn("SMTP health check failed: missing configuration", {
        requestId,
        service: "HealthRouter",
      });
      return res.status(500).json({
        healthy: false,
        ok: false,
        error: "SMTP not configured",
        message: "SMTP not configured",
        missing: [
          !host && "SMTP_HOST",
          !port && "SMTP_PORT",
          !user && "SMTP_USER",
          !pass && "SMTP_PASS",
        ].filter(Boolean),
      });
    }

    // Create transporter and verify connection
    const transporter = nodemailer.createTransport({
      host,
      port,
      auth: { user, pass },
      secure: false,
    });

    await transporter.verify(); // Performs AUTH + NOOP
    const latencyMs = Math.round(performance.now() - start);

    logger.info("SMTP health check passed", {
      requestId,
      latencyMs,
      service: "HealthRouter",
    });
    return res.json({
      healthy: true,
      ok: true,
      provider: "smtp",
      latencyMs,
      message: "SMTP is healthy",
    });
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    logger.error("SMTP health check failed", {
      requestId,
      error: err.message,
      latencyMs,
      service: "HealthRouter",
    });
    return res.status(500).json({
      healthy: false,
      ok: false,
      error: String(err?.message || err),
      message: `SMTP error: ${err?.message || err}`,
      latencyMs,
    });
  }
});

/**
 * Basic application health check endpoint
 *
 * Returns simple OK status for load balancer health checks.
 * Includes timestamp and environment information.
 *
 * @route GET /health/basic
 * @returns {object} 200 - Application healthy
 *
 * @example
 * GET /health/basic
 * {
 *   "status": "ok",
 *   "timestamp": "2025-10-18T10:30:00.000Z",
 *   "environment": "production"
 * }
 */
healthRouter.get("/basic", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});
