export const typeDefs = `
  enum AttendanceStatus {
    YES
    NO
    MAYBE
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

  type Query {
    me: User
    getRSVP: RSVP
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
    # Legacy mutation for backward compatibility
    submitRSVP(
      attending: AttendanceStatus!
      mealPreference: String!
      allergies: String
      additionalNotes: String
    ): RSVP
  }
`;
