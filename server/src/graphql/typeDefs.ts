/**
 * @fileoverview GraphQL Schema Type Definitions for DJ Forever 2 Wedding Website
 * @module graphql/typeDefs
 * @version 1.0.0
 *
 * Complete GraphQL schema definition using Schema Definition Language (SDL).
 * Defines all types, enums, inputs, queries, and mutations for the wedding website API.
 * Implements QR-based authentication system with comprehensive RSVP management including
 * multi-guest support and legacy compatibility for seamless data migration.
 *
 * Schema Features:
 * - QR-only authentication (no password fields in User type)
 * - Multi-guest RSVP support with individual preferences
 * - Legacy single-guest compatibility for backward compatibility
 * - Comprehensive user profile with invitation and RSVP status
 * - Flexible guest management with meal preferences and allergies
 *
 * Type Safety:
 * - All fields properly typed with GraphQL scalar types
 * - Non-null fields marked with ! for required data
 * - Optional fields for flexible data entry
 * - Enum types for controlled vocabulary (AttendanceStatus)
 *
 * Authentication Model:
 * - User.qrToken: Unique token embedded in QR codes for authentication
 * - AuthPayload: JWT token + user data returned from login mutations
 * - No password fields - authentication is QR-code only
 *
 * Legacy Compatibility:
 * - RSVP type includes both new guest array and legacy single-guest fields
 * - CreateRSVPInput and RSVPInput support both formats
 * - submitRSVP mutation maintains backward compatibility
 *
 * @example
 * // Query Examples:
 * // query { me { fullName email hasRSVPed qrToken } }
 * // query { getRSVP { attending guests { fullName mealPreference } } }
 *
 * @example
 * // Mutation Examples:
 * // mutation { loginWithQrToken(qrToken: "abc123") { token user { fullName } } }
 * // mutation { createRSVP(input: { attending: YES, guests: [...] }) { _id } }
 *
 * @see ../models/User.ts - Mongoose User model implementation
 * @see ../models/RSVP.ts - Mongoose RSVP model implementation
 * @see ./resolvers.ts - GraphQL resolver implementations
 */

/**
 * Complete GraphQL schema definition in Schema Definition Language (SDL) format.
 * Exported as template literal string for Apollo Server configuration.
 *
 * @const {string} typeDefs - GraphQL schema definition
 */
export const typeDefs = `
  """Attendance status enumeration for RSVP responses. Used to track guest attendance intentions."""
  enum AttendanceStatus {
    """Confirmed attendance - guest will attend the wedding"""
    YES
    """Declined attendance - guest will not attend the wedding"""
    NO
    """Uncertain attendance - guest is unsure about attendance"""
    MAYBE
  }

  """Guest group classification for invitation management and personalization"""
  enum GuestGroup {
    """Groom's family members"""
    grooms_family
    """Close friends"""
    friends
    """Bride's family members"""
    brides_family
    """Extended family members"""
    extended_family
    """Other guests"""
    other
  }

  type User {
    _id: ID!
    fullName: String!
    email: String!
    isAdmin: Boolean!
    hasRSVPed: Boolean!
    rsvpId: ID
    rsvp: RSVP
    isInvited: Boolean!
    qrToken: String!
    relationshipToBride: String
    relationshipToGroom: String
    customWelcomeMessage: String
    guestGroup: GuestGroup
    plusOneAllowed: Boolean!
    personalPhoto: String
  }

  type Guest {
    fullName: String!
    mealPreference: String!
    allergies: String
  }

  type RSVP {
    _id: ID!
    userId: ID!
    attending: AttendanceStatus!
    guestCount: Int
    guests: [Guest!]
    additionalNotes: String
    # Legacy fields for backward compatibility
    fullName: String
    mealPreference: String
    allergies: String
  }

  type AuthPayload {
    token: String!
    user: User
  }

  input GuestInput {
    fullName: String!
    mealPreference: String!
    allergies: String
  }

  input CreateRSVPInput {
    attending: AttendanceStatus!
    guestCount: Int
    guests: [GuestInput!]
    additionalNotes: String
    # Legacy fields for backward compatibility
    fullName: String
    mealPreference: String
    allergies: String
  }

  input RSVPInput {
    attending: AttendanceStatus
    guestCount: Int
    guests: [GuestInput!]
    additionalNotes: String
    # Legacy fields for backward compatibility
    fullName: String
    mealPreference: String
    allergies: String
  }

  """Administrative statistics for wedding planning and guest management"""
  type AdminStats {
    """Total number of invited guests"""
    totalInvited: Int!
    """Number of guests who have submitted RSVPs"""
    totalRSVPed: Int!
    """Number of guests attending (YES responses)"""
    totalAttending: Int!
    """Number of guests not attending (NO responses)"""
    totalNotAttending: Int!
    """Number of guests with uncertain attendance (MAYBE responses)"""
    totalMaybe: Int!
    """Percentage of invited guests who have RSVPed"""
    rsvpPercentage: Float!
    """Breakdown of meal preferences for catering"""
    mealPreferences: [MealPreferenceCount!]!
    """Dietary restrictions and allergies summary"""
    dietaryRestrictions: [String!]!
  }

  """Meal preference count for catering planning"""
  type MealPreferenceCount {
    preference: String!
    count: Int!
  }

  """Enhanced user data for admin management"""
  type AdminUser {
    _id: ID!
    fullName: String!
    email: String!
    isAdmin: Boolean!
    hasRSVPed: Boolean!
    isInvited: Boolean!
    qrToken: String!
    rsvp: RSVP
    """Date when user was created/invited"""
    createdAt: String
    """Date of last RSVP update"""
    lastUpdated: String
    """Personalization fields"""
    relationshipToBride: String
    relationshipToGroom: String
    customWelcomeMessage: String
    guestGroup: GuestGroup
    plusOneAllowed: Boolean
    personalPhoto: String
  }

  """Input for updating user details from admin interface"""
  input AdminUserUpdateInput {
    fullName: String
    email: String
    isInvited: Boolean
  }

  """Input for updating user personalization fields"""
  input UserPersonalizationInput {
    relationshipToBride: String
    relationshipToGroom: String
    customWelcomeMessage: String
    guestGroup: GuestGroup
    plusOneAllowed: Boolean
    personalPhoto: String
  }

  """Input for admin RSVP updates"""
  input AdminRSVPUpdateInput {
    attending: AttendanceStatus
    guestCount: Int
    guests: [GuestInput!]
    additionalNotes: String
  }

  """Input for creating a new user from admin interface"""
  input AdminCreateUserInput {
    fullName: String!
    email: String!
    isInvited: Boolean!
  }

  type Query {
    me: User
    getRSVP: RSVP
    
    """Admin-only queries for wedding management"""
    adminGetAllRSVPs: [AdminUser!]!
    adminGetUserStats: AdminStats!
    adminGetGuestList: [AdminUser!]!
    adminExportGuestList: String!
    
    """Email system queries for admin"""
    emailPreview(userId: ID!, template: String!): EmailPreview!
    emailSendHistory(limit: Int, status: String): [EmailJobHistory!]!
  }

  type Mutation {
    registerUser(
      fullName: String!
      email: String!
      qrToken: String!
    ): AuthPayload
    loginWithQrToken(qrToken: String!): AuthPayload
    createRSVP(input: CreateRSVPInput!): RSVP
    editRSVP(updates: RSVPInput!): RSVP
    
    """Admin-only mutations for wedding management"""
    adminCreateUser(input: AdminCreateUserInput!): AdminUser!
    adminUpdateRSVP(userId: ID!, input: AdminRSVPUpdateInput!): RSVP!
    adminUpdateUser(userId: ID!, input: AdminUserUpdateInput!): AdminUser!
    adminUpdateUserPersonalization(userId: ID!, input: UserPersonalizationInput!): User!
    adminDeleteUser(userId: ID!): Boolean!
    adminDeleteRSVP(userId: ID!): Boolean!
    
    # Email reminder mutations
    adminSendReminderEmail(userId: ID!): EmailResult!
    adminSendBulkReminderEmails(userIds: [ID!]): BulkEmailResult!
    adminSendReminderToAllPending: BulkEmailResult!
    
    # Legacy mutation for backward compatibility
    submitRSVP(
      attending: AttendanceStatus!
      mealPreference: String!
      allergies: String
      additionalNotes: String
    ): RSVP
  }
  
  # Email operation result types
  type EmailResult {
    success: Boolean!
    email: String!
    error: String
  }
  
  type BulkEmailResult {
    totalSent: Int!
    successCount: Int!
    failureCount: Int!
    results: [EmailResult!]!
  }
  
  # Email preview type
  type EmailPreview {
    subject: String!
    htmlContent: String!
    to: String!
    template: String!
  }
  
  # Email job history for admin visibility
  type EmailJobHistory {
    _id: ID!
    userId: ID!
    userEmail: String!
    userName: String!
    template: String!
    status: String!
    attempts: Int!
    lastError: String
    createdAt: String!
    sentAt: String
  }
`;
