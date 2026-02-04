import { useState, useEffect, useRef, useCallback } from "react";
import { User, LogOut, Sun, Moon, X } from "lucide-react";
import SidebarHeader from "./components/SidebarHeader";
import SidebarNav from "./components/SidebarNav";
import CollapsedSidebar from "./components/CollapsedSidebar";
import MobileHeader from "./components/MobileHeader";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useUnreadNotificationCount } from "@/hooks/useUnreadNotificationCount";

interface OfficeSidebarProps {
  currentPage?: string;
  onCollapseChange?: (collapsed: boolean) => void;
}

const OfficeSidebar = ({
  currentPage = "Dashboard",
  onCollapseChange,
}: OfficeSidebarProps) => {
  // Ref for keyboard navigation
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { data: unreadCountData } = useUnreadNotificationCount();
  const unreadCount = unreadCountData?.unreadCount || 0;
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(
    localStorage.getItem("sidebarCollapsed") === "true"
  );

  // Focus index for keyboard navigation
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  // Note: tooltip logic removed in favor of modular CollapsedSidebar component

  // Notify parent component when collapse state changes
  useEffect(() => {
    onCollapseChange?.(isDesktopCollapsed);
  }, [isDesktopCollapsed, onCollapseChange]);

  // Persist sidebar collapse state
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isDesktopCollapsed.toString());
  }, [isDesktopCollapsed]);

  // Apply theme on mount
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Close sidebar on screen resize for mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar on escape key press and focus management
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isOpen]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
      // move focus into sidebar for keyboard users
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
    // Navigate directly to office dashboard (profile already selected at this point)
    navigate("/office-dashboard");
    setIsOpen(false);
  };

  const handleSignout = () => {
    logout();
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    navigate("/office/profile");
    setIsOpen(false);
  };

  const handleNotificationsClick = () => {
    navigate("/notifications");
    setIsOpen(false);
  };

  // (Removed Records/Documents/Applications/Reports/Administration handlers)

  // Handlers for collapsed sidebar that don't expand the sidebar
  // collapsed handlers moved inline to CollapsedSidebar usage

  // (removed collapsed handlers for removed items)

  // Keyboard navigation for sidebar
  const menuItems = [
    { label: "Dashboard", handler: handleDashboardClick },
    {
      label: "DTR Check",
      handler: () => {
        navigate("/office/dtr-check");
        setIsOpen(false);
      },
    },
    {
      label: "DTR Report",
      handler: () => {
        navigate("/office/dtr-report");
        setIsOpen(false);
      },
    },
    {
      label: "Evaluation",
      handler: () => {
        navigate("/office/evaluation");
        setIsOpen(false);
      },
    },
    {
      label: "Leave Requests",
      handler: () => {
        navigate("/office/leave-requests");
        setIsOpen(false);
      },
    },
    {
      label: "Scholar Request",
      handler: () => {
        navigate("/office/requests");
        setIsOpen(false);
      },
    },
    {
      label: "Scholars",
      handler: () => {
        navigate("/office/scholars");
        setIsOpen(false);
      },
    },
    {
      label: "My Trainees",
      handler: () => {
        navigate("/office/my-trainees");
        setIsOpen(false);
      },
    },
    { label: "Notifications", handler: handleNotificationsClick },
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

      {/* Overlay for mobile */}
      <div
        className={`md:hidden fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? "opacity-50 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden={!isOpen}
      />

      {/* Sidebar */}
      <div
        id="office-sidebar"
        ref={sidebarRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 shadow-xl transition-all duration-300 ease-in-out z-50 border-r border-gray-200 dark:border-gray-700 focus:outline-none flex flex-col overflow-hidden ${
          // Mobile: slide in/out full width. Desktop: present and optionally collapsed.
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 ${
          isDesktopCollapsed ? "md:w-20 w-full" : "md:w-64 w-full"
        }`}
        aria-label="Office Sidebar"
      >
        {/* Mobile close button inside the sidebar for easier access */}
        <div className="md:hidden flex items-center justify-end p-3">
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
            className="p-2 rounded-md text-gray-700 dark:text-gray-200 bg-white/10 hover:bg-white/20 transition"
          >
            <X size={20} />
          </button>
        </div>
        <SidebarHeader
          collapsed={isDesktopCollapsed}
          onToggleCollapse={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
        />

        {/* Scrollable middle area */}
        <div className="flex-1 min-h-0">
          {!isDesktopCollapsed ? (
            <div className="h-full overflow-y-auto">
              <div className={isDesktopCollapsed ? "md:hidden" : ""}>
                <SidebarNav
                  handlers={{
                    dashboard: handleDashboardClick,
                    dtrCheck: () => {
                      navigate("/office/dtr-check");
                      setIsOpen(false);
                    },
                    dtrReport: () => {
                      navigate("/office/dtr-report");
                      setIsOpen(false);
                    },
                    evaluation: () => {
                      navigate("/office/evaluation");
                      setIsOpen(false);
                    },
                    leave: () => {
                      navigate("/office/leave-requests");
                      setIsOpen(false);
                    },
                    requests: () => {
                      navigate("/office/requests");
                      setIsOpen(false);
                    },
                    scholars: () => {
                      navigate("/office/scholars");
                      setIsOpen(false);
                    },
                    trainees: () => {
                      navigate("/office/my-trainees");
                      setIsOpen(false);
                    },
                    notifications: handleNotificationsClick,
                  }}
                  unreadNotificationCount={unreadCount}
                />
              </div>
            </div>
          ) : (
            <CollapsedSidebar
              onExpand={() => setIsDesktopCollapsed(false)}
              handlers={{
                dashboard: () => navigate("/office-dashboard"),
                dtrCheck: () => navigate("/office/dtr-check"),
                dtrReport: () => navigate("/office/dtr-report"),
                evaluation: () => navigate("/office/evaluation"),
                leave: () => navigate("/office/leave-requests"),
                requests: () => navigate("/office/requests"),
                scholars: () => navigate("/office/scholars"),
                trainees: () => navigate("/office/my-trainees"),
                notifications: () => navigate("/notifications"),
                profile: () => navigate("/office/profile"),
              }}
              darkMode={darkMode}
              onToggleTheme={() => setDarkMode(!darkMode)}
              onSignout={() => logout()}
              unreadNotificationCount={unreadCount}
            />
          )}
        </div>

        {/* Re-introduced User Info for desktop (bottom) */}
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
                    {user?.role === "office" && user?.officeName
                      ? user.officeName
                      : user?.firstname && user?.lastname
                      ? `${user.firstname} ${user.lastname}`
                      : user?.email || "User"}
                  </span>
                  {user?.profileName && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      Profile: {user.profileName}
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
            <div className="w-full flex flex-col items-center justify-center gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="group w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-400 hover:border-blue-400 dark:hover:border-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label={darkMode ? "Light Mode" : "Dark Mode"}
                title={
                  darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                }
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
          </div>
        ) : null}
      </div>
    </>
  );
};

export default OfficeSidebar;
