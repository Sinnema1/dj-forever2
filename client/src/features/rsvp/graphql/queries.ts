import { gql } from "@apollo/client";

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
