import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "@/lib/api";
import { useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

// Zod schema for validation
const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
      ),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div"> & { code: string | null }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  // Real-time password validation
  const getPasswordRequirements = (password: string) => {
    const requirements = [
      { met: password.length >= 8, text: "8 characters" },
      { met: /[a-z]/.test(password), text: "1 lowercase letter" },
      { met: /[A-Z]/.test(password), text: "1 uppercase letter" },
      { met: /\d/.test(password), text: "1 number" },
      { met: /[@$!%*?&#]/.test(password), text: "1 special character" },
    ];
    return requirements.filter((req) => !req.met);
  };

  const unmetRequirements = getPasswordRequirements(password);

  const {
    mutate: resetPasswordMutate,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      setError(null);
    },
    onError: (error: any) => {
      // Check if the error is about same password
      const errorMessage = error?.response?.data?.message || error?.message;
      if (errorMessage === "New password must be different from old password") {
        setError(
          "Your new password must be different from your current password."
        );
      } else {
        setError("Failed to reset password. Try again.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ password, confirmPassword });

    if (!result.success) {
      const msg = result.error.issues[0].message;
      setError(msg);
      return;
    }

    if (!code) {
      setError("Invalid or missing reset code.");
      return;
    }

    setError(null);
    resetPasswordMutate({
      verificationCode: code!,
      password,
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardContent className="grid p-0">
          <div className="p-6 md:p-8">
            {isSuccess ? (
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ✅ Password Updated!
                </h1>
                <p className="text-sm text-muted-foreground">
                  Your password has been successfully reset.
                </p>
                <div className="text-center text-sm">
                  Go to{" "}
                  <a
                    href="/signin"
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                  >
                    Sign in
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Reset your password</h1>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                    <div className="flex items-center">
                      <div className="text-red-600 dark:text-red-400 text-sm">
                        <p className="font-medium">Error</p>
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid gap-1 relative">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-7 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {password && unmetRequirements.length > 0 && (
                    <div className="text-xs text-red-500 mt-1">
                      <p className="font-medium mb-1">
                        Password must contain at least:
                      </p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {unmetRequirements.map((req, index) => (
                          <li key={index}>{req.text}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="grid gap-1 relative">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirm-password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-7 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                  {confirmPassword && password !== confirmPassword && (
                    <div className="text-xs text-red-500 mt-1">
                      <p>Passwords don't match</p>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="mt-4 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white transition-colors duration-200"
                  disabled={!password || !confirmPassword || isPending}
                >
                  {isPending ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
