// client/src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import { useMutation } from "@apollo/client";
import { LOGIN_WITH_QR_TOKEN } from "../features/auth/graphql/loginWithQrToken";
import { AuthContextType, UserType } from "../models/userTypes";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const STORAGE_TOKEN_KEY = "id_token";
const STORAGE_USER_KEY = "user";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [loginWithQrTokenMutation] = useMutation(LOGIN_WITH_QR_TOKEN, {
    errorPolicy: "all",
  });

  // Safe JSON parse helper
  const safeParseUser = (raw: string | null): UserType | null => {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      // Optional: quick shape check for expected fields
      if (parsed && typeof parsed === "object") return parsed as UserType;
      return null;
    } catch {
      return null;
    }
  };

  // Initial load from storage
  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
    const storedUser = safeParseUser(localStorage.getItem(STORAGE_USER_KEY));
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    } else {
      // Clean up any partial/legacy state so UI doesn’t get confused
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_USER_KEY);
    }
    setIsLoading(false);
  }, []);

  // Keep tabs/PWA windows in sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_TOKEN_KEY || e.key === STORAGE_USER_KEY) {
        const newToken = localStorage.getItem(STORAGE_TOKEN_KEY);
        const newUser = safeParseUser(localStorage.getItem(STORAGE_USER_KEY));
        setToken(newToken);
        setUser(newUser);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const loginWithQrToken = useCallback(
    async (qrToken: string) => {
      try {
        const { data, errors } = await loginWithQrTokenMutation({
          variables: { qrToken },
        });

        if (errors?.length) {
          throw new Error(errors[0].message || "QR Login failed.");
        }

        const authToken: string | undefined = data?.loginWithQrToken?.token;
        const authUser: UserType | undefined = data?.loginWithQrToken?.user;
        if (!authToken || !authUser) {
          throw new Error("Invalid QR login response.");
        }

        setToken(authToken);
        setUser(authUser);
        localStorage.setItem(STORAGE_TOKEN_KEY, authToken);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(authUser));
      } catch (err: unknown) {
        if (err instanceof Error) throw new Error(err.message || "QR Login failed.");
        throw err;
      }
    },
    [loginWithQrTokenMutation]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    // If you use Apollo auth links, consider resetting the store here.
    // apolloClient?.clearStore?.();
  }, []);

  const isLoggedIn = !!token && !!user;

  const value = useMemo(
    () => ({ user, token, isLoggedIn, isLoading, loginWithQrToken, logout }),
    [user, token, isLoggedIn, isLoading, loginWithQrToken, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};