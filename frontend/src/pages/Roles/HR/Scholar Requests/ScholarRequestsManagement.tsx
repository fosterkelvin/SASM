import { useState, useEffect } from "react";
import HRSidebar from "@/components/sidebar/HR/HRSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { getAllScholarRequests, reviewScholarRequest } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

interface ScholarRequest {
  _id: string;
  requestedBy: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
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

const ScholarRequestsManagement = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [requests, setRequests] = useState<ScholarRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [selectedRequest, setSelectedRequest] = useState<ScholarRequest | null>(
    null
  );
  const [reviewNotes, setReviewNotes] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const { addToast } = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? { status: filter } : undefined;
      const response = await getAllScholarRequests(params);
      setRequests(response.requests || []);
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      addToast(
        error?.response?.data?.message || "Failed to load scholar requests",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const handleReview = async (
    requestId: string,
    status: "approved" | "rejected"
  ) => {
    setIsReviewing(true);
    try {
      await reviewScholarRequest({
        requestId,
        status,
        reviewNotes: reviewNotes || undefined,
      });

      addToast(`Request ${status} successfully`, "success");

      setSelectedRequest(null);
      setReviewNotes("");
      fetchRequests();
    } catch (error: any) {
      console.error("Error reviewing request:", error);
      addToast(
        error?.response?.data?.message || "Failed to review request",
        "error"
      );
    } finally {
      setIsReviewing(false);
    }
  };

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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900">
      <HRSidebar
        currentPage="Scholar Requests"
        onCollapseChange={setIsSidebarCollapsed}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <div
          className={`hidden md:flex items-center gap-4 fixed top-0 left-0 z-30 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-800 h-[81px] ${
            isSidebarCollapsed
              ? "md:w-[calc(100%-5rem)] md:ml-20"
              : "md:w-[calc(100%-16rem)] md:ml-64"
          }`}
        >
          <h1 className="text-2xl font-bold text-white ml-4">
            Scholar Requests Management
          </h1>
        </div>

        <div className="p-4 md:p-10 mt-12">
          <Card className="max-w-7xl mx-auto">
            <CardContent className="p-6 md:p-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    Scholar Requests
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilter("all")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        filter === "all"
                          ? "bg-red-600 text-white"
                          : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilter("pending")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        filter === "pending"
                          ? "bg-red-600 text-white"
                          : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => setFilter("approved")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        filter === "approved"
                          ? "bg-red-600 text-white"
                          : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      Approved
                    </button>
                    <button
                      onClick={() => setFilter("rejected")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        filter === "rejected"
                          ? "bg-red-600 text-white"
                          : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      Rejected
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">
                    No requests found.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div
                      key={request._id}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                              {request.scholarType}
                            </h3>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Requested by:{" "}
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {request.requestedBy.firstname}{" "}
                              {request.requestedBy.lastname}
                            </span>
                            <span className="text-gray-500 ml-2">
                              ({request.requestedBy.email})
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mb-3">
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                              <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                                Total Scholars
                              </span>
                              <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                {request.totalScholars}
                              </span>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                              <span className="text-xs text-blue-600 dark:text-blue-400 block mb-1">
                                Male
                              </span>
                              <span className="text-xl font-bold text-blue-700 dark:text-blue-300">
                                {request.maleScholars}
                              </span>
                            </div>
                            <div className="bg-pink-50 dark:bg-pink-900/20 p-3 rounded-md">
                              <span className="text-xs text-pink-600 dark:text-pink-400 block mb-1">
                                Female
                              </span>
                              <span className="text-xl font-bold text-pink-700 dark:text-pink-300">
                                {request.femaleScholars}
                              </span>
                            </div>
                          </div>
                          {request.notes && (
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mb-3">
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                <span className="font-medium">Notes:</span>{" "}
                                {request.notes}
                              </p>
                            </div>
                          )}
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Submitted: {formatDate(request.createdAt)}
                          </div>
                        </div>
                      </div>

                      {request.status === "pending" && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex gap-3">
                            <button
                              onClick={() => setSelectedRequest(request)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                              }}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      )}

                      {request.reviewedAt && request.reviewedBy && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Reviewed by: {request.reviewedBy.firstname}{" "}
                            {request.reviewedBy.lastname} on{" "}
                            {formatDate(request.reviewedAt)}
                          </div>
                          {request.reviewNotes && (
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                <span className="font-medium">
                                  Review Notes:
                                </span>{" "}
                                {request.reviewNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Review Request
            </h3>
            <div className="mb-4 space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  Requested by:
                </span>{" "}
                {selectedRequest.requestedBy.firstname}{" "}
                {selectedRequest.requestedBy.lastname}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  Scholar Type:
                </span>{" "}
                {selectedRequest.scholarType}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  Total:
                </span>{" "}
                {selectedRequest.totalScholars} (Male:{" "}
                {selectedRequest.maleScholars}, Female:{" "}
                {selectedRequest.femaleScholars})
              </p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Review Notes (Optional)
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="Add notes for this review..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleReview(selectedRequest._id, "approved")}
                disabled={isReviewing}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 shadow-sm"
              >
                {isReviewing ? "Processing..." : "Approve"}
              </button>
              <button
                onClick={() => handleReview(selectedRequest._id, "rejected")}
                disabled={isReviewing}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 shadow-sm"
              >
                {isReviewing ? "Processing..." : "Reject"}
              </button>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setReviewNotes("");
                }}
                disabled={isReviewing}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScholarRequestsManagement;
