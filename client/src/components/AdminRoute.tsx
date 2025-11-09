import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * AdminRoute - Protected route component for admin-only access.
 * Redirects non-admin users to the homepage with error message.
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="admin-route-loading">
        <div className="loading-spinner" />
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
