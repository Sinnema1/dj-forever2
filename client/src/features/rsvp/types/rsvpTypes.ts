/**
 * RSVP Type Definitions
 * Consolidated types for RSVP functionality with backward compatibility
 */

export type AttendanceStatus = 'YES' | 'NO' | 'MAYBE';

export interface Guest {
  fullName: string;
  mealPreference: string;
  allergies: string;
}

export interface RSVP {
  _id: string;
  userId: string;
  attending: AttendanceStatus;
  guestCount: number;
  guests: Guest[];
  additionalNotes: string;
  // Legacy fields for backward compatibility
  fullName: string;
  mealPreference: string;
  allergies: string;
}

export interface CreateRSVPInput {
  attending: AttendanceStatus;
  guestCount: number;
  guests: Guest[];
  additionalNotes: string;
  // Legacy fields for backward compatibility
  fullName: string;
  mealPreference: string;
  allergies: string;
}

export interface RSVPFormData {
  attending: AttendanceStatus;
  guestCount: number;
  guests: Guest[];
  additionalNotes: string;
  // Legacy fields for backward compatibility
  fullName: string;
  mealPreference: string;
  allergies: string;
}

export interface RSVPInput {
  attending: AttendanceStatus;
  guestCount: number;
  guests: Guest[];
  additionalNotes?: string;
}
