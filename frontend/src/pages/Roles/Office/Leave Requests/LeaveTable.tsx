import React from "react";
import { LeaveRequest } from "./types";

interface Props {
  data: LeaveRequest[];
  onOpenActions: (r: LeaveRequest) => void;
}

const LeaveTable: React.FC<Props> = ({ data, onOpenActions }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="text-left text-sm text-gray-600">
            <th className="px-4 py-2">Student</th>
            <th className="px-4 py-2">Dates</th>
            <th className="px-4 py-2">Reason</th>
            <th className="px-4 py-2">Submitted</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((r) => (
            <tr key={r.id} className="text-sm text-gray-700">
              <td className="px-4 py-3">
                <div className="font-medium">{r.studentName}</div>
                <div className="text-xs text-gray-500">{r.studentId}</div>
              </td>
              <td className="px-4 py-3">
                {new Date(r.startDate).toLocaleDateString()} —{" "}
                {new Date(r.endDate).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">{r.reason}</td>
              <td className="px-4 py-3 text-xs text-gray-500">
                {new Date(r.submittedAt).toLocaleString()}
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
                  {r.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onOpenActions(r)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
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
