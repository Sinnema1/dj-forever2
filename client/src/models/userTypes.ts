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

export interface UserType {
  _id: string;
  fullName: string;
  email: string;
  isAdmin?: boolean;
  isInvited: boolean;
  hasRSVPed?: boolean;
  rsvpId?: string;
}

export interface AuthContextType {
  user: UserType | null;
  token?: string | null;
  isLoggedIn: boolean;
  loginWithQrToken: (qrToken: string) => Promise<void>;
  logout: () => void;
}
