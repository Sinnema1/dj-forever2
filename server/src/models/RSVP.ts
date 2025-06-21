import mongoose, { Schema, Document } from "mongoose";

export interface IRSVP extends Document {
  userId: mongoose.Types.ObjectId;
  attending: string;
  mealPreference: string;
  allergies?: string;
  additionalNotes?: string;
  fullName: string;
}

const rsvpSchema = new Schema<IRSVP>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  attending: { type: String, required: true },
  mealPreference: { type: String, required: true },
  allergies: { type: String },
  additionalNotes: { type: String },
  fullName: { type: String, required: true },
});

export default mongoose.models.RSVP ||
  mongoose.model<IRSVP>("RSVP", rsvpSchema);
