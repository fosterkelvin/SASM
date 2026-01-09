import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Users,
  Calendar,
  Clock,
  Mail,
  Phone,
  X,
  CheckCircle,
  Star,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOfficeTrainees,
  updateTraineeHoursOffice,
  acceptDeployment,
  rejectDeployment,
} from "@/lib/api";
import OfficeSidebar from "@/components/sidebar/Office/OfficeSidebar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Custom Alert Modal Component
const CustomAlert = ({
  isOpen,
  onClose,
  title,
  message,
  type = "success",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "error" | "warning";
}) => {
  if (!isOpen) return null;

  const icons = {
    success: (
      <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
    ),
    error: <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />,
    warning: (
      <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
    ),
  };

  const bgColors = {
    success: "bg-green-100 dark:bg-green-900/30",
    error: "bg-red-100 dark:bg-red-900/30",
    warning: "bg-yellow-100 dark:bg-yellow-900/30",
  };

  const buttonColors = {
    success: "bg-green-600 hover:bg-green-700",
    error: "bg-red-600 hover:bg-red-700",
    warning: "bg-yellow-600 hover:bg-yellow-700",
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div
                className={`w-12 h-12 rounded-full ${bgColors[type]} flex items-center justify-center`}
              >
                {icons[type]}
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
              className={`${buttonColors[type]} text-white px-6 py-2 rounded-lg font-medium transition-colors`}
            >
              OK
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MyTrainees = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedTrainee, setSelectedTrainee] = useState<any>(null);

  useEffect(() => {
    document.title = "My Trainees | SASM-IMS";
  }, []);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingData, setRatingData] = useState({
    rating: 0,
    notes: "",
  });
  const [hoveredRating, setHoveredRating] = useState(0);

  // Interview workflow states
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [acceptNotes, setAcceptNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Custom alert state
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success" as "success" | "error" | "warning",
  });

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "warning" = "success"
  ) => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  const closeAlert = () => {
    setAlertModal({ isOpen: false, title: "", message: "", type: "success" });
  };

  // Fetch trainees ONLY (not scholars - they have their own page)
  const { data: traineesData, isLoading } = useQuery({
    queryKey: ["office-trainees"],
    queryFn: () => getOfficeTrainees(),
  });

  // Rate trainee mutation
  const rateTraineeMutation = useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string;
      data: any;
    }) => updateTraineeHoursOffice(applicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-trainees"] });
      closeRatingModal();
      showAlert("Success", "Trainee rating submitted successfully!", "success");
    },
    onError: (error: any) => {
      showAlert(
        "Error",
        error.response?.data?.message || "Failed to submit rating",
        "error"
      );
    },
  });

  const closeRatingModal = () => {
    setShowRatingModal(false);
    setSelectedTrainee(null);
    setRatingData({
      rating: 0,
      notes: "",
    });
    setHoveredRating(0);
  };

  const handleRateClick = (trainee: any) => {
    setSelectedTrainee(trainee);
    setRatingData({
      rating: trainee.traineePerformanceRating || 0,
      notes: "",
    });
    setShowRatingModal(true);
  };

  const handleSubmitRating = () => {
    if (!selectedTrainee) return;

    if (ratingData.rating === 0) {
      showAlert(
        "Validation Error",
        "Please select a rating before submitting.",
        "warning"
      );
      return;
    }

    const data = {
      completedHours: selectedTrainee.completedHours || 0, // Keep existing hours
      notes: ratingData.notes,
      traineePerformanceRating: ratingData.rating,
    };

    rateTraineeMutation.mutate({
      applicationId: selectedTrainee._id,
      data,
    });
  };

  // Accept deployment mutation
  const acceptDeploymentMutation = useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string;
      data: any;
    }) => acceptDeployment(applicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-trainees"] });
      setShowAcceptModal(false);
      setSelectedTrainee(null);
      setAcceptNotes("");
      showAlert(
        "Success",
        "Deployment accepted successfully! The trainee has been notified.",
        "success"
      );
    },
    onError: (error: any) => {
      showAlert(
        "Error",
        error.response?.data?.message || "Failed to accept deployment",
        "error"
      );
    },
  });

  // Reject deployment mutation
  const rejectDeploymentMutation = useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string;
      data: any;
    }) => rejectDeployment(applicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-trainees"] });
      setShowRejectModal(false);
      setSelectedTrainee(null);
      setRejectionReason("");
      showAlert(
        "Deployment Rejected",
        "The deployment has been rejected and the trainee has been notified.",
        "warning"
      );
    },
    onError: (error: any) => {
      showAlert(
        "Error",
        error.response?.data?.message || "Failed to reject deployment",
        "error"
      );
    },
  });

  const handleAcceptClick = (trainee: any) => {
    setSelectedTrainee(trainee);
    setShowAcceptModal(true);
  };

  const handleSubmitAccept = () => {
    if (!selectedTrainee) return;

    acceptDeploymentMutation.mutate({
      applicationId: selectedTrainee._id,
      data: { notes: acceptNotes },
    });
  };

  const handleRejectClick = (trainee: any) => {
    setSelectedTrainee(trainee);
    setShowRejectModal(true);
  };

  const handleSubmitReject = () => {
    if (!selectedTrainee) return;

    if (!rejectionReason.trim()) {
      showAlert(
        "Validation Error",
        "Please provide a reason for rejection.",
        "warning"
      );
      return;
    }

    rejectDeploymentMutation.mutate({
      applicationId: selectedTrainee._id,
      data: { rejectionReason },
    });
  };

  const trainees = traineesData?.trainees || [];

  // Filter and search trainees
  const filteredTrainees = trainees.filter((trainee: any) => {
    // Search filter - check name and email
    const searchLower = searchQuery.toLowerCase();
    const fullName =
      `${trainee.userID?.firstname} ${trainee.userID?.lastname}`.toLowerCase();
    const email = trainee.userID?.email?.toLowerCase() || "";
    const matchesSearch =
      fullName.includes(searchLower) || email.includes(searchLower);

    // Status filter
    const matchesStatus =
      statusFilter === "all" || trainee.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
      <OfficeSidebar
        currentPage="My Trainees"
        onCollapseChange={setIsSidebarCollapsed}
      />

      <div
        className={`flex-1 pt-16 md:pt-[81px] transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Fixed Header Bar (Desktop only) */}
        <div
          className={`hidden md:flex items-center gap-4 fixed top-0 left-0 z-30 bg-gradient-to-r from-red-600 to-red-700 h-[81px] ${
            isSidebarCollapsed
              ? "md:w-[calc(100%-5rem)] md:ml-20"
              : "md:w-[calc(100%-16rem)] md:ml-64"
          }`}
        >
          <h1 className="text-2xl font-bold text-white ml-4">My Trainees</h1>
        </div>

        <div className="p-6 md:p-10">
          {/* Search and Filter Controls */}
          <Card className="bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/30 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1">
                  <Label className="text-gray-700 dark:text-gray-300 mb-2 block">
                    Search by Name or Email
                  </Label>
                  <Input
                    type="text"
                    placeholder="Search trainees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Status Filter */}
                <div className="w-full md:w-64">
                  <Label className="text-gray-700 dark:text-gray-300 mb-2 block">
                    Filter by Status
                  </Label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending_office_interview">
                      Pending Interview
                    </option>
                    <option value="office_interview_scheduled">
                      Interview Scheduled
                    </option>
                    <option value="trainee">Active</option>
                    <option value="training_completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Results count */}
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredTrainees.length} of {trainees.length}{" "}
                trainee(s)
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 dark:border-red-400 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading trainees...
              </p>
            </div>
          ) : trainees.length === 0 ? (
            <Card className="bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/30">
              <CardContent className="py-12 text-center">
                <Users className="w-16 h-16 mx-auto text-red-300 dark:text-red-700 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No trainees assigned to your office yet
                </p>
              </CardContent>
            </Card>
          ) : filteredTrainees.length === 0 ? (
            <Card className="bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/30">
              <CardContent className="py-12 text-center">
                <Users className="w-16 h-16 mx-auto text-red-300 dark:text-red-700 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No trainees match your search criteria
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTrainees.map((trainee: any) => (
                <Card
                  key={trainee._id}
                  className="bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/30 hover:shadow-xl hover:shadow-red-100 dark:hover:shadow-red-900/20 transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-xl text-gray-900 dark:text-white mb-2">
                          {trainee.userID?.firstname} {trainee.userID?.lastname}
                        </h3>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="w-4 h-4" />
                            {trainee.userID?.email}
                          </div>
                          {trainee.baguioContact && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Phone className="w-4 h-4" />
                              {trainee.baguioContact}
                            </div>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          trainee.status === "trainee"
                            ? "bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"
                            : trainee.status === "pending_office_interview"
                            ? "bg-yellow-100 text-yellow-700 border border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700"
                            : trainee.status === "office_interview_scheduled"
                            ? "bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                            : "bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {trainee.status === "trainee"
                          ? "Active"
                          : trainee.status === "pending_office_interview"
                          ? "Pending Interview"
                          : trainee.status === "office_interview_scheduled"
                          ? "Interview Scheduled"
                          : "Completed"}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      {trainee.traineeStartDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700 dark:text-gray-300">
                            Started: {formatDate(trainee.traineeStartDate)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Hours Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Hours Progress (from DTR)
                          </span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {trainee.dtrCompletedHours || 0} /{" "}
                          {trainee.requiredHours || 0}
                        </span>
                      </div>
                      <div className="w-full bg-red-100 dark:bg-red-900/20 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 h-3 rounded-full transition-all flex items-center justify-end pr-2"
                          style={{
                            width: `${Math.min(
                              ((trainee.dtrCompletedHours || 0) /
                                (trainee.requiredHours || 1)) *
                                100,
                              100
                            )}%`,
                          }}
                        >
                          {trainee.dtrCompletedHours >=
                            trainee.requiredHours && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {(
                          ((trainee.dtrCompletedHours || 0) /
                            (trainee.requiredHours || 1)) *
                          100
                        ).toFixed(1)}
                        % complete
                      </p>
                    </div>

                    {/* Current Rating Display */}
                    {trainee.traineePerformanceRating && (
                      <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/30">
                        <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400 mb-2">
                          Performance Rating:
                        </p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= trainee.traineePerformanceRating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {trainee.traineePerformanceRating}/5
                          </span>
                        </div>
                      </div>
                    )}

                    {trainee.traineeNotes && (
                      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/30">
                        <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                          Notes:
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {trainee.traineeNotes}
                        </p>
                      </div>
                    )}

                    {/* Pending Interview - Show waiting message (HR schedules interviews now) */}
                    {trainee.status === "pending_office_interview" && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/30">
                        <p className="text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Waiting for HR to schedule interview
                        </p>
                      </div>
                    )}

                    {/* Interview Scheduled - Accept/Reject Buttons */}
                    {trainee.status === "office_interview_scheduled" && (
                      <>
                        {trainee.deploymentInterviewDate && (
                          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
                            <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2">
                              Interview Scheduled by HR:
                            </p>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                📅 {formatDate(trainee.deploymentInterviewDate)} at{" "}
                                {trainee.deploymentInterviewTime}
                              </p>
                              {trainee.deploymentInterviewLocation && (
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  📍 {trainee.deploymentInterviewLocation}
                                </p>
                              )}
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Mode: {trainee.deploymentInterviewMode || "In-person"}
                              </p>
                              {trainee.deploymentInterviewWhatToBring && (
                                <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                    What to Bring:
                                  </p>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {trainee.deploymentInterviewWhatToBring}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAcceptClick(trainee)}
                            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleRejectClick(trainee)}
                            variant="outline"
                            className="flex-1 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </>
                    )}

                    {/* Active Trainee - Rating */}
                    {trainee.status === "trainee" && (
                      <div className="space-y-2">
                        <Button
                          onClick={() =>
                            navigate(`/office/trainee/${trainee._id}/schedule`)
                          }
                          variant="outline"
                          className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 flex items-center justify-center gap-2"
                        >
                          <Calendar className="w-4 h-4" />
                          View Schedule & Add Duty Hours
                        </Button>
                        {trainee.dtrCompletedHours >= trainee.requiredHours && (
                          <Button
                            onClick={() => handleRateClick(trainee)}
                            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white flex items-center justify-center gap-2"
                          >
                            <Star className="w-4 h-4" />
                            {trainee.traineePerformanceRating
                              ? "Update Rating"
                              : "Rate Trainee"}
                          </Button>
                        )}
                        {trainee.dtrCompletedHours < trainee.requiredHours && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Rating available after completing required hours
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Accept Deployment Modal */}
      {showAcceptModal && selectedTrainee && (
        <div className="fixed inset-0 bg-gray-900/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-green-200 dark:border-green-800 p-6 w-full max-w-md relative">
            <button
              onClick={() => {
                setShowAcceptModal(false);
                setSelectedTrainee(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>

            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-6">
              Accept Deployment
            </h2>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Trainee
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {selectedTrainee.userID?.firstname}{" "}
                {selectedTrainee.userID?.lastname}
              </p>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to accept this trainee deployment? They will
              start their training with your office.
            </p>

            <div>
              <Label htmlFor="accept-notes">Additional Notes (Optional)</Label>
              <Textarea
                id="accept-notes"
                rows={3}
                value={acceptNotes}
                onChange={(e) => setAcceptNotes(e.target.value)}
                placeholder="Any welcome message or instructions..."
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAcceptModal(false);
                  setSelectedTrainee(null);
                }}
                className="border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitAccept}
                disabled={acceptDeploymentMutation.isPending}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
              >
                {acceptDeploymentMutation.isPending
                  ? "Accepting..."
                  : "Accept Deployment"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Deployment Modal */}
      {showRejectModal && selectedTrainee && (
        <div className="fixed inset-0 bg-gray-900/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-red-200 dark:border-red-800 p-6 w-full max-w-md relative">
            <button
              onClick={() => {
                setShowRejectModal(false);
                setSelectedTrainee(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>

            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-6">
              Reject Deployment
            </h2>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Trainee
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {selectedTrainee.userID?.firstname}{" "}
                {selectedTrainee.userID?.lastname}
              </p>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Please provide a reason for rejecting this deployment. The trainee
              will be returned to HR for reassignment.
            </p>

            <div>
              <Label htmlFor="reject-reason">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reject-reason"
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please explain why this deployment is not suitable..."
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedTrainee(null);
                }}
                className="border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReject}
                disabled={rejectDeploymentMutation.isPending}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
              >
                {rejectDeploymentMutation.isPending
                  ? "Rejecting..."
                  : "Reject Deployment"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rate Trainee Modal */}
      {showRatingModal && selectedTrainee && (
        <div className="fixed inset-0 bg-gray-900/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-red-200 dark:border-red-800 p-6 w-full max-w-md relative">
            {/* Close Button */}
            <button
              onClick={closeRatingModal}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>

            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-6">
              Rate Trainee Performance
            </h2>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Trainee
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {selectedTrainee.userID?.firstname}{" "}
                {selectedTrainee.userID?.lastname}
              </p>
            </div>

            {/* Hours Progress Info */}
            <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Training Progress (from DTR)
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedTrainee.dtrCompletedHours || 0} /{" "}
                {selectedTrainee.requiredHours || 0} hours completed
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      ((selectedTrainee.dtrCompletedHours || 0) /
                        (selectedTrainee.requiredHours || 1)) *
                        100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="mb-3 block">
                  Performance Rating <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setRatingData({ ...ratingData, rating: star })
                      }
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          star <= (hoveredRating || ratingData.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {ratingData.rating > 0 && (
                  <p className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    {ratingData.rating === 1 && "Poor"}
                    {ratingData.rating === 2 && "Fair"}
                    {ratingData.rating === 3 && "Good"}
                    {ratingData.rating === 4 && "Very Good"}
                    {ratingData.rating === 5 && "Excellent"}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Additional Comments (Optional)</Label>
                <textarea
                  id="notes"
                  rows={3}
                  value={ratingData.notes}
                  onChange={(e) =>
                    setRatingData({
                      ...ratingData,
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                  placeholder="Share your feedback on the trainee's performance..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button
                variant="outline"
                onClick={closeRatingModal}
                className="border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRating}
                disabled={rateTraineeMutation.isPending}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
              >
                {rateTraineeMutation.isPending
                  ? "Submitting..."
                  : "Submit Rating"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Modal */}
      <CustomAlert
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
};

export default MyTrainees;
