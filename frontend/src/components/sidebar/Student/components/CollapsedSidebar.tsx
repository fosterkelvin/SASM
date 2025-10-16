import React from "react";
import {
  Menu,
  Home,
  Bell,
  BookOpen,
  Calendar,
  User,
  Sun,
  Moon,
  LogOut,
  CalendarClock,
  FileEdit,
  RefreshCw,
  CalendarMinus,
  ClipboardList,
} from "lucide-react";

interface Props {
  unreadCount?: number;
  onExpand: () => void;
  handlers: Record<string, () => void>;
  darkMode: boolean;
  onToggleTheme: () => void;
  onSignout: () => void;
  isVerified?: boolean;
  isApplicant?: boolean;
}

const CollapsedSidebar: React.FC<Props> = ({
  unreadCount = 0,
  onExpand,
  handlers,
  darkMode,
  onToggleTheme,
  onSignout,
  isVerified = false,
  isApplicant = false,
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
              onClick={handlers.notifications}
              className="relative p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>
          {isVerified && (
            <>
              <div className="group relative">
                <button
                  onClick={handlers.grades}
                  className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                  aria-label="Grades"
                  title="Grades"
                >
                  <BookOpen size={16} />
                </button>
              </div>
              {!isApplicant && (
                <div className="group relative">
                  <button
                    onClick={handlers.dtr}
                    className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                    aria-label="DTR"
                    title="DTR"
                  >
                    <CalendarClock size={16} />
                  </button>
                </div>
              )}
              <div className="group relative">
                <button
                  onClick={handlers.schedule}
                  className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                  aria-label="Schedule"
                  title="Schedule"
                >
                  <Calendar size={16} />
                </button>
              </div>
            </>
          )}
          <div className="group relative">
            <button
              onClick={handlers.apply}
              className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
              aria-label="Apply"
              title="Apply"
            >
              <FileEdit size={16} />
            </button>
          </div>
          {isVerified && (
            <>
              {!isApplicant && (
                <>
                  <div className="group relative">
                    <button
                      onClick={handlers.reapply}
                      className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                      aria-label="Re-apply"
                      title="Re-apply"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                  <div className="group relative">
                    <button
                      onClick={handlers.leave}
                      className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-gray-400 transition-all duration-200"
                      aria-label="Leave"
                      title="Leave"
                    >
                      <CalendarMinus size={16} />
                    </button>
                  </div>
                </>
              )}
              <div className="group relative">
                <button
                  onClick={handlers.requirements}
                  className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-gray-400 transition-all duration-200"
                  aria-label="Requirements"
                  title="Requirements"
                >
                  <ClipboardList size={16} />
                </button>
              </div>
            </>
          )}
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
              <Sun size={16} className="text-gray-200 hover:text-red-400" />
            ) : (
              <Moon size={16} className="text-gray-500 hover:text-red-400" />
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
