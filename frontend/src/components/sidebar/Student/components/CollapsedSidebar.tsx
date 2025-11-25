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
  isAccepted?: boolean;
  isEmailUpdateRequired?: boolean;
  isTrainee?: boolean;
  isDeployedToOffice?: boolean;
  hasActiveApplication?: boolean;
  isReapplicant?: boolean;
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
  isAccepted = false,
  isEmailUpdateRequired = false,
  isTrainee = false,
  isDeployedToOffice = false,
  hasActiveApplication = false,
  isReapplicant = false,
}) => {
  return (
    <div
      className="hidden md:flex flex-col items-center py-4 h-full relative overflow-y-auto overflow-x-hidden min-h-full"
      aria-label="Collapsed Sidebar"
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
              onClick={isEmailUpdateRequired ? undefined : handlers.dashboard}
              disabled={isEmailUpdateRequired}
              className={`p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 ${
                isEmailUpdateRequired ? "opacity-50 cursor-not-allowed" : ""
              }`}
              aria-label="Dashboard"
              title={
                isEmailUpdateRequired
                  ? "Dashboard (Blocked - Update email required)"
                  : "Dashboard"
              }
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
          {/* Show DTR, Leave, and Schedule for deployed trainees (but NOT re-applicants) */}
          {isVerified && isDeployedToOffice && !isReapplicant && (
            <>
              <div className="group relative">
                <button
                  onClick={isEmailUpdateRequired ? undefined : handlers.dtr}
                  disabled={isEmailUpdateRequired}
                  className={`p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 ${
                    isEmailUpdateRequired ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  aria-label="DTR"
                  title={
                    isEmailUpdateRequired
                      ? "DTR (Blocked - Update email required)"
                      : "DTR"
                  }
                >
                  <CalendarClock size={16} />
                </button>
              </div>
              <div className="group relative">
                <button
                  onClick={isEmailUpdateRequired ? undefined : handlers.leave}
                  disabled={isEmailUpdateRequired}
                  className={`p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 ${
                    isEmailUpdateRequired ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  aria-label="Leave"
                  title={
                    isEmailUpdateRequired
                      ? "Leave (Blocked - Update email required)"
                      : "Leave"
                  }
                >
                  <CalendarMinus size={16} />
                </button>
              </div>
              <div className="group relative">
                <button
                  onClick={
                    isEmailUpdateRequired ? undefined : handlers.schedule
                  }
                  disabled={isEmailUpdateRequired}
                  className={`p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 ${
                    isEmailUpdateRequired ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  aria-label="Schedule"
                  title={
                    isEmailUpdateRequired
                      ? "Schedule (Blocked - Update email required)"
                      : "Schedule"
                  }
                >
                  <Calendar size={16} />
                </button>
              </div>
            </>
          )}
          {/* Show Apply only for applicants without accepted status and not re-applicants */}
          {!isAccepted && !hasActiveApplication && !isReapplicant && (
            <div className="group relative">
              <button
                onClick={isEmailUpdateRequired ? undefined : handlers.apply}
                disabled={isEmailUpdateRequired}
                className={`p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 ${
                  isEmailUpdateRequired ? "opacity-50 cursor-not-allowed" : ""
                }`}
                aria-label="Apply"
                title={
                  isEmailUpdateRequired
                    ? "Apply (Blocked - Update email required)"
                    : "Apply"
                }
              >
                <FileEdit size={16} />
              </button>
            </div>
          )}
          {/* Show Re-apply ONLY for re-applicants (verified users with reapplicant status) */}
          {isVerified && !hasActiveApplication && isReapplicant && (
            <div className="group relative">
              <button
                onClick={isEmailUpdateRequired ? undefined : handlers.reapply}
                disabled={isEmailUpdateRequired}
                className={`p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 ${
                  isEmailUpdateRequired ? "opacity-50 cursor-not-allowed" : ""
                }`}
                aria-label="Re-apply"
                title={
                  isEmailUpdateRequired
                    ? "Re-apply (Blocked - Update email required)"
                    : "Re-apply"
                }
              >
                <RefreshCw size={16} />
              </button>
            </div>
          )}
          {/* Show Requirements for verified users */}
          {isVerified && (
            <div className="group relative">
              <button
                onClick={
                  isEmailUpdateRequired ? undefined : handlers.requirements
                }
                disabled={isEmailUpdateRequired}
                className={`p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-gray-400 transition-all duration-200 ${
                  isEmailUpdateRequired ? "opacity-50 cursor-not-allowed" : ""
                }`}
                aria-label="Requirements"
                title={
                  isEmailUpdateRequired
                    ? "Requirements (Blocked - Update email required)"
                    : "Requirements"
                }
              >
                <ClipboardList size={16} />
              </button>
            </div>
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
