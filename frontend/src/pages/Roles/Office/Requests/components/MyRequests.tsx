import React, { useEffect, useState } from "react";
import { getUserScholarRequests } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

interface ScholarRequest {
  _id: string;
  totalScholars: number;
  maleScholars: number;
  femaleScholars: number;
  scholarType: string;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: {
    firstname: string;
    lastname: string;
    email: string;
  };
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const MyRequests: React.FC = () => {
  const [requests, setRequests] = useState<ScholarRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const { addToast } = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? { status: filter } : undefined;
      const response = await getUserScholarRequests(params);
      setRequests(response.requests || []);
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      addToast(
        error?.response?.data?.message || "Failed to load requests",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const getStatusBadge = (status: string) => {
    const styles = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      approved:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          styles[status as keyof typeof styles]
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          My Requests
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === "pending"
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === "approved"
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === "rejected"
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No requests found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <div
              key={request._id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                      {request.scholarType}
                    </h4>
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Total:
                      </span>
                      <span className="ml-1 font-medium text-gray-800 dark:text-gray-200">
                        {request.totalScholars}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Male:
                      </span>
                      <span className="ml-1 font-medium text-gray-800 dark:text-gray-200">
                        {request.maleScholars}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Female:
                      </span>
                      <span className="ml-1 font-medium text-gray-800 dark:text-gray-200">
                        {request.femaleScholars}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {request.notes && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Notes:</span> {request.notes}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Submitted: {formatDate(request.createdAt)}
                </div>
                {request.reviewedAt && request.reviewedBy && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Reviewed by: {request.reviewedBy.firstname}{" "}
                    {request.reviewedBy.lastname}
                  </div>
                )}
              </div>

              {request.reviewNotes && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Review Notes:</span>{" "}
                    {request.reviewNotes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequests;
