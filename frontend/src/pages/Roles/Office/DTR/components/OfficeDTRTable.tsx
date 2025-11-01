import React from "react";
import StatusSelector from "./StatusSelector";
import { Entry, Shift } from "@/pages/Roles/Student/DTR/components/types";

interface OfficeDTRTableProps {
  entries: Entry[];
  onChange: (id: number, changes: Partial<Entry>) => void;
  month: number;
  year: number;
}

const OfficeDTRTable: React.FC<OfficeDTRTableProps> = ({
  entries,
  onChange,
  month,
  year,
}) => {
  // Get weekday for a given day
  const getWeekday = (day: number): string => {
    const date = new Date(year, month - 1, day);
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return weekdays[date.getDay()];
  };

  // Check if day is Sunday
  const isSunday = (day: number): boolean => {
    const date = new Date(year, month - 1, day);
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

  // Calculate monthly totals
  const calculateMonthlyTotals = () => {
    let totalMinutes = 0;

    entries.forEach((entry) => {
      const hourStr = computeTotal(entry);
      const [h, m] = hourStr.split(":").map(Number);
      totalMinutes += h * 60 + (m || 0);
    });

    const totalHours = Math.floor(totalMinutes / 60);
    const totalMins = totalMinutes % 60;

    return {
      totalHours: `${totalHours}:${totalMins.toString().padStart(2, "0")}`,
      totalDays: entries.filter((e) => {
        const shifts = getShifts(e);
        return shifts.some((s) => s.in || s.out);
      }).length,
    };
  };

  const monthlyTotals = calculateMonthlyTotals();

  return (
    <div className="space-y-3">
      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2">
        <svg
          className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <div className="mb-1">
            <span className="font-semibold">Dynamic Shift System:</span>{" "}
            Students can log unlimited duty shifts per day. Each row displays
            all IN/OUT times for that day.
          </div>
          <div className="text-xs">
            <span className="font-semibold text-red-600 dark:text-red-400">
              Note:
            </span>{" "}
            Sundays are automatically locked (no duties).
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <table className="w-full border-collapse bg-white dark:bg-gray-900">
          <thead>
            <tr className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 text-white">
              <th className="border border-red-500 dark:border-red-700 px-3 py-3 text-sm font-bold w-16">
                Day
              </th>
              <th className="border border-red-500 dark:border-red-700 px-3 py-3 text-sm font-bold w-20">
                Weekday
              </th>
              <th className="border border-red-500 dark:border-red-700 px-3 py-3 text-sm font-bold">
                <div className="flex flex-col items-center">
                  <span>Duty Shifts</span>
                  <span className="text-xs font-normal text-white/80">
                    IN → OUT times
                  </span>
                </div>
              </th>
              <th className="border border-red-500 dark:border-red-700 px-3 py-3 text-sm font-bold w-24">
                Total Hours
              </th>
              <th className="border border-red-500 dark:border-red-700 px-3 py-3 text-sm font-bold w-32">
                Status
              </th>
              <th className="border border-red-500 dark:border-red-700 px-3 py-3 text-sm font-bold w-32">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => {
              const shifts = getShifts(e);
              const hasData = shifts.some((s) => s.in || s.out);
              const weekday = getWeekday(e.id);
              const isSundayDay = isSunday(e.id);

              return (
                <tr
                  key={e.id}
                  className="even:bg-white odd:bg-slate-50 dark:even:bg-gray-900 dark:odd:bg-gray-800/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                >
                  <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-center font-bold text-gray-800 dark:text-gray-200">
                    {e.id}
                  </td>

                  {/* Weekday Column */}
                  <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-center">
                    <span
                      className={`font-semibold ${
                        isSundayDay
                          ? "text-red-600 dark:text-red-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {weekday}
                    </span>
                  </td>

                  {/* Shifts Column */}
                  <td className="border border-gray-200 dark:border-gray-700 px-3 py-3">
                    {hasData ? (
                      <div className="space-y-1">
                        {shifts.map((shift, index) => {
                          if (!shift.in && !shift.out) return null;
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm"
                            >
                              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 w-14">
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
                    ) : (
                      <div className="text-center text-gray-400">-</div>
                    )}
                  </td>

                  {/* Total Hours */}
                  <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-center">
                    {isSundayDay ? (
                      <span className="text-gray-400">-</span>
                    ) : (
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {computeTotal(e)}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="border border-gray-200 dark:border-gray-700 px-2 py-2 text-sm text-center">
                    <StatusSelector
                      value={deriveStatus(e, e.status)}
                      onChange={(v) => onChange(e.id, { status: v })}
                    />
                  </td>

                  {/* Actions */}
                  <td className="border border-gray-200 dark:border-gray-700 px-2 py-2 text-sm text-center">
                    <button
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-1 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => {
                        const displayed = deriveStatus(e, e.status);
                        onChange(e.id, { status: displayed });
                        console.log(
                          `Saved status for day ${e.id}: ${displayed}`
                        );
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Confirm
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Monthly Summary */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4">
        <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-3 flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Monthly Summary
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-indigo-100 dark:border-indigo-800">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Total Hours Logged
            </div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {monthlyTotals.totalHours}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-indigo-100 dark:border-indigo-800">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Days with Entries
            </div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {monthlyTotals.totalDays}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function computeTotal(e: Entry) {
  const toMinutes = (t?: string) => {
    if (!t) return 0;
    const [h, m] = t.split(":");
    const hh = parseInt(h || "0", 10);
    const mm = parseInt(m || "0", 10);
    if (isNaN(hh) || isNaN(mm)) return 0;
    return hh * 60 + mm;
  };

  let total = 0;

  // Calculate from shifts array if available
  if (e.shifts && e.shifts.length > 0) {
    e.shifts.forEach((shift) => {
      const inTime = toMinutes(shift.in);
      const outTime = toMinutes(shift.out);
      if (outTime > inTime) {
        total += outTime - inTime;
      }
    });
  } else {
    // Fallback to legacy fields
    const in1 = toMinutes(e.in1);
    const out1 = toMinutes(e.out1);
    const in2 = toMinutes(e.in2);
    const out2 = toMinutes(e.out2);
    const in3 = toMinutes(e.in3);
    const out3 = toMinutes(e.out3);
    const in4 = toMinutes(e.in4);
    const out4 = toMinutes(e.out4);

    if (out1 > in1) total += out1 - in1;
    if (out2 > in2) total += out2 - in2;
    if (out3 > in3) total += out3 - in3;
    if (out4 > in4) total += out4 - in4;
  }

  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

function hasInOut(e: Entry) {
  // Check shifts array first
  if (e.shifts && e.shifts.length > 0) {
    return e.shifts.some((shift) => shift.in || shift.out);
  }
  // Fallback to legacy fields
  const present = (a?: string, b?: string) => Boolean(a && b);
  return (
    present(e.in1, e.out1) ||
    present(e.in2, e.out2) ||
    present(e.in3, e.out3) ||
    present(e.in4, e.out4)
  );
}

function deriveStatus(e: Entry, explicit?: string) {
  if (explicit && explicit !== "") return explicit;
  if (hasInOut(e)) return "Unconfirmed";
  return "";
}

export default OfficeDTRTable;
