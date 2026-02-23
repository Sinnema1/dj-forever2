/**
 * @fileoverview User Model for DJ Forever 2 Wedding Website
 * @module models/User
 * @version 1.0.0
 *
 * Mongoose User model implementing QR-code-based authentication system for wedding website.
 * Manages user profiles, invitation status, RSVP tracking, and administrative permissions.
 * Designed for passwordless authentication where users authenticate via unique QR tokens
 * embedded in wedding invitations.
 *
 * Authentication Model:
 * - No password fields - authentication is QR-code only
 * - Unique qrToken field for each user (generated during invitation process)
 * - isInvited flag controls access to website features
 * - isAdmin flag for wedding couple administrative access
 *
 * RSVP Integration:
 * - hasRSVPed boolean tracks RSVP completion status
 * - Updated automatically when user creates/updates RSVP
 * - Used for invitation management and guest tracking
 *
 * Database Optimizations:
 * - Compound indexes for common query patterns
 * - Unique constraints on email and qrToken fields
 * - Automatic timestamps for audit trail
 * - Optimized transforms for JSON serialization
 *
 * Validation Features:
 * - Email format validation with regex pattern
 * - Automatic email normalization (lowercase, trim)
 * - Name length limits and trimming
 * - QR token uniqueness enforcement
 *
 * Static Methods:
 * - findByEmail: Email-based user lookup
 * - findByQRToken: QR token-based authentication
 * - findInvitedUsers: Query all invited guests
 * - findRSVPedUsers: Query guests who have RSVPed
 *
 * @example
 * // Create new user:
 * // const user = new User({
 * //   fullName: 'John Doe',
 * //   email: 'john@example.com',
 * //   qrToken: 'unique-qr-token-123'
 * // });
 *
 * @example
 * // Find user by QR token:
 * // const user = await User.findByQRToken('abc123def456');
 *
 * @dependencies
 * - mongoose: MongoDB ODM for schema definition and database operations
 */

import mongoose, { Schema, Document } from "mongoose";

/**
 * User interface extending Mongoose Document for type safety.
 * Defines all user properties with proper TypeScript typing.
 *
 * @interface IUser
 * @extends Document
 * @property {string} fullName - User's full name (required, max 100 characters)
 * @property {string} email - User's email address (unique, validated, normalized)
 * @property {boolean} isAdmin - Administrative permissions flag (default: false)
 * @property {boolean} isInvited - Invitation status flag (default: true)
 * @property {boolean} hasRSVPed - RSVP completion status (default: false, updated by RSVP service)
 * @property {string} qrToken - Unique QR token for authentication (required, unique)
 * @property {string} relationshipToBride - Primary guest's relationship to bride (optional, for personalization)
 * @property {string} relationshipToGroom - Primary guest's relationship to groom (optional, for personalization)
 * @property {Array} householdMembers - Additional guests in the household (optional)
 * @property {string} customWelcomeMessage - Personalized welcome message for entire household (optional)
 * @property {string} guestGroup - Group classification (e.g., 'family', 'friends', 'work') (optional)
 * @property {boolean} plusOneAllowed - Whether household is allowed a plus-one (default: false)
 * @property {Date} createdAt - Account creation timestamp (automatic)
 * @property {Date} updatedAt - Last modification timestamp (automatic)
 */

export interface IHouseholdMember {
  firstName: string;
  lastName: string;
  relationshipToBride?: string;
  relationshipToGroom?: string;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  isAdmin: boolean;
  isInvited: boolean;
  hasRSVPed: boolean;
  rsvpId?: mongoose.Types.ObjectId;
  rsvp?: any; // Virtual field populated from RSVP collection
  qrToken: string;
  qrAlias?: string;
  qrAliasLocked?: boolean;
  relationshipToBride?: string;
  relationshipToGroom?: string;
  householdMembers?: IHouseholdMember[];
  customWelcomeMessage?: string;
  guestGroup?: string;
  plusOneAllowed: boolean;
  plusOneName?: string;
  personalPhoto?: string;
  specialInstructions?: string;
  dietaryRestrictions?: string;
  // Mailing address fields (for invitation sending)
  streetAddress?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email address",
      ],
    },
    isAdmin: {
      type: Boolean,
      default: false,
      index: true,
    },
    isInvited: {
      type: Boolean,
      default: true,
      index: true,
    },
    hasRSVPed: {
      type: Boolean,
      default: false,
      index: true,
    },
    rsvpId: {
      type: Schema.Types.ObjectId,
      ref: "RSVP",
    },
    qrToken: {
      type: String,
      required: [true, "QR token is required"],
      unique: true,
      trim: true,
    },
    qrAlias: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined values, only enforces uniqueness when present
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9-]+$/,
        "QR alias must contain only lowercase letters, numbers, and hyphens",
      ],
      minlength: [3, "QR alias must be at least 3 characters"],
      maxlength: [50, "QR alias cannot exceed 50 characters"],
    },
    qrAliasLocked: {
      type: Boolean,
      default: false,
    },
    relationshipToBride: {
      type: String,
      trim: true,
      maxlength: [100, "Relationship description cannot exceed 100 characters"],
    },
    relationshipToGroom: {
      type: String,
      trim: true,
      maxlength: [100, "Relationship description cannot exceed 100 characters"],
    },
    householdMembers: [
      {
        firstName: {
          type: String,
          required: true,
          trim: true,
          maxlength: [50, "First name cannot exceed 50 characters"],
        },
        lastName: {
          type: String,
          required: false,
          trim: true,
          maxlength: [50, "Last name cannot exceed 50 characters"],
        },
        relationshipToBride: {
          type: String,
          trim: true,
          maxlength: [
            100,
            "Relationship description cannot exceed 100 characters",
          ],
        },
        relationshipToGroom: {
          type: String,
          trim: true,
          maxlength: [
            100,
            "Relationship description cannot exceed 100 characters",
          ],
        },
      },
    ],
    customWelcomeMessage: {
      type: String,
      trim: true,
      maxlength: [1000, "Welcome message cannot exceed 1000 characters"],
    },
    guestGroup: {
      type: String,
      trim: true,
      lowercase: true,
      enum: {
        values: [
          "grooms_family",
          "friends",
          "brides_family",
          "extended_family",
          "other",
        ],
        message: "{VALUE} is not a valid guest group",
      },
      index: true,
    },
    plusOneAllowed: {
      type: Boolean,
      default: false,
      index: true,
    },
    plusOneName: {
      type: String,
      trim: true,
      maxlength: [100, "Plus-one name cannot exceed 100 characters"],
    },
    // Mailing address fields for invitation sending
    streetAddress: {
      type: String,
      trim: true,
      maxlength: [200, "Street address cannot exceed 200 characters"],
    },
    addressLine2: {
      type: String,
      trim: true,
      maxlength: [100, "Address line 2 cannot exceed 100 characters"],
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, "City cannot exceed 100 characters"],
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, "State cannot exceed 50 characters"],
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: [20, "ZIP code cannot exceed 20 characters"],
    },
    country: {
      type: String,
      trim: true,
      default: "USA",
      maxlength: [100, "Country cannot exceed 100 characters"],
    },
    personalPhoto: {
      type: String,
      trim: true,
      maxlength: [500, "Photo URL cannot exceed 500 characters"],
    },
    specialInstructions: {
      type: String,
      trim: true,
      maxlength: [500, "Special instructions cannot exceed 500 characters"],
    },
    dietaryRestrictions: {
      type: String,
      trim: true,
      maxlength: [500, "Dietary restrictions cannot exceed 500 characters"],
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
  },
);

// Compound indexes for common query patterns
userSchema.index({ isInvited: 1, hasRSVPed: 1 });
userSchema.index({ email: 1, qrToken: 1 });

// Virtual for full user info
userSchema.virtual("status").get(function () {
  if (!this.isInvited) return "not-invited";
  if (this.hasRSVPed) return "rsvped";
  return "invited";
});

// Virtual populate for RSVP data
userSchema.virtual("rsvp", {
  ref: "RSVP",
  localField: "_id",
  foreignField: "userId",
  justOne: true,
});

// Ensure virtuals are included in JSON/Object output
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

// Pre-save middleware for data validation
userSchema.pre("save", function (next) {
  // Ensure email is always lowercase
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }

  // Ensure fullName is properly formatted
  if (this.fullName) {
    this.fullName = this.fullName.trim();
  }

  next();
});

// Static methods for common queries
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

userSchema.statics.findByQRToken = function (qrToken: string) {
  return this.findOne({ qrToken: qrToken.trim() });
};

userSchema.statics.findByQRAlias = function (qrAlias: string) {
  return this.findOne({ qrAlias: qrAlias.toLowerCase().trim() });
};

userSchema.statics.findByQRTokenOrAlias = function (identifier: string) {
  const normalizedIdentifier = identifier.toLowerCase().trim();
  return this.findOne({
    $or: [{ qrToken: identifier.trim() }, { qrAlias: normalizedIdentifier }],
  });
};

userSchema.statics.findInvitedUsers = function () {
  return this.find({ isInvited: true });
};

userSchema.statics.findRSVPedUsers = function () {
  return this.find({ hasRSVPed: true });
};

export default mongoose.models.User ||
  mongoose.model<IUser>("User", userSchema);
