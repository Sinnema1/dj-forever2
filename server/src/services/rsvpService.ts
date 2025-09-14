import RSVP from "../models/RSVP.js";
import User from "../models/User.js";

/**
 * Get RSVP for a specific user
 */
export async function getRSVP(userId: string) {
  try {
    const rsvp = await RSVP.findOne({ userId });
    return rsvp ? rsvp.toObject() : null;
  } catch (error) {
    console.error("Error fetching RSVP:", error);
    throw new Error("Failed to fetch RSVP");
  }
}

/**
 * Create a new RSVP
 */
export async function createRSVP({
  userId,
  fullName,
  attending,
  mealPreference,
  allergies,
  additionalNotes,
  guestCount,
  guests,
}: {
  userId: string;
  fullName: string;
  attending: string;
  mealPreference?: string;
  allergies?: string;
  additionalNotes?: string;
  guestCount?: number;
  guests?: Array<{
    fullName: string;
    mealPreference: string;
    allergies?: string;
  }>;
}) {
  try {
    const rsvpDoc = await RSVP.create({
      userId,
      fullName,
      attending,
      mealPreference,
      allergies,
      additionalNotes,
      guestCount,
      guests,
    });

    // Update user's hasRSVPed status
    await User.findByIdAndUpdate(userId, { hasRSVPed: true });

    return rsvpDoc.toObject();
  } catch (error) {
    console.error("Error creating RSVP:", error);
    throw new Error("Failed to create RSVP");
  }
}

/**
 * Update an existing RSVP
 */
export async function updateRSVP(
  userId: string,
  updates: {
    attending?: string;
    mealPreference?: string;
    allergies?: string;
    additionalNotes?: string;
    guestCount?: number;
    guests?: Array<{
      fullName: string;
      mealPreference: string;
      allergies?: string;
    }>;
  }
) {
  try {
    const rsvp = await RSVP.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true }
    );

    if (!rsvp) {
      throw new Error("RSVP not found");
    }

    return rsvp.toObject();
  } catch (error) {
    console.error("Error updating RSVP:", error);
    throw new Error("Failed to update RSVP");
  }
}

/**
 * Legacy function for backward compatibility
 */
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

  // Update user's hasRSVPed status
  await User.findByIdAndUpdate(userId, { hasRSVPed: true });

  return rsvpDoc.toObject();
}
