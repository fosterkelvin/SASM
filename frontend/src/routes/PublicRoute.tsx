// src/routes/PublicRoute.tsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getRoleBasedRedirect } from "@/lib/roleUtils";

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return !isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to={getRoleBasedRedirect(user?.role)} replace />
  );
};

export default PublicRoute;
