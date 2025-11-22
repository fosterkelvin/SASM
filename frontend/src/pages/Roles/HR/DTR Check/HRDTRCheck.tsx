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
  AlertCircle,
} from "lucide-react";
import API from "@/config/apiClient";

interface EditHistoryEntry {
  editedBy: string;
  editedByName: string;
  editedAt: string;
  changes: { field: string; oldValue: string; newValue: string }[];
}

interface Shift {
  in?: string;
  out?: string;
}

interface Entry {
  id: number;
  day: number;
  shifts?: Shift[];
  in1?: string;
  out1?: string;
  in2?: string;
  out2?: string;
  in3?: string;
  out3?: string;
  in4?: string;
  out4?: string;
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
  const [showBulkCancelModal, setShowBulkCancelModal] = useState(false);
  const [bulkCancelDate, setBulkCancelDate] = useState("");
  const [bulkCancelReason, setBulkCancelReason] = useState("");
  const [bulkCancelLoading, setBulkCancelLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

  // Get shifts for an entry (use legacy fields if shifts array doesn't exist)
  const getShifts = (entry: Entry): Shift[] => {
    if (entry.shifts && entry.shifts.length > 0) {
      return entry.shifts;
    }
    // Migrate legacy fields
    const legacyShifts: Shift[] = [];
    if (entry.in1 || entry.out1)
      legacyShifts.push({ in: entry.in1, out: entry.out1 });
    if (entry.in2 || entry.out2)
      legacyShifts.push({ in: entry.in2, out: entry.out2 });
    if (entry.in3 || entry.out3)
      legacyShifts.push({ in: entry.in3, out: entry.out3 });
    if (entry.in4 || entry.out4)
      legacyShifts.push({ in: entry.in4, out: entry.out4 });
    return legacyShifts;
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

  // Handle bulk emergency cancellation
  const handleBulkEmergencyCancel = async () => {
    if (!bulkCancelDate || !bulkCancelReason.trim()) {
      addToast("Please select a date and provide a reason", "error");
      return;
    }

    // Show custom confirmation dialog
    setShowConfirmDialog(true);
  };

  const confirmBulkCancel = async () => {
    setShowConfirmDialog(false);
    setBulkCancelLoading(true);
    try {
      const date = new Date(bulkCancelDate);
      const response = await API.post("/dtr/hr/bulk-emergency-cancel", {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        reason: bulkCancelReason,
      });

      addToast(
        `Emergency cancellation applied to ${response.data.totalDTRs} students. ${response.data.notifiedUsers} notifications sent.`,
        "success"
      );
      setShowBulkCancelModal(false);
      setBulkCancelDate("");
      setBulkCancelReason("");

      // Refresh current DTR if one is selected
      if (selectedTrainee) {
        fetchDTR();
      }
    } catch (error: any) {
      console.error("Error applying bulk emergency cancellation:", error);
      addToast(
        error?.response?.data?.message ||
          "Failed to apply emergency cancellation",
        "error"
      );
    } finally {
      setBulkCancelLoading(false);
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
          <h1 className="text-2xl font-bold text-white ml-4">DTR Checking</h1>
        </div>

        <div className="p-4 md:p-10 mt-12 max-w-7xl mx-auto">
          {/* Bulk Emergency Cancellation Button */}
          <Card className="mb-6 shadow-lg border-l-4 border-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Emergency Day Cancellation (All Students)
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Apply emergency cancellation (typhoon, earthquake, etc.)
                      to all students for a specific date
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBulkCancelModal(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                >
                  Apply Bulk Cancellation
                </button>
              </div>
            </CardContent>
          </Card>

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
                          <div className="flex flex-col items-center">
                            <span>Duty Shifts</span>
                            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                              IN → OUT times (multiple shifts)
                            </span>
                          </div>
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Hours
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Late
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Undertime
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => {
                        const hours = Math.floor((entry?.totalHours || 0) / 60);
                        const minutes = (entry?.totalHours || 0) % 60;
                        const shifts = getShifts(entry);
                        const hasData = shifts.some((s) => s.in || s.out);

                        return (
                          <tr
                            key={entry.day}
                            className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                              entry.confirmationStatus === "confirmed"
                                ? "bg-green-50 dark:bg-green-900/10"
                                : ""
                            }`}
                          >
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                              {getDayName(entry.day)}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {entry.day}
                            </td>
                            {/* Duty Shifts Column */}
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                              {!hasData ? (
                                <div className="text-center text-gray-400 text-xs">
                                  -
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  {shifts.map((shift, index) => {
                                    if (!shift.in && !shift.out) return null;
                                    return (
                                      <div
                                        key={index}
                                        className="flex items-center gap-2 text-xs justify-center"
                                      >
                                        <span className="font-semibold text-gray-600 dark:text-gray-400">
                                          Shift {index + 1}:
                                        </span>
                                        <span className="font-mono text-gray-700 dark:text-gray-300">
                                          {shift.in || "--:--"}
                                        </span>
                                        <span className="text-gray-400">→</span>
                                        <span className="font-mono text-gray-700 dark:text-gray-300">
                                          {shift.out || "--:--"}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-sm text-gray-700 dark:text-gray-300">
                              {hours}h {minutes.toString().padStart(2, "0")}m
                            </td>
                            {/* Late Column */}
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center">
                              {entry.late && entry.late > 0 ? (
                                <span className="text-orange-600 font-semibold">
                                  {entry.late}m
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            {/* Undertime Column */}
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center">
                              {entry.undertime && entry.undertime > 0 ? (
                                <span className="text-red-600 font-semibold">
                                  {entry.undertime}m
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
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

      {/* Bulk Emergency Cancellation Modal */}
      {showBulkCancelModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    Bulk Emergency Cancellation
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowBulkCancelModal(false);
                    setBulkCancelDate("");
                    setBulkCancelReason("");
                  }}
                  disabled={bulkCancelLoading}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Info Alert */}
              <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800 dark:text-amber-300">
                    <p className="font-semibold mb-1">
                      Apply to ALL Students - No Hours Added
                    </p>
                    <p>
                      This will mark the selected date as excused for ALL
                      students (trainees and scholars). The day will be
                      auto-confirmed but will NOT count towards duty hours. Use
                      for force majeure events.
                    </p>
                  </div>
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={bulkCancelDate}
                  onChange={(e) => setBulkCancelDate(e.target.value)}
                  disabled={bulkCancelLoading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50"
                />
              </div>

              {/* Quick Reason Buttons */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quick Reasons
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      setBulkCancelReason("Typhoon - University closed")
                    }
                    disabled={bulkCancelLoading}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded text-sm transition-colors disabled:opacity-50"
                  >
                    🌪️ Typhoon
                  </button>
                  <button
                    onClick={() =>
                      setBulkCancelReason("Earthquake - Classes suspended")
                    }
                    disabled={bulkCancelLoading}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded text-sm transition-colors disabled:opacity-50"
                  >
                    🏚️ Earthquake
                  </button>
                  <button
                    onClick={() =>
                      setBulkCancelReason("Flood - University closed")
                    }
                    disabled={bulkCancelLoading}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded text-sm transition-colors disabled:opacity-50"
                  >
                    🌊 Flood
                  </button>
                  <button
                    onClick={() => setBulkCancelReason("Class Suspension")}
                    disabled={bulkCancelLoading}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded text-sm transition-colors disabled:opacity-50"
                  >
                    🏫 Suspension
                  </button>
                </div>
              </div>

              {/* Reason Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Emergency Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={bulkCancelReason}
                  onChange={(e) => setBulkCancelReason(e.target.value)}
                  disabled={bulkCancelLoading}
                  placeholder="e.g., Typhoon Pepito - Signal No. 3, all classes suspended"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  This reason will be shown on all students' DTRs.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBulkCancelModal(false);
                    setBulkCancelDate("");
                    setBulkCancelReason("");
                  }}
                  disabled={bulkCancelLoading}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkEmergencyCancel}
                  disabled={
                    !bulkCancelDate ||
                    !bulkCancelReason.trim() ||
                    bulkCancelLoading
                  }
                  className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {bulkCancelLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    "Apply to All Students"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full border-2 border-amber-500 dark:border-amber-600">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <AlertCircle className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Confirm Emergency Cancellation
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Apply emergency cancellation for{" "}
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {bulkCancelDate}
                    </span>{" "}
                    to ALL students?
                  </p>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-l-4 border-amber-500 dark:border-amber-600 rounded-lg p-4 mb-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500 dark:bg-amber-600 flex items-center justify-center mt-0.5">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Mark the day as{" "}
                      <span className="font-semibold">
                        excused for all students
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500 dark:bg-amber-600 flex items-center justify-center mt-0.5">
                      <Clock className="h-3 w-3 text-white" />
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Set hours to{" "}
                      <span className="font-semibold">0 for that day</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason Display */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-6">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Emergency Reason
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                  {bulkCancelReason}
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-center gap-2 mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                  This action cannot be undone
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 px-5 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBulkCancel}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Yes, Apply to All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDTRCheck;
