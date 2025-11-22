import React from "react";
import { LeaveRecord } from "./types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  leave: LeaveRecord | null;
  open: boolean;
  onClose: () => void;
}

export default function LeaveDetailsModal({ leave, open, onClose }: Props) {
  if (!leave) return null;

  const calculateTotalDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Leave Request Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                {leave.name}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Type of Leave
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                {leave.type}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Date From
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                {new Date(leave.startDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Date To
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                {new Date(leave.endDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Days
            </label>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
              {calculateTotalDays(leave.startDate, leave.endDate)}{" "}
              {calculateTotalDays(leave.startDate, leave.endDate) === 1
                ? "day"
                : "days"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Reason
            </label>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
              {leave.reason || "—"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <div className="mt-1">
              <span
                className={`px-2 py-1 rounded text-xs capitalize ${
                  leave.status === "pending"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : leave.status === "approved"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : leave.status === "disapproved"
                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                }`}
              >
                {leave.status}
              </span>
            </div>
          </div>

          {leave.hrNote && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Remarks / HR Note
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                {leave.hrNote}
              </p>
            </div>
          )}

          {leave.proofUrl && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Proof Document
              </label>
              <div className="space-y-3">
                <a
                  href={leave.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
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
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Open in New Tab
                </a>
                <div className="border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                  <img
                    src={leave.proofUrl}
                    alt="Leave proof"
                    className="w-full h-auto max-h-[400px] object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML =
                          '<div class="p-8 text-center"><svg class="w-16 h-16 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><p class="text-sm text-gray-600 dark:text-gray-400">Preview not available</p><a href="' +
                          leave.proofUrl +
                          '" target="_blank" class="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline">Download Document</a></div>';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Submitted At
            </label>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
              {new Date(leave.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-sm"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
