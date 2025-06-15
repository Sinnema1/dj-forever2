import { Schema, model, type Document, Types } from "mongoose";
import bcrypt from "bcrypt";

/**
 * @interface UserDocument
 * Defines the structure of a user document in the database.
 */
export interface UserDocument extends Document {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  isCorrectPassword(password: string): Promise<boolean>;
  hasRSVPed: boolean;
  rsvpId?: Types.ObjectId | null;
  isInvited: boolean;
  isAdmin: boolean;
}

/**
 * @constant userSchema
 * Defines the structure of the User collection in the database.
 */
const userSchema = new Schema<UserDocument>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      match: [/.+@.+\..+/, "Must use a valid email address"],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      select: false,
    },
    hasRSVPed: {
      type: Boolean,
      default: false,
    },
    rsvpId: {
      type: Schema.Types.ObjectId,
      ref: "RSVP",
      default: null,
    },
    isInvited: {
      type: Boolean,
      required: true,
      default: false, // Set default value to false
    },
    isAdmin: {
      type: Boolean,
      default: false, // Most users are not admins by default
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Middleware: Hashes user password before saving to the database.
 */
userSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

/**
 * @method isCorrectPassword
 * Validates the user's password during login.
 * @param {string} password - The input password.
 * @returns {Promise<boolean>} - True if the password is correct, otherwise false.
 */
userSchema.methods.isCorrectPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

const User = model<UserDocument>("User", userSchema);
export default User;