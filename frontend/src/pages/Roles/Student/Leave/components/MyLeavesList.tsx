import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getMyLeaves } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { FileText, Calendar, Clock, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import API from "@/config/apiClient";

interface Leave {
  _id: string;
  typeOfLeave: string;
  dateFrom: string;
  dateTo: string;
  reasons: string;
  status: "pending" | "approved" | "disapproved";
  remarks?: string;
  createdAt: string;
  proofUrl?: string;
  allowResubmit?: boolean;
}

interface MyLeavesListProps {
  refreshRef?: React.MutableRefObject<(() => void) | null>;
  onResubmit?: (leave: Leave) => void;
}

const MyLeavesList: React.FC<MyLeavesListProps> = ({
  refreshRef,
  onResubmit,
}) => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [leaveToCancel, setLeaveToCancel] = useState<Leave | null>(null);
  const { addToast } = useToast();

  const fetchLeaves = async () => {
    try {
      const response = await getMyLeaves();
      setLeaves(response.leaves || []);
    } catch (error: any) {
      addToast(
        error?.message || "Failed to load your leave applications.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();

    // Register the refresh function so parent can call it
    if (refreshRef) {
      refreshRef.current = fetchLeaves;
    }

    // Cleanup
    return () => {
      if (refreshRef) {
        refreshRef.current = null;
      }
    };
  }, []);

  const handleCancel = async (leaveId: string) => {
    setShowCancelDialog(false);
    setLeaveToCancel(null);

    setCancelling(leaveId);
    try {
      await API.delete(`/leave/${leaveId}`);
      addToast("Leave request cancelled successfully.", "success");
      await fetchLeaves(); // Refresh the list
    } catch (error: any) {
      addToast(
        error?.response?.data?.message || "Failed to cancel leave request.",
        "error"
      );
    } finally {
      setCancelling(null);
    }
  };

  const openCancelDialog = (leave: Leave) => {
    setLeaveToCancel(leave);
    setShowCancelDialog(true);
  };

  const calculateDays = (from: string, to: string) => {
    const start = new Date(from);
    const end = new Date(to);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto mt-6">
        <CardContent className="p-6">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Loading your leave applications...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (leaves.length === 0) {
    return (
      <Card className="max-w-4xl mx-auto mt-6">
        <CardContent className="p-6">
          <p className="text-center text-gray-600 dark:text-gray-400">
            You haven't submitted any leave applications yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto mt-6">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          My Leave Applications
        </h3>
        <div className="space-y-4">
          {leaves.map((leave) => (
            <div
              key={leave._id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                      {leave.typeOfLeave.charAt(0).toUpperCase() +
                        leave.typeOfLeave.slice(1)}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        leave.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : leave.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {leave.status.charAt(0).toUpperCase() +
                        leave.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(leave.dateFrom).toLocaleDateString()} -{" "}
                        {new Date(leave.dateTo).toLocaleDateString()} (
                        {calculateDays(leave.dateFrom, leave.dateTo)}{" "}
                        {calculateDays(leave.dateFrom, leave.dateTo) === 1
                          ? "day"
                          : "days"}
                        )
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        Submitted:{" "}
                        {new Date(leave.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-2">
                      <strong>Reason:</strong> {leave.reasons}
                    </div>
                    {leave.remarks && (
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <strong>Office Remarks:</strong> {leave.remarks}
                      </div>
                    )}
                    {leave.proofUrl && (
                      <div className="mt-2">
                        <a
                          href={leave.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm"
                        >
                          <FileText className="w-4 h-4" />
                          View Proof Document
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {leave.status === "pending" && (
                  <div className="sm:ml-4">
                    <Button
                      onClick={() => openCancelDialog(leave)}
                      disabled={cancelling === leave._id}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {cancelling === leave._id ? (
                        "Cancelling..."
                      ) : (
                        <>
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {leave.status === "disapproved" && leave.allowResubmit && (
                  <div className="sm:ml-4">
                    <Button
                      onClick={() => onResubmit?.(leave)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Resubmit
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Cancel Confirmation Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
                </div>
                <DialogTitle className="text-xl">
                  Cancel Leave Request
                </DialogTitle>
              </div>
              <DialogDescription className="text-left">
                Are you sure you want to cancel this leave request?
                {leaveToCancel && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-md space-y-1 text-sm">
                    <p>
                      <strong>Type:</strong>{" "}
                      {leaveToCancel.typeOfLeave.charAt(0).toUpperCase() +
                        leaveToCancel.typeOfLeave.slice(1)}
                    </p>
                    <p>
                      <strong>Period:</strong>{" "}
                      {new Date(leaveToCancel.dateFrom).toLocaleDateString()} -{" "}
                      {new Date(leaveToCancel.dateTo).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Duration:</strong>{" "}
                      {calculateDays(
                        leaveToCancel.dateFrom,
                        leaveToCancel.dateTo
                      )}{" "}
                      {calculateDays(
                        leaveToCancel.dateFrom,
                        leaveToCancel.dateTo
                      ) === 1
                        ? "day"
                        : "days"}
                    </p>
                  </div>
                )}
                <p className="mt-3 text-red-600 dark:text-red-400 font-medium">
                  This action cannot be undone.
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-row gap-2 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                className="flex-1"
              >
                Keep Request
              </Button>
              <Button
                variant="destructive"
                onClick={() => leaveToCancel && handleCancel(leaveToCancel._id)}
                disabled={!!cancelling}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default MyLeavesList;
