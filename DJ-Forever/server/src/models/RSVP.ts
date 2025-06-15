import { Schema, model, type Document, Types } from "mongoose";

/**
 * @interface RSVPDocument
 * Defines the structure of an RSVP document in the database.
 */
export interface RSVPDocument extends Document {
  userId: Types.ObjectId; // Use `Types.ObjectId` for consistency
  attending: "YES" | "NO" | "MAYBE";
  mealPreference: string;
  allergies?: string;
  additionalNotes?: string;
}

/**
 * @constant rsvpSchema
 * Defines the structure of the RSVP collection in the database.
 */
const rsvpSchema = new Schema<RSVPDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Ensures each user can submit only one RSVP
    },
    attending: {
      type: String,
      enum: ["YES", "NO", "MAYBE"],
      required: true,
    },
    mealPreference: {
      type: String,
      required: true,
      trim: true, // Ensures no unnecessary spaces
    },
    allergies: {
      type: String,
      trim: true,
      default: "",
    },
    additionalNotes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const RSVP = model<RSVPDocument>("RSVP", rsvpSchema);
export default RSVP;
