/**
 * @fileoverview GraphQL Context Creation for DJ Forever 2 Wedding Website
 * @module graphql/context
 * @version 1.0.0
 *
 * GraphQL execution context creation with JWT-based authentication.
 * Extracts and validates JWT tokens from Authorization headers to populate
 * user context for protected GraphQL operations. Integrates with QR-based
 * authentication system where QR codes generate JWT tokens for subsequent API access.
 *
 * Context Flow:
 * 1. Extract Bearer token from Authorization header
 * 2. Verify JWT token signature using JWT_SECRET
 * 3. Decode user ID from token payload
 * 4. Fetch full user document from MongoDB
 * 5. Return context with user and authentication status
 *
 * Security Features:
 * - JWT signature validation prevents token tampering
 * - Database lookup ensures user still exists and is active
 * - Graceful fallback to unauthenticated context on any failure
 * - No sensitive data logged in error cases
 *
 * Integration:
 * - Used by Apollo Server middleware in server.ts
 * - Context passed to all GraphQL resolvers
 * - requireAuth() helper validates context in protected resolvers
 *
 * @example
 * // Usage in Apollo Server setup:
 * // app.use('/graphql', expressMiddleware(server, {
 * //   context: createContext
 * // }));
 *
 * @example
 * // Context usage in resolvers:
 * // const user = context.user; // Authenticated user or null
 * // const isAuth = context.isAuthenticated; // Boolean status
 *
 * @dependencies
 * - jsonwebtoken: JWT token verification and decoding
 * - ../models/User: Mongoose User model for database lookup
 */

import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * GraphQL execution context interface defining available context properties.
 * Passed to all GraphQL resolvers for authentication and request handling.
 *
 * @interface Context
 * @property {import('../models/User.js').IUser | undefined} user - Authenticated user document or undefined
 * @property {boolean} isAuthenticated - Boolean flag indicating authentication status
 */
export interface Context {
  user?: any;
  isAuthenticated: boolean;
}

/**
 * Creates GraphQL execution context from Express request object.
 * Extracts JWT token from Authorization header, validates it, and populates user context.
 *
 * Handles complete authentication flow:
 * - Extracts Bearer token from Authorization header
 * - Validates JWT signature and expiration
 * - Fetches user document from database using token payload
 * - Returns context with user and authentication status
 *
 * @async
 * @function createContext
 * @param {Object} params - Context creation parameters
 * @param {Express.Request} params.req - Express request object with headers
 * @returns {Promise<Context>} GraphQL context with user and authentication status
 *
 * @example
 * // Request with valid JWT token:
 * // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * // Returns: { user: UserDocument, isAuthenticated: true }
 *
 * @example
 * // Request without token or invalid token:
 * // Returns: { isAuthenticated: false }
 */
export async function createContext({ req }: { req: any }): Promise<Context> {
  let token = req.headers.authorization || "";

  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  if (!token) {
    return { isAuthenticated: false };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await (User as any).findById(decoded.id);

    return {
      user,
      isAuthenticated: !!user,
    };
  } catch {
    return { isAuthenticated: false };
  }
}
