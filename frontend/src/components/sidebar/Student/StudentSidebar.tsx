import { useState, useEffect, useRef, useCallback } from "react";
import { User, LogOut, Sun, Moon, X } from "lucide-react";
import SidebarHeader from "./components/SidebarHeader";
import SidebarNav from "./components/SidebarNav";
import CollapsedSidebar from "./components/CollapsedSidebar";
import MobileHeader from "./components/MobileHeader";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getRoleBasedRedirect } from "@/lib/roleUtils";
import { useUnreadNotificationCount } from "@/hooks/useUnreadNotificationCount";
import { useQuery } from "@tanstack/react-query";
import { getUserApplications } from "@/lib/api";
import { checkEmailRequirement } from "@/lib/emailRequirement";

interface StudentSidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

const StudentSidebar = ({ onCollapseChange }: StudentSidebarProps) => {
  // Ref for keyboard navigation
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { data: unreadCountData } = useUnreadNotificationCount();
  const unreadCount = unreadCountData?.unreadCount || 0;

  // Fetch user applications to check if any application is accepted
  const { data: userApplicationsData } = useQuery({
    queryKey: ["userApplications"],
    queryFn: getUserApplications,
    enabled: !!user,
  });

  // Check if user has an accepted application
  const hasAcceptedApplication =
    userApplicationsData?.applications?.some(
      (app: any) => app.status === "accepted"
    ) || false;

  // Check if email update is required (blocks all features except profile/notifications)
  const applications = userApplicationsData?.applications || [];
  const { isEmailUpdateRequired } = checkEmailRequirement(user, applications);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [isOpen, setIsOpen] = useState(false);
  // Collapse state should apply only on desktop (md and up).
  // We store the preference, but only use it when the viewport is >= md.
  const savedCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(savedCollapsed);
  // forms dropdown removed — individual items will be shown instead
  // Focus index for keyboard navigation
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  // Tooltip helper retained for possible future use but not used in refactor
  // (kept small utility above)

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
    navigate("/re-apply");
    setIsOpen(false);
  };

  const handleLeaveClick = () => {
    navigate("/leave");
    setIsOpen(false);
  };

  const handleRequirementsClick = () => {
    navigate("/requirements");
    setIsOpen(false);
  };

  const handleDashboardClick = () => {
    const dashboardRoute = getRoleBasedRedirect(user?.role || "student");
    navigate(dashboardRoute);
    setIsOpen(false);
  };

  const handleGradesClick = () => {
    navigate("/grades");
    setIsOpen(false);
  };

  const handleDtrClick = () => {
    navigate("/dtr");
    setIsOpen(false);
  };

  const handleScheduleClick = () => {
    navigate("/schedule");
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
    navigate("/re-apply");
  };

  const handleCollapsedLeaveClick = () => {
    navigate("/leave");
  };

  const handleCollapsedRequirementsClick = () => {
    navigate("/requirements");
  };

  const handleCollapsedDashboardClick = () => {
    const dashboardRoute = getRoleBasedRedirect(user?.role || "student");
    navigate(dashboardRoute);
  };

  const handleCollapsedSignout = () => {
    logout();
  };

  const handleCollapsedGradesClick = () => {
    navigate("/grades");
  };

  const handleCollapsedDtrClick = () => {
    navigate("/dtr");
  };

  const handleCollapsedScheduleClick = () => {
    navigate("/schedule");
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
    // Only include these if the user's email is verified
    ...(user?.verified
      ? [
          { label: "Grades", handler: handleGradesClick },
          // Hide DTR for applicants
          ...(user?.status === "applicant"
            ? []
            : [{ label: "DTR", handler: handleDtrClick }]),
          { label: "Schedule", handler: handleScheduleClick },
        ]
      : []),
    { label: "Profile", handler: handleProfileClick },
    { label: "Notifications", handler: handleNotificationsClick },
    // Hide Apply for accepted students
    ...(hasAcceptedApplication
      ? []
      : [{ label: "Apply", handler: handleApplyClick }]),
    ...(user?.verified
      ? [
          // If the user is an applicant, don't include re-apply or leave
          ...(user?.status === "applicant"
            ? [{ label: "Requirements", handler: handleRequirementsClick }]
            : [
                { label: "Re-apply", handler: handleReapplyClick },
                { label: "Leave", handler: handleLeaveClick },
                { label: "Requirements", handler: handleRequirementsClick },
              ]),
        ]
      : []),
    { label: "Sign out", handler: handleSignout },
  ];
  // icons for forms were removed — individual items used inline

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
      // Close the mobile overlay when switching to desktop
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }

      // If user resizes to small screens we should not show collapsed desktop UI
      if (window.innerWidth < 768) {
        // do not force change local preference; just avoid applying collapse
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
      // Move focus into sidebar for keyboard users
      setTimeout(() => sidebarRef.current?.focus(), 50);
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
      <MobileHeader
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        title="SASM-IMS"
      />

      {/* Overlay for mobile and desktop */}
      {/* Mobile overlay only - full-screen when open */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-40 ${
          isOpen ? "opacity-50 visible" : "opacity-0 invisible"
        } md:hidden`}
        onClick={() => setIsOpen(false)}
        aria-hidden={!isOpen}
      />

      {/* Sidebar - always overlaps page */}
      <div
        id="student-sidebar"
        ref={sidebarRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 shadow-xl transition-all duration-300 ease-in-out z-50 border-r border-gray-200 dark:border-gray-700 focus:outline-none ${
          // Mobile: slide in/out full width. Desktop: present and optionally collapsed.
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 ${
          // On desktop apply width based on collapse state; on mobile use full width when open
          isDesktopCollapsed
            ? "md:w-20 w-full md:overflow-visible"
            : "md:w-64 w-full"
        } overflow-y-auto md:overflow-visible md:overflow-y-visible pb-32`}
        aria-label="Student Sidebar"
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

        {/* full nav: hide on md+ when the desktop sidebar is collapsed (keep visible on mobile when sidebar is open) */}
        <div className={isDesktopCollapsed ? "md:hidden" : ""}>
          <SidebarNav
            unreadCount={unreadCount}
            isVerified={!!user?.verified}
            isApplicant={user?.status === "applicant"}
            isAccepted={hasAcceptedApplication}
            isEmailUpdateRequired={isEmailUpdateRequired}
            handlers={{
              dashboard: handleDashboardClick,
              notifications: handleNotificationsClick,
              grades: handleGradesClick,
              dtr: handleDtrClick,
              schedule: handleScheduleClick,
              apply: handleApplyClick,
              reapply: handleReapplyClick,
              leave: handleLeaveClick,
              requirements: handleRequirementsClick,
            }}
          />
        </div>

        {isDesktopCollapsed && (
          <CollapsedSidebar
            unreadCount={unreadCount}
            onExpand={() => setIsDesktopCollapsed(false)}
            handlers={{
              dashboard: handleCollapsedDashboardClick,
              notifications: handleCollapsedNotificationsClick,
              grades: handleCollapsedGradesClick,
              dtr: handleCollapsedDtrClick,
              schedule: handleCollapsedScheduleClick,
              apply: handleCollapsedApplyClick,
              reapply: handleCollapsedReapplyClick,
              leave: handleCollapsedLeaveClick,
              requirements: handleCollapsedRequirementsClick,
              profile: handleCollapsedProfileClick,
            }}
            isVerified={!!user?.verified}
            isApplicant={user?.status === "applicant"}
            isAccepted={hasAcceptedApplication}
            isEmailUpdateRequired={isEmailUpdateRequired}
            darkMode={darkMode}
            onToggleTheme={() => setDarkMode(!darkMode)}
            onSignout={handleCollapsedSignout}
          />
        )}

        {/* Theme Switcher and Sign out at Bottom - Enhanced */}
        {/* Theme Switcher and Sign out at Bottom - Always visible for both desktop and mobile */}
        {!isDesktopCollapsed ? (
          <div className="transition-all duration-300 flex flex-col items-center justify-center gap-2 p-4">
            {/* User Info Item */}
            {user && (
              <button
                onClick={handleProfileClick}
                className="w-full flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 hover:border-gray-400 dark:border-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 hover:bg-gray-100 dark:hover:bg-red-900/30 dark:hover:border-red-700 transition-all duration-200"
                style={{ userSelect: "none" }}
                aria-label="View Profile"
                title="View Profile"
              >
                <div className="flex-shrink-0 relative">
                  {/* Avatar or fallback icon */}
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-400 dark:border-gray-600 shadow"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-900 flex items-center justify-center border-2 border-gray-400 dark:border-gray-600 shadow">
                      <User
                        size={22}
                        className="text-gray-600 dark:text-gray-300"
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
              className="group w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-400 hover:border-gray-400 dark:hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label={darkMode ? "Light Mode" : "Dark Mode"}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <>
                  <Sun
                    size={16}
                    className="text-gray-200 group-hover:scale-110 transition-transform duration-200 drop-shadow"
                  />
                  <span className="font-medium">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon
                    size={16}
                    className="text-gray-500 group-hover:scale-110 transition-transform duration-200 drop-shadow"
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
