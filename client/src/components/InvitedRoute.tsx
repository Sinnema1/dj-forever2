import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import QRPrompt from "./QRPrompt";

interface InvitedRouteProps {
  children: React.ReactElement;
}

const InvitedRoute: React.FC<InvitedRouteProps> = ({ children }) => {
  const auth = useAuth();

  // If not logged in, show QR prompt
  if (!auth?.isLoggedIn) {
    return <QRPrompt />;
  }

  // If logged in but not invited, redirect to home
  if (!auth?.user?.isInvited) {
    return <Navigate to="/" replace />;
  }

  // User is logged in and invited, show the protected content
  return children;
};

export default InvitedRoute;
