import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/context/ToastContext";
import {
  Calendar,
  Loader2,
  FileText,
  Download,
  Printer,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search,
  ChevronDown,
  Building2,
} from "lucide-react";
import API from "@/config/apiClient";

interface Shift {
  in?: string;
  out?: string;
}

interface Entry {
  day: number;
  shifts?: Shift[];
  in1?: string;
  out1?: string;
  in2?: string;
  out2?: string;
  totalHours?: number;
  status?: string;
  confirmationStatus?: "unconfirmed" | "confirmed";
  excusedStatus?: "none" | "excused";
}

interface DTRData {
  _id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  department?: string;
  office?: string;
  month: number;
  year: number;
  entries: Entry[];
  totalMonthlyHours?: number;
  status: string;
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
}

interface DTRReportProps {
  role: "office" | "hr";
  Sidebar: React.ComponentType<{
    currentPage: string;
    onCollapseChange?: (collapsed: boolean) => void;
  }>;
}

const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const DTRReport: React.FC<DTRReportProps> = ({ role, Sidebar }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { addToast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  // Current date for defaults
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // State
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [loading, setLoading] = useState(false);
  const [loadingTrainees, setLoadingTrainees] = useState(true);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [dtrData, setDtrData] = useState<DTRData[]>([]);
  const [selectedOffice, setSelectedOffice] = useState<string>("all");
  const [offices, setOffices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch trainees on mount
  useEffect(() => {
    fetchTrainees();
  }, []);

  // Fetch DTR data when month/year changes
  useEffect(() => {
    if (trainees.length > 0) {
      fetchDTRReport();
    }
  }, [selectedMonth, selectedYear, trainees]);

  const fetchTrainees = async () => {
    setLoadingTrainees(true);
    try {
      let data: Trainee[] = [];
      
      if (role === "hr") {
        // HR fetches all trainees
        const response = await API.get("/trainees/all");
        console.log("HR trainees response:", response.data);
        
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data?.trainees) {
          data = response.data.trainees;
        } else if (response.data?.data) {
          data = response.data.data;
        }
      } else {
        // Office fetches both trainees and scholars (same as OfficeDTRCheck)
        const [traineesResponse, scholarsResponse] = await Promise.all([
          API.get("/trainees/office"),
          API.get("/trainees/office/scholars"),
        ]);
        
        console.log("Office trainees response:", traineesResponse.data);
        console.log("Office scholars response:", scholarsResponse.data);
        
        const traineesData = traineesResponse.data.trainees || [];
        const scholarsData = scholarsResponse.data.trainees || [];
        
        data = [...traineesData, ...scholarsData];
        console.log("Combined trainees + scholars:", data.length);
      }
      
      console.log("Parsed trainees:", data);
      setTrainees(data);

      // Extract unique offices
      const uniqueOffices = [
        ...new Set(
          data
            .map((t: Trainee) => t.traineeOffice)
            .filter((o: string | undefined) => o)
        ),
      ] as string[];
      setOffices(uniqueOffices);
    } catch (error) {
      console.error("Error fetching trainees:", error);
      addToast("Failed to fetch trainees", "error");
    } finally {
      setLoadingTrainees(false);
    }
  };

  const fetchDTRReport = async () => {
    setLoading(true);
    console.log("Fetching DTR report for trainees:", trainees.length);
    try {
      const dtrResults: DTRData[] = [];

      for (const trainee of trainees) {
        try {
          // Check if trainee has valid userID
          if (!trainee.userID?._id) {
            console.log("Skipping trainee without userID:", trainee);
            continue;
          }
          
          const response = await API.post("/dtr/office/get-user-dtr", {
            userId: trainee.userID._id,
            month: selectedMonth,
            year: selectedYear,
          });

          console.log(`DTR for ${trainee.userID.firstname}:`, response.data);

          if (response.data?.dtr) {
            dtrResults.push({
              ...response.data.dtr,
              userName: `${trainee.userID.firstname} ${trainee.userID.lastname}`,
              userEmail: trainee.userID.email,
              office: trainee.traineeOffice,
            });
          }
        } catch (error) {
          // Skip if no DTR found for this user
          console.log(`No DTR found for trainee ${trainee.userID?.firstname || 'unknown'}`);
        }
      }

      setDtrData(dtrResults);
    } catch (error) {
      console.error("Error fetching DTR report:", error);
      addToast("Failed to fetch DTR report", "error");
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals for an entry
  const calculateEntryHours = (entry: Entry): number => {
    const toMinutes = (t?: string) => {
      if (!t) return 0;
      const [h, m] = t.split(":");
      return (parseInt(h) || 0) * 60 + (parseInt(m) || 0);
    };

    let total = 0;
    if (entry.shifts && entry.shifts.length > 0) {
      entry.shifts.forEach((shift) => {
        const inTime = toMinutes(shift.in);
        const outTime = toMinutes(shift.out);
        if (outTime > inTime) {
          total += outTime - inTime;
        }
      });
    } else {
      const in1 = toMinutes(entry.in1);
      const out1 = toMinutes(entry.out1);
      const in2 = toMinutes(entry.in2);
      const out2 = toMinutes(entry.out2);
      if (out1 > in1) total += out1 - in1;
      if (out2 > in2) total += out2 - in2;
    }

    return total;
  };

  const calculateMonthlyHours = (entries: Entry[]): { hours: number; minutes: number } => {
    let totalMinutes = 0;
    entries.forEach((entry) => {
      totalMinutes += calculateEntryHours(entry);
    });
    return {
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60,
    };
  };

  const getConfirmedDays = (entries: Entry[]): number => {
    return entries.filter((e) => e.confirmationStatus === "confirmed").length;
  };

  const getExcusedDays = (entries: Entry[]): number => {
    return entries.filter((e) => e.excusedStatus === "excused").length;
  };

  const getAbsentDays = (entries: Entry[]): number => {
    return entries.filter((e) => e.status === "Absent").length;
  };

  // Filter data based on search and office
  const filteredData = dtrData.filter((dtr) => {
    const matchesSearch =
      searchQuery === "" ||
      dtr.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dtr.userEmail?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesOffice =
      selectedOffice === "all" || dtr.office === selectedOffice;

    return matchesSearch && matchesOffice;
  });

  // Summary statistics
  const summaryStats = {
    totalTrainees: filteredData.length,
    totalHours: filteredData.reduce((sum, dtr) => {
      const { hours, minutes } = calculateMonthlyHours(dtr.entries);
      return sum + hours + minutes / 60;
    }, 0),
    confirmedEntries: filteredData.reduce(
      (sum, dtr) => sum + getConfirmedDays(dtr.entries),
      0
    ),
    excusedDays: filteredData.reduce(
      (sum, dtr) => sum + getExcusedDays(dtr.entries),
      0
    ),
    absentDays: filteredData.reduce(
      (sum, dtr) => sum + getAbsentDays(dtr.entries),
      0
    ),
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>DTR Report - ${months.find((m) => m.value === selectedMonth)?.label} ${selectedYear}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #dc2626; color: white; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { color: #dc2626; margin-bottom: 5px; }
            .summary-box { background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
            .summary-item { text-align: center; }
            .summary-value { font-size: 24px; font-weight: bold; color: #dc2626; }
            .summary-label { font-size: 12px; color: #666; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const handleExportCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Office",
      "Total Hours",
      "Confirmed Days",
      "Excused Days",
      "Absent Days",
    ];

    const rows = filteredData.map((dtr) => {
      const { hours, minutes } = calculateMonthlyHours(dtr.entries);
      return [
        dtr.userName || "",
        dtr.userEmail || "",
        dtr.office || "",
        `${hours}:${minutes.toString().padStart(2, "0")}`,
        getConfirmedDays(dtr.entries),
        getExcusedDays(dtr.entries),
        getAbsentDays(dtr.entries),
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `DTR_Report_${months.find((m) => m.value === selectedMonth)?.label}_${selectedYear}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast("Report exported successfully", "success");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Sidebar currentPage="DTR Report" onCollapseChange={setIsSidebarCollapsed} />

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Header */}
        <div
          className={`hidden md:flex items-center gap-4 fixed top-0 left-0 right-0 z-30 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-800 h-[81px] ${
            isSidebarCollapsed
              ? "md:w-[calc(100%-5rem)] md:ml-20"
              : "md:w-[calc(100%-16rem)] md:ml-64"
          }`}
        >
          <div className="flex items-center gap-3 ml-4">
            <FileText className="h-7 w-7 text-white" />
            <h1 className="text-2xl font-bold text-white">DTR Report</h1>
          </div>
        </div>

        <div className="p-4 md:p-8 mt-16 md:mt-24">
          <Card className="shadow-xl">
            <CardContent className="p-6">
              {/* Filters Section */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Month Selector */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      title="Select Month"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
                    >
                      {months.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year Selector */}
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      title="Select Year"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
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

                  {/* Office Filter */}
                  {offices.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-gray-500" />
                      <select
                        value={selectedOffice}
                        onChange={(e) => setSelectedOffice(e.target.value)}
                        title="Filter by Office"
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
                      >
                        <option value="all">All Offices</option>
                        {offices.map((office) => (
                          <option key={office} value={office}>
                            {office}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Search */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                      <Printer className="h-4 w-4" />
                      Print
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Export CSV
                    </button>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 opacity-80" />
                    <span className="text-sm opacity-90">Total Trainees</span>
                  </div>
                  <div className="text-3xl font-bold">{summaryStats.totalTrainees}</div>
                </div>

                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 opacity-80" />
                    <span className="text-sm opacity-90">Total Hours</span>
                  </div>
                  <div className="text-3xl font-bold">
                    {Math.floor(summaryStats.totalHours)}h
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 opacity-80" />
                    <span className="text-sm opacity-90">Confirmed</span>
                  </div>
                  <div className="text-3xl font-bold">{summaryStats.confirmedEntries}</div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 opacity-80" />
                    <span className="text-sm opacity-90">Excused</span>
                  </div>
                  <div className="text-3xl font-bold">{summaryStats.excusedDays}</div>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 opacity-80" />
                    <span className="text-sm opacity-90">Absent</span>
                  </div>
                  <div className="text-3xl font-bold">{summaryStats.absentDays}</div>
                </div>
              </div>

              {/* Loading State */}
              {loadingTrainees ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-10 w-10 animate-spin text-red-600 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Loading trainees...
                  </p>
                </div>
              ) : loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-10 w-10 animate-spin text-red-600 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Loading DTR report...
                  </p>
                </div>
              ) : trainees.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    No Trainees Found
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    No trainees are assigned to generate DTR report.
                  </p>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="text-center py-16">
                  <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    No DTR Data Found
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    No DTR records found for the selected period. ({trainees.length} trainees checked)
                  </p>
                </div>
              ) : (
                <div ref={printRef}>
                  {/* Print Header (hidden on screen) */}
                  <div className="hidden print:block header mb-6">
                    <h1 className="text-2xl font-bold text-red-600">
                      DTR Report - {months.find((m) => m.value === selectedMonth)?.label}{" "}
                      {selectedYear}
                    </h1>
                    <p className="text-gray-600">
                      Generated on {new Date().toLocaleDateString()}
                    </p>
                  </div>

                  {/* Report Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                          <th className="px-4 py-3 text-left text-sm font-semibold border border-red-500">
                            #
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold border border-red-500">
                            Name
                          </th>
                          {role === "hr" && (
                            <th className="px-4 py-3 text-left text-sm font-semibold border border-red-500">
                              Office
                            </th>
                          )}
                          <th className="px-4 py-3 text-center text-sm font-semibold border border-red-500">
                            Total Hours
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold border border-red-500">
                            Confirmed
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold border border-red-500">
                            Excused
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold border border-red-500">
                            Absent
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold border border-red-500">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((dtr, index) => {
                          const { hours, minutes } = calculateMonthlyHours(dtr.entries);
                          const confirmedDays = getConfirmedDays(dtr.entries);
                          const excusedDays = getExcusedDays(dtr.entries);
                          const absentDays = getAbsentDays(dtr.entries);

                          return (
                            <tr
                              key={dtr._id}
                              className="even:bg-gray-50 dark:even:bg-gray-800/30 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                            >
                              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                {index + 1}
                              </td>
                              <td className="px-4 py-3 border border-gray-200 dark:border-gray-700">
                                <div className="font-medium text-gray-800 dark:text-gray-200">
                                  {dtr.userName}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {dtr.userEmail}
                                </div>
                              </td>
                              {role === "hr" && (
                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                  {dtr.office || "-"}
                                </td>
                              )}
                              <td className="px-4 py-3 text-center border border-gray-200 dark:border-gray-700">
                                <span className="font-bold text-blue-600 dark:text-blue-400">
                                  {hours}h {minutes.toString().padStart(2, "0")}m
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center border border-gray-200 dark:border-gray-700">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                  {confirmedDays}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center border border-gray-200 dark:border-gray-700">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                  {excusedDays}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center border border-gray-200 dark:border-gray-700">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                  {absentDays}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center border border-gray-200 dark:border-gray-700">
                                {hours >= 30 ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Quota Met
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                    <Clock className="h-3 w-3" />
                                    In Progress
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DTRReport;
