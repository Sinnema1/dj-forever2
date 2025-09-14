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
const STORAGE_VERSION_KEY = "auth_version";
const CURRENT_AUTH_VERSION = "1.1"; // Increment when user schema changes

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
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
    const initializeAuth = async () => {
      const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
      const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
      const storedUser = safeParseUser(localStorage.getItem(STORAGE_USER_KEY));

      // Clear cache if version mismatch (e.g., when we add new user fields)
      if (storedVersion !== CURRENT_AUTH_VERSION) {
        console.log("Auth version mismatch, clearing cached user data");
        localStorage.removeItem(STORAGE_TOKEN_KEY);
        localStorage.removeItem(STORAGE_USER_KEY);
        localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_AUTH_VERSION);
        setIsLoading(false);
        return;
      }

      if (storedToken && storedUser) {
        // Set user immediately for faster UI response
        setToken(storedToken);
        setUser(storedUser);

        // Validate token in background (optional - for extra security)
        try {
          // You could add a quick token validation query here
          // const { data } = await validateToken(storedToken);
          // if (!data.valid) throw new Error('Invalid token');
        } catch (error) {
          // Token is invalid, clear auth state
          console.warn("Stored token validation failed, clearing auth state");
          localStorage.removeItem(STORAGE_TOKEN_KEY);
          localStorage.removeItem(STORAGE_USER_KEY);
          setToken(null);
          setUser(null);
        }
      } else {
        // Clean up any partial/legacy state so UI doesn't get confused
        localStorage.removeItem(STORAGE_TOKEN_KEY);
        localStorage.removeItem(STORAGE_USER_KEY);
      }

      setIsLoading(false);
    };

    initializeAuth();
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
        localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_AUTH_VERSION);
      } catch (err: unknown) {
        if (err instanceof Error)
          throw new Error(err.message || "QR Login failed.");
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
