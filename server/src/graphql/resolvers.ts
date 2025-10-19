/**
 * @fileoverview GraphQL Resolvers for DJ Forever 2 Wedding Website API
 * @module graphql/resolvers
 * @version 1.0.0
 *
 * Complete GraphQL resolver implementation handling all wedding website operations.
 * Provides type-safe resolvers for user authentication, RSVP management, and data queries.
 * Implements QR-based authentication system with JWT token validation and comprehensive
 * error handling for production deployment.
 *
 * Resolver Categories:
 * - Query resolvers: User profile and RSVP data retrieval
 * - Mutation resolvers: Authentication, RSVP creation/updates
 * - Authentication helpers: JWT validation and context management
 * - Error handling: Structured GraphQL errors with proper codes
 *
 * Authentication Flow:
 * 1. QR code scanned → qrToken extracted
 * 2. loginWithQrToken mutation → JWT token returned
 * 3. Subsequent requests include JWT in Authorization header
 * 4. Context populated with authenticated user for protected operations
 *
 * Legacy Compatibility:
 * - submitRSVP: Legacy single-guest RSVP format (backward compatibility)
 * - createRSVP: New multi-guest RSVP format with guest array support
 * - Both formats supported for seamless data migration
 *
 * @example
 * // Query Examples:
 * // query { me { fullName email hasRSVPed } }
 * // query { getRSVP { attending guestCount guests { fullName } } }
 *
 * @example
 * // Mutation Examples:
 * // mutation { loginWithQrToken(qrToken: "abc123") { token user { fullName } } }
 * // mutation { createRSVP(input: { attending: YES, guests: [...] }) { _id attending } }
 *
 * @dependencies
 * - graphql: GraphQL error handling and types
 * - ../services/authService: JWT authentication and QR token validation
 * - ../services/rsvpService: RSVP business logic and database operations
 * - ../utils/errors: Custom GraphQL error classes with proper codes
 * - ../types/graphql: TypeScript interfaces for type safety
 */

import { GraphQLError } from "graphql";
import { registerUser, loginWithQrToken } from "../services/authService.js";
import { getRSVP, createRSVP, updateRSVP } from "../services/rsvpService.js";
import {
  getWeddingStats,
  getAllUsersWithRSVPs,
  exportGuestListCSV,
  adminUpdateRSVP,
  adminUpdateUser,
  adminDeleteRSVP,
  adminCreateUser,
  adminDeleteUser,
} from "../services/adminService.js";
import {
  sendRSVPReminder,
  sendBulkRSVPReminders,
  getPendingRSVPRecipients,
} from "../services/emailService.js";
import User from "../models/User.js";
import { AuthenticationError, ValidationError } from "../utils/errors.js";
import type {
  GraphQLContext,
  RegisterUserArgs,
  LoginArgs,
  CreateRSVPInput,
  RSVPInput,
  SubmitRSVPArgs,
  AdminRSVPUpdateInput,
  AdminUserUpdateInput,
} from "../types/graphql.js";

/**
 * Authentication helper function to ensure user is authenticated before accessing protected resolvers.
 * Validates GraphQL context contains authenticated user and throws proper GraphQL error if not.
 *
 * Used by all protected mutations and queries to enforce authentication requirements.
 * Returns typed user object for subsequent business logic operations.
 *
 * @function requireAuth
 * @param {GraphQLContext} context - GraphQL execution context with user and request data
 * @returns {import('../models/User.js').IUser} Authenticated user object with _id and profile data
 * @throws {AuthenticationError} When context.user is null/undefined (user not authenticated)
 *
 * @example
 * // Usage in protected resolver:
 * // const user = requireAuth(context);
 * // const rsvp = await getRSVP(user._id.toString());
 */
function requireAuth(context: GraphQLContext) {
  if (!context.user) {
    throw new AuthenticationError("Authentication required");
  }
  return context.user;
}

function requireAdmin(context: GraphQLContext) {
  const user = requireAuth(context);
  if (!user.isAdmin) {
    throw new GraphQLError("Admin access required", {
      extensions: { code: "FORBIDDEN" },
    });
  }
  return user;
}

/**
 * Main GraphQL resolvers object containing all query and mutation resolvers for the wedding website API.
 * Implements complete wedding website functionality with proper authentication, error handling,
 * and business logic integration.
 *
 * @const {Object} resolvers - GraphQL resolver map
 * @property {Object} Query - Read-only operations for data retrieval
 * @property {Object} Mutation - Write operations for data modification
 */
export const resolvers = {
  /**
   * GraphQL Query resolvers for read-only operations.
   * All queries require authentication except where explicitly noted.
   */
  Query: {
    /**
     * Retrieves the current authenticated user's profile information.
     * Returns user data from GraphQL context (populated by JWT middleware).
     *
     * @async
     * @function me
     * @param {unknown} _ - Unused parent parameter
     * @param {unknown} __ - Unused args parameter (no arguments required)
     * @param {GraphQLContext} context - GraphQL execution context with authenticated user
     * @returns {Promise<import('../models/User.js').IUser | null>} User profile or null if not authenticated
     *
     * @example
     * // GraphQL Query:
     * // query { me { _id fullName email hasRSVPed isInvited } }
     */
    me: async (_: unknown, __: unknown, context: GraphQLContext) => {
      // Return the authenticated user from context
      return context.user || null;
    },
    /**
     * Retrieves the current authenticated user's RSVP information.
     * Returns complete RSVP details including attendance status, guest information, and preferences.
     *
     * @async
     * @function getRSVP
     * @param {unknown} _ - Unused parent parameter
     * @param {unknown} __ - Unused args parameter (no arguments required)
     * @param {GraphQLContext} context - GraphQL execution context with authenticated user
     * @returns {Promise<import('../models/RSVP.js').IRSVP>} RSVP data with attendance and guest details
     * @throws {AuthenticationError} When user is not authenticated
     * @throws {GraphQLError} When RSVP retrieval fails or RSVP not found
     *
     * @example
     * // GraphQL Query:
     * // query { getRSVP { _id attending guestCount guests { fullName mealPreference } } }
     */
    getRSVP: async (_: unknown, __: unknown, context: GraphQLContext) => {
      // Get RSVP for the authenticated user
      const user = requireAuth(context);

      try {
        return await getRSVP(user._id?.toString() || user.id?.toString());
      } catch (error: any) {
        console.error("Error in getRSVP resolver:", error);
        throw new GraphQLError(error?.message || "Failed to fetch RSVP");
      }
    },
    // Admin queries
    adminGetAllRSVPs: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext
    ) => {
      requireAdmin(context);
      try {
        return await getAllUsersWithRSVPs();
      } catch (error: any) {
        console.error("Error in adminGetAllRSVPs resolver:", error);
        throw new GraphQLError(error?.message || "Failed to fetch RSVP data");
      }
    },
    adminGetUserStats: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext
    ) => {
      requireAdmin(context);
      try {
        return await getWeddingStats();
      } catch (error: any) {
        console.error("Error in adminGetUserStats resolver:", error);
        throw new GraphQLError(
          error?.message || "Failed to fetch wedding statistics"
        );
      }
    },
    adminExportGuestList: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext
    ) => {
      requireAdmin(context);
      try {
        return await exportGuestListCSV();
      } catch (error: any) {
        console.error("Error in adminExportGuestList resolver:", error);
        throw new GraphQLError(error?.message || "Failed to export guest list");
      }
    },

    /**
     * Generate email preview without sending
     * Admin-only query for testing email templates
     *
     * @param {string} userId - User ID to generate preview for
     * @param {string} template - Template identifier (e.g., 'rsvp_reminder')
     * @returns {Promise<object>} Email preview with subject and HTML content
     */
    emailPreview: async (
      _: unknown,
      args: { userId: string; template: string },
      context: GraphQLContext
    ) => {
      requireAdmin(context);
      try {
        const { generateEmailPreview } = await import(
          "../services/emailService.js"
        );
        return await generateEmailPreview(args.userId, args.template);
      } catch (error: any) {
        console.error("Error in emailPreview resolver:", error);
        throw new GraphQLError(
          error?.message || "Failed to generate email preview"
        );
      }
    },

    /**
     * Get email send history for admin visibility
     * Shows recent email jobs with status and error details
     *
     * @param {number} limit - Maximum number of records to return (default: 50)
     * @param {string} status - Optional status filter (pending, retrying, sent, failed)
     * @returns {Promise<any[]>} Array of email job history records
     */
    emailSendHistory: async (
      _: unknown,
      args: { limit?: number; status?: string },
      context: GraphQLContext
    ) => {
      requireAdmin(context);
      try {
        const { getEmailHistory } = await import("../services/emailService.js");
        return await getEmailHistory(args.limit || 50, args.status);
      } catch (error: any) {
        console.error("Error in emailSendHistory resolver:", error);
        throw new GraphQLError(
          error?.message || "Failed to fetch email history"
        );
      }
    },
  },
  Mutation: {
    registerUser: async (_: unknown, args: RegisterUserArgs) => {
      try {
        return await registerUser(args);
      } catch (error: any) {
        console.error("Error in registerUser resolver:", error);
        throw new ValidationError(error?.message || "Registration failed");
      }
    },
    loginWithQrToken: async (_: unknown, args: LoginArgs) => {
      const { qrToken } = args;
      try {
        return await loginWithQrToken({ qrToken });
      } catch (error: any) {
        console.error("Error in loginWithQrToken resolver:", error);
        throw new AuthenticationError(error?.message || "Login failed");
      }
    },
    submitRSVP: async (
      _: unknown,
      args: SubmitRSVPArgs,
      context: GraphQLContext
    ) => {
      // Legacy mutation - create new RSVP
      const user = requireAuth(context);

      try {
        return await createRSVP({
          ...args,
          userId: user._id?.toString() || user.id?.toString(),
          fullName: args.fullName || user.fullName,
        });
      } catch (error: any) {
        console.error("Error in submitRSVP resolver:", error);
        throw new GraphQLError(error?.message || "Failed to submit RSVP");
      }
    },
    createRSVP: async (
      _: unknown,
      { input }: { input: CreateRSVPInput },
      context: GraphQLContext
    ) => {
      // New mutation for creating RSVP
      const user = requireAuth(context);

      try {
        return await createRSVP({
          ...input,
          userId: user._id?.toString() || user.id?.toString(),
          fullName: input.fullName || user.fullName,
        });
      } catch (error: any) {
        console.error("Error in createRSVP resolver:", error);
        throw new GraphQLError(error?.message || "Failed to create RSVP");
      }
    },
    editRSVP: async (
      _: unknown,
      { updates }: { updates: RSVPInput },
      context: GraphQLContext
    ) => {
      // Update existing RSVP
      const user = requireAuth(context);

      try {
        return await updateRSVP(
          user._id?.toString() || user.id?.toString(),
          updates
        );
      } catch (error: any) {
        console.error("Error in editRSVP resolver:", error);
        throw new GraphQLError(error?.message || "Failed to update RSVP");
      }
    },
    // Admin mutations
    adminUpdateRSVP: async (
      _: unknown,
      args: { rsvpId: string; updates: AdminRSVPUpdateInput },
      context: GraphQLContext
    ) => {
      requireAdmin(context);
      try {
        return await adminUpdateRSVP(args.rsvpId, args.updates);
      } catch (error: any) {
        console.error("Error in adminUpdateRSVP resolver:", error);
        throw new GraphQLError(error?.message || "Failed to update RSVP");
      }
    },
    adminUpdateUser: async (
      _: unknown,
      args: { userId: string; updates: AdminUserUpdateInput },
      context: GraphQLContext
    ) => {
      requireAdmin(context);
      try {
        return await adminUpdateUser(args.userId, args.updates);
      } catch (error: any) {
        console.error("Error in adminUpdateUser resolver:", error);
        throw new GraphQLError(error?.message || "Failed to update user");
      }
    },
    adminDeleteRSVP: async (
      _: unknown,
      args: { rsvpId: string },
      context: GraphQLContext
    ) => {
      requireAdmin(context);
      try {
        await adminDeleteRSVP(args.rsvpId);
        return true;
      } catch (error: any) {
        console.error("Error in adminDeleteRSVP resolver:", error);
        throw new GraphQLError(error?.message || "Failed to delete RSVP");
      }
    },
    adminCreateUser: async (
      _: unknown,
      args: { input: { fullName: string; email: string; isInvited: boolean } },
      context: GraphQLContext
    ) => {
      requireAdmin(context);
      try {
        return await adminCreateUser(args.input);
      } catch (error: any) {
        console.error("Error in adminCreateUser resolver:", error);
        throw new GraphQLError(error?.message || "Failed to create user");
      }
    },
    adminDeleteUser: async (
      _: unknown,
      args: { userId: string },
      context: GraphQLContext
    ) => {
      requireAdmin(context);
      try {
        return await adminDeleteUser(args.userId);
      } catch (error: any) {
        console.error("Error in adminDeleteUser resolver:", error);
        throw new GraphQLError(error?.message || "Failed to delete user");
      }
    },
    adminSendReminderEmail: async (
      _: unknown,
      args: { userId: string },
      context: GraphQLContext
    ) => {
      requireAdmin(context);
      try {
        const user = await (User.findById as any)(args.userId);
        if (!user) {
          throw new GraphQLError("User not found");
        }

        if (!user.isInvited || user.hasRSVPed) {
          throw new GraphQLError("User is not eligible for reminder email");
        }

        const success = await sendRSVPReminder({
          _id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          qrToken: user.qrToken,
        });

        return {
          success,
          email: user.email,
          error: success ? null : "Failed to send email",
        };
      } catch (error: any) {
        console.error("Error in adminSendReminderEmail resolver:", error);
        return {
          success: false,
          email: "",
          error: error?.message || "Failed to send reminder email",
        };
      }
    },
    adminSendBulkReminderEmails: async (
      _: unknown,
      args: { userIds: string[] },
      context: GraphQLContext
    ) => {
      requireAdmin(context);
      try {
        const users = await (User.find as any)({
          _id: { $in: args.userIds },
          isInvited: true,
          hasRSVPed: false,
        });

        const recipients = users.map((user: any) => ({
          _id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          qrToken: user.qrToken,
        }));

        const results = await sendBulkRSVPReminders(recipients);

        return {
          totalSent: results.length,
          successCount: results.filter((r) => r.success).length,
          failureCount: results.filter((r) => !r.success).length,
          results,
        };
      } catch (error: any) {
        console.error("Error in adminSendBulkReminderEmails resolver:", error);
        throw new GraphQLError(
          error?.message || "Failed to send bulk reminder emails"
        );
      }
    },
    adminSendReminderToAllPending: async (
      _: unknown,
      _args: Record<string, never>,
      context: GraphQLContext
    ) => {
      requireAdmin(context);
      try {
        const allUsers = await (User.find as any)({});
        const recipients = getPendingRSVPRecipients(allUsers);

        if (recipients.length === 0) {
          return {
            totalSent: 0,
            successCount: 0,
            failureCount: 0,
            results: [],
          };
        }

        const results = await sendBulkRSVPReminders(recipients);

        return {
          totalSent: results.length,
          successCount: results.filter((r) => r.success).length,
          failureCount: results.filter((r) => !r.success).length,
          results,
        };
      } catch (error: any) {
        console.error(
          "Error in adminSendReminderToAllPending resolver:",
          error
        );
        throw new GraphQLError(
          error?.message || "Failed to send reminders to all pending guests"
        );
      }
    },
  },
};
