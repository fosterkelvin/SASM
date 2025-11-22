import * as React from "react";
import HRSidebar from "@/components/sidebar/HR/HRSidebar";
import LeaveList from "./components/LeaveList";
import LeaveFilters from "./components/LeaveFilters";
import LeaveDetailsModal from "./components/LeaveDetailsModal";
import { LeaveRecord, LeaveFilters as LF } from "./components/types";
import { getOfficeLeaves } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

export default function LeaveManagement() {
  const [leaves, setLeaves] = React.useState<LeaveRecord[]>([]);
  const [filters, setFilters] = React.useState<LF>({
    status: "all",
    type: "all",
    query: "",
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [selectedLeave, setSelectedLeave] = React.useState<LeaveRecord | null>(
    null
  );
  const { addToast } = useToast();

  // Load leaves from API
  React.useEffect(() => {
    const loadLeaves = async () => {
      try {
        setLoading(true);
        const resp = await getOfficeLeaves({
          status:
            filters.status === "all"
              ? undefined
              : (filters.status as "pending" | "approved" | "disapproved"),
          q: filters.query || undefined,
        });

        const items: LeaveRecord[] = (resp.leaves || []).map((l: any) => ({
          id: l._id,
          userId: l.userId || "",
          name: l.name,
          startDate: l.dateFrom,
          endDate: l.dateTo,
          type: l.typeOfLeave,
          reason: l.reasons,
          status: l.status,
          createdAt: l.createdAt,
          hrNote: l.remarks || "",
          proofUrl: l.proofUrl,
        }));
        setLeaves(items);
      } catch (e: any) {
        addToast(
          e?.message || e?.data?.message || "Failed to load leave requests.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };
    loadLeaves();
  }, [filters.status, filters.query]);

  const filtered = leaves.filter((l) => {
    if (filters.type && filters.type !== "all" && l.type !== filters.type)
      return false;
    return true;
  });

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
      <HRSidebar
        currentPage="Leave Management"
        onCollapseChange={setIsSidebarCollapsed}
      />
      <div
        className={`flex-1 pt-16 md:pt-[81px] transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <div
          className={`hidden md:flex items-center gap-4 fixed top-0 left-0 z-30 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-800 h-[81px] ${
            isSidebarCollapsed
              ? "md:w-[calc(100%-5rem)] md:ml-20"
              : "md:w-[calc(100%-16rem)] md:ml-64"
          }`}
        >
          <h1 className="text-2xl font-bold text-white dark:text-white ml-4">
            Leave Management
          </h1>
        </div>

        <div className="p-6 md:p-10">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Leave Management
                </h2>
                <p className="text-sm text-gray-500">
                  View scholar and trainee leave requests and HR notes
                </p>
              </div>

              <div className="flex items-center gap-3">
                <LeaveFilters filters={filters} onChange={setFilters} />
              </div>
            </div>

            <div className="mt-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading leave requests...
                </div>
              ) : (
                <LeaveList leaves={filtered} onView={setSelectedLeave} />
              )}
            </div>
          </div>
        </div>
      </div>

      <LeaveDetailsModal
        leave={selectedLeave}
        open={!!selectedLeave}
        onClose={() => setSelectedLeave(null)}
      />
    </div>
  );
}
