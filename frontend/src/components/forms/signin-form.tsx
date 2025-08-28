import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { resendVerificationEmail } from "@/lib/api";

interface SigninData {
  email: string;
  password: string;
}

export function SigninForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth();

  const {
    mutate: signinMutate,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (credentials: SigninData) => login(credentials),
    onSuccess: (result) => {
      console.log("Signin successful, navigating...");
      const redirectUrl = result?.redirectUrl || "/student-dashboard";
      navigate(redirectUrl, { replace: true });
    },
    onError: (error: any) => {
      // The API client may reject with different shapes. Normalize them here so
      // the UI shows a friendly message and the mutation stops loading.
      console.log("Signin error (raw):", error);

      // Possible shapes from apiClient interceptor: { status, message } or { status, ...data }
      // Or axios error with response.data.message
      let message = "Invalid email or password";

      if (typeof error === "string") {
        message = error;
      } else if (error?.message) {
        message = error.message;
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.message) {
        message = error.message;
      } else if (error?.data?.message) {
        message = error.data.message;
      } else if (error?.message) {
        message = String(error.message);
      } else if (error?.status && error?.message === undefined) {
        // If the interceptor returned an object with status and other fields
        // try to extract any message-like property
        message =
          error?.data?.message ||
          error?.message ||
          error?.error ||
          error?.detail ||
          "Invalid email or password";
      }

      console.log("Signin error message:", message);
      setErrorMessage(message);
    },
  });

  const { mutate: resendEmailMutate, isPending: isResendPending } = useMutation(
    {
      mutationFn: (email: string) => resendVerificationEmail({ email }),
      onSuccess: () => {
        setErrorMessage(
          "Verification email sent successfully! Please check your inbox."
        );
      },
      onError: (error: any) => {
        const message =
          error?.response?.data?.message || "Failed to send verification email";
        setErrorMessage(message);
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(""); // Clear any previous errors
    signinMutate({ email, password });
  };

  return (
    <div
      className={cn("flex flex-col gap-6 font-serif: Georgia", className)}
      {...props}
    >
      <Card className="overflow-hidden bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-lg dark:shadow-slate-900/20">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  Welcome
                </h1>
                <p className="text-balance text-gray-600 dark:text-slate-400">
                  Sign in to your SASM-IMS account
                </p>
              </div>
              {(isError || errorMessage) && (
                <div
                  className={`border rounded-md p-3 ${
                    errorMessage?.includes("sent successfully")
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      : errorMessage?.toLowerCase().includes("verify") ||
                        errorMessage?.toLowerCase().includes("verification")
                      ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {errorMessage?.includes("sent successfully") ? (
                        <span className="text-green-600 dark:text-green-400 text-sm">
                          ✅
                        </span>
                      ) : errorMessage?.toLowerCase().includes("verify") ||
                        errorMessage?.toLowerCase().includes("verification") ? (
                        <span className="text-yellow-600 dark:text-yellow-400 text-sm">
                          ⚠️
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400 text-sm">
                          ❌
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm font-medium ${
                            errorMessage?.includes("sent successfully")
                              ? "text-green-800 dark:text-green-200"
                              : errorMessage
                                  ?.toLowerCase()
                                  .includes("verify") ||
                                errorMessage
                                  ?.toLowerCase()
                                  .includes("verification")
                              ? "text-yellow-800 dark:text-yellow-200"
                              : "text-red-800 dark:text-red-200"
                          }`}
                        >
                          {errorMessage?.toLowerCase().includes("verify") ||
                          errorMessage?.toLowerCase().includes("verification")
                            ? "Email verification required"
                            : errorMessage?.includes("sent successfully")
                            ? "Verification email sent"
                            : "Sign in failed"}
                        </p>
                        {!errorMessage?.includes("sent successfully") && (
                          <button
                            type="button"
                            onClick={() =>
                              setShowErrorDetails(!showErrorDetails)
                            }
                            className={`text-xs px-2 py-1 rounded hover:bg-opacity-80 transition-colors ${
                              errorMessage?.toLowerCase().includes("verify") ||
                              errorMessage
                                ?.toLowerCase()
                                .includes("verification")
                                ? "text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800"
                                : "text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
                            }`}
                          >
                            {showErrorDetails ? (
                              <>
                                Less{" "}
                                <ChevronUp className="inline w-3 h-3 ml-1" />
                              </>
                            ) : (
                              <>
                                More{" "}
                                <ChevronDown className="inline w-3 h-3 ml-1" />
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {showErrorDetails && (
                        <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                          <p
                            className={`text-xs mb-2 ${
                              errorMessage?.toLowerCase().includes("verify") ||
                              errorMessage
                                ?.toLowerCase()
                                .includes("verification")
                                ? "text-yellow-700 dark:text-yellow-300"
                                : "text-red-700 dark:text-red-300"
                            }`}
                          >
                            <strong>Error details:</strong>{" "}
                            {errorMessage ||
                              "Please check your credentials and try again"}
                          </p>

                          {!errorMessage?.toLowerCase().includes("verify") &&
                            !errorMessage
                              ?.toLowerCase()
                              .includes("verification") && (
                              <div className="text-xs space-y-1">
                                <p className="text-red-700 dark:text-red-300 font-medium">
                                  Troubleshooting tips:
                                </p>
                                <ul className="text-red-600 dark:text-red-400 list-disc list-inside space-y-0.5 ml-2">
                                  <li>
                                    Double-check your email address for typos
                                  </li>
                                  <li>
                                    Ensure your password is correct
                                    (case-sensitive)
                                  </li>
                                  <li>Make sure Caps Lock is off</li>
                                  <li>Clear your browser cache and cookies</li>
                                </ul>
                              </div>
                            )}
                        </div>
                      )}

                      {(errorMessage?.toLowerCase().includes("verify") ||
                        errorMessage?.toLowerCase().includes("verification")) &&
                        showErrorDetails && (
                          <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded border">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                              <strong>What to do next:</strong>
                            </p>
                            <ol className="text-sm text-yellow-700 dark:text-yellow-300 list-decimal list-inside space-y-1">
                              <li>
                                Check your email inbox for a verification link
                              </li>
                              <li>Click the verification link in the email</li>
                              <li>Return here to sign in</li>
                            </ol>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-3">
                              Didn't receive the email?{" "}
                              <button
                                type="button"
                                disabled={isResendPending}
                                className="font-medium underline hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => {
                                  if (email) {
                                    resendEmailMutate(email);
                                  }
                                }}
                              >
                                {isResendPending
                                  ? "Sending..."
                                  : "Resend verification email"}
                              </button>
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              )}
              {/* Email */}
              <div className="grid gap-2">
                <Label
                  htmlFor="email"
                  className="text-gray-700 dark:text-slate-300 font-medium"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="m@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  onKeyDown={(e) => e.key === " " && e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-500 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label
                    htmlFor="password"
                    className="text-gray-700 dark:text-slate-300 font-medium"
                  >
                    Password
                  </Label>
                  <a
                    href="/password/forgot"
                    className="ml-auto text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors duration-200 underline-offset-2"
                  >
                    Forgot your password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    autoComplete="current-password"
                    onChange={(e) => setPassword(e.target.value.trim())}
                    onKeyDown={(e) => e.key === " " && e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-500 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 transition-colors duration-200"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending || !email || password.length < 8}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </Button>

              <div className="text-center text-sm text-gray-600 dark:text-slate-400">
                Don&apos;t have an account?{" "}
                <a
                  href="/signup"
                  className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
                >
                  Sign up
                </a>
              </div>
            </div>
          </form>

          <div className="relative hidden bg-gray-100 dark:bg-slate-800 md:block">
            <img
              src="/SI.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
