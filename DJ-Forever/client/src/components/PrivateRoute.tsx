import React, { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }: { children: ReactElement }) => {
  const { isLoggedIn, user } = useAuth(); // Check both isLoggedIn and user

  if (!isLoggedIn || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
