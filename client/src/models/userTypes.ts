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
 *   fullName: 'Alice Johnson',
 *   email: 'alice@example.com',
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
  | 'family'
  | 'friends'
  | 'work'
  | 'extended_family'
  | 'bridal_party'
  | 'grooms_party'
  | 'other';

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
