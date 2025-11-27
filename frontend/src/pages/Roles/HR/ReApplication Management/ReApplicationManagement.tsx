import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, User, Eye, Calendar, Search, Download } from "lucide-react";
import HRSidebar from "@/components/sidebar/HR/HRSidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllReApplications, updateReApplicationStatus } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "under_review":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "approved":
      return "bg-green-100 text-green-800 border-green-200";
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const ReApplicationManagement: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [scholarshipFilter, setScholarshipFilter] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  useEffect(() => {
    document.title = "ReApplication Management | SASM-IMS";
  }, []);

  // Fetch all re-applications
  const { data: reApplicationsData, isLoading } = useQuery({
    queryKey: ["allReApplications", statusFilter],
    queryFn: () =>
      getAllReApplications({
        status: statusFilter || undefined,
        page: 1,
        limit: 100,
      }),
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateReApplicationStatus(id, status),
    onSuccess: () => {
      addToast("Re-application status updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["allReApplications"] });
      closeModal();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update re-application status";
      addToast(errorMessage, "error");
    },
  });

  const reApplications = reApplicationsData?.reApplications || [];

  const filtered = reApplications.filter((d: any) => {
    const s = searchTerm.trim().toLowerCase();
    if (s) {
      const match =
        d.firstName?.toLowerCase().includes(s) ||
        d.lastName?.toLowerCase().includes(s) ||
        d.email?.toLowerCase().includes(s) ||
        (d.position || "").toLowerCase().includes(s);
      if (!match) return false;
    }

    if (scholarshipFilter && d.position !== scholarshipFilter) return false;

    return true;
  });

  const openReview = (row: any) => {
    setSelected(row);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
  };

  const handleUpdateStatus = () => {
    if (selected) {
      updateStatusMutation.mutate({
        id: selected._id,
        status: selected.status,
      });
    }
  };

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString() : "-";

  const handleDownloadFile = async (url: string) => {
    try {
      // Fetch the file
      const response = await fetch(url);
      const blob = await response.blob();

      // Create a download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      // Set filename with proper extension
      const fileName = `recentGrades-${Date.now()}.pdf`;
      link.download = fileName;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback to opening in new tab
      window.open(url, "_blank");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
      <HRSidebar
        currentPage="ReApplication Management"
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
            ReApplication Management
          </h1>
        </div>

        <div className="p-6 md:p-10">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="search">Search Reapplications</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name"
                      value={searchTerm}
                      onChange={(e: any) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-48">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    title="Filter by status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="w-48">
                  <Label htmlFor="scholarship">Scholarship</Label>
                  <select
                    id="scholarship"
                    title="Filter by scholarship type"
                    value={scholarshipFilter}
                    onChange={(e) => setScholarshipFilter(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">All</option>
                    <option value="none">None</option>
                    <option value="student_assistant">Student Assistant</option>
                    <option value="student_marshal">Student Marshal</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading re-applications...</p>
                </div>
              ) : filtered.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applicant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Scholarship
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {filtered.map((app: any) => (
                        <tr
                          key={app._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <User className="h-5 w-5 text-red-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {app.firstName} {app.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {app.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {app.position === "student_assistant"
                              ? "Student Assistant"
                              : app.position === "student_marshal"
                              ? "Student Marshal"
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                app.status
                              )}`}
                            >
                              {app.status.replace("_", " ").toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(app.submissionDate || app.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openReview(app)}
                                className="text-red-600 border-red-300"
                              >
                                {" "}
                                <Eye className="h-4 w-4 mr-1" /> Review{" "}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No reapplications found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Review Modal */}
      {showModal && selected && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 md:p-6 w-full max-w-4xl mx-2 md:mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <User className="w-10 h-10 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {selected.firstName} {selected.lastName}
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {selected.email}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {selected.position === "student_assistant"
                    ? "Student Assistant"
                    : "Student Marshal"}
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Effectivity Date
                  </Label>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {formatDate(selected.effectivityDate)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Years in Service
                  </Label>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {selected.yearsInService}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Term
                  </Label>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {selected.term}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Academic Year
                  </Label>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {selected.academicYear}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    College
                  </Label>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {selected.college || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Course & Year
                  </Label>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {selected.courseYear || "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reason(s) for Re-Application
                </Label>
                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  {selected.reapplicationReasons}
                </p>
              </div>

              {selected.recentGrades && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Recent Grades
                    </Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadFile(selected.recentGrades)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <Label
                  htmlFor="status-select"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Update Status
                </Label>
                <select
                  id="status-select"
                  title="Re-application status"
                  value={selected.status}
                  onChange={(e) =>
                    setSelected((s: any) => ({ ...s, status: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="bg-gray-400 hover:bg-gray-500 text-white"
                onClick={closeModal}
                disabled={updateStatusMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStatus}
                className="bg-red-600 text-white hover:bg-red-700"
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending
                  ? "Updating..."
                  : "Update Status"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReApplicationManagement;
