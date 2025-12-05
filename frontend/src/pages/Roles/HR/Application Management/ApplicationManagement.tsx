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
  Mail,
  X,
  AlertCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllApplications, updateApplicationStatus } from "@/lib/api";
import { useNotificationUpdater } from "@/hooks/useNotificationUpdater";
import StudentSidebar from "@/components/sidebar/Student/StudentSidebar";
import HRSidebar from "@/components/sidebar/HR/HRSidebar";
import OfficeSidebar from "@/components/sidebar/Office/OfficeSidebar";
import ApplicationTimeline from "@/components/ui/application-timeline";
import { useNavigate } from "react-router-dom";

// Custom Alert Modal Component
const AlertModal = ({
  isOpen,
  onClose,
  title,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              OK
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ApplicationManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { triggerNotificationUpdate } = useNotificationUpdater();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  // Alert modal state
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const showAlert = (title: string, message: string) => {
    setAlertModal({ isOpen: true, title, message });
  };

  const closeAlert = () => {
    setAlertModal({ isOpen: false, title: "", message: "" });
  };

  // Filters and pagination
  const [filters, setFilters] = useState({
    status: "",
    position: "",
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "asc" as "asc" | "desc",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [activeTab, setActiveTab] = useState<"review" | "history">("review");
  const [statusUpdateData, setStatusUpdateData] = useState({
    status: "",
    hrComments: "",
    psychometricTestDate: "",
    psychometricTestTime: "",
    psychometricTestLocation: "",
    psychometricTestWhatToBring: "",
    interviewDate: "",
    interviewTime: "",
    interviewLocation: "",
    interviewWhatToBring: "",
    interviewNotes: "",
  });

  // When true the next modal open will NOT auto-populate hrComments from the
  // application object. This is set when the user cancels so the previous
  // typed comment doesn't reappear on reopen.
  const [skipPopulateHrComments, setSkipPopulateHrComments] = useState(false);

  // Preview state for PDFs/images
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = useState<string | null>(null);

  // Open a preview for a certificate URL (prefers blob URL)
  const openPreview = async (url: string, fallbackName: string) => {
    try {
      let finalUrl = url;
      let res = await fetch(finalUrl);
      if (!res.ok && /\.pdf(\?|$)/i.test(finalUrl)) {
        try {
          const withoutPdf = finalUrl.replace(/\.pdf(?=$|\?)/i, "");
          const altRes = await fetch(withoutPdf);
          if (altRes.ok) {
            res = altRes;
            finalUrl = withoutPdf;
          }
        } catch {}
      }
      if (!res.ok) throw new Error("Network response not ok");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      setPreviewBlobUrl(blobUrl);
      const parts = finalUrl.split("?")[0].split("/");
      setPreviewFilename(parts[parts.length - 1] || fallbackName);
      setIsPreviewOpen(true);
    } catch (err) {
      window.open(url, "_blank");
    }
  };

  useEffect(() => {
    document.title = "Application Management | SASM-IMS";
  }, []);

  // Helper to download remote file and force a filename (pure-browser, no deps)
  const downloadUrlAs = async (url: string, filename: string) => {
    try {
      console.log("downloadUrlAs called with:", { url, filename });
      let finalUrl = url;
      let res = await fetch(finalUrl);

      // If original fetch failed and URL ends with .pdf, try fetching without the .pdf
      if (!res.ok && /\.pdf(\?|$)/i.test(finalUrl)) {
        try {
          const withoutPdf = finalUrl.replace(/\.pdf(?=$|\?)/i, "");
          const altRes = await fetch(withoutPdf);
          if (altRes.ok) {
            res = altRes;
            finalUrl = withoutPdf;
          }
        } catch (e) {
          // ignore and fallthrough to original error handling
        }
      }

      if (!res.ok) throw new Error("Network response was not ok");
      const blob = await res.blob();

      // If filename has no extension, try to infer from content-type
      const hasExt = /\.[a-z0-9]{1,6}$/i.test(filename);
      let finalName = filename;
      console.log("Filename check:", {
        filename,
        hasExt,
        contentType: res.headers.get("content-type"),
      });
      if (!hasExt) {
        const contentType = res.headers.get("content-type") || "";
        if (/application\/pdf/i.test(contentType))
          finalName = `${filename}.pdf`;
        else if (/image\/(jpeg|jpg)/i.test(contentType))
          finalName = `${filename}.jpg`;
        else if (/image\/png/i.test(contentType)) finalName = `${filename}.png`;
        else if (/image\/webp/i.test(contentType))
          finalName = `${filename}.webp`;
        else if (/image\/svg\+xml/i.test(contentType))
          finalName = `${filename}.svg`;
        else if (/text\//i.test(contentType)) finalName = `${filename}.txt`;
        // else leave as-is (browser may still infer when saving)
      }

      console.log("Final download name:", finalName);
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = finalName;
      // some browsers require the element to be in the DOM
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
      // fallback to opening in new tab
      window.open(url, "_blank");
    }
  };

  // Fetch applications
  const { data: applicationsData, isLoading } = useQuery({
    queryKey: ["applications", filters],
    queryFn: () => getAllApplications(filters),
    enabled: user?.role === "hr" || user?.role === "office",
  });

  // Extract unique "What to Bring" values for autocomplete
  const uniqueInterviewWhatToBring = Array.from(
    new Set(
      applicationsData?.applications
        ?.map((app: any) => app.interviewWhatToBring)
        .filter((val: string) => val && val.trim())
    )
  );

  const uniquePsychometricWhatToBring = Array.from(
    new Set(
      applicationsData?.applications
        ?.map((app: any) => app.psychometricTestWhatToBring)
        .filter((val: string) => val && val.trim())
    )
  );

  // Update application status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateApplicationStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      // Trigger notification update since status changes create notifications
      triggerNotificationUpdate();
      // Auto-close modal on success
      setShowStatusUpdate(false);
      // Use centralized close helper to ensure consistent reset behavior
      closeStatusModal();
    },
    onError: (error: any) => {
      console.error("Failed to update application status:", error);
      // Show error message to user
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update application status";
      showAlert("Error", errorMessage);
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Centralized helper to close the status update modal and reset modal state
  const closeStatusModal = () => {
    setShowStatusUpdate(false);
    setSelectedApplication(null);
    setActiveTab("review"); // Reset to review tab
    setStatusUpdateData({
      status: "",
      hrComments: "",
      psychometricTestDate: "",
      psychometricTestTime: "",
      psychometricTestLocation: "",
      psychometricTestWhatToBring: "",
      interviewDate: "",
      interviewTime: "",
      interviewLocation: "",
      interviewWhatToBring: "",
      interviewNotes: "",
    });
    // Prevent the next modal open from auto-filling hrComments from the
    // selected application (user intentionally cancelled).
    setSkipPopulateHrComments(true);
  };

  const handleStatusUpdate = (application: any) => {
    setSelectedApplication(application);

    // For failed, rejected, or withdrawn applications, show in view-only mode
    if (
      application.status === "failed_interview" ||
      application.status === "rejected" ||
      application.status === "withdrawn"
    ) {
      setStatusUpdateData({
        status: application.status,
        hrComments: skipPopulateHrComments ? "" : application.hrComments || "",
        psychometricTestDate: application.psychometricTestDate || "",
        psychometricTestTime: application.psychometricTestTime || "",
        psychometricTestLocation: application.psychometricTestLocation || "",
        psychometricTestWhatToBring:
          application.psychometricTestWhatToBring || "",
        interviewDate: application.interviewDate || "",
        interviewTime: application.interviewTime || "",
        interviewLocation: application.interviewLocation || "",
        interviewWhatToBring: application.interviewWhatToBring || "",
        interviewNotes: application.interviewNotes || "",
      });
      // clear the flag after using it so subsequent opens behave normally
      if (skipPopulateHrComments) setSkipPopulateHrComments(false);
      setShowStatusUpdate(true);
      return; // Don't auto-update or allow changes
    }

    // Automatically set status to "under_review" if application is currently "pending"
    const initialStatus =
      application.status === "pending" ? "under_review" : application.status;

    setStatusUpdateData({
      status: initialStatus,
      hrComments: skipPopulateHrComments ? "" : application.hrComments || "",
      psychometricTestDate: application.psychometricTestDate || "",
      psychometricTestTime: application.psychometricTestTime || "",
      psychometricTestLocation: application.psychometricTestLocation || "",
      psychometricTestWhatToBring:
        application.psychometricTestWhatToBring || "",
      interviewDate: application.interviewDate || "",
      interviewTime: application.interviewTime || "",
      interviewLocation: application.interviewLocation || "",
      interviewWhatToBring: application.interviewWhatToBring || "",
      interviewNotes: application.interviewNotes || "",
    });
    if (skipPopulateHrComments) setSkipPopulateHrComments(false);
    setShowStatusUpdate(true);

    // Auto-update pending applications to under_review when HR opens them
    if (application.status === "pending") {
      updateStatusMutation.mutate({
        id: application._id,
        data: {
          status: "under_review",
          hrComments: "Application opened for review by HR",
        },
      });
    }
  };

  const submitStatusUpdate = () => {
    if (selectedApplication && statusUpdateData.status) {
      // Validate psychometric test scheduling fields if status is psychometric_scheduled
      if (statusUpdateData.status === "psychometric_scheduled") {
        if (
          !statusUpdateData.psychometricTestDate ||
          !statusUpdateData.psychometricTestTime ||
          !statusUpdateData.psychometricTestLocation ||
          !statusUpdateData.psychometricTestWhatToBring
        ) {
          showAlert(
            "Missing Required Fields",
            "Please fill in all required psychometric test scheduling fields (Date, Time, Location, and What to Bring)."
          );
          return;
        }
        // Enforce test time window: 08:00 - 17:00 (inclusive)
        try {
          const t = statusUpdateData.psychometricTestTime; // expected format HH:MM
          const [hhStr, mmStr] = (t || "").split(":");
          const hh = parseInt(hhStr || "", 10);
          const mm = parseInt(mmStr || "", 10);
          if (
            Number.isNaN(hh) ||
            Number.isNaN(mm) ||
            hh < 8 ||
            hh > 17 ||
            (hh === 17 && mm > 0)
          ) {
            showAlert(
              "Invalid Test Time",
              "Psychometric test time must be between 08:00 and 17:00."
            );
            return;
          }
        } catch (e) {
          showAlert(
            "Invalid Test Time",
            "Invalid test time. Please choose a time between 08:00 and 17:00."
          );
          return;
        }
      }

      // Validate interview scheduling fields if status is interview_scheduled
      if (statusUpdateData.status === "interview_scheduled") {
        if (
          !statusUpdateData.interviewDate ||
          !statusUpdateData.interviewTime ||
          !statusUpdateData.interviewLocation ||
          !statusUpdateData.interviewWhatToBring
        ) {
          showAlert(
            "Missing Required Fields",
            "Please fill in all required interview scheduling fields (Date, Time, Location, and What to Bring)."
          );
          return;
        }
        // Enforce interview time window: 08:00 - 17:00 (inclusive)
        try {
          const t = statusUpdateData.interviewTime; // expected format HH:MM
          const [hhStr, mmStr] = (t || "").split(":");
          const hh = parseInt(hhStr || "", 10);
          const mm = parseInt(mmStr || "", 10);
          if (
            Number.isNaN(hh) ||
            Number.isNaN(mm) ||
            hh < 8 ||
            hh > 17 ||
            (hh === 17 && mm > 0)
          ) {
            showAlert(
              "Invalid Interview Time",
              "Interview time must be between 08:00 and 17:00."
            );
            return;
          }
        } catch (e) {
          showAlert(
            "Invalid Interview Time",
            "Invalid interview time. Please choose a time between 08:00 and 17:00."
          );
          return;
        }
      }

      updateStatusMutation.mutate({
        id: selectedApplication._id,
        data: statusUpdateData,
      });
    }
  };

  const getStatusColor = (status: string) => {
    // Using only white and gray colors as requested
    switch (status) {
      case "pending":
      case "under_review":
      case "psychometric_scheduled":
      case "psychometric_completed":
      case "interview_scheduled":
      case "interview_completed":
      case "trainee":
      case "training_completed":
      case "on_hold":
        return "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600";
      case "psychometric_passed":
      case "interview_passed":
      case "accepted":
        return "bg-gray-100 text-gray-900 border-gray-400 dark:bg-gray-700 dark:text-white dark:border-gray-500";
      case "psychometric_failed":
      case "interview_failed":
      case "rejected":
      case "withdrawn":
        return "bg-gray-200 text-gray-600 border-gray-400 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700";
      default:
        return "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "passed_interview":
        return <CheckCircle className="h-4 w-4" />;
      case "hours_completed":
        return <Clock className="h-4 w-4" />;
      case "rejected":
      case "failed_interview":
        return <XCircle className="h-4 w-4" />;
      case "under_review":
      case "interview_scheduled":
      case "on_hold":
        return <Clock className="h-4 w-4" />;
      case "withdrawn":
        return <XCircle className="h-4 w-4" />;
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
        return <StudentSidebar onCollapseChange={setIsSidebarCollapsed} />;
    }
  };

  // If not HR or Office, show access denied
  if (user?.role !== "hr" && user?.role !== "office") {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
        {renderSidebar()}
        <div
          className={`flex-1 pt-16 md:pt-[81px] transition-all duration-300 ${
            isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
          }`}
        >
          <div className="p-6 md:p-10 flex items-center justify-center min-h-screen">
            <Card className="max-w-2xl w-full">
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-gray-600 dark:text-gray-400" />
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
          className={`flex-1 pt-16 md:pt-[81px] transition-all duration-300 ${
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
      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
      />

      {renderSidebar()}
      <div
        className={`flex-1 pt-16 md:pt-[81px] transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Header */}
        <div
          className={`hidden md:flex items-center gap-4 fixed top-0 left-0 z-30 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-800 h-[81px] ${
            isSidebarCollapsed
              ? "md:w-[calc(100%-5rem)] md:ml-20"
              : "md:w-[calc(100%-16rem)] md:ml-64"
          }`}
        >
          <h1 className="text-2xl font-bold text-white dark:text-white ml-4">
            Application Management
          </h1>
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
                      placeholder="Search by name"
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
                    aria-label="Filter by status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">New Applications</option>
                    <option value="under_review">Being Reviewed</option>
                    <option value="psychometric_scheduled">
                      Psychometric Test Scheduled
                    </option>
                    <option value="psychometric_completed">
                      Psychometric Test Completed
                    </option>
                    <option value="psychometric_passed">
                      Psychometric Test Passed
                    </option>
                    <option value="psychometric_failed">
                      Psychometric Test Failed
                    </option>
                    <option value="interview_scheduled">
                      Interview Scheduled
                    </option>
                    <option value="interview_completed">
                      Interview Completed
                    </option>
                    <option value="interview_passed">Interview Passed</option>
                    <option value="interview_failed">Interview Failed</option>
                    <option value="pending_office_interview">
                      Pending Office Interview
                    </option>
                    <option value="office_interview_scheduled">
                      Office Interview Scheduled
                    </option>
                    <option value="trainee">Trainee</option>
                    <option value="training_completed">
                      Training Completed
                    </option>
                    <option value="hours_completed">Hours Completed</option>
                    <option value="accepted">Accepted</option>
                    <option value="on_hold">Put On Hold</option>
                    <option value="withdrawn">Withdrawn by Applicant</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <Label
                    htmlFor="position"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Scholarship
                  </Label>
                  <select
                    id="position"
                    value={filters.position}
                    onChange={(e) =>
                      handleFilterChange("position", e.target.value)
                    }
                    aria-label="Filter by scholarship position"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">All Scholarships</option>
                    <option value="student_assistant">Student Assistant</option>
                    <option value="student_marshal">Student Marshal</option>
                  </select>
                </div>

                <div>
                  <Label
                    htmlFor="sortOrder"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Sort by Date
                  </Label>
                  <select
                    id="sortOrder"
                    value={filters.sortOrder}
                    onChange={(e) =>
                      handleFilterChange("sortOrder", e.target.value)
                    }
                    aria-label="Sort by date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="asc">Oldest First</option>
                    <option value="desc">Newest First</option>
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
                          Scholarship
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
                                  {(() => {
                                    // Check if we have a profile photo
                                    if (application.profilePhoto) {
                                      const photo = application.profilePhoto;
                                      let profileUrl: string | undefined;

                                      // If it's already an absolute URL (Cloudinary or other), use it as-is
                                      if (/^https?:\/\//i.test(photo)) {
                                        profileUrl = photo;
                                      } else if (photo.includes("/")) {
                                        // New format: relative path like "uploads/profiles/filename.jpg"
                                        profileUrl = `${
                                          import.meta.env.VITE_API
                                        }/${photo}`;
                                      } else {
                                        // Old format: stored as filename
                                        profileUrl = `${
                                          import.meta.env.VITE_API
                                        }/uploads/profiles/${photo}`;
                                      }

                                      return (
                                        <img
                                          src={profileUrl}
                                          alt="Profile Photo"
                                          className="h-10 w-10 rounded-full object-cover border-2 border-red-100 dark:border-red-800"
                                          onError={(e) => {
                                            console.error(
                                              "Profile image failed to load:",
                                              {
                                                profileUrl,
                                                originalPath:
                                                  application.profilePhoto,
                                                currentSrc: e.currentTarget.src,
                                              }
                                            );
                                            // Try fallback to certificate
                                            if (
                                              application.certificates &&
                                              application.certificates.length >
                                                0
                                            ) {
                                              const certPath =
                                                application.certificates[0];
                                              let certUrl: string | undefined;

                                              if (
                                                /^https?:\/\//i.test(certPath)
                                              ) {
                                                certUrl = certPath;
                                              } else if (
                                                certPath.includes("/")
                                              ) {
                                                certUrl = `${
                                                  import.meta.env.VITE_API
                                                }/${certPath}`;
                                              } else {
                                                certUrl = `${
                                                  import.meta.env.VITE_API
                                                }/uploads/certificates/${certPath}`;
                                              }

                                              // Normalize Cloudinary raw/upload paths with redundant uploads/ segment
                                              if (
                                                certUrl &&
                                                /res\.cloudinary\.com/i.test(
                                                  certUrl
                                                )
                                              ) {
                                                certUrl = certUrl
                                                  .replace(
                                                    /(\/raw\/upload\/v\d+\/)uploads\//i,
                                                    "$1"
                                                  )
                                                  .replace(
                                                    /(\/raw\/upload\/)uploads\//i,
                                                    "$1"
                                                  );
                                              }

                                              console.log(
                                                "Trying certificate fallback:",
                                                certUrl
                                              );
                                              if (certUrl)
                                                e.currentTarget.src = certUrl;
                                            } else {
                                              e.currentTarget.src =
                                                "/placeholder-image.png";
                                            }
                                          }}
                                          onLoad={() => {
                                            console.log(
                                              "Profile image loaded successfully:",
                                              profileUrl
                                            );
                                          }}
                                        />
                                      );
                                    }

                                    // Fallback to certificate image
                                    if (
                                      application.certificates &&
                                      application.certificates.length > 0
                                    ) {
                                      const certPath =
                                        application.certificates[0];
                                      let certUrl: string | undefined;

                                      if (/^https?:\/\//i.test(certPath)) {
                                        certUrl = certPath;
                                      } else if (certPath.includes("/")) {
                                        // New format: relative path like "uploads/certificates/filename.jpg"
                                        certUrl = `${
                                          import.meta.env.VITE_API
                                        }/${certPath}`;
                                      } else {
                                        // Old format: stored as filename
                                        certUrl = `${
                                          import.meta.env.VITE_API
                                        }/uploads/certificates/${certPath}`;
                                      }

                                      if (certUrl) {
                                        console.log(
                                          "Certificate URL constructed:",
                                          {
                                            originalPath: certPath,
                                            constructedUrl: certUrl,
                                          }
                                        );

                                        return (
                                          <img
                                            src={certUrl}
                                            alt="Certificate Photo"
                                            className="h-10 w-10 rounded-full object-cover border-2 border-blue-100 dark:border-blue-800"
                                            onError={(e) => {
                                              console.error(
                                                "Certificate image failed to load:",
                                                {
                                                  certUrl,
                                                  originalPath: certPath,
                                                  currentSrc:
                                                    e.currentTarget.src,
                                                }
                                              );
                                              e.currentTarget.src =
                                                "/placeholder-image.png";
                                            }}
                                            onLoad={() => {
                                              console.log(
                                                "Certificate image loaded successfully:",
                                                certUrl
                                              );
                                            }}
                                          />
                                        );
                                      }
                                    }

                                    // Default avatar
                                    return (
                                      <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                      </div>
                                    );
                                  })()}
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
                                {application.status === "failed_interview" ||
                                application.status === "rejected" ||
                                application.status === "withdrawn" ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleStatusUpdate(application)
                                    }
                                    className="text-gray-600 border-gray-300 hover:bg-gray-50"
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View Only
                                  </Button>
                                ) : application.status === "pending" &&
                                  !application.requirementsCompleted ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled
                                    className="text-gray-400 border-gray-200 cursor-not-allowed"
                                    title="Waiting for applicant to submit requirements"
                                  >
                                    <Clock className="h-4 w-4 mr-1" />
                                    Awaiting Requirements
                                  </Button>
                                ) : application.status === "pending" &&
                                  application.requirementsCompleted &&
                                  application.requirementsReviewStatus !==
                                    "approved" ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate("/hr/requirements")}
                                    className="text-amber-600 border-amber-300 hover:bg-amber-100 bg-amber-50"
                                    title="Click to review and approve requirements"
                                  >
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    Pending Requirements Review
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleStatusUpdate(application)
                                    }
                                    className="text-gray-700 border-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800"
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Review
                                  </Button>
                                )}
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
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 md:p-6 w-full max-w-7xl mx-2 md:mx-4 max-h-[98vh] md:max-h-[95vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              onClick={closeStatusModal}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>

            {/* Header Section with Profile Photo */}
            <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6 mb-6 pb-6 border-b border-gray-200 dark:border-gray-600">
              <div className="flex-shrink-0 self-center sm:self-start">
                {/* Display profile photo - prioritize actual profile photo, fallback to 2x2 from certificates */}
                {selectedApplication.profilePhoto ? (
                  <div className="relative">
                    {(() => {
                      const photo = selectedApplication.profilePhoto;
                      let profileUrl: string | undefined;
                      const _photo = (photo || "").toString().trim();

                      // If it's already an absolute URL (Cloudinary or other) or protocol-relative, use as-is
                      if (
                        /^https?:\/\//i.test(_photo) ||
                        /^\/\//.test(_photo)
                      ) {
                        profileUrl = _photo.startsWith("//")
                          ? `https:${_photo}`
                          : _photo;
                      } else if (
                        /cloudinary/i.test(_photo) ||
                        _photo.startsWith("res.cloudinary.com")
                      ) {
                        // Might be stored without protocol (e.g. "res.cloudinary.com/..."), assume https
                        profileUrl = _photo.startsWith("//")
                          ? `https:${_photo}`
                          : `https://${_photo}`;
                      } else if (_photo.includes("/")) {
                        // Already a relative path like "uploads/profiles/..."
                        profileUrl = `${import.meta.env.VITE_API}/${_photo}`;
                      } else if (_photo) {
                        // Bare filename
                        profileUrl = `${
                          import.meta.env.VITE_API
                        }/uploads/profiles/${_photo}`;
                      } else {
                        profileUrl = undefined;
                      }

                      return (
                        <img
                          src={profileUrl}
                          alt="Profile Photo"
                          className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() =>
                            profileUrl && window.open(profileUrl, "_blank")
                          }
                          onError={(e) => {
                            console.error("Profile image failed to load:", {
                              src: e.currentTarget.src,
                              originalPath: selectedApplication.profilePhoto,
                              viteApi: import.meta.env.VITE_API,
                              attempted: profileUrl,
                            });

                            // Try fallback to certificate if available
                            if (
                              selectedApplication.certificates &&
                              selectedApplication.certificates.length > 0
                            ) {
                              const certPath =
                                selectedApplication.certificates[0];
                              let certUrl: string | undefined;
                              const _certPath = (certPath || "")
                                .toString()
                                .trim();

                              if (
                                /^https?:\/\//i.test(_certPath) ||
                                /^\/\//.test(_certPath)
                              ) {
                                certUrl = _certPath.startsWith("//")
                                  ? `https:${_certPath}`
                                  : _certPath;
                              } else if (
                                /cloudinary/i.test(_certPath) ||
                                _certPath.startsWith("res.cloudinary.com")
                              ) {
                                certUrl = _certPath.startsWith("//")
                                  ? `https:${_certPath}`
                                  : `https://${_certPath}`;

                                // Normalize Cloudinary raw/upload paths which may include
                                // an extra 'uploads/' folder segment in the public_id
                                // (e.g. .../raw/upload/v1/uploads/certificates/...).
                                // Remove the redundant 'uploads/' that follows the
                                // '/raw/upload(/v#)/' segment to avoid 404s.
                                if (
                                  certUrl &&
                                  /res\.cloudinary\.com/i.test(certUrl)
                                ) {
                                  certUrl = certUrl
                                    .replace(
                                      /(\/raw\/upload\/v\d+\/)uploads\//i,
                                      "$1"
                                    )
                                    .replace(
                                      /(\/raw\/upload\/)uploads\//i,
                                      "$1"
                                    );
                                }
                              } else if (_certPath.includes("/")) {
                                certUrl = `${
                                  import.meta.env.VITE_API
                                }/${_certPath}`;
                              } else if (_certPath) {
                                certUrl = `${
                                  import.meta.env.VITE_API
                                }/uploads/certificates/${_certPath}`;
                              }

                              if (certUrl) e.currentTarget.src = certUrl;
                              else
                                e.currentTarget.src = "/placeholder-image.png";
                            } else {
                              e.currentTarget.src = "/placeholder-image.png";
                            }
                          }}
                          onLoad={() => {
                            console.log(
                              "Profile image loaded successfully:",
                              profileUrl
                            );
                          }}
                        />
                      );
                    })()}
                    <div className="absolute -bottom-2 -right-2 bg-gray-700 dark:bg-gray-600 text-white rounded-full p-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="absolute -top-2 -left-2 bg-gray-700 dark:bg-gray-600 text-white rounded-full px-2 py-1 text-xs font-medium shadow-sm">
                      PROFILE
                    </div>
                  </div>
                ) : selectedApplication.certificates &&
                  selectedApplication.certificates.length > 0 ? (
                  <div className="relative">
                    {(() => {
                      const cert0 = (
                        selectedApplication.certificates?.[0] || ""
                      )
                        .toString()
                        .trim();
                      let certUrl: string | undefined;

                      if (/^https?:\/\//i.test(cert0) || /^\/\//.test(cert0)) {
                        certUrl = cert0.startsWith("//")
                          ? `https:${cert0}`
                          : cert0;
                      } else if (
                        /cloudinary/i.test(cert0) ||
                        cert0.startsWith("res.cloudinary.com")
                      ) {
                        certUrl = cert0.startsWith("//")
                          ? `https:${cert0}`
                          : `https://${cert0}`;

                        if (certUrl && /res\.cloudinary\.com/i.test(certUrl)) {
                          certUrl = certUrl
                            .replace(/(\/raw\/upload\/v\d+\/)uploads\//i, "$1")
                            .replace(/(\/raw\/upload\/)uploads\//i, "$1");
                        }
                      } else if (cert0.includes("/")) {
                        certUrl = `${import.meta.env.VITE_API}/${cert0}`;
                      } else if (cert0) {
                        certUrl = `${
                          import.meta.env.VITE_API
                        }/uploads/certificates/${cert0}`;
                      }

                      // If the certificate fallback is a PDF (Cloudinary raw/pdf), render a PDF card
                      const isCertPdf = !!(
                        certUrl &&
                        (/\.pdf(\?|$)/i.test(certUrl) ||
                          /\/raw\/upload/i.test(certUrl) ||
                          /resource_type=raw/i.test(certUrl) ||
                          /format=pdf/i.test(certUrl) ||
                          /\.pdf\b/i.test(cert0) ||
                          /\bpdf\b/i.test(cert0))
                      );

                      return isCertPdf ? (
                        <div
                          className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => {
                            if (!certUrl) return;
                            try {
                              const pathPart = certUrl.split("?")[0];
                              const parts = pathPart.split("/");
                              // pass basename without forcing extension; helper will append .pdf when Content-Type indicates
                              let name =
                                parts[parts.length - 1] || "certificate";
                              downloadUrlAs(certUrl, name);
                            } catch (e) {
                              window.open(certUrl, "_blank");
                            }
                          }}
                          title="Open PDF"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <svg
                              className="w-6 h-6 text-red-600"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm1 17h-2v-2h2v2zm0-4h-2V5h2v8z" />
                            </svg>
                            <div className="text-xs text-gray-700 dark:text-gray-300">
                              PDF
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={certUrl}
                          alt="2x2 Profile Photo"
                          className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() =>
                            certUrl && window.open(certUrl, "_blank")
                          }
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-image.png";
                          }}
                        />
                      );
                    })()}
                    <div className="absolute -bottom-2 -right-2 bg-gray-700 dark:bg-gray-600 text-white rounded-full p-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="absolute -top-2 -left-2 bg-gray-700 dark:bg-gray-600 text-white rounded-full px-2 py-1 text-xs font-medium shadow-sm">
                      2x2
                    </div>
                  </div>
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center border-2 border-gray-200 dark:border-gray-700 shadow-md">
                    <User className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {selectedApplication.firstName} {selectedApplication.lastName}
                </h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
                      selectedApplication.status
                    )}`}
                  >
                    {getStatusIcon(selectedApplication.status)}
                    {selectedApplication.status.replace("_", " ").toUpperCase()}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                    aria-label="Position"
                  >
                    {selectedApplication.position === "student_assistant"
                      ? "Student Assistant"
                      : "Student Marshal"}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">
                      {selectedApplication.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">
                      Applied: {formatDate(selectedApplication.submittedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab("review")}
                className={`px-4 py-2 font-medium text-sm transition-all ${
                  activeTab === "review"
                    ? "text-red-600 border-b-2 border-red-600"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                Review Application
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-2 font-medium text-sm transition-all ${
                  activeTab === "history"
                    ? "text-red-600 border-b-2 border-red-600"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                Application History
              </button>
            </div>

            {/* Review Tab Content */}
            {activeTab === "review" && (
              <>
                {/* Personal Information */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-3 sm:p-6 mb-4 sm:mb-6 border border-gray-200 dark:border-gray-600">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Age
                      </div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedApplication.age}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Citizenship
                      </div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedApplication.citizenship}
                      </div>
                    </div>

                    {/* New: Gender */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Gender
                      </div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedApplication.gender || (
                          <span className="text-gray-500">No input data</span>
                        )}
                      </div>
                    </div>

                    {/* New: Civil Status */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Civil Status
                      </div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedApplication.civilStatus || (
                          <span className="text-gray-500">No input data</span>
                        )}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Home Address
                      </div>
                      <div className="text-sm text-gray-900 font-semibold dark:text-gray-100 leading-relaxed">
                        {selectedApplication.homeAddress}
                        {selectedApplication.homeStreet &&
                          `, ${selectedApplication.homeStreet}`}
                        <br />
                        {selectedApplication.homeBarangay},{" "}
                        {selectedApplication.homeCity},{" "}
                        {selectedApplication.homeProvince}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Baguio/Benguet Address
                      </div>
                      <div className="text-sm text-gray-900 font-semibold dark:text-gray-100 leading-relaxed">
                        {selectedApplication.baguioAddress}
                        {selectedApplication.baguioStreet &&
                          `, ${selectedApplication.baguioStreet}`}
                        <br />
                        {selectedApplication.baguioBarangay},{" "}
                        {selectedApplication.baguioCity}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parents Information */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-3 sm:p-6 mb-4 sm:mb-6 border border-gray-200 dark:border-gray-600">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    Parents Information
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Father's Information
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Name
                          </div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {selectedApplication.fatherName}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Occupation
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            {selectedApplication.fatherOccupation}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mother's Information
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Name
                          </div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {selectedApplication.motherName}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Occupation
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            {selectedApplication.motherOccupation}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-600">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-gray-600 dark:text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    Emergency Contact
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Contact Person
                      </div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedApplication.emergencyContact}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Contact Number
                      </div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedApplication.emergencyContactNumber}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Relative Information */}
                {selectedApplication.hasRelativeWorking && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                      Relative Working at University
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Name:</span>{" "}
                        {selectedApplication.relatives?.[0]?.name || (
                          <span className="text-gray-500">No input data</span>
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Department:</span>{" "}
                        {selectedApplication.relatives?.[0]?.department || (
                          <span className="text-gray-500">No input data</span>
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Relationship:</span>{" "}
                        {selectedApplication.relatives?.[0]?.relationship || (
                          <span className="text-gray-500">No input data</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Educational Background */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                    Educational Background
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Elementary:</span>{" "}
                      {selectedApplication.elementary ? (
                        <>
                          {selectedApplication.elementary}
                          {selectedApplication.elementaryYears &&
                            ` (${selectedApplication.elementaryYears})`}
                        </>
                      ) : (
                        <span className="text-gray-500">No input data</span>
                      )}
                    </div>

                    <div>
                      <span className="font-medium">High School:</span>{" "}
                      {selectedApplication.highSchool ? (
                        <>
                          {selectedApplication.highSchool}
                          {selectedApplication.highSchoolYears &&
                            ` (${selectedApplication.highSchoolYears})`}
                        </>
                      ) : (
                        <span className="text-gray-500">No input data</span>
                      )}
                    </div>

                    <div>
                      <span className="font-medium">College:</span>{" "}
                      {selectedApplication.college ? (
                        <>
                          {selectedApplication.college}
                          {selectedApplication.collegeYears &&
                            ` (${selectedApplication.collegeYears})`}
                        </>
                      ) : (
                        <span className="text-gray-500">No input data</span>
                      )}
                    </div>

                    <div>
                      <span className="font-medium">Others:</span>{" "}
                      {selectedApplication.others ? (
                        <>
                          {selectedApplication.others}
                          {selectedApplication.othersYears &&
                            ` (${selectedApplication.othersYears})`}
                        </>
                      ) : (
                        <span className="text-gray-500">No input data</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Seminars/Trainings */}
                {selectedApplication.seminars &&
                  selectedApplication.seminars.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                        Seminars/Trainings Attended
                      </h4>
                      <div className="space-y-3">
                        {selectedApplication.seminars.map(
                          (seminar: any, index: number) => (
                            <div
                              key={index}
                              className="border-l-2 border-red-300 pl-3"
                            >
                              <div className="text-sm">
                                <div>
                                  <span className="font-medium">Title:</span>{" "}
                                  {seminar.title}
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Sponsoring Agency:
                                  </span>{" "}
                                  {seminar.sponsoringAgency}
                                </div>
                                <div>
                                  <span className="font-medium">Date:</span>{" "}
                                  {seminar.inclusiveDate}
                                </div>
                                <div>
                                  <span className="font-medium">Place:</span>{" "}
                                  {seminar.place}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Uploaded Documents */}
                {(selectedApplication.profilePhoto ||
                  selectedApplication.idDocument ||
                  selectedApplication.parentID ||
                  (selectedApplication.certificates &&
                    selectedApplication.certificates.length > 0)) && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-3 sm:p-6 mb-4 sm:mb-6 border border-gray-200 dark:border-gray-600">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 sm:mb-6 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Uploaded Certificate
                    </h4>

                    <div className="space-y-4 sm:space-y-6">
                      {/* Certificates */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedApplication.certificates &&
                        selectedApplication.certificates.length > 0 ? (
                          selectedApplication.certificates.map(
                            (cert: string, idx: number) => {
                              let certUrl: string | undefined;
                              const _cert = (cert || "").toString().trim();

                              if (
                                /^https?:\/\//i.test(_cert) ||
                                /^\/\//.test(_cert)
                              ) {
                                certUrl = _cert.startsWith("//")
                                  ? `https:${_cert}`
                                  : _cert;
                              } else if (
                                /cloudinary/i.test(_cert) ||
                                _cert.startsWith("res.cloudinary.com")
                              ) {
                                // cloudinary link stored without protocol
                                certUrl = _cert.startsWith("//")
                                  ? `https:${_cert}`
                                  : `https://${_cert}`;

                                // Normalize Cloudinary raw/upload paths which may include
                                // a redundant 'uploads/' segment in the public_id and
                                // cause 404s (e.g. /raw/upload/v1/uploads/...).
                                if (
                                  certUrl &&
                                  /res\.cloudinary\.com/i.test(certUrl)
                                ) {
                                  certUrl = certUrl
                                    .replace(
                                      /(\/raw\/upload\/v\d+\/)uploads\//i,
                                      "$1"
                                    )
                                    .replace(
                                      /(\/raw\/upload\/)uploads\//i,
                                      "$1"
                                    );
                                }
                              } else if (_cert.includes("/")) {
                                certUrl = `${
                                  import.meta.env.VITE_API
                                }/${_cert}`;
                              } else if (_cert) {
                                certUrl = `${
                                  import.meta.env.VITE_API
                                }/uploads/certificates/${_cert}`;
                              }

                              // Enhanced PDF detection (computed early so click handlers can use it)
                              const isPdf = !!(
                                certUrl &&
                                (/\.pdf(\?|$)/i.test(certUrl) ||
                                  /\/raw\/upload/i.test(certUrl) ||
                                  /resource_type=raw/i.test(certUrl) ||
                                  /format=pdf/i.test(certUrl) ||
                                  /\.pdf\b/i.test(_cert) ||
                                  /\bpdf\b/i.test(_cert))
                              );

                              const handleCardClick = () => {
                                if (!certUrl) return;

                                if (isPdf) {
                                  // For PDFs, trigger download
                                  try {
                                    const pathPart = certUrl.split("?")[0];
                                    const parts = pathPart.split("/");
                                    let name = parts[parts.length - 1];

                                    // If no extension or unclear filename, use default
                                    if (
                                      !name ||
                                      !/\.[a-z0-9]{1,6}$/i.test(name)
                                    ) {
                                      name = `certificate-${idx + 1}.pdf`;
                                    } else if (!/\.pdf$/i.test(name)) {
                                      // If has extension but not .pdf, add .pdf
                                      name = `${name}.pdf`;
                                    }
                                    // @ts-ignore
                                    downloadUrlAs(certUrl, name);
                                  } catch (err) {
                                    window.open(certUrl, "_blank");
                                  }
                                } else {
                                  // For images, open in new tab
                                  window.open(certUrl, "_blank");
                                }
                              };

                              return (
                                <div
                                  key={idx}
                                  className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700 flex flex-col items-stretch"
                                >
                                  <div
                                    className="w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden cursor-pointer flex items-center justify-center"
                                    onClick={handleCardClick}
                                  >
                                    {isPdf ? (
                                      <div className="flex flex-col items-center gap-2">
                                        <svg
                                          className="w-10 h-10 text-red-600"
                                          fill="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm1 17h-2v-2h2v2zm0-4h-2V5h2v8z" />
                                        </svg>
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                          PDF Document
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400 underline">
                                          Download
                                        </div>
                                      </div>
                                    ) : (
                                      <img
                                        src={certUrl}
                                        alt={`Certificate ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (
                                            e.currentTarget as HTMLImageElement
                                          ).src = "/placeholder-image.png";
                                        }}
                                      />
                                    )}
                                  </div>

                                  <div className="mt-2 flex items-center justify-between gap-2">
                                    <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                      Certificate {idx + 1}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {/* Show Open link only for images, not PDFs */}
                                      {!isPdf && (
                                        <a
                                          href={certUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-xs text-gray-600 dark:text-gray-400 underline hover:text-gray-800 dark:hover:text-gray-200"
                                        >
                                          Open
                                        </a>
                                      )}

                                      {/* Download button - works for both PDFs and images */}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (!certUrl) return;
                                          try {
                                            const pathPart =
                                              certUrl.split("?")[0];
                                            const parts = pathPart.split("/");
                                            let name = parts[parts.length - 1];

                                            // If no extension or unclear filename, use default with extension
                                            if (
                                              !name ||
                                              !/\.[a-z0-9]{1,6}$/i.test(name)
                                            ) {
                                              name = isPdf
                                                ? `certificate-${idx + 1}.pdf`
                                                : `certificate-${idx + 1}.jpg`;
                                            } else if (
                                              isPdf &&
                                              !/\.pdf$/i.test(name)
                                            ) {
                                              // If PDF but filename doesn't end with .pdf, add it
                                              name = `${name}.pdf`;
                                            }
                                            // @ts-ignore
                                            downloadUrlAs(certUrl, name);
                                          } catch (err) {
                                            window.open(certUrl, "_blank");
                                          }
                                        }}
                                        className="text-xs text-gray-700 dark:text-gray-300 underline"
                                      >
                                        Download
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          )
                        ) : (
                          <div className="text-sm text-gray-500">
                            No certificates uploaded.
                          </div>
                        )}
                      </div>

                      {/* Parent/Guardian Valid ID */}
                      {selectedApplication.parentID && (
                        <div className="mt-6">
                          <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Parent/Guardian Valid ID
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {(() => {
                              let parentIdUrl: string | undefined;
                              const _parentId = (
                                selectedApplication.parentID || ""
                              )
                                .toString()
                                .trim();

                              if (
                                /^https?:\/\//i.test(_parentId) ||
                                /^\/\//.test(_parentId)
                              ) {
                                parentIdUrl = _parentId.startsWith("//")
                                  ? `https:${_parentId}`
                                  : _parentId;
                              } else if (
                                /cloudinary/i.test(_parentId) ||
                                _parentId.startsWith("res.cloudinary.com")
                              ) {
                                parentIdUrl = _parentId.startsWith("//")
                                  ? `https:${_parentId}`
                                  : `https://${_parentId}`;

                                if (
                                  parentIdUrl &&
                                  /res\.cloudinary\.com/i.test(parentIdUrl)
                                ) {
                                  parentIdUrl = parentIdUrl
                                    .replace(
                                      /(\/raw\/upload\/v\d+\/)uploads\//i,
                                      "$1"
                                    )
                                    .replace(
                                      /(\/raw\/upload\/)uploads\//i,
                                      "$1"
                                    );
                                }
                              } else if (_parentId.includes("/")) {
                                parentIdUrl = `${
                                  import.meta.env.VITE_API
                                }/${_parentId}`;
                              } else if (_parentId) {
                                parentIdUrl = `${
                                  import.meta.env.VITE_API
                                }/uploads/parent-ids/${_parentId}`;
                              }

                              const isPdf = !!(
                                parentIdUrl &&
                                (/\.pdf(\?|$)/i.test(parentIdUrl) ||
                                  /\/raw\/upload/i.test(parentIdUrl) ||
                                  /resource_type=raw/i.test(parentIdUrl) ||
                                  /format=pdf/i.test(parentIdUrl) ||
                                  /\.pdf\b/i.test(_parentId) ||
                                  /\bpdf\b/i.test(_parentId))
                              );

                              const handleCardClick = () => {
                                if (!parentIdUrl) return;

                                if (isPdf) {
                                  // For PDFs, trigger download
                                  try {
                                    const pathPart = parentIdUrl.split("?")[0];
                                    const parts = pathPart.split("/");
                                    let name = parts[parts.length - 1];

                                    // If no extension or unclear filename, use default
                                    if (
                                      !name ||
                                      !/\.[a-z0-9]{1,6}$/i.test(name)
                                    ) {
                                      name = "parent-guardian-id.pdf";
                                    } else if (!/\.pdf$/i.test(name)) {
                                      // If has extension but not .pdf, add .pdf
                                      name = `${name}.pdf`;
                                    }
                                    // @ts-ignore
                                    downloadUrlAs(parentIdUrl, name);
                                  } catch (err) {
                                    window.open(parentIdUrl, "_blank");
                                  }
                                } else {
                                  // For images, open in new tab
                                  window.open(parentIdUrl, "_blank");
                                }
                              };

                              return (
                                <div
                                  key="parent-id"
                                  className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700 flex flex-col items-stretch"
                                >
                                  <div
                                    className="w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden cursor-pointer flex items-center justify-center"
                                    onClick={handleCardClick}
                                  >
                                    {isPdf ? (
                                      <svg
                                        className="w-16 h-16 text-gray-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    ) : (
                                      <img
                                        src={parentIdUrl}
                                        alt="Parent Valid ID"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                          console.error(
                                            "Parent ID image failed to load:",
                                            {
                                              src: e.currentTarget.src,
                                              originalPath:
                                                selectedApplication.parentID,
                                            }
                                          );
                                          e.currentTarget.style.display =
                                            "none";
                                          const parent =
                                            e.currentTarget.parentElement;
                                          if (parent) {
                                            parent.innerHTML = `
                                          <svg class="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                                          </svg>
                                        `;
                                          }
                                        }}
                                      />
                                    )}
                                  </div>
                                  <div className="mt-2 flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      Parent/Guardian ID
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {/* Show Open button only for images */}
                                      {!isPdf && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (parentIdUrl)
                                              window.open(
                                                parentIdUrl,
                                                "_blank"
                                              );
                                          }}
                                          className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 underline"
                                        >
                                          Open
                                        </button>
                                      )}

                                      {/* Download button for both PDFs and images */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (parentIdUrl) {
                                            try {
                                              const pathPart =
                                                parentIdUrl.split("?")[0];
                                              const parts = pathPart.split("/");
                                              let name =
                                                parts[parts.length - 1];

                                              // If no extension or unclear filename, use default with extension
                                              if (
                                                !name ||
                                                !/\.[a-z0-9]{1,6}$/i.test(name)
                                              ) {
                                                name = isPdf
                                                  ? "parent-guardian-id.pdf"
                                                  : "parent-guardian-id.jpg";
                                              } else if (
                                                isPdf &&
                                                !/\.pdf$/i.test(name)
                                              ) {
                                                // If PDF but filename doesn't end with .pdf, add it
                                                name = `${name}.pdf`;
                                              }
                                              // @ts-ignore
                                              downloadUrlAs(parentIdUrl, name);
                                            } catch (err) {
                                              window.open(
                                                parentIdUrl,
                                                "_blank"
                                              );
                                            }
                                          }
                                        }}
                                        className="text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-200 underline"
                                      >
                                        Download
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Electronic Signature */}
                {selectedApplication.signature && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-600">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-gray-600 dark:text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Electronic Signature
                      <span className="ml-auto text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full">
                        Verified
                      </span>
                    </h4>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col items-center">
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 mb-4">
                          <img
                            src={selectedApplication.signature}
                            alt="Electronic Signature"
                            className="max-h-20 mx-auto"
                            style={{ imageRendering: "pixelated" }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="text-sm text-gray-600 dark:text-gray-400 underline hover:text-gray-800 dark:hover:text-gray-200"
                            onClick={async () => {
                              const sig = selectedApplication.signature;
                              if (!sig) return;
                              try {
                                if (sig.startsWith("data:")) {
                                  // data URL: convert to blob then download
                                  const res = await fetch(sig);
                                  const blob = await res.blob();
                                  const blobUrl = URL.createObjectURL(blob);
                                  const name = `signature-${
                                    selectedApplication._id || "sig"
                                  }.png`;
                                  // @ts-ignore
                                  downloadUrlAs(blobUrl, name);
                                  URL.revokeObjectURL(blobUrl);
                                } else {
                                  // remote URL: use download helper which fetches and infers extension
                                  const parts = sig.split("?")[0].split("/");
                                  const name =
                                    parts[parts.length - 1] ||
                                    `signature-${
                                      selectedApplication._id || "sig"
                                    }`;
                                  // @ts-ignore
                                  downloadUrlAs(sig, name);
                                }
                              } catch (err) {
                                window.open(sig, "_blank");
                              }
                            }}
                          >
                            Download Signature
                          </button>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Digitally signed by {selectedApplication.firstName}{" "}
                            {selectedApplication.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Signed on{" "}
                            {formatDate(selectedApplication.submittedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Update Section - Only show for non-failed applications */}
                {selectedApplication.status === "failed_interview" ||
                selectedApplication.status === "rejected" ||
                selectedApplication.status === "withdrawn" ? (
                  /* Read-only view for final status applications */
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-600">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Application Status - Final Decision
                    </h4>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-center p-8">
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            {selectedApplication.status ===
                            "failed_interview" ? (
                              <svg
                                className="w-8 h-8 text-orange-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : selectedApplication.status === "rejected" ? (
                              <svg
                                className="w-8 h-8 text-red-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-8 h-8 text-gray-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                              {selectedApplication.status === "failed_interview"
                                ? "Interview Failed"
                                : selectedApplication.status === "rejected"
                                ? "Application Rejected"
                                : "Application Withdrawn"}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              This application has reached a final decision and
                              cannot be modified further. All information is
                              displayed in read-only mode for record-keeping
                              purposes.
                            </p>
                          </div>
                          {statusUpdateData.hrComments && (
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                HR Comments:
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {statusUpdateData.hrComments}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Status Update Section for active applications */
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-600">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-gray-600 dark:text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Application Status Management
                    </h4>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                      <div className="space-y-6">
                        <div>
                          <Label
                            htmlFor="newStatus"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                          >
                            Update Status
                          </Label>
                          <select
                            id="newStatus"
                            value={statusUpdateData.status}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              setStatusUpdateData((prev) => ({
                                ...prev,
                                status: newStatus,
                                // Clear interview fields if status is not interview_scheduled
                                ...(newStatus !== "interview_scheduled" && {
                                  interviewDate: "",
                                  interviewTime: "",
                                  interviewLocation: "",
                                  interviewNotes: "",
                                }),
                              }));
                            }}
                            aria-label="Update application status"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-gray-100"
                          >
                            {/* Status workflow based on current status */}
                            {selectedApplication.status === "pending" && (
                              <>
                                <option value="pending">
                                  Keep as New Application
                                </option>
                                <option value="under_review">
                                  Continue Review
                                </option>
                                <option value="on_hold">Put on Hold</option>
                                <option value="rejected">
                                  Reject Application
                                </option>
                              </>
                            )}

                            {selectedApplication.status === "under_review" && (
                              <>
                                <option value="under_review">
                                  Continue Review
                                </option>
                                <option value="psychometric_scheduled">
                                  Schedule Psychometric Test
                                </option>
                                <option value="on_hold">Put on Hold</option>
                                <option value="rejected">
                                  Reject Application
                                </option>
                              </>
                            )}

                            {selectedApplication.status ===
                              "psychometric_scheduled" && (
                              <>
                                <option value="psychometric_scheduled">
                                  Keep Test Scheduled
                                </option>
                                <option value="psychometric_completed">
                                  Mark Test as Completed
                                </option>
                                <option value="on_hold">Put on Hold</option>
                                <option value="rejected">
                                  Reject Application
                                </option>
                              </>
                            )}

                            {selectedApplication.status ===
                              "psychometric_completed" && (
                              <>
                                <option value="psychometric_completed">
                                  Keep as Test Completed
                                </option>
                                <option value="psychometric_passed">
                                  Mark Test as Passed
                                </option>
                                <option value="psychometric_failed">
                                  Mark Test as Failed
                                </option>
                                <option value="on_hold">Put on Hold</option>
                                <option value="rejected">
                                  Reject Application
                                </option>
                              </>
                            )}

                            {selectedApplication.status ===
                              "psychometric_passed" && (
                              <>
                                <option value="psychometric_passed">
                                  Keep as Test Passed
                                </option>
                                <option value="interview_scheduled">
                                  Schedule Interview
                                </option>
                                <option value="on_hold">Put on Hold</option>
                                <option value="rejected">
                                  Reject Application
                                </option>
                              </>
                            )}

                            {selectedApplication.status ===
                              "psychometric_failed" && (
                              <>
                                <option value="psychometric_failed">
                                  Keep as Test Failed
                                </option>
                                <option value="psychometric_scheduled">
                                  Reschedule Test
                                </option>
                                <option value="rejected">
                                  Reject Application
                                </option>
                              </>
                            )}

                            {selectedApplication.status ===
                              "interview_scheduled" && (
                              <>
                                <option value="interview_scheduled">
                                  Keep Interview Scheduled
                                </option>
                                <option value="interview_completed">
                                  Mark Interview as Completed
                                </option>
                                <option value="on_hold">Put on Hold</option>
                                <option value="rejected">
                                  Reject Application
                                </option>
                              </>
                            )}

                            {selectedApplication.status ===
                              "interview_completed" && (
                              <>
                                <option value="interview_completed">
                                  Keep as Interview Completed
                                </option>
                                <option value="interview_passed">
                                  Mark Interview as Passed
                                </option>
                                <option value="interview_failed">
                                  Mark Interview as Failed
                                </option>
                                <option value="on_hold">Put on Hold</option>
                                <option value="rejected">
                                  Reject Application
                                </option>
                              </>
                            )}

                            {selectedApplication.status ===
                              "interview_passed" && (
                              <>
                                <option value="interview_passed">
                                  Keep as Interview Passed
                                </option>
                                <option value="trainee">Set as Trainee</option>
                                <option value="on_hold">Put on Hold</option>
                                <option value="rejected">
                                  Reject Application
                                </option>
                              </>
                            )}

                            {selectedApplication.status ===
                              "interview_failed" && (
                              <>
                                <option value="interview_failed">
                                  Keep as Interview Failed
                                </option>
                                <option value="interview_scheduled">
                                  Reschedule Interview
                                </option>
                                <option value="rejected">
                                  Reject Application
                                </option>
                              </>
                            )}

                            {selectedApplication.status === "trainee" && (
                              <>
                                <option value="trainee">Keep as Trainee</option>
                                <option value="training_completed">
                                  Mark Training as Completed
                                </option>
                                <option value="on_hold">Put on Hold</option>
                                <option value="rejected">
                                  Reject Application
                                </option>
                              </>
                            )}

                            {selectedApplication.status ===
                              "training_completed" && (
                              <>
                                <option value="training_completed">
                                  Keep as Training Completed
                                </option>
                                <option value="accepted">
                                  Accept Applicant
                                </option>
                                <option value="on_hold">Put on Hold</option>
                                <option value="rejected">
                                  Reject Application
                                </option>
                              </>
                            )}

                            {selectedApplication.status === "accepted" && (
                              <option value="accepted">Already Accepted</option>
                            )}

                            {selectedApplication.status === "on_hold" && (
                              <>
                                <option value="on_hold">Keep on Hold</option>
                                <option value="under_review">
                                  Resume Review
                                </option>
                                <option value="interview_scheduled">
                                  Schedule Interview
                                </option>
                                <option value="rejected">
                                  Reject Application
                                </option>
                              </>
                            )}

                            {(selectedApplication.status === "rejected" ||
                              selectedApplication.status === "withdrawn") && (
                              <option value={selectedApplication.status}>
                                {selectedApplication.status === "rejected"
                                  ? "Already Rejected"
                                  : "Withdrawn by Applicant"}
                              </option>
                            )}
                          </select>

                          {/* Show specific guidance messages based on current status */}
                          {selectedApplication.status === "pending" && (
                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="flex items-start gap-2">
                                <svg
                                  className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                  <p className="font-medium">New Application</p>
                                  <p className="mt-1">
                                    Review the application details and move to
                                    "Continue Review" when ready to proceed.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {selectedApplication.status === "under_review" && (
                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="flex items-start gap-2">
                                <svg
                                  className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                  <p className="font-medium">Under Review</p>
                                  <p className="mt-1">
                                    If the application meets requirements,
                                    schedule a psychometric test. Otherwise, put
                                    on hold or reject.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {selectedApplication.status ===
                            "psychometric_scheduled" && (
                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="flex items-start gap-2">
                                <svg
                                  className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                  <p className="font-medium">
                                    Psychometric Test Scheduled
                                  </p>
                                  <p className="mt-1">
                                    After the test is completed, mark as
                                    completed to evaluate results.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {selectedApplication.status ===
                            "psychometric_completed" && (
                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="flex items-start gap-2">
                                <svg
                                  className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                  <p className="font-medium">Test Completed</p>
                                  <p className="mt-1">
                                    Review the test results and mark as passed
                                    or failed.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {selectedApplication.status ===
                            "psychometric_passed" && (
                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="flex items-start gap-2">
                                <svg
                                  className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                  <p className="font-medium">Test Passed</p>
                                  <p className="mt-1">
                                    Applicant passed the psychometric test.
                                    Schedule an interview to proceed.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {selectedApplication.status ===
                            "interview_scheduled" && (
                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="flex items-start gap-2">
                                <svg
                                  className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                  <p className="font-medium">
                                    Interview Scheduled
                                  </p>
                                  <p className="mt-1">
                                    After conducting the interview, mark as
                                    passed or failed based on performance.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {selectedApplication.status ===
                            "interview_passed" && (
                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="flex items-start gap-2">
                                <svg
                                  className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                  <p className="font-medium">
                                    Interview Passed
                                  </p>
                                  <p className="mt-1">
                                    Applicant passed the interview. Set as
                                    trainee to begin their training period.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {selectedApplication.status === "trainee" && (
                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="flex items-start gap-2">
                                <svg
                                  className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                  <p className="font-medium">Trainee</p>
                                  <p className="mt-1">
                                    Trainee is completing their required hours.
                                    Mark as completed when they finish training.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {selectedApplication.status ===
                            "training_completed" && (
                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="flex items-start gap-2">
                                <svg
                                  className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                  <p className="font-medium">Hours Completed</p>
                                  <p className="mt-1">
                                    Student has completed their required hours
                                    and is ready to be accepted.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {selectedApplication.status ===
                            "failed_interview" && (
                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="flex items-start gap-2">
                                <svg
                                  className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                  <p className="font-medium">
                                    Interview Failed
                                  </p>
                                  <p className="mt-1">
                                    You can give the applicant another chance by
                                    rescheduling or reject the application.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {selectedApplication.status === "on_hold" && (
                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="flex items-start gap-2">
                                <svg
                                  className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                                  <p className="font-medium">
                                    Application On Hold
                                  </p>
                                  <p className="mt-1">
                                    Resume review when ready or proceed to
                                    schedule interview if already reviewed.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {(selectedApplication.status === "accepted" ||
                            selectedApplication.status === "rejected" ||
                            selectedApplication.status === "withdrawn") && (
                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                              <div className="flex items-start gap-2">
                                <svg
                                  className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                  <p className="font-medium">Final Status</p>
                                  <p className="mt-1">
                                    This application has reached its final
                                    status and cannot be modified further.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <Label
                            htmlFor="hrComments"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
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
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-gray-100"
                            placeholder="Add any comments or notes about this application..."
                          />
                        </div>

                        {/* Show message when psychometric test is scheduled (but not completed yet) */}
                        {(selectedApplication.psychometricTestDate ||
                          selectedApplication.psychometricTestTime ||
                          selectedApplication.psychometricTestLocation) &&
                          selectedApplication.status ===
                            "psychometric_scheduled" && (
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                              <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                <svg
                                  className="w-5 h-5 text-gray-600 dark:text-gray-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Psychometric Test Already Scheduled
                              </h5>
                              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <div className="space-y-3">
                                  {selectedApplication.psychometricTestDate && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-700 dark:text-gray-300">
                                        📅 Date:
                                      </span>
                                      <span className="text-gray-900 dark:text-gray-100">
                                        {new Date(
                                          selectedApplication.psychometricTestDate
                                        ).toLocaleDateString("en-US", {
                                          weekday: "long",
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                        })}
                                      </span>
                                    </div>
                                  )}
                                  {selectedApplication.psychometricTestTime && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-700 dark:text-gray-300">
                                        🕐 Time:
                                      </span>
                                      <span className="text-gray-900 dark:text-gray-100">
                                        {new Date(
                                          `2000-01-01T${selectedApplication.psychometricTestTime}`
                                        ).toLocaleTimeString("en-US", {
                                          hour: "numeric",
                                          minute: "2-digit",
                                          hour12: true,
                                        })}
                                      </span>
                                    </div>
                                  )}
                                  {selectedApplication.psychometricTestLocation && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-700 dark:text-gray-300">
                                        📍 Location:
                                      </span>
                                      <span className="text-gray-900 dark:text-gray-100">
                                        {
                                          selectedApplication.psychometricTestLocation
                                        }
                                      </span>
                                    </div>
                                  )}
                                  {selectedApplication.psychometricTestWhatToBring && (
                                    <div className="flex items-start gap-2">
                                      <span className="font-medium text-gray-700 dark:text-gray-300">
                                        🎒 What to Bring:
                                      </span>
                                      <span className="text-gray-900 dark:text-gray-100">
                                        {
                                          selectedApplication.psychometricTestWhatToBring
                                        }
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="mt-4 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-start gap-2">
                                  <svg
                                    className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <div className="text-sm text-gray-700 dark:text-gray-300">
                                    <p className="font-medium">
                                      Psychometric Test Information
                                    </p>
                                    <p className="mt-1">
                                      A psychometric test has already been
                                      scheduled for this application. The test
                                      notification email has been sent to the
                                      applicant.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                        {/* Psychometric Test Scheduling Section - Only show when psychometric_scheduled is selected AND no test is already scheduled */}
                        {statusUpdateData.status === "psychometric_scheduled" &&
                          !selectedApplication.psychometricTestDate &&
                          !selectedApplication.psychometricTestTime &&
                          !selectedApplication.psychometricTestLocation && (
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                              <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                <svg
                                  className="w-5 h-5 text-gray-600 dark:text-gray-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Psychometric Test Scheduling Details
                              </h5>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <Label
                                    htmlFor="psychometricTestDate"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                                  >
                                    Test Date *
                                  </Label>
                                  <input
                                    type="date"
                                    id="psychometricTestDate"
                                    value={
                                      statusUpdateData.psychometricTestDate
                                    }
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={(e) =>
                                      setStatusUpdateData((prev) => ({
                                        ...prev,
                                        psychometricTestDate: e.target.value,
                                      }))
                                    }
                                    aria-label="Psychometric test date"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-800 dark:text-gray-100"
                                    required
                                  />
                                </div>

                                <div>
                                  <Label
                                    htmlFor="psychometricTestTime"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                                  >
                                    Test Time *
                                  </Label>
                                  <input
                                    type="time"
                                    id="psychometricTestTime"
                                    value={
                                      statusUpdateData.psychometricTestTime
                                    }
                                    onChange={(e) =>
                                      setStatusUpdateData((prev) => ({
                                        ...prev,
                                        psychometricTestTime: e.target.value,
                                      }))
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-800 dark:text-gray-100"
                                    min="08:00"
                                    max="17:00"
                                    title="Select a time between 08:00 and 17:00"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="mb-4">
                                <Label
                                  htmlFor="psychometricTestLocation"
                                  className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                                >
                                  Test Location *
                                </Label>
                                <input
                                  type="text"
                                  id="psychometricTestLocation"
                                  value={
                                    statusUpdateData.psychometricTestLocation
                                  }
                                  onChange={(e) =>
                                    setStatusUpdateData((prev) => ({
                                      ...prev,
                                      psychometricTestLocation: e.target.value,
                                    }))
                                  }
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-800 dark:text-gray-100"
                                  placeholder="e.g., Testing Center, Room 301, Main Building"
                                  required
                                />
                              </div>

                              <div className="mb-4">
                                <Label
                                  htmlFor="psychometricTestWhatToBring"
                                  className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                                >
                                  What to Bring *
                                </Label>
                                <input
                                  type="text"
                                  id="psychometricTestWhatToBring"
                                  list="psychometricWhatToBringList"
                                  value={
                                    statusUpdateData.psychometricTestWhatToBring
                                  }
                                  onChange={(e) =>
                                    setStatusUpdateData((prev) => ({
                                      ...prev,
                                      psychometricTestWhatToBring:
                                        e.target.value,
                                    }))
                                  }
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-800 dark:text-gray-100"
                                  placeholder="e.g., Valid ID, Pencil, Eraser, Calculator (if needed)..."
                                  required
                                />
                                <datalist id="psychometricWhatToBringList">
                                  {uniquePsychometricWhatToBring.map(
                                    (value: string, index: number) => (
                                      <option key={index} value={value} />
                                    )
                                  )}
                                </datalist>
                              </div>

                              {/* Test Email Preview */}
                              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <h6 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                                  <svg
                                    className="w-4 h-4 text-gray-600 dark:text-gray-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                  </svg>
                                  Email Preview - Psychometric Test Notification
                                </h6>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                  <div className="text-sm">
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                                      Subject: Psychometric Test Scheduled -{" "}
                                      {selectedApplication?.position ===
                                      "student_assistant"
                                        ? "Student Assistant"
                                        : "Student Marshal"}{" "}
                                      Scholarship
                                    </p>
                                    <div className="mt-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                      <p>
                                        Dear {selectedApplication?.firstName}{" "}
                                        {selectedApplication?.lastName},
                                      </p>
                                      <p className="mt-2">
                                        Congratulations! Your application for
                                        the{" "}
                                        {selectedApplication?.position ===
                                        "student_assistant"
                                          ? "Student Assistant"
                                          : "Student Marshal"}{" "}
                                        scholarship has been reviewed and we
                                        would like to invite you for a
                                        psychometric test.
                                      </p>

                                      <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded border-l-4 border-blue-400 dark:border-blue-600">
                                        <p className="font-semibold text-blue-800 dark:text-blue-200 text-lg mb-3">
                                          📋 Psychometric Test Details:
                                        </p>
                                        <div className="space-y-2">
                                          <p>
                                            <strong>📆 Date:</strong>{" "}
                                            {statusUpdateData.psychometricTestDate
                                              ? new Date(
                                                  statusUpdateData.psychometricTestDate
                                                ).toLocaleDateString("en-US", {
                                                  weekday: "long",
                                                  year: "numeric",
                                                  month: "long",
                                                  day: "numeric",
                                                })
                                              : "[Date not set]"}
                                          </p>
                                          <p>
                                            <strong>🕐 Time:</strong>{" "}
                                            {statusUpdateData.psychometricTestTime
                                              ? new Date(
                                                  `2000-01-01T${statusUpdateData.psychometricTestTime}`
                                                ).toLocaleTimeString("en-US", {
                                                  hour: "numeric",
                                                  minute: "2-digit",
                                                  hour12: true,
                                                })
                                              : "[Time not set]"}
                                          </p>
                                          <p>
                                            <strong>📍 Location:</strong>{" "}
                                            {statusUpdateData.psychometricTestLocation ||
                                              "[Location not set]"}
                                          </p>
                                          <p>
                                            <strong>👤 Scholarship:</strong>{" "}
                                            {selectedApplication?.position ===
                                            "student_assistant"
                                              ? "Student Assistant"
                                              : "Student Marshal"}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded border-l-4 border-gray-400 dark:border-gray-600">
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                                          💼 What to Bring:
                                        </p>
                                        <p className="mt-1 text-sm whitespace-pre-line">
                                          {statusUpdateData.psychometricTestWhatToBring ||
                                            "[Not specified]"}
                                        </p>
                                      </div>

                                      <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded border-l-4 border-gray-400 dark:border-gray-600">
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                                          ℹ️ Test Information:
                                        </p>
                                        <ul className="mt-1 space-y-1 text-sm">
                                          <li>
                                            • Please arrive 15 minutes early
                                          </li>
                                          <li>
                                            • The test will last approximately
                                            30-45 minutes
                                          </li>
                                          <li>
                                            • Dress code: Business casual or
                                            formal attire
                                          </li>
                                          <li>
                                            • Be prepared to answer questions
                                            honestly and thoughtfully
                                          </li>
                                        </ul>
                                      </div>

                                      <p className="mt-3">
                                        We look forward to meeting with you at
                                        the scheduled time. If you have any
                                        questions or need to reschedule, please
                                        contact our HR Department immediately at
                                        hr@ub.edu.ph or call us during business
                                        hours.
                                      </p>

                                      <p className="mt-4">
                                        Best regards,
                                        <br />
                                        <strong>HR Department</strong>
                                        <br />
                                        University of Baguio
                                        <br />
                                        📞 Phone: [Contact Number]
                                        <br />
                                        📧 Email: hr@ub.edu.ph
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                        {/* Show message when interview is already scheduled */}
                        {(selectedApplication.interviewDate ||
                          selectedApplication.interviewTime ||
                          selectedApplication.interviewLocation) && (
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                            <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                              <svg
                                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Interview Already Scheduled
                            </h5>
                            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                              <div className="space-y-3">
                                {selectedApplication.interviewDate && (
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                      📅 Date:
                                    </span>
                                    <span className="text-gray-900 dark:text-gray-100">
                                      {new Date(
                                        selectedApplication.interviewDate
                                      ).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </span>
                                  </div>
                                )}
                                {selectedApplication.interviewTime && (
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                      🕐 Time:
                                    </span>
                                    <span className="text-gray-900 dark:text-gray-100">
                                      {new Date(
                                        `2000-01-01T${selectedApplication.interviewTime}`
                                      ).toLocaleTimeString("en-US", {
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true,
                                      })}
                                    </span>
                                  </div>
                                )}
                                {selectedApplication.interviewLocation && (
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                      📍 Location:
                                    </span>
                                    <span className="text-gray-900 dark:text-gray-100">
                                      {selectedApplication.interviewLocation}
                                    </span>
                                  </div>
                                )}
                                {selectedApplication.interviewNotes && (
                                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                      📝 Instructions:
                                    </span>
                                    <p className="text-gray-900 dark:text-gray-100 mt-1">
                                      {selectedApplication.interviewNotes}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <svg
                                    className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <div className="text-sm text-gray-700 dark:text-gray-300">
                                    <p className="font-medium">
                                      Interview Information
                                    </p>
                                    <p className="mt-1">
                                      An interview has already been scheduled
                                      for this application. The interview
                                      notification email has been sent to the
                                      applicant.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Interview Scheduling Section - Only show when interview_scheduled is selected AND no interview is already scheduled */}
                        {statusUpdateData.status === "interview_scheduled" &&
                          !selectedApplication.interviewDate &&
                          !selectedApplication.interviewTime &&
                          !selectedApplication.interviewLocation && (
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                              <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                <svg
                                  className="w-5 h-5 text-gray-600 dark:text-gray-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Interview Scheduling Details
                              </h5>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <Label
                                    htmlFor="interviewDate"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                                  >
                                    Interview Date *
                                  </Label>
                                  <input
                                    type="date"
                                    id="interviewDate"
                                    value={statusUpdateData.interviewDate}
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={(e) =>
                                      setStatusUpdateData((prev) => ({
                                        ...prev,
                                        interviewDate: e.target.value,
                                      }))
                                    }
                                    aria-label="Interview date"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-gray-100"
                                    required
                                  />
                                </div>

                                <div>
                                  <Label
                                    htmlFor="interviewTime"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                                  >
                                    Interview Time *
                                  </Label>
                                  <input
                                    type="time"
                                    id="interviewTime"
                                    value={statusUpdateData.interviewTime}
                                    onChange={(e) =>
                                      setStatusUpdateData((prev) => ({
                                        ...prev,
                                        interviewTime: e.target.value,
                                      }))
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-gray-100"
                                    min="08:00"
                                    max="17:00"
                                    title="Select a time between 08:00 and 17:00"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="mb-4">
                                <Label
                                  htmlFor="interviewLocation"
                                  className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                                >
                                  Interview Location *
                                </Label>
                                <input
                                  type="text"
                                  id="interviewLocation"
                                  value={statusUpdateData.interviewLocation}
                                  onChange={(e) =>
                                    setStatusUpdateData((prev) => ({
                                      ...prev,
                                      interviewLocation: e.target.value,
                                    }))
                                  }
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-gray-100"
                                  placeholder="e.g., HR Office, Room 201, Administration Building"
                                  required
                                />
                              </div>

                              <div className="mb-4">
                                <Label
                                  htmlFor="interviewWhatToBring"
                                  className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                                >
                                  What to Bring *
                                </Label>
                                <input
                                  type="text"
                                  id="interviewWhatToBring"
                                  list="interviewWhatToBringList"
                                  value={statusUpdateData.interviewWhatToBring}
                                  onChange={(e) =>
                                    setStatusUpdateData((prev) => ({
                                      ...prev,
                                      interviewWhatToBring: e.target.value,
                                    }))
                                  }
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-gray-100"
                                  placeholder="e.g., Valid ID, Resume, Portfolio (if applicable)..."
                                  required
                                />
                                <datalist id="interviewWhatToBringList">
                                  {uniqueInterviewWhatToBring.map(
                                    (value: string, index: number) => (
                                      <option key={index} value={value} />
                                    )
                                  )}
                                </datalist>
                              </div>

                              <div className="mb-4">
                                <Label
                                  htmlFor="interviewNotes"
                                  className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                                >
                                  Additional Interview Instructions (Optional)
                                </Label>
                                <textarea
                                  id="interviewNotes"
                                  rows={3}
                                  value={statusUpdateData.interviewNotes}
                                  onChange={(e) =>
                                    setStatusUpdateData((prev) => ({
                                      ...prev,
                                      interviewNotes: e.target.value,
                                    }))
                                  }
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-gray-100"
                                  placeholder="e.g., Come 15 minutes early, Prepare for technical questions..."
                                />
                              </div>

                              {/* Interview Email Preview */}
                              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <h6 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                                  <svg
                                    className="w-4 h-4 text-gray-600 dark:text-gray-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                  </svg>
                                  Email Preview - Interview Notification
                                </h6>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                  <div className="text-sm">
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                                      Subject: Interview Scheduled -{" "}
                                      {selectedApplication?.position ===
                                      "student_assistant"
                                        ? "Student Assistant"
                                        : "Student Marshal"}{" "}
                                      Scholarship
                                    </p>
                                    <div className="mt-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                      <p>
                                        Dear {selectedApplication?.firstName}{" "}
                                        {selectedApplication?.lastName},
                                      </p>
                                      <p className="mt-2">
                                        Congratulations! Your application for
                                        the{" "}
                                        {selectedApplication?.position ===
                                        "student_assistant"
                                          ? "Student Assistant"
                                          : "Student Marshal"}{" "}
                                        scholarship has been reviewed and we
                                        would like to invite you for an
                                        interview.
                                      </p>

                                      <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded border-l-4 border-gray-400 dark:border-gray-600">
                                        <p className="font-semibold text-blue-800 dark:text-blue-200 text-lg mb-3">
                                          📅 Interview Details:
                                        </p>
                                        <div className="space-y-2">
                                          <p>
                                            <strong>📆 Date:</strong>{" "}
                                            {statusUpdateData.interviewDate
                                              ? new Date(
                                                  statusUpdateData.interviewDate
                                                ).toLocaleDateString("en-US", {
                                                  weekday: "long",
                                                  year: "numeric",
                                                  month: "long",
                                                  day: "numeric",
                                                })
                                              : "[Date not set]"}
                                          </p>
                                          <p>
                                            <strong>🕐 Time:</strong>{" "}
                                            {statusUpdateData.interviewTime
                                              ? new Date(
                                                  `2000-01-01T${statusUpdateData.interviewTime}`
                                                ).toLocaleTimeString("en-US", {
                                                  hour: "numeric",
                                                  minute: "2-digit",
                                                  hour12: true,
                                                })
                                              : "[Time not set]"}
                                          </p>
                                          <p>
                                            <strong>📍 Location:</strong>{" "}
                                            {statusUpdateData.interviewLocation ||
                                              "[Location not set]"}
                                          </p>
                                          <p>
                                            <strong>👤 Scholarship:</strong>{" "}
                                            {selectedApplication?.position ===
                                            "student_assistant"
                                              ? "Student Assistant"
                                              : "Student Marshal"}
                                          </p>
                                        </div>
                                      </div>

                                      {statusUpdateData.interviewNotes && (
                                        <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded border-l-4 border-gray-400 dark:border-gray-600">
                                          <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                                            📝 Important Instructions:
                                          </p>
                                          <p className="mt-1">
                                            {statusUpdateData.interviewNotes}
                                          </p>
                                        </div>
                                      )}

                                      <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded border-l-4 border-gray-400 dark:border-gray-600">
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                                          💼 What to Bring:
                                        </p>
                                        <p className="mt-1 text-sm whitespace-pre-line">
                                          {statusUpdateData.interviewWhatToBring ||
                                            "[Not specified]"}
                                        </p>
                                      </div>

                                      <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded border-l-4 border-gray-400 dark:border-gray-600">
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                                          ℹ️ Interview Information:
                                        </p>
                                        <ul className="mt-1 space-y-1 text-sm">
                                          <li>
                                            • Please arrive 15 minutes early
                                          </li>
                                          <li>
                                            • The interview will last
                                            approximately 30-45 minutes
                                          </li>
                                          <li>
                                            • Dress code: Business casual or
                                            formal attire
                                          </li>
                                          <li>
                                            • Be prepared to discuss your
                                            qualifications and motivation for
                                            the position
                                          </li>
                                        </ul>
                                      </div>

                                      <p className="mt-3">
                                        We look forward to meeting with you at
                                        the scheduled time. If you have any
                                        questions or need to reschedule, please
                                        contact our HR Department immediately at
                                        hr@ub.edu.ph or call us during business
                                        hours.
                                      </p>

                                      <p className="mt-4">
                                        Best regards,
                                        <br />
                                        <strong>HR Department</strong>
                                        <br />
                                        University of Baguio
                                        <br />
                                        📞 Phone: [Contact Number]
                                        <br />
                                        📧 Email: hr@ub.edu.ph
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* History Tab Content */}
            {activeTab === "history" && (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <ApplicationTimeline timeline={selectedApplication.timeline} />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-600">
              <Button
                variant="outline"
                onClick={() => closeStatusModal()}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-400 hover:bg-gray-500 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
              {/* Only show Update Status button for non-failed applications */}
              {!(
                selectedApplication.status === "failed_interview" ||
                selectedApplication.status === "rejected" ||
                selectedApplication.status === "withdrawn"
              ) && (
                <Button
                  onClick={submitStatusUpdate}
                  disabled={updateStatusMutation.isPending}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {updateStatusMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Updating...
                    </div>
                  ) : statusUpdateData.status === "interview_scheduled" ? (
                    "Schedule Interview & Update Status"
                  ) : (
                    "Update Status"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal for PDFs/Images */}
      {isPreviewOpen && previewBlobUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm1 17h-2v-2h2v2zm0-4h-2V5h2v8z" />
                </svg>
                <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                  {previewFilename || "Preview"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="text-sm text-gray-600 dark:text-gray-400 underline hover:text-gray-800 dark:hover:text-gray-200"
                  onClick={() => {
                    if (!previewBlobUrl) return;
                    // download current preview blob
                    const parts = (previewFilename || "certificate").split(".");
                    let name = parts[0] || "certificate";
                    // @ts-ignore
                    downloadUrlAs(previewBlobUrl, name);
                  }}
                >
                  Download
                </button>
                <button
                  className="text-sm text-gray-600 dark:text-gray-300"
                  onClick={() => {
                    if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
                    setPreviewBlobUrl(null);
                    setPreviewFilename(null);
                    setIsPreviewOpen(false);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
            <div className="h-full bg-gray-50 dark:bg-gray-800">
              <iframe
                title="Document Preview"
                src={previewBlobUrl}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationManagement;
