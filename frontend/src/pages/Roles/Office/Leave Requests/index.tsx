import React, { useMemo, useState } from "react";
import OfficeSidebar from "@/components/sidebar/OfficeSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { LeaveRequest } from "./types";
import LeaveActionsModal from "./LeaveActionsModal";
import LeaveFilters from "./LeaveFilters";
import LeaveTable from "./LeaveTable";

const mockData: LeaveRequest[] = [
  {
    id: "lr1",
    studentName: "John Doe",
    studentId: "S12345",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    reason: "Medical appointment",
    status: "pending",
    submittedAt: new Date().toISOString(),
  },
  {
    id: "lr2",
    studentName: "Jane Smith",
    studentId: "S54321",
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    reason: "Family event",
    status: "approved",
    remarks: "Approved by Admin",
    submittedAt: new Date().toISOString(),
  },
];

const LeaveRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>(mockData);
  const [active, setActive] = useState<LeaveRequest | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const openActions = (r: LeaveRequest) => setActive(r);
  const closeActions = () => setActive(null);

  const [filters, setFilters] = useState<{
    query: string;
    status: "all" | "pending" | "approved" | "disapproved";
  }>({ query: "", status: "all" });

  const onSubmit = (
    id: string,
    status: LeaveRequest["status"],
    remarks?: string
  ) => {
    setRequests((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status, remarks } : p))
    );
  };

  const counts = useMemo(() => {
    return requests.reduce(
      (acc, r) => {
        acc.total++;
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, disapproved: 0 } as Record<
        string,
        number
      >
    );
  }, [requests]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900">
      <OfficeSidebar
        currentPage="Leave Requests"
        onCollapseChange={setIsSidebarCollapsed}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
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
          <h1 className="text-2xl font-bold text-white ml-4">Leave Requests</h1>
          <div className="ml-auto mr-4 text-sm text-red-100">
            Total: {counts.total} • Pending: {counts.pending} • Approved:{" "}
            {counts.approved}
          </div>
        </div>

        <div className="p-4 md:p-10 mt-12">
          <Card className="max-w-6xl mx-auto">
            <CardContent className="p-6 md:p-8">
              <div className="text-center mb-6 md:mb-8 border-b pb-4 md:pb-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-4">
                  <img
                    src="/UBLogo.svg"
                    alt="University Logo"
                    className="h-12 sm:h-14 md:h-16 w-auto"
                  />
                  <div className="text-center sm:text-left">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200">
                      Leave Requests
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-red-600 dark:text-red-400">
                      Manage student leave requests. Approve or disapprove and
                      add remarks.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <LeaveFilters filters={filters} setFilters={setFilters} />

                <LeaveTable
                  data={requests.filter((r) => {
                    const q = filters.query.trim().toLowerCase();
                    if (filters.status !== "all" && r.status !== filters.status)
                      return false;
                    if (!q) return true;
                    return (
                      r.studentName.toLowerCase().includes(q) ||
                      r.studentId.toLowerCase().includes(q) ||
                      r.reason.toLowerCase().includes(q)
                    );
                  })}
                  onOpenActions={openActions}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <LeaveActionsModal
          request={active}
          onClose={closeActions}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
};

export default LeaveRequestsPage;
