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

export interface RegisterUserInput {
  fullName: string;
  email: string;
  qrToken: string;
}

export interface LoginInput {
  qrToken: string;
}

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
 * Login user with QR token
 */
export async function loginWithQrToken({
  qrToken,
}: LoginInput): Promise<AuthResult> {
  try {
    const validatedToken = validateQRToken(qrToken);

    const user = (await (User.findOne as any)({
      qrToken: validatedToken,
    })) as (Document<unknown, {}, IUser> & IUser) | null;

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
