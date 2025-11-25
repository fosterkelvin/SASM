import { verifyEmail } from "@/lib/api";
import DefNav from "@/navbar/DefNav";
import { useAuth } from "@/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const VerifyEmail = () => {
  document.title = "Email Verification | SASM";

  const { code } = useParams();
  const { refreshUser, user, logout } = useAuth();
  const navigate = useNavigate();
  const [needsReLogin, setNeedsReLogin] = useState(false);

  const {
    mutate: verifyEmailMutate,
    isPending,
    isError,
    isSuccess,
    data: verificationResponse,
  } = useMutation({
    mutationFn: () => verifyEmail(code!),
    onSuccess: async (response) => {
      console.log("=== VERIFY EMAIL SUCCESS ===");
      console.log("Full response:", response);
      console.log("Response message:", response.message);
      console.log("Response user:", response.user);
      console.log("Redirect URL from response:", response.redirectUrl);

      // Check if this is an email change (no tokens in response)
      const isEmailChange = !response.accessToken && !response.refreshToken;

      if (isEmailChange) {
        // For email changes, the user needs to sign in again with the new email
        console.log("Email change detected - user needs to sign in again");
        setNeedsReLogin(true);

        // Sign out the user after a delay
        setTimeout(async () => {
          await logout();
          navigate("/signin", {
            replace: true,
            state: {
              message:
                "Email changed successfully! Please sign in with your new email address.",
              newEmail: response.user?.email,
            },
          });
        }, 3000);
      } else {
        // Regular email verification - cookies are already set by backend
        // Wait a bit for cookies to be recognized, then refresh user
        console.log("New user email verification - setting user directly");

        setTimeout(async () => {
          try {
            console.log("Calling refreshUser to get updated user data...");
            await refreshUser();
            console.log("refreshUser completed successfully");

            // Redirect to dashboard after successful verification
            const redirectUrl = response.redirectUrl || "/student-dashboard";
            console.log("Will redirect to:", redirectUrl);

            navigate(redirectUrl, {
              replace: true,
            });
          } catch (error) {
            console.error("Error refreshing user data:", error);
            // If refresh fails, redirect to sign in
            setNeedsReLogin(true);
            navigate("/signin", {
              replace: true,
              state: { message: "Please sign in to continue." },
            });
          }
        }, 500); // Short delay to ensure cookies are set
      }
    },
    onError: (error) => {
      console.error("=== VERIFY EMAIL ERROR ===");
      console.error("Email verification failed:", error);
    },
  });

  useEffect(() => {
    if (code) {
      verifyEmailMutate();
    }
  }, [code, verifyEmailMutate]);

  return (
    <div>
      <DefNav />
      <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10 bg-gray-200 dark:bg-gray-500">
        <div className="w-full mt-20 max-w-sm md:max-w-3xl">
          <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold mb-4">Email Verification</h1>

            {isPending && (
              <div className="flex justify-center items-center">
                <svg
                  className="animate-spin h-5 w-5 text-gray-600 dark:text-gray-300 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                <span className="text-gray-600 dark:text-gray-300">
                  Verifying...
                </span>
              </div>
            )}

            {isError && (
              <p className="text-red-500 dark:text-red-400 mb-4">
                The link is either invalid or has expired.{" "}
                <Link
                  to="/password/reset"
                  className="text-blue-600 dark:text-blue-300 no-underline"
                >
                  Get a new link
                </Link>
              </p>
            )}

            {isSuccess && (
              <div className="space-y-2">
                <p className="text-green-500 dark:text-green-400 mb-4">
                  {verificationResponse?.message ||
                    "Email verified successfully!"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {needsReLogin
                    ? "Please sign in again with your new email address..."
                    : "You will be redirected to your dashboard in a few seconds..."}
                </p>
              </div>
            )}

            {/* Always show this link */}
            {(isError || isSuccess) && (
              <Link
                to="/"
                className="text-blue-600 dark:text-blue-300 no-underline "
              >
                Go to Home
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
