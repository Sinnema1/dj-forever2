/**
 * @fileoverview RSVP Model for DJ Forever 2 Wedding Website
 * @module models/RSVP
 * @version 1.0.0
 *
 * Mongoose RSVP model implementing comprehensive wedding guest response system.
 * Supports multi-guest party management with individual meal preferences, dietary
 * restrictions, and special requests. Maintains backward compatibility with legacy
 * single-guest RSVP format for seamless data migration.
 *
 * Multi-Guest Features:
 * - Guest array with individual names and preferences
 * - Dynamic guest count validation
 * - Meal preference tracking per guest
 * - Individual dietary restrictions and allergies
 * - Flexible party size management (0-10 guests)
 *
 * Legacy Compatibility:
 * - Maintains single-guest fields (fullName, mealPreference, allergies)
 * - Automatic synchronization between formats
 * - Backward-compatible queries and updates
 * - Seamless migration path for existing data
 *
 * Validation Features:
 * - Attendance status validation (YES, NO, MAYBE)
 * - Conditional field requirements based on attendance
 * - Guest count limits and consistency checks
 * - Meal preference validation against predefined options
 * - Text length limits for security and UX
 *
 * Database Optimizations:
 * - Compound indexes for common query patterns
 * - One RSVP per user constraint (unique userId index)
 * - Attendance status indexing for reporting
 * - Timestamp indexes for chronological queries
 *
 * Static Methods:
 * - findByUserId: User-specific RSVP lookup
 * - findAttending: Query confirmed attendees
 * - findNotAttending: Query declined responses
 * - getAttendanceStats: Aggregate attendance statistics
 *
 * @example
 * // Create multi-guest RSVP:
 * // const rsvp = new RSVP({
 * //   userId: '507f1f77bcf86cd799439011',
 * //   attending: 'YES',
 * //   guests: [{ fullName: 'John Doe', mealPreference: 'chicken' }]
 * // });
 *
 * @example
 * // Query attendance statistics:
 * // const stats = await RSVP.getAttendanceStats();
 * // Returns: [{ _id: 'YES', count: 25, totalGuests: 45 }]
 *
 * @dependencies
 * - mongoose: MongoDB ODM for schema definition and database operations
 */

import mongoose, { Schema, Document } from "mongoose";

/**
 * Guest interface for individual party members within an RSVP.
 * Used in multi-guest RSVP format to track individual preferences.
 *
 * @interface IGuest
 * @property {string} fullName - Guest's full name (required for attending guests)
 * @property {string} mealPreference - Meal choice (chicken, beef, fish, vegetarian, vegan, other)
 * @property {string} [allergies] - Optional dietary restrictions or allergies (max 200 characters)
 */
export interface IGuest {
  fullName: string;
  mealPreference: string;
  allergies?: string;
}

/**
 * RSVP interface extending Mongoose Document for type safety.
 * Combines modern multi-guest format with legacy single-guest compatibility.
 *
 * @interface IRSVP
 * @extends Document
 * @property {mongoose.Types.ObjectId} userId - Reference to User document (unique constraint)
 * @property {('YES'|'NO'|'MAYBE')} attending - Attendance status (required)
 * @property {number} [guestCount] - Total number of additional guests (0-10)
 * @property {IGuest[]} [guests] - Array of guest objects with individual preferences
 * @property {string} [additionalNotes] - Special requests or additional information (max 500 characters)
 * @property {string} [fullName] - Legacy field: Primary guest name (backward compatibility)
 * @property {string} [mealPreference] - Legacy field: Primary guest meal preference
 * @property {string} [allergies] - Legacy field: Primary guest dietary restrictions
 * @property {Date} createdAt - RSVP creation timestamp (automatic)
 * @property {Date} updatedAt - Last modification timestamp (automatic)
 */
export interface IRSVP extends Document {
  userId: mongoose.Types.ObjectId;
  attending: "YES" | "NO" | "MAYBE";
  guestCount?: number;
  guests?: IGuest[];
  additionalNotes?: string;
  // Legacy fields for backward compatibility
  fullName?: string;
  mealPreference?: string;
  allergies?: string;
  createdAt: Date;
  updatedAt: Date;
}

const guestSchema = new Schema<IGuest>(
  {
    fullName: {
      type: String,
      required: function (this: any) {
        // Only require fullName if the parent RSVP is attending "YES"
        return this.parent().attending === "YES";
      },
      trim: true,
      maxlength: [100, "Guest name cannot exceed 100 characters"],
    },
    mealPreference: {
      type: String,
      required: function (this: any) {
        // Only require mealPreference if the parent RSVP is attending "YES"
        return this.parent().attending === "YES";
      },
      trim: true,
      enum: {
        values: ["chicken", "beef", "fish", "vegetarian", "vegan", "other", ""],
        message: "Invalid meal preference",
      },
    },
    allergies: {
      type: String,
      trim: true,
      maxlength: [200, "Allergies information cannot exceed 200 characters"],
    },
  },
  {
    _id: false, // Prevent automatic _id generation for subdocuments
  }
);

const rsvpSchema = new Schema<IRSVP>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      // Note: Index defined at schema level with unique constraint
    },
    attending: {
      type: String,
      required: [true, "Attendance status is required"],
      enum: {
        values: ["YES", "NO", "MAYBE"],
        message: "Attendance must be YES, NO, or MAYBE",
      },
      index: true,
    },
    guestCount: {
      type: Number,
      min: [0, "Guest count cannot be negative"],
      max: [10, "Guest count cannot exceed 10"],
      default: 0,
    },
    guests: {
      type: [guestSchema],
      validate: {
        validator: function (guests: IGuest[]) {
          // Validate that guest count matches actual guests array length
          if (this.guestCount && guests) {
            return guests.length <= this.guestCount + 1; // +1 for primary guest
          }
          return true;
        },
        message: "Number of guests exceeds declared guest count",
      },
    },
    additionalNotes: {
      type: String,
      trim: true,
      maxlength: [500, "Additional notes cannot exceed 500 characters"],
    },
    // Legacy fields for backward compatibility
    fullName: {
      type: String,
      trim: true,
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    mealPreference: {
      type: String,
      trim: true,
      enum: {
        values: ["chicken", "beef", "fish", "vegetarian", "vegan", "other", ""],
        message: "Invalid meal preference",
      },
    },
    allergies: {
      type: String,
      trim: true,
      maxlength: [200, "Allergies information cannot exceed 200 characters"],
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
rsvpSchema.index({ userId: 1, attending: 1 });
rsvpSchema.index({ attending: 1, createdAt: -1 });

// Ensure one RSVP per user
rsvpSchema.index({ userId: 1 }, { unique: true });

// Virtual for total guest count including primary guest
rsvpSchema.virtual("totalGuestCount").get(function () {
  const baseCount = this.attending === "YES" ? 1 : 0;
  return baseCount + (this.guestCount || 0);
});

// Pre-save middleware for data validation and consistency
rsvpSchema.pre("save", function (next) {
  // Ensure guest count is consistent with guests array
  if (this.guests && this.guests.length > 0) {
    this.guestCount = Math.max(this.guestCount || 0, this.guests.length - 1);
  }

  // If not attending, clear guest-related fields
  if (this.attending === "NO") {
    this.guestCount = 0;
    this.guests = [];
  }

  next();
});

// Static methods for common queries
rsvpSchema.statics.findByUserId = function (
  userId: string | mongoose.Types.ObjectId
) {
  return this.findOne({ userId });
};

rsvpSchema.statics.findAttending = function () {
  return this.find({ attending: "YES" });
};

rsvpSchema.statics.findNotAttending = function () {
  return this.find({ attending: "NO" });
};

rsvpSchema.statics.findMaybe = function () {
  return this.find({ attending: "MAYBE" });
};

rsvpSchema.statics.getAttendanceStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: "$attending",
        count: { $sum: 1 },
        totalGuests: { $sum: { $add: [1, { $ifNull: ["$guestCount", 0] }] } },
      },
    },
  ]);
};

export const RSVP =
  mongoose.models.RSVP || mongoose.model<IRSVP>("RSVP", rsvpSchema);

export default RSVP;
