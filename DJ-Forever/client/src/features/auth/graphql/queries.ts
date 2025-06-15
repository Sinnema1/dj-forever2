import { gql } from '@apollo/client';

/**
 * Query to fetch the current logged-in user's profile.
 */
export const GET_ME = gql`
  query GetMe {
    me {
      _id
      email
      fullName
      isAdmin
    }
  }
`;
