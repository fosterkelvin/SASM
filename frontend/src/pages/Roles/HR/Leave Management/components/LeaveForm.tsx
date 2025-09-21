import React, { useState } from "react";
import { LeaveRecord, LeaveFormValues } from "./types";

interface Props {
  record?: LeaveRecord | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, values: Partial<LeaveFormValues>) => void;
}

export default function LeaveForm({ record, open, onClose, onSave }: Props) {
  const [note, setNote] = useState(record?.hrNote || "");

  React.useEffect(
    () => setNote(record?.hrNote || ""),
    [record?.id, record?.hrNote]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Leave details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {record ? (
          <div>
            <div className="text-sm text-gray-800 dark:text-gray-100">
              <strong>{record.name}</strong>{" "}
              <span className="text-xs text-gray-500">{record.type}</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {new Date(record.startDate).toLocaleDateString()} —{" "}
              {new Date(record.endDate).toLocaleDateString()}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                HR note
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full min-h-[120px] p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-sm"
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (record) onSave(record.id, { hrNote: note });
                  onClose();
                }}
                className="px-3 py-2 rounded-md bg-red-600 text-white text-sm"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div>No record selected</div>
        )}
      </div>
    </div>
  );
}
