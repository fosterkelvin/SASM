import { useQuery } from "@tanstack/react-query";
import { getUserApplications, getUserReApplications } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Clock,
  FileText,
  User,
  AlertCircle,
  XCircle,
  FileCheck,
  Calendar,
  MapPin,
  Briefcase,
} from "lucide-react";

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
    case "under_review":
      return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
    case "approved":
      return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
    case "interview_scheduled":
      return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800";
    case "psychometric_scheduled":
      return "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800";
    case "passed_interview":
      return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800";
    case "hours_completed":
      return "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800";
    case "accepted":
      return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
    case "rejected":
      return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    case "withdrawn":
      return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
    case "on_hold":
      return "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
    case "accepted":
    case "passed_interview":
      return <CheckCircle className="h-5 w-5" />;
    case "hours_completed":
      return <FileCheck className="h-5 w-5" />;
    case "pending":
    case "on_hold":
      return <Clock className="h-5 w-5" />;
    case "under_review":
      return <FileText className="h-5 w-5" />;
    case "interview_scheduled":
      return <User className="h-5 w-5" />;
    case "psychometric_scheduled":
      return <FileCheck className="h-5 w-5" />;
    case "rejected":
      return <XCircle className="h-5 w-5" />;
    case "withdrawn":
      return <AlertCircle className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: "Pending",
    under_review: "Under Review",
    approved: "Approved",
    interview_scheduled: "Interview Scheduled",
    psychometric_scheduled: "Psychometric Test Scheduled",
    passed_interview: "Passed Interview",
    hours_completed: "Hours Completed",
    accepted: "Accepted",
    rejected: "Rejected",
    withdrawn: "Withdrawn",
    on_hold: "On Hold",
  };
  return labels[status] || status.replace(/_/g, " ");
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ApplicationStatusWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is a reapplicant specifically
  const isReapplicant =
    user?.status === "reapplicant" || user?.status === "Re-Applicant";

  // Check if user is a scholar (SA, SM, active status)
  const isScholar =
    user?.status === "SA" || user?.status === "SM" || user?.status === "active";

  const { data: userApplicationsData, isLoading: isLoadingApplications } =
    useQuery({
      queryKey: ["userApplications"],
      queryFn: getUserApplications,
      enabled: !!user && !isScholar && !isReapplicant, // Only fetch applications if not a scholar or reapplicant
    });

  const { data: userReApplicationsData, isLoading: isLoadingReApplications } =
    useQuery({
      queryKey: ["userReApplications"],
      queryFn: getUserReApplications,
      enabled: !!user && isReapplicant, // Only fetch re-applications if user is a reapplicant
    });

  const isLoading = isLoadingApplications || isLoadingReApplications;

  // Find the most recent application or re-application based on user status
  const latestApplication = isReapplicant
    ? userReApplicationsData?.reApplications?.[0]
    : userApplicationsData?.applications?.[0];

  // Don't show the widget at all for scholars (only show for students and reapplicants)
  if (isScholar) {
    return null;
  }

  // Check if status has scheduled details
  const hasInterviewDetails =
    latestApplication?.status === "interview_scheduled" &&
    (latestApplication?.interviewDate ||
      latestApplication?.interviewTime ||
      latestApplication?.interviewLocation);

  const hasPsychometricDetails =
    latestApplication?.status === "psychometric_scheduled" &&
    (latestApplication?.psychometricTestDate ||
      latestApplication?.psychometricTestTime ||
      latestApplication?.psychometricTestLocation);

  const formatScheduleDateTime = (date: string, time: string) => {
    if (!date) return "Not specified";
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return time ? `${formattedDate} at ${time}` : formattedDate;
  };

  if (isLoading) {
    return (
      <div className="mb-6 max-w-2xl">
        <Card className="border-red-200 dark:border-red-800/60 bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-gray-800 dark:text-white">
              {isReapplicant ? "Reapplication Status" : "Application Status"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!latestApplication) {
    return (
      <div className="mb-6 max-w-2xl">
        <Card className="border-red-200 dark:border-red-800/60 bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-gray-800 dark:text-white">
              {isReapplicant ? "Reapplication Status" : "Application Status"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center py-4">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {isReapplicant
                  ? "You haven't submitted a re-application yet."
                  : "You haven't submitted an application yet."}
              </p>
              <Button
                onClick={() =>
                  navigate(isReapplicant ? "/re-apply" : "/application")
                }
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isReapplicant ? "Re-apply Now" : "Apply Now"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-6 max-w-2xl">
      <Card className="pb-4 border-red-200 dark:border-red-800/60 shadow-lg bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-gray-800 dark:text-white">
            {isReapplicant ? "Reapplication Status" : "Application Status"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {/* Requirements Warning Banner - Show for pending applications without completed requirements (non-reapplicants only) */}
          {!isReapplicant &&
            latestApplication.status === "pending" &&
            !latestApplication.requirementsCompleted && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 dark:border-amber-600 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-amber-900 dark:text-amber-200 mb-1">
                      ⚠️ Action Required: Complete Your Requirements
                    </h3>
                    <p className="text-xs text-amber-800 dark:text-amber-300 mb-2">
                      Your application will not be processed until all required
                      documents are submitted.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => navigate("/requirements")}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8"
                    >
                      Upload Requirements Now
                    </Button>
                  </div>
                </div>
              </div>
            )}

          {/* Status Badge */}
          <div
            className={`flex items-center gap-2 p-3 rounded-lg border-2 ${getStatusColor(
              latestApplication.status
            )}`}
          >
            {getStatusIcon(latestApplication.status)}
            <div className="flex-1">
              <p className="font-semibold text-sm">
                {getStatusLabel(latestApplication.status)}
              </p>
              {!isScholar && (
                <p className="text-xs opacity-80">
                  {latestApplication.position === "student_assistant"
                    ? "Student Assistant"
                    : "Student Marshal"}
                </p>
              )}
            </div>
          </div>

          {/* Interview/Psychometric Details */}
          {hasInterviewDetails && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-lg p-3">
              <h3 className="font-semibold text-sm text-purple-900 dark:text-purple-200 mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Interview Details
              </h3>
              <div className="space-y-2">
                {(latestApplication.interviewDate ||
                  latestApplication.interviewTime) && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">
                        Date & Time:
                      </p>
                      <p className="font-semibold text-sm text-gray-800 dark:text-white">
                        {formatScheduleDateTime(
                          latestApplication.interviewDate,
                          latestApplication.interviewTime
                        )}
                      </p>
                    </div>
                  </div>
                )}
                {latestApplication.interviewLocation && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">
                        Location:
                      </p>
                      <p className="font-semibold text-sm text-gray-800 dark:text-white">
                        {latestApplication.interviewLocation}
                      </p>
                    </div>
                  </div>
                )}
                {latestApplication.interviewWhatToBring && (
                  <div className="flex items-start gap-2">
                    <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">
                        What to Bring:
                      </p>
                      <p className="font-semibold text-sm text-gray-800 dark:text-white">
                        {latestApplication.interviewWhatToBring}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {hasPsychometricDetails && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-300 dark:border-indigo-700 rounded-lg p-3">
              <h3 className="font-semibold text-sm text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                Psychometric Test Details
              </h3>
              <div className="space-y-2">
                {(latestApplication.psychometricTestDate ||
                  latestApplication.psychometricTestTime) && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">
                        Date & Time:
                      </p>
                      <p className="font-semibold text-sm text-gray-800 dark:text-white">
                        {formatScheduleDateTime(
                          latestApplication.psychometricTestDate,
                          latestApplication.psychometricTestTime
                        )}
                      </p>
                    </div>
                  </div>
                )}
                {latestApplication.psychometricTestLocation && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">
                        Location:
                      </p>
                      <p className="font-semibold text-sm text-gray-800 dark:text-white">
                        {latestApplication.psychometricTestLocation}
                      </p>
                    </div>
                  </div>
                )}
                {latestApplication.psychometricTestWhatToBring && (
                  <div className="flex items-start gap-2">
                    <Briefcase className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">
                        What to Bring:
                      </p>
                      <p className="font-semibold text-sm text-gray-800 dark:text-white">
                        {latestApplication.psychometricTestWhatToBring}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                Submitted:
              </p>
              <p className="font-semibold text-sm text-gray-800 dark:text-white">
                {formatDate(latestApplication.createdAt)}
              </p>
            </div>
            {latestApplication.updatedAt && (
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                  Last Updated:
                </p>
                <p className="font-semibold text-sm text-gray-800 dark:text-white">
                  {formatDate(latestApplication.updatedAt)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationStatusWidget;
