import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserApplications, getUserData } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import StudentSidebar from "@/components/sidebar/Student/StudentSidebar";
import {
  WelcomeCard,
  VerificationAlert,
  PersonalInfoAlert,
  StatsGrid,
} from "./components";
import {
  isPersonalInfoComplete,
  getMissingPersonalInfoFields,
} from "@/lib/personalInfoValidator";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Fetch user's application to get trainee office information
  const { data: userApplicationsData } = useQuery({
    queryKey: ["userApplications"],
    queryFn: getUserApplications,
    enabled: !!user,
  });

  // Fetch user data to check personal info completeness
  const { data: userData } = useQuery({
    queryKey: ["userData"],
    queryFn: getUserData,
    enabled: !!user,
  });

  // Find the active application (trainee or training_completed status)
  const activeApplication = userApplicationsData?.applications?.find(
    (app: any) =>
      app.status === "trainee" || app.status === "training_completed"
  );

  // Check if personal info is complete
  const personalInfoComplete = isPersonalInfoComplete(userData);
  const missingFields = !personalInfoComplete
    ? getMissingPersonalInfoFields(userData)
    : [];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900/80">
      <StudentSidebar onCollapseChange={setIsSidebarCollapsed} />
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
          <WelcomeCard
            traineeOffice={activeApplication?.traineeOffice}
            traineeStatus={activeApplication?.status}
          />

          {/* Email Verification Alert - Show only if not verified */}
          {user && !user.verified && <VerificationAlert email={user.email} />}

          {/* Personal Info Completion Alert - Show only if verified but info incomplete */}
          {user && user.verified && !personalInfoComplete && (
            <PersonalInfoAlert missingFields={missingFields} />
          )}

          <StatsGrid />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
