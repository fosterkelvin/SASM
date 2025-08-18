import DefNav from "@/navbar/DefNav";
import { SigninForm } from "@/components/forms/signin-form";

const SigninPage = () => {
  document.title = "Sign In | SASM";

  return (
    <div>
      <DefNav />
      <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10 bg-gray-200 dark:bg-gray-500">
        <div className="w-full mt-20 max-w-sm md:max-w-3xl">
          <SigninForm />
        </div>
      </div>
    </div>
  );
};

export default SigninPage;
