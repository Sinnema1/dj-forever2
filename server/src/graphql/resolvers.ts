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
import { AuthenticationError, ValidationError } from "../utils/errors.js";
import type {
  GraphQLContext,
  RegisterUserArgs,
  LoginArgs,
  CreateRSVPInput,
  RSVPInput,
  SubmitRSVPArgs,
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
  },
};
