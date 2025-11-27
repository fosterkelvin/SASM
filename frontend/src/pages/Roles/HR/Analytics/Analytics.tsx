import React, { useEffect, useState, useCallback } from "react";
import HRSidebar from "@/components/sidebar/HR/HRSidebar";
import PieCard from "./components/PieCard";
import TimeSeriesChart from "./components/TimeSeriesChart";
import PipelineCard from "./components/PipelineCard";
import { getSummary, getTrends, getPipeline } from "@/lib/analyticsService";
import { Users, UserPlus, FileText, Clock } from "lucide-react";

const Analytics: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [pipeline, setPipeline] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(false);

  const [start, setStart] = useState<string | undefined>(undefined);
  const [end, setEnd] = useState<string | undefined>(undefined);

  // Validate that end date is not before start date
  const handleStartChange = (value: string) => {
    setStart(value || undefined);
    // If end date exists and is before new start date, clear it
    if (end && value && new Date(end) < new Date(value)) {
      setEnd(undefined);
    }
  };

  const handleEndChange = (value: string) => {
    // Only set end date if it's not before start date
    if (!start || !value || new Date(value) >= new Date(start)) {
      setEnd(value || undefined);
    }
  };

  const fetchAll = useCallback(async (s?: string, e?: string) => {
    setLoading(true);
    try {
      const [sum, tr, pl] = await Promise.all([
        getSummary(s, e),
        getTrends(s, e),
        getPipeline(s, e),
      ]);
      setSummary(sum);
      setTrends(tr);
      setPipeline(pl);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(start, end);
  }, [fetchAll, start, end]);

  useEffect(() => {
    document.title = "Analytics | SASM-IMS";
  }, []);

  const genderData =
    loading || !summary?.genderDistribution
      ? []
      : [
          {
            label: "Female",
            value: summary.genderDistribution.female,
            color: "#ef4444",
          },
          {
            label: "Male",
            value: summary.genderDistribution.male,
            color: "#3b82f6",
          },
        ];

  const scholarshipData =
    loading || !summary?.scholarshipDistribution
      ? []
      : [
          {
            label: "Student Assistant",
            value: summary.scholarshipDistribution.studentAssistant,
            color: "#f59e0b",
          },
          {
            label: "Student Marshal",
            value: summary.scholarshipDistribution.studentMarshal,
            color: "#10b981",
          },
        ];

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-1">
        {loading ? "..." : value ?? "0"}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
      <HRSidebar
        currentPage="Analytics"
        onCollapseChange={setIsSidebarCollapsed}
      />

      <div
        className={`flex-1 pt-16 md:pt-[81px] transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <div
          className={`hidden md:flex items-center gap-4 fixed top-0 left-0 z-30 bg-gradient-to-r from-red-600 to-red-700 h-[81px] ${
            isSidebarCollapsed
              ? "md:w-[calc(100%-5rem)] md:ml-20"
              : "md:w-[calc(100%-16rem)] md:ml-64"
          }`}
        >
          <h1 className="text-2xl font-bold text-white ml-4">Analytics</h1>
        </div>

        <div className="p-6 md:p-10">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Active Scholars"
              value={summary?.activeStudents}
              icon={Users}
              color="bg-blue-600"
            />
            <StatCard
              title="New This Month"
              value={summary?.newThisMonth}
              icon={UserPlus}
              color="bg-green-600"
            />
            <StatCard
              title="Pending Applications"
              value={summary?.pendingApplications}
              icon={FileText}
              color="bg-orange-600"
            />
            <StatCard
              title="Pending Leaves"
              value={summary?.pendingLeaves}
              icon={Clock}
              color="bg-purple-600"
            />
          </div>

          {/* Date Filters */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Applications Date Filter
            </h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={start || ""}
                  onChange={(e) => handleStartChange(e.target.value)}
                  aria-label="Filter start date"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={end || ""}
                  min={start || ""}
                  onChange={(e) => handleEndChange(e.target.value)}
                  aria-label="Filter end date"
                  disabled={!start}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStart(undefined);
                    setEnd(undefined);
                  }}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Applications Trend Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                {start && end
                  ? `Applications (${start} to ${end})`
                  : start
                  ? `Applications (from ${start})`
                  : end
                  ? `Applications (until ${end})`
                  : "Applications (last 14 days)"}
              </h3>
              {loading ? (
                <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              ) : trends.length > 0 ? (
                <TimeSeriesChart data={trends} width={700} height={180} />
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  No data available for selected period
                </div>
              )}
            </div>

            {/* Pipeline Card */}
            <div className="lg:col-span-1">
              {loading ? (
                <div className="h-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
              ) : (
                <PipelineCard data={pipeline ?? {}} />
              )}
            </div>
          </div>

          {/* Demographics Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PieCard title="Gender Distribution" data={genderData} />
            <PieCard title="Scholarship Type" data={scholarshipData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
