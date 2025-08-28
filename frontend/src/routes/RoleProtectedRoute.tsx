import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { hasRouteAccess, getRoleBasedRedirect } from "@/lib/roleUtils";

const RoleProtectedRoute: React.FC<{
  children: React.ReactNode;
  role?: string;
}> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  const userRole = user?.role || "";
  const currentPath = location.pathname;

  // Allow access if role utility says so
  if (hasRouteAccess(userRole, currentPath)) {
    return <>{children}</>;
  }

  // Otherwise redirect to their dashboard
  return <Navigate to={getRoleBasedRedirect(userRole)} replace />;
};

export default RoleProtectedRoute;
