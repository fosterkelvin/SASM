import { verifyEmail } from "@/lib/api";
import DefNav from "@/navbar/DefNav";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";

const VerifyEmail = () => {
  document.title = "Sign In | SASM";

  const { code } = useParams();

  const { isPending, isError, isSuccess } = useQuery({
    queryKey: ["emailVerification", code],
    queryFn: () => verifyEmail(code),
  });

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
              <p className="text-green-500 dark:text-green-400 mb-4">
                Email verified successfully!
              </p>
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
