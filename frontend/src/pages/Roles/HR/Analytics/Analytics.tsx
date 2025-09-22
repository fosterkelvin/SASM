import React, { useEffect, useState, useCallback } from "react";
import HRSidebar from "@/components/sidebar/HRSidebar";
import PieCard from "./components/PieCard";
import KPIs from "./components/KPIs";
import Filters from "./components/Filters";
import TimeSeriesChart from "./components/TimeSeriesChart";
import PipelineCard from "./components/PipelineCard";
import { getSummary, getTrends, getPipeline } from "@/lib/analyticsService";

const Analytics: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [pipeline, setPipeline] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [loadingPipeline, setLoadingPipeline] = useState(false);

  const [start, setStart] = useState<string | undefined>(undefined);
  const [end, setEnd] = useState<string | undefined>(undefined);

  const fetchAll = useCallback(async (s?: string, e?: string) => {
    setLoading(true);
    setLoadingTrends(true);
    setLoadingPipeline(true);
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
      setLoadingTrends(false);
      setLoadingPipeline(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(start, end);
  }, [fetchAll, start, end]);

  useEffect(() => {
    document.title = "Analytics | SASM-IMS";
  }, []);

  // derive demo breakdowns from summary to keep numbers consistent
  const genderData = loading
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
      ];

  const scholarshipData = loading
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
      ];

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
          {/* KPIs */}
          <KPIs
            items={[
              {
                label: "Active Students",
                value: loading ? "—" : summary?.activeStudents ?? "-",
                delta: 5,
                spark: summary?.sparklineApplications,
                color: "#3b82f6",
              },
              {
                label: "New This Month",
                value: loading ? "—" : summary?.newThisMonth ?? "-",
                delta: 2,
                spark: summary?.sparklineNewUsers,
                color: "#10b981",
              },
              {
                label: "Pending Applications",
                value: loading ? "—" : summary?.pendingApplications ?? "-",
                delta: -1,
                spark: summary?.sparklineApplications,
                color: "#f59e0b",
              },
              // Pending Leaves (operational backlog)
              {
                label: "Pending Leaves",
                value: loading ? "—" : summary?.pendingLeaves ?? "-",
                delta: 1,
                spark: summary?.sparklineLeaveRequests,
                color: "#ef4444",
              },
            ]}
          />

          <Filters
            start={start}
            end={end}
            onChange={(s, e) => {
              // normalize empty strings to undefined
              setStart(s || undefined);
              setEnd(e || undefined);
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <div className="bg-card p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold">
                    Applications (last 14 days)
                  </h3>
                </div>
                {loadingTrends ? (
                  <div className="h-40 bg-gray-50 dark:bg-gray-800 rounded animate-pulse" />
                ) : (
                  <TimeSeriesChart data={trends} width={700} height={140} />
                )}
              </div>
            </div>

            <div>
              {loadingPipeline ? (
                <div className="h-40 bg-gray-50 dark:bg-gray-800 rounded animate-pulse" />
              ) : (
                <PipelineCard data={pipeline ?? {}} />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PieCard title="Gender" data={genderData} />
            <PieCard title="Scholarship" data={scholarshipData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
