import { useEffect, useState } from "react";
import HRSidebar from "@/components/sidebar/HRSidebar";
import { WelcomeCard, StatsGrid } from "./components";
import PieCard from "../Analytics/components/PieCard";
import { getSummary } from "@/lib/analyticsService";

const HRDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const s = await getSummary();
        if (mounted) setSummary(s);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
      <HRSidebar
        currentPage="HR Dashboard"
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
            HR Dashboard
          </h1>
        </div>

        {/* Main content */}
        <div className="p-6 md:p-10">
          <WelcomeCard />

          <StatsGrid />

          {/* Two pie charts reused from Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <PieCard
              title="Gender"
              data={
                loading
                  ? []
                  : [
                      {
                        label: "Female",
                        value: Math.round((summary?.activeStudents ?? 0) * 0.425),
                        color: "#ef4444",
                      },
                      {
                        label: "Male",
                        value: Math.round((summary?.activeStudents ?? 0) * 0.575),
                        color: "#3b82f6",
                      },
                    ]
              }
            />

            <PieCard
              title="Scholarship"
              data={
                loading
                  ? []
                  : [
                      {
                        label: "Student Assistant",
                        value: Math.round((summary?.activeStudents ?? 0) * 0.5),
                        color: "#f59e0b",
                      },
                      {
                        label: "Student Marshal",
                        value: Math.round((summary?.activeStudents ?? 0) * 0.5),
                        color: "#10b981",
                      },
                    ]
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
