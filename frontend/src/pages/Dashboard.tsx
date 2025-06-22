import DashNav from "@/navbar/DashNav";

const Dashboard = () => {
  document.title = "Dashboard";

  return (
    <div>
      <DashNav />
      <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10 bg-gray-200 dark:bg-gray-500">
        <div className="mt-20 max-w-sm sm:max-w-md md:max-w-4xl lg:max-w-6xl xl:max-w-7xl xl:min-w-xl">
          <h1 className="text-2xl font-bold">Welcome to SASM</h1>
          <p className="text-balance text-muted-foreground">
            This is the home page of the SASM application.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
