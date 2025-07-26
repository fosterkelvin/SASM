import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { sendPasswordResetEmail } from "@/lib/api";
import { z } from "zod";

// Zod schema for validation
const schema = z.object({
  email: z.string().email("Invalid email format"),
});

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const {
    mutate: sendPasswordResetMutate,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: sendPasswordResetEmail,
    onSuccess: () => {
      setError(null);
    },
    onError: () => {
      setError("Failed to send reset link. Try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ email });

    if (!result.success) {
      const msg = result.error.issues[0].message;
      setError(msg);
      return;
    }

    setError(null);
    sendPasswordResetMutate({ email });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-lg dark:shadow-slate-900/20">
        <CardContent className="grid p-0">
          <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
            {isSuccess ? (
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-green-600 dark:text-emerald-400">
                  ✅ Reset Link Sent!
                </h1>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Check your inbox for a password reset email.
                </p>
                <div className="text-center text-sm text-gray-600 dark:text-slate-400">
                  Go back to{" "}
                  <a
                    href="/signin"
                    className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
                  >
                    Sign in
                  </a>
                  {" or "}
                  <a
                    href="/signup"
                    className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
                  >
                    Sign up
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                    Reset your password
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">
                    Enter your email address and we'll send you a reset link
                  </p>
                </div>

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
                    name="email"
                    placeholder="john.doe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-500 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  disabled={!email || isPending}
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
                      Sending...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

                <div className="text-center text-sm text-gray-600 dark:text-slate-400">
                  Go back to{" "}
                  <a
                    href="/signin"
                    className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
                  >
                    Sign in
                  </a>
                  {" or "}
                  <a
                    href="/signup"
                    className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
                  >
                    Sign up
                  </a>
                </div>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
