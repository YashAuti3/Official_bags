import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppAuth } from '../../context/AuthContext';

/**
 * Wraps admin routes. Redirects to /login if user is not logged in,
 * or to / if user is logged in but is not an admin.
 */
export default function ProtectedRoute() {
  const { isLoggedIn, isAdmin, loading } = useAppAuth();


  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
