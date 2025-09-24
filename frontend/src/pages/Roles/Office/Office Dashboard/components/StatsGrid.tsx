import { Users, FileText, GraduationCap, FileBarChart } from "lucide-react";

const StatsGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-xl shadow-md border border-red-100 dark:border-red-700/60 p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-red-600 dark:bg-red-700 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-red-600 dark:text-red-400">
            45
          </span>
        </div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
          Active Staff
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Current semester
        </p>
      </div>

      <div className="bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-xl shadow-md border border-orange-100 dark:border-orange-700/60 p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-orange-500 dark:bg-orange-700 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            28
          </span>
        </div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
          Pending Reviews
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Requires attention
        </p>
      </div>

      <div className="bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-xl shadow-md border border-green-100 dark:border-green-700/60 p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-green-600 dark:bg-green-700 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            12
          </span>
        </div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
          Active Programs
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Academic year
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-xl shadow-md border border-blue-100 dark:border-blue-700/60 p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center">
            <FileBarChart className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            8
          </span>
        </div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
          Monthly Reports
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Generated this month
        </p>
      </div>
    </div>
  );
};

export default StatsGrid;
