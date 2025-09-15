/**
 * Input Validation and Sanitization
 * Centralized validation logic for better data integrity
 */

import { ValidationError } from "../utils/errors.js";

// Email validation
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

// Name validation
export function validateName(name: string, fieldName = "Name"): string {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new ValidationError(`${fieldName} is required`);
  }

  if (trimmedName.length < 2) {
    throw new ValidationError(
      `${fieldName} must be at least 2 characters long`
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

// RSVP attendance validation
export function validateAttendance(attending: string): "YES" | "NO" | "MAYBE" {
  const validStatuses = ["YES", "NO", "MAYBE"] as const;
  const upperAttending = attending.toUpperCase();

  if (!validStatuses.includes(upperAttending as any)) {
    throw new ValidationError("Invalid attendance status");
  }

  return upperAttending as "YES" | "NO" | "MAYBE";
}

// Guest count validation
export function validateGuestCount(count: number): number {
  if (!Number.isInteger(count) || count < 1 || count > 10) {
    throw new ValidationError("Guest count must be between 1 and 10");
  }

  return count;
}

// Meal preference validation
export function validateMealPreference(
  preference: string,
  attending?: string
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

// Text sanitization for notes and allergies
export function sanitizeText(text: string, maxLength = 500): string {
  const trimmedText = text.trim();

  if (trimmedText.length > maxLength) {
    throw new ValidationError(`Text is too long (max ${maxLength} characters)`);
  }

  // Remove potentially harmful characters but allow most punctuation
  return trimmedText.replace(/[<>\"']/g, "");
}

// QR Token validation
export function validateQRToken(token: string): string {
  const trimmedToken = token.trim();

  if (!trimmedToken) {
    throw new ValidationError("QR token is required");
  }

  // QR tokens are alphanumeric strings (generated using Math.random().toString(36))
  // They typically consist of lowercase letters and numbers, 15-30 characters long
  const tokenRegex = /^[a-z0-9]{10,40}$/i;
  if (!tokenRegex.test(trimmedToken)) {
    throw new ValidationError("Invalid QR token format");
  }

  return trimmedToken;
}
