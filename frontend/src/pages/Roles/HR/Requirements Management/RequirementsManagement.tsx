import React, { useState, useEffect } from "react";
import HRSidebar from "@/components/sidebar/HR/HRSidebar";
import Toolbar from "./components/Toolbar";
import { Submission } from "./components/HRRequirementsList";
import ViewSubmissionModal from "./components/ViewSubmissionModal";
import API from "@/config/apiClient";
import { FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";

const RequirementsManagement: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Requirements Management (HR) | SASM-IMS";
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get("/requirements/all");
      setSubmissions(response.data.submissions || []);
    } catch (err: any) {
      console.error("Error fetching requirements:", err);
      setError(err.response?.data?.message || "Failed to fetch requirements");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId: string) => {
    try {
      setApproving(submissionId);
      await API.patch("/requirements/review", {
        submissionId,
        reviewStatus: "approved",
      });

      // Refresh the list
      await fetchRequirements();

      // Show success message (you can use a toast notification here)
      alert("Requirements approved successfully!");
    } catch (err: any) {
      console.error("Error approving requirements:", err);
      alert(err.response?.data?.message || "Failed to approve requirements");
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (submissionId: string, notes?: string) => {
    try {
      setApproving(submissionId);
      await API.patch("/requirements/review", {
        submissionId,
        reviewStatus: "rejected",
        reviewNotes: notes || "Please review and resubmit your requirements.",
      });

      // Refresh the list
      await fetchRequirements();

      alert("Requirements rejected successfully!");
    } catch (err: any) {
      console.error("Error rejecting requirements:", err);
      alert(err.response?.data?.message || "Failed to reject requirements");
    } finally {
      setApproving(null);
    }
  };

  const filtered = submissions.filter((s) => {
    if (!query) return true;
    const q = query.toLowerCase();
    const userName = s.userID
      ? `${s.userID.firstname} ${s.userID.lastname}`.toLowerCase()
      : "";
    const email = s.userID?.email?.toLowerCase() || "";

    return (
      userName.includes(q) ||
      email.includes(q) ||
      s.items.some((it: any) => it.label.toLowerCase().includes(q))
    );
  });

  const getStats = () => {
    const total = submissions.length;

    // Approved: HR has approved the submission
    const approved = submissions.filter(
      (s) => s.reviewStatus === "approved"
    ).length;

    // Pending: Submitted but not yet approved (or rejected)
    const pending = submissions.filter(
      (s) => s.reviewStatus === "pending" || !s.reviewStatus
    ).length;

    return { total, approved, pending };
  };

  const stats = getStats();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
      <HRSidebar
        currentPage="Requirements"
        onCollapseChange={setIsSidebarCollapsed}
      />

      <div
        className={`flex-1 pt-16 md:pt-[81px] transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <div
          className={`hidden md:flex items-center gap-4 fixed top-0 left-0 z-30 bg-gradient-to-r from-red-600 to-red-700 h-[81px] ${
            isSidebarCollapsed
              ? "md:w-[calc(100%-5rem)] md:ml-20"
              : "md:w-[calc(100%-16rem)] md:ml-64"
          }`}
        >
          <h1 className="text-2xl font-bold text-white ml-4">
            Requirements Management
          </h1>
        </div>

        <div className="p-6 md:p-10">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Submissions
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stats.total}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Approved
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stats.approved}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pending Review
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stats.pending}
                  </p>
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <Toolbar
              query={query}
              onQueryChange={setQuery}
              onRefresh={fetchRequirements}
            />

            {loading ? (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Loading requirements...
                </p>
              </div>
            ) : error ? (
              <div className="mt-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-800 dark:text-red-300">
                      Error Loading Requirements
                    </h3>
                    <p className="text-red-600 dark:text-red-400 mt-1">
                      {error}
                    </p>
                    <button
                      onClick={fetchRequirements}
                      className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Requirements Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {query
                    ? "No submissions match your search criteria."
                    : "No applicants have submitted requirements yet."}
                </p>
              </div>
            ) : (
              <div className="mt-6">
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr className="text-left">
                        <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">
                          Applicant
                        </th>
                        <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">
                          Documents
                        </th>
                        <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">
                          Submitted
                        </th>
                        <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">
                          Status
                        </th>
                        <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filtered.map((s) => {
                        const userName = s.userID
                          ? `${s.userID.firstname} ${s.userID.lastname}`
                          : "Unknown";
                        const submittedDate = s.submittedAt
                          ? new Date(s.submittedAt).toLocaleString()
                          : "N/A";
                        const hasAllFiles = s.items.every(
                          (item: any) => item.url
                        );

                        return (
                          <tr
                            key={s._id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {userName}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {s.userID?.email || ""}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700 dark:text-gray-300">
                                  {s.items.length} item
                                  {s.items.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                              {submittedDate}
                            </td>
                            <td className="px-6 py-4">
                              {s.reviewStatus === "approved" ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                  <CheckCircle className="w-3 h-3" />
                                  Approved
                                </span>
                              ) : s.reviewStatus === "rejected" ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                                  <AlertCircle className="w-3 h-3" />
                                  Rejected
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                                  <Clock className="w-3 h-3" />
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setSelected(s)}
                                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium text-xs"
                                >
                                  View
                                </button>
                                {s.reviewStatus !== "approved" && (
                                  <button
                                    onClick={() => handleApprove(s._id)}
                                    disabled={approving === s._id}
                                    className="px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {approving === s._id ? "..." : "Approve"}
                                  </button>
                                )}
                                {s.reviewStatus === "pending" && (
                                  <button
                                    onClick={() => {
                                      const notes = prompt(
                                        "Reason for rejection (optional):"
                                      );
                                      if (notes !== null) {
                                        handleReject(s._id, notes);
                                      }
                                    }}
                                    disabled={approving === s._id}
                                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Reject
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <ViewSubmissionModal
              submission={selected}
              onClose={() => setSelected(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequirementsManagement;
