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
}

export interface AuthContextType {
  user: UserType | null;
  token?: string | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerUser: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
}
