/**
 * Represents a user in the system.
 */
export interface UserType {
  _id: string;
  fullName: string;
  email: string;
  isAdmin?: boolean; // Optional: used if admin roles are supported
  isInvited: boolean;
}

/**
 * Shape of the authentication context for the React Context API.
 */
export interface AuthContextType {
  user: UserType | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerUser: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserInfo: (userData: Partial<UserType>) => void;
}

/**
 * Input type for creating a new user.
 */
export interface CreateUserInput {
  fullName: string;
  email: string;
  password: string;
}

/**
 * Input type for updating an existing user.
 */
export interface UpdateUserInput {
  fullName?: string;
  email?: string;
}
