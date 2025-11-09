// client/src/context/AuthContext.tsx
/* eslint-disable react-refresh/only-export-components */
// This file exports both AuthContext and useAuth hook - a standard React pattern
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';
import { useMutation } from '@apollo/client/react/hooks';
import { LOGIN_WITH_QR_TOKEN } from '../features/auth/graphql/loginWithQrToken';
import { AuthContextType, UserType } from '../models/userTypes';
import { logInfo, logWarn } from '../utils/logger';
import {
  reportError,
  reportGraphQLError,
} from '../services/errorReportingService';

/**
 * React Context for authentication state management
 */
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

/** Storage key for JWT token persistence */
const STORAGE_TOKEN_KEY = 'id_token';
/** Storage key for user data persistence */
const STORAGE_USER_KEY = 'user';
/** Storage key for authentication version tracking */
const STORAGE_VERSION_KEY = 'auth_version';
/** Current authentication schema version for migration handling */
const CURRENT_AUTH_VERSION = '1.1'; // Increment when user schema changes

/**
 * Props interface for AuthProvider component
 */
interface AuthProviderProps {
  /** Child components that need access to authentication context */
  children: ReactNode;
}

/**
 * AuthProvider - Authentication Context Provider
 *
 * Provides centralized authentication state management for the application.
 * Handles user login/logout, token persistence, QR code authentication,
 * and automatic session restoration from local storage.
 *
 * @features
 * - **Token Management**: Secure JWT token storage and validation
 * - **QR Code Login**: Support for QR code-based authentication
 * - **Session Persistence**: Automatic session restoration on app reload
 * - **Version Migration**: Handles authentication schema migrations
 * - **Error Handling**: Comprehensive error reporting and logging
 * - **GraphQL Integration**: Seamless integration with Apollo Client
 * - **Type Safety**: Full TypeScript support with proper typing
 *
 * @example
 * ```tsx
 * // Wrap your app with AuthProvider
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 *
 * // Use authentication in components
 * const { user, login, logout, isLoading } = useAuth();
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (!user) return <LoginScreen />;
 * return <AuthenticatedApp />;
 * ```
 *
 * @dependencies
 * - `Apollo Client` - GraphQL mutations and queries
 * - `Local Storage` - Token and user data persistence
 * - `Error Reporting Service` - Error tracking and reporting
 * - `Logger Service` - Debug and info logging
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [loginWithQrTokenMutation] = useMutation(LOGIN_WITH_QR_TOKEN, {
    errorPolicy: 'all',
  });

  // Safe JSON parse helper
  const safeParseUser = (raw: string | null): UserType | null => {
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw);
      // Optional: quick shape check for expected fields
      if (parsed && typeof parsed === 'object') {
        return parsed as UserType;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Initial load from storage
  useEffect(() => {
    const initializeAuth = () => {
      const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
      const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
      const storedUser = safeParseUser(localStorage.getItem(STORAGE_USER_KEY));

      // Clear cache if version mismatch (e.g., when we add new user fields)
      if (storedVersion !== CURRENT_AUTH_VERSION) {
        logInfo(
          'Auth version mismatch, clearing cached user data',
          'AuthContext'
        );
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
          logWarn(
            'Stored token validation failed, clearing auth state',
            'AuthContext'
          );
          reportError(error as Error, {
            component: 'AuthContext',
            action: 'token_validation',
          });
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
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const loginWithQrToken = useCallback(
    async (qrToken: string) => {
      try {
        const { data, errors } = await loginWithQrTokenMutation({
          variables: { qrToken },
        });

        if (errors?.length) {
          const firstError = errors[0];
          const errorMessage = firstError?.message || 'QR Login failed.';

          if (firstError?.message) {
            reportGraphQLError(
              { message: firstError.message },
              'loginWithQrToken',
              {
                qrToken: '[REDACTED]',
              }
            );
          }
          throw new Error(errorMessage);
        }

        const authToken: string | undefined = data?.loginWithQrToken?.token;
        const authUser: UserType | undefined = data?.loginWithQrToken?.user;
        if (!authToken || !authUser) {
          const error = new Error('Invalid QR login response.');
          reportError(error, {
            component: 'AuthContext',
            action: 'loginWithQrToken',
            data: { hasToken: !!authToken, hasUser: !!authUser },
          });
          throw error;
        }

        setToken(authToken);
        setUser(authUser);
        localStorage.setItem(STORAGE_TOKEN_KEY, authToken);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(authUser));
        localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_AUTH_VERSION);
      } catch (err: unknown) {
        if (err instanceof Error) {
          reportError(err, {
            component: 'AuthContext',
            action: 'loginWithQrToken',
          });
          throw new Error(err.message || 'QR Login failed.');
        }
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

/**
 * useAuth - Authentication Hook
 *
 * Custom React hook that provides access to authentication state and methods.
 * Must be used within an AuthProvider component tree.
 *
 * @returns {AuthContextType} Authentication context containing:
 * - `user`: Current authenticated user or null
 * - `token`: JWT authentication token or null
 * - `isLoggedIn`: Boolean indicating authentication status
 * - `isLoading`: Boolean indicating if auth check is in progress
 * - `loginWithQrToken`: Function to authenticate using QR token
 * - `logout`: Function to clear authentication and logout user
 *
 * @throws {Error} Throws error if used outside of AuthProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isLoggedIn, logout } = useAuth();
 *
 *   if (!isLoggedIn) {
 *     return <LoginPrompt />;
 *   }
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {user?.fullName}!</h1>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
