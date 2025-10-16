import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { hasRouteAccess, getRoleBasedRedirect } from "@/lib/roleUtils";
import { useQuery } from "@tanstack/react-query";
import { getUserApplications } from "@/lib/api";
import {
  checkEmailRequirement,
  isRouteAllowedWithEmailRequirement,
} from "@/lib/emailRequirement";
import EmailRequirementBlocker from "@/components/EmailRequirementBlocker";

const RoleProtectedRoute: React.FC<{
  children: React.ReactNode;
  role?: string;
}> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Fetch user applications to check email requirement (only for students)
  const { data: applicationsData, isLoading: appsLoading } = useQuery({
    queryKey: ["userApplications"],
    queryFn: getUserApplications,
    enabled: !!user && user.role === "student",
  });

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  const userRole = user?.role || "";
  const currentPath = location.pathname;

  // Check if user has route access based on role
  if (!hasRouteAccess(userRole, currentPath)) {
    return <Navigate to={getRoleBasedRedirect(userRole)} replace />;
  }

  // For student users, check if email update is required
  if (userRole === "student" && !appsLoading) {
    const applications = applicationsData?.applications || [];
    const { isEmailUpdateRequired } = checkEmailRequirement(user, applications);

    // If email update is required and user is not on an allowed route
    if (
      isEmailUpdateRequired &&
      !isRouteAllowedWithEmailRequirement(currentPath)
    ) {
      // Show blocker overlay instead of redirecting
      return (
        <>
          {children}
          <EmailRequirementBlocker />
        </>
      );
    }
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
