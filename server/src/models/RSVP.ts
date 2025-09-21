import mongoose, { Schema, Document } from "mongoose";

export interface IGuest {
  fullName: string;
  mealPreference: string;
  allergies?: string;
}

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
