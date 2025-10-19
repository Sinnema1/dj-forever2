/**
 * @fileoverview Email Service for DJ Forever 2 Wedding Website
 * @module services/emailService
 * @version 1.0.0
 *
 * Handles all email operations including RSVP reminders and notifications.
 * Supports both development (console logging) and production (SMTP) modes.
 *
 * Features:
 * - RSVP reminder emails with QR code links
 * - Batch email sending to multiple recipients
 * - HTML email templates with inline styling
 * - Development mode for testing (logs to console)
 * - Production mode with SMTP configuration
 *
 * Environment Variables Required:
 * - EMAIL_FROM: Sender email address
 * - EMAIL_HOST: SMTP server host (e.g., smtp.gmail.com)
 * - EMAIL_PORT: SMTP server port (e.g., 587)
 * - EMAIL_USER: SMTP authentication username
 * - EMAIL_PASSWORD: SMTP authentication password
 * - CONFIG__FRONTEND_URL: Frontend URL for QR login links
 * - NODE_ENV: Environment mode (development/production)
 *
 * @example
 * // Send reminder to single guest
 * await sendRSVPReminder(user);
 *
 * @example
 * // Send reminders to multiple guests
 * await sendBulkRSVPReminders(users);
 */

import { logger } from "../utils/logger.js";
import { config } from "../config/index.js";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import EmailJob from "../models/EmailJob.js";
import User from "../models/User.js";

// Type definitions for email operations
interface EmailRecipient {
  _id: string;
  fullName: string;
  email: string;
  qrToken: string;
}

export interface EmailResult {
  success: boolean;
  email: string;
  error?: string;
}

// Lazy-initialized SMTP transporter
let transporter: Transporter | null = null;

/**
 * Get or create SMTP transporter
 * Only creates transporter if SMTP is fully configured
 *
 * @returns {Transporter | null} Nodemailer transporter or null if not configured
 */
function getTransporter(): Transporter | null {
  // Check if SMTP is configured
  const smtpConfig = validateEmailConfig();
  if (!smtpConfig.isConfigured) {
    return null;
  }

  // Return existing transporter if already created
  if (transporter) {
    return transporter;
  }

  // Create new transporter
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  logger.info("SMTP transporter created", {
    service: "EmailService",
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
  });

  return transporter;
}

/**
 * Create RSVP reminder email HTML template
 *
 * @param {EmailRecipient} user - User receiving the reminder
 * @returns {string} HTML email content
 */
function createRSVPReminderTemplate(user: EmailRecipient): string {
  const qrLoginUrl = `${config.frontend.defaultUrl}/login/qr/${user.qrToken}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>RSVP Reminder</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          color: #2c3e50;
          margin-bottom: 20px;
        }
        .message {
          font-size: 16px;
          color: #555;
          margin-bottom: 30px;
          line-height: 1.8;
        }
        .cta-button {
          display: inline-block;
          background: #667eea;
          color: white !important;
          padding: 16px 40px;
          text-decoration: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          text-align: center;
          margin: 20px 0;
          transition: background 0.3s ease;
        }
        .cta-button:hover {
          background: #5568d3;
        }
        .link-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 6px;
          margin-top: 30px;
        }
        .link-section p {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #666;
        }
        .link-text {
          font-size: 12px;
          color: #999;
          word-break: break-all;
        }
        .footer {
          background: #f8f9fa;
          padding: 30px;
          text-align: center;
          font-size: 14px;
          color: #666;
          border-top: 1px solid #dee2e6;
        }
        .footer p {
          margin: 5px 0;
        }
        @media only screen and (max-width: 600px) {
          .container {
            margin: 20px;
          }
          .header, .content, .footer {
            padding: 20px;
          }
          .header h1 {
            font-size: 24px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Wedding RSVP Reminder</h1>
        </div>
        <div class="content">
          <p class="greeting">Hello ${user.fullName},</p>
          <p class="message">
            We hope this message finds you well! We're excited to celebrate our special day with you,
            and we wanted to send a gentle reminder about submitting your RSVP.
          </p>
          <p class="message">
            Your response helps us with planning and ensures we can accommodate everyone comfortably.
            It only takes a moment to let us know if you'll be joining us!
          </p>
          <div style="text-align: center;">
            <a href="${qrLoginUrl}" class="cta-button">
              Click Here to RSVP Now
            </a>
          </div>
          <div class="link-section">
            <p><strong>Can't click the button?</strong> Copy and paste this link into your browser:</p>
            <p class="link-text">${qrLoginUrl}</p>
          </div>
          <p class="message" style="margin-top: 30px;">
            We can't wait to see you there! If you have any questions or need assistance with your RSVP,
            please don't hesitate to reach out.
          </p>
          <p class="message">
            With love and excitement,<br>
            <strong>The Happy Couple</strong>
          </p>
        </div>
        <div class="footer">
          <p>This is an automated reminder from our wedding website.</p>
          <p>You're receiving this because you were invited to our wedding.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Create plain text version of RSVP reminder email
 *
 * @param {EmailRecipient} user - User receiving the reminder
 * @returns {string} Plain text email content
 */
function createRSVPReminderText(user: EmailRecipient): string {
  const qrLoginUrl = `${config.frontend.defaultUrl}/login/qr/${user.qrToken}`;

  return `
Hello ${user.fullName},

We hope this message finds you well! We're excited to celebrate our special day with you,
and we wanted to send a gentle reminder about submitting your RSVP.

Your response helps us with planning and ensures we can accommodate everyone comfortably.
It only takes a moment to let us know if you'll be joining us!

Click here to RSVP now:
${qrLoginUrl}

We can't wait to see you there! If you have any questions or need assistance with your RSVP,
please don't hesitate to reach out.

With love and excitement,
The Happy Couple

---
This is an automated reminder from our wedding website.
You're receiving this because you were invited to our wedding.
  `.trim();
}

/**
 * Send email using SMTP or console logging
 * Automatically detects if SMTP is configured and uses appropriate method
 *
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} text - Plain text content
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<void> {
  const smtp = getTransporter();

  if (smtp) {
    // SMTP mode - actually send the email
    try {
      const info = await smtp.sendMail({
        from: process.env.SMTP_USER || "noreply@djforever2.com",
        to,
        subject,
        text,
        html,
      });

      logger.info(`📧 EMAIL sent via SMTP to: ${to}`, {
        service: "EmailService",
        messageId: info.messageId,
        subject,
      });
    } catch (error: any) {
      logger.error(`Failed to send email via SMTP to ${to}`, {
        service: "EmailService",
        error: error.message,
        subject,
      });
      throw error;
    }
  } else {
    // Console mode - log the email
    logger.info(`📧 EMAIL (Console Mode) - Would send email to: ${to}`, {
      service: "EmailService",
    });
    logger.info(`   Subject: ${subject}`, { service: "EmailService" });
    logger.info(`   URL: ${config.frontend.defaultUrl}`, {
      service: "EmailService",
    });
    logger.info(`   Preview: ${text.substring(0, 100)}...`, {
      service: "EmailService",
    });
  }
}

/**
 * Send RSVP reminder email to a single guest
 * In development, logs to console. In production, sends via SMTP (when configured).
 *
 * @param {EmailRecipient} user - User to send reminder to
 * @returns {Promise<boolean>} Success status
 * @throws {Error} If email sending fails in production
 */
export async function sendRSVPReminder(user: EmailRecipient): Promise<boolean> {
  try {
    logger.info(`Sending RSVP reminder to ${user.fullName} (${user.email})`, {
      service: "EmailService",
    });

    const subject = "🎉 Friendly Reminder: Please RSVP to Our Wedding";
    const html = createRSVPReminderTemplate(user);
    const text = createRSVPReminderText(user);

    // Automatically uses SMTP if configured, otherwise logs to console
    await sendEmail(user.email, subject, html, text);

    logger.info(`RSVP reminder sent successfully to ${user.email}`, {
      service: "EmailService",
    });
    return true;
  } catch (error: any) {
    logger.error(`Failed to send RSVP reminder to ${user.email}`, {
      service: "EmailService",
      error,
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Send RSVP reminders to multiple guests
 * Processes emails sequentially to avoid rate limiting
 *
 * @param {EmailRecipient[]} users - Array of users to send reminders to
 * @returns {Promise<EmailResult[]>} Array of results for each email
 */
export async function sendBulkRSVPReminders(
  users: EmailRecipient[]
): Promise<EmailResult[]> {
  logger.info(`Sending bulk RSVP reminders to ${users.length} guests`, {
    service: "EmailService",
  });

  const results: EmailResult[] = [];

  for (const user of users) {
    try {
      await sendRSVPReminder(user);
      results.push({
        success: true,
        email: user.email,
      });

      // Add a small delay between emails to avoid rate limiting
      if (users.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error: any) {
      logger.error(`Failed to send reminder to ${user.email}`, {
        service: "EmailService",
        error,
      });
      results.push({
        success: false,
        email: user.email,
        error: error.message,
      });
    }
  }

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  logger.info(
    `Bulk email send complete: ${successCount} successful, ${failureCount} failed`,
    { service: "EmailService" }
  );

  return results;
}

/**
 * Get pending RSVP recipients (guests who haven't responded)
 * Helper function for bulk reminder operations
 *
 * @param {any[]} allUsers - Array of all users
 * @returns {EmailRecipient[]} Filtered array of users needing reminders
 */
export function getPendingRSVPRecipients(allUsers: any[]): EmailRecipient[] {
  return allUsers
    .filter((user) => user.isInvited && !user.hasRSVPed && !user.isAdmin)
    .map((user) => ({
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      qrToken: user.qrToken,
    }));
}

/**
 * Validate email service configuration
 * Checks if required environment variables are set
 *
 * @returns {object} Configuration status and missing variables
 */
export function validateEmailConfig(): {
  isConfigured: boolean;
  mode: "console" | "smtp";
  missing: string[];
} {
  const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];

  const missing = required.filter(
    (key) =>
      !process.env[key] ||
      process.env[key] === "" ||
      process.env[key]?.startsWith("your-")
  );

  return {
    isConfigured: missing.length === 0,
    mode: missing.length === 0 ? "smtp" : "console",
    missing,
  };
}

/**
 * Email preview generation for admin testing
 * Generates email HTML without actually sending it
 *
 * @param {string} userId - User ID to generate preview for
 * @param {string} template - Template identifier (e.g., 'rsvp_reminder')
 * @returns {Promise<object>} Email preview with subject, HTML content, recipient
 */
export async function generateEmailPreview(
  userId: string,
  template: string
): Promise<{
  subject: string;
  htmlContent: string;
  to: string;
  template: string;
}> {
  const user = await (User as any).findById(userId);
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  const emailRecipient: EmailRecipient = {
    _id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    qrToken: user.qrToken,
  };

  let subject: string;
  let htmlContent: string;

  switch (template) {
    case "rsvp_reminder":
      subject = "🎉 Friendly Reminder: Please RSVP to Our Wedding";
      htmlContent = createRSVPReminderTemplate(emailRecipient);
      break;
    default:
      throw new Error(`Unknown template: ${template}`);
  }

  logger.info(`Generated email preview for user ${userId}`, {
    service: "EmailService",
    template,
    to: user.email,
  });

  return {
    subject,
    htmlContent,
    to: user.email,
    template,
  };
}

/**
 * Enqueue email job for retry-capable sending
 * Creates EmailJob record in database for background processing
 *
 * @param {string} userId - User ID to send email to
 * @param {string} template - Template identifier
 * @returns {Promise<any>} Created EmailJob document
 */
export async function enqueueEmail(
  userId: string,
  template: string
): Promise<any> {
  const job = await EmailJob.create({
    userId,
    template,
    status: "pending",
    attempts: 0,
  });

  logger.info(`Enqueued email job for user ${userId}`, {
    service: "EmailService",
    jobId: job._id.toString(),
    template,
  });

  return job;
}

/**
 * Process email job with retry logic
 * Attempts to send email and updates job status
 * Implements exponential backoff: 1min, 5min, 15min
 *
 * @param {any} job - EmailJob document to process
 * @returns {Promise<boolean>} Success status
 */
export async function processEmailJob(job: any): Promise<boolean> {
  const MAX_ATTEMPTS = 5;
  const user = await (User as any).findById(job.userId);

  if (!user) {
    logger.error(`User not found for email job ${job._id}`, {
      service: "EmailService",
      userId: job.userId,
    });

    // Use findByIdAndUpdate for atomic update
    await EmailJob.findByIdAndUpdate(job._id, {
      status: "failed",
      lastError: "User not found",
    });

    return false;
  }

  const emailRecipient: EmailRecipient = {
    _id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    qrToken: user.qrToken,
  };

  try {
    // Increment attempts atomically
    const updatedJob = await EmailJob.findByIdAndUpdate(
      job._id,
      {
        $inc: { attempts: 1 },
        status: job.attempts > 0 ? "retrying" : "pending",
      },
      { new: true }
    );

    if (!updatedJob) {
      throw new Error("Job not found during update");
    }

    // Attempt to send email
    await sendRSVPReminder(emailRecipient);

    // Success! Update job status atomically
    await EmailJob.findByIdAndUpdate(job._id, {
      status: "sent",
      sentAt: new Date(),
    });

    logger.info(`Email job ${job._id} completed successfully`, {
      service: "EmailService",
      attempts: updatedJob.attempts,
      userId: job.userId,
    });

    return true;
  } catch (error: any) {
    const currentAttempts = job.attempts + 1;
    const updateData: any = {
      lastError: error.message,
    };

    if (currentAttempts >= MAX_ATTEMPTS) {
      updateData.status = "failed";
      logger.error(
        `Email job ${job._id} failed after ${MAX_ATTEMPTS} attempts`,
        {
          service: "EmailService",
          error: error.message,
          userId: job.userId,
        }
      );
    } else {
      updateData.status = "retrying";
      logger.warn(
        `Email job ${job._id} failed, will retry (attempt ${currentAttempts}/${MAX_ATTEMPTS})`,
        {
          service: "EmailService",
          error: error.message,
          userId: job.userId,
        }
      );
    }

    await EmailJob.findByIdAndUpdate(job._id, updateData);
    return false;
  }
}

/**
 * Get retry delay based on attempt number
 * Implements exponential backoff: 1min, 5min, 15min, 30min, 1hr
 *
 * @param {number} attempts - Number of previous attempts
 * @returns {number} Delay in milliseconds
 */
export function getRetryDelay(attempts: number): number {
  const delays = [
    60 * 1000, // 1 minute
    5 * 60 * 1000, // 5 minutes
    15 * 60 * 1000, // 15 minutes
    30 * 60 * 1000, // 30 minutes
    60 * 60 * 1000, // 1 hour
  ];

  return delays[Math.min(attempts, delays.length - 1)];
}

/**
 * Process pending and retrying email jobs
 * Background job processor for retry queue
 * Should be called periodically (e.g., every minute)
 *
 * @returns {Promise<number>} Number of jobs processed
 */
export async function processEmailQueue(): Promise<number> {
  const now = new Date();
  let processed = 0;

  try {
    // Find jobs that need processing
    const jobs = await EmailJob.find({
      status: { $in: ["pending", "retrying"] },
    })
      .sort({ createdAt: 1 })
      .limit(10); // Process max 10 jobs per run

    for (const job of jobs) {
      // Check if enough time has passed for retry
      if (job.attempts > 0) {
        const delay = getRetryDelay(job.attempts - 1);
        const nextRetryTime = new Date(job.createdAt.getTime() + delay);

        if (now < nextRetryTime) {
          logger.info(
            `Skipping job ${
              job._id
            }, retry scheduled for ${nextRetryTime.toISOString()}`,
            {
              service: "EmailService",
              attempts: job.attempts,
            }
          );
          continue; // Not ready for retry yet
        }
      }

      // Process the job
      await processEmailJob(job);
      processed++;

      // Small delay between jobs to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (processed > 0) {
      logger.info(`Processed ${processed} email jobs from queue`, {
        service: "EmailService",
      });
    }
  } catch (error: any) {
    logger.error(`Error processing email queue`, {
      service: "EmailService",
      error: error.message,
    });
  }

  return processed;
}

/**
 * Get email send history for admin visibility
 *
 * @param {number} limit - Maximum number of records to return
 * @param {string} status - Optional status filter
 * @returns {Promise<any[]>} Array of email job history records
 */
export async function getEmailHistory(
  limit: number = 50,
  status?: string
): Promise<any[]> {
  const query: any = {};
  if (status) {
    query.status = status;
  }

  const jobs = await EmailJob.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("userId", "email fullName");

  return jobs.map((job: any) => ({
    _id: job._id.toString(),
    userId: job.userId?._id?.toString() || "unknown",
    userEmail: job.userId?.email || "deleted@unknown.com",
    userName: job.userId?.fullName || "Deleted User",
    template: job.template,
    status: job.status,
    attempts: job.attempts,
    lastError: job.lastError || null,
    createdAt: job.createdAt.toISOString(),
    sentAt: job.sentAt ? job.sentAt.toISOString() : null,
  }));
}
