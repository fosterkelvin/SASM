/**
 * Email Requirement Utilities
 * Handles logic for blocking features until UB email is updated
 */

export interface EmailRequirementCheck {
  isEmailUpdateRequired: boolean;
  hasAcceptedApplication: boolean;
  currentEmailIsUB: boolean;
}

/**
 * Check if user needs to update their email to a UB email
 * Returns true if user has accepted application but doesn't have UB email
 */
export const checkEmailRequirement = (
  user: any,
  applications: any[]
): EmailRequirementCheck => {
  // Check if user has an accepted application
  const hasAcceptedApplication = applications.some(
    (app: any) => app.status === "accepted"
  );

  // Check if current email or pending email is a UB email
  const currentEmail = (user?.pendingEmail || user?.email || "").toLowerCase();
  const currentEmailIsUB = currentEmail.endsWith("@s.ubaguio.edu");

  // Email update is required if user is accepted but doesn't have UB email
  const isEmailUpdateRequired = hasAcceptedApplication && !currentEmailIsUB;

  return {
    isEmailUpdateRequired,
    hasAcceptedApplication,
    currentEmailIsUB,
  };
};

/**
 * Check if a route should be accessible when email update is required
 * Only profile page should be accessible
 */
export const isRouteAllowedWithEmailRequirement = (
  pathname: string
): boolean => {
  const allowedPaths = [
    "/profile",
    "/notifications", // Allow notifications so users can see acceptance notice
  ];

  return allowedPaths.some((path) => pathname.startsWith(path));
};
