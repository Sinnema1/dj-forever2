/**
 * RSVP Type Definitions
 *
 * Comprehensive type definitions for the wedding RSVP system with full
 * backward compatibility support. These types handle both modern multi-guest
 * RSVPs and legacy single-guest data formats, ensuring smooth data migration
 * and consistent API interactions.
 *
 * @fileoverview Consolidated RSVP types with legacy compatibility
 * @version 2.0
 * @since 1.0.0
 */

/**
 * Guest attendance status options for wedding RSVP responses
 *
 * @typedef {string} AttendanceStatus
 * @enum {string}
 */
export type AttendanceStatus =
  /** Confirmed attendance - guest will attend the wedding */
  | 'YES'
  /** Declined attendance - guest cannot attend the wedding */
  | 'NO'
  /** Uncertain attendance - guest is unsure about attending */
  | 'MAYBE';

/**
 * Individual guest information for multi-guest RSVP entries
 *
 * Each guest in a party has their own meal preferences and dietary restrictions.
 * This interface supports the modern multi-guest RSVP system where families
 * or couples can RSVP for multiple attendees with individual preferences.
 */
export interface Guest {
  /** Full name of the guest (required for attending guests) */
  fullName: string;
  /** Selected meal preference (required for attending guests) */
  mealPreference: string;
  /** Dietary restrictions, allergies, or special meal requests */
  allergies: string;
}

/**
 * Complete RSVP record as stored in the database
 *
 * Represents a full RSVP response with both modern multi-guest fields and
 * legacy single-guest fields for backward compatibility. The legacy fields
 * are automatically populated from the first guest's data when using the
 * modern format.
 *
 * @example
 * ```typescript
 * const rsvp: RSVP = {
 *   _id: '507f1f77bcf86cd799439011',
 *   userId: '507f1f77bcf86cd799439012',
 *   attending: 'YES',
 *   guestCount: 2,
 *   guests: [
 *     {
 *       fullName: 'John Doe',
 *       mealPreference: 'chicken',
 *       allergies: 'None'
 *     },
 *     {
 *       fullName: 'Jane Doe',
 *       mealPreference: 'vegetarian',
 *       allergies: 'Gluten sensitivity'
 *     }
 *   ],
 *   additionalNotes: 'Looking forward to celebrating!',
 *   // Legacy fields (auto-populated from first guest)
 *   fullName: 'John Doe',
 *   mealPreference: 'chicken',
 *   allergies: 'None'
 * };
 * ```
 */
export interface RSVP {
  /** Unique database identifier for the RSVP record */
  _id: string;
  /** ID of the user who submitted this RSVP */
  userId: string;
  /** Overall attendance status for the RSVP */
  attending: AttendanceStatus;
  /** Total number of guests in this RSVP (including primary guest) */
  guestCount: number;
  /** Array of individual guest information and preferences */
  guests: Guest[];
  /** Additional notes, special requests, or messages from guests */
  additionalNotes: string;

  // Legacy fields for backward compatibility with v1.0 RSVPs
  /** @deprecated Use guests[0].fullName - kept for legacy API compatibility */
  fullName: string;
  /** @deprecated Use guests[0].mealPreference - kept for legacy API compatibility */
  mealPreference: string;
  /** @deprecated Use guests[0].allergies - kept for legacy API compatibility */
  allergies: string;
}

/**
 * Input data structure for creating new RSVP entries
 *
 * Used when submitting new RSVP responses through the GraphQL createRSVP
 * mutation. Includes both modern multi-guest fields and legacy fields to
 * ensure compatibility with existing API consumers.
 *
 * @example
 * ```typescript
 * const newRSVP: CreateRSVPInput = {
 *   attending: 'YES',
 *   guestCount: 1,
 *   guests: [{
 *     fullName: 'John Budach',
 *     mealPreference: 'fish',
 *     allergies: 'None'
 *   }],
 *   additionalNotes: 'Excited to celebrate with you!',
 *   // Legacy fields (should match guests[0])
 *   fullName: 'John Budach',
 *   mealPreference: 'fish',
 *   allergies: 'None'
 * };
 * ```
 */
export interface CreateRSVPInput {
  /** Attendance status for this RSVP */
  attending: AttendanceStatus;
  /** Total number of guests (must match guests array length) */
  guestCount: number;
  /** Individual guest information array */
  guests: Guest[];
  /** Additional notes or special requests */
  additionalNotes: string;

  // Legacy fields for API compatibility
  /** @deprecated Use guests[0].fullName - required for legacy API support */
  fullName: string;
  /** @deprecated Use guests[0].mealPreference - required for legacy API support */
  mealPreference: string;
  /** @deprecated Use guests[0].allergies - required for legacy API support */
  allergies: string;
}

/**
 * Form data structure used by RSVPForm component
 *
 * Represents the current state of the RSVP form during user input. This
 * interface matches CreateRSVPInput to ensure seamless form submission
 * without data transformation.
 *
 * @example
 * ```typescript
 * const [formData, setFormData] = useState<RSVPFormData>({
 *   attending: 'YES',
 *   guestCount: 1,
 *   guests: [{ fullName: '', mealPreference: '', allergies: '' }],
 *   additionalNotes: '',
 *   fullName: '',
 *   mealPreference: '',
 *   allergies: ''
 * });
 * ```
 */
export interface RSVPFormData {
  /** Current attendance selection in the form */
  attending: AttendanceStatus;
  /** Number of guests currently configured in form */
  guestCount: number;
  /** Array of guest form data */
  guests: Guest[];
  /** Additional notes text area content */
  additionalNotes: string;

  // Legacy form fields
  /** @deprecated Legacy form field - use guests[0].fullName */
  fullName: string;
  /** @deprecated Legacy form field - use guests[0].mealPreference */
  mealPreference: string;
  /** @deprecated Legacy form field - use guests[0].allergies */
  allergies: string;
}

/**
 * Input structure for updating existing RSVP entries
 *
 * Used with editRSVP mutation to modify existing RSVP responses. Contains
 * only the essential fields needed for updates, with optional additional notes.
 *
 * @example
 * ```typescript
 * const updateData: RSVPInput = {
 *   attending: 'NO',
 *   guestCount: 1,
 *   guests: [{
 *     fullName: 'John Doe',
 *     mealPreference: '',
 *     allergies: ''
 *   }],
 *   additionalNotes: 'Unfortunately cannot make it due to scheduling conflict'
 * };
 * ```
 */
export interface RSVPInput {
  /** Updated attendance status */
  attending: AttendanceStatus;
  /** Updated guest count */
  guestCount: number;
  /** Updated guest information */
  guests: Guest[];
  /** Optional updated additional notes */
  additionalNotes?: string;
}
