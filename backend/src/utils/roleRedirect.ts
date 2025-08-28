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
