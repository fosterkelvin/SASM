// src/routes/ProtectedRoute.tsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getRoleBasedRedirect } from "@/lib/roleUtils";

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If not authenticated, send to signin
  if (!isAuthenticated) return <Navigate to="/signin" replace />;

  // Authenticated users should land on their role-based dashboard
  return <Navigate to={getRoleBasedRedirect(user?.role)} replace />;
};

export default ProtectedRoute;
