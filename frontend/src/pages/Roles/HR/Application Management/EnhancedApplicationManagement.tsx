import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/ui/star-rating";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { Timeline } from "@/components/ui/timeline";
import { BulkActionsModal } from "@/components/application/BulkActionsModal";
import { WorkflowProgress } from "@/components/application/WorkflowProgress";
import {
  PsychometricScheduleModal,
  PsychometricScoreModal,
  InterviewScheduleModal,
  InterviewResultModal,
  SetAsTraineeModal,
  UpdateHoursModal,
  AcceptApplicationModal,
  RejectApplicationModal,
} from "@/components/application/WorkflowActionModals";
import {
  FileText,
  User,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  CheckSquare,
  Square,
  Users,
  Star,
  MessageSquare,
  UserPlus,
  Flag,
  Download,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Award,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllApplications,
  updateApplicationStatus,
  assignApplication,
  rateApplication,
  addApplicationNote,
  updateApplicationPriority,
  bulkUpdateApplications,
  schedulePsychometricTest,
  submitPsychometricTestScore,
  scheduleInterview,
  submitInterviewResult,
  setAsTrainee,
  updateTraineeHours,
  acceptApplication,
  rejectApplication,
} from "@/lib/api";
import { useNotificationUpdater } from "@/hooks/useNotificationUpdater";
import HRSidebar from "@/components/sidebar/HR/HRSidebar";
import OfficeSidebar from "@/components/sidebar/Office/OfficeSidebar";
import { toast } from "sonner";

const EnhancedApplicationManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { triggerNotificationUpdate } = useNotificationUpdater();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Filters and pagination
  const [filters, setFilters] = useState({
    status: "",
    position: "",
    priority: "",
    assignedTo: "",
    minRating: undefined as number | undefined,
    maxRating: undefined as number | undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
    search: "",
    page: 1,
    limit: 10,
  });

  // Bulk selection
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Application detail modal
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "timeline" | "notes">("details");

  // Rating modal
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingData, setRatingData] = useState({ rating: 0, notes: "" });

  // Note modal
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState("");

  // Workflow Modal States
  const [psychoScheduleModal, setPsychoScheduleModal] = useState(false);
  const [psychoScoreModal, setPsychoScoreModal] = useState(false);
  const [interviewScheduleModal, setInterviewScheduleModal] = useState(false);
  const [interviewResultModal, setInterviewResultModal] = useState(false);
  const [traineeModal, setTraineeModal] = useState(false);
  const [hoursModal, setHoursModal] = useState(false);
  const [acceptModal, setAcceptModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [workflowLoading, setWorkflowLoading] = useState(false);

  // HR Staff for assignment
  const [hrStaff, setHRStaff] = useState<any[]>([]);

  useEffect(() => {
    document.title = "Application Management | SASM-IMS";
    // Fetch HR staff for assignment dropdown
    // You'll need to create an endpoint for this
    fetchHRStaff();
  }, []);

  const fetchHRStaff = async () => {
    // Mock data for now - replace with actual API call
    setHRStaff([
      { _id: "1", firstname: "Maria", lastname: "Santos", role: "hr" },
      { _id: "2", firstname: "John", lastname: "Doe", role: "hr" },
      { _id: "3", firstname: "Anna", lastname: "Cruz", role: "office" },
    ]);
  };

  // Fetch applications
  const { data: applicationsData, isLoading } = useQuery({
    queryKey: ["applications", filters],
    queryFn: () => getAllApplications(filters),
    enabled: user?.role === "hr" || user?.role === "office",
  });

  // Mutations
  const assignMutation = useMutation({
    mutationFn: ({ id, assignedTo }: { id: string; assignedTo: string }) =>
      assignApplication(id, assignedTo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const rateMutation = useMutation({
    mutationFn: ({ id, rating, ratingNotes }: { id: string; rating: number; ratingNotes?: string }) =>
      rateApplication(id, rating, ratingNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setShowRatingModal(false);
      setRatingData({ rating: 0, notes: "" });
    },
  });

  const noteMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      addApplicationNote(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setShowNoteModal(false);
      setNoteText("");
    },
  });

  const priorityMutation = useMutation({
    mutationFn: ({ id, priority }: { id: string; priority: string }) =>
      updateApplicationPriority(id, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const bulkMutation = useMutation({
    mutationFn: ({ action, data }: { action: string; data: any }) =>
      bulkUpdateApplications(selectedApplicationIds, action, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setSelectedApplicationIds([]);
      setShowBulkModal(false);
    },
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const toggleSelectAll = () => {
    if (selectedApplicationIds.length === applicationsData?.applications?.length) {
      setSelectedApplicationIds([]);
    } else {
      setSelectedApplicationIds(
        applicationsData?.applications?.map((app: any) => app._id) || []
      );
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedApplicationIds((prev) =>
      prev.includes(id) ? prev.filter((appId) => appId !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action: string, data: any) => {
    await bulkMutation.mutateAsync({ action, data });
  };

  const handleAssign = (appId: string, assignedTo: string) => {
    assignMutation.mutate({ id: appId, assignedTo });
  };

  const handleRating = (appId: string) => {
    setSelectedApplication(
      applicationsData?.applications?.find((app: any) => app._id === appId)
    );
    setShowRatingModal(true);
  };

  const submitRating = () => {
    if (selectedApplication && ratingData.rating > 0) {
      rateMutation.mutate({
        id: selectedApplication._id,
        rating: ratingData.rating,
        ratingNotes: ratingData.notes,
      });
    }
  };

  const handleAddNote = (appId: string) => {
    setSelectedApplication(
      applicationsData?.applications?.find((app: any) => app._id === appId)
    );
    setShowNoteModal(true);
  };

  const submitNote = () => {
    if (selectedApplication && noteText.trim()) {
      noteMutation.mutate({
        id: selectedApplication._id,
        notes: noteText,
      });
    }
  };

  const handlePriorityChange = (appId: string, priority: string) => {
    priorityMutation.mutate({ id: appId, priority });
  };

  const handleViewDetails = (application: any) => {
    setSelectedApplication(application);
    setActiveTab("details");
    setShowDetailModal(true);
  };

  // Workflow Mutation Handlers
  const handlePsychoSchedule = async (data: any) => {
    if (!selectedApplication) return;
    setWorkflowLoading(true);
    try {
      await schedulePsychometricTest(selectedApplication._id, data);
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setPsychoScheduleModal(false);
      toast.success("Psychometric test scheduled!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to schedule test");
    } finally {
      setWorkflowLoading(false);
    }
  };

  const handlePsychoScore = async (data: any) => {
    if (!selectedApplication) return;
    setWorkflowLoading(true);
    try {
      await submitPsychometricTestScore(selectedApplication._id, data);
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setPsychoScoreModal(false);
      toast.success("Test score submitted!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit score");
    } finally {
      setWorkflowLoading(false);
    }
  };

  const handleInterviewSchedule = async (data: any) => {
    if (!selectedApplication) return;
    setWorkflowLoading(true);
    try {
      await scheduleInterview(selectedApplication._id, data);
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setInterviewScheduleModal(false);
      toast.success("Interview scheduled!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to schedule interview");
    } finally {
      setWorkflowLoading(false);
    }
  };

  const handleInterviewResult = async (data: any) => {
    if (!selectedApplication) return;
    setWorkflowLoading(true);
    try {
      await submitInterviewResult(selectedApplication._id, data);
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setInterviewResultModal(false);
      toast.success("Interview result submitted!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit result");
    } finally {
      setWorkflowLoading(false);
    }
  };

  const handleSetTrainee = async (data: any) => {
    if (!selectedApplication) return;
    setWorkflowLoading(true);
    try {
      await setAsTrainee(selectedApplication._id, data);
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setTraineeModal(false);
      toast.success("Set as trainee successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to set as trainee");
    } finally {
      setWorkflowLoading(false);
    }
  };

  const handleUpdateHours = async (data: any) => {
    if (!selectedApplication) return;
    setWorkflowLoading(true);
    try {
      await updateTraineeHours(selectedApplication._id, data);
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setHoursModal(false);
      toast.success("Hours updated!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update hours");
    } finally {
      setWorkflowLoading(false);
    }
  };

  const handleAccept = async (data: any) => {
    if (!selectedApplication) return;
    setWorkflowLoading(true);
    try {
      await acceptApplication(selectedApplication._id, data);
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setAcceptModal(false);
      toast.success("Application accepted!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to accept application");
    } finally {
      setWorkflowLoading(false);
    }
  };

  const handleReject = async (data: any) => {
    if (!selectedApplication) return;
    setWorkflowLoading(true);
    try {
      await rejectApplication(selectedApplication._id, data);
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setRejectModal(false);
      toast.success("Application rejected");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject application");
    } finally {
      setWorkflowLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      under_review: "bg-blue-100 text-blue-800",
      psychometric_scheduled: "bg-indigo-100 text-indigo-800",
      psychometric_completed: "bg-purple-100 text-purple-800",
      psychometric_passed: "bg-green-100 text-green-800",
      psychometric_failed: "bg-red-100 text-red-800",
      interview_scheduled: "bg-purple-100 text-purple-800",
      interview_completed: "bg-blue-100 text-blue-800",
      interview_passed: "bg-green-100 text-green-800",
      interview_failed: "bg-red-100 text-red-800",
      trainee: "bg-teal-100 text-teal-800",
      training_completed: "bg-emerald-100 text-emerald-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      withdrawn: "bg-gray-100 text-gray-800",
      on_hold: "bg-indigo-100 text-indigo-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getWorkflowActions = (application: any) => {
    const actions = [];

    switch (application.status) {
      case "under_review":
        actions.push(
          <Button
            key="schedule-test"
            size="sm"
            onClick={() => {
              setSelectedApplication(application);
              setPsychoScheduleModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Calendar className="h-4 w-4 mr-1" />
            Schedule Test
          </Button>
        );
        break;

      case "psychometric_scheduled":
      case "psychometric_completed":
        actions.push(
          <Button
            key="submit-score"
            size="sm"
            onClick={() => {
              setSelectedApplication(application);
              setPsychoScoreModal(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Submit Score
          </Button>
        );
        break;

      case "psychometric_passed":
        actions.push(
          <Button
            key="schedule-interview"
            size="sm"
            onClick={() => {
              setSelectedApplication(application);
              setInterviewScheduleModal(true);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Calendar className="h-4 w-4 mr-1" />
            Schedule Interview
          </Button>
        );
        break;

      case "interview_scheduled":
      case "interview_completed":
        actions.push(
          <Button
            key="interview-result"
            size="sm"
            onClick={() => {
              setSelectedApplication(application);
              setInterviewResultModal(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Submit Result
          </Button>
        );
        break;

      case "interview_passed":
        actions.push(
          <Button
            key="set-trainee"
            size="sm"
            onClick={() => {
              setSelectedApplication(application);
              setTraineeModal(true);
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Users className="h-4 w-4 mr-1" />
            Set as Trainee
          </Button>
        );
        break;

      case "trainee":
        actions.push(
          <Button
            key="update-hours"
            size="sm"
            onClick={() => {
              setSelectedApplication(application);
              setHoursModal(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Clock className="h-4 w-4 mr-1" />
            Update Hours
          </Button>
        );
        break;

      case "training_completed":
        actions.push(
          <Button
            key="accept"
            size="sm"
            onClick={() => {
              setSelectedApplication(application);
              setAcceptModal(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Award className="h-4 w-4 mr-1" />
            Accept
          </Button>
        );
        break;
    }

    // Reject button available at any stage (except terminal states)
    if (!["accepted", "rejected", "withdrawn"].includes(application.status)) {
      actions.push(
        <Button
          key="reject"
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedApplication(application);
            setRejectModal(true);
          }}
          className="border-red-600 text-red-600 hover:bg-red-50"
        >
          <XCircle className="h-4 w-4 mr-1" />
          Reject
        </Button>
      );
    }

    return actions;
  };

  const renderSidebar = () => {
    return user?.role === "hr" ? (
      <HRSidebar
        currentPage="Application Management"
        onCollapseChange={setIsSidebarCollapsed}
      />
    ) : (
      <OfficeSidebar
        currentPage="Application Management"
        onCollapseChange={setIsSidebarCollapsed}
      />
    );
  };

  // Access control
  if (user?.role !== "hr" && user?.role !== "office") {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100">
        {renderSidebar()}
        <div className="flex-1 pt-16 md:pt-[81px]">
          <div className="p-6 md:p-10 flex items-center justify-center min-h-screen">
            <Card className="max-w-2xl w-full">
              <CardContent className="p-8 text-center">
                <XCircle className="w-20 h-20 mx-auto mb-4 text-red-600" />
                <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
                <p className="text-lg text-gray-600">
                  You don't have permission to access application management.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100">
        {renderSidebar()}
        <div className="flex-1 pt-16 md:pt-[81px]">
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
        className={`flex-1 pt-16 md:pt-[81px] transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Header */}
        <div
          className={`hidden md:flex items-center gap-4 fixed top-0 left-0 z-30 bg-gradient-to-r from-red-600 to-red-700 shadow-lg border-b border-red-200 h-[81px] ${
            isSidebarCollapsed
              ? "md:w-[calc(100%-5rem)] md:ml-20"
              : "md:w-[calc(100%-16rem)] md:ml-64"
          }`}
        >
          <h1 className="text-2xl font-bold text-white ml-4">
            Enhanced Application Management
          </h1>
        </div>

        {/* Main Content */}
        <div className="p-6 md:p-10">
          {/* Filters Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name"
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Status</Label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">New Applications</option>
                    <option value="under_review">Under Review</option>
                    <option value="psychometric_scheduled">Test Scheduled</option>
                    <option value="psychometric_passed">Test Passed</option>
                    <option value="psychometric_failed">Test Failed</option>
                    <option value="interview_scheduled">Interview Scheduled</option>
                    <option value="interview_passed">Interview Passed</option>
                    <option value="interview_failed">Interview Failed</option>
                    <option value="trainee">Trainees</option>
                    <option value="training_completed">Training Complete</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <Label>Priority</Label>
                  <select
                    value={filters.priority}
                    onChange={(e) => handleFilterChange("priority", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <Label>Sort By</Label>
                  <div className="flex gap-2">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md"
                    >
                      <option value="createdAt">Date</option>
                      <option value="rating">Rating</option>
                      <option value="priority">Priority</option>
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleFilterChange(
                          "sortOrder",
                          filters.sortOrder === "asc" ? "desc" : "asc"
                        )
                      }
                    >
                      {filters.sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions Bar */}
          {selectedApplicationIds.length > 0 && (
            <Card className="mb-6 border-2 border-red-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CheckSquare className="h-5 w-5 text-red-600" />
                    <span className="font-semibold">
                      {selectedApplicationIds.length} application
                      {selectedApplicationIds.length > 1 ? "s" : ""} selected
                    </span>
                  </div>
                  <Button
                    onClick={() => setShowBulkModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Bulk Actions
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Applications Table */}
          <Card>
            <CardContent className="p-0">
              {applicationsData?.applications?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3">
                          <button onClick={toggleSelectAll}>
                            {selectedApplicationIds.length ===
                            applicationsData?.applications?.length ? (
                              <CheckSquare className="h-5 w-5 text-red-600" />
                            ) : (
                              <Square className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Applicant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Priority
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Assigned To
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200">
                      {applicationsData.applications.map((app: any) => (
                        <tr
                          key={app._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="px-6 py-4">
                            <button onClick={() => toggleSelect(app._id)}>
                              {selectedApplicationIds.includes(app._id) ? (
                                <CheckSquare className="h-5 w-5 text-red-600" />
                              ) : (
                                <Square className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {app.firstName} {app.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {app.position === "student_assistant"
                                  ? "Student Assistant"
                                  : "Student Marshal"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={app.priority || "medium"}
                              onChange={(e) =>
                                handlePriorityChange(app._id, e.target.value)
                              }
                              className="text-sm border-0 bg-transparent"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                            <PriorityBadge
                              priority={app.priority || "medium"}
                              size="sm"
                            />
                          </td>
                          <td className="px-6 py-4">
                            {app.rating ? (
                              <StarRating
                                rating={app.rating}
                                readonly
                                size="sm"
                                showValue
                              />
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRating(app._id)}
                              >
                                <Star className="h-4 w-4 mr-1" />
                                Rate
                              </Button>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                app.status
                              )}`}
                            >
                              {app.status.replace("_", " ").toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {app.assignedTo ? (
                              <div className="text-sm">
                                {app.assignedTo.firstname} {app.assignedTo.lastname}
                              </div>
                            ) : (
                              <select
                                onChange={(e) =>
                                  handleAssign(app._id, e.target.value)
                                }
                                className="text-sm px-2 py-1 border rounded"
                                defaultValue=""
                              >
                                <option value="">Assign...</option>
                                {hrStaff.map((staff) => (
                                  <option key={staff._id} value={staff._id}>
                                    {staff.firstname} {staff.lastname}
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              {/* Workflow Actions */}
                              {getWorkflowActions(app)}

                              {/* View Details Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(app)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No applications found
                </div>
              )}

              {/* Pagination */}
              {applicationsData?.pagination && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {(filters.page - 1) * filters.limit + 1} to{" "}
                    {Math.min(
                      filters.page * filters.limit,
                      applicationsData.pagination.totalCount
                    )}{" "}
                    of {applicationsData.pagination.totalCount} applications
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!applicationsData.pagination.hasPrevPage}
                      onClick={() => handlePageChange(filters.page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!applicationsData.pagination.hasNextPage}
                      onClick={() => handlePageChange(filters.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bulk Actions Modal */}
      <BulkActionsModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        selectedCount={selectedApplicationIds.length}
        selectedApplications={
          applicationsData?.applications?.filter((app: any) =>
            selectedApplicationIds.includes(app._id)
          ) || []
        }
        onBulkAction={handleBulkAction}
        hrStaff={hrStaff}
      />

      {/* Rating Modal */}
      {showRatingModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Rate Application - {selectedApplication.firstName}{" "}
                {selectedApplication.lastName}
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Rating</Label>
                  <div className="mt-2">
                    <StarRating
                      rating={ratingData.rating}
                      onRatingChange={(rating) =>
                        setRatingData((prev) => ({ ...prev, rating }))
                      }
                      size="lg"
                    />
                  </div>
                </div>
                <div>
                  <Label>Notes (Optional)</Label>
                  <textarea
                    value={ratingData.notes}
                    onChange={(e) =>
                      setRatingData((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    rows={3}
                    placeholder="Add notes about your rating..."
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRatingModal(false);
                      setRatingData({ rating: 0, notes: "" });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submitRating}
                    disabled={ratingData.rating === 0}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Submit Rating
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Add Note - {selectedApplication.firstName}{" "}
                {selectedApplication.lastName}
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Internal Note</Label>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    rows={4}
                    placeholder="Add an internal note about this application..."
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNoteModal(false);
                      setNoteText("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submitNote}
                    disabled={!noteText.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Add Note
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detail Modal with Timeline */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold">
                  {selectedApplication.firstName} {selectedApplication.lastName}
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => setShowDetailModal(false)}
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>

              {/* Workflow Progress */}
              <div className="mb-6">
                <WorkflowProgress currentStatus={selectedApplication.status} />
              </div>

              {/* Tabs */}
              <div className="flex gap-4 mb-6 border-b">
                <button
                  className={`pb-2 px-4 ${
                    activeTab === "details"
                      ? "border-b-2 border-red-600 font-semibold"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("details")}
                >
                  Details
                </button>
                <button
                  className={`pb-2 px-4 ${
                    activeTab === "timeline"
                      ? "border-b-2 border-red-600 font-semibold"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("timeline")}
                >
                  Timeline
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "details" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">Position</Label>
                      <p className="font-medium">
                        {selectedApplication.position === "student_assistant"
                          ? "Student Assistant"
                          : "Student Marshal"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Status</Label>
                      <p>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            selectedApplication.status
                          )}`}
                        >
                          {selectedApplication.status
                            .replace("_", " ")
                            .toUpperCase()}
                        </span>
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Email</Label>
                      <p className="font-medium">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Submitted</Label>
                      <p className="font-medium">
                        {formatDate(selectedApplication.submittedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "timeline" && (
                <div>
                  {selectedApplication.timeline &&
                  selectedApplication.timeline.length > 0 ? (
                    <Timeline entries={selectedApplication.timeline} title="" />
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No activity yet</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Workflow Action Modals */}
      <PsychometricScheduleModal
        isOpen={psychoScheduleModal}
        onClose={() => setPsychoScheduleModal(false)}
        onSubmit={handlePsychoSchedule}
        loading={workflowLoading}
      />

      <PsychometricScoreModal
        isOpen={psychoScoreModal}
        onClose={() => setPsychoScoreModal(false)}
        onSubmit={handlePsychoScore}
        loading={workflowLoading}
      />

      <InterviewScheduleModal
        isOpen={interviewScheduleModal}
        onClose={() => setInterviewScheduleModal(false)}
        onSubmit={handleInterviewSchedule}
        loading={workflowLoading}
      />

      <InterviewResultModal
        isOpen={interviewResultModal}
        onClose={() => setInterviewResultModal(false)}
        onSubmit={handleInterviewResult}
        loading={workflowLoading}
      />

      <SetAsTraineeModal
        isOpen={traineeModal}
        onClose={() => setTraineeModal(false)}
        onSubmit={handleSetTrainee}
        loading={workflowLoading}
        supervisors={hrStaff}
      />

      <UpdateHoursModal
        isOpen={hoursModal}
        onClose={() => setHoursModal(false)}
        onSubmit={handleUpdateHours}
        loading={workflowLoading}
        currentHours={selectedApplication?.completedHours || 0}
        requiredHours={selectedApplication?.requiredHours || 0}
      />

      <AcceptApplicationModal
        isOpen={acceptModal}
        onClose={() => setAcceptModal(false)}
        onSubmit={handleAccept}
        loading={workflowLoading}
        applicantName={
          selectedApplication
            ? `${selectedApplication.firstName} ${selectedApplication.lastName}`
            : ""
        }
      />

      <RejectApplicationModal
        isOpen={rejectModal}
        onClose={() => setRejectModal(false)}
        onSubmit={handleReject}
        loading={workflowLoading}
        applicantName={
          selectedApplication
            ? `${selectedApplication.firstName} ${selectedApplication.lastName}`
            : ""
        }
      />
    </div>
  );
};

export default EnhancedApplicationManagement;
