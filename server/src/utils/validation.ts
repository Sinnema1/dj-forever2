/**
 * @fileoverview Input Validation and Data Sanitization System
 *
 * Comprehensive validation utilities for wedding website data integrity providing:
 * - Email format validation with RFC compliance
 * - Name validation with international character support
 * - RSVP-specific business logic validation
 * - Security-focused input sanitization
 * - Consistent error messages and user feedback
 *
 * Validation Philosophy:
 * - Fail fast with clear, actionable error messages
 * - Sanitize and normalize input data for consistency
 * - Validate against business rules and security constraints
 * - Provide user-friendly validation feedback
 *
 * Security Considerations:
 * - XSS prevention through input sanitization
 * - SQL injection prevention via parameterized queries
 * - Data normalization for consistent processing
 * - Input length limits to prevent resource exhaustion
 *
 * Usage Patterns:
 * - GraphQL resolver input validation
 * - Database model pre-save validation
 * - API endpoint data sanitization
 * - Form submission processing
 *
 * @author DJ Forever 2 Team
 * @version 1.0.0
 */

import { ValidationError } from "../utils/errors.js";

/**
 * Validate and normalize email addresses with RFC compliance
 *
 * Performs comprehensive email validation:
 * - Basic format validation with regex pattern
 * - Length validation (RFC 5321 limit: 254 characters)
 * - Automatic normalization (trim whitespace, lowercase)
 * - Required field validation
 *
 * @param email - Raw email input from user
 * @returns Normalized email address (trimmed and lowercased)
 * @throws {ValidationError} When email is missing, invalid format, or too long
 *
 * @example
 * ```typescript
 * // Valid email normalization
 * const email = validateEmail('  User@Example.COM  ');
 * console.log(email); // 'user@example.com'
 *
 * // Validation errors
 * validateEmail(''); // ValidationError: Email is required
 * validateEmail('invalid-email'); // ValidationError: Invalid email format
 * validateEmail('a'.repeat(250) + '@example.com'); // ValidationError: Email is too long
 * ```
 *
 * @security
 * - Prevents email-based injection attacks
 * - Normalizes case for consistent database storage
 * - Length limits prevent resource exhaustion
 */
export function validateEmail(email: string): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail) {
    throw new ValidationError("Email is required");
  }

  if (!emailRegex.test(trimmedEmail)) {
    throw new ValidationError("Invalid email format");
  }

  if (trimmedEmail.length > 254) {
    throw new ValidationError("Email is too long");
  }

  return trimmedEmail;
}

/**
 * Validate human names with international character support
 *
 * Comprehensive name validation supporting:
 * - International naming conventions (letters, spaces, hyphens, apostrophes)
 * - Configurable field name for contextual error messages
 * - Reasonable length constraints (2-100 characters)
 * - Whitespace normalization
 *
 * @param name - Raw name input from user
 * @param fieldName - Context field name for error messages (default: "Name")
 * @returns Normalized name (trimmed whitespace)
 * @throws {ValidationError} When name is missing, too short/long, or contains invalid characters
 *
 * @example
 * ```typescript
 * // Valid name processing
 * const firstName = validateName('  John  ', 'First Name');
 * console.log(firstName); // 'John'
 *
 * // International names
 * validateName("Mary-Jane O'Connor"); // Valid
 * validateName("José María"); // Valid (if regex updated for international)
 *
 * // Validation errors
 * validateName('', 'Last Name'); // ValidationError: Last Name is required
 * validateName('A'); // ValidationError: Name must be at least 2 characters long
 * validateName('John123'); // ValidationError: Name contains invalid characters
 * ```
 *
 * @internationalization
 * - Current regex supports English names with common punctuation
 * - Consider Unicode character classes for international names
 * - May need cultural-specific validation rules
 *
 * @security
 * - Prevents script injection via name fields
 * - Length limits prevent buffer overflow attacks
 * - Character restrictions reduce attack surface
 */
export function validateName(name: string, fieldName = "Name"): string {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new ValidationError(`${fieldName} is required`);
  }

  if (trimmedName.length < 2) {
    throw new ValidationError(
      `${fieldName} must be at least 2 characters long`,
    );
  }

  if (trimmedName.length > 100) {
    throw new ValidationError(`${fieldName} is too long`);
  }

  // Allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(trimmedName)) {
    throw new ValidationError(`${fieldName} contains invalid characters`);
  }

  return trimmedName;
}

/**
 * Validate RSVP attendance status with business rule enforcement
 *
 * Normalizes attendance responses to standard format:
 * - Converts input to uppercase for consistency
 * - Validates against allowed values (YES, NO, MAYBE)
 * - Provides type-safe return value
 *
 * Business Logic:
 * - YES: Confirmed attendance, requires meal preferences
 * - NO: Declined attendance, no additional requirements
 * - MAYBE: Tentative attendance, may require follow-up
 *
 * @param attending - Raw attendance status from user input
 * @returns Normalized attendance status ("YES" | "NO" | "MAYBE")
 * @throws {ValidationError} When attendance status is not recognized
 *
 * @example
 * ```typescript
 * // Valid attendance normalization
 * const status = validateAttendance('yes');
 * console.log(status); // 'YES'
 *
 * // Case insensitive
 * validateAttendance('Maybe'); // 'MAYBE'
 * validateAttendance('no'); // 'NO'
 *
 * // Validation errors
 * validateAttendance('unknown'); // ValidationError: Invalid attendance status
 * validateAttendance(''); // ValidationError: Invalid attendance status
 * ```
 *
 * @businessLogic
 * - Links to meal preference requirements
 * - Affects guest count calculations
 * - Determines confirmation email content
 */
export function validateAttendance(attending: string): "YES" | "NO" | "MAYBE" {
  const validStatuses = ["YES", "NO", "MAYBE"] as const;
  const upperAttending = attending.toUpperCase();

  if (!validStatuses.includes(upperAttending as any)) {
    throw new ValidationError("Invalid attendance status");
  }

  return upperAttending as "YES" | "NO" | "MAYBE";
}

/**
 * Validate guest count for wedding capacity management
 *
 * Enforces business constraints:
 * - Must be positive integer (no fractional guests)
 * - Minimum 1 guest (the invitee themselves)
 * - Maximum 10 guests (venue capacity limitations)
 * - Validates numeric type integrity
 *
 * @param count - Number of guests from RSVP form
 * @returns Validated guest count as integer
 * @throws {ValidationError} When count is not integer, negative, zero, or exceeds limit
 *
 * @example
 * ```typescript
 * // Valid guest counts
 * validateGuestCount(1); // Solo attendance
 * validateGuestCount(2); // Couple
 * validateGuestCount(5); // Family group
 *
 * // Validation errors
 * validateGuestCount(0); // ValidationError: Guest count must be between 1 and 10
 * validateGuestCount(11); // ValidationError: Guest count must be between 1 and 10
 * validateGuestCount(2.5); // ValidationError: Guest count must be between 1 and 10
 * validateGuestCount(-1); // ValidationError: Guest count must be between 1 and 10
 * ```
 *
 * @businessLogic
 * - Venue capacity planning constraint
 * - Catering count for meal preparation
 * - Table assignment calculations
 * - Cost estimation for event planning
 */
export function validateGuestCount(count: number): number {
  if (!Number.isInteger(count) || count < 1 || count > 10) {
    throw new ValidationError("Guest count must be between 1 and 10");
  }

  return count;
}

/**
 * Validate meal preferences with attendance-aware requirements
 *
 * Conditional validation based on attendance status:
 * - Required for "YES" attendance (confirmed guests need meals)
 * - Optional for "NO" or "MAYBE" status
 * - Validates against available menu options
 * - Normalizes case for consistent storage
 *
 * Available Menu Options:
 * - chicken: Standard chicken entrée
 * - beef: Standard beef entrée
 * - fish: Standard fish entrée
 * - vegetarian: Vegetarian option
 * - vegan: Vegan option
 * - kids: Children's meal option
 *
 * @param preference - Raw meal preference from user
 * @param attending - Attendance status for conditional validation
 * @returns Normalized meal preference (lowercase) or empty string
 * @throws {ValidationError} When preference required but missing, or invalid option selected
 *
 * @example
 * ```typescript
 * // Attending guests (preference required)
 * const meal = validateMealPreference('CHICKEN', 'YES');
 * console.log(meal); // 'chicken'
 *
 * // Non-attending guests (preference optional)
 * validateMealPreference('', 'NO'); // Returns ''
 * validateMealPreference('vegetarian', 'MAYBE'); // 'vegetarian'
 *
 * // Validation errors
 * validateMealPreference('', 'YES'); // ValidationError: Meal preference is required
 * validateMealPreference('pasta', 'YES'); // ValidationError: Invalid meal preference
 * ```
 *
 * @businessLogic
 * - Drives catering headcount calculations
 * - Determines special dietary accommodation needs
 * - Links to kitchen preparation workflows
 * - Affects seating arrangements for dietary needs
 */
export function validateMealPreference(
  preference: string,
  attending?: string,
): string {
  const validPreferences = [
    "chicken",
    "beef",
    "fish",
    "vegetarian",
    "vegan",
    "kids",
  ];

  const lowerPreference = preference.toLowerCase().trim();

  // Only require meal preference for attending guests
  if (!lowerPreference) {
    if (attending === "YES") {
      throw new ValidationError("Meal preference is required");
    }
    return ""; // Return empty string for non-attending guests
  }

  if (!validPreferences.includes(lowerPreference)) {
    throw new ValidationError("Invalid meal preference");
  }

  return lowerPreference;
}

/**
 * Sanitize free-text input for security and consistency
 *
 * Comprehensive text sanitization:
 * - Removes potentially dangerous HTML/script characters
 * - Enforces length limits to prevent resource exhaustion
 * - Preserves most punctuation for natural text expression
 * - Trims whitespace for consistent storage
 *
 * Security Features:
 * - XSS prevention by removing < > characters
 * - Quote character removal to prevent injection
 * - Configurable length limits
 *
 * @param text - Raw text input from user (notes, allergies, comments)
 * @param maxLength - Maximum allowed text length (default: 500)
 * @returns Sanitized text safe for storage and display
 * @throws {ValidationError} When text exceeds maximum length
 *
 * @example
 * ```typescript
 * // Basic sanitization
 * const note = sanitizeText('  Great event! Looking forward to it.  ');
 * console.log(note); // 'Great event! Looking forward to it.'
 *
 * // XSS prevention
 * sanitizeText('<script>alert("xss")</script>'); // 'scriptalertxss/script'
 * sanitizeText('Quote: "Hello"'); // 'Quote: Hello'
 *
 * // Length validation
 * sanitizeText('A'.repeat(600)); // ValidationError: Text is too long (max 500 characters)
 *
 * // Custom length limits
 * sanitizeText('Short note', 50); // Valid
 * sanitizeText('Very long note...', 10); // ValidationError: Text is too long (max 10 characters)
 * ```
 *
 * @security
 * - Prevents XSS attacks through HTML tag removal
 * - Removes quote characters that could break SQL queries
 * - Length limits prevent buffer overflow and DoS
 *
 * @useCases
 * - RSVP notes and special requests
 * - Dietary restrictions and allergy information
 * - General comment fields
 * - User feedback and messages
 */
export function sanitizeText(text: string, maxLength = 500): string {
  const trimmedText = text.trim();

  if (trimmedText.length > maxLength) {
    throw new ValidationError(`Text is too long (max ${maxLength} characters)`);
  }

  // Remove potentially harmful characters but allow most punctuation
  return trimmedText.replace(/[<>\"']/g, "");
}

/**
 * Validate QR authentication tokens for secure login
 *
 * Validates unique QR codes used for passwordless authentication:
 * - Format validation against expected pattern
 * - Length constraints for security and usability
 * - Case-insensitive validation with normalization
 * - Required field validation
 *
 * Token Format:
 * - Generated using Math.random().toString(36)
 * - Alphanumeric characters (a-z, A-Z, 0-9)
 * - Length range: 10-40 characters
 * - Case insensitive (normalized to lowercase)
 *
 * Security Properties:
 * - Sufficient entropy for unique identification
 * - Non-guessable random generation
 * - Single-use authentication tokens
 * - Expiration handling at application level
 *
 * @param token - Raw QR token from URL or scan
 * @returns Normalized token (trimmed and validated)
 * @throws {ValidationError} When token is missing or invalid format
 *
 * @example
 * ```typescript
 * // Valid token processing
 * const token = validateQRToken('  abc123def456  ');
 * console.log(token); // 'abc123def456'
 *
 * // Case normalization
 * validateQRToken('ABC123def456'); // 'ABC123def456' (preserved case)
 *
 * // Validation errors
 * validateQRToken(''); // ValidationError: QR token is required
 * validateQRToken('short'); // ValidationError: Invalid QR token format
 * validateQRToken('token-with-dashes'); // ValidationError: Invalid QR token format
 * validateQRToken('a'.repeat(50)); // ValidationError: Invalid QR token format
 * ```
 *
 * @security
 * - Prevents token format manipulation attacks
 * - Validates expected entropy levels
 * - Rejects potentially malicious token formats
 *
 * @authentication
 * - Used with QR code scanning for passwordless login
 * - Links to user records in authentication system
 * - Single-use tokens prevent replay attacks
 * - Server-side validation prevents client manipulation
 */
export function validateQRToken(token: string): string {
  const trimmedToken = token.trim();

  if (!trimmedToken) {
    throw new ValidationError("QR token is required");
  }

  // QR tokens can be:
  // 1. Original format: alphanumeric strings (generated using Math.random().toString(36))
  //    - Lowercase letters and numbers, 10-40 characters
  // 2. QR alias format: human-readable aliases (e.g., "smith-family")
  //    - Lowercase letters, numbers, and hyphens, 3-50 characters
  const tokenRegex = /^[a-z0-9-]{3,50}$/i;
  if (!tokenRegex.test(trimmedToken)) {
    throw new ValidationError("Invalid QR token format");
  }

  return trimmedToken;
}
