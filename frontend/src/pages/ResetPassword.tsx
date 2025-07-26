import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { Card, CardContent } from "@/components/ui/card";
import DefNav from "@/navbar/DefNav";
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  useEffect(() => {
    document.title = "Reset Password | SASM";
  }, []);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const exp = Number(searchParams.get("exp"));
  const now = Date.now();
  const linkIsValid = code && exp && exp > now;

  const handleRequestNewLink = () => {
    navigate("/password/forgot", { replace: true });
  };

  return (
    <>
      <DefNav />
      <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10 bg-gray-200 dark:bg-gray-500">
        <div className="w-full mt-20 max-w-sm md:max-w-3xl">
          {linkIsValid ? (
            <ResetPasswordForm code={code} />
          ) : (
            <Card className="overflow-hidden dark:bg-gray-700 bg-white">
              <CardContent className="grid p-0">
                <div className="text-center text-rose-600 dark:text-rose-400 space-y-4 px-6 py-10">
                  <p className="text-lg font-medium">
                    Invalid or expired reset link.
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Please request a new one to reset your password.
                  </p>
                  <button
                    onClick={handleRequestNewLink}
                    className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 underline text-sm font-medium"
                  >
                    Request a new password reset link
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
