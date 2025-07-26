import { verifyEmail } from "@/lib/api";
import DefNav from "@/navbar/DefNav";
import { useAuth } from "@/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const VerifyEmail = () => {
  document.title = "Email Verification | SASM";

  const { code } = useParams();
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const {
    mutate: verifyEmailMutate,
    isPending,
    isError,
    isSuccess,
  } = useMutation({
    mutationFn: () => verifyEmail(code!),
    onSuccess: async (response) => {
      console.log("Email verified successfully:", response);
      console.log("Redirect URL from response:", response.redirectUrl);
      // Refresh auth context to get the authenticated user
      try {
        await refreshUser();
        // Redirect to dashboard after successful verification
        const redirectUrl = response.redirectUrl || "/student-dashboard"; // Better fallback
        console.log("Redirecting to:", redirectUrl);
        setTimeout(() => {
          navigate(redirectUrl, {
            replace: true,
          });
        }, 2000);
      } catch (error) {
        console.error("Error refreshing user data:", error);
      }
    },
    onError: (error) => {
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
                  Email verified successfully!
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You will be redirected to your dashboard in a few seconds...
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
