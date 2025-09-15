import mongoose, { Schema, Document } from "mongoose";

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
