import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  isAdmin: boolean;
  isInvited: boolean;
  hasRSVPed: boolean;
  qrToken: string;
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
    qrToken: {
      type: String,
      required: [true, "QR token is required"],
      unique: true,
      trim: true,
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
userSchema.index({ isInvited: 1, hasRSVPed: 1 });
userSchema.index({ email: 1, qrToken: 1 });

// Virtual for full user info
userSchema.virtual("status").get(function () {
  if (!this.isInvited) return "not-invited";
  if (this.hasRSVPed) return "rsvped";
  return "invited";
});

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

userSchema.statics.findInvitedUsers = function () {
  return this.find({ isInvited: true });
};

userSchema.statics.findRSVPedUsers = function () {
  return this.find({ hasRSVPed: true });
};

export default mongoose.models.User ||
  mongoose.model<IUser>("User", userSchema);
