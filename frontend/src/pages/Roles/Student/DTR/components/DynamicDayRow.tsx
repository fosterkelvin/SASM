import React, { useState } from "react";
import { Entry, Shift } from "./types";

interface DynamicDayRowProps {
  entry: Entry;
  onChange: (id: number, changes: Partial<Entry>) => void;
  month: number;
  year: number;
  isEditable?: boolean;
}

const DynamicDayRow: React.FC<DynamicDayRowProps> = ({
  entry,
  onChange,
  month,
  year,
  isEditable = true,
}) => {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [conflictMessage, setConflictMessage] = useState<string>("");

  // Calculate the day of week for this entry
  const date = new Date(year, month - 1, entry.id);
  const dayOfWeek = date.getDay();
  const isSunday = dayOfWeek === 0;

  const isConfirmed = entry.confirmationStatus === "confirmed";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const entryDate = new Date(year, month - 1, entry.id);
  entryDate.setHours(0, 0, 0, 0);
  const isPastDay = entryDate < today;
  const isFutureDay = entryDate > today;
  const isDateRestricted = isConfirmed && (isPastDay || isFutureDay);

  const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekdayName = weekdayNames[dayOfWeek];

  // Initialize shifts from entry (use legacy fields if shifts array doesn't exist)
  const getInitialShifts = (): Shift[] => {
    if (entry.shifts && entry.shifts.length > 0) {
      return entry.shifts;
    }
    // Migrate legacy fields to shifts array
    const legacyShifts: Shift[] = [];
    if (entry.in1 || entry.out1)
      legacyShifts.push({ in: entry.in1, out: entry.out1 });
    if (entry.in2 || entry.out2)
      legacyShifts.push({ in: entry.in2, out: entry.out2 });
    if (entry.in3 || entry.out3)
      legacyShifts.push({ in: entry.in3, out: entry.out3 });
    if (entry.in4 || entry.out4)
      legacyShifts.push({ in: entry.in4, out: entry.out4 });
    return legacyShifts.length > 0 ? legacyShifts : [{ in: "", out: "" }];
  };

  const [shifts, setShifts] = useState<Shift[]>(getInitialShifts);

  // Add a new shift
  const addShift = () => {
    if (!isEditable || isDateRestricted) return;
    const newShifts = [...shifts, { in: "", out: "" }];
    setShifts(newShifts);
    updateEntry(newShifts);
  };

  // Remove a shift
  const removeShift = (index: number) => {
    if (!isEditable || isDateRestricted || shifts.length <= 1) return;
    const newShifts = shifts.filter((_, i) => i !== index);
    setShifts(newShifts);
    updateEntry(newShifts);
  };

  // Check if time conflicts with other shifts
  const hasTimeConflict = (
    index: number,
    field: "in" | "out",
    value: string
  ): { conflict: boolean; message: string } => {
    if (!value) return { conflict: false, message: "" };

    const newShifts = [...shifts];
    newShifts[index] = { ...newShifts[index], [field]: value };

    const currentShift = newShifts[index];

    // Check if current shift has both in and out
    if (!currentShift.in || !currentShift.out)
      return { conflict: false, message: "" };

    const [currentInH, currentInM] = currentShift.in.split(":").map(Number);
    const [currentOutH, currentOutM] = currentShift.out.split(":").map(Number);
    const currentInMinutes = currentInH * 60 + currentInM;
    const currentOutMinutes = currentOutH * 60 + currentOutM;

    // Check if OUT is before or equal to IN
    if (currentOutMinutes <= currentInMinutes) {
      return {
        conflict: true,
        message: `Shift ${index + 1}: OUT time must be after IN time`,
      };
    }

    // Check against other shifts
    for (let i = 0; i < newShifts.length; i++) {
      if (i === index) continue; // Skip self

      const otherShift = newShifts[i];
      if (!otherShift.in || !otherShift.out) continue;

      const [otherInH, otherInM] = otherShift.in.split(":").map(Number);
      const [otherOutH, otherOutM] = otherShift.out.split(":").map(Number);
      const otherInMinutes = otherInH * 60 + otherInM;
      const otherOutMinutes = otherOutH * 60 + otherOutM;

      // Check for exact same times
      if (
        currentInMinutes === otherInMinutes ||
        currentOutMinutes === otherOutMinutes
      ) {
        return {
          conflict: true,
          message: `Shift ${index + 1} has same time as Shift ${
            i + 1
          }. Times must be unique.`,
        };
      }

      // Check for overlap
      // Shifts overlap if: (currentIn < otherOut) AND (currentOut > otherIn)
      if (
        currentInMinutes < otherOutMinutes &&
        currentOutMinutes > otherInMinutes
      ) {
        return {
          conflict: true,
          message: `Shift ${index + 1} overlaps with Shift ${
            i + 1
          }. Shifts cannot overlap.`,
        };
      }
    }

    return { conflict: false, message: "" };
  };

  // Update shift time
  const updateShiftTime = (
    index: number,
    field: "in" | "out",
    value: string
  ) => {
    if (!isEditable || isDateRestricted) return;

    // Check for conflicts
    const conflictCheck = hasTimeConflict(index, field, value);
    if (conflictCheck.conflict) {
      setConflictMessage(conflictCheck.message);
      // Clear message after 3 seconds
      setTimeout(() => setConflictMessage(""), 3000);
      return; // Don't update if there's a conflict
    }

    setConflictMessage(""); // Clear any previous conflict message
    const newShifts = [...shifts];
    newShifts[index] = { ...newShifts[index], [field]: value };
    setShifts(newShifts);
    updateEntry(newShifts);
  };

  // Update entry with new shifts data
  const updateEntry = (newShifts: Shift[]) => {
    // Calculate total hours
    const totalMinutes = newShifts.reduce((total, shift) => {
      if (shift.in && shift.out) {
        const [inH, inM] = shift.in.split(":").map(Number);
        const [outH, outM] = shift.out.split(":").map(Number);
        const inMinutes = inH * 60 + inM;
        const outMinutes = outH * 60 + outM;
        if (outMinutes > inMinutes) {
          return total + (outMinutes - inMinutes);
        }
      }
      return total;
    }, 0);

    // Check if any time is entered
    const hasTimeEntry = newShifts.some((s) => s.in || s.out);

    // Update both shifts array and legacy fields (for backward compatibility)
    const updates: Partial<Entry> = {
      shifts: newShifts,
      totalHours: totalMinutes,
      status: hasTimeEntry ? "Unconfirmed" : "",
    };

    // Also update legacy fields for first 4 shifts
    updates.in1 = newShifts[0]?.in || "";
    updates.out1 = newShifts[0]?.out || "";
    updates.in2 = newShifts[1]?.in || "";
    updates.out2 = newShifts[1]?.out || "";
    updates.in3 = newShifts[2]?.in || "";
    updates.out3 = newShifts[2]?.out || "";
    updates.in4 = newShifts[3]?.in || "";
    updates.out4 = newShifts[3]?.out || "";

    onChange(entry.id, updates);
  };

  // Compute total hours for display
  const computeTotal = () => {
    const totalMinutes = entry.totalHours || 0;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  // Get input styling based on state
  const getInputClassName = (hasValue: boolean) => {
    const baseClasses =
      "w-full px-2 py-1.5 text-center text-sm border rounded transition-all";
    const disabledClasses = !isEditable
      ? "bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
      : "";

    const focusClasses = hasValue
      ? "border-green-300 dark:border-green-700 bg-white dark:bg-gray-800"
      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800";

    return `${baseClasses} ${disabledClasses || focusClasses}`;
  };

  return (
    <tr className="even:bg-white odd:bg-slate-50 dark:even:bg-gray-900 dark:odd:bg-gray-800/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
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
        <span>{weekdayName}</span>
      </td>

      {/* Shifts Column */}
      <td
        className="border border-gray-200 dark:border-gray-700 px-3 py-3"
        colSpan={2}
      >
        <div className="space-y-2">
          {/* Conflict Message */}
          {conflictMessage && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400 animate-pulse">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">{conflictMessage}</span>
            </div>
          )}

          {shifts.map((shift, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 w-16">
                Duty {index + 1}:
              </span>
              <input
                type="time"
                value={shift.in || ""}
                onChange={(e) => updateShiftTime(index, "in", e.target.value)}
                disabled={!isEditable || isDateRestricted || isConfirmed}
                className={getInputClassName(!!shift.in)}
                placeholder="IN"
              />
              <span className="text-gray-400">→</span>
              <input
                type="time"
                value={shift.out || ""}
                onChange={(e) => updateShiftTime(index, "out", e.target.value)}
                disabled={!isEditable || isDateRestricted || isConfirmed}
                className={getInputClassName(!!shift.out)}
                placeholder="OUT"
              />
              {shifts.length > 1 &&
                !isDateRestricted &&
                !isConfirmed &&
                isEditable && (
                  <button
                    onClick={() => removeShift(index)}
                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Remove shift"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
            </div>
          ))}
          {!isDateRestricted && !isConfirmed && isEditable && (
            <button
              onClick={addShift}
              className="w-full py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-dashed border-blue-300 dark:border-blue-700 rounded transition-colors flex items-center justify-center gap-1"
            >
              <svg
                className="w-3 h-3"
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
              Add Duty
            </button>
          )}
        </div>
      </td>

      {/* Late */}
      <td className="border border-gray-200 dark:border-gray-700 px-2 py-2 text-sm text-center text-gray-500 dark:text-gray-400">
        {entry.late ? (
          <span className="text-red-600 dark:text-red-400 font-medium">
            {entry.late}m
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>

      {/* Undertime */}
      <td className="border border-gray-200 dark:border-gray-700 px-2 py-2 text-sm text-center text-gray-500 dark:text-gray-400">
        {entry.undertime ? (
          <span className="text-orange-600 dark:text-orange-400 font-medium">
            {entry.undertime}m
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>

      {/* Total Hours */}
      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-center">
        {(() => {
          const totalDisplay = computeTotal();

          return (
            <div className="flex flex-col items-center gap-0.5">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {totalDisplay}
              </span>
            </div>
          );
        })()}
      </td>

      {/* Status */}
      <td className="border border-gray-200 dark:border-gray-700 px-2 py-2 text-sm text-center">
        {entry.status === "Absent" ? (
          <div className="flex flex-col items-center gap-0.5">
            <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
              Absent
            </span>
          </div>
        ) : entry.status === "Excused" || entry.excusedStatus === "excused" ? (
          <div className="flex flex-col items-center gap-0.5">
            <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              Excused
            </span>
          </div>
        ) : entry.confirmationStatus === "confirmed" ? (
          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
            Confirmed
          </span>
        ) : shifts.some((s) => s.in || s.out) ? (
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

export default DynamicDayRow;
