/**
 * @fileoverview GraphQL TypeScript Interfaces for DJ Forever 2 Wedding Website
 * @module types/graphql
 * @version 1.0.0
 *
 * Centralized TypeScript interface definitions for GraphQL operations.
 * Provides type safety for resolvers, context, and client-server communication.
 * Implements comprehensive typing for QR-based authentication, multi-guest RSVP
 * management, and legacy compatibility patterns.
 *
 * Type Safety Features:
 * - Complete interface coverage for all GraphQL operations
 * - Strict typing for authentication and context
 * - Input validation through TypeScript interfaces
 * - Legacy format compatibility with modern structures
 *
 * GraphQL Integration:
 * - Context interfaces for request authentication
 * - Input interfaces for mutation arguments
 * - Payload interfaces for mutation responses
 * - Argument interfaces for resolver functions
 *
 * Authentication Types:
 * - GraphQLContext: Request context with user authentication
 * - AuthPayload: Authentication result with JWT and user data
 * - LoginArgs: QR token authentication arguments
 * - RegisterUserArgs: User registration input arguments
 *
 * RSVP Types:
 * - CreateRSVPInput: New RSVP creation with multi-guest support
 * - RSVPInput: RSVP updates with partial field support
 * - GuestInput: Individual guest data for multi-guest parties
 * - SubmitRSVPArgs: Legacy single-guest RSVP format
 *
 * Legacy Compatibility:
 * - All RSVP interfaces include legacy fields for backward compatibility
 * - Optional fields support gradual migration from old format
 * - Type unions accommodate both new and legacy data structures
 *
 * @example
 * // Context usage in resolvers:
 * // function resolver(_: unknown, args: CreateRSVPInput, context: GraphQLContext)
 *
 * @example
 * // Authentication payload typing:
 * // const result: AuthPayload = await loginWithQrToken(args);
 *
 * @dependencies
 * - ../models/User: User interface imports for type references
 * - GraphQL: Alignment with GraphQL schema definitions
 */

/**
 * GraphQL execution context interface defining request context and authentication state.
 * Passed to all GraphQL resolvers for user authentication and request handling.
 *
 * @interface GraphQLContext
 * @property {any} req - Express request object with headers and HTTP context
 * @property {import('../models/User.js').IUser | null} user - Authenticated user document or null
 */
export interface GraphQLContext {
  req: any; // Express.Request
  user: import("../models/User.js").IUser | null;
}

/**
 * Authentication payload interface returned by login and registration mutations.
 * Contains JWT token and complete user profile for frontend authentication state.
 *
 * @interface AuthPayload
 * @property {string} token - JWT token for subsequent authenticated requests
 * @property {import('../models/User.js').IUser} user - Complete user profile with invitation status
 */
export interface AuthPayload {
  token: string;
  user: import("../models/User.js").IUser;
}

/**
 * Guest input interface for individual party members in multi-guest RSVP format.
 * Used in CreateRSVPInput and RSVPInput for comprehensive guest management.
 *
 * @interface GuestInput
 * @property {string} fullName - Guest's full name (required for attending guests)
 * @property {string} mealPreference - Meal choice selection
 * @property {string} [allergies] - Optional dietary restrictions or allergies
 */
export interface GuestInput {
  fullName: string;
  mealPreference: string;
  allergies?: string;
}

/**
 * Create RSVP input interface for new RSVP creation with multi-guest support.
 * Combines modern multi-guest format with legacy single-guest compatibility.
 *
 * @interface CreateRSVPInput
 * @property {('YES'|'NO'|'MAYBE')} attending - Attendance status (required)
 * @property {number} [guestCount] - Total number of additional guests
 * @property {GuestInput[]} [guests] - Array of guest objects with individual preferences
 * @property {string} [additionalNotes] - Special requests or additional information
 * @property {string} [fullName] - Legacy field: Primary guest name (backward compatibility)
 * @property {string} [mealPreference] - Legacy field: Primary guest meal preference
 * @property {string} [allergies] - Legacy field: Primary guest dietary restrictions
 */
export interface CreateRSVPInput {
  attending: "YES" | "NO" | "MAYBE";
  guestCount?: number;
  guests?: GuestInput[];
  additionalNotes?: string;
  // Legacy fields for backward compatibility
  fullName?: string;
  mealPreference?: string;
  allergies?: string;
}

/**
 * RSVP update input interface for modifying existing RSVP records.
 * All fields are optional to support partial updates and flexible modification.
 *
 * @interface RSVPInput
 * @property {('YES'|'NO'|'MAYBE')} [attending] - Updated attendance status
 * @property {number} [guestCount] - Updated total guest count
 * @property {GuestInput[]} [guests] - Updated guest array with individual preferences
 * @property {string} [additionalNotes] - Updated special requests
 * @property {string} [fullName] - Legacy field: Updated primary guest name
 * @property {string} [mealPreference] - Legacy field: Updated meal preference
 * @property {string} [allergies] - Legacy field: Updated dietary restrictions
 */
export interface RSVPInput {
  attending?: "YES" | "NO" | "MAYBE";
  guestCount?: number;
  guests?: GuestInput[];
  additionalNotes?: string;
  // Legacy fields for backward compatibility
  fullName?: string;
  mealPreference?: string;
  allergies?: string;
}

/**
 * User registration arguments interface for registerUser mutation.
 * Used for optional user registration flow with QR token validation.
 *
 * @interface RegisterUserArgs
 * @property {string} fullName - Full name of the user
 * @property {string} email - Email address (unique, validated)
 * @property {string} qrToken - Unique QR token from wedding invitation
 */
export interface RegisterUserArgs {
  fullName: string;
  email: string;
  qrToken: string;
}

/**
 * Login arguments interface for loginWithQrToken mutation.
 * Primary authentication method using QR token from wedding invitations.
 *
 * @interface LoginArgs
 * @property {string} qrToken - Unique QR token from scanned wedding invitation
 */
export interface LoginArgs {
  qrToken: string;
}

/**
 * Legacy RSVP submission arguments for backward compatibility.
 * Used by submitRSVP mutation to support single-guest RSVP format.
 *
 * @interface SubmitRSVPArgs
 * @property {('YES'|'NO'|'MAYBE')} attending - Attendance status
 * @property {string} mealPreference - Meal choice selection
 * @property {string} [allergies] - Optional dietary restrictions
 * @property {string} [additionalNotes] - Optional special requests
 * @property {string} [fullName] - Optional guest name (legacy support)
 */
export interface SubmitRSVPArgs {
  attending: "YES" | "NO" | "MAYBE";
  mealPreference: string;
  allergies?: string;
  additionalNotes?: string;
  fullName?: string; // Include fullName for legacy support
}
