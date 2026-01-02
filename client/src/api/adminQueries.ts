import { gql } from '@apollo/client';

// Admin Statistics Query
export const GET_ADMIN_STATS = gql`
  query GetAdminStats {
    adminGetUserStats {
      totalInvited
      totalRSVPed
      totalAttending
      totalNotAttending
      totalMaybe
      rsvpPercentage
      mealPreferences {
        preference
        count
      }
      dietaryRestrictions
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
      qrToken
      relationshipToBride
      relationshipToGroom
      customWelcomeMessage
      guestGroup
      plusOneAllowed
      personalPhoto
      specialInstructions
      dietaryRestrictions
      householdMembers {
        firstName
        lastName
        relationshipToBride
        relationshipToGroom
      }
      createdAt
      lastUpdated
      rsvp {
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
  mutation AdminUpdateRSVP($userId: ID!, $input: AdminRSVPUpdateInput!) {
    adminUpdateRSVP(userId: $userId, input: $input) {
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

// Admin Update User Personalization Mutation
export const UPDATE_USER_PERSONALIZATION = gql`
  mutation UpdateUserPersonalization(
    $userId: ID!
    $input: UserPersonalizationInput!
  ) {
    adminUpdateUserPersonalization(userId: $userId, input: $input) {
      _id
      fullName
      email
      relationshipToBride
      relationshipToGroom
      customWelcomeMessage
      guestGroup
      plusOneAllowed
      personalPhoto
      specialInstructions
      dietaryRestrictions
      householdMembers {
        firstName
        lastName
        relationshipToBride
        relationshipToGroom
      }
    }
  }
`;

// Admin Delete RSVP Mutation
export const ADMIN_DELETE_RSVP = gql`
  mutation AdminDeleteRSVP($userId: ID!) {
    adminDeleteRSVP(userId: $userId)
  }
`;

// Admin Create User Mutation
export const ADMIN_CREATE_USER = gql`
  mutation AdminCreateUser($input: AdminCreateUserInput!) {
    adminCreateUser(input: $input) {
      _id
      fullName
      email
      isInvited
      isAdmin
      hasRSVPed
      qrToken
      createdAt
    }
  }
`;

// Admin Delete User Mutation
export const ADMIN_DELETE_USER = gql`
  mutation AdminDeleteUser($userId: ID!) {
    adminDeleteUser(userId: $userId)
  }
`;

// Admin Bulk Update Personalization Mutation
export const ADMIN_BULK_UPDATE_PERSONALIZATION = gql`
  mutation AdminBulkUpdatePersonalization(
    $updates: [BulkPersonalizationInput!]!
  ) {
    adminBulkUpdatePersonalization(updates: $updates) {
      success
      created
      updated
      failed
      errors {
        email
        error
      }
    }
  }
`;

// Admin Email Reminder Mutations
export const ADMIN_SEND_REMINDER_EMAIL = gql`
  mutation AdminSendReminderEmail($userId: ID!) {
    adminSendReminderEmail(userId: $userId) {
      success
      email
      error
    }
  }
`;

export const ADMIN_SEND_BULK_REMINDER_EMAILS = gql`
  mutation AdminSendBulkReminderEmails($userIds: [ID!]!) {
    adminSendBulkReminderEmails(userIds: $userIds) {
      totalSent
      successCount
      failureCount
      results {
        success
        email
        error
      }
    }
  }
`;

export const ADMIN_SEND_REMINDER_TO_ALL_PENDING = gql`
  mutation AdminSendReminderToAllPending {
    adminSendReminderToAllPending {
      totalSent
      successCount
      failureCount
      results {
        success
        email
        error
      }
    }
  }
`;

// Admin Email Preview Query
export const ADMIN_EMAIL_PREVIEW = gql`
  query AdminEmailPreview($userId: ID!, $template: String!) {
    emailPreview(userId: $userId, template: $template) {
      subject
      htmlContent
      to
      template
    }
  }
`;

// Admin Email Send History Query
export const ADMIN_EMAIL_SEND_HISTORY = gql`
  query AdminEmailSendHistory($limit: Int, $status: String) {
    emailSendHistory(limit: $limit, status: $status) {
      _id
      userId
      userEmail
      userName
      template
      status
      attempts
      lastError
      createdAt
      sentAt
    }
  }
`;
