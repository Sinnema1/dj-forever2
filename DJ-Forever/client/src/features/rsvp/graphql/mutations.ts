import { gql } from '@apollo/client';

/**
 * Create a new RSVP
 */
export const CREATE_RSVP = gql`
  mutation CreateRSVP(
    $fullName: String!
    $email: String!
    $attending: String!
    $guests: Int
    $notes: String
  ) {
    createRSVP(
      input: {
        fullName: $fullName
        email: $email
        attending: $attending
        guests: $guests
        notes: $notes
      }
    ) {
      _id
      fullName
      email
      attending
      guests
      notes
      createdAt
    }
  }
`;

/**
 * Update RSVP (optional if you allow edits)
 */
export const UPDATE_RSVP = gql`
  mutation UpdateRSVP(
    $id: ID!
    $fullName: String
    $email: String
    $attending: String
    $guests: Int
    $notes: String
  ) {
    updateRSVP(
      id: $id
      input: {
        fullName: $fullName
        email: $email
        attending: $attending
        guests: $guests
        notes: $notes
      }
    ) {
      _id
      fullName
      email
      attending
      guests
      notes
      createdAt
    }
  }
`;

/**
 * Delete RSVP (optional if you allow deletion)
 */
export const DELETE_RSVP = gql`
  mutation DeleteRSVP($id: ID!) {
    deleteRSVP(id: $id) {
      success
      message
    }
  }
`;

/**
 * Edit an existing RSVP
 */
export const EDIT_RSVP = gql`
  mutation EditRSVP($updates: RSVPInput!) {
    editRSVP(updates: $updates) {
      _id
      userId
      attending
      mealPreference
      allergies
      additionalNotes
      fullName
    }
  }
`;
