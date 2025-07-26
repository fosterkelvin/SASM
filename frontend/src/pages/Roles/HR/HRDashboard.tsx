import HRNav from "@/navbar/HRNav";

const HRDashboard = () => {
  return (
    <div>
      <HRNav />
      <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10 bg-gray-200 dark:bg-gray-500">
        <div className="w-full mt-20 max-w-sm md:max-w-3xl">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            HR Dashboard
          </h1>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Welcome to your dashboard! Here you can manage your HR tasks,
            employee records, and more.
          </p>
          {/* Add more dashboard content here */}
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
