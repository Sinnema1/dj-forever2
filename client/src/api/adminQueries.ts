import { gql } from '@apollo/client';

// Admin Statistics Query
export const GET_ADMIN_STATS = gql`
  query GetAdminStats {
    adminGetUserStats {
      totalUsers
      invitedUsers
      rsvpedUsers
      attendingUsers
      totalGuests
      attendingGuests
      mealPreferences {
        mealType
        count
      }
    }
  }
`;

// Admin RSVP List Query
export const GET_ADMIN_RSVPS = gql`
  query GetAdminRSVPs {
    adminGetAllRSVPs {
      _id
      fullName
      email
      isInvited
      isAdmin
      hasRSVPed
      rsvp {
        _id
        attending
        guestCount
        guests {
          fullName
          mealPreference
        }
        dietaryRestrictions
        songRequests
        specialAccommodations
        createdAt
        updatedAt
      }
    }
  }
`;

// Admin Guest List Export Query
export const EXPORT_GUEST_LIST = gql`
  query ExportGuestList {
    adminExportGuestList
  }
`;

// Admin Update RSVP Mutation
export const ADMIN_UPDATE_RSVP = gql`
  mutation AdminUpdateRSVP($rsvpId: ID!, $updates: AdminRSVPUpdateInput!) {
    adminUpdateRSVP(rsvpId: $rsvpId, updates: $updates) {
      _id
      attending
      guestCount
      guests {
        fullName
        mealPreference
      }
      dietaryRestrictions
      songRequests
      specialAccommodations
    }
  }
`;

// Admin Update User Mutation
export const ADMIN_UPDATE_USER = gql`
  mutation AdminUpdateUser($userId: ID!, $updates: AdminUserUpdateInput!) {
    adminUpdateUser(userId: $userId, updates: $updates) {
      _id
      fullName
      email
      isInvited
      isAdmin
      hasRSVPed
    }
  }
`;

// Admin Delete RSVP Mutation
export const ADMIN_DELETE_RSVP = gql`
  mutation AdminDeleteRSVP($rsvpId: ID!) {
    adminDeleteRSVP(rsvpId: $rsvpId)
  }
`;
