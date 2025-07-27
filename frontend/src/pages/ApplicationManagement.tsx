import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  User,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Search,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllApplications, updateApplicationStatus } from "@/lib/api";
import StudentSidebar from "@/components/StudentSidebar";
import HRSidebar from "@/components/HRSidebar";
import OfficeSidebar from "@/components/OfficeSidebar";

const ApplicationManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Filters and pagination
  const [filters, setFilters] = useState({
    status: "",
    position: "",
    page: 1,
    limit: 10,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState({
    status: "",
    hrComments: "",
  });

  useEffect(() => {
    document.title = "Application Management | SASM-IMS";
  }, []);

  // Fetch applications
  const { data: applicationsData, isLoading } = useQuery({
    queryKey: ["applications", filters],
    queryFn: () => getAllApplications(filters),
    enabled: user?.role === "hr" || user?.role === "office",
  });

  // Update application status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateApplicationStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setShowStatusUpdate(false);
      setSelectedApplication(null);
      setStatusUpdateData({ status: "", hrComments: "" });
    },
    onError: (error: any) => {
      console.error("Failed to update application status:", error);
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleStatusUpdate = (application: any) => {
    setSelectedApplication(application);
    setStatusUpdateData({
      status: application.status,
      hrComments: application.hrComments || "",
    });
    setShowStatusUpdate(true);
  };

  const submitStatusUpdate = () => {
    if (selectedApplication && statusUpdateData.status) {
      updateStatusMutation.mutate({
        id: selectedApplication._id,
        data: statusUpdateData,
      });
    }
  };

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
      case "interview_scheduled":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "under_review":
      case "interview_scheduled":
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Determine which sidebar to show based on user role
  const renderSidebar = () => {
    switch (user?.role) {
      case "hr":
        return (
          <HRSidebar
            currentPage="Application Management"
            onCollapseChange={setIsSidebarCollapsed}
          />
        );
      case "office":
        return (
          <OfficeSidebar
            currentPage="Application Management"
            onCollapseChange={setIsSidebarCollapsed}
          />
        );
      default:
        return (
          <StudentSidebar
            currentPage="Application Management"
            onCollapseChange={setIsSidebarCollapsed}
          />
        );
    }
  };

  // If not HR or Office, show access denied
  if (user?.role !== "hr" && user?.role !== "office") {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
        {renderSidebar()}
        <div
          className={`flex-1 pt-16 md:pt-0 transition-all duration-300 ${
            isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
          }`}
        >
          <div className="p-6 md:p-10 flex items-center justify-center min-h-screen">
            <Card className="max-w-2xl w-full">
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                      Access Denied
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      You don't have permission to access application
                      management. This feature is only available to HR and
                      Office staff.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
        {renderSidebar()}
        <div
          className={`flex-1 pt-16 md:pt-0 transition-all duration-300 ${
            isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
          }`}
        >
          <div className="p-6 md:p-10 flex items-center justify-center min-h-screen">
            <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
      {renderSidebar()}
      <div
        className={`flex-1 pt-16 md:pt-0 transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Header */}
        <div className="hidden md:block bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-800 p-4 md:p-6">
          <h1 className="text-2xl font-bold text-white">
            Application Management
          </h1>
          <p className="text-red-100 mt-1">
            Manage student assistant and student marshal applications
          </p>
        </div>

        {/* Main Content */}
        <div className="p-6 md:p-10">
          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <Label
                    htmlFor="search"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Search Applications
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name, email, or position..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="status"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Status
                  </Label>
                  <select
                    id="status"
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="interview_scheduled">
                      Interview Scheduled
                    </option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <Label
                    htmlFor="position"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Position
                  </Label>
                  <select
                    id="position"
                    value={filters.position}
                    onChange={(e) =>
                      handleFilterChange("position", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">All Positions</option>
                    <option value="student_assistant">Student Assistant</option>
                    <option value="student_marshal">Student Marshal</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applications List */}
          <Card>
            <CardContent className="p-0">
              {applicationsData?.applications?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Applicant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Submitted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {applicationsData.applications
                        .filter((app: any) => {
                          if (!searchTerm) return true;
                          const searchLower = searchTerm.toLowerCase();
                          return (
                            app.firstName.toLowerCase().includes(searchLower) ||
                            app.lastName.toLowerCase().includes(searchLower) ||
                            app.email.toLowerCase().includes(searchLower) ||
                            app.position.toLowerCase().includes(searchLower)
                          );
                        })
                        .map((application: any) => (
                          <tr
                            key={application._id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                    <User className="h-5 w-5 text-red-600 dark:text-red-400" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {application.firstName}{" "}
                                    {application.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {application.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {application.position === "student_assistant"
                                  ? "Student Assistant"
                                  : "Student Marshal"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                  application.status
                                )}`}
                              >
                                {getStatusIcon(application.status)}
                                {application.status
                                  .replace("_", " ")
                                  .toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(application.submittedAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleStatusUpdate(application)
                                  }
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Review
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
                  <p className="text-gray-500 dark:text-gray-400">
                    No applications found matching your criteria.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {applicationsData?.pagination &&
            applicationsData.pagination.totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={!applicationsData.pagination.hasPrevPage}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {applicationsData.pagination.currentPage} of{" "}
                    {applicationsData.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={!applicationsData.pagination.hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusUpdate && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Review Application - {selectedApplication.firstName}{" "}
              {selectedApplication.lastName}
            </h3>
            {/* Application Details Summary */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Position:</span>{" "}
                  {selectedApplication.position === "student_assistant"
                    ? "Student Assistant"
                    : "Student Marshal"}
                </div>
                <div>
                  <span className="font-medium">Age:</span>{" "}
                  {selectedApplication.age}
                </div>
                <div>
                  <span className="font-medium">Email:</span>{" "}
                  {selectedApplication.email}
                </div>
                <div>
                  <span className="font-medium">Contact:</span>{" "}
                  {selectedApplication.homeContact}
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">Home Address:</span>{" "}
                  {selectedApplication.homeAddress},{" "}
                  {selectedApplication.homeBarangay},{" "}
                  {selectedApplication.homeCity},{" "}
                  {selectedApplication.homeProvince}
                </div>
              </div>
            </div>
            {/* Uploaded Documents */}
            {(selectedApplication.profilePhoto ||
              selectedApplication.idDocument ||
              (selectedApplication.certificates &&
                selectedApplication.certificates.length > 0)) && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Uploaded Documents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedApplication.profilePhoto && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Profile Photo
                      </label>
                      <div className="mt-1">
                        <img
                          src={`${
                            import.meta.env.VITE_API_URL
                          }/uploads/${selectedApplication.profilePhoto
                            .split("/")
                            .pop()}`}
                          alt="Profile"
                          className="w-full h-32 object-cover rounded-lg border"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-image.png";
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {selectedApplication.idDocument && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        ID Document
                      </label>
                      <div className="mt-1">
                        <img
                          src={`${
                            import.meta.env.VITE_API_URL
                          }/uploads/${selectedApplication.idDocument
                            .split("/")
                            .pop()}`}
                          alt="ID Document"
                          className="w-full h-32 object-cover rounded-lg border"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-image.png";
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {selectedApplication.certificates &&
                    selectedApplication.certificates.length > 0 && (
                      <div>
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          Certificates (
                          {selectedApplication.certificates.length})
                        </label>
                        <div className="mt-1 grid grid-cols-2 gap-2">
                          {selectedApplication.certificates
                            .slice(0, 4)
                            .map((cert: string, index: number) => (
                              <img
                                key={index}
                                src={`${
                                  import.meta.env.VITE_API_URL
                                }/uploads/${cert.split("/").pop()}`}
                                alt={`Certificate ${index + 1}`}
                                className="w-full h-16 object-cover rounded border"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "/placeholder-image.png";
                                }}
                              />
                            ))}
                        </div>
                        {selectedApplication.certificates.length > 4 && (
                          <p className="text-xs text-gray-500 mt-1">
                            +{selectedApplication.certificates.length - 4} more
                          </p>
                        )}
                      </div>
                    )}
                </div>
              </div>
            )}{" "}
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="newStatus"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Update Status
                </Label>
                <select
                  id="newStatus"
                  value={statusUpdateData.status}
                  onChange={(e) =>
                    setStatusUpdateData((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="interview_scheduled">
                    Interview Scheduled
                  </option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <Label
                  htmlFor="hrComments"
                  className="text-gray-700 dark:text-gray-300"
                >
                  HR Comments (Optional)
                </Label>
                <textarea
                  id="hrComments"
                  rows={4}
                  value={statusUpdateData.hrComments}
                  onChange={(e) =>
                    setStatusUpdateData((prev) => ({
                      ...prev,
                      hrComments: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Add any comments or notes about this application..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowStatusUpdate(false);
                  setSelectedApplication(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={submitStatusUpdate}
                disabled={updateStatusMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
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

export default ApplicationManagement;
