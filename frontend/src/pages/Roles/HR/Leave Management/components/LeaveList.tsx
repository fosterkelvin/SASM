// React JSX runtime used — no named React imports needed
import { LeaveRecord, LeaveStatus } from "./types";

interface Props {
  leaves: LeaveRecord[];
  onChangeStatus: (id: string, status: LeaveStatus) => void;
  onOpen: (id: string) => void;
}

export default function LeaveList({ leaves, onChangeStatus, onOpen }: Props) {
  if (!leaves.length)
    return (
      <div className="text-sm text-gray-500">No leave requests found.</div>
    );

  return (
    <div className="grid gap-4">
      {leaves.map((l) => (
        <div
          key={l.id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {l.name}
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {l.type}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {new Date(l.startDate).toLocaleDateString()} —{" "}
                {new Date(l.endDate).toLocaleDateString()}
              </div>
              {l.hrNote && (
                <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                  <strong>HR note:</strong> {l.hrNote}
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                {l.status}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpen(l.id)}
                  className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300"
                >
                  Edit
                </button>
                <select
                  value={l.status}
                  onChange={(e) =>
                    onChangeStatus(l.id, e.target.value as LeaveStatus)
                  }
                  className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm"
                >
                  <option value="pending">pending</option>
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
