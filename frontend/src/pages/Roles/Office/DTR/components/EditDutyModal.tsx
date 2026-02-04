import React, { useState, useEffect } from "react";
import { Entry, Shift } from "@/pages/Roles/Student/DTR/components/types";

interface EditDutyModalProps {
  isOpen: boolean;
  entry: Entry | null;
  onClose: () => void;
  onSave: (entryId: number, shifts: Shift[]) => void;
}

const EditDutyModal: React.FC<EditDutyModalProps> = ({
  isOpen,
  entry,
  onClose,
  onSave,
}) => {
  const [shifts, setShifts] = useState<Shift[]>([]);

  // Initialize shifts when entry changes
  useEffect(() => {
    if (entry) {
      const existingShifts = getShifts(entry);
      if (existingShifts.length > 0) {
        setShifts(existingShifts);
      } else {
        // Start with one empty shift
        setShifts([{ in: "", out: "" }]);
      }
    }
  }, [entry]);

  // Get shifts for an entry (use legacy fields if shifts array doesn't exist)
  const getShifts = (e: Entry): Shift[] => {
    if (e.shifts && e.shifts.length > 0) {
      return e.shifts.map((s) => ({ in: s.in || "", out: s.out || "" }));
    }
    // Migrate legacy fields
    const legacyShifts: Shift[] = [];
    if (e.in1 || e.out1) legacyShifts.push({ in: e.in1 || "", out: e.out1 || "" });
    if (e.in2 || e.out2) legacyShifts.push({ in: e.in2 || "", out: e.out2 || "" });
    if (e.in3 || e.out3) legacyShifts.push({ in: e.in3 || "", out: e.out3 || "" });
    if (e.in4 || e.out4) legacyShifts.push({ in: e.in4 || "", out: e.out4 || "" });
    return legacyShifts;
  };

  const handleAddShift = () => {
    setShifts([...shifts, { in: "", out: "" }]);
  };

  const handleRemoveShift = (index: number) => {
    setShifts(shifts.filter((_, i) => i !== index));
  };

  const handleShiftChange = (index: number, field: "in" | "out", value: string) => {
    setShifts(
      shifts.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const handleSave = () => {
    if (entry) {
      // Filter out empty shifts
      const validShifts = shifts.filter((s) => s.in || s.out);
      onSave(entry.id, validShifts);
    }
    onClose();
  };

  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 px-6 py-4">
          <h2 className="text-xl font-bold text-white">
            Edit Duty - Day {entry.id}
          </h2>
          <p className="text-sm text-white/80">
            Add or modify duty shifts for this day
          </p>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {shifts.map((shift, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Duty {index + 1}
                  </span>
                  {shifts.length > 1 && (
                    <button
                      onClick={() => handleRemoveShift(index)}
                      className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      title="Remove Shift"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Time In
                    </label>
                    <input
                      type="time"
                      value={shift.in || ""}
                      onChange={(e) =>
                        handleShiftChange(index, "in", e.target.value)
                      }
                      title={`Time In for Duty ${index + 1}`}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Time Out
                    </label>
                    <input
                      type="time"
                      value={shift.out || ""}
                      onChange={(e) =>
                        handleShiftChange(index, "out", e.target.value)
                      }
                      title={`Time Out for Duty ${index + 1}`}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Shift Button */}
          <button
            onClick={handleAddShift}
            className="mt-4 w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-red-400 hover:text-red-500 dark:hover:border-red-500 dark:hover:text-red-400 transition-colors flex items-center justify-center gap-2"
          >
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Another Duty
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors flex items-center gap-2"
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
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDutyModal;
