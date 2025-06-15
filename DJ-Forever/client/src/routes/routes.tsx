import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout
import AppLayout from '../components/layout/AppLayout';

// Public pages
import Home from '../pages/Home';
import ErrorPage from '../pages/Error';

// Features
import Login from '../features/auth/components/Login';
import Register from '../features/auth/components/Register';
import Profile from '../features/users/pages/Profile';
import RSVP from '../features/rsvp/pages/RSVP';

// Dashboard
import Dashboard from '../features/dashboard/pages/Dashboard';

// Components
import PrivateRoute from '../components/PrivateRoute';

/**
 * AppRoutes defines all routes and applies the AppLayout as a wrapper.
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Wrap all routes with AppLayout */}
      <Route path="/" element={<AppLayout />}>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="rsvp"
          element={
            <PrivateRoute>
              <RSVP />
            </PrivateRoute>
          }
        />

        {/* Catch-all route for undefined paths */}
        <Route path="*" element={<ErrorPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
