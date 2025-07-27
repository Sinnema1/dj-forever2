import { gql } from "apollo-server-express";

export const typeDefs = gql`
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

  type RSVP {
    _id: ID!
    userId: ID!
    attending: AttendanceStatus!
    mealPreference: String!
    allergies: String
    additionalNotes: String
    fullName: String!
  }

  type AuthPayload {
    token: String!
    user: User
  }

  input RSVPInput {
    attending: AttendanceStatus
    mealPreference: String
    allergies: String
    additionalNotes: String
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
    submitRSVP(
      attending: AttendanceStatus!
      mealPreference: String!
      allergies: String
      additionalNotes: String
    ): RSVP
    editRSVP(updates: RSVPInput!): RSVP
  }
`;
