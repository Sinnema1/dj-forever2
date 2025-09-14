import mongoose, { Schema, Document } from "mongoose";

export interface IGuest {
  fullName: string;
  mealPreference: string;
  allergies?: string;
}

export interface IRSVP extends Document {
  userId: mongoose.Types.ObjectId;
  attending: string;
  guestCount?: number;
  guests?: IGuest[];
  additionalNotes?: string;
  // Legacy fields for backward compatibility
  fullName?: string;
  mealPreference?: string;
  allergies?: string;
}

const guestSchema = new Schema<IGuest>({
  fullName: { type: String, required: true },
  mealPreference: { type: String, required: true },
  allergies: { type: String },
});

const rsvpSchema = new Schema<IRSVP>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  attending: { type: String, required: true },
  guestCount: { type: Number },
  guests: [guestSchema],
  additionalNotes: { type: String },
  // Legacy fields for backward compatibility
  fullName: { type: String },
  mealPreference: { type: String },
  allergies: { type: String },
});

export const RSVP =
  mongoose.models.RSVP || mongoose.model<IRSVP>("RSVP", rsvpSchema);

export default RSVP;
