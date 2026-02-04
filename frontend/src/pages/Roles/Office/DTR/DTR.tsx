import React, { useEffect, useState } from "react";
import OfficeSidebar from "@/components/sidebar/Office/OfficeSidebar";
import { Card, CardContent } from "@/components/ui/card";
import OfficeDTRTable from "./components/OfficeDTRTable";
import EditDutyModal from "./components/EditDutyModal";
import { Entry, Shift } from "@/pages/Roles/Student/DTR/components/types";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Use production backend URL from environment variable
const API_URL = import.meta.env.VITE_API || "http://localhost:4004";

const OfficeDTRPage: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Current date for defaults
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Selected month/year
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Loading state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate entries based on selected month/year
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const [entries, setEntries] = useState<Entry[]>(() => {
    try {
      const raw = localStorage.getItem("office_dtr_entries");
      if (raw) return JSON.parse(raw) as Entry[];
    } catch (e) {
      // ignore
    }
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    return Array.from({ length: daysInMonth }, (_, i) => ({
      id: i + 1,
      status: "",
    }));
  });

  const [scholars, setScholars] = useState<
    { id: string; name: string; role?: string }[]
  >([]);
  const [loadingScholars, setLoadingScholars] = useState(true);

  // Fetch list of students/trainees from backend
  useEffect(() => {
    const fetchScholars = async () => {
      setLoadingScholars(true);
      try {
        // Query for both students and trainees
        const response = await fetch(`${API_URL}/users?role=student,trainee`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch scholars: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Fetched scholars:", data);

        // Map to the format we need
        const mappedScholars = data.users.map((user: any) => ({
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
        }));

        setScholars(mappedScholars);
      } catch (err) {
        console.error("Error fetching scholars:", err);
        // Fallback to mock data if API fails
        setScholars([
          { id: "mock1", name: "Sample Student 1", role: "Student" },
          { id: "mock2", name: "Sample Student 2", role: "Trainee" },
        ]);
      } finally {
        setLoadingScholars(false);
      }
    };

    fetchScholars();
  }, []);

  const [selectedScholar, setSelectedScholar] = useState<null | {
    id: string;
    name: string;
  }>(null);

  // Fetch actual DTR data from backend when a scholar is selected
  const fetchStudentDTR = async (
    userId: string,
    month: number,
    year: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/dtr/office/get-user-dtr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, month, year }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          // No DTR found for this month - create empty entries
          const daysInMonth = getDaysInMonth(month, year);
          setEntries(
            Array.from({ length: daysInMonth }, (_, i) => ({
              id: i + 1,
              status: "",
            }))
          );
          return;
        }
        throw new Error(`Failed to fetch DTR: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Fetched DTR data:", data);

      const dtr = data.dtr;
      if (dtr && dtr.entries && dtr.entries.length > 0) {
        // Map backend entries to frontend format
        const mappedEntries = dtr.entries.map((entry: any) => {
          console.log(
            `Day ${entry.day} - shifts:`,
            entry.shifts,
            `in1: ${entry.in1}, out1: ${entry.out1}`
          );
          return {
            id: entry.day || entry.id,
            day: entry.day,
            shifts: entry.shifts || [],
            // Keep legacy fields for backward compatibility
            in1: entry.in1,
            out1: entry.out1,
            in2: entry.in2,
            out2: entry.out2,
            in3: entry.in3,
            out3: entry.out3,
            in4: entry.in4,
            out4: entry.out4,
            status: entry.status || "",
            totalHours: entry.totalHours,
            late: entry.late,
            undertime: entry.undertime,
          };
        });
        console.log("Mapped entries:", mappedEntries);
        setEntries(mappedEntries);
      } else {
        // No entries - create empty ones
        const daysInMonth = getDaysInMonth(month, year);
        setEntries(
          Array.from({ length: daysInMonth }, (_, i) => ({
            id: i + 1,
            status: "",
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching DTR:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch DTR");
      // Fallback to empty entries
      const daysInMonth = getDaysInMonth(month, year);
      setEntries(
        Array.from({ length: daysInMonth }, (_, i) => ({
          id: i + 1,
          status: "",
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  // When a scholar is selected or month/year changes, fetch their DTR from backend
  useEffect(() => {
    if (!selectedScholar) return;
    fetchStudentDTR(selectedScholar.id, selectedMonth, selectedYear);
  }, [selectedScholar, selectedMonth, selectedYear]);

  const handleEntryChange = (id: number, changes: Partial<Entry>) => {
    setEntries((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...changes } : p))
    );
  };

  // Edit Duty Modal State
  const [editDutyModalOpen, setEditDutyModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  const handleEditDuty = (entry: Entry) => {
    setEditingEntry(entry);
    setEditDutyModalOpen(true);
  };

  const handleSaveDuty = (entryId: number, shifts: Shift[]) => {
    setEntries((prev) =>
      prev.map((p) =>
        p.id === entryId
          ? { ...p, shifts, status: shifts.length > 0 ? "Unconfirmed" : "" }
          : p
      )
    );
    setEditDutyModalOpen(false);
    setEditingEntry(null);
  };

  const handleClearDuty = (entry: Entry) => {
    if (window.confirm(`Are you sure you want to clear all duties for Day ${entry.id}?`)) {
      setEntries((prev) =>
        prev.map((p) =>
          p.id === entry.id
            ? { ...p, shifts: [], in1: "", out1: "", in2: "", out2: "", in3: "", out3: "", in4: "", out4: "", status: "" }
            : p
        )
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900">
      <OfficeSidebar
        currentPage="DTR"
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
          <h1 className="text-2xl font-bold text-white ml-4">
            Office - Student DTR
          </h1>
          <div className="ml-auto mr-4" />
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
                      Student Daily Time Record
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-red-600 dark:text-red-400">
                      Use this page to review and update student DTR statuses.
                    </p>
                  </div>
                </div>

                {/* Month/Year Selector */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Month:
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    >
                      {[
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ].map((month, idx) => (
                        <option key={idx + 1} value={idx + 1}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Year:
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    >
                      {Array.from({ length: 5 }, (_, i) => currentYear - i).map(
                        (year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                {!selectedScholar ? (
                  <div>
                    <h3 className="text-md font-semibold mb-3">
                      Select Scholar
                    </h3>
                    {loadingScholars ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-red-600 dark:text-red-400 mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Loading students and trainees...
                        </p>
                      </div>
                    ) : scholars.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          No students or trainees found.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {scholars.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setSelectedScholar(s)}
                            className="text-left p-3 border rounded hover:shadow-sm bg-white dark:bg-gray-800 hover:border-red-300 dark:hover:border-red-600 transition-colors"
                          >
                            <div className="font-medium text-gray-800 dark:text-gray-200">
                              {s.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {s.role || "Student"}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <Button
                          variant="outline"
                          className="bg-gray-400 hover:bg-gray-500"
                          onClick={() => setSelectedScholar(null)}
                        >
                          Back
                        </Button>
                      </div>
                      <div className="text-center flex-1">
                        <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                          DTR for{" "}
                          {
                            [
                              "January",
                              "February",
                              "March",
                              "April",
                              "May",
                              "June",
                              "July",
                              "August",
                              "September",
                              "October",
                              "November",
                              "December",
                            ][selectedMonth - 1]
                          }{" "}
                          {selectedYear}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {selectedScholar.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {selectedScholar.id}
                        </div>
                      </div>
                    </div>

                    {/* Error message */}
                    {error && (
                      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          {error}
                        </p>
                      </div>
                    )}

                    {/* Loading state */}
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-red-600 dark:text-red-400 mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Loading DTR data...
                        </p>
                      </div>
                    ) : (
                      <OfficeDTRTable
                        entries={entries}
                        onChange={handleEntryChange}
                        onEditDuty={handleEditDuty}
                        onClearDuty={handleClearDuty}
                        month={selectedMonth}
                        year={selectedYear}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Office staff signature removed per request */}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Duty Modal */}
      <EditDutyModal
        isOpen={editDutyModalOpen}
        entry={editingEntry}
        onClose={() => {
          setEditDutyModalOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSaveDuty}
      />
    </div>
  );
};

export default OfficeDTRPage;
