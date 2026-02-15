/**
 * User Type Definitions
 *
 * Core user interfaces for authentication and user management in the DJ Forever 2
 * wedding website. These types define the structure for user data, authentication
 * context, and user-related operations throughout the application.
 *
 * @fileoverview User and authentication type definitions
 * @version 2.0
 * @since 1.0.0
 */

/**
 * User - Core User Data Interface
 *
 * Represents a wedding guest or admin user in the system. Contains all essential
 * user information including invitation status, RSVP completion state, and
 * administrative privileges. Matches the GraphQL User type from the backend.
 *
 * @interface User
 * @example
 * ```typescript
 * const guest: User = {
 *   _id: '507f1f77bcf86cd799439011',
 *   fullName: 'John Budach',
 *   email: 'jpbudach@gmail.com',
 *   isInvited: true,
 *   hasRSVPed: true,
 *   rsvpId: '507f1f77bcf86cd799439012'
 * };
 * ```
 */
/**
 * Guest group classification for invitation management and personalization.
 * Matches the GraphQL GuestGroup enum from the backend.
 * Values are lowercase to match MongoDB schema validation.
 */
export type GuestGroup =
  | 'grooms_family'
  | 'friends'
  | 'brides_family'
  | 'extended_family'
  | 'other';

/**
 * Attendance status for RSVP responses.
 * Matches the GraphQL AttendanceStatus enum from the backend.
 */
export type AttendanceStatus = 'YES' | 'NO' | 'MAYBE';

/**
 * RSVP data interface representing a guest's response to the wedding invitation.
 * Minimal structure to support banner and modal personalization.
 */
export interface RSVP {
  /** Unique database identifier for the RSVP record */
  _id: string;
  /** Whether the guest is attending the wedding */
  attending: AttendanceStatus;
}

/**
 * Household member interface for multi-person household authentication.
 * Represents additional guests who share a QR code with the primary user.
 */
export interface HouseholdMember {
  /** First name of the household member */
  firstName: string;
  /** Last name of the household member */
  lastName: string;
  /** Relationship to the bride (optional) */
  relationshipToBride?: string;
  /** Relationship to the groom (optional) */
  relationshipToGroom?: string;
}

export interface User {
  /** Unique database identifier for the user (MongoDB ObjectId as string) */
  _id: string;
  /** Full display name of the user (e.g., "John & Jane Doe") */
  fullName: string;
  /** Primary email address for the user */
  email: string;
  /** Whether the user is invited to the wedding (controls access to RSVP) */
  isInvited: boolean;
  /** Whether the user has administrative privileges (optional, defaults to false) */
  isAdmin?: boolean;
  /** Whether the user has completed their RSVP (optional, computed field) */
  hasRSVPed?: boolean;
  /** Reference to the user's RSVP record ID (optional, null if no RSVP exists) */
  rsvpId?: string | null;
  /** RSVP details including attendance status */
  rsvp?: RSVP | null;
  /** Human-readable URL alias for QR login (e.g., "smith-family") */
  qrAlias?: string;
  /** Guest's relationship to the bride (e.g., "Sister", "College Friend") */
  relationshipToBride?: string;
  /** Guest's relationship to the groom (e.g., "Brother", "Coworker") */
  relationshipToGroom?: string;
  /** Personalized welcome message for this guest */
  customWelcomeMessage?: string;
  /** Guest group classification for organizing invitations */
  guestGroup?: GuestGroup;
  /** Whether this guest is allowed to bring a plus-one */
  plusOneAllowed?: boolean;
  /** Name of the plus-one guest (if known in advance) */
  plusOneName?: string;
  /** Optional URL to a personal photo for this guest */
  personalPhoto?: string;
  /** Special instructions for guest (travel info, accommodation, etc.) */
  specialInstructions?: string;
  /** Dietary restrictions or preferences for this guest (e.g., "Vegetarian", "Gluten-free") */
  dietaryRestrictions?: string;
  /** Additional household members who share this QR code (optional) */
  householdMembers?: HouseholdMember[];
  /** Street address for mailing invitations (optional) */
  streetAddress?: string;
  /** Address line 2 - Apt, Suite, Unit (optional) */
  addressLine2?: string;
  /** City for mailing address (optional) */
  city?: string;
  /** State or province for mailing address (optional) */
  state?: string;
  /** Zip or postal code for mailing address (optional) */
  zipCode?: string;
  /** Country for mailing address (optional) */
  country?: string;
}

/**
 * UserType - Legacy Type Alias
 *
 * Maintains backward compatibility with existing code that imports UserType.
 * New code should use the User interface directly for clarity.
 *
 * @deprecated Use `User` interface directly for new code
 * @type {User}
 */
export type UserType = User;

/**
 * AuthContextType - Authentication Context Interface
 *
 * Defines the structure and methods available through the authentication context.
 * Provides user state, authentication status, and authentication operations
 * throughout the application via React Context.
 *
 * @interface AuthContextType
 * @example
 * ```typescript
 * const AuthComponent = () => {
 *   const { user, isLoggedIn, loginWithQrToken, logout } = useAuth();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *
 *   if (!isLoggedIn) {
 *     return (
 *       <button onClick={() => loginWithQrToken('user-qr-token')}>
 *         Login
 *       </button>
 *     );
 *   }
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {user?.fullName}!</h1>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * };
 * ```
 */
export interface AuthContextType {
  /**
   * Current authenticated user data or null if not logged in
   * Contains all user information including invitation status and RSVP state
   */
  user: User | null;

  /**
   * JWT authentication token or null if not authenticated
   * Used for API authorization and stored in localStorage for persistence
   */
  token: string | null;

  /**
   * Computed boolean indicating if user is currently authenticated
   * True when both user and token are present
   */
  isLoggedIn: boolean;

  /**
   * Loading state indicator for authentication operations
   * True during initial app load, login attempts, or token validation
   */
  isLoading: boolean;

  /**
   * QR Code Authentication Function
   *
   * Authenticates a user using their unique QR token from wedding invitation.
   * Handles the complete login flow including token validation, user data
   * retrieval, and local storage persistence.
   *
   * @param qrToken - Unique QR token from user's wedding invitation
   * @returns Promise that resolves on successful authentication
   * @throws {Error} When QR token is invalid, expired, or network errors occur
   *
   * @example
   * ```typescript
   * try {
   *   await loginWithQrToken('abc123def456');
   *   // User is now authenticated, context will update automatically
   * } catch (error) {
   *   console.error('Login failed:', error.message);
   * }
   * ```
   */
  loginWithQrToken: (qrToken: string) => Promise<void>;

  /**
   * Logout Function
   *
   * Clears all authentication data including user state, JWT token, and
   * local storage. Resets the authentication context to logged-out state.
   *
   * @returns void
   *
   * @example
   * ```typescript
   * const handleLogout = () => {
   *   logout();
   *   // User is now logged out, context will update automatically
   *   // Redirect to home page or login screen as needed
   * };
   * ```
   */
  logout: () => void;
}
