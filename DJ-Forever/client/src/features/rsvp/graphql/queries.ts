import { gql } from '@apollo/client';

/**
 * Get all RSVPs (Admin access or general list)
 */
export const GET_RSVPS = gql`
  query GetRSVPs {
    getRSVPs {
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

/**
 * Get a single RSVP by ID (if you need it somewhere)
 */
export const GET_RSVP_BY_ID = gql`
  query GetRSVPById($id: ID!) {
    getRSVPById(id: $id) {
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

/**
 * Get the current user's RSVP (if authenticated)
 */
export const GET_RSVP = gql`
  query GetRSVP {
    getRSVP {
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
