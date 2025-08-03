import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  isAdmin: boolean;
  isInvited: boolean;
  qrToken: string;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    isAdmin: { type: Boolean, default: false },
    isInvited: { type: Boolean, default: true }, // Default to true for demo
    qrToken: { type: String, required: true, unique: true },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Add indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ qrToken: 1 });
userSchema.index({ isInvited: 1 });

export default mongoose.models.User ||
  mongoose.model<IUser>("User", userSchema);
