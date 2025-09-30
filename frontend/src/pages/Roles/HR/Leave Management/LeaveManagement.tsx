import * as React from "react";
import HRSidebar from "@/components/sidebar/HR/HRSidebar";
import LeaveList from "./components/LeaveList";
import LeaveFilters from "./components/LeaveFilters";
import LeaveForm from "./components/LeaveForm";
import { LeaveRecord, LeaveFilters as LF } from "./components/types";

const STORAGE_KEY = "sasm:leaves:v1";

function seed(): LeaveRecord[] {
  return [
    {
      id: "1",
      userId: "u1",
      name: "Alice Johnson",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      type: "Social Orientation",
      reason: "Vacation",
      status: "pending",
      createdAt: new Date().toISOString(),
      hrNote: "",
    },
    {
      id: "2",
      userId: "u2",
      name: "Bob Smith",
      startDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 9).toISOString(),
      type: "Sick Leave",
      reason: "Medical",
      status: "approved",
      createdAt: new Date().toISOString(),
      hrNote: "Approved by HR.",
    },
  ];
}

function readStorage(): LeaveRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    return JSON.parse(raw) as LeaveRecord[];
  } catch (e) {
    return seed();
  }
}

export default function LeaveManagement() {
  const [leaves, setLeaves] = React.useState<LeaveRecord[]>(() =>
    readStorage()
  );
  const [filters, setFilters] = React.useState<LF>({
    status: "all",
    type: "all",
    query: "",
  });
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leaves));
  }, [leaves]);

  const openEdit = (id: string) => {
    setEditingId(id);
    setFormOpen(true);
  };

  const changeStatus = (id: string, status: LeaveRecord["status"]) => {
    setLeaves((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const saveNote = (id: string, values: Partial<{ hrNote: string }>) => {
    setLeaves((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...values } : p))
    );
  };

  const resetData = () => {
    if (
      !confirm(
        "Reset leave data to seeded defaults? This will overwrite any local changes."
      )
    )
      return;
    localStorage.removeItem(STORAGE_KEY);
    const seeded = seed();
    setLeaves(seeded);
  };

  const selected = editingId
    ? leaves.find((l) => l.id === editingId) || null
    : null;

  const filtered = leaves.filter((l) => {
    if (
      filters.status &&
      filters.status !== "all" &&
      l.status !== filters.status
    )
      return false;
    if (filters.type && filters.type !== "all" && l.type !== filters.type)
      return false;
    if (
      filters.query &&
      !l.name.toLowerCase().includes((filters.query || "").toLowerCase())
    )
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
                  Manage employee leave requests and HR notes
                </p>
              </div>

              <div className="flex items-center gap-3">
                <LeaveFilters filters={filters} onChange={setFilters} />
                <button
                  onClick={resetData}
                  className="px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 text-sm"
                >
                  Reset data
                </button>
              </div>
            </div>

            <div className="mt-4">
              <LeaveList
                leaves={filtered}
                onChangeStatus={changeStatus}
                onOpen={openEdit}
              />
            </div>

            <LeaveForm
              record={selected}
              open={formOpen}
              onClose={() => setFormOpen(false)}
              onSave={saveNote}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
