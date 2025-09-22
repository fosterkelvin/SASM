import { Users, FileText, FileBarChart, RefreshCw } from "lucide-react";

const QuickActions = () => {
  return (
    <div className="bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-xl shadow-lg border border-red-100 dark:border-red-700/60 p-6">
      <h3 className="text-lg font-bold text-gray-800 dark:text-red-200 mb-4 flex items-center gap-2">
        <RefreshCw className="w-5 h-5 text-red-600 dark:text-red-400" />
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="flex items-center gap-3 p-4 bg-red-50 dark:bg-gray-900 hover:bg-red-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 border border-red-200 dark:border-red-700/60 shadow">
          <div className="w-8 h-8 bg-red-600 dark:bg-red-700 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium text-red-700 dark:text-gray-200">
            Manage Staff
          </span>
        </button>

        <button className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-gray-900 hover:bg-orange-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 border border-orange-200 dark:border-orange-700/60 shadow">
          <div className="w-8 h-8 bg-orange-500 dark:bg-orange-700 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium text-orange-700 dark:text-gray-200">
            Review Documents
          </span>
        </button>

        <button className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-gray-900 hover:bg-blue-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 border border-blue-200 dark:border-blue-700/60 shadow">
          <div className="w-8 h-8 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center">
            <FileBarChart className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium text-blue-700 dark:text-gray-200">
            Generate Reports
          </span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
