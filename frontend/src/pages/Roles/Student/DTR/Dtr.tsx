import React, { useState, useEffect, useCallback, useRef } from "react";
import StudentSidebar from "@/components/sidebar/Student/StudentSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/context/ToastContext";
import DTRTable from "./components/DTRTable";
import { Entry } from "./components/types";
import {
  Calendar,
  Send,
  Loader2,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";

interface DTR {
  _id: string;
  userId: string;
  month: number;
  year: number;
  department?: string;
  dutyHours?: string;
  entries: Entry[];
  status: "draft" | "submitted" | "approved" | "rejected";
  submittedAt?: string;
  checkedBy?: string;
  checkedAt?: string;
  remarks?: string;
  totalMonthlyHours?: number;
  createdAt: string;
  updatedAt: string;
}

const API_URL = import.meta.env.VITE_API || "http://localhost:4004";

const Dtr: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { addToast } = useToast();

  // Current date for defaults
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Selected month/year
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // DTR state
  const [dtr, setDtr] = useState<DTR | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto-save timer ref
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef<Map<number, Partial<Entry>>>(new Map());

  // Month/Year data
  const months = [
    { value: 1, label: "January", short: "Jan" },
    { value: 2, label: "February", short: "Feb" },
    { value: 3, label: "March", short: "Mar" },
    { value: 4, label: "April", short: "Apr" },
    { value: 5, label: "May", short: "May" },
    { value: 6, label: "June", short: "Jun" },
    { value: 7, label: "July", short: "Jul" },
    { value: 8, label: "August", short: "Aug" },
    { value: 9, label: "September", short: "Sep" },
    { value: 10, label: "October", short: "Oct" },
    { value: 11, label: "November", short: "Nov" },
    { value: 12, label: "December", short: "Dec" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Navigation helpers
  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const goToCurrentMonth = () => {
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
  };

  // Fetch or create DTR
  const fetchDTR = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Fetching DTR for:", {
        month: selectedMonth,
        year: selectedYear,
      });
      const response = await fetch(`${API_URL}/dtr/get-or-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ month: selectedMonth, year: selectedYear }),
      });

      console.log("Fetch DTR response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Fetch DTR failed:", errorText);
        throw new Error("Failed to fetch DTR");
      }

      const data = await response.json();
      console.log("DTR loaded:", data.dtr);
      setDtr(data.dtr);
      // Map 'day' field from backend to 'id' field for frontend
      const mappedEntries = (data.dtr.entries || []).map((entry: any) => ({
        ...entry,
        id: entry.day,
      }));
      setEntries(mappedEntries);
    } catch (error) {
      console.error("Error fetching DTR:", error);
      addToast("Failed to load DTR. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, addToast]);

  useEffect(() => {
    fetchDTR();
  }, [fetchDTR]);

  // Save pending changes to backend
  const savePendingChanges = useCallback(async () => {
    console.log("savePendingChanges called");
    console.log("DTR exists:", !!dtr);
    console.log("DTR status:", dtr?.status);
    console.log("Pending changes size:", pendingChangesRef.current.size);

    if (
      !dtr ||
      dtr.status === "approved" ||
      pendingChangesRef.current.size === 0
    ) {
      console.log("Skipping save - condition not met");
      return;
    }

    console.log("Starting auto-save...");

    try {
      // Process all pending changes
      const updates = Array.from(pendingChangesRef.current.entries());

      for (const [day, changes] of updates) {
        // Get the current entry from state
        const entry = entries.find((e) => e.id === day) || { id: day };

        // Merge changes with existing entry to get complete data
        const updatedEntry = { ...entry, ...changes };

        const toMinutes = (time?: string) => {
          if (!time) return 0;
          const [h, m] = time.split(":").map(Number);
          return (h || 0) * 60 + (m || 0);
        };

        const in1 = toMinutes(updatedEntry.in1);
        const out1 = toMinutes(updatedEntry.out1);
        const in2 = toMinutes(updatedEntry.in2);
        const out2 = toMinutes(updatedEntry.out2);

        let totalMinutes = 0;
        if (out1 > in1) totalMinutes += out1 - in1;
        if (out2 > in2) totalMinutes += out2 - in2;

        // Auto-set status to "Unconfirmed" if any time is entered
        const hasTimeEntry =
          updatedEntry.in1 ||
          updatedEntry.out1 ||
          updatedEntry.in2 ||
          updatedEntry.out2;
        const autoStatus = hasTimeEntry
          ? "Unconfirmed"
          : updatedEntry.status || "";

        // Send the COMPLETE entry data, not just changes
        const completeEntryData = {
          in1: updatedEntry.in1 || "",
          out1: updatedEntry.out1 || "",
          in2: updatedEntry.in2 || "",
          out2: updatedEntry.out2 || "",
          status: autoStatus,
          totalHours: totalMinutes,
        };

        // Save to backend
        console.log("Saving to:", `${API_URL}/dtr/update-entry`);
        console.log("Payload:", {
          dtrId: dtr._id,
          day,
          entryData: completeEntryData,
        });

        const response = await fetch(`${API_URL}/dtr/update-entry`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            dtrId: dtr._id,
            day,
            entryData: completeEntryData,
          }),
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Save failed:", errorText);
          throw new Error(
            `Failed to save entry: ${response.status} ${errorText}`
          );
        }

        const data = await response.json();
        console.log("Save successful:", data);

        // Update DTR state only after successful save
        setDtr(data.dtr);
        const mappedEntries = (data.dtr.entries || []).map((entry: any) => ({
          ...entry,
          id: entry.day,
        }));
        setEntries(mappedEntries);
      }

      // Clear pending changes after successful save
      pendingChangesRef.current.clear();
    } catch (error) {
      console.error("Error saving entries:", error);
      addToast("Failed to auto-save. Your changes may not be saved.", "error");
    }
  }, [dtr, entries, addToast]);

  // Debounced auto-save effect
  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    if (pendingChangesRef.current.size > 0) {
      saveTimerRef.current = setTimeout(() => {
        savePendingChanges();
      }, 1000); // Save after 1 second of no changes
    }

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [entries, savePendingChanges]);

  // Handle entry change with optimistic update
  const handleEntryChange = (id: number, changes: Partial<Entry>) => {
    console.log("handleEntryChange called", { id, changes });

    if (!dtr || dtr.status === "approved") {
      console.log("Skipping entry change - no DTR or approved");
      return;
    }

    // Optimistic update - update UI immediately
    setEntries((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...changes } : p))
    );

    // Store pending changes
    const existingChanges = pendingChangesRef.current.get(id) || {};
    pendingChangesRef.current.set(id, { ...existingChanges, ...changes });
    console.log(
      "Pending changes after update:",
      Array.from(pendingChangesRef.current.entries())
    );
  };

  const isEditable = true; // Always editable - auto-saves to database
  const selectedMonthName =
    months.find((m) => m.value === selectedMonth)?.label || "";

  // Format total hours
  const formatTotalHours = () => {
    if (!dtr?.totalMonthlyHours) return "0h 00m";
    const hours = Math.floor(dtr.totalMonthlyHours / 60);
    const minutes = dtr.totalMonthlyHours % 60;
    return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
  };

  // Stats calculation
  const calculateStats = () => {
    const present = entries.filter((e) => e.status === "Present").length;
    const absent = entries.filter((e) => e.status === "Absent").length;
    const late = entries.filter((e) => e.status === "Late").length;
    const onLeave = entries.filter((e) => e.status === "On Leave").length;

    return { present, absent, late, onLeave };
  };

  // Calculate weekly hours and check 30h limit
  const calculateWeeklyHours = () => {
    const weeks: {
      weekNum: number;
      hours: number;
      days: number[];
      exceeds: boolean;
    }[] = [];

    let currentWeek: number[] = [];

    // Group days by week (Sunday to Saturday)
    entries.forEach((entry) => {
      const dayOfMonth = entry.id;
      const date = new Date(selectedYear, selectedMonth - 1, dayOfMonth);
      const dayOfWeek = date.getDay();

      // Start new week on Sunday
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        // Calculate hours for the completed week (only confirmed entries)
        const weekHours = currentWeek.reduce((sum, day) => {
          const e = entries.find((ent) => ent.id === day);
          // Only count hours if the entry is confirmed
          if (e?.confirmationStatus === "confirmed") {
            // Apply 5-hour (300 minutes) daily limit for official total
            const cappedHours = Math.min(e?.totalHours || 0, 300);
            return sum + cappedHours;
          }
          return sum;
        }, 0);

        const weekHoursInHours = weekHours / 60;
        const exceeds = weekHoursInHours > 30;

        weeks.push({
          weekNum: weeks.length + 1,
          hours: weekHours,
          days: [...currentWeek],
          exceeds,
        });

        currentWeek = [];
      }

      currentWeek.push(dayOfMonth);
    });

    // Add the last week if it has days
    if (currentWeek.length > 0) {
      const weekHours = currentWeek.reduce((sum, day) => {
        const e = entries.find((ent) => ent.id === day);
        // Only count hours if the entry is confirmed
        if (e?.confirmationStatus === "confirmed") {
          // Apply 5-hour (300 minutes) daily limit for official total
          const cappedHours = Math.min(e?.totalHours || 0, 300);
          return sum + cappedHours;
        }
        return sum;
      }, 0);

      const weekHoursInHours = weekHours / 60;
      const exceeds = weekHoursInHours > 30;

      weeks.push({
        weekNum: weeks.length + 1,
        hours: weekHours,
        days: [...currentWeek],
        exceeds,
      });
    }

    return weeks;
  };

  const stats = calculateStats();
  const weeklyHours = calculateWeeklyHours();
  const hasWeeklyViolations = weeklyHours.some((w) => w.exceeds);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900">
      <StudentSidebar onCollapseChange={setIsSidebarCollapsed} />

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Header */}
        <div
          className={`hidden md:flex items-center gap-4 fixed top-0 left-0 z-30 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-800 h-[81px] ${
            isSidebarCollapsed
              ? "md:w-[calc(100%-5rem)] md:ml-20"
              : "md:w-[calc(100%-16rem)] md:ml-64"
          }`}
        >
          <h1 className="text-2xl font-bold text-white ml-4">
            Daily Time Record
          </h1>
        </div>

        <div className="p-4 md:p-10 mt-12 max-w-7xl mx-auto">
          {/* Month Navigation Card */}
          <Card className="mb-6 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                {/* Month Navigation */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={goToPreviousMonth}
                    disabled={loading}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    title="Previous Month"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      disabled={loading}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-semibold text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {months.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      disabled={loading}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-semibold text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={goToNextMonth}
                    disabled={
                      loading ||
                      (selectedMonth === currentMonth &&
                        selectedYear === currentYear)
                    }
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    title="Next Month"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  {(selectedMonth !== currentMonth ||
                    selectedYear !== currentYear) && (
                    <button
                      onClick={goToCurrentMonth}
                      className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      Today
                    </button>
                  )}
                </div>

                {/* Quick Stats */}
                {dtr && !loading && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Present: {stats.present}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Absent: {stats.absent}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Late: {stats.late}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {dtr && !loading && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Total Monthly Hours
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatTotalHours()}
                    </span>
                  </div>
                </div>
              )}

              {/* Weekly Hours Breakdown */}
              {dtr && !loading && weeklyHours.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Weekly Hours (30h Limit)
                      </span>
                    </div>
                    {hasWeeklyViolations && (
                      <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Limit Exceeded
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {weeklyHours.map((week) => {
                      const hours = Math.floor(week.hours / 60);
                      const minutes = week.hours % 60;
                      const percentage = (week.hours / 60 / 30) * 100;
                      const isWarning = percentage > 80 && percentage <= 100;
                      const isDanger = percentage > 100;

                      return (
                        <div
                          key={week.weekNum}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            isDanger
                              ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700"
                              : isWarning
                              ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700"
                              : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                              Week {week.weekNum}
                            </span>
                            {isDanger && (
                              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div className="text-lg font-bold mb-1">
                            <span
                              className={
                                isDanger
                                  ? "text-red-700 dark:text-red-300"
                                  : isWarning
                                  ? "text-yellow-700 dark:text-yellow-300"
                                  : "text-gray-800 dark:text-gray-200"
                              }
                            >
                              {hours}h {minutes.toString().padStart(2, "0")}m
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden mb-1">
                            <div
                              className={`h-full transition-all duration-300 ${
                                isDanger
                                  ? "bg-gradient-to-r from-red-500 to-red-600"
                                  : isWarning
                                  ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                                  : "bg-gradient-to-r from-green-500 to-green-600"
                              }`}
                              style={{
                                width: `${Math.min(percentage, 100)}%`,
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {percentage > 100 ? (
                              <span className="text-red-600 dark:text-red-400 font-semibold">
                                +{(percentage - 100).toFixed(0)}% over limit
                              </span>
                            ) : (
                              <span>{percentage.toFixed(0)}% of 30h</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Days {week.days[0]}-
                            {week.days[week.days.length - 1]}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {hasWeeklyViolations && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-800 dark:text-red-200">
                          <span className="font-semibold">Warning:</span> You
                          have exceeded the 30-hour weekly limit. Please review
                          your hours to ensure compliance with program
                          requirements.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Main DTR Card */}
          <Card className="shadow-lg">
            <CardContent className="p-6 md:p-8">
              {/* University Header */}
              <div className="text-center mb-6 border-b pb-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                  <img
                    src="/UBLogo.svg"
                    alt="University Logo"
                    className="h-16 w-auto"
                  />
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      SASM Daily Time Record
                    </h2>
                    <p className="text-base font-semibold text-red-600 dark:text-red-400">
                      Please submit your DTR every first week of the month.
                    </p>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                  <span className="text-gray-600 dark:text-gray-400 text-lg">
                    Loading DTR for {selectedMonthName} {selectedYear}...
                  </span>
                </div>
              )}

              {/* DTR Content */}
              {!loading && dtr && (
                <>
                  <div className="mt-6">
                    <DTRTable
                      entries={entries}
                      onChange={isEditable ? handleEntryChange : () => {}}
                      month={selectedMonth}
                      year={selectedYear}
                      isEditable={isEditable}
                    />
                  </div>

                  {/* Status Info */}
                  {dtr.status !== "draft" && (
                    <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
                      <div className="space-y-2">
                        {dtr.submittedAt && (
                          <div className="flex items-center gap-2 text-sm">
                            <Send className="h-4 w-4 text-blue-600" />
                            <span className="text-gray-600 dark:text-gray-400">
                              <strong>Submitted:</strong>{" "}
                              {new Date(dtr.submittedAt).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                        )}
                        {dtr.checkedBy && (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-gray-600 dark:text-gray-400">
                              <strong>Checked by:</strong> {dtr.checkedBy}
                              {dtr.checkedAt && (
                                <span className="ml-2">
                                  on{" "}
                                  {new Date(dtr.checkedAt).toLocaleDateString()}
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                        {dtr.remarks && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-start gap-2 text-sm">
                              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                              <div>
                                <strong className="text-gray-700 dark:text-gray-300">
                                  Remarks:
                                </strong>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                  {dtr.remarks}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dtr;
