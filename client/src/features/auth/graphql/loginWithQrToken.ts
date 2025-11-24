import { gql } from '@apollo/client/core';

export const LOGIN_WITH_QR_TOKEN = gql`
  mutation loginWithQrToken($qrToken: String!) {
    loginWithQrToken(qrToken: $qrToken) {
      token
      user {
        _id
        fullName
        email
        isInvited
        isAdmin
        qrToken
        hasRSVPed
        relationshipToBride
        relationshipToGroom
        customWelcomeMessage
        guestGroup
        plusOneAllowed
        personalPhoto
      }
    }
  }
`;
