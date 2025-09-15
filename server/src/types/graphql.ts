/**
 * GraphQL Type Definitions
 * Centralized type definitions for better type safety and maintainability
 */

export interface GraphQLContext {
  req: any; // Express.Request
  user: import("../models/User.js").IUser | null;
}

export interface AuthPayload {
  token: string;
  user: import("../models/User.js").IUser;
}

export interface GuestInput {
  fullName: string;
  mealPreference: string;
  allergies?: string;
}

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

export interface RegisterUserArgs {
  fullName: string;
  email: string;
  qrToken: string;
}

export interface LoginArgs {
  qrToken: string;
}

export interface SubmitRSVPArgs {
  attending: "YES" | "NO" | "MAYBE";
  mealPreference: string;
  allergies?: string;
  additionalNotes?: string;
  fullName?: string; // Include fullName for legacy support
}
