import { gql } from "@apollo/client";

export const LOGIN_WITH_QR_TOKEN = gql`
  mutation loginWithQrToken($qrToken: String!) {
    loginWithQrToken(qrToken: $qrToken) {
      token
      user {
        _id
        fullName
        email
        isInvited
        qrToken
        hasRSVPed
      }
    }
  }
`;
