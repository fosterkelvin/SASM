import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { resendVerificationEmail } from "@/lib/api";

const ResendVerificationButton = ({ email }: { email: string }) => {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const resendMutation = useMutation({
    mutationFn: () => resendVerificationEmail({ email }),
    onSuccess: () => {
      setResendMessage(
        "Verification email sent successfully! Please check your inbox."
      );
      setTimeout(() => setResendMessage(""), 5000);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to send verification email";
      setResendMessage(message);
      setTimeout(() => setResendMessage(""), 5000);
    },
    onSettled: () => {
      setIsResending(false);
    },
  });

  const handleResend = () => {
    setIsResending(true);
    setResendMessage("");
    resendMutation.mutate();
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleResend}
        disabled={isResending}
        className="bg-yellow-600 hover:bg-yellow-700 text-white dark:bg-yellow-700 dark:hover:bg-yellow-800 dark:text-yellow-100 shadow-md"
        size="sm"
      >
        {isResending ? (
          <div className="flex items-center gap-2">Sending...</div>
        ) : (
          <>
            <Mail className="w-4 h-4 mr-2" />
            Resend Verification
          </>
        )}
      </Button>
      {resendMessage && (
        <p
          className={`text-sm ${
            resendMessage.includes("successfully")
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {resendMessage}
        </p>
      )}
    </div>
  );
};

const VerificationAlert = ({ email }: { email: string }) => {
  return (
    <Card className="mb-8 border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-gray-950/80">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Email Verification Required
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              Your email address <strong>{email}</strong> is not yet verified.
              Some features may be limited until you verify your email address.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <ResendVerificationButton email={email} />
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                size="sm"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationAlert;
