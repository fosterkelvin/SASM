import { useState, useEffect, useRef, useCallback } from "react";
import {
  User,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Home,
  FileText,
  ChevronDown,
  ChevronRight,
  Bell,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getRoleBasedRedirect } from "@/lib/roleUtils";
import { useUnreadNotificationCount } from "@/hooks/useUnreadNotificationCount";

interface StudentSidebarProps {
  currentPage?: string;
  onCollapseChange?: (collapsed: boolean) => void;
}

const StudentSidebar = ({
  currentPage = "Dashboard",
  onCollapseChange,
}: StudentSidebarProps) => {
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
  const [isFormsExpanded, setIsFormsExpanded] = useState(false);
  // Focus index for keyboard navigation
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  // Notify parent component when collapse state changes
  useEffect(() => {
    onCollapseChange?.(isDesktopCollapsed);
  }, [isDesktopCollapsed, onCollapseChange]);

  // Sidebar action handlers
  const handleProfileClick = () => {
    navigate("/profile");
    setIsOpen(false);
  };

  const handleNotificationsClick = () => {
    navigate("/notifications");
    setIsOpen(false);
  };

  const handleApplyClick = () => {
    navigate("/application");
    setIsOpen(false);
  };

  const handleReapplyClick = () => {
    navigate("/reapply");
    setIsOpen(false);
  };

  const handleLeaveClick = () => {
    navigate("/leave");
    setIsOpen(false);
  };

  const handleDashboardClick = () => {
    const dashboardRoute = getRoleBasedRedirect(user?.role || "student");
    navigate(dashboardRoute);
    setIsOpen(false);
  };

  const handleSignout = () => {
    logout();
    setIsOpen(false);
  };

  // Handlers for collapsed sidebar that don't expand the sidebar
  const handleCollapsedProfileClick = () => {
    navigate("/profile");
  };

  const handleCollapsedNotificationsClick = () => {
    navigate("/notifications");
  };

  const handleCollapsedApplyClick = () => {
    navigate("/application");
  };

  const handleCollapsedReapplyClick = () => {
    navigate("/reapply");
  };

  const handleCollapsedLeaveClick = () => {
    navigate("/leave");
  };

  const handleCollapsedDashboardClick = () => {
    const dashboardRoute = getRoleBasedRedirect(user?.role || "student");
    navigate(dashboardRoute);
  };

  const handleCollapsedSignout = () => {
    logout();
  };

  // Keyboard navigation for sidebar
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

  // ...existing code...

  // Handlers for sidebar actions
  // ...existing code...

  // Now define menuItems after handlers
  const menuItems = [
    { label: "Dashboard", handler: handleDashboardClick },
    { label: "Profile", handler: handleProfileClick },
    { label: "Notifications", handler: handleNotificationsClick },
    { label: "Forms", handler: () => setIsFormsExpanded((v) => !v) },
    { label: "Sign out", handler: handleSignout },
  ];
  // Icons for submenu
  const ApplyIcon = <FileText size={16} className="text-red-500 mr-2" />;
  const ReapplyIcon = <FileText size={16} className="text-indigo-500 mr-2" />;

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
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // ...existing code...

  return (
    <>
      {/* Mobile Header Bar with Toggle Button */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-red-600 dark:bg-red-700 shadow-md z-50 h-16">
        <div className="flex items-center h-full">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-white hover:bg-red-700 dark:hover:bg-red-800 transition-colors duration-200 ml-4 mr-2"
            aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={isOpen}
            aria-controls="student-sidebar"
          >
            <div className="relative w-6 h-6">
              <Menu
                size={24}
                className={`absolute transition-all duration-300 ${
                  isOpen ? "opacity-0 rotate-180" : "opacity-100 rotate-0"
                }`}
              />
              <X
                size={24}
                className={`absolute transition-all duration-300 ${
                  isOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-180"
                }`}
              />
            </div>
          </button>
          <div className="flex items-center gap-3 pl-6">
            <img src="/UBLogo.svg" alt="Logo" className="h-6 w-auto" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">SASM-IMS</span>
              <span className="text-xs text-red-200">{currentPage}</span>
            </div>
          </div>
        </div>
      </div>

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
        id="student-sidebar"
        ref={sidebarRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={`fixed left-0 bg-white dark:bg-gray-800 shadow-xl transition-all duration-300 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 ${
          isDesktopCollapsed ? "md:w-20" : "w-64"
        } top-0 h-screen border-r border-gray-200 dark:border-gray-700 focus:outline-none overflow-y-auto pt-16 md:pt-0`}
        aria-label="Student Sidebar"
      >
        {/* Header - Enhanced design */}
        <div
          className={`hidden md:flex transition-all duration-300 ${
            isDesktopCollapsed ? "px-4 py-10" : "px-6 py-10"
          } border-b border-red-200 dark:border-red-800 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 items-center h-[73px]`}
        >
          <div
            className={`flex items-center w-full ${
              isDesktopCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            <div
              className={`flex items-center ${
                isDesktopCollapsed ? "flex-col gap-2" : "gap-3"
              } flex-1 min-w-0`}
            >
              <div
                className={`relative transition-all duration-300 ${
                  isDesktopCollapsed ? "transform hover:scale-110" : ""
                }`}
              >
                <img
                  src="/UBLogo.svg"
                  alt="Logo"
                  className={`w-auto flex-shrink-0 transition-all duration-300 drop-shadow-sm ${
                    isDesktopCollapsed ? "h-12" : "h-10"
                  }`}
                />
                {isDesktopCollapsed && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white rounded-full opacity-90"></div>
                )}
              </div>
              {!isDesktopCollapsed && (
                <span className="text-base font-bold text-white dark:text-white tracking-tight whitespace-nowrap">
                  SASM-IMS
                </span>
              )}
            </div>
            {/* Desktop Toggle Button - Enhanced */}
            {!isDesktopCollapsed && (
              <button
                onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
                className="group p-3 rounded-xl text-white dark:text-white bg-red-700/30 hover:bg-red-800 dark:hover:bg-red-700 hover:text-white dark:hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl border border-red-400/50 hover:border-red-300 dark:hover:border-red-600 backdrop-blur-sm flex-shrink-0"
                aria-label="Collapse sidebar"
              >
                <Menu
                  size={20}
                  className="transform group-hover:scale-110 transition-transform duration-200 drop-shadow-sm"
                />
              </button>
            )}
          </div>
        </div>

        {/* Menu Items - Enhanced */}
        <nav
          className={`transition-all duration-300 p-4 flex-1 overflow-y-auto`}
          aria-label="Sidebar Navigation"
        >
          <ul className="space-y-2">
            <li>
              <button
                onClick={handleDashboardClick}
                className="group w-full flex items-center gap-3 px-4 py-3.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-red-700 dark:hover:text-red-400 rounded-xl transition-all duration-200 hover:shadow-sm border border-transparent hover:border-red-200 dark:hover:border-red-800"
                tabIndex={0}
                aria-label="Dashboard"
                title="Go to Dashboard"
                aria-current={currentPage === "Dashboard"}
              >
                <Home
                  size={20}
                  className="group-hover:scale-110 transition-transform duration-200"
                />
                <span className="font-medium">Dashboard</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                </div>
              </button>
            </li>
            <li>
              <button
                onClick={handleProfileClick}
                className="group w-full flex items-center gap-3 px-4 py-3.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-red-700 dark:hover:text-red-400 rounded-xl transition-all duration-200 hover:shadow-sm border border-transparent hover:border-red-200 dark:hover:border-red-800"
                tabIndex={0}
                aria-label="Profile"
                title="View Profile"
                aria-current={currentPage === "Profile"}
              >
                <User
                  size={20}
                  className="group-hover:scale-110 transition-transform duration-200"
                />
                <span className="font-medium">Profile</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                </div>
              </button>
            </li>
            <li>
              <button
                onClick={handleNotificationsClick}
                className="group w-full flex items-center gap-3 px-4 py-3.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-red-700 dark:hover:text-red-400 rounded-xl transition-all duration-200 hover:shadow-sm border border-transparent hover:border-red-200 dark:hover:border-red-800"
                tabIndex={0}
                aria-label="Notifications"
                title="View Notifications"
                aria-current={currentPage === "Notifications"}
              >
                <div className="relative">
                  <Bell
                    size={20}
                    className="group-hover:scale-110 transition-transform duration-200"
                  />
                  {unreadCount > 0 && (
                    <span
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
                      aria-label={`You have ${unreadCount} unread notifications`}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
                <span className="font-medium">Notifications</span>
                {unreadCount > 0 && (
                  <div className="ml-auto">
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-medium">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  </div>
                )}
              </button>
            </li>
            <li>
              {/* Forms Menu Item with Submenu */}
              <div>
                <button
                  onClick={() => setIsFormsExpanded(!isFormsExpanded)}
                  className="group w-full flex items-center gap-3 px-4 py-3.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-red-700 dark:hover:text-red-400 rounded-xl transition-all duration-200 hover:shadow-sm border border-transparent hover:border-red-200 dark:hover:border-red-800"
                  tabIndex={0}
                  aria-label="Forms"
                  aria-expanded={isFormsExpanded}
                  aria-controls="forms-submenu"
                  title="Show Forms submenu"
                >
                  <FileText
                    size={20}
                    className="group-hover:scale-110 transition-transform duration-200"
                  />
                  <span className="font-medium">Forms</span>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    </div>
                    {isFormsExpanded ? (
                      <ChevronDown
                        size={16}
                        className="transition-transform duration-200"
                      />
                    ) : (
                      <ChevronRight
                        size={16}
                        className="transition-transform duration-200"
                      />
                    )}
                  </div>
                </button>

                {/* Submenu */}
                <div
                  id="forms-submenu"
                  className={`overflow-hidden transition-all duration-300 ${
                    isFormsExpanded
                      ? "max-h-48 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                  aria-hidden={!isFormsExpanded}
                >
                  <div className="pl-8 pr-4 py-2 space-y-1">
                    <button
                      onClick={handleApplyClick}
                      className={`group w-full flex items-center gap-3 px-3 py-2.5 text-left text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all duration-200 ${
                        currentPage === "Apply"
                          ? "bg-red-50 dark:bg-gray-700 border-red-200 dark:border-red-800"
                          : ""
                      }`}
                      tabIndex={isFormsExpanded ? 0 : -1}
                      aria-label="Apply Form"
                      title="Apply"
                      aria-current={currentPage === "Apply"}
                    >
                      {ApplyIcon}
                      <span className="font-medium">Apply</span>
                    </button>
                    <button
                      onClick={handleReapplyClick}
                      className={`group w-full flex items-center gap-3 px-3 py-2.5 text-left text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-all duration-200 ${
                        currentPage === "Re-apply"
                          ? "bg-indigo-50 dark:bg-gray-700 border-indigo-200 dark:border-indigo-800"
                          : ""
                      }`}
                      tabIndex={isFormsExpanded ? 0 : -1}
                      aria-label="Re-apply Form"
                      title="Re-apply"
                      aria-current={currentPage === "Re-apply"}
                    >
                      {ReapplyIcon}
                      <span className="font-medium">Re-apply</span>
                    </button>
                    <button
                      onClick={handleLeaveClick}
                      className={`group w-full flex items-center gap-3 px-3 py-2.5 text-left text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-yellow-600 dark:hover:text-yellow-400 rounded-lg transition-all duration-200 ${
                        currentPage === "Leave"
                          ? "bg-yellow-50 dark:bg-gray-700 border-yellow-200 dark:border-yellow-800"
                          : ""
                      }`}
                      tabIndex={isFormsExpanded ? 0 : -1}
                      aria-label="Leave Form"
                      title="Leave"
                      aria-current={currentPage === "Leave"}
                    >
                      <FileText size={16} className="text-yellow-500 mr-2" />
                      <span className="font-medium">Leave</span>
                    </button>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </nav>

        {/* Collapsed state - Enhanced mini sidebar */}
        {isDesktopCollapsed && (
          <div
            className="hidden md:flex flex-col items-center py-4 h-full relative"
            aria-label="Collapsed Sidebar"
            style={{ minHeight: "100%" }}
          >
            <div className="flex-1 flex flex-col items-center space-y-4 w-full">
              <div className="group relative">
                <button
                  onClick={() => setIsDesktopCollapsed(false)}
                  className="p-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 shadow-sm hover:shadow-md border border-transparent hover:border-red-200 dark:hover:border-red-800"
                  aria-label="Expand sidebar"
                  title="Expand Menu"
                >
                  <Menu
                    size={18}
                    className="transform group-hover:scale-110 transition-transform duration-200"
                  />
                </button>
                {/* Tooltip */}
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  Expand Menu
                </div>
              </div>

              {/* Mini menu icons */}
              <div className="space-y-2">
                <div className="group relative">
                  <button
                    onClick={handleCollapsedDashboardClick}
                    className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                    aria-label="Dashboard"
                    title="Dashboard"
                  >
                    <Home size={16} />
                  </button>
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                    Dashboard
                  </div>
                </div>

                <div className="group relative">
                  <button
                    onClick={handleCollapsedProfileClick}
                    className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                    aria-label="Profile"
                    title="Profile"
                  >
                    <User size={16} />
                  </button>
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                    Profile
                  </div>
                </div>

                <div className="group relative">
                  <button
                    onClick={handleCollapsedNotificationsClick}
                    className="relative p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                    aria-label="Notifications"
                    title="Notifications"
                  >
                    <Bell size={16} />
                    {unreadCount > 0 && (
                      <span
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium"
                        aria-label={`You have ${unreadCount} unread notifications`}
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-1 bg-red-500 text-white rounded-full px-1">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>

                <div className="group relative">
                  <button
                    onClick={() => setIsFormsExpanded(!isFormsExpanded)}
                    className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                    aria-label="Forms"
                    aria-expanded={isFormsExpanded}
                    title="Forms"
                  >
                    <FileText size={16} />
                  </button>
                  {/* Collapsed Forms Submenu - Improved */}
                  <div
                    className={`absolute left-full ml-2 top-0 min-w-[160px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 ${
                      isFormsExpanded ? "opacity-100" : ""
                    }`}
                    aria-hidden={!isFormsExpanded}
                  >
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 rounded-t-xl">
                        Forms
                      </div>
                      <button
                        onClick={handleCollapsedApplyClick}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors duration-200"
                        aria-label="Apply"
                        title="Apply"
                      >
                        <FileText size={16} className="text-red-500" />
                        <span>Apply</span>
                      </button>
                      <button
                        onClick={handleCollapsedReapplyClick}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors duration-200"
                        aria-label="Re-apply"
                        title="Re-apply"
                      >
                        <FileText size={16} className="text-indigo-500" />
                        <span>Re-apply</span>
                      </button>
                      <button
                        onClick={handleCollapsedLeaveClick}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-gray-700 hover:text-yellow-600 dark:hover:text-yellow-400 rounded transition-colors duration-200"
                        aria-label="Leave"
                        title="Leave"
                      >
                        <FileText size={16} className="text-yellow-500" />
                        <span>Leave</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Bottom sticky signout and theme switcher */}
            <div
              className="w-full sticky flex flex-col items-center gap-2 pb-6"
              style={{ bottom: "8px", left: 0, top: "auto" }}
            >
              <div className="group relative w-full flex justify-center">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                  aria-label={darkMode ? "Light Mode" : "Dark Mode"}
                  title={
                    darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                  }
                >
                  {darkMode ? (
                    <Sun size={16} className="text-yellow-500" />
                  ) : (
                    <Moon size={16} className="text-blue-500" />
                  )}
                </button>
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </div>
              </div>
              <div className="group relative w-full flex justify-center">
                <button
                  onClick={handleCollapsedSignout}
                  className="p-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  Sign out
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Theme Switcher and Sign out at Bottom - Enhanced */}
        {/* Theme Switcher and Sign out at Bottom - Always visible for both desktop and mobile */}
        {!isDesktopCollapsed ? (
          <div
            className="transition-all duration-300 flex flex-col items-center justify-center gap-2 p-4"
            style={{
              position: "absolute",
              bottom: 32,
              left: 0,
              right: 0,
              background: "none",
              border: "none",
              zIndex: 50,
            }}
          >
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

export default StudentSidebar;
