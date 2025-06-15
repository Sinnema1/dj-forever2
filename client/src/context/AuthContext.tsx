import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useMutation } from "@apollo/client";
import { LOGIN_USER, REGISTER_USER } from "../features/auth/graphql/mutations";
import { AuthContextType, UserType } from "../models/userTypes";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [loginMutation] = useMutation(LOGIN_USER);
  const [registerMutation] = useMutation(REGISTER_USER);

  useEffect(() => {
    const storedToken = localStorage.getItem("id_token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await loginMutation({ variables: { email, password } });
      const authToken: string = data?.loginUser?.token;
      const authUser: UserType = data?.loginUser?.user;
      if (!authToken || !authUser) throw new Error("Invalid login response.");
      setToken(authToken);
      setUser(authUser);
      localStorage.setItem("id_token", authToken);
      localStorage.setItem("user", JSON.stringify(authUser));
    } catch (error: unknown) {
      if (error instanceof Error)
        throw new Error(error.message || "Login failed.");
      throw error;
    }
  };

  const registerUser = async (
    fullName: string,
    email: string,
    password: string
  ) => {
    try {
      const { data } = await registerMutation({
        variables: { fullName, email, password },
      });
      const authToken: string = data?.registerUser?.token;
      const authUser: UserType = data?.registerUser?.user;
      if (!authToken || !authUser)
        throw new Error("Invalid registration response.");
      setToken(authToken);
      setUser(authUser);
      localStorage.setItem("id_token", authToken);
      localStorage.setItem("user", JSON.stringify(authUser));
    } catch (error: unknown) {
      if (error instanceof Error)
        throw new Error(error.message || "Registration failed.");
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("id_token");
    localStorage.removeItem("user");
  };

  const isLoggedIn = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{ user, token, isLoggedIn, login, registerUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
