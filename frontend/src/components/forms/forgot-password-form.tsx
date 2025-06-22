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
      <Card className="overflow-hidden dark:bg-gray-600">
        <CardContent className="grid p-0">
          <div className="p-6 md:p-8">
            {isSuccess ? (
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ✅ Reset Link Sent!
                </h1>
                <p className="text-sm text-muted-foreground">
                  Check your inbox for a password reset email.
                </p>
                <div className="text-center text-sm">
                  Go back to{" "}
                  <a
                    href="/signin"
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                  >
                    Sign in
                  </a>
                  {" or"}
                  <a
                    href="/signup"
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                  >
                    {" Sign up"}
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Reset your password</h1>
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="email">Email :</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="john.doe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                {error && <p className="text-sm text-red-500 -mt-4">{error}</p>}

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-green-600 dark:bg-red-800 dark:hover:bg-green-800 dark:text-white"
                  disabled={!email || isPending}
                >
                  {isPending ? "Sending..." : "Send Reset Link"}
                </Button>

                <div className="text-center text-sm">
                  Go back to{" "}
                  <a
                    href="/signin"
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                  >
                    Sign in
                  </a>
                  {" or"}
                  <a
                    href="/signup"
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                  >
                    {" Sign up"}
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
