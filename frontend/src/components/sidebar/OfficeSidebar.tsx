import { useState, useEffect, useRef, useCallback } from "react";
import type { RefObject } from "react";
// Helper for dynamic tooltip positioning
const useTooltipPosition = <T extends HTMLElement>(): [
  RefObject<T>,
  number
] => {
  const iconRef = useRef<T>(null) as RefObject<T>;
  const [top, setTop] = useState(0);
  const updateTop = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setTop(rect.top + window.scrollY + rect.height / 2);
    }
  };
  useEffect(() => {
    updateTop();
    window.addEventListener("resize", updateTop);
    return () => window.removeEventListener("resize", updateTop);
  }, []);
  return [iconRef, top];
};

import {
  User,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Home,
  Calendar,
  FileText,
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

  // Focus index for keyboard navigation
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  // Tooltip refs and positions for collapsed sidebar
  const [expandRef, expandTop] = useTooltipPosition<HTMLButtonElement>();
  const [dashboardRef, dashboardTop] = useTooltipPosition<HTMLButtonElement>();
  const [dtrRef, dtrTop] = useTooltipPosition<HTMLButtonElement>();
  const [evalRef, evalTop] = useTooltipPosition<HTMLButtonElement>();
  const [leaveRef, leaveTop] = useTooltipPosition<HTMLButtonElement>();
  const [requestsRef, requestsTop] = useTooltipPosition<HTMLButtonElement>();
  const [profileRef, profileTop] = useTooltipPosition<HTMLButtonElement>();
  const [themeRef, themeTop] = useTooltipPosition<HTMLButtonElement>();
  const [signoutRef, signoutTop] = useTooltipPosition<HTMLButtonElement>();

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
    const dashboardRoute = getRoleBasedRedirect("office");
    navigate(dashboardRoute);
    setIsOpen(false);
  };

  const handleSignout = () => {
    logout();
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setIsOpen(false);
  };

  // (Removed Records/Documents/Applications/Reports/Administration handlers)

  // Handlers for collapsed sidebar that don't expand the sidebar
  const handleCollapsedDashboardClick = () => {
    const dashboardRoute = getRoleBasedRedirect("office");
    navigate(dashboardRoute);
  };

  const handleCollapsedDtrClick = () => {
    navigate("/office/dtr");
  };

  const handleCollapsedEvalClick = () => {
    navigate("/office/evaluation");
  };

  const handleCollapsedRequestsClick = () => {
    navigate("/office/requests");
  };

  const handleCollapsedProfileClick = () => {
    navigate("/profile");
  };

  const handleCollapsedSignout = () => {
    logout();
  };

  // (removed collapsed handlers for removed items)

  // Keyboard navigation for sidebar
  const menuItems = [
    { label: "Dashboard", handler: handleDashboardClick },

    {
      label: "DTR",
      handler: () => {
        navigate("/office/dtr");
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
      label: "Requests",
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
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/office/dtr");
                  setIsOpen(false);
                }}
                type="button"
                className="group w-full flex items-center gap-3 px-4 py-3.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-red-700 dark:hover:text-red-400 rounded-xl transition-all duration-200 hover:shadow-sm border border-transparent hover:border-red-200 dark:hover:border-red-800"
                tabIndex={0}
                aria-label="DTR"
                title="DTR"
                aria-current={currentPage === "DTR"}
              >
                <Calendar
                  size={20}
                  className="group-hover:scale-110 transition-transform duration-200"
                />
                <span className="font-medium">DTR</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                </div>
              </button>
            </li>
            <li>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/office/evaluation");
                  setIsOpen(false);
                }}
                type="button"
                className="group w-full flex items-center gap-3 px-4 py-3.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-red-700 dark:hover:text-red-400 rounded-xl transition-all duration-200 hover:shadow-sm border border-transparent hover:border-red-200 dark:hover:border-red-800"
                tabIndex={0}
                aria-label="Evaluation"
                title="Evaluation"
                aria-current={currentPage === "Evaluation"}
              >
                <Calendar
                  size={20}
                  className="group-hover:scale-110 transition-transform duration-200"
                />
                <span className="font-medium">Evaluation</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                </div>
              </button>
            </li>
            <li>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/office/leave-requests");
                  setIsOpen(false);
                }}
                type="button"
                className="group w-full flex items-center gap-3 px-4 py-3.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-red-700 dark:hover:text-red-400 rounded-xl transition-all duration-200 hover:shadow-sm border border-transparent hover:border-red-200 dark:hover:border-red-800"
                tabIndex={0}
                aria-label="Leave Requests"
                title="Leave Requests"
                aria-current={currentPage === "Leave Requests"}
              >
                <FileText
                  size={20}
                  className="group-hover:scale-110 transition-transform duration-200"
                />
                <span className="font-medium">Leave Requests</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                </div>
              </button>
            </li>
            <li>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/office/requests");
                  setIsOpen(false);
                }}
                type="button"
                className="group w-full flex items-center gap-3 px-4 py-3.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-red-700 dark:hover:text-red-400 rounded-xl transition-all duration-200 hover:shadow-sm border border-transparent hover:border-red-200 dark:hover:border-red-800"
                tabIndex={0}
                aria-label="Requests"
                title="Requests"
                aria-current={currentPage === "Requests"}
              >
                <FileText
                  size={20}
                  className="group-hover:scale-110 transition-transform duration-200"
                />
                <span className="font-medium">Requests</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                </div>
              </button>
            </li>
            <li>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/office/scholars");
                  setIsOpen(false);
                }}
                type="button"
                className="group w-full flex items-center gap-3 px-4 py-3.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-red-700 dark:hover:text-red-400 rounded-xl transition-all duration-200 hover:shadow-sm border border-transparent hover:border-red-200 dark:hover:border-red-800"
                tabIndex={0}
                aria-label="Scholars"
                title="Scholars"
                aria-current={currentPage === "Scholars"}
              >
                <FileText
                  size={20}
                  className="group-hover:scale-110 transition-transform duration-200"
                />
                <span className="font-medium">Scholars</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                </div>
              </button>
            </li>
          </ul>
        </nav>

        {/* Collapsed state - Enhanced mini sidebar */}
        {isDesktopCollapsed && (
          <div
            className="hidden md:flex flex-col items-center py-4 h-full relative overflow-y-auto overflow-x-hidden"
            aria-label="Collapsed Sidebar"
            style={{ minHeight: "100%" }}
          >
            <div className="flex-1 flex flex-col items-center space-y-4 w-full">
              <div className="group relative">
                <button
                  ref={expandRef}
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
                <div
                  className="fixed"
                  style={{
                    left: "80px",
                    top: expandTop,
                    zIndex: 999,
                    transform: "translateY(-50%)",
                  }}
                >
                  <span className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Expand Menu
                  </span>
                </div>
              </div>

              <div className="group relative">
                <button
                  ref={dashboardRef}
                  onClick={handleCollapsedDashboardClick}
                  className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                  aria-label="Dashboard"
                  title="Dashboard"
                >
                  <Home size={16} />
                </button>
                <div
                  className="fixed"
                  style={{
                    left: "80px",
                    top: dashboardTop,
                    zIndex: 999,
                    transform: "translateY(-50%)",
                  }}
                >
                  <span className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Dashboard
                  </span>
                </div>
              </div>

              <div className="group relative">
                <button
                  ref={dtrRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCollapsedDtrClick();
                  }}
                  className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                  aria-label="DTR"
                  title="DTR"
                >
                  <Calendar size={16} />
                </button>
                <div
                  className="fixed"
                  style={{
                    left: "80px",
                    top: dtrTop,
                    zIndex: 999,
                    transform: "translateY(-50%)",
                  }}
                >
                  <span className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    DTR
                  </span>
                </div>
              </div>

              <div className="group relative">
                <button
                  ref={evalRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCollapsedEvalClick();
                  }}
                  className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                  aria-label="Evaluation"
                  title="Evaluation"
                >
                  <Calendar size={16} />
                </button>
                <div
                  className="fixed"
                  style={{
                    left: "80px",
                    top: evalTop,
                    zIndex: 999,
                    transform: "translateY(-50%)",
                  }}
                >
                  <span className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Evaluation
                  </span>
                </div>
              </div>

              <div className="group relative">
                <button
                  ref={leaveRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/office/leave-requests");
                  }}
                  className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                  aria-label="Leave Requests"
                  title="Leave Requests"
                >
                  <FileText size={16} />
                </button>
                <div
                  className="fixed"
                  style={{
                    left: "80px",
                    top: leaveTop,
                    zIndex: 999,
                    transform: "translateY(-50%)",
                  }}
                >
                  <span className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Leave Requests
                  </span>
                </div>
              </div>

              <div className="group relative">
                <button
                  ref={requestsRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/office/requests");
                  }}
                  className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                  aria-label="Requests"
                  title="Requests"
                >
                  <FileText size={16} />
                </button>
                <div
                  className="fixed"
                  style={{
                    left: "80px",
                    top: requestsTop,
                    zIndex: 999,
                    transform: "translateY(-50%)",
                  }}
                >
                  <span className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Requests
                  </span>
                </div>
              </div>

              <div className="group relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/office/scholars");
                  }}
                  className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                  aria-label="Scholars"
                  title="Scholars"
                >
                  <FileText size={16} />
                </button>
                <div
                  className="fixed"
                  style={{
                    left: "80px",
                    top: requestsTop + 48,
                    zIndex: 999,
                    transform: "translateY(-50%)",
                  }}
                >
                  <span className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Scholars
                  </span>
                </div>
              </div>

              {/* primary mini icons only - profile/theme/signout are in the bottom sticky area */}
            </div>
            {/* Bottom sticky signout and theme switcher */}
            <div
              className="w-full flex flex-col items-center gap-2 pb-6"
              style={{ bottom: "45px", left: 0, top: "auto" }}
            >
              <div className="group relative w-full flex justify-center">
                <button
                  ref={profileRef}
                  onClick={handleCollapsedProfileClick}
                  className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                  aria-label="Profile"
                  title="Profile"
                >
                  <User size={16} />
                </button>
                <div
                  className="fixed"
                  style={{
                    left: "80px",
                    top: profileTop,
                    zIndex: 999,
                    transform: "translateY(-50%)",
                  }}
                >
                  <span className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Profile
                  </span>
                </div>
              </div>
              <div className="group relative w-full flex justify-center">
                <button
                  ref={themeRef}
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
                <div
                  className="fixed"
                  style={{
                    left: "80px",
                    top: themeTop,
                    zIndex: 999,
                    transform: "translateY(-50%)",
                  }}
                >
                  <span className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    {darkMode ? "Light Mode" : "Dark Mode"}
                  </span>
                </div>
              </div>
              <div className="group relative w-full flex justify-center">
                <button
                  ref={signoutRef}
                  onClick={handleCollapsedSignout}
                  className="p-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
                <div
                  className="fixed"
                  style={{
                    left: "80px",
                    top: signoutTop,
                    zIndex: 999,
                    transform: "translateY(-50%)",
                  }}
                >
                  <span className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Sign out
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Re-introduced User Info for desktop (bottom) */}
        {!isDesktopCollapsed ? (
          <div
            className="transition-all duration-300 flex flex-col items-center justify-center gap-2 p-4"
            style={{
              position: "absolute",
              bottom: 4,
              left: 0,
              right: 0,
              background: "none",
              border: "none",
              zIndex: 50,
            }}
          >
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
