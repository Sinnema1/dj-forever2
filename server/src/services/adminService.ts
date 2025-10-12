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

import User from "../models/User.js";
import RSVP from "../models/RSVP.js";
import { ValidationError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

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
      "rsvp"
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
              (mealPreferenceCounts.get(preference) || 0) + 1
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
            (mealPreferenceCounts.get(preference) || 0) + 1
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
      mealPreferenceCounts.entries()
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
        1
      )}%)`,
      "AdminService"
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
      rsvp: user.rsvp,
      createdAt: user.createdAt?.toISOString(),
      lastUpdated: user.updatedAt?.toISOString(),
    }));

    logger.info(
      `Retrieved ${adminUsers.length} users for admin interface`,
      "AdminService"
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
  input: AdminRSVPUpdateInput
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
      "AdminService"
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
  input: AdminUserUpdateInput
): Promise<AdminUser> {
  try {
    logger.info(`Admin updating user ${userId}`, { service: "AdminService" });

    const user = await (User.findById as any)(userId).populate("rsvp");
    if (!user) {
      throw new ValidationError("User not found");
    }

    if (input.fullName !== undefined) user.fullName = input.fullName;
    if (input.email !== undefined) user.email = input.email;
    if (input.isInvited !== undefined) user.isInvited = input.isInvited;

    await user.save();

    const adminUser: AdminUser = {
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      isAdmin: user.isAdmin,
      hasRSVPed: user.hasRSVPed,
      isInvited: user.isInvited,
      qrToken: user.qrToken,
      rsvp: user.rsvp,
      createdAt: user.createdAt?.toISOString(),
      lastUpdated: user.updatedAt?.toISOString(),
    };

    logger.info(`Admin successfully updated user ${userId}`, {
      service: "AdminService",
    });
    return adminUser;
  } catch (error) {
    logger.error(`Failed to update user ${userId}`, {
      service: "AdminService",
      error,
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
    });

    await user.save();

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
    };

    logger.info(`Admin successfully created user ${user._id}`, {
      service: "AdminService",
    });
    return adminUser;
  } catch (error) {
    logger.error("Failed to create user", { service: "AdminService", error });
    if (error instanceof ValidationError) throw error;
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
      "AdminService"
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
