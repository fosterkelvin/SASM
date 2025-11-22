// React JSX runtime used — no named React imports needed
import { LeaveRecord } from "./types";

interface Props {
  leaves: LeaveRecord[];
  onView: (leave: LeaveRecord) => void;
}

export default function LeaveList({ leaves, onView }: Props) {
  if (!leaves.length)
    return (
      <div className="text-sm text-gray-500">No leave requests found.</div>
    );

  const calculateTotalDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr className="text-left text-sm text-gray-600 dark:text-gray-400">
            <th className="px-4 py-3">Scholar/Trainee</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Date Range</th>
            <th className="px-4 py-3">Total Days</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
          {leaves.map((l) => (
            <tr key={l.id} className="text-sm text-gray-700 dark:text-gray-300">
              <td className="px-4 py-3">
                <div className="font-medium">{l.name}</div>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {l.type}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm">
                  {new Date(l.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  —{" "}
                  {new Date(l.endDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="font-medium">
                  {calculateTotalDays(l.startDate, l.endDate)}{" "}
                  {calculateTotalDays(l.startDate, l.endDate) === 1
                    ? "day"
                    : "days"}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded text-xs capitalize ${
                    l.status === "pending"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : l.status === "approved"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : l.status === "disapproved"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  {l.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onView(l)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
