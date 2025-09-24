import React from "react";
import { LeaveRequest } from "./types";

interface Props {
  request: LeaveRequest;
  onOpenActions: (r: LeaveRequest) => void;
}

export const LeaveRequestCard: React.FC<Props> = ({
  request,
  onOpenActions,
}) => {
  return (
    <div className={`p-4 border rounded shadow-sm bg-white`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="text-lg font-semibold">
            {request.studentName}{" "}
            <span className="text-sm text-gray-500">({request.studentId})</span>
          </div>
          <div className="text-sm text-gray-600">
            Submitted: {new Date(request.submittedAt).toLocaleString()}
          </div>
        </div>
        <div>
          <span
            className={`px-2 py-1 rounded text-sm ${
              request.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : request.status === "approved"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {request.status}
          </span>
        </div>
      </div>

      <div className="mt-3 text-sm text-gray-700">
        <div>
          <strong>From:</strong>{" "}
          {new Date(request.startDate).toLocaleDateString()}
        </div>
        <div>
          <strong>To:</strong> {new Date(request.endDate).toLocaleDateString()}
        </div>
        <div className="mt-2">
          <strong>Reason:</strong> {request.reason}
        </div>
        {request.remarks && (
          <div className="mt-2">
            <strong>Remarks:</strong> {request.remarks}
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onOpenActions(request)}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
          aria-label={`Open actions for ${request.studentName}`}
        >
          Actions
        </button>
      </div>
    </div>
  );
};

export default LeaveRequestCard;
