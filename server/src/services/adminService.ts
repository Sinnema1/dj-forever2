/**
 * @fileoverview Admin Service for Wedding Management Operations
 * @module services/adminService
 * @version 1.0.0
 *
 * Comprehensive admin service providing wedding planning and guest management
 * functionality. Handles RSVP statistics, guest list management, data export,
 * and administrative operations for the DJ Forever 2 wedding website.
 *
 * Features:
 * - RSVP statistics and analytics for wedding planning
 * - Guest list management with search and filtering
 * - Data export for catering and venue coordination
 * - Admin-only RSVP and user management operations
 * - Comprehensive wedding statistics dashboard
 *
 * Security:
 * - All operations require admin authentication
 * - Input validation and sanitization
 * - Proper error handling and logging
 * - Data access restricted to admin users only
 *
 * @example
 * ```typescript
 * // Get wedding statistics
 * const stats = await getWeddingStats();
 * console.log(`${stats.totalAttending} guests attending`);
 *
 * // Export guest list
 * const csv = await exportGuestListCSV();
 * fs.writeFileSync('guest-list.csv', csv);
 * ```
 *
 * @dependencies
 * - ../models/User: User model for guest management
 * - ../models/RSVP: RSVP model for response tracking
 * - ../utils/logger: Logging service for admin operations
 * - ../utils/errors: Custom error classes for proper error handling
 */

import UserModel, { IUser } from "../models/User.js";
import RSVP from "../models/RSVP.js";
import { ValidationError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import {
  generateQRCodeForUser,
  generateQRCodesForUsers,
} from "../utils/qrCodeGenerator.js";
import type { Model } from "mongoose";

// Type assertion to resolve union type from mongoose.models pattern
const User = UserModel as Model<IUser>;

import type {
  AdminStats,
  MealPreferenceCount,
  AdminUser,
  AdminRSVPUpdateInput,
  AdminUserUpdateInput,
} from "../types/graphql.js";

/**
 * Get comprehensive wedding statistics for admin dashboard
 *
 * @returns {Promise<AdminStats>} Complete wedding statistics
 * @throws {Error} If database query fails
 *
 * @example
 * ```typescript
 * const stats = await getWeddingStats();
 * console.log(`RSVP Rate: ${stats.rsvpPercentage}%`);
 * console.log(`Attending: ${stats.totalAttending} guests`);
 * ```
 */
export async function getWeddingStats(): Promise<AdminStats> {
  try {
    logger.info("Fetching wedding statistics", { service: "AdminService" });

    // Get all invited users with their RSVPs
    const users = await (User.find as any)({ isInvited: true }).populate(
      "rsvp",
    );

    const totalInvited = users.length;
    const usersWithRSVP = users.filter((user: any) => user.hasRSVPed);
    const totalRSVPed = usersWithRSVP.length;

    // Count attendance responses
    let totalAttending = 0;
    let totalNotAttending = 0;
    let totalMaybe = 0;
    const mealPreferenceCounts = new Map<string, number>();
    const dietaryRestrictions = new Set<string>();

    for (const user of usersWithRSVP) {
      const rsvp = user.rsvp;
      if (!rsvp) continue;

      switch (rsvp.attending) {
        case "YES":
          totalAttending++;
          break;
        case "NO":
          totalNotAttending++;
          break;
        case "MAYBE":
          totalMaybe++;
          break;
      }

      // ONLY count meal preferences for guests who are attending (YES)
      // Don't count meal preferences for NO or MAYBE responses
      if (rsvp.attending === "YES") {
        if (rsvp.guests && rsvp.guests.length > 0) {
          for (const guest of rsvp.guests) {
            const preference = guest.mealPreference || "Not specified";
            mealPreferenceCounts.set(
              preference,
              (mealPreferenceCounts.get(preference) || 0) + 1,
            );

            if (guest.allergies) {
              dietaryRestrictions.add(guest.allergies);
            }
          }
        } else {
          // Legacy format
          const preference = rsvp.mealPreference || "Not specified";
          mealPreferenceCounts.set(
            preference,
            (mealPreferenceCounts.get(preference) || 0) + 1,
          );

          if (rsvp.allergies) {
            dietaryRestrictions.add(rsvp.allergies);
          }
        }
      }
    }

    const rsvpPercentage =
      totalInvited > 0 ? (totalRSVPed / totalInvited) * 100 : 0;

    const mealPreferences: MealPreferenceCount[] = Array.from(
      mealPreferenceCounts.entries(),
    )
      .map(([preference, count]) => ({ preference, count }))
      .sort((a, b) => b.count - a.count);

    const stats: AdminStats = {
      totalInvited,
      totalRSVPed,
      totalAttending,
      totalNotAttending,
      totalMaybe,
      rsvpPercentage: Math.round(rsvpPercentage * 100) / 100,
      mealPreferences,
      dietaryRestrictions: Array.from(dietaryRestrictions).sort(),
    };

    logger.info(
      `Wedding stats calculated: ${totalRSVPed}/${totalInvited} RSVPs (${rsvpPercentage.toFixed(
        1,
      )}%)`,
      "AdminService",
    );
    return stats;
  } catch (error) {
    logger.error("Failed to get wedding statistics", {
      service: "AdminService",
      error,
    });
    throw new Error("Failed to retrieve wedding statistics");
  }
}

/**
 * Get all users with RSVP data for admin management
 *
 * @returns {Promise<AdminUser[]>} Array of users with admin-specific data
 * @throws {Error} If database query fails
 */
export async function getAllUsersWithRSVPs(): Promise<AdminUser[]> {
  try {
    logger.info("Fetching all users with RSVPs for admin", {
      service: "AdminService",
    });

    const users = await (User.find as any)({ isInvited: true })
      .populate("rsvp")
      .sort({ hasRSVPed: -1, fullName: 1 });

    const adminUsers: AdminUser[] = users.map((user: any) => ({
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      isAdmin: user.isAdmin,
      hasRSVPed: user.hasRSVPed,
      isInvited: user.isInvited,
      qrToken: user.qrToken,
      qrAlias: user.qrAlias,
      qrAliasLocked: user.qrAliasLocked ?? false,
      rsvp: user.rsvp,
      createdAt: user.createdAt?.toISOString(),
      lastUpdated: user.updatedAt?.toISOString(),
      relationshipToBride: user.relationshipToBride,
      relationshipToGroom: user.relationshipToGroom,
      customWelcomeMessage: user.customWelcomeMessage,
      guestGroup: user.guestGroup,
      plusOneAllowed: user.plusOneAllowed,
      personalPhoto: user.personalPhoto,
      specialInstructions: user.specialInstructions,
      dietaryRestrictions: user.dietaryRestrictions,
      householdMembers: user.householdMembers,
      streetAddress: user.streetAddress,
      addressLine2: user.addressLine2,
      city: user.city,
      state: user.state,
      zipCode: user.zipCode,
      country: user.country,
    }));

    logger.info(
      `Retrieved ${adminUsers.length} users for admin interface`,
      "AdminService",
    );
    return adminUsers;
  } catch (error) {
    logger.error("Failed to get users with RSVPs", {
      service: "AdminService",
      error,
    });
    throw new Error("Failed to retrieve user data");
  }
}

/**
 * Export guest list as CSV format for external use
 *
 * @returns {Promise<string>} CSV formatted guest list
 * @throws {Error} If export fails
 */
export async function exportGuestListCSV(): Promise<string> {
  try {
    logger.info("Exporting guest list to CSV", { service: "AdminService" });

    const users = await getAllUsersWithRSVPs();

    const csvHeader = [
      "Full Name",
      "Email",
      "RSVP Status",
      "Attending",
      "Guest Count",
      "Meal Preferences",
      "Dietary Restrictions",
      "Additional Notes",
      "Street Address",
      "Address Line 2",
      "City",
      "State",
      "Zip Code",
      "Country",
      "QR Token",
      "Invited Date",
    ].join(",");

    const csvRows = users.map((user) => {
      const rsvp = user.rsvp;
      let mealPrefs = "Not specified";
      let dietaryRestrictions = "None";
      let guestCount = "0";

      if (rsvp) {
        guestCount = rsvp.guestCount?.toString() || "1";

        if (rsvp.guests && rsvp.guests.length > 0) {
          mealPrefs = rsvp.guests.map((g: any) => g.mealPreference).join("; ");
          dietaryRestrictions =
            rsvp.guests
              .filter((g: any) => g.allergies)
              .map((g: any) => g.allergies)
              .join("; ") || "None";
        } else {
          mealPrefs = rsvp.mealPreference || "Not specified";
          dietaryRestrictions = rsvp.allergies || "None";
        }
      }

      return [
        `"${user.fullName}"`,
        `"${user.email}"`,
        user.hasRSVPed ? "Submitted" : "Pending",
        rsvp?.attending || "No Response",
        guestCount,
        `"${mealPrefs}"`,
        `"${dietaryRestrictions}"`,
        `"${rsvp?.additionalNotes || ""}"`,
        `"${user.streetAddress || ""}"`,
        `"${user.addressLine2 || ""}"`,
        `"${user.city || ""}"`,
        `"${user.state || ""}"`,
        `"${user.zipCode || ""}"`,
        `"${user.country || ""}"`,
        user.qrToken,
        user.createdAt || "",
      ].join(",");
    });

    const csv = [csvHeader, ...csvRows].join("\n");

    logger.info(`Exported ${users.length} guests to CSV`, {
      service: "AdminService",
    });
    return csv;
  } catch (error) {
    logger.error("Failed to export guest list CSV", {
      service: "AdminService",
      error,
    });
    throw new Error("Failed to export guest list");
  }
}

/**
 * Update RSVP data for a specific user (admin only)
 *
 * @param {string} userId - User ID to update
 * @param {AdminRSVPUpdateInput} input - RSVP update data
 * @returns {Promise<RSVP>} Updated RSVP data
 * @throws {ValidationError} If user not found or invalid input
 */
export async function adminUpdateRSVP(
  userId: string,
  input: AdminRSVPUpdateInput,
): Promise<any> {
  try {
    logger.info(`Admin updating RSVP for user ${userId}`, {
      service: "AdminService",
    });

    const user = await (User.findById as any)(userId);
    if (!user) {
      throw new ValidationError("User not found");
    }

    let rsvp = await (RSVP.findOne as any)({ userId });

    if (!rsvp) {
      // Create new RSVP if none exists
      rsvp = new RSVP({
        userId,
        attending: input.attending || "MAYBE",
        guestCount: input.guestCount || 1,
        guests: input.guests || [],
        additionalNotes: input.additionalNotes || "",
      });
    } else {
      // Update existing RSVP
      if (input.attending !== undefined) rsvp.attending = input.attending;
      if (input.guestCount !== undefined) rsvp.guestCount = input.guestCount;
      if (input.guests !== undefined) rsvp.guests = input.guests;
      if (input.additionalNotes !== undefined)
        rsvp.additionalNotes = input.additionalNotes;
    }

    await rsvp.save();

    // Update user's hasRSVPed status
    user.hasRSVPed = true;
    user.rsvpId = rsvp._id;
    await user.save();

    logger.info(
      `Admin successfully updated RSVP for user ${userId}`,
      "AdminService",
    );
    return rsvp;
  } catch (error) {
    logger.error(`Failed to update RSVP for user ${userId}`, {
      service: "AdminService",
      error,
    });
    if (error instanceof ValidationError) throw error;
    throw new Error("Failed to update RSVP");
  }
}

/**
 * Update user details (admin only)
 *
 * @param {string} userId - User ID to update
 * @param {AdminUserUpdateInput} input - User update data
 * @returns {Promise<AdminUser>} Updated user data
 * @throws {ValidationError} If user not found or invalid input
 */
export async function adminUpdateUser(
  userId: string,
  input: AdminUserUpdateInput,
): Promise<AdminUser> {
  try {
    logger.info(`Admin updating user ${userId}`, { service: "AdminService" });

    const user = await User.findById(userId).populate("rsvp");
    if (!user) {
      throw new ValidationError("User not found");
    }

    if (input.fullName !== undefined) user.fullName = input.fullName;
    if (input.email !== undefined) user.email = input.email;
    if (input.isInvited !== undefined) user.isInvited = input.isInvited;

    // QR Alias lock enforcement (skip if same request is unlocking)
    const isUnlocking = input.qrAliasLocked === false;
    if (
      user.qrAliasLocked === true &&
      !isUnlocking &&
      input.qrAlias !== undefined &&
      input.qrAlias !== user.qrAlias
    ) {
      throw new ValidationError(
        "QR alias is locked and cannot be changed. Unlock it first via the admin panel.",
      );
    }

    // QR Alias validation and uniqueness check
    if (input.qrAlias !== undefined) {
      if (input.qrAlias === null || input.qrAlias === "") {
        // Clear the alias using Mongoose's set method for proper type handling
        user.set("qrAlias", undefined);
      } else {
        // Normalize the alias
        const normalizedAlias = input.qrAlias.toLowerCase().trim();

        // Validate format before database save for clear error messages
        const qrAliasRegex = /^[a-z0-9-]{3,50}$/;
        if (!qrAliasRegex.test(normalizedAlias)) {
          throw new ValidationError(
            "QR alias must contain only lowercase letters, numbers, and hyphens (3-50 characters)",
          );
        }

        // Check if alias is already in use by another user
        const existingAlias = await User.findOne({
          qrAlias: normalizedAlias,
          _id: { $ne: userId },
        });

        if (existingAlias) {
          throw new ValidationError(
            `QR alias "${normalizedAlias}" is already in use by another guest`,
          );
        }

        user.qrAlias = normalizedAlias;
      }
    }

    // QR Alias lock toggle (allow locking/unlocking independently of alias changes)
    if (input.qrAliasLocked !== undefined) {
      if (input.qrAliasLocked === true && !user.qrAlias && !input.qrAlias) {
        throw new ValidationError(
          "Cannot lock QR alias — no alias is currently set. Set an alias first.",
        );
      }
      user.qrAliasLocked = input.qrAliasLocked;
    }

    // Address fields
    if (input.streetAddress !== undefined)
      user.streetAddress = input.streetAddress;
    if (input.addressLine2 !== undefined)
      user.addressLine2 = input.addressLine2;
    if (input.city !== undefined) user.city = input.city;
    if (input.state !== undefined) user.state = input.state;
    if (input.zipCode !== undefined) user.zipCode = input.zipCode;
    if (input.country !== undefined) user.country = input.country;

    await user.save();

    const adminUser: AdminUser = {
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      isAdmin: user.isAdmin,
      hasRSVPed: user.hasRSVPed,
      isInvited: user.isInvited,
      qrToken: user.qrToken,
      qrAliasLocked: user.qrAliasLocked ?? false,
      rsvp: user.rsvp,
      createdAt: user.createdAt?.toISOString(),
      lastUpdated: user.updatedAt?.toISOString(),
      ...(user.streetAddress !== undefined && {
        streetAddress: user.streetAddress,
      }),
      ...(user.addressLine2 !== undefined && {
        addressLine2: user.addressLine2,
      }),
      ...(user.city !== undefined && { city: user.city }),
      ...(user.state !== undefined && { state: user.state }),
      ...(user.zipCode !== undefined && { zipCode: user.zipCode }),
      ...(user.country !== undefined && { country: user.country }),
    };

    logger.info(`Admin successfully updated user ${userId}`, {
      service: "AdminService",
    });
    return adminUser;
  } catch (error) {
    logger.error(`Failed to update user ${userId}`, {
      service: "AdminService",
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : error,
    });
    if (error instanceof ValidationError) throw error;
    throw new Error("Failed to update user");
  }
}

/**
 * Create a new user (admin only)
 *
 * @param {object} input - User creation data
 * @returns {Promise<AdminUser>} Created user data
 * @throws {ValidationError} If email already exists or invalid input
 */
export async function adminCreateUser(input: {
  fullName: string;
  email: string;
  isInvited: boolean;
  streetAddress?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}): Promise<AdminUser> {
  try {
    logger.info(`Admin creating new user: ${input.email}`, {
      service: "AdminService",
    });

    // Check if user with email already exists
    const existingUser = await (User.findOne as any)({ email: input.email });
    if (existingUser) {
      throw new ValidationError("A user with this email already exists");
    }

    // Generate unique QR token
    const qrToken =
      Math.random().toString(36).substring(2) +
      Math.random().toString(36).substring(2) +
      Date.now().toString(36);

    // Create new user
    const user = new User({
      fullName: input.fullName,
      email: input.email,
      isInvited: input.isInvited,
      isAdmin: false,
      hasRSVPed: false,
      qrToken,
      ...(input.streetAddress !== undefined && {
        streetAddress: input.streetAddress,
      }),
      ...(input.addressLine2 !== undefined && {
        addressLine2: input.addressLine2,
      }),
      ...(input.city !== undefined && { city: input.city }),
      ...(input.state !== undefined && { state: input.state }),
      ...(input.zipCode !== undefined && { zipCode: input.zipCode }),
      ...(input.country !== undefined && { country: input.country }),
    });

    await user.save();

    // Auto-generate QR code PNG file for the new user
    try {
      await generateQRCodeForUser(
        user._id.toString(),
        user.fullName,
        user.email,
        user.qrToken,
      );
      logger.info(`QR code auto-generated for new user ${user._id}`, {
        service: "AdminService",
      });
    } catch (qrError) {
      // Log error but don't fail the user creation
      logger.error(
        `Failed to generate QR code for new user ${user._id}: ${
          qrError instanceof Error ? qrError.message : "Unknown error"
        }`,
        { service: "AdminService" },
      );
    }

    const adminUser: AdminUser = {
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      isAdmin: user.isAdmin,
      hasRSVPed: user.hasRSVPed,
      isInvited: user.isInvited,
      qrToken: user.qrToken,
      rsvp: undefined,
      createdAt: user.createdAt?.toISOString(),
      lastUpdated: user.updatedAt?.toISOString(),
      ...(user.streetAddress !== undefined && {
        streetAddress: user.streetAddress,
      }),
      ...(user.addressLine2 !== undefined && {
        addressLine2: user.addressLine2,
      }),
      ...(user.city !== undefined && { city: user.city }),
      ...(user.state !== undefined && { state: user.state }),
      ...(user.zipCode !== undefined && { zipCode: user.zipCode }),
      ...(user.country !== undefined && { country: user.country }),
    };

    logger.info(`Admin successfully created user ${user._id}`, {
      service: "AdminService",
    });
    return adminUser;
  } catch (error: any) {
    logger.error("Failed to create user", { service: "AdminService", error });
    if (error instanceof ValidationError) throw error;
    // Handle Mongoose validation errors
    if (error.name === "ValidationError" && error.errors) {
      const firstError = Object.values(error.errors)[0] as any;
      throw new ValidationError(firstError.message);
    }
    throw new Error("Failed to create user");
  }
}

/**
 * Delete a user completely (admin only)
 *
 * @param {string} userId - User ID to delete
 * @returns {Promise<boolean>} Success status
 * @throws {ValidationError} If user not found or trying to delete admin
 */
export async function adminDeleteUser(userId: string): Promise<boolean> {
  try {
    logger.info(`Admin deleting user ${userId}`, { service: "AdminService" });

    const user = await (User.findById as any)(userId);
    if (!user) {
      throw new ValidationError("User not found");
    }

    // Prevent deletion of admin users
    if (user.isAdmin) {
      throw new ValidationError("Cannot delete admin users");
    }

    // Delete associated RSVP if exists
    await (RSVP.deleteOne as any)({ userId });

    // Delete user
    await (User.deleteOne as any)({ _id: userId });

    logger.info(`Admin successfully deleted user ${userId}`, {
      service: "AdminService",
    });
    return true;
  } catch (error) {
    logger.error(`Failed to delete user ${userId}`, {
      service: "AdminService",
      error,
    });
    if (error instanceof ValidationError) throw error;
    throw new Error("Failed to delete user");
  }
}

/**
 * Delete RSVP for a specific user (admin only)
 *
 * @param {string} userId - User ID to delete RSVP for
 * @returns {Promise<boolean>} Success status
 * @throws {ValidationError} If user not found
 */
export async function adminDeleteRSVP(userId: string): Promise<boolean> {
  try {
    logger.info(`Admin deleting RSVP for user ${userId}`, {
      service: "AdminService",
    });

    const user = await (User.findById as any)(userId);
    if (!user) {
      throw new ValidationError("User not found");
    }

    // Delete RSVP if exists
    await (RSVP.deleteOne as any)({ userId });

    // Update user status
    user.hasRSVPed = false;
    user.rsvpId = undefined;
    await user.save();

    logger.info(
      `Admin successfully deleted RSVP for user ${userId}`,
      "AdminService",
    );
    return true;
  } catch (error) {
    logger.error(`Failed to delete RSVP for user ${userId}`, {
      service: "AdminService",
      error,
    });
    if (error instanceof ValidationError) throw error;
    throw new Error("Failed to delete RSVP");
  }
}

/**
 * Bulk update user personalization from CSV import
 *
 * @param {Array} updates - Array of email and personalization pairs
 * @returns {Promise<Object>} Result with success/failed counts and errors
 */
export async function bulkUpdatePersonalization(
  updates: Array<{
    email: string;
    fullName?: string;
    personalization: {
      qrAlias?: string;
      relationshipToBride?: string;
      relationshipToGroom?: string;
      customWelcomeMessage?: string;
      guestGroup?: string;
      plusOneAllowed?: boolean;
      personalPhoto?: string;
      specialInstructions?: string;
      dietaryRestrictions?: string;
      streetAddress?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
  }>,
): Promise<{
  success: number;
  created: number;
  updated: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}> {
  const result = {
    success: 0,
    created: 0,
    updated: 0,
    failed: 0,
    errors: [] as Array<{ email: string; error: string }>,
  };

  logger.info(
    `Starting bulk personalization update for ${updates.length} users`,
    {
      service: "AdminService",
    },
  );

  for (const update of updates) {
    try {
      // Find user by email
      let user = await (User.findOne as any)({
        email: update.email.toLowerCase(),
      });

      // Build update object with only defined fields
      const updateFields: Record<string, any> = {};

      // QR Alias validation (if provided)
      if (update.personalization.qrAlias !== undefined) {
        // Enforce alias lock — skip alias change with warning instead of failing batch
        if (
          user?.qrAliasLocked === true &&
          update.personalization.qrAlias !== user.qrAlias
        ) {
          logger.warn(
            `Skipped alias change for ${update.email} — alias is locked`,
            { service: "AdminService" },
          );
          // Don't process the alias change, but continue with other fields
        } else if (
          update.personalization.qrAlias === null ||
          update.personalization.qrAlias === ""
        ) {
          updateFields.qrAlias = undefined;
        } else {
          const normalizedAlias = update.personalization.qrAlias
            .toLowerCase()
            .trim();

          // Check uniqueness (exclude current user if updating)
          const existingAlias = await User.findOne({
            qrAlias: normalizedAlias,
            ...(user ? { _id: { $ne: user._id } } : {}),
          });

          if (existingAlias) {
            throw new ValidationError(
              `QR alias "${normalizedAlias}" is already in use`,
            );
          }

          updateFields.qrAlias = normalizedAlias;
        }
      }

      if (update.personalization.relationshipToBride !== undefined) {
        updateFields.relationshipToBride =
          update.personalization.relationshipToBride;
      }
      if (update.personalization.relationshipToGroom !== undefined) {
        updateFields.relationshipToGroom =
          update.personalization.relationshipToGroom;
      }
      if (update.personalization.customWelcomeMessage !== undefined) {
        updateFields.customWelcomeMessage =
          update.personalization.customWelcomeMessage;
      }
      if (update.personalization.guestGroup !== undefined) {
        updateFields.guestGroup = update.personalization.guestGroup;
      }
      if (update.personalization.plusOneAllowed !== undefined) {
        updateFields.plusOneAllowed = update.personalization.plusOneAllowed;
      }
      if (update.personalization.personalPhoto !== undefined) {
        updateFields.personalPhoto = update.personalization.personalPhoto;
      }
      if (update.personalization.specialInstructions !== undefined) {
        updateFields.specialInstructions =
          update.personalization.specialInstructions;
      }
      if (update.personalization.dietaryRestrictions !== undefined) {
        updateFields.dietaryRestrictions =
          update.personalization.dietaryRestrictions;
      }
      // Address fields
      if (update.personalization.streetAddress !== undefined) {
        updateFields.streetAddress = update.personalization.streetAddress;
      }
      if (update.personalization.addressLine2 !== undefined) {
        updateFields.addressLine2 = update.personalization.addressLine2;
      }
      if (update.personalization.city !== undefined) {
        updateFields.city = update.personalization.city;
      }
      if (update.personalization.state !== undefined) {
        updateFields.state = update.personalization.state;
      }
      if (update.personalization.zipCode !== undefined) {
        updateFields.zipCode = update.personalization.zipCode;
      }
      if (update.personalization.country !== undefined) {
        updateFields.country = update.personalization.country;
      }

      if (!user) {
        // Create new user if fullName is provided
        if (!update.fullName) {
          result.failed++;
          result.errors.push({
            email: update.email,
            error: "User not found and cannot create without Name",
          });
          logger.error(`Cannot create user without fullName: ${update.email}`, {
            service: "AdminService",
          });
          continue;
        }

        // Generate cryptographically secure unique QR token with retry logic
        let qrToken: string;
        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts) {
          // Use crypto.randomBytes for secure token generation
          const randomBytes = require("crypto").randomBytes(16).toString("hex");
          const timestamp = Date.now().toString(36);
          qrToken = `${randomBytes}-${timestamp}`;

          // Check for uniqueness
          const existingUser = await (User.findOne as any)({
            qrToken: qrToken,
          });
          if (!existingUser) {
            break;
          }

          attempts++;
          logger.warn(
            `QR token collision detected, retrying (attempt ${attempts}/${maxAttempts})`,
            {
              service: "AdminService",
              email: update.email,
            },
          );
        }

        if (attempts >= maxAttempts) {
          result.failed++;
          result.errors.push({
            email: update.email,
            error: "Failed to generate unique QR token after multiple attempts",
          });
          logger.error(
            `Failed to generate unique QR token for ${update.email}`,
            {
              service: "AdminService",
            },
          );
          continue;
        }

        user = new User({
          fullName: update.fullName,
          email: update.email.toLowerCase(),
          isInvited: true,
          isAdmin: false,
          hasRSVPed: false,
          qrToken: qrToken!,
          ...updateFields,
        });

        await user.save();
        result.created++;

        logger.info(`Created new user via bulk upload: ${update.email}`, {
          service: "AdminService",
          qrToken: qrToken!,
        });
      } else {
        // Update existing user
        await (User.findByIdAndUpdate as any)(
          user._id,
          { $set: updateFields },
          { new: true, runValidators: true },
        );
        result.updated++;

        logger.debug(`Updated personalization for ${update.email}`, {
          service: "AdminService",
        });
      }

      result.success++;
    } catch (error: any) {
      result.failed++;
      result.errors.push({
        email: update.email,
        error: error.message || "Unknown error",
      });

      logger.error(`Failed to update personalization for ${update.email}`, {
        service: "AdminService",
        error: error.message,
      });
    }
  }

  logger.info(
    `Bulk personalization update complete: ${result.success} succeeded, ${result.failed} failed, ${result.created} created, ${result.updated} updated`,
    { service: "AdminService" },
  );

  return result;
}

/**
 * Regenerate QR codes for all users
 * ⚠️ CAUTION: In production, only use when FRONTEND_URL changes
 * This does NOT change QR tokens, only regenerates PNG files
 */
export async function adminRegenerateQRCodes(): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> {
  try {
    const isProduction =
      process.env.NODE_ENV === "production" ||
      process.env.MONGODB_URI?.includes("mongodb+srv");

    const environment = isProduction ? "PRODUCTION" : "DEVELOPMENT";
    const frontendUrl =
      process.env.CONFIG__FRONTEND_URL ||
      (isProduction
        ? "https://dj-forever2.onrender.com"
        : "http://localhost:3002");

    logger.warn(`🔄 Admin regenerating ALL QR codes in ${environment}`, {
      service: "AdminService",
      environment,
      frontendUrl,
      timestamp: new Date().toISOString(),
    });

    // Fetch all users with QR tokens
    const users = await (User.find as any)(
      {},
      "_id fullName email qrToken",
    ).lean();

    logger.info(`Found ${users.length} users for QR code regeneration`, {
      service: "AdminService",
    });

    // Generate QR codes
    const result = await generateQRCodesForUsers(users);

    logger.warn(
      `✅ QR code regeneration complete in ${environment}: ${result.success} success, ${result.failed} failed`,
      {
        service: "AdminService",
        environment,
        success: result.success,
        failed: result.failed,
      },
    );

    return result;
  } catch (error) {
    logger.error(
      `Failed to regenerate QR codes: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      { service: "AdminService" },
    );
    throw new ValidationError("Failed to regenerate QR codes");
  }
}
