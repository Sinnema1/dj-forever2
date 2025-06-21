import RSVP from "../models/RSVP";

// Placeholder for RSVP service
// TODO: Implement RSVP service logic (e.g., create, update, fetch RSVP data, etc.)
export async function submitRSVP({
  userId,
  fullName,
  attending,
  mealPreference,
  allergies,
  additionalNotes,
}: {
  userId: string;
  fullName: string;
  attending: string;
  mealPreference: string;
  allergies?: string;
  additionalNotes?: string;
}) {
  const rsvpDoc = await RSVP.create({
    userId,
    fullName,
    attending,
    mealPreference,
    allergies,
    additionalNotes,
  });
  return rsvpDoc.toObject();
}

export {};
