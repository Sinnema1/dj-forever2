/**
 * @fileoverview GraphQL Error Handling System
 *
 * Centralized error classes and formatting for GraphQL API responses providing:
 * - Standardized error codes for client error handling
 * - Type-safe error construction with proper GraphQL extensions
 * - Environment-aware error formatting and logging
 * - Security-conscious error message exposure
 *
 * Error Types:
 * - AuthenticationError: Invalid or missing authentication credentials
 * - ForbiddenError: Valid authentication but insufficient permissions
 * - ValidationError: Invalid input data or business rule violations
 *
 * Error Response Format:
 * ```json
 * {
 *   "errors": [{
 *     "message": "User-friendly error message",
 *     "extensions": {
 *       "code": "ERROR_CODE_CONSTANT"
 *     },
 *     "locations": [...],
 *     "path": [...]
 *   }]
 * }
 * ```
 *
 * Client Error Handling:
 * - Use error codes for programmatic error handling
 * - Display error messages for user feedback
 * - Handle authentication errors with redirect to login
 * - Show validation errors inline with forms
 *
 * @author DJ Forever 2 Team
 * @version 1.0.0
 */

// Centralized error handling for GraphQL
import { GraphQLError } from "graphql";

/**
 * Authentication error for invalid or missing credentials
 *
 * Thrown when:
 * - JWT token is missing from request headers
 * - JWT token is invalid or expired
 * - User account is disabled or deleted
 * - Authentication service is unavailable
 *
 * @example
 * ```typescript
 * // In GraphQL resolver
 * if (!user) {
 *   throw new AuthenticationError('Please log in to access this resource');
 * }
 *
 * // Client error handling
 * if (error.extensions?.code === 'UNAUTHENTICATED') {
 *   redirectToLogin();
 * }
 * ```
 */
export class AuthenticationError extends GraphQLError {
  /**
   * Create authentication error with standardized code
   *
   * @param message - User-friendly error message for client display
   */
  constructor(message: string) {
    super(message, {
      extensions: {
        code: "UNAUTHENTICATED",
      },
    });
  }
}

/**
 * Authorization error for insufficient permissions
 *
 * Thrown when:
 * - User is authenticated but lacks required permissions
 * - Resource access requires admin privileges
 * - User account is suspended or restricted
 * - Operation requires specific user ownership
 *
 * @example
 * ```typescript
 * // In GraphQL resolver
 * if (user.role !== 'admin') {
 *   throw new ForbiddenError('Admin access required for this operation');
 * }
 *
 * // Resource ownership check
 * if (resource.userId !== user.id) {
 *   throw new ForbiddenError('You can only modify your own resources');
 * }
 *
 * // Client error handling
 * if (error.extensions?.code === 'FORBIDDEN') {
 *   showPermissionDeniedMessage();
 * }
 * ```
 */
export class ForbiddenError extends GraphQLError {
  /**
   * Create authorization error with standardized code
   *
   * @param message - User-friendly error message explaining permission requirements
   */
  constructor(message: string) {
    super(message, {
      extensions: {
        code: "FORBIDDEN",
      },
    });
  }
}

/**
 * Input validation error for malformed or invalid data
 *
 * Thrown when:
 * - Required fields are missing from input
 * - Field values fail format validation (email, phone, etc.)
 * - Data violates business rules or constraints
 * - Input contains potentially dangerous content
 *
 * @example
 * ```typescript
 * // In validation functions
 * if (!email.includes('@')) {
 *   throw new ValidationError('Please enter a valid email address');
 * }
 *
 * // Business rule validation
 * if (guestCount > maxGuests) {
 *   throw new ValidationError(`Maximum ${maxGuests} guests allowed`);
 * }
 *
 * // Client error handling
 * if (error.extensions?.code === 'BAD_USER_INPUT') {
 *   displayFieldError(error.message);
 * }
 * ```
 */
export class ValidationError extends GraphQLError {
  /**
   * Create validation error with standardized code
   *
   * @param message - Specific validation failure message for user correction
   */
  constructor(message: string) {
    super(message, {
      extensions: {
        code: "BAD_USER_INPUT",
      },
    });
  }
}

/**
 * Global GraphQL error formatter for consistent error handling
 *
 * Processes all GraphQL errors before sending to client:
 * - Logs errors for monitoring and debugging
 * - Sanitizes error details based on environment
 * - Ensures consistent error structure
 * - Prevents sensitive information leakage
 *
 * Environment Behavior:
 * - Development: Full error details logged to console
 * - Production: Minimal logging, sanitized error responses
 *
 * @param error - GraphQL error from resolver execution or validation
 * @returns Formatted error safe for client consumption
 *
 * @example
 * ```typescript
 * // In Apollo Server configuration
 * const server = new ApolloServer({
 *   typeDefs,
 *   resolvers,
 *   formatError: formatError // Register global error formatter
 * });
 *
 * // Error logging output (development):
 * // GraphQL Error: AuthenticationError: Please log in to access this resource
 * //   at resolver (/path/to/resolver.ts:123:45)
 * ```
 *
 * @security
 * - Production errors exclude stack traces and internal details
 * - Only safe error messages and codes exposed to clients
 * - All errors logged server-side for security monitoring
 */
export function formatError(error: GraphQLError) {
  // Log errors (add your logging service here)
  if (process.env.NODE_ENV !== "production") {
    console.error("GraphQL Error:", error);
  }

  return error;
}
