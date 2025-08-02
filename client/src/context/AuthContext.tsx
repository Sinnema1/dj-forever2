import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useMutation } from "@apollo/client";
import { LOGIN_WITH_QR_TOKEN } from "../features/auth/graphql/loginWithQrToken";
import { AuthContextType, UserType } from "../models/userTypes";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [loginWithQrTokenMutation] = useMutation(LOGIN_WITH_QR_TOKEN);

  useEffect(() => {
    const storedToken = localStorage.getItem("id_token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const loginWithQrToken = async (qrToken: string) => {
    try {
      const { data } = await loginWithQrTokenMutation({
        variables: { qrToken },
      });
      const authToken: string = data?.loginWithQrToken?.token;
      const authUser: UserType = data?.loginWithQrToken?.user;
      if (!authToken || !authUser)
        throw new Error("Invalid QR login response.");
      setToken(authToken);
      setUser(authUser);
      localStorage.setItem("id_token", authToken);
      localStorage.setItem("user", JSON.stringify(authUser));
    } catch (error: unknown) {
      if (error instanceof Error)
        throw new Error(error.message || "QR Login failed.");
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
      value={{ user, token, isLoggedIn, loginWithQrToken, logout }}
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
