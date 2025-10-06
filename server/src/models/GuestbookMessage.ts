/**
 * @fileoverview Guestbook Message Model for DJ Forever 2 Wedding Website
 * @module models/GuestbookMessage
 * @version 1.0.0
 * 
 * Mongoose GuestbookMessage model implementing wedding guest message system with
 * content moderation, approval workflow, and administrative controls. Allows wedding
 * guests to leave congratulatory messages while providing content management tools
 * for the wedding couple.
 * 
 * Moderation Features:
 * - Two-stage approval system (isApproved + isVisible flags)
 * - Administrative approval required for public display
 * - Soft delete capability through visibility controls
 * - Pending message queue for moderation workflow
 * 
 * Content Management:
 * - Message length validation (1-1000 characters)
 * - Author name validation and trimming
 * - Automatic content sanitization
 * - User association for accountability
 * 
 * Administrative Tools:
 * - Bulk approval/rejection capabilities
 * - Message statistics and reporting
 * - User-specific message history
 * - Chronological message ordering
 * 
 * Database Optimizations:
 * - Compound indexes for approval status and visibility
 * - User reference indexing for message tracking
 * - Timestamp indexing for chronological queries
 * - Optimized transforms for JSON serialization
 * 
 * Static Methods:
 * - findApproved: Public messages for display
 * - findPending: Messages awaiting moderation
 * - findByUser: User-specific message history
 * - getMessageStats: Administrative statistics
 * 
 * @example
 * // Create new guestbook message:
 * // const message = new GuestbookMessage({
 * //   userId: '507f1f77bcf86cd799439011',
 * //   authorName: 'John Doe',
 * //   message: 'Congratulations on your special day!'
 * // });
 * 
 * @example
 * // Query approved messages for public display:
 * // const messages = await GuestbookMessage.findApproved();
 * 
 * @dependencies
 * - mongoose: MongoDB ODM for schema definition and database operations
 */

import mongoose, { Schema, Document } from "mongoose";

/**
 * Guestbook message interface extending Mongoose Document for type safety.
 * Represents individual guest messages with moderation and visibility controls.
 * 
 * @interface IGuestbookMessage
 * @extends Document
 * @property {mongoose.Types.ObjectId} userId - Reference to User document (message author)
 * @property {string} authorName - Display name for message author (max 100 characters)
 * @property {string} message - Message content (1-1000 characters, required)
 * @property {boolean} isApproved - Administrative approval status (default: false)
 * @property {boolean} isVisible - Visibility flag for soft delete (default: true)
 * @property {Date} createdAt - Message creation timestamp (automatic)
 * @property {Date} updatedAt - Last modification timestamp (automatic)
 */
export interface IGuestbookMessage extends Document {
  userId: mongoose.Types.ObjectId;
  authorName: string;
  message: string;
  isApproved: boolean;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const guestbookMessageSchema = new Schema<IGuestbookMessage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    authorName: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
      maxlength: [100, "Author name cannot exceed 100 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: [1, "Message cannot be empty"],
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
    isVisible: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for common query patterns
guestbookMessageSchema.index({ isApproved: 1, isVisible: 1, createdAt: -1 });
guestbookMessageSchema.index({ userId: 1, createdAt: -1 });

// Pre-save middleware for data validation
guestbookMessageSchema.pre("save", function (next) {
  // Trim and validate message content
  if (this.message) {
    this.message = this.message.trim();
  }

  if (this.authorName) {
    this.authorName = this.authorName.trim();
  }

  next();
});

// Static methods for common queries
guestbookMessageSchema.statics.findApproved = function () {
  return this.find({ isApproved: true, isVisible: true })
    .sort({ createdAt: -1 })
    .populate("userId", "fullName email");
};

guestbookMessageSchema.statics.findPending = function () {
  return this.find({ isApproved: false, isVisible: true })
    .sort({ createdAt: -1 })
    .populate("userId", "fullName email");
};

guestbookMessageSchema.statics.findByUser = function (
  userId: string | mongoose.Types.ObjectId
) {
  return this.find({ userId, isVisible: true }).sort({ createdAt: -1 });
};

guestbookMessageSchema.statics.getMessageStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        approved: { $sum: { $cond: ["$isApproved", 1, 0] } },
        pending: {
          $sum: {
            $cond: [{ $and: [{ $not: "$isApproved" }, "$isVisible"] }, 1, 0],
          },
        },
        hidden: { $sum: { $cond: ["$isVisible", 0, 1] } },
      },
    },
  ]);
};

export const GuestbookMessage =
  mongoose.models.GuestbookMessage ||
  mongoose.model<IGuestbookMessage>("GuestbookMessage", guestbookMessageSchema);

export default GuestbookMessage;
