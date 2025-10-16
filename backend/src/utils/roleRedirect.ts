/**
 * Get the appropriate redirect URL based on user role
 * @param role - The user's role
 * @param isSubUser - Whether this is a sub-user login (skips profile selector)
 * @returns The redirect URL for the role
 */
export const getRoleBasedRedirect = (role: string, isSubUser?: boolean): string => {
  switch (role) {
    case "student":
      return "/student-dashboard";
    case "hr":
      return "/hr-dashboard";
    case "office":
      // If it's a sub-user, go directly to dashboard
      // If it's main user login, go to profile selector
      return isSubUser ? "/office-dashboard" : "/profile-selector";
    default:
      return "/student-dashboard"; // Default to student dashboard
  }
};
