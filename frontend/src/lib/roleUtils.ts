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
    hr: [
      "/hr-dashboard",
      "/hr/analytics",
      "/hr/requirements",
      "/hr/evaluations",
      "/hr/users",
      "/applications",
      "/reapplications",
      "/leave-management",
      ...commonRoutes,
    ],
    office: [
      "/office-dashboard",
      "/office/dtr",
      "/office/evaluation",
      ...commonRoutes,
    ],
  };

  const allowed = roleRoutes[userRole as keyof typeof roleRoutes] || [];

  // Normalize helper: remove trailing slash (unless it's just '/')
  const normalize = (p: string) => (p === "/" ? p : p.replace(/\/+$/g, ""));
  const rNorm = normalize(route);

  for (const a of allowed) {
    const aNorm = normalize(a);
    if (aNorm === rNorm) return true;
    // allow prefix matches (e.g. /hr/analytics/stats should match /hr/analytics)
    if (rNorm.startsWith(aNorm + "/")) return true;
  }

  return false;
};
