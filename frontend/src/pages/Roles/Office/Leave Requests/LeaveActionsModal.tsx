import React, { useState } from "react";
import { LeaveRequest, LeaveStatus } from "./types";
import { Button } from "@/components/ui/button";

interface Props {
  request: LeaveRequest | null;
  onClose: () => void;
  onSubmit: (id: string, status: LeaveStatus, remarks?: string) => void;
}

export const LeaveActionsModal: React.FC<Props> = ({
  request,
  onClose,
  onSubmit,
}) => {
  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState<LeaveStatus>("pending");

  React.useEffect(() => {
    if (request) {
      setRemarks(request.remarks || "");
      setStatus(request.status);
    }
  }, [request]);

  if (!request) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leave-actions-title"
      style={{ backgroundColor: "rgba(0,0,0,0.24)", zIndex: 60 }}
    >
      <div
        className="bg-white rounded shadow-lg max-w-md w-full p-4"
        style={{ zIndex: 70 }}
      >
        <div className="flex justify-between items-center">
          <h3 id="leave-actions-title" className="text-lg font-semibold">
            Actions - {request.studentName}
          </h3>
        </div>

        <div className="mt-3 text-sm text-gray-700">
          <div>
            <strong>Leave:</strong>{" "}
            {new Date(request.startDate).toLocaleDateString()} —{" "}
            {new Date(request.endDate).toLocaleDateString()}
          </div>
          <div className="mt-2">
            <strong>Reason:</strong> {request.reason}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Decision
          </label>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setStatus("approved")}
              className={`px-3 py-1 rounded ${
                status === "approved"
                  ? "bg-green-600 text-white"
                  : "bg-green-100 text-green-800"
              }`}
            >
              Approve
            </button>
            <button
              onClick={() => setStatus("disapproved")}
              className={`px-3 py-1 rounded ${
                status === "disapproved"
                  ? "bg-red-600 text-white"
                  : "bg-red-100 text-red-800"
              }`}
            >
              Disapprove
            </button>
            <button
              onClick={() => setStatus("pending")}
              className={`px-3 py-1 rounded ${
                status === "pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              Set Pending
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Remarks
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={4}
            className="mt-1 block w-full border rounded p-2 text-sm"
            placeholder="Add remarks (optional)"
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            className="bg-gray-400 hover:bg-gray-500"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => onSubmit(request.id, status, remarks)}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeaveActionsModal;
