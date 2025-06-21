import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface InvitedRouteProps {
  children: React.ReactElement;
}

const InvitedRoute: React.FC<InvitedRouteProps> = ({ children }) => {
  const auth = useAuth();

  // If we're still loading user info, you could return a spinner
  // if (!auth?.user) return <div>Loading...</div>;

  if (!auth?.user?.isInvited) {
    // Not invited → redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default InvitedRoute;
