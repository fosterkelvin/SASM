import DefNav from "@/navbar/DefNav";
import { SigninForm } from "@/components/forms/signin-form";

const Home = () => {
  return (
    <div>
      <DefNav />
      <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10 bg-gray-200 dark:bg-gray-500">
        <div className="mt-20 max-w-sm sm:max-w-md md:max-w-4xl lg:max-w-6xl xl:max-w-7xl xl:min-w-xl">
          <p className="text-balance text-muted-foreground">
            <SigninForm />
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
