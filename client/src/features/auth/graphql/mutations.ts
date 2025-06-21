import { gql } from "@apollo/client";

export const LOGIN_USER = gql`
  mutation loginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        _id
        fullName
        email
        isInvited
      }
    }
  }
`;

export const REGISTER_USER = gql`
  mutation registerUser(
    $fullName: String!
    $email: String!
    $password: String!
  ) {
    registerUser(fullName: $fullName, email: $email, password: $password) {
      token
      user {
        _id
        fullName
        email
        isInvited
      }
    }
  }
`;
