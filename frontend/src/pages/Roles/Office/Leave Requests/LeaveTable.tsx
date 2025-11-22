import React from "react";
import { LeaveRequest } from "./types";

interface Props {
  data: LeaveRequest[];
  onOpenActions: (r: LeaveRequest) => void;
}

const LeaveTable: React.FC<Props> = ({ data, onOpenActions }) => {
  const calculateTotalDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    return diffDays;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="text-left text-sm text-gray-600">
            <th className="px-4 py-2">Student</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Total Days</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Decided By</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((r) => (
            <tr key={r.id} className="text-sm text-gray-700">
              <td className="px-4 py-3">
                <div className="font-medium">{r.studentName}</div>
              </td>
              <td className="px-4 py-3">
                {r.type
                  ? r.type.charAt(0).toUpperCase() + r.type.slice(1)
                  : "Leave"}
              </td>
              <td className="px-4 py-3">
                <span className="font-medium">
                  {calculateTotalDays(r.startDate, r.endDate)}{" "}
                  {calculateTotalDays(r.startDate, r.endDate) === 1
                    ? "day"
                    : "days"}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    r.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : r.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                </span>
              </td>
              <td className="px-4 py-3">
                {r.decidedByProfile ? (
                  <div>
                    <div className="font-medium text-gray-800">
                      {r.decidedByProfile}
                    </div>
                    {r.decidedAt && (
                      <div className="text-xs text-gray-500">
                        {new Date(r.decidedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onOpenActions(r)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                >
                  Actions
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveTable;
