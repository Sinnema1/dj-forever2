/**
 * @fileoverview RSVP Service for DJ Forever 2 Wedding Website
 * @module services/rsvpService
 * @version 1.0.0
 *
 * Comprehensive RSVP management service handling wedding guest responses, multi-guest
 * party management, and meal preference tracking. Implements both modern multi-guest
 * RSVP format and legacy single-guest compatibility for seamless data migration.
 *
 * RSVP Features:
 * - Multi-guest party support with individual meal preferences
 * - Comprehensive validation for attendance, guest count, and dietary requirements
 * - Legacy single-guest RSVP compatibility for backward compatibility
 * - Meal preference validation with predefined options
 * - Guest dietary restrictions and allergy tracking
 * - Additional notes support for special requests
 *
 * Data Validation:
 * - Attendance status validation (YES, NO, MAYBE)
 * - Guest count limits (0-10 guests per RSVP)
 * - Required fields enforcement based on attendance status
 * - Text sanitization for security and data integrity
 * - Meal preference validation against predefined options
 *
 * Legacy Compatibility:
 * - submitRSVP: Legacy single-guest format support
 * - createRSVP: Modern multi-guest format with guest array
 * - Automatic migration between formats during updates
 * - Backward-compatible field mapping for existing data
 *
 * Business Logic:
 * - One RSVP per user (enforced at database level)
 * - User.hasRSVPed status tracking for invitation management
 * - Guest count consistency validation
 * - Conditional field requirements based on attendance status
 *
 * @example
 * // Create Multi-Guest RSVP:
 * // const rsvp = await createRSVP({
 * //   userId: '507f1f77bcf86cd799439011',
 * //   attending: 'YES',
 * //   guests: [{ fullName: 'John Doe', mealPreference: 'chicken' }]
 * // });
 *
 * @example
 * // Legacy Single-Guest RSVP:
 * // const rsvp = await submitRSVP({
 * //   userId: '507f1f77bcf86cd799439011',
 * //   fullName: 'Jane Smith',
 * //   attending: 'YES',
 * //   mealPreference: 'vegetarian'
 * // });
 *
 * @dependencies
 * - ../models/RSVP: RSVP model for database operations
 * - ../models/User: User model for hasRSVPed status updates
 * - ../utils/errors: Custom error classes for validation failures
 * - ../utils/validation: Input validation and sanitization functions
 */

import RSVP, { IRSVP, IGuest } from "../models/RSVP.js";
import User, { IUser } from "../models/User.js";
import mongoose, { Document } from "mongoose";
import { ValidationError } from "../utils/errors.js";
import { featuresConfig } from "../config/index.js";
import {
  validateName,
  validateAttendance,
  validateGuestCount,
  validateMealPreference,
  sanitizeText,
} from "../utils/validation.js";

/**
 * Input interface for creating new RSVP records.
 * Supports both modern multi-guest format and legacy single-guest compatibility.
 *
 * @interface CreateRSVPInput
 * @property {string} userId - MongoDB ObjectId of the authenticated user
 * @property {string} [fullName] - Legacy field: Primary guest name (backward compatibility)
 * @property {string} attending - Attendance status: 'YES', 'NO', or 'MAYBE'
 * @property {string} [mealPreference] - Legacy field: Primary guest meal preference
 * @property {string} [allergies] - Legacy field: Primary guest dietary restrictions
 * @property {string} [additionalNotes] - Special requests or additional information
 * @property {number} [guestCount] - Total number of guests in the party
 * @property {Array} [guests] - Modern field: Array of guest objects with individual preferences
 */
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

/**
 * Input interface for updating existing RSVP records.
 * All fields are optional to support partial updates and flexible modification.
 *
 * @interface UpdateRSVPInput
 * @property {string} [attending] - Updated attendance status
 * @property {string} [mealPreference] - Updated meal preference for primary guest
 * @property {string} [allergies] - Updated dietary restrictions
 * @property {string} [additionalNotes] - Updated special requests
 * @property {number} [guestCount] - Updated total guest count
 * @property {Array} [guests] - Updated guest array with individual preferences
 */
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
 * Validates party size against household member limits and plus-one allowance.
 * Ensures guests cannot exceed their allocated party size based on household
 * composition and plus-one permissions.
 *
 * @param {number} totalGuestCount - Total number of guests including the primary guest
 * @param {IUser} user - User record with household members and plus-one status
 * @throws {ValidationError} If party size exceeds maximum allowed guests
 */
function validatePartySize(totalGuestCount: number, user: IUser): void {
  const namedGuestCount = 1 + (user.householdMembers?.length || 0);
  const maxAllowed = namedGuestCount + (user.plusOneAllowed ? 1 : 0);

  if (totalGuestCount > maxAllowed) {
    throw new ValidationError(
      `Party size ${totalGuestCount} exceeds maximum allowed ${maxAllowed} guests. ` +
        `(${namedGuestCount} household member${namedGuestCount > 1 ? "s" : ""}${
          user.plusOneAllowed ? " + 1 plus-one" : ""
        })`,
    );
  }
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
  attending: string,
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
            ? validateMealPreference(
                guest.mealPreference || "",
                attending,
                featuresConfig.mealPreferencesEnabled,
              )
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

    // Fetch user to validate party size limits
    const UserModel = mongoose.model<IUser>("User");
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      throw new ValidationError("User not found");
    }

    // Validate attendance
    const validatedAttending = validateAttendance(attending);

    // Validate guests array first — guestCount is derived from it, not the other way around.
    let validatedGuests: IGuest[] = [];
    if (guests && guests.length > 0) {
      validatedGuests = validateGuests(guests, validatedAttending);
    } else if (validatedAttending === "YES") {
      // Create default guest from legacy fields
      if (!fullName) {
        throw new ValidationError("Guest name is required when attending");
      }

      const defaultGuest: IGuest = {
        fullName: validateName(fullName),
        mealPreference: mealPreference
          ? validateMealPreference(
              mealPreference,
              validatedAttending,
              featuresConfig.mealPreferencesEnabled,
            )
          : "",
      };

      if (allergies) {
        defaultGuest.allergies = sanitizeText(allergies, 200);
      }

      validatedGuests = [defaultGuest];
    }

    // Validate party size against household limits using TOTAL guest count.
    // guestCount on the document means "additional guests beyond the primary"
    // (= guests.length - 1), but party size is validated against the full total.
    const totalAttending = validatedGuests.length || 1;
    validatePartySize(totalAttending, user);

    // Optionally validate the caller-supplied guestCount for range (0-10), but
    // always normalise from the guests array so the document stays consistent.
    if (guestCount !== undefined) {
      validateGuestCount(guestCount); // throws if out of range
    }
    const validatedGuestCount = Math.max(0, validatedGuests.length - 1);

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
      allergies: validatedGuests[0]?.allergies || sanitizedAllergies,
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
  updates: UpdateRSVPInput,
): Promise<any> {
  try {
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    // Fetch user to validate party size limits
    const UserModel = mongoose.model<IUser>("User");
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      throw new ValidationError("User not found");
    }

    // Validate updates
    const validatedUpdates: any = {};

    if (updates.attending !== undefined) {
      validatedUpdates.attending = validateAttendance(updates.attending);
    }

    const nextAttending =
      (validatedUpdates.attending as string | undefined) || updates.attending;
    const isDeclining = nextAttending === "NO";

    if (updates.guests !== undefined) {
      // Validate the guests array first — guestCount is derived from it.
      const attending =
        validatedUpdates.attending || updates.attending || "YES";
      validatedUpdates.guests = validateGuests(updates.guests, attending);

      // Always normalise guestCount from the guests array so the document stays
      // consistent regardless of what the caller sent. findOneAndUpdate bypasses
      // the pre-save hook, so we must do it here.
      validatedUpdates.guestCount = Math.max(
        0,
        validatedUpdates.guests.length - 1,
      );

      // Validate total party size (guests.length = total including primary)
      validatePartySize(validatedUpdates.guests.length, user);

      // Update legacy fields from first guest
      if (validatedUpdates.guests.length > 0) {
        validatedUpdates.fullName = validatedUpdates.guests[0].fullName;
        validatedUpdates.mealPreference =
          validatedUpdates.guests[0].mealPreference;
        validatedUpdates.allergies = validatedUpdates.guests[0].allergies;
      }
    } else if (updates.guestCount !== undefined && !isDeclining) {
      // guestCount-only update (no guests array): validate range and party size.
      // guestCount = additional guests, so total = guestCount + 1.
      validatedUpdates.guestCount = validateGuestCount(updates.guestCount);
      validatePartySize(validatedUpdates.guestCount + 1, user);
    }

    if (isDeclining) {
      // Keep NO RSVPs consistent even when guests are omitted in the payload.
      // findOneAndUpdate bypasses the pre-save cleanup hook.
      validatedUpdates.guests = [];
      validatedUpdates.guestCount = 0;
      validatedUpdates.mealPreference = "";
      validatedUpdates.allergies = "";
      validatedUpdates.fullName = user.fullName;
    }

    if (updates.additionalNotes !== undefined) {
      validatedUpdates.additionalNotes = sanitizeText(
        updates.additionalNotes,
        500,
      );
    }

    if (updates.mealPreference !== undefined) {
      // Get current RSVP to check attendance status
      const currentRSVP = await (RSVP.findOne as any)({ userId });
      const currentAttending =
        updates.attending || (currentRSVP ? currentRSVP.attending : "YES");

      validatedUpdates.mealPreference = validateMealPreference(
        updates.mealPreference,
        currentAttending,
        featuresConfig.mealPreferencesEnabled,
      );
    }

    if (updates.allergies !== undefined) {
      validatedUpdates.allergies = sanitizeText(updates.allergies, 200);
    }

    const rsvp = (await (RSVP.findOneAndUpdate as any)(
      { userId },
      { $set: validatedUpdates },
      { new: true },
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
    guestCount: 0,
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
