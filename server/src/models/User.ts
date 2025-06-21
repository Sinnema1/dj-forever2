import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  isAdmin: boolean;
  isInvited: boolean;
}

const userSchema = new Schema<IUser>({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isInvited: { type: Boolean, default: true }, // Default to true for demo
});

export default mongoose.models.User ||
  mongoose.model<IUser>("User", userSchema);
