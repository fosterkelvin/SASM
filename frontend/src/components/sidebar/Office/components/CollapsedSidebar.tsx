import React from "react";
import {
  Menu,
  Home,
  Calendar,
  FileText,
  Users,
  User,
  Sun,
  Moon,
  LogOut,
  ClipboardCheck,
  Bell,
} from "lucide-react";

interface Props {
  onExpand: () => void;
  handlers: Record<string, () => void>;
  darkMode: boolean;
  onToggleTheme: () => void;
  onSignout: () => void;
}

const CollapsedSidebar: React.FC<Props> = ({
  onExpand,
  handlers,
  darkMode,
  onToggleTheme,
  onSignout,
}) => {
  return (
    <div
      className="hidden md:flex flex-col items-center py-4 h-full relative overflow-y-auto overflow-x-hidden"
      aria-label="Collapsed Sidebar"
      style={{ minHeight: "100%" }}
    >
      <div className="flex-1 flex flex-col items-center space-y-4 w-full">
        <div className="group relative">
          <button
            onClick={onExpand}
            className="p-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 shadow-sm hover:shadow-md border border-transparent hover:border-red-200 dark:hover:border-red-800"
            aria-label="Expand sidebar"
            title="Expand Menu"
          >
            <Menu size={18} />
          </button>
        </div>
        <div className="space-y-2">
          <div className="group relative">
            <button
              onClick={handlers.dashboard}
              className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
              aria-label="Dashboard"
              title="Dashboard"
            >
              <Home size={16} />
            </button>
          </div>
          <div className="group relative">
            <button
              onClick={handlers.dtrCheck}
              className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
              aria-label="DTR Check"
              title="DTR Check"
            >
              <ClipboardCheck size={16} />
            </button>
          </div>
          <div className="group relative">
            <button
              onClick={handlers.evaluation}
              className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
              aria-label="Evaluation"
              title="Evaluation"
            >
              <Calendar size={16} />
            </button>
          </div>
          <div className="group relative">
            <button
              onClick={handlers.leave}
              className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
              aria-label="Leave Requests"
              title="Leave Requests"
            >
              <FileText size={16} />
            </button>
          </div>
          <div className="group relative">
            <button
              onClick={handlers.requests}
              className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
              aria-label="Requests"
              title="Requests"
            >
              <FileText size={16} />
            </button>
          </div>
          <div className="group relative">
            <button
              onClick={handlers.scholars}
              className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
              aria-label="Scholars"
              title="Scholars"
            >
              <FileText size={16} />
            </button>
          </div>
          <div className="group relative">
            <button
              onClick={handlers.trainees}
              className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
              aria-label="My Trainees"
              title="My Trainees"
            >
              <Users size={16} />
            </button>
          </div>

          <div className="group relative">
            <button
              onClick={handlers.notifications}
              className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col items-center gap-2 pb-6">
        <div className="group relative">
          <button
            onClick={handlers.profile}
            className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
            aria-label="Profile"
            title="Profile"
          >
            <User size={16} />
          </button>
        </div>
        <div className="group relative w-full flex justify-center">
          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
            aria-label={darkMode ? "Light Mode" : "Dark Mode"}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? (
              <Sun size={16} className="text-yellow-500" />
            ) : (
              <Moon size={16} className="text-blue-500" />
            )}
          </button>
        </div>
        <div className="group relative w-full flex justify-center">
          <button
            onClick={onSignout}
            className="p-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollapsedSidebar;
