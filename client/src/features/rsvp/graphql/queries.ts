import { gql } from '@apollo/client/core';

export const GET_RSVP = gql`
  query GetRSVP {
    getRSVP {
      _id
      userId
      attending
      guestCount
      guests {
        fullName
        mealPreference
        allergies
      }
      additionalNotes
      # Legacy fields for backward compatibility
      fullName
      mealPreference
      allergies
    }
  }
`;
