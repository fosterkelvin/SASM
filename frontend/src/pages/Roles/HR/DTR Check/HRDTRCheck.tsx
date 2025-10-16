import React, { useState, useEffect, useCallback, useRef } from "react";
import HRSidebar from "@/components/sidebar/HR/HRSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/context/ToastContext";
import {
  Calendar,
  Loader2,
  CheckCircle2,
  Clock,
  Search,
  Info,
  ShieldCheck,
  X,
} from "lucide-react";
import API from "@/config/apiClient";

interface EditHistoryEntry {
  editedBy: string;
  editedByName: string;
  editedAt: string;
  changes: { field: string; oldValue: string; newValue: string }[];
}

interface Entry {
  id: number;
  day: number;
  in1?: string;
  out1?: string;
  in2?: string;
  out2?: string;
  late?: number;
  undertime?: number;
  totalHours?: number;
  status?: string;
  excusedStatus?: "none" | "excused";
  excusedReason?: string;
  confirmationStatus?: "unconfirmed" | "confirmed";
  confirmedBy?: string;
  confirmedByProfile?: string;
  confirmedAt?: string;
  editHistory?: EditHistoryEntry[];
}

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

interface Trainee {
  _id: string;
  userID: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  traineeOffice?: string;
  status: string;
  position?: "student_assistant" | "student_marshal";
}

const HRDTRCheck: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { addToast } = useToast();

  // Current date for defaults
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // State
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [filteredTrainees, setFilteredTrainees] = useState<Trainee[]>([]);
  const [selectedTrainee, setSelectedTrainee] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [dtr, setDtr] = useState<DTR | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTrainees, setLoadingTrainees] = useState(true);
  const [tooltipPosition, setTooltipPosition] = useState<{
    [key: number]: "top" | "bottom";
  }>({});

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const infoIconRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

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

  // Fetch trainees - HR can see all trainees
  useEffect(() => {
    const fetchTrainees = async () => {
      try {
        const response = await API.get("/trainees/all");
        setTrainees(response.data.trainees);
        setFilteredTrainees(response.data.trainees);
      } catch (error) {
        console.error("Error fetching trainees:", error);
        addToast("Failed to load trainees", "error");
      } finally {
        setLoadingTrainees(false);
      }
    };

    fetchTrainees();
  }, [addToast]);

  // Filter trainees based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTrainees(trainees);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = trainees.filter((trainee) => {
      const fullName =
        `${trainee.userID.firstname} ${trainee.userID.lastname}`.toLowerCase();
      const email = trainee.userID.email.toLowerCase();
      return fullName.includes(query) || email.includes(query);
    });
    setFilteredTrainees(filtered);
  }, [searchQuery, trainees]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch DTR when trainee, month, or year changes
  const fetchDTR = useCallback(async () => {
    if (!selectedTrainee) {
      setDtr(null);
      setEntries([]);
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/dtr/office/get-user-dtr", {
        userId: selectedTrainee,
        month: selectedMonth,
        year: selectedYear,
      });

      setDtr(response.data.dtr);
      const mappedEntries = (response.data.dtr.entries || []).map(
        (entry: any) => ({
          ...entry,
          id: entry.day,
        })
      );
      setEntries(mappedEntries);
    } catch (error) {
      console.error("Error fetching DTR:", error);
      addToast("Failed to load DTR", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedTrainee, selectedMonth, selectedYear, addToast]);

  useEffect(() => {
    fetchDTR();
  }, [fetchDTR]);

  // Format total hours
  const formatTotalHours = () => {
    if (!dtr?.totalMonthlyHours) return "0h 00m";
    const hours = Math.floor(dtr.totalMonthlyHours / 60);
    const minutes = dtr.totalMonthlyHours % 60;
    return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
  };

  // Get day name
  const getDayName = (day: number) => {
    const date = new Date(selectedYear, selectedMonth - 1, day);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  // Check if a day is Sunday
  const isSunday = (day: number) => {
    const date = new Date(selectedYear, selectedMonth - 1, day);
    return date.getDay() === 0;
  };

  // Handle trainee selection
  const handleSelectTrainee = (traineeId: string) => {
    setSelectedTrainee(traineeId);
    const trainee = trainees.find((t) => t.userID._id === traineeId);
    if (trainee) {
      setSearchQuery(`${trainee.userID.firstname} ${trainee.userID.lastname}`);
    }
    setIsDropdownOpen(false);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true);
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedTrainee("");
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  // Handle tooltip position detection
  const handleTooltipHover = (day: number, ref: HTMLDivElement | null) => {
    if (!ref) return;

    const rect = ref.getBoundingClientRect();
    const tooltipHeight = 150; // Approximate tooltip height with padding
    const spaceAbove = rect.top;
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;

    // Prefer showing below for top rows (first 7 days or if in top 200px of screen)
    // Show below if not enough space above OR if element is in top portion of screen
    if (spaceAbove < tooltipHeight + 30 || rect.top < 250) {
      setTooltipPosition((prev) => ({ ...prev, [day]: "bottom" }));
    } else if (spaceBelow < tooltipHeight + 30) {
      // Force top if no space below
      setTooltipPosition((prev) => ({ ...prev, [day]: "top" }));
    } else {
      // Default to top if there's space
      setTooltipPosition((prev) => ({ ...prev, [day]: "top" }));
    }
  };

  const selectedTraineeName = selectedTrainee
    ? trainees.find((t) => t.userID._id === selectedTrainee)?.userID
    : null;

  const selectedTraineeData = selectedTrainee
    ? trainees.find((t) => t.userID._id === selectedTrainee)
    : null;

  // Get position display label
  const getPositionLabel = (
    position?: "student_assistant" | "student_marshal"
  ) => {
    if (position === "student_assistant") return "Trainee";
    if (position === "student_marshal") return "Scholar";
    return "Trainee"; // Default
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900">
      <HRSidebar onCollapseChange={setIsSidebarCollapsed} />

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
            DTR Checking (View Only)
          </h1>
        </div>

        <div className="p-4 md:p-10 mt-12 max-w-7xl mx-auto">
          {/* Selection Card */}
          <Card className="mb-6 shadow-lg">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Trainee Selection with Search */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Trainee/Scholar
                  </label>
                  {loadingTrainees ? (
                    <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Loading...
                      </span>
                    </div>
                  ) : (
                    <div className="relative" ref={dropdownRef}>
                      {/* Search Input */}
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={handleSearchChange}
                          onFocus={() => setIsDropdownOpen(true)}
                          autoComplete="off"
                          placeholder="Search by name..."
                          className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {selectedTrainee && (
                          <button
                            onClick={handleClearSelection}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>

                      {/* Dropdown Results */}
                      {isDropdownOpen && filteredTrainees.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredTrainees.map((trainee) => (
                            <button
                              key={trainee.userID._id}
                              onClick={() =>
                                handleSelectTrainee(trainee.userID._id)
                              }
                              className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                selectedTrainee === trainee.userID._id
                                  ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {trainee.userID.firstname}{" "}
                                    {trainee.userID.lastname}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {trainee.userID.email}
                                  </div>
                                </div>
                                <span
                                  className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                                    trainee.position === "student_marshal"
                                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                  }`}
                                >
                                  {getPositionLabel(trainee.position)}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* No Results Message */}
                      {isDropdownOpen &&
                        searchQuery &&
                        filteredTrainees.length === 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                              No trainees found matching "{searchQuery}"
                            </p>
                          </div>
                        )}
                    </div>
                  )}
                </div>

                {/* Month Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Month
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    disabled={!selectedTrainee}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    disabled={!selectedTrainee}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Total Hours Display */}
              {dtr && entries.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Monthly Hours:
                    </span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatTotalHours()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* DTR Content */}
          {loading && (
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                  <span className="text-gray-600 dark:text-gray-400 text-lg">
                    Loading DTR...
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && !selectedTrainee && (
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Calendar className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Select a Trainee or Scholar
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose a trainee or scholar from the dropdown above to view
                    their DTR.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && selectedTrainee && dtr && (
            <Card className="shadow-lg">
              <CardContent className="p-6 md:p-8">
                {/* Header */}
                <div className="mb-6 border-b pb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                      DTR for {selectedTraineeName?.firstname}{" "}
                      {selectedTraineeName?.lastname}
                    </h2>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedTraineeData?.position === "student_marshal"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}
                    >
                      {getPositionLabel(selectedTraineeData?.position)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {months.find((m) => m.value === selectedMonth)?.label}{" "}
                    {selectedYear}
                  </p>
                </div>

                {/* DTR Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Day
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Date
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                          In (AM)
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Out (AM)
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                          In (PM)
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Out (PM)
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Hours
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => {
                        const hours = Math.floor(
                          (entry?.totalHours || 0) / 60
                        );
                        const minutes = (entry?.totalHours || 0) % 60;

                        const isSundayEntry = isSunday(entry.day);
                        return (
                          <tr
                            key={entry.day}
                            className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                              entry.confirmationStatus === "confirmed"
                                ? "bg-green-50 dark:bg-green-900/10"
                                : isSundayEntry
                                ? "bg-red-50 dark:bg-red-900/10"
                                : ""
                            }`}
                          >
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                              {getDayName(entry.day)}
                              {isSundayEntry && (
                                <span className="ml-1 text-xs text-red-600 dark:text-red-400 font-medium">
                                  (Locked)
                                </span>
                              )}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {entry.day}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {entry.in1 || "-"}
                              </span>
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {entry.out1 || "-"}
                              </span>
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {entry.in2 || "-"}
                              </span>
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {entry.out2 || "-"}
                              </span>
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-sm text-gray-700 dark:text-gray-300">
                              {hours}h {minutes.toString().padStart(2, "0")}m
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {entry.excusedStatus === "excused" ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                    <ShieldCheck className="h-3 w-3" />
                                    Excused
                                  </span>
                                ) : entry.confirmationStatus === "confirmed" ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Confirmed
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                    <Clock className="h-3 w-3" />
                                    Unconfirmed
                                  </span>
                                )}
                                {(entry.confirmedByProfile ||
                                  entry.excusedReason ||
                                  (entry.editHistory &&
                                    entry.editHistory.length > 0)) && (
                                  <div
                                    className="relative inline-block group"
                                    ref={(el) => {
                                      infoIconRefs.current[entry.day] = el;
                                    }}
                                    onMouseEnter={() =>
                                      handleTooltipHover(
                                        entry.day,
                                        infoIconRefs.current[entry.day]
                                      )
                                    }
                                  >
                                    <Info className="h-4 w-4 text-blue-500 cursor-help" />
                                    <div
                                      className={`invisible group-hover:visible fixed ${
                                        tooltipPosition[entry.day] === "bottom"
                                          ? "translate-y-2"
                                          : "-translate-y-full -mt-2"
                                      } left-1/2 -translate-x-1/2 w-60 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-[9999] pointer-events-none`}
                                      style={{
                                        top: infoIconRefs.current[entry.day]
                                          ? `${
                                              infoIconRefs.current[
                                                entry.day
                                              ]!.getBoundingClientRect().top +
                                              (tooltipPosition[entry.day] ===
                                              "bottom"
                                                ? infoIconRefs.current[
                                                    entry.day
                                                  ]!.getBoundingClientRect()
                                                    .height
                                                : 0)
                                            }px`
                                          : "0",
                                        left: infoIconRefs.current[entry.day]
                                          ? `${
                                              infoIconRefs.current[
                                                entry.day
                                              ]!.getBoundingClientRect().left +
                                              infoIconRefs.current[
                                                entry.day
                                              ]!.getBoundingClientRect().width /
                                                2
                                            }px`
                                          : "0",
                                      }}
                                    >
                                      {/* Arrow */}
                                      <div
                                        className={`absolute left-1/2 -translate-x-1/2 ${
                                          tooltipPosition[entry.day] ===
                                          "bottom"
                                            ? "bottom-full -mb-px"
                                            : "top-full -mt-px"
                                        }`}
                                      >
                                        <div
                                          className={`w-3 h-3 rotate-45 bg-white dark:bg-gray-800 ${
                                            tooltipPosition[entry.day] ===
                                            "bottom"
                                              ? "border-l border-t"
                                              : "border-r border-b"
                                          } border-gray-200 dark:border-gray-700`}
                                        ></div>
                                      </div>
                                      <div className="text-xs space-y-2 text-left">
                                        {entry.excusedReason && (
                                          <div className="text-purple-700 dark:text-purple-400">
                                            <div className="font-semibold">
                                              Excused:
                                            </div>
                                            <div className="mt-0.5">
                                              {entry.excusedReason}
                                            </div>
                                          </div>
                                        )}
                                        {entry.confirmedByProfile && (
                                          <div className="text-green-700 dark:text-green-400">
                                            <div className="font-semibold">
                                              Confirmed by:
                                            </div>
                                            <div className="mt-0.5">
                                              {entry.confirmedByProfile}
                                            </div>
                                          </div>
                                        )}
                                        {entry.editHistory &&
                                          entry.editHistory.length > 0 && (
                                            <div className="text-blue-700 dark:text-blue-400">
                                              <div className="font-semibold">
                                                Last edited by:
                                              </div>
                                              <div className="mt-0.5">
                                                {
                                                  entry.editHistory[
                                                    entry.editHistory.length - 1
                                                  ].editedByName
                                                }
                                              </div>
                                            </div>
                                          )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRDTRCheck;
