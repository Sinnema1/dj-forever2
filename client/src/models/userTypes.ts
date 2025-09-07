// Canonical user shape (match your GraphQL response which uses `_id`)
export interface User {
  _id: string;
  fullName: string;
  email: string;
  isInvited: boolean;
  isAdmin?: boolean;
  hasRSVPed?: boolean;
  rsvpId?: string | null;
}

// Keep the existing name to avoid touching imports elsewhere
export type UserType = User;

export interface AuthContextType {
  user: User | null;
  token: string | null;         // required, but can be null
  isLoggedIn: boolean;
  isLoading: boolean;
  loginWithQrToken: (qrToken: string) => Promise<void>;
  logout: () => void;
}