import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Clock, AlertTriangle, Calendar, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Entry {
  id: number;
  day?: number;
  in1?: string;
  out1?: string;
  in2?: string;
  out2?: string;
  in3?: string;
  out3?: string;
  in4?: string;
  out4?: string;
  status?: string;
  totalHours?: number;
  late?: number;
  undertime?: number;
  confirmationStatus?: "unconfirmed" | "confirmed";
  excusedStatus?: "none" | "excused";
}

interface DTR {
  _id: string;
  userId: string;
  month: number;
  year: number;
  entries: Entry[];
  status: "draft" | "submitted" | "approved" | "rejected";
  totalMonthlyHours?: number;
}

interface DutyHour {
  day: string;
  startTime: string;
  endTime: string;
  location: string;
}

const API_URL = import.meta.env.VITE_API || "http://localhost:4004";

const MakeupDutyReminder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Only show for scholars (SA, SM, active status)
  const isScholar =
    user?.status === "SA" || user?.status === "SM" || user?.status === "active";

  // Current date for defaults
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const currentDay = now.getDate();

  // Fetch DTR data for current month
  const { data: dtrData, isLoading: dtrLoading } = useQuery({
    queryKey: ["studentDTR", currentMonth, currentYear],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/dtr/get-or-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ month: currentMonth, year: currentYear }),
      });
      if (!response.ok) throw new Error("Failed to fetch DTR");
      return response.json();
    },
    enabled: !!user && isScholar,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch schedule data to get duty hours
  const { data: scheduleData } = useQuery({
    queryKey: ["studentSchedule"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/scholars/schedule`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch schedule");
      return response.json();
    },
    enabled: !!user && isScholar,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Don't show for non-scholars
  if (!isScholar) {
    return null;
  }

  // Loading state
  if (dtrLoading) {
    return null;
  }

  const dtr: DTR | null = dtrData?.dtr;
  const dutyHours: DutyHour[] = scheduleData?.dutyHours || [];

  // Helper to check if a day is a scheduled duty day
  const getDayName = (date: Date): string => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  };

  // Calculate expected hours per duty day (default 5 hours)
  const calculateExpectedHours = (dutyHour: DutyHour): number => {
    const [startH, startM] = dutyHour.startTime.split(":").map(Number);
    const [endH, endM] = dutyHour.endTime.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return Math.max(0, (endMinutes - startMinutes) / 60);
  };

  // Get scheduled duty days for the week
  const scheduledDutyDays = dutyHours.map((dh) => dh.day.toUpperCase());

  // Calculate makeup duty information
  const calculateMakeupDuty = () => {
    if (!dtr || !dtr.entries) {
      return { missedDays: 0, undertimeMinutes: 0, lateMinutes: 0, deficientHours: 0 };
    }

    let missedDays = 0;
    let totalUndertimeMinutes = 0;
    let totalLateMinutes = 0;
    let totalDeficientMinutes = 0;

    // Get days in current month up to today
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const daysToCheck = Math.min(currentDay - 1, daysInMonth); // Check days before today

    for (let day = 1; day <= daysToCheck; day++) {
      const date = new Date(currentYear, currentMonth - 1, day);
      const dayName = getDayName(date).toUpperCase();

      // Skip if not a scheduled duty day
      if (!scheduledDutyDays.includes(dayName)) {
        continue;
      }

      // Find entry for this day
      const entry = dtr.entries.find((e) => e.id === day || e.day === day);

      // Check if day is excused
      if (entry?.excusedStatus === "excused") {
        continue;
      }

      // Get expected hours for this day
      const dutyHour = dutyHours.find(
        (dh) => dh.day.toUpperCase() === dayName
      );
      const expectedHours = dutyHour ? calculateExpectedHours(dutyHour) : 5;
      const expectedMinutes = expectedHours * 60;

      // Calculate actual hours worked
      const actualMinutes = entry?.totalHours || 0;

      // Check for missed/absent days
      if (
        !entry ||
        entry.status === "Absent" ||
        (!entry.in1 && !entry.out1 && actualMinutes === 0)
      ) {
        missedDays++;
        totalDeficientMinutes += expectedMinutes;
        continue;
      }

      // Add undertime
      if (entry.undertime && entry.undertime > 0) {
        totalUndertimeMinutes += entry.undertime;
      }

      // Add late
      if (entry.late && entry.late > 0) {
        totalLateMinutes += entry.late;
      }

      // Calculate deficiency if worked less than expected
      if (actualMinutes < expectedMinutes && actualMinutes > 0) {
        totalDeficientMinutes += expectedMinutes - actualMinutes;
      }
    }

    return {
      missedDays,
      undertimeMinutes: totalUndertimeMinutes,
      lateMinutes: totalLateMinutes,
      deficientHours: Math.ceil(totalDeficientMinutes / 60),
    };
  };

  const makeupInfo = calculateMakeupDuty();
  const hasMakeupDuty =
    makeupInfo.missedDays > 0 ||
    makeupInfo.undertimeMinutes > 0 ||
    makeupInfo.deficientHours > 0;

  // Don't show if no makeup duty needed
  if (!hasMakeupDuty) {
    return null;
  }

  const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    }
    return `${mins}m`;
  };

  const monthNames = [
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
  ];

  return (
    <Card className="mb-6 border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 shadow-md">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                Makeup Duty Reminder
              </h3>
              <span className="px-2 py-0.5 text-xs font-medium bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-full">
                {monthNames[currentMonth - 1]} {currentYear}
              </span>
            </div>

            <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
              You have accumulated duty hours that need to be made up. Please
              coordinate with your office supervisor to schedule your makeup
              duty.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {makeupInfo.missedDays > 0 && (
                <div className="bg-white/60 dark:bg-gray-800/40 rounded-lg p-3 border border-amber-200 dark:border-amber-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Missed Days
                    </span>
                  </div>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">
                    {makeupInfo.missedDays}
                  </p>
                </div>
              )}

              {makeupInfo.undertimeMinutes > 0 && (
                <div className="bg-white/60 dark:bg-gray-800/40 rounded-lg p-3 border border-amber-200 dark:border-amber-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Undertime
                    </span>
                  </div>
                  <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    {formatMinutes(makeupInfo.undertimeMinutes)}
                  </p>
                </div>
              )}

              {makeupInfo.lateMinutes > 0 && (
                <div className="bg-white/60 dark:bg-gray-800/40 rounded-lg p-3 border border-amber-200 dark:border-amber-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Late
                    </span>
                  </div>
                  <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                    {formatMinutes(makeupInfo.lateMinutes)}
                  </p>
                </div>
              )}

              {makeupInfo.deficientHours > 0 && (
                <div className="bg-white/60 dark:bg-gray-800/40 rounded-lg p-3 border border-amber-200 dark:border-amber-700">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Total to Makeup
                    </span>
                  </div>
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                    ~{makeupInfo.deficientHours}h
                  </p>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => navigate("/dtr")}
                className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800 text-white"
              >
                View DTR
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/schedule")}
                className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30"
              >
                View Schedule
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MakeupDutyReminder;
