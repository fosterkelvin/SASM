import DefNav from "@/navbar/DefNav";
import { useEffect } from "react";

const ResetPassword = () => {
  useEffect(() => {
        document.title = "Reset Password | SASM";
      }, []);

  return (
    <>
      <DefNav />
      <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10 bg-gray-200 dark:bg-gray-500">
        <div className="w-full mt-20 max-w-sm md:max-w-3xl">
            {
                linkIsValid ? <ResetPasswordForm />
                : <div className="text-center text-red-500">
                    <p>Invalid or expired reset link. Please try again.</p>
                  </div>
            }
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
