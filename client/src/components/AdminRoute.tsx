import React, { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * AdminRoute - Protected route component for admin-only access.
 * Redirects non-admin users to the homepage with clear feedback messages.
 * Shows toast notifications explaining why access was denied.
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const { showError, showWarning } = useToast();
  const hasShownToast = useRef(false);

  // Show feedback when redirecting user
  useEffect(() => {
    if (isLoading || hasShownToast.current) {
      return;
    }

    if (!user) {
      hasShownToast.current = true;
      showError('Please log in to access the admin dashboard.');
    } else if (user && !user.isAdmin) {
      hasShownToast.current = true;
      showWarning("You don't have permission to access this page.");
    }
  }, [user, isLoading, showError, showWarning]);

  if (isLoading) {
    return (
      <div className="admin-route-loading">
        <div className="loading-spinner" aria-hidden />
        <p>Verifying admin access...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!user.isAdmin) {
    // Redirect non-admin users to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
