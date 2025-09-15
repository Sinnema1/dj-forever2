import RSVP, { IRSVP, IGuest } from "../models/RSVP.js";
import User from "../models/User.js";
import { Document } from "mongoose";
import { ValidationError } from "../utils/errors.js";
import {
  validateName,
  validateAttendance,
  validateGuestCount,
  validateMealPreference,
  sanitizeText,
} from "../utils/validation.js";

export interface CreateRSVPInput {
  userId: string;
  fullName?: string;
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
}

export interface UpdateRSVPInput {
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

/**
 * Get RSVP for a specific user
 */
export async function getRSVP(userId: string): Promise<any> {
  try {
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    const rsvp = (await (RSVP.findOne as any)({ userId })) as
      | (Document<unknown, {}, IRSVP> & IRSVP)
      | null;

    return rsvp ? rsvp.toObject() : null;
  } catch (error: any) {
    console.error("Error fetching RSVP:", error);
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new Error("Failed to fetch RSVP");
  }
}

/**
 * Validate guest data
 */
function validateGuests(
  guests: Array<{
    fullName: string;
    mealPreference: string;
    allergies?: string;
  }>,
  attending: string
): IGuest[] {
  if (attending === "YES" && (!guests || guests.length === 0)) {
    throw new ValidationError("At least one guest is required when attending");
  }

  return guests.map((guest, index) => {
    try {
      const validatedGuest: IGuest = {
        fullName:
          attending === "YES"
            ? validateName(guest.fullName, `Guest ${index + 1} name`)
            : guest.fullName || "",
        mealPreference:
          attending === "YES"
            ? validateMealPreference(guest.mealPreference, attending)
            : guest.mealPreference || "",
      };

      if (guest.allergies) {
        validatedGuest.allergies = sanitizeText(guest.allergies, 200);
      }

      return validatedGuest;
    } catch (error: any) {
      throw new ValidationError(`Guest ${index + 1}: ${error.message}`);
    }
  });
}

/**
 * Create a new RSVP with comprehensive validation
 */
export async function createRSVP(input: CreateRSVPInput): Promise<any> {
  try {
    console.log(
      `[DEBUG] createRSVP called with input:`,
      JSON.stringify(input, null, 2)
    );

    const {
      userId,
      fullName,
      attending,
      mealPreference,
      allergies,
      additionalNotes,
      guestCount,
      guests,
    } = input;

    // Validate required fields
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    // Check if RSVP already exists
    const existingRSVP = await getRSVP(userId);
    if (existingRSVP) {
      throw new ValidationError("RSVP already exists for this user");
    }

    // Validate attendance
    const validatedAttending = validateAttendance(attending);
    console.log(`[DEBUG] Validated attendance: ${validatedAttending}`);

    // Validate guest count
    const validatedGuestCount = guestCount ? validateGuestCount(guestCount) : 1;
    console.log(`[DEBUG] Validated guest count: ${validatedGuestCount}`);

    // Validate guests array
    let validatedGuests: IGuest[] = [];
    if (guests && guests.length > 0) {
      validatedGuests = validateGuests(guests, validatedAttending);

      // Ensure guest count matches guests array
      if (validatedGuests.length !== validatedGuestCount) {
        throw new ValidationError(
          "Guest count must match the number of guests provided"
        );
      }
    } else if (validatedAttending === "YES") {
      // Create default guest from legacy fields
      if (!fullName) {
        throw new ValidationError("Guest name is required when attending");
      }

      const defaultGuest: IGuest = {
        fullName: validateName(fullName),
        mealPreference: mealPreference
          ? validateMealPreference(mealPreference, validatedAttending)
          : "",
      };

      if (allergies) {
        defaultGuest.allergies = sanitizeText(allergies, 200);
      }

      validatedGuests = [defaultGuest];
    }

    // Validate optional fields
    const sanitizedNotes = additionalNotes
      ? sanitizeText(additionalNotes, 500)
      : undefined;
    const sanitizedAllergies = allergies
      ? sanitizeText(allergies, 200)
      : undefined;

    // Create RSVP document
    const rsvpDoc = (await (RSVP.create as any)({
      userId,
      attending: validatedAttending,
      guestCount: validatedGuestCount,
      guests: validatedGuests,
      additionalNotes: sanitizedNotes,
      // Legacy fields for backward compatibility
      fullName: validatedGuests[0]?.fullName || fullName,
      mealPreference: validatedGuests[0]?.mealPreference || mealPreference,
      allergies: sanitizedAllergies,
    })) as Document<unknown, {}, IRSVP> & IRSVP;

    // Update user's hasRSVPed status
    await (User.findByIdAndUpdate as any)(userId, { hasRSVPed: true });

    return rsvpDoc.toObject();
  } catch (error: any) {
    console.error("Error creating RSVP:", error);
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new Error("Failed to create RSVP");
  }
}

/**
 * Update an existing RSVP with validation
 */
export async function updateRSVP(
  userId: string,
  updates: UpdateRSVPInput
): Promise<any> {
  try {
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    // Validate updates
    const validatedUpdates: any = {};

    if (updates.attending !== undefined) {
      validatedUpdates.attending = validateAttendance(updates.attending);
    }

    if (updates.guestCount !== undefined) {
      validatedUpdates.guestCount = validateGuestCount(updates.guestCount);
    }

    if (updates.guests !== undefined) {
      const attending = updates.attending || "YES"; // Assume attending if guests provided
      validatedUpdates.guests = validateGuests(updates.guests, attending);

      // Update legacy fields from first guest
      if (validatedUpdates.guests.length > 0) {
        validatedUpdates.fullName = validatedUpdates.guests[0].fullName;
        validatedUpdates.mealPreference =
          validatedUpdates.guests[0].mealPreference;
        validatedUpdates.allergies = validatedUpdates.guests[0].allergies;
      }
    }

    if (updates.additionalNotes !== undefined) {
      validatedUpdates.additionalNotes = sanitizeText(
        updates.additionalNotes,
        500
      );
    }

    if (updates.mealPreference !== undefined) {
      // Get current RSVP to check attendance status
      const currentRSVP = await (RSVP.findOne as any)({ userId });
      const currentAttending =
        updates.attending || (currentRSVP ? currentRSVP.attending : "YES");

      validatedUpdates.mealPreference = validateMealPreference(
        updates.mealPreference,
        currentAttending
      );
    }

    if (updates.allergies !== undefined) {
      validatedUpdates.allergies = sanitizeText(updates.allergies, 200);
    }

    const rsvp = (await (RSVP.findOneAndUpdate as any)(
      { userId },
      { $set: validatedUpdates },
      { new: true }
    )) as (Document<unknown, {}, IRSVP> & IRSVP) | null;

    if (!rsvp) {
      throw new ValidationError("RSVP not found");
    }

    return rsvp.toObject();
  } catch (error: any) {
    console.error("Error updating RSVP:", error);
    if (error instanceof ValidationError) {
      throw error;
    }
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
}): Promise<any> {
  // Create guest object with proper optional property handling
  const guest: IGuest = {
    fullName,
    mealPreference,
  };

  if (allergies) {
    guest.allergies = allergies;
  }

  // Create RSVP data with proper optional property handling
  const rsvpData: CreateRSVPInput = {
    userId,
    fullName,
    attending,
    mealPreference,
    guestCount: 1,
    guests: [guest],
  };

  if (allergies) {
    rsvpData.allergies = allergies;
  }

  if (additionalNotes) {
    rsvpData.additionalNotes = additionalNotes;
  }

  return createRSVP(rsvpData);
}
