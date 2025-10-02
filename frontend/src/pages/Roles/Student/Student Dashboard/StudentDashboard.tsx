import { useState } from "react";
// useNavigate removed - not needed in this file anymore
import { useAuth } from "@/context/AuthContext";
import StudentSidebar from "@/components/sidebar/Student/StudentSidebar";
import {
  WelcomeCard,
  VerificationAlert,
  StatsGrid,
  QuickActions,
} from "./components";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900/80">
      <StudentSidebar
        onCollapseChange={setIsSidebarCollapsed}
      />
      {/* Main content area with dynamic margin based on sidebar state */}
      <div
        className={`flex-1 pt-16 md:pt-[81px] transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Top header bar - only visible on desktop */}
        <div
          className={`hidden md:flex items-center gap-4 fixed top-0 left-0 z-30 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-800 h-[81px] ${
            isSidebarCollapsed
              ? "md:w-[calc(100%-5rem)] md:ml-20"
              : "md:w-[calc(100%-16rem)] md:ml-64"
          }`}
        >
          <h1 className="text-2xl font-bold text-white dark:text-white ml-4">
            Student Dashboard
          </h1>
        </div>

        {/* Main content */}
        <div className="p-6 md:p-10">
          <WelcomeCard />

          {/* Email Verification Alert - Show only if not verified */}
          {user && !user.verified && <VerificationAlert email={user.email} />}

          <StatsGrid />

          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
