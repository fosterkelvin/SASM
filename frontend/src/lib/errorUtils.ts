// Error handling utilities for better logging and UX

export interface ApiError {
  status?: number;
  message?: string;
  expected?: boolean;
  response?: any;
  request?: any;
}

/**
 * Determines if an error is an expected authentication error
 */
export const isExpectedAuthError = (error: ApiError): boolean => {
  return error.status === 401 || error.expected === true;
};

/**
 * Logs errors with appropriate styling and detail level
 * @param error - The error object
 * @param context - Context where the error occurred (e.g., "user load", "signin")
 * @param silent - Whether to suppress expected auth errors
 */
export const logError = (
  error: ApiError,
  context: string = "API call",
  silent: boolean = true
) => {
  if (silent && isExpectedAuthError(error)) {
    console.log(
      `%c🔒 ${context}: No authentication - this is normal`,
      "color: #888; font-style: italic"
    );
    return;
  }

  // Log unexpected errors with full detail
  console.groupCollapsed(
    `%c🔴 Unexpected error during ${context}`,
    "color: red; font-weight: bold"
  );

  if (error.status) {
    console.log("🔸 Status:", error.status);
  }
  if (error.message) {
    console.log("🔸 Message:", error.message);
  }
  if (error.response) {
    console.log("🔸 Response:", error.response);
  }
  if (error.request) {
    console.warn("⚠️ Request:", error.request);
  }

  console.groupEnd();
};

/**
 * Creates a user-friendly error message for display
 */
export const getErrorMessage = (
  error: ApiError,
  fallback: string = "An unexpected error occurred"
): string => {
  if (isExpectedAuthError(error)) {
    return "Please sign in to continue";
  }

  return error.message || fallback;
};
