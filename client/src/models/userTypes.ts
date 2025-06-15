// Example type for User
export interface User {
  id: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
  hasRSVPed: boolean;
  rsvpId?: string;
  isInvited: boolean;
}
