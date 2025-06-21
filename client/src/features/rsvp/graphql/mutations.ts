import { gql } from "@apollo/client";

export const CREATE_RSVP = gql`
  mutation CreateRSVP($input: RSVPInput!) {
    createRSVP(input: $input) {
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
