import { useState, useEffect, useRef, useCallback } from "react";
import { User, LogOut, Sun, Moon } from "lucide-react";
import SidebarHeader from "./components/SidebarHeader";
import SidebarNav from "./components/SidebarNav";
import CollapsedSidebar from "./components/CollapsedSidebar";
import MobileHeader from "./components/MobileHeader";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getRoleBasedRedirect } from "@/lib/roleUtils";
import { useUnreadNotificationCount } from "@/hooks/useUnreadNotificationCount";

interface HRSidebarProps {
  currentPage?: string;
  onCollapseChange?: (collapsed: boolean) => void;
}

const HRSidebar = ({
  currentPage = "Dashboard",
  onCollapseChange,
}: HRSidebarProps) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { data: unreadCountData } = useUnreadNotificationCount();
  const unreadCount = unreadCountData?.unreadCount || 0;
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [isOpen, setIsOpen] = useState(false);
  const savedCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(savedCollapsed);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  useEffect(() => {
    onCollapseChange?.(isDesktopCollapsed);
  }, [isDesktopCollapsed, onCollapseChange]);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isDesktopCollapsed.toString());
  }, [isDesktopCollapsed]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
      setTimeout(() => sidebarRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handlers
  const handleDashboardClick = () => {
    const dashboardRoute = getRoleBasedRedirect(user?.role || "hr");
    navigate(dashboardRoute);
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setIsOpen(false);
  };

  const handleSignout = () => {
    logout();
    setIsOpen(false);
  };

  const handleAnalyticsClick = () => {
    navigate("/hr/analytics");
    setIsOpen(false);
  };

  const handleApplicationsClick = () => {
    navigate("/applications");
    setIsOpen(false);
  };

  const handleRequirementsClick = () => {
    navigate("/hr/requirements");
    setIsOpen(false);
  };

  const handleReapplicationsClick = () => {
    navigate("/reapplications");
    setIsOpen(false);
  };

  const handleUsersClick = () => {
    navigate("/hr/users");
    setIsOpen(false);
  };

  const handleTraineesClick = () => {
    navigate("/hr/trainees");
    setIsOpen(false);
  };

  const handleScholarsClick = () => {
    navigate("/hr/scholars");
    setIsOpen(false);
  };

  const handleLeavesClick = () => {
    navigate("/leave-management");
    setIsOpen(false);
  };

  const handleDTRCheckClick = () => {
    navigate("/hr/dtr-check");
    setIsOpen(false);
  };

  const handleNotificationsClick = () => {
    navigate("/notifications");
    setIsOpen(false);
  };

  // Collapsed handlers
  const handleCollapsedProfileClick = () => navigate("/profile");
  const handleCollapsedDashboardClick = () =>
    navigate(getRoleBasedRedirect(user?.role || "hr"));
  const handleCollapsedSignout = () => logout();
  const handleCollapsedAnalyticsClick = () => navigate("/hr/analytics");
  const handleCollapsedApplicationsClick = () => navigate("/applications");
  const handleCollapsedRequirementsClick = () => navigate("/hr/requirements");
  const handleCollapsedReapplicationsClick = () => navigate("/reapplications");
  const handleCollapsedEvaluationsClick = () => navigate("/hr/evaluations");
  const handleCollapsedUsersClick = () => navigate("/hr/users");
  const handleCollapsedTraineesClick = () => navigate("/hr/trainees");
  const handleCollapsedScholarsClick = () => navigate("/hr/scholars");
  const handleCollapsedLeavesClick = () => navigate("/leave-management");
  const handleCollapsedDTRCheckClick = () => navigate("/hr/dtr-check");
  const handleCollapsedNotificationsClick = () => navigate("/notifications");

  const menuItems = [
    { label: "Dashboard", handler: handleDashboardClick },
    { label: "Requirements", handler: handleRequirementsClick },
    { label: "Analytics", handler: handleAnalyticsClick },
    { label: "Applications", handler: handleApplicationsClick },
    { label: "Reapplications", handler: handleReapplicationsClick },
    { label: "Trainees", handler: handleTraineesClick },
    { label: "Scholars", handler: handleScholarsClick },
    { label: "Leave Management", handler: handleLeavesClick },
    { label: "DTR Check", handler: handleDTRCheckClick },
    { label: "Notifications", handler: handleNotificationsClick },
    { label: "Profile", handler: handleProfileClick },
    { label: "Sign out", handler: handleSignout },
  ];

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (focusIndex === null) return;
      if (e.key === "ArrowDown") {
        setFocusIndex((prev) =>
          prev !== null ? (prev + 1) % menuItems.length : 0
        );
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        setFocusIndex((prev) =>
          prev !== null
            ? (prev - 1 + menuItems.length) % menuItems.length
            : menuItems.length - 1
        );
        e.preventDefault();
      } else if (e.key === "Enter" || e.key === " ") {
        menuItems[focusIndex].handler();
        e.preventDefault();
      }
    },
    [focusIndex]
  );

  return (
    <>
      <MobileHeader
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        title="SASM-IMS"
        subtitle={currentPage}
      />

      {/* Mobile overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-40 ${
          isOpen ? "opacity-50 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden={!isOpen}
      />

      <div
        id="hr-sidebar"
        ref={sidebarRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 shadow-xl transition-all duration-300 ease-in-out z-50 border-r border-gray-200 dark:border-gray-700 focus:outline-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 ${
          isDesktopCollapsed
            ? "md:w-20 w-full md:overflow-visible"
            : "md:w-64 w-full"
        } overflow-y-auto md:overflow-visible md:overflow-y-visible pb-32`}
        aria-label="HR Sidebar"
      >
        {/* Mobile close inside sidebar */}
        <div className="md:hidden flex items-center justify-end p-3">
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
            className="p-2 rounded-md text-gray-700 dark:text-gray-200 bg-white/10 hover:bg-white/20 transition"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <SidebarHeader
          collapsed={isDesktopCollapsed}
          onToggleCollapse={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
        />

        <div className={isDesktopCollapsed ? "md:hidden" : ""}>
          <SidebarNav
            unreadCount={unreadCount}
            handlers={{
              dashboard: handleDashboardClick,
              analytics: handleAnalyticsClick,
              applications: handleApplicationsClick,
              reapplications: handleReapplicationsClick,
              requirements: handleRequirementsClick,
              users: handleUsersClick,
              trainees: handleTraineesClick,
              scholars: handleScholarsClick,
              leaves: handleLeavesClick,
              dtrCheck: handleDTRCheckClick,
              notifications: handleNotificationsClick,
            }}
          />
        </div>

        {isDesktopCollapsed && (
          <CollapsedSidebar
            unreadCount={unreadCount}
            onExpand={() => setIsDesktopCollapsed(false)}
            handlers={{
              dashboard: handleCollapsedDashboardClick,
              analytics: handleCollapsedAnalyticsClick,
              applications: handleCollapsedApplicationsClick,
              reapplications: handleCollapsedReapplicationsClick,
              requirements: handleCollapsedRequirementsClick,
              evaluations: handleCollapsedEvaluationsClick,
              users: handleCollapsedUsersClick,
              trainees: handleCollapsedTraineesClick,
              scholars: handleCollapsedScholarsClick,
              leaves: handleCollapsedLeavesClick,
              dtrCheck: handleCollapsedDTRCheckClick,
              notifications: handleCollapsedNotificationsClick,
              profile: handleCollapsedProfileClick,
            }}
            darkMode={darkMode}
            onToggleTheme={() => setDarkMode(!darkMode)}
            onSignout={handleCollapsedSignout}
          />
        )}

        {/* Bottom controls when not collapsed */}
        {!isDesktopCollapsed ? (
          <div className="transition-all duration-300 flex flex-col items-center justify-center gap-2 p-4">
            {user && (
              <button
                onClick={handleProfileClick}
                className="w-full flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-gradient-to-r from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 border border-red-200 dark:border-red-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 hover:bg-red-100 dark:hover:bg-gray-900/30 transition-all duration-200"
                style={{ userSelect: "none" }}
                aria-label="View Profile"
                title="View Profile"
              >
                <div className="flex-shrink-0 relative">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full object-cover border-2 border-red-400 dark:border-red-600 shadow"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-red-200 dark:bg-red-900 flex items-center justify-center border-2 border-red-400 dark:border-red-600 shadow">
                      <User
                        size={22}
                        className="text-red-600 dark:text-red-300"
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-base font-bold text-gray-800 dark:text-gray-100 truncate">
                    {user?.firstname && user?.lastname
                      ? `${user.firstname} ${user.lastname}`
                      : user?.email || "User"}
                  </span>
                  {user?.email && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </span>
                  )}
                  {user?.role && (
                    <span className="text-xs font-semibold text-red-500 dark:text-red-400 mt-0.5 capitalize">
                      {user.role}
                    </span>
                  )}
                </div>
              </button>
            )}

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="group w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-400 hover:border-blue-400 dark:hover:border-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label={darkMode ? "Light Mode" : "Dark Mode"}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <>
                  <Sun
                    size={16}
                    className="text-yellow-500 group-hover:scale-110 transition-transform duration-200 drop-shadow"
                  />
                  <span className="font-medium">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon
                    size={16}
                    className="text-blue-500 group-hover:scale-110 transition-transform duration-200 drop-shadow"
                  />
                  <span className="font-medium">Dark Mode</span>
                </>
              )}
            </button>

            <button
              onClick={handleSignout}
              className="group w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 hover:bg-gradient-to-r hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/30 dark:hover:to-red-800/30 hover:text-red-700 dark:hover:text-red-300 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut
                size={16}
                className="group-hover:scale-110 transition-transform duration-200"
              />
              <span className="font-medium">Sign out</span>
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default HRSidebar;
