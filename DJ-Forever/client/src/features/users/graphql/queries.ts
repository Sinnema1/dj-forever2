import { gql } from '@apollo/client';

export const GET_USERS = gql`
  query GetUsers {
    getUsers {
      _id
      fullName
      email
      isAdmin
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query GetUserById($id: ID!) {
    getUserById(id: $id) {
      _id
      fullName
      email
      isAdmin
    }
  }
`;

export const GET_ME = gql`
  query Me {
    me {
      _id
      fullName
      email
      isAdmin
      hasRSVPed
      rsvpId
      isInvited
    }
  }
`;
