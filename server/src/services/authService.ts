/**
 * @fileoverview Authentication Service for DJ Forever 2 Wedding Website
 * @module services/authService
 * @version 1.0.0
 *
 * Comprehensive authentication service implementing QR-code-only authentication system.
 * Handles user registration, QR token validation, JWT token generation, and request
 * authentication for the wedding website. Designed for secure, passwordless authentication
 * where guests authenticate using unique QR codes embedded in wedding invitations.
 *
 * Authentication Flow:
 * 1. QR codes generated during wedding invitation seeding process
 * 2. Guests scan QR code → qrToken extracted from URL
 * 3. Frontend calls loginWithQrToken mutation with qrToken
 * 4. Service validates token, generates JWT, returns AuthResult
 * 5. Subsequent requests include JWT in Authorization header
 * 6. getUserFromRequest extracts and validates JWT for protected operations
 *
 * Security Features:
 * - QR tokens are unique, non-guessable identifiers
 * - JWT tokens have configurable expiration (default: 7 days)
 * - Database validation ensures user existence and invitation status
 * - Input validation prevents injection attacks
 * - Graceful error handling with proper error types
 *
 * Integration:
 * - Used by GraphQL resolvers for authentication mutations
 * - Integrated with GraphQL context creation for request authentication
 * - Supports both registration (optional) and login flows
 * - Compatible with existing user management and RSVP systems
 *
 * @example
 * // QR Token Login:
 * // const result = await loginWithQrToken({ qrToken: 'abc123def456' });
 * // Returns: { token: 'jwt...', user: { _id, fullName, email, ... } }
 *
 * @example
 * // Request Authentication:
 * // const user = await getUserFromRequest(req);
 * // Returns: User object or null if not authenticated
 *
 * @dependencies
 * - ../models/User: User model for database operations
 * - jsonwebtoken: JWT token generation and verification
 * - ../config: Environment configuration for JWT secrets
 * - ../utils/errors: Custom error classes for proper error handling
 * - ../utils/validation: Input validation and sanitization functions
 */

import User, { IUser } from "../models/User.js";
import jwt from "jsonwebtoken";
import { Document } from "mongoose";
import { config } from "../config/index.js";
import { ValidationError, AuthenticationError } from "../utils/errors.js";
import {
  validateEmail,
  validateName,
  validateQRToken,
} from "../utils/validation.js";

/**
 * Input interface for user registration operations.
 * Used for optional user registration flow when QR token registration is enabled.
 *
 * @interface RegisterUserInput
 * @property {string} fullName - Full name of the user (validated and trimmed)
 * @property {string} email - Email address (validated, unique, and normalized)
 * @property {string} qrToken - Unique QR token from wedding invitation
 */
export interface RegisterUserInput {
  fullName: string;
  email: string;
  qrToken: string;
}

/**
 * Input interface for QR token authentication operations.
 * Primary authentication method for the wedding website.
 *
 * @interface LoginInput
 * @property {string} qrToken - Unique QR token from scanned wedding invitation
 */
export interface LoginInput {
  qrToken: string;
}

/**
 * Authentication result interface returned by login and registration operations.
 * Contains JWT token and complete user profile for frontend state management.
 *
 * @interface AuthResult
 * @property {string} token - JWT token for subsequent authenticated requests
 * @property {IUser} user - Complete user profile with invitation and RSVP status
 */
export interface AuthResult {
  token: string;
  user: IUser;
}

/**
 * Register a new user with validation
 */
export async function registerUser({
  fullName,
  email,
  qrToken,
}: RegisterUserInput): Promise<AuthResult> {
  try {
    // Validate inputs
    const validatedEmail = validateEmail(email);
    const validatedName = validateName(fullName, "Full name");
    const validatedToken = validateQRToken(qrToken);

    // Check if user already exists
    const existingUser = (await (User.findOne as any)({
      email: validatedEmail,
    })) as (Document<unknown, {}, IUser> & IUser) | null;

    if (existingUser) {
      throw new ValidationError("User with this email already exists");
    }

    // Check if QR token is already used
    const existingToken = (await (User.findOne as any)({
      qrToken: validatedToken,
    })) as (Document<unknown, {}, IUser> & IUser) | null;

    if (existingToken) {
      throw new ValidationError("QR token is already in use");
    }

    // Create new user
    const userDoc = (await (User.create as any)({
      fullName: validatedName,
      email: validatedEmail,
      isAdmin: false,
      isInvited: true,
      qrToken: validatedToken,
    })) as Document<unknown, {}, IUser> & IUser;

    const user = userDoc.toObject();
    const jwtPayload = {
      userId: user._id?.toString() || user.id,
      email: user.email,
      fullName: user.fullName,
      isAdmin: user.isAdmin,
    };

    const token = jwt.sign(jwtPayload, config.auth.jwtSecret, {
      expiresIn: config.auth.jwtExpiresIn,
    } as jwt.SignOptions);

    return { token, user };
  } catch (error: any) {
    console.error("Registration error:", error);
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError(error?.message || "Registration failed");
  }
}

/**
 * Login user with QR token or alias
 * Supports both original QR tokens and human-readable aliases
 */
export async function loginWithQrToken({
  qrToken,
}: LoginInput): Promise<AuthResult> {
  try {
    const validatedToken = validateQRToken(qrToken);

    // Try to find user by QR token OR alias
    const user = (await (User as any).findByQRTokenOrAlias(validatedToken)) as
      | (Document<unknown, {}, IUser> & IUser)
      | null;

    if (!user) {
      throw new AuthenticationError("Invalid or expired QR token");
    }

    if (!user.isInvited) {
      throw new AuthenticationError("User is not invited");
    }

    const jwtPayload = {
      userId: user._id?.toString() || user.id,
      email: user.email,
      fullName: user.fullName,
      isAdmin: user.isAdmin,
    };

    const token = jwt.sign(jwtPayload, config.auth.jwtSecret, {
      expiresIn: config.auth.jwtExpiresIn,
    } as jwt.SignOptions);

    return { token, user: user.toObject() };
  } catch (error: any) {
    console.error("Login error:", error);
    if (
      error instanceof AuthenticationError ||
      error instanceof ValidationError
    ) {
      throw error;
    }
    throw new AuthenticationError(error?.message || "Login failed");
  }
}

/**
 * Verify JWT token and return user
 */
export async function verifyToken(token: string): Promise<IUser | null> {
  try {
    const decoded = jwt.verify(token, config.auth.jwtSecret) as {
      userId: string;
      email: string;
    };

    const user = (await (User as any)
      .findById(decoded.userId)
      .exec()) as IUser | null;

    if (!user || !user.isInvited) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Extract user from request headers
 */
export async function getUserFromRequest(req: any): Promise<IUser | null> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    return await verifyToken(token);
  } catch (error) {
    console.error("Error extracting user from request:", error);
    return null;
  }
}
