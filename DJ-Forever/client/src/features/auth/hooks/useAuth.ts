import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext'; // Adjust the path if needed

/**
 * Custom hook to access authentication state and actions.
 *
 * @returns {AuthContextType} The auth context value.
 * @throws {Error} If the hook is used outside of an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
