/**
 * Get the appropriate redirect URL based on user role
 * @param role - The user's role
 * @returns The redirect URL for the role
 */
export const getRoleBasedRedirect = (role: string): string => {
  switch (role) {
    case "student":
      return "/student-dashboard";
    case "hr":
      return "/hr-dashboard";
    case "office":
      return "/office-dashboard";
    default:
      return "/student-dashboard"; // Default to student dashboard
  }
};

/**
 * Check if a user has access to a specific route based on their role
 * @param userRole - The user's role
 * @param route - The route to check access for
 * @returns Whether the user has access to the route
 */
export const hasRouteAccess = (userRole: string, route: string): boolean => {
  const commonRoutes = ["/profile", "/notifications"];

  const roleRoutes: Record<string, string[]> = {
    student: [
      "/student-dashboard",
      "/requirements",
      "/dtr",
      "/schedule",
      "/grades",
      "/application",
      "/re-apply",
      "/leave",
      ...commonRoutes,
    ],
    hr: ["/hr-dashboard", "/applications", ...commonRoutes],
    office: ["/office-dashboard", ...commonRoutes],
  };

  return (
    roleRoutes[userRole as keyof typeof roleRoutes]?.includes(route) || false
  );
};
