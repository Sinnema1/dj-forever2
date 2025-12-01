/**
 * @fileoverview User Service for DJ Forever 2 Wedding Website
 * @module services/userService
 * @version 2.0.0
 *
 * Comprehensive user management service providing CRUD operations,
 * search, filtering, and statistics for wedding guest management.
 * Complements adminService with reusable user operations.
 *
 * Features:
 * - User profile CRUD operations with validation
 * - Advanced user search and filtering (email, name, RSVP status)
 * - User statistics and reporting for analytics
 * - Bulk user operations for efficient management
 * - QR token regeneration and management
 * - User invitation status tracking
 *
 * Security:
 * - Input validation and sanitization
 * - Proper error handling with custom error classes
 * - Logging for all operations
 * - Admin-only operations clearly marked
 *
 * Integration Points:
 * - Used by adminService for user management operations
 * - GraphQL resolvers for user queries and mutations
 * - Authentication service for user verification
 * - RSVP service for invitation status updates
 *
 * @example
 * ```typescript
 * // Get user by ID
 * const user = await getUserById('user123');
 *
 * // Search users
 * const results = await searchUsers({ query: 'john', rsvpStatus: 'YES' });
 *
 * // Update user profile
 * await updateUser('user123', { fullName: 'John Smith' });
 * ```
 *
 * @dependencies
 * - ../models/User: User model for database operations
 * - ../models/RSVP: RSVP model for user relationships
 * - ../utils/validation: Input validation utilities
 * - ../utils/errors: Custom error classes
 * - ../utils/logger: Logging service
 */

import User from "../models/User.js";
import RSVP from "../models/RSVP.js";
import { ValidationError } from "../utils/errors.js";
import { sanitizeText, validateEmail } from "../utils/validation.js";
import { logger } from "../utils/logger.js";
import type { IUser } from "../models/User.js";

/**
 * Custom NotFoundError for user service
 */
class NotFoundError extends ValidationError {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

/**
 * User search and filter options
 */
export interface UserSearchOptions {
  query?: string; // Search in name or email
  rsvpStatus?: "YES" | "NO" | "MAYBE" | "NONE"; // RSVP attendance status
  hasRSVPed?: boolean; // Whether user has submitted RSVP
  isInvited?: boolean; // Whether user is invited
  isAdmin?: boolean; // Whether user is admin
  guestGroup?: string; // Guest group filter
  limit?: number; // Maximum results to return
  skip?: number; // Number of results to skip (pagination)
  sortBy?: "fullName" | "email" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

/**
 * User update input
 */
export interface UserUpdateInput {
  fullName?: string;
  email?: string;
  isInvited?: boolean;
  relationshipToBride?: string;
  relationshipToGroom?: string;
  customWelcomeMessage?: string;
  guestGroup?: string;
  plusOneAllowed?: boolean;
  personalPhoto?: string;
  specialInstructions?: string;
  dietaryRestrictions?: string;
}

/**
 * User statistics
 */
export interface UserStats {
  totalUsers: number;
  totalInvited: number;
  totalRSVPed: number;
  totalAttending: number;
  totalNotAttending: number;
  totalMaybe: number;
  rsvpPercentage: number;
  attendancePercentage: number;
  byGuestGroup: Record<string, number>;
  byRelationship: {
    bride: number;
    groom: number;
    both: number;
  };
}

/**
 * Get user by ID
 *
 * @param userId - User ID to fetch
 * @param includeRSVP - Whether to populate RSVP data
 * @returns User document
 * @throws NotFoundError if user doesn't exist
 */
export async function getUserById(
  userId: string,
  includeRSVP = false
): Promise<IUser> {
  try {
    logger.debug(`Fetching user ${userId}`, { service: "UserService" });

    const query = (User.findById as any)(userId);
    const user = includeRSVP ? await query.populate("rsvp") : await query;

    if (!user) {
      throw new NotFoundError(`User not found with ID: ${userId}`);
    }

    return user;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error(`Failed to fetch user ${userId}`, {
      service: "UserService",
      error,
    });
    throw new Error("Failed to fetch user");
  }
}

/**
 * Get user by email
 *
 * @param email - User email address
 * @param includeRSVP - Whether to populate RSVP data
 * @returns User document or null
 */
export async function getUserByEmail(
  email: string,
  includeRSVP = false
): Promise<IUser | null> {
  try {
    logger.debug(`Fetching user by email: ${email}`, {
      service: "UserService",
    });

    const query = (User.findOne as any)({ email: email.toLowerCase() });
    const user = includeRSVP ? await query.populate("rsvp") : await query;

    return user;
  } catch (error) {
    logger.error(`Failed to fetch user by email ${email}`, {
      service: "UserService",
      error,
    });
    throw new Error("Failed to fetch user by email");
  }
}

/**
 * Get user by QR token
 *
 * @param qrToken - User's unique QR token
 * @returns User document or null
 */
export async function getUserByQRToken(qrToken: string): Promise<IUser | null> {
  try {
    logger.debug("Fetching user by QR token", { service: "UserService" });

    const user = await (User.findOne as any)({ qrToken });
    return user;
  } catch (error) {
    logger.error("Failed to fetch user by QR token", {
      service: "UserService",
      error,
    });
    throw new Error("Failed to fetch user by QR token");
  }
}

/**
 * Search and filter users
 *
 * @param options - Search and filter criteria
 * @returns Array of matching users
 */
export async function searchUsers(
  options: UserSearchOptions = {}
): Promise<IUser[]> {
  try {
    logger.info("Searching users", { service: "UserService", options });

    const {
      query,
      rsvpStatus,
      hasRSVPed,
      isInvited,
      isAdmin,
      guestGroup,
      limit = 100,
      skip = 0,
      sortBy = "fullName",
      sortOrder = "asc",
    } = options;

    // Build filter query
    const filter: any = {};

    // Text search in name or email
    if (query) {
      filter.$or = [
        { fullName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ];
    }

    // Filter by RSVP status
    if (hasRSVPed !== undefined) {
      filter.hasRSVPed = hasRSVPed;
    }

    // Filter by invitation status
    if (isInvited !== undefined) {
      filter.isInvited = isInvited;
    }

    // Filter by admin status
    if (isAdmin !== undefined) {
      filter.isAdmin = isAdmin;
    }

    // Filter by guest group
    if (guestGroup) {
      filter.guestGroup = guestGroup;
    }

    // Build sort options
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query
    let users = await (User.find as any)(filter)
      .sort(sortOptions)
      .limit(limit)
      .skip(skip)
      .populate("rsvp");

    // Filter by RSVP attendance status if specified
    if (rsvpStatus) {
      if (rsvpStatus === "NONE") {
        users = users.filter((user: any) => !user.hasRSVPed);
      } else {
        users = users.filter((user: any) => {
          return user.rsvp && user.rsvp.attending === rsvpStatus;
        });
      }
    }

    logger.info(`Found ${users.length} users matching search criteria`, {
      service: "UserService",
    });

    return users;
  } catch (error) {
    logger.error("Failed to search users", { service: "UserService", error });
    throw new Error("Failed to search users");
  }
}

/**
 * Get all users with optional filtering
 *
 * @param filter - MongoDB filter object
 * @param includeRSVP - Whether to populate RSVP data
 * @returns Array of users
 */
export async function getAllUsers(
  filter: any = {},
  includeRSVP = false
): Promise<IUser[]> {
  try {
    logger.debug("Fetching all users", {
      service: "UserService",
      filter,
    });

    const query = (User.find as any)(filter);
    const users = includeRSVP ? await query.populate("rsvp") : await query;

    return users;
  } catch (error) {
    logger.error("Failed to fetch all users", {
      service: "UserService",
      error,
    });
    throw new Error("Failed to fetch users");
  }
}

/**
 * Update user information
 *
 * @param userId - User ID to update
 * @param updates - Fields to update
 * @returns Updated user document
 * @throws ValidationError for invalid input
 * @throws NotFoundError if user doesn't exist
 */
export async function updateUser(
  userId: string,
  updates: UserUpdateInput
): Promise<IUser> {
  try {
    logger.info(`Updating user ${userId}`, { service: "UserService" });

    // Validate inputs
    if (updates.fullName) {
      updates.fullName = sanitizeText(updates.fullName, 100);
    }

    if (updates.email) {
      // Validate email format (throws ValidationError if invalid)
      const validatedEmail = validateEmail(updates.email);

      // Check email uniqueness
      const existingUser = await (User.findOne as any)({
        email: validatedEmail,
        _id: { $ne: userId },
      });

      if (existingUser) {
        throw new ValidationError("Email already in use");
      }

      updates.email = validatedEmail;
    }

    // Sanitize text fields
    if (updates.customWelcomeMessage) {
      updates.customWelcomeMessage = sanitizeText(
        updates.customWelcomeMessage,
        500
      );
    }

    if (updates.specialInstructions) {
      updates.specialInstructions = sanitizeText(
        updates.specialInstructions,
        500
      );
    }

    // Update user
    const user = await (User.findByIdAndUpdate as any)(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new NotFoundError(`User not found with ID: ${userId}`);
    }

    logger.info(`Successfully updated user ${userId}`, {
      service: "UserService",
    });

    return user;
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      throw error;
    }
    logger.error(`Failed to update user ${userId}`, {
      service: "UserService",
      error,
    });
    throw new Error("Failed to update user");
  }
}

/**
 * Delete user (admin only - removes user and associated RSVP)
 *
 * @param userId - User ID to delete
 * @returns Success status
 * @throws NotFoundError if user doesn't exist
 * @throws ValidationError if trying to delete admin user
 */
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    logger.info(`Deleting user ${userId}`, { service: "UserService" });

    const user = await (User.findById as any)(userId);
    if (!user) {
      throw new NotFoundError(`User not found with ID: ${userId}`);
    }

    // Prevent deletion of admin users
    if (user.isAdmin) {
      throw new ValidationError("Cannot delete admin users");
    }

    // Delete associated RSVP
    await (RSVP.deleteOne as any)({ userId });

    // Delete user
    await (User.deleteOne as any)({ _id: userId });

    logger.info(`Successfully deleted user ${userId}`, {
      service: "UserService",
    });

    return true;
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    logger.error(`Failed to delete user ${userId}`, {
      service: "UserService",
      error,
    });
    throw new Error("Failed to delete user");
  }
}

/**
 * Regenerate QR token for user
 *
 * @param userId - User ID
 * @returns Updated user with new QR token
 * @throws NotFoundError if user doesn't exist
 */
export async function regenerateQRToken(userId: string): Promise<IUser> {
  try {
    logger.info(`Regenerating QR token for user ${userId}`, {
      service: "UserService",
    });

    // Generate new unique QR token
    const qrToken =
      Math.random().toString(36).substring(2) +
      Math.random().toString(36).substring(2) +
      Date.now().toString(36);

    const user = await (User.findByIdAndUpdate as any)(
      userId,
      { $set: { qrToken } },
      { new: true }
    );

    if (!user) {
      throw new NotFoundError(`User not found with ID: ${userId}`);
    }

    logger.info(`Successfully regenerated QR token for user ${userId}`, {
      service: "UserService",
    });

    return user;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error(`Failed to regenerate QR token for user ${userId}`, {
      service: "UserService",
      error,
    });
    throw new Error("Failed to regenerate QR token");
  }
}

/**
 * Get comprehensive user statistics
 *
 * @returns User and RSVP statistics
 */
export async function getUserStats(): Promise<UserStats> {
  try {
    logger.info("Calculating user statistics", { service: "UserService" });

    const users = await (User.find as any)({ isInvited: true }).populate(
      "rsvp"
    );

    const stats: UserStats = {
      totalUsers: users.length,
      totalInvited: users.length,
      totalRSVPed: 0,
      totalAttending: 0,
      totalNotAttending: 0,
      totalMaybe: 0,
      rsvpPercentage: 0,
      attendancePercentage: 0,
      byGuestGroup: {},
      byRelationship: {
        bride: 0,
        groom: 0,
        both: 0,
      },
    };

    for (const user of users) {
      // Count RSVPs
      if (user.hasRSVPed) {
        stats.totalRSVPed++;

        if (user.rsvp) {
          switch (user.rsvp.attending) {
            case "YES":
              stats.totalAttending++;
              break;
            case "NO":
              stats.totalNotAttending++;
              break;
            case "MAYBE":
              stats.totalMaybe++;
              break;
          }
        }
      }

      // Count by guest group
      if (user.guestGroup) {
        stats.byGuestGroup[user.guestGroup] =
          (stats.byGuestGroup[user.guestGroup] || 0) + 1;
      }

      // Count by relationship
      if (user.relationshipToBride && user.relationshipToGroom) {
        stats.byRelationship.both++;
      } else if (user.relationshipToBride) {
        stats.byRelationship.bride++;
      } else if (user.relationshipToGroom) {
        stats.byRelationship.groom++;
      }
    }

    // Calculate percentages
    stats.rsvpPercentage =
      stats.totalInvited > 0
        ? Math.round((stats.totalRSVPed / stats.totalInvited) * 100)
        : 0;

    stats.attendancePercentage =
      stats.totalRSVPed > 0
        ? Math.round((stats.totalAttending / stats.totalRSVPed) * 100)
        : 0;

    logger.info("Successfully calculated user statistics", {
      service: "UserService",
      stats,
    });

    return stats;
  } catch (error) {
    logger.error("Failed to calculate user statistics", {
      service: "UserService",
      error,
    });
    throw new Error("Failed to calculate user statistics");
  }
}

/**
 * Bulk update users
 *
 * @param updates - Array of user ID and update pairs
 * @returns Result with success/failed counts
 */
export async function bulkUpdateUsers(
  updates: Array<{ userId: string; updates: UserUpdateInput }>
): Promise<{
  success: number;
  failed: number;
  errors: Array<{ userId: string; error: string }>;
}> {
  const result = {
    success: 0,
    failed: 0,
    errors: [] as Array<{ userId: string; error: string }>,
  };

  logger.info(`Starting bulk update for ${updates.length} users`, {
    service: "UserService",
  });

  for (const { userId, updates: userUpdates } of updates) {
    try {
      await updateUser(userId, userUpdates);
      result.success++;
    } catch (error: any) {
      result.failed++;
      result.errors.push({
        userId,
        error: error.message || "Unknown error during update",
      });
      logger.error(`Failed to update user ${userId} in bulk operation`, {
        service: "UserService",
        error,
      });
    }
  }

  logger.info(
    `Bulk update complete: ${result.success} succeeded, ${result.failed} failed`,
    { service: "UserService" }
  );

  return result;
}

/**
 * Get users by guest group
 *
 * @param guestGroup - Guest group name
 * @param includeRSVP - Whether to populate RSVP data
 * @returns Array of users in group
 */
export async function getUsersByGuestGroup(
  guestGroup: string,
  includeRSVP = false
): Promise<IUser[]> {
  try {
    logger.debug(`Fetching users in guest group: ${guestGroup}`, {
      service: "UserService",
    });

    const query = (User.find as any)({ guestGroup });
    const users = includeRSVP ? await query.populate("rsvp") : await query;

    return users;
  } catch (error) {
    logger.error(`Failed to fetch users in group ${guestGroup}`, {
      service: "UserService",
      error,
    });
    throw new Error("Failed to fetch users by group");
  }
}

/**
 * Count users matching filter
 *
 * @param filter - MongoDB filter object
 * @returns Number of matching users
 */
export async function countUsers(filter: any = {}): Promise<number> {
  try {
    const count = await (User.countDocuments as any)(filter);
    return count;
  } catch (error) {
    logger.error("Failed to count users", { service: "UserService", error });
    throw new Error("Failed to count users");
  }
}
