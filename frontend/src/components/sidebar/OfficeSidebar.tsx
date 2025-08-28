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
  Settings,
  Database,
  Briefcase,
  Users,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getRoleBasedRedirect } from "@/lib/roleUtils";

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
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(
    localStorage.getItem("sidebarCollapsed") === "true"
  );
  const [isReportsExpanded, setIsReportsExpanded] = useState(false);
  // Focus index for keyboard navigation
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

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
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handlers
  const handleDashboardClick = () => {
    const dashboardRoute = getRoleBasedRedirect(user?.role || "office");
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

  // Office-specific menu handlers
  const handleRecordsClick = () => {
    // navigate("/records");
    setIsOpen(false);
  };

  const handleReportsClick = () => {
    setIsReportsExpanded((v) => !v);
  };

  const handleAdministrationClick = () => {
    // navigate("/administration");
    setIsOpen(false);
  };

  const handleDocumentsClick = () => {
    // navigate("/documents");
    setIsOpen(false);
  };

  const handleApplicationsClick = () => {
    navigate("/applications");
    setIsOpen(false);
  };

  // Handlers for collapsed sidebar that don't expand the sidebar
  const handleCollapsedProfileClick = () => {
    navigate("/profile");
  };

  const handleCollapsedDashboardClick = () => {
    const dashboardRoute = getRoleBasedRedirect(user?.role || "office");
    navigate(dashboardRoute);
  };

  const handleCollapsedSignout = () => {
    logout();
  };

  const handleCollapsedApplicationsClick = () => {
    navigate("/applications");
  };

  // Keyboard navigation for sidebar
  const menuItems = [
    { label: "Dashboard", handler: handleDashboardClick },
    { label: "Records", handler: handleRecordsClick },
    { label: "Documents", handler: handleDocumentsClick },
    { label: "Applications", handler: handleApplicationsClick },
    { label: "Reports", handler: handleReportsClick },
    { label: "Administration", handler: handleAdministrationClick },
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
      {/* Mobile Header Bar with Toggle Button */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-red-600 dark:bg-red-700 shadow-md z-50 h-16">
        <div className="flex items-center h-full">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-white hover:bg-red-700 dark:hover:bg-red-800 transition-colors duration-200 ml-4 mr-2"
            aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
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
      />

      {/* Sidebar */}
      <div
        id="office-sidebar"
        ref={sidebarRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={`fixed left-0 bg-white dark:bg-gray-800 shadow-xl transition-all duration-300 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 ${
          isDesktopCollapsed ? "md:w-20 w-64" : "w-64"
        } top-0 h-screen border-r border-gray-200 dark:border-gray-700 focus:outline-none overflow-y-auto`}
        aria-label="Office Sidebar"
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
          className={`transition-all duration-300 ${
            isDesktopCollapsed ? "md:hidden" : "p-4"
          } flex-1 overflow-y-auto ${
            !isDesktopCollapsed ? "mt-16 md:mt-0" : ""
          }`}
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
                onClick={handleRecordsClick}
                className="group w-full flex items-center gap-3 px-4 py-3.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-red-700 dark:hover:text-red-400 rounded-xl transition-all duration-200 hover:shadow-sm border border-transparent hover:border-red-200 dark:hover:border-red-800"
                tabIndex={0}
                aria-label="Records"
                title="View Records"
                aria-current={currentPage === "Records"}
              >
                <Database
                  size={20}
                  className="group-hover:scale-110 transition-transform duration-200"
                />
                <span className="font-medium">Records</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                </div>
              </button>
            </li>
            <li>
              <button
                onClick={handleDocumentsClick}
                className="group w-full flex items-center gap-3 px-4 py-3.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-red-700 dark:hover:text-red-400 rounded-xl transition-all duration-200 hover:shadow-sm border border-transparent hover:border-red-200 dark:hover:border-red-800"
                tabIndex={0}
                aria-label="Documents"
                title="View Documents"
                aria-current={currentPage === "Documents"}
              >
                <FileText
                  size={20}
                  className="group-hover:scale-110 transition-transform duration-200"
                />
                <span className="font-medium">Documents</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                </div>
              </button>
            </li>
            <li>
              <button
                onClick={handleApplicationsClick}
                className="group w-full flex items-center gap-3 px-4 py-3.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-red-700 dark:hover:text-red-400 rounded-xl transition-all duration-200 hover:shadow-sm border border-transparent hover:border-red-200 dark:hover:border-red-800"
                tabIndex={0}
                aria-label="Applications"
                title="View Applications"
                aria-current={currentPage === "Applications"}
              >
                <Users
                  size={20}
                  className="group-hover:scale-110 transition-transform duration-200"
                />
                <span className="font-medium">Applications</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                </div>
              </button>
            </li>
            <li>
              {/* Reports Menu Item with Submenu */}
              <div>
                <button
                  onClick={handleReportsClick}
                  className="group w-full flex items-center gap-3 px-4 py-3.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-red-700 dark:hover:text-red-400 rounded-xl transition-all duration-200 hover:shadow-sm border border-transparent hover:border-red-200 dark:hover:border-red-800"
                  tabIndex={0}
                  aria-label="Reports"
                  aria-expanded={isReportsExpanded}
                  aria-controls="reports-submenu"
                  title="Show Reports submenu"
                >
                  <Briefcase
                    size={20}
                    className="group-hover:scale-110 transition-transform duration-200"
                  />
                  <span className="font-medium">Reports</span>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    {isReportsExpanded ? (
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
                  id="reports-submenu"
                  className={`overflow-hidden transition-all duration-300 ${
                    isReportsExpanded
                      ? "max-h-48 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                  aria-hidden={!isReportsExpanded}
                >
                  <div className="pl-8 pr-4 py-2 space-y-1">
                    <button
                      onClick={() => {
                        /* navigate to report 1 */
                      }}
                      className="group w-full flex items-center gap-3 px-3 py-2.5 text-left text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all duration-200"
                      tabIndex={isReportsExpanded ? 0 : -1}
                      aria-label="Report 1"
                      title="Report 1"
                    >
                      {/* Add icon if needed */}
                      <span className="font-medium">Report 1</span>
                    </button>
                    <button
                      onClick={() => {
                        /* navigate to report 2 */
                      }}
                      className="group w-full flex items-center gap-3 px-3 py-2.5 text-left text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all duration-200"
                      tabIndex={isReportsExpanded ? 0 : -1}
                      aria-label="Report 2"
                      title="Report 2"
                    >
                      <span className="font-medium">Report 2</span>
                    </button>
                  </div>
                </div>
              </div>
            </li>
            <li>
              <button
                onClick={handleAdministrationClick}
                className="group w-full flex items-center gap-3 px-4 py-3.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-red-700 dark:hover:text-red-400 rounded-xl transition-all duration-200 hover:shadow-sm border border-transparent hover:border-red-200 dark:hover:border-red-800"
                tabIndex={0}
                aria-label="Administration"
                title="View Administration"
                aria-current={currentPage === "Administration"}
              >
                <Settings
                  size={20}
                  className="group-hover:scale-110 transition-transform duration-200"
                />
                <span className="font-medium">Administration</span>
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
          </ul>
        </nav>

        {/* Collapsed state - Enhanced mini sidebar */}
        {isDesktopCollapsed && (
          <div className="hidden md:flex flex-col items-center py-4 space-y-4">
            <div className="group relative">
              <button
                onClick={() => setIsDesktopCollapsed(false)}
                className="p-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 shadow-sm hover:shadow-md border border-transparent hover:border-red-200 dark:hover:border-red-800"
                aria-label="Expand sidebar"
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
                >
                  <Home size={16} />
                </button>
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  Dashboard
                </div>
              </div>

              <div className="group relative">
                <button
                  onClick={handleRecordsClick}
                  className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                >
                  <Database size={16} />
                </button>
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  Records
                </div>
              </div>

              <div className="group relative">
                <button
                  onClick={handleDocumentsClick}
                  className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                >
                  <FileText size={16} />
                </button>
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  Documents
                </div>
              </div>

              <div className="group relative">
                <button
                  onClick={handleCollapsedApplicationsClick}
                  className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                >
                  <Users size={16} />
                </button>
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  Applications
                </div>
              </div>

              <div className="group relative">
                <button
                  onClick={handleReportsClick}
                  className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                >
                  <Briefcase size={16} />
                </button>
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  Reports
                </div>
              </div>

              <div className="group relative">
                <button
                  onClick={handleAdministrationClick}
                  className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                >
                  <Settings size={16} />
                </button>
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  Administration
                </div>
              </div>

              <div className="group relative">
                <button
                  onClick={handleCollapsedProfileClick}
                  className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                >
                  <User size={16} />
                </button>
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  Profile
                </div>
              </div>

              <div className="group relative">
                <button
                  onClick={handleCollapsedSignout}
                  className="p-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200"
                >
                  <LogOut size={16} />
                </button>
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  Sign out
                </div>
              </div>

              {/* Theme toggle in collapsed state */}
              <div className="group relative">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                >
                  {darkMode ? (
                    <Sun size={16} className="text-yellow-500" />
                  ) : (
                    <Moon size={16} className="text-red-500" />
                  )}
                </button>
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </div>
              </div>
            </div>
          </div>
        )}

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

export default OfficeSidebar;
