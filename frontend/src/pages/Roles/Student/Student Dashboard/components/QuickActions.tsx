import {
  Bell,
  Calendar,
  FileText,
  User,
  BarChart2,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-xl shadow-lg border border-red-100 dark:border-red-700/60 p-6">
      <h3 className="text-lg font-bold text-gray-800 dark:text-red-200 mb-4 flex items-center gap-2">
        <RefreshCw className="w-5 h-5 text-red-600 dark:text-red-400" />
        Quick Actions
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate("/grades")}
          className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-gray-900 hover:bg-blue-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 border border-blue-200 dark:border-blue-700/60 shadow"
        >
          <div className="w-8 h-8 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium text-blue-700 dark:text-gray-200">
            View Grades
          </span>
        </button>

        <button
          onClick={() => navigate("/notifications")}
          className="flex items-center gap-3 p-4 bg-red-50 dark:bg-gray-900 hover:bg-red-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 border border-red-200 dark:border-red-700/60 shadow"
        >
          <div className="w-8 h-8 bg-red-600 dark:bg-red-700 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium text-red-700 dark:text-gray-200">
            Notifications
          </span>
        </button>

        <button
          onClick={() => navigate("/schedule")}
          className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-gray-900 hover:bg-emerald-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 border border-emerald-200 dark:border-emerald-700/60 shadow"
        >
          <div className="w-8 h-8 bg-emerald-600 dark:bg-emerald-700 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium text-emerald-700 dark:text-gray-200">
            View Schedule
          </span>
        </button>

        <button
          onClick={() => navigate("/dtr")}
          className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-gray-900 hover:bg-yellow-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 border border-yellow-200 dark:border-yellow-700/60 shadow"
        >
          <div className="w-8 h-8 bg-yellow-500 dark:bg-yellow-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium text-yellow-700 dark:text-gray-200">
            DTR
          </span>
        </button>

        <button
          onClick={() => navigate("/application")}
          className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-gray-900 hover:bg-indigo-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 border border-indigo-200 dark:border-indigo-700/60 shadow"
        >
          <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-700 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium text-indigo-700 dark:text-gray-200">
            Apply / Forms
          </span>
        </button>

        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 border border-gray-200 dark:border-gray-700/60 shadow"
        >
          <div className="w-8 h-8 bg-gray-600 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium text-gray-700 dark:text-gray-200">
            Profile
          </span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
