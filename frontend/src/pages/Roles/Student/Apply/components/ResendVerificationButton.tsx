import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { resendVerificationEmail } from "@/lib/api";

interface Props {
  email: string;
}

const ResendVerificationButton: React.FC<Props> = ({ email }) => {
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
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Sending...
          </div>
        ) : (
          <>
            <AlertTriangle className="w-4 h-4 mr-2" />
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

export default ResendVerificationButton;
