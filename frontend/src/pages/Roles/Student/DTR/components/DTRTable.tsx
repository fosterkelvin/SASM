import React, { useMemo } from "react";
import DayRow from "./DayRow";
import { Entry } from "./types";

interface DTRTableProps {
  entries: Entry[];
  onChange: (id: number, changes: Partial<Entry>) => void;
  month: number;
  year: number;
  isEditable?: boolean;
}

const DTRTable: React.FC<DTRTableProps> = ({
  entries,
  onChange,
  month,
  year,
  isEditable = true,
}) => {
  const [showAllShifts, setShowAllShifts] = React.useState(false);

  // Calculate total hours for the month
  const totalStats = useMemo(() => {
    let totalMinutes = 0;
    let totalOfficialMinutes = 0;
    let totalDays = 0;

    entries.forEach((entry) => {
      if (entry.totalHours && entry.totalHours > 0) {
        totalMinutes += entry.totalHours;
        // Apply 5-hour (300 minutes) daily limit for official total
        totalOfficialMinutes += Math.min(entry.totalHours, 300);
        totalDays++;
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const officialHours = Math.floor(totalOfficialMinutes / 60);
    const officialMinutes = totalOfficialMinutes % 60;

    return {
      totalHours: `${hours}:${minutes.toString().padStart(2, "0")}`,
      officialHours: `${officialHours}:${officialMinutes
        .toString()
        .padStart(2, "0")}`,
      totalDays,
      hasExceededLimit: totalMinutes > totalOfficialMinutes,
    };
  }, [entries]);

  return (
    <div className="space-y-4">
      {/* Toggle button for additional shifts */}
      <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {showAllShifts
              ? "Showing all 4 shifts"
              : "Showing 2 shifts (Morning & Afternoon)"}
          </span>
          <span className="text-xs text-blue-600 dark:text-blue-400">
            {showAllShifts
              ? "Hide extra shifts if not needed"
              : "Have more than 2 duties per day?"}
          </span>
        </div>
        <button
          onClick={() => setShowAllShifts(!showAllShifts)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
        >
          {showAllShifts ? (
            <>
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
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              Hide Shifts 3 & 4
            </>
          ) : (
            <>
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Show Shifts 3 & 4
            </>
          )}
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full border-collapse bg-white dark:bg-gray-900">
          <thead>
            <tr className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 text-white">
              <th className="border border-red-500 dark:border-red-700 px-3 py-3 text-sm font-bold">
                Day
              </th>
              <th className="border border-red-500 dark:border-red-700 px-3 py-3 text-sm font-bold">
                Weekday
              </th>
              <th className="border border-red-500 dark:border-red-700 px-3 py-3 text-sm font-bold">
                <div className="flex flex-col items-center">
                  <span>IN</span>
                  <span className="text-xs font-normal text-white/80">
                    Shift 1
                  </span>
                </div>
              </th>
              <th className="border border-red-500 dark:border-red-700 px-3 py-3 text-sm font-bold">
                <div className="flex flex-col items-center">
                  <span>OUT</span>
                  <span className="text-xs font-normal text-white/80">
                    Shift 1
                  </span>
                </div>
              </th>
              <th className="border border-red-500 dark:border-red-700 px-3 py-3 text-sm font-bold">
                <div className="flex flex-col items-center">
                  <span>IN</span>
                  <span className="text-xs font-normal text-white/80">
                    Shift 2
                  </span>
                </div>
              </th>
              <th className="border border-red-500 dark:border-red-700 px-3 py-3 text-sm font-bold">
                <div className="flex flex-col items-center">
                  <span>OUT</span>
                  <span className="text-xs font-normal text-white/80">
                    Shift 2
                  </span>
                </div>
              </th>
              {showAllShifts && (
                <>
                  <th className="border border-red-500 dark:border-red-700 px-3 py-3 text-sm font-bold">
                    <div className="flex flex-col items-center">
                      <span>IN</span>
                      <span className="text-xs font-normal text-white/80">
                        Shift 3
                      </span>
                    </div>
                  </th>
                  <th className="border border-red-500 dark:border-red-700 px-3 py-3 text-sm font-bold">
                    <div className="flex flex-col items-center">
                      <span>OUT</span>
                      <span className="text-xs font-normal text-white/80">
                        Shift 3
                      </span>
                    </div>
                  </th>
                  <th className="border border-red-500 dark:border-red-700 px-3 py-3 text-sm font-bold">
                    <div className="flex flex-col items-center">
                      <span>IN</span>
                      <span className="text-xs font-normal text-white/80">
                        Shift 4
                      </span>
                    </div>
                  </th>
                  <th className="border border-red-500 dark:border-red-700 px-3 py-3 text-sm font-bold">
                    <div className="flex flex-col items-center">
                      <span>OUT</span>
                      <span className="text-xs font-normal text-white/80">
                        Shift 4
                      </span>
                    </div>
                  </th>
                </>
              )}
              <th className="border border-red-500 dark:border-red-700 px-3 py-3 text-sm font-bold">
                Late
              </th>
              <th className="border border-red-500 dark:border-red-700 px-3 py-3 text-sm font-bold">
                Undertime
              </th>
              <th className="border border-red-500 dark:border-red-700 px-3 py-3 text-sm font-bold">
                Total Hours
              </th>
              <th className="border border-red-500 dark:border-red-700 px-3 py-3 text-sm font-bold">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <DayRow
                key={e.id}
                entry={e}
                onChange={onChange}
                month={month}
                year={year}
                isEditable={isEditable}
                showAllShifts={showAllShifts}
              />
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 dark:bg-gray-800/50">
              <td
                className="border border-gray-200 dark:border-gray-700 px-3 py-3 text-sm font-bold text-gray-800 dark:text-gray-200"
                colSpan={2}
              >
                TOTAL
              </td>
              <td
                className="border border-gray-200 dark:border-gray-700 px-2 py-3"
                colSpan={showAllShifts ? 10 : 6}
              >
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-4 px-2">
                  <span>
                    Days worked:{" "}
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {totalStats.totalDays}
                    </span>
                  </span>
                </div>
              </td>
              <td
                className="border border-gray-200 dark:border-gray-700 px-3 py-3 text-center"
                colSpan={1}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                    {totalStats.totalHours}
                  </span>
                  {totalStats.hasExceededLimit && (
                    <span className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
                      Official: {totalStats.officialHours}
                    </span>
                  )}
                </div>
              </td>
              <td className="border border-gray-200 dark:border-gray-700 px-2 py-3"></td>
            </tr>
          </tfoot>
        </table>

        {/* Legend */}
        <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              Legend:
            </span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 border-green-400 dark:border-green-600"></div>
              <span>Filled fields</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20"></div>
              <span>Focused field</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
              <span>Sundays (No duty)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-orange-600 dark:text-orange-400 font-semibold">
                ⓘ
              </span>
              <span>5-hour daily limit applies to official totals</span>
            </div>
            {!isEditable && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                  ⓘ Read-only mode
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DTRTable;
