/**
 * @fileoverview Email Job Model for Retry Queue
 * @module models/EmailJob
 * @version 1.0.0
 *
 * Mongoose EmailJob model for persistent email retry queue.
 * Tracks email send attempts, status, and failure reasons.
 *
 * Status Flow:
 * - pending → retrying → sent (success path)
 * - pending → retrying → failed (failure path after max attempts)
 *
 * @author DJ Forever 2 Team
 */

import mongoose, { Schema, Types } from "mongoose";

/**
 * Email Job interface for retry queue persistence
 *
 * @interface EmailJob
 * @property {Types.ObjectId} userId - Reference to User receiving the email
 * @property {string} template - Email template identifier (e.g., 'rsvp_reminder')
 * @property {string} status - Current job status (pending, retrying, sent, failed)
 * @property {number} attempts - Number of send attempts made
 * @property {string} [lastError] - Last error message if send failed
 * @property {Date} createdAt - Job creation timestamp
 * @property {Date} [sentAt] - Successful send timestamp
 */
export interface EmailJob {
  userId: Types.ObjectId;
  template: string;
  status: "pending" | "retrying" | "sent" | "failed";
  attempts: number;
  lastError?: string;
  createdAt: Date;
  sentAt?: Date;
}

/**
 * Mongoose schema for EmailJob collection
 *
 * Indexes:
 * - userId: For user-specific job queries
 * - status: For queue processing
 * - createdAt: For chronological ordering and cleanup
 */
const EmailJobSchema = new Schema<EmailJob>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    template: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "retrying", "sent", "failed"],
      default: "pending",
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lastError: String,
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    sentAt: Date,
  },
  {
    versionKey: false,
  }
);

/**
 * Compound index for queue processing
 * Find pending/retrying jobs ordered by creation time
 */
EmailJobSchema.index({ status: 1, createdAt: 1 });

export default mongoose.model<EmailJob>("EmailJob", EmailJobSchema);
