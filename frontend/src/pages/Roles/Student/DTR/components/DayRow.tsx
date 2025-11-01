import React, { useState } from "react";
import { Entry } from "./types";

interface DayRowProps {
  entry: Entry;
  onChange: (id: number, changes: Partial<Entry>) => void;
  month: number;
  year: number;
  isEditable?: boolean;
  showAllShifts?: boolean;
}

const DayRow: React.FC<DayRowProps> = ({
  entry,
  onChange,
  month,
  year,
  isEditable = true,
  showAllShifts = false,
}) => {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Calculate the day of week for this entry
  const date = new Date(year, month - 1, entry.id);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const isSunday = dayOfWeek === 0;

  // Check if entry is confirmed by office
  const isConfirmed = entry.confirmationStatus === "confirmed";

  // Check if this day has passed (only restrict if confirmed)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to midnight for comparison
  const entryDate = new Date(year, month - 1, entry.id);
  entryDate.setHours(0, 0, 0, 0);
  const isPastDay = entryDate < today;
  const isFutureDay = entryDate > today;

  // Only apply date restrictions if entry is confirmed
  const isDateRestricted = isConfirmed && (isPastDay || isFutureDay);

  const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekdayName = weekdayNames[dayOfWeek];

  // Normalize time input to ensure HH:MM format
  const normalizeTime = (value: string): string => {
    if (!value) return "";

    // Remove any whitespace
    value = value.trim();

    // If value is already in HH:MM format, return as is
    if (/^\d{2}:\d{2}$/.test(value)) {
      return value;
    }

    // If value is just hours (e.g., "13" or "1"), add ":00"
    if (/^\d{1,2}$/.test(value)) {
      const hours = parseInt(value, 10);
      if (hours >= 0 && hours <= 23) {
        return `${hours.toString().padStart(2, "0")}:00`;
      }
    }

    // If value has partial format with empty or incomplete minutes
    if (value.includes(":")) {
      const parts = value.split(":");
      const hours = parseInt(parts[0] || "0", 10);
      const minutesPart = parts[1] || "";

      let minutes = 0;
      if (minutesPart && /^\d+$/.test(minutesPart)) {
        minutes = parseInt(minutesPart, 10);
      }

      if (
        !isNaN(hours) &&
        hours >= 0 &&
        hours <= 23 &&
        minutes >= 0 &&
        minutes <= 59
      ) {
        return `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;
      }
    }

    return value;
  };

  const handleInput = (field: keyof Entry, value: string) => {
    if (isSunday || !isEditable) return;

    // Normalize the value
    const normalizedValue = normalizeTime(value);

    // Validate shift time constraints
    if (normalizedValue) {
      const [hours, minutes] = normalizedValue.split(":").map(Number);
      const totalMinutes = hours * 60 + minutes;

      // Morning shift: in1 should be 7:00 AM - 11:59 AM, out1 can be up to 12:00 PM
      if (field === "in1") {
        const morningStart = 7 * 60; // 7:00 AM
        const morningEnd = 12 * 60 - 1; // 11:59 AM (exclude 12:00 PM for Time In)
        if (totalMinutes < morningStart || totalMinutes > morningEnd) {
          return; // Block times outside 7:00 AM - 11:59 AM
        }
        // Prevent IN and OUT from being the same time
        if (entry.out1 && normalizedValue === entry.out1) {
          return; // Block same time for IN and OUT
        }
      }

      if (field === "out1") {
        const morningStart = 7 * 60; // 7:00 AM
        const morningEnd = 12 * 60; // 12:00 PM (allow 12:00 PM for Time Out)
        if (totalMinutes < morningStart || totalMinutes > morningEnd) {
          return; // Block times outside 7:00 AM - 12:00 PM
        }
        // Prevent IN and OUT from being the same time
        if (entry.in1 && normalizedValue === entry.in1) {
          return; // Block same time for IN and OUT
        }
        // OUT must be after IN
        if (entry.in1) {
          const [inHours, inMinutes] = entry.in1.split(":").map(Number);
          const inTotalMinutes = inHours * 60 + inMinutes;
          if (totalMinutes <= inTotalMinutes) {
            return; // OUT must be after IN
          }
        }
      }

      // Afternoon shift: in2 should be 1:00 PM - 8:00 PM, out2 can be up to 8:00 PM
      if (field === "in2") {
        const afternoonStart = 13 * 60; // 1:00 PM
        const afternoonEnd = 20 * 60; // 8:00 PM
        if (totalMinutes < afternoonStart || totalMinutes > afternoonEnd) {
          return; // Block times outside 1:00 PM - 8:00 PM
        }
        // Prevent IN and OUT from being the same time
        if (entry.out2 && normalizedValue === entry.out2) {
          return; // Block same time for IN and OUT
        }
      }

      if (field === "out2") {
        const afternoonStart = 13 * 60; // 1:00 PM
        const afternoonEnd = 20 * 60; // 8:00 PM
        if (totalMinutes < afternoonStart || totalMinutes > afternoonEnd) {
          return; // Block times outside 1:00 PM - 8:00 PM
        }
        // Prevent IN and OUT from being the same time
        if (entry.in2 && normalizedValue === entry.in2) {
          return; // Block same time for IN and OUT
        }
        // OUT must be after IN
        if (entry.in2) {
          const [inHours, inMinutes] = entry.in2.split(":").map(Number);
          const inTotalMinutes = inHours * 60 + inMinutes;
          if (totalMinutes <= inTotalMinutes) {
            return; // OUT must be after IN
          }
        }
      }
    }

    onChange(entry.id, { [field]: normalizedValue });
  };

  const handleBlur = (field: keyof Entry) => {
    if (isSunday || !isEditable) return;

    setFocusedField(null);

    // Get the current value from the entry
    const currentValue = entry[field as keyof Entry] as string | undefined;

    // If there's a value, normalize it on blur
    if (currentValue) {
      const normalizedValue = normalizeTime(currentValue);
      if (normalizedValue !== currentValue) {
        onChange(entry.id, { [field]: normalizedValue });
      }
    }
  };

  const handleFocus = (field: string) => {
    setFocusedField(field);
  };

  // Compute total hours for display
  const computeTotal = () => {
    const toMinutes = (t?: string) => {
      if (!t) return 0;
      const [h, m] = t.split(":");
      const hh = parseInt(h || "0", 10);
      const mm = parseInt(m || "0", 10);
      if (isNaN(hh) || isNaN(mm)) return 0;
      return hh * 60 + mm;
    };

    const in1 = toMinutes(entry.in1);
    const out1 = toMinutes(entry.out1);
    const in2 = toMinutes(entry.in2);
    const out2 = toMinutes(entry.out2);
    const in3 = toMinutes(entry.in3);
    const out3 = toMinutes(entry.out3);
    const in4 = toMinutes(entry.in4);
    const out4 = toMinutes(entry.out4);

    let total = 0;
    if (out1 > in1) total += out1 - in1;
    if (out2 > in2) total += out2 - in2;
    if (out3 > in3) total += out3 - in3;
    if (out4 > in4) total += out4 - in4;
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  // Get input styling based on state
  const getInputClassName = (field: string, hasValue: boolean) => {
    const baseClasses =
      "w-full px-2 py-1.5 text-center text-sm border rounded transition-all";
    const disabledClasses = isSunday
      ? "bg-gray-200 dark:bg-gray-700 cursor-not-allowed text-gray-400"
      : !isEditable
      ? "bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
      : "";

    const focusClasses =
      focusedField === field && isEditable && !isSunday
        ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-900/20"
        : hasValue && !isSunday
        ? "border-green-300 dark:border-green-700 bg-white dark:bg-gray-800"
        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800";

    return `${baseClasses} ${disabledClasses || focusClasses}`;
  };

  return (
    <tr
      className={`${
        isSunday
          ? "bg-gray-100 dark:bg-gray-800/50"
          : "even:bg-white odd:bg-slate-50 dark:even:bg-gray-900 dark:odd:bg-gray-800/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
      }`}
    >
      {/* Day */}
      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-center font-bold text-gray-800 dark:text-gray-200">
        {entry.id}
      </td>

      {/* Weekday */}
      <td
        className={`border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-center font-medium ${
          isSunday
            ? "text-red-600 dark:text-red-400"
            : "text-gray-700 dark:text-gray-300"
        }`}
      >
        <div className="flex flex-col items-center">
          <span>{weekdayName}</span>
          {isSunday && (
            <span className="text-xs text-red-500 dark:text-red-400 mt-0.5">
              No Duty
            </span>
          )}
        </div>
      </td>

      {/* IN 1 */}
      <td className="border border-gray-200 dark:border-gray-700 px-2 py-2">
        <input
          type="time"
          value={entry.in1 || ""}
          onChange={(e) => handleInput("in1", e.target.value)}
          onBlur={() => handleBlur("in1")}
          onFocus={() => handleFocus("in1")}
          disabled={isSunday || !isEditable || isDateRestricted}
          className={getInputClassName("in1", !!entry.in1)}
          title={
            isSunday
              ? "No duty hours on Sundays"
              : isConfirmed
              ? "Entry is confirmed and locked by office"
              : "Time In (Morning: 7:00 AM - 11:59 AM)"
          }
          placeholder="--:--"
          min="07:00"
          max="11:59"
        />
      </td>

      {/* OUT 1 */}
      <td className="border border-gray-200 dark:border-gray-700 px-2 py-2">
        <input
          type="time"
          value={entry.out1 || ""}
          onChange={(e) => handleInput("out1", e.target.value)}
          onBlur={() => handleBlur("out1")}
          onFocus={() => handleFocus("out1")}
          disabled={isSunday || !isEditable || isDateRestricted}
          className={getInputClassName("out1", !!entry.out1)}
          title={
            isSunday
              ? "No duty hours on Sundays"
              : isConfirmed
              ? "Entry is confirmed and locked by office"
              : "Time Out (Morning: 7:00 AM - 12:00 PM) - Must be after Time In"
          }
          placeholder="--:--"
          min="07:00"
          max="12:00"
        />
      </td>

      {/* IN 2 */}
      <td className="border border-gray-200 dark:border-gray-700 px-2 py-2">
        <input
          type="time"
          value={entry.in2 || ""}
          onChange={(e) => handleInput("in2", e.target.value)}
          onBlur={() => handleBlur("in2")}
          onFocus={() => handleFocus("in2")}
          disabled={isSunday || !isEditable || isDateRestricted}
          className={getInputClassName("in2", !!entry.in2)}
          title={
            isSunday
              ? "No duty hours on Sundays"
              : isConfirmed
              ? "Entry is confirmed and locked by office"
              : "Time In (Afternoon: 1:00 PM - 5:00 PM)"
          }
          placeholder="--:--"
          min="13:00"
          max="17:00"
        />
      </td>

      {/* OUT 2 */}
      <td className="border border-gray-200 dark:border-gray-700 px-2 py-2">
        <input
          type="time"
          value={entry.out2 || ""}
          onChange={(e) => handleInput("out2", e.target.value)}
          onBlur={() => handleBlur("out2")}
          onFocus={() => handleFocus("out2")}
          disabled={isSunday || !isEditable || isDateRestricted}
          className={getInputClassName("out2", !!entry.out2)}
          title={
            isSunday
              ? "No duty hours on Sundays"
              : isConfirmed
              ? "Entry is confirmed and locked by office"
              : "Time Out (Afternoon: 1:00 PM - 5:00 PM)"
          }
          placeholder="--:--"
          min="13:00"
          max="17:00"
        />
      </td>

      {showAllShifts && (
        <>
          {/* IN 3 */}
          <td className="border border-gray-200 dark:border-gray-700 px-2 py-2">
            <input
              type="time"
              value={entry.in3 || ""}
              onChange={(e) => handleInput("in3", e.target.value)}
              onBlur={() => handleBlur("in3")}
              onFocus={() => handleFocus("in3")}
              disabled={isSunday || !isEditable || isDateRestricted}
              className={getInputClassName("in3", !!entry.in3)}
              title={
                isSunday
                  ? "No duty hours on Sundays"
                  : isConfirmed
                  ? "Entry is confirmed and locked by office"
                  : "Time In (Shift 3)"
              }
              placeholder="--:--"
            />
          </td>

          {/* OUT 3 */}
          <td className="border border-gray-200 dark:border-gray-700 px-2 py-2">
            <input
              type="time"
              value={entry.out3 || ""}
              onChange={(e) => handleInput("out3", e.target.value)}
              onBlur={() => handleBlur("out3")}
              onFocus={() => handleFocus("out3")}
              disabled={isSunday || !isEditable || isDateRestricted}
              className={getInputClassName("out3", !!entry.out3)}
              title={
                isSunday
                  ? "No duty hours on Sundays"
                  : isConfirmed
                  ? "Entry is confirmed and locked by office"
                  : "Time Out (Shift 3) - Must be after Time In"
              }
              placeholder="--:--"
            />
          </td>

          {/* IN 4 */}
          <td className="border border-gray-200 dark:border-gray-700 px-2 py-2">
            <input
              type="time"
              value={entry.in4 || ""}
              onChange={(e) => handleInput("in4", e.target.value)}
              onBlur={() => handleBlur("in4")}
              onFocus={() => handleFocus("in4")}
              disabled={isSunday || !isEditable || isDateRestricted}
              className={getInputClassName("in4", !!entry.in4)}
              title={
                isSunday
                  ? "No duty hours on Sundays"
                  : isConfirmed
                  ? "Entry is confirmed and locked by office"
                  : "Time In (Shift 4)"
              }
              placeholder="--:--"
            />
          </td>

          {/* OUT 4 */}
          <td className="border border-gray-200 dark:border-gray-700 px-2 py-2">
            <input
              type="time"
              value={entry.out4 || ""}
              onChange={(e) => handleInput("out4", e.target.value)}
              onBlur={() => handleBlur("out4")}
              onFocus={() => handleFocus("out4")}
              disabled={isSunday || !isEditable || isDateRestricted}
              className={getInputClassName("out4", !!entry.out4)}
              title={
                isSunday
                  ? "No duty hours on Sundays"
                  : isConfirmed
                  ? "Entry is confirmed and locked by office"
                  : "Time Out (Shift 4) - Must be after Time In"
              }
              placeholder="--:--"
            />
          </td>
        </>
      )}

      {/* Late */}
      <td className="border border-gray-200 dark:border-gray-700 px-2 py-2 text-sm text-center text-gray-500 dark:text-gray-400">
        {isSunday ? (
          <span className="text-gray-400">-</span>
        ) : entry.late ? (
          <span className="text-red-600 dark:text-red-400 font-medium">
            {entry.late}m
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>

      {/* Undertime */}
      <td className="border border-gray-200 dark:border-gray-700 px-2 py-2 text-sm text-center text-gray-500 dark:text-gray-400">
        {isSunday ? (
          <span className="text-gray-400">-</span>
        ) : entry.undertime ? (
          <span className="text-orange-600 dark:text-orange-400 font-medium">
            {entry.undertime}m
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>

      {/* Total Hours */}
      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-center">
        {isSunday ? (
          <span className="text-gray-400 font-medium">-</span>
        ) : (
          (() => {
            const totalDisplay = computeTotal();
            const totalMinutes = entry.totalHours || 0;
            const exceeds5Hours = totalMinutes > 300;

            return (
              <div className="flex flex-col items-center gap-0.5">
                <span
                  className={`font-semibold ${
                    exceeds5Hours
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                >
                  {totalDisplay}
                </span>
                {exceeds5Hours && (
                  <span
                    className="text-xs text-orange-600 dark:text-orange-400 font-medium"
                    title="Only 5 hours will count towards official total"
                  >
                    Max: 5:00
                  </span>
                )}
              </div>
            );
          })()
        )}
      </td>

      {/* Status */}
      <td className="border border-gray-200 dark:border-gray-700 px-2 py-2 text-sm text-center">
        {isSunday ? (
          <span className="text-gray-400">-</span>
        ) : entry.confirmationStatus === "confirmed" ? (
          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
            Confirmed
          </span>
        ) : entry.in1 ||
          entry.out1 ||
          entry.in2 ||
          entry.out2 ||
          entry.in3 ||
          entry.out3 ||
          entry.in4 ||
          entry.out4 ? (
          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
            Unconfirmed
          </span>
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>
    </tr>
  );
};

export default DayRow;
