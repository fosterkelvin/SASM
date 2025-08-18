import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import DefNav from "@/navbar/DefNav";
import { useEffect } from "react";

const ForgotPassword = () => {
    useEffect(() => {
      document.title = "Forgot Password | SASM";
    }, []);

  return (
    <>
      <DefNav />
      <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10 bg-gray-200 dark:bg-gray-500">
        <div className="w-full mt-20 max-w-sm md:max-w-3xl">
            <ForgotPasswordForm />
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
