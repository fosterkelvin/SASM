import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building,
  Calendar,
  Clock,
  User,
  Mail,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getMyTraineeDeployment } from "@/lib/api";
import StudentSidebar from "@/components/sidebar/Student/StudentSidebar";
import { useState } from "react";

const MyDeployment = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Fetch deployment info
  const { data, isLoading } = useQuery({
    queryKey: ["my-deployment"],
    queryFn: getMyTraineeDeployment,
  });

  const deployment = data?.deployment;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900/20">
      <StudentSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <div className={`flex-1 transition-all duration-300`}>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Trainee Deployment
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View your current deployment information and progress
            </p>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading deployment information...
              </p>
            </div>
          ) : !deployment ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Active Deployment
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You are not currently deployed to any office. Once you are
                  assigned as a trainee, your deployment information will appear
                  here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Status Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Deployment Status
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {deployment.status === "trainee"
                          ? "Currently Active"
                          : deployment.status === "pending_office_interview"
                          ? "Awaiting Interview Scheduling"
                          : deployment.status === "office_interview_scheduled"
                          ? "Interview Scheduled"
                          : "Training Completed"}
                      </p>
                    </div>
                    <div
                      className={`px-6 py-3 rounded-full text-sm font-bold border ${
                        deployment.status === "trainee"
                          ? "bg-gray-100 text-gray-900 border-gray-400 dark:bg-gray-700 dark:text-white dark:border-gray-500"
                          : deployment.status === "pending_office_interview"
                          ? "bg-yellow-100 text-yellow-900 border-yellow-400 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-500"
                          : deployment.status === "office_interview_scheduled"
                          ? "bg-blue-100 text-blue-900 border-blue-400 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-500"
                          : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {deployment.status === "trainee"
                        ? "ACTIVE"
                        : deployment.status === "pending_office_interview"
                        ? "PENDING INTERVIEW"
                        : deployment.status === "office_interview_scheduled"
                        ? "INTERVIEW SCHEDULED"
                        : "COMPLETED"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Interview Details Card - Show when interview is scheduled */}
              {deployment.status === "office_interview_scheduled" && deployment.deploymentInterviewDate && (
                <Card className="border-blue-200 dark:border-blue-800">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Deployment Interview
                    </h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Date</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatDate(deployment.deploymentInterviewDate)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Time</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {deployment.deploymentInterviewTime}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Interview Mode</p>
                        <p className="font-semibold text-gray-900 dark:text-white capitalize">
                          {deployment.deploymentInterviewMode}
                        </p>
                      </div>

                      {deployment.deploymentInterviewLocation && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Location</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {deployment.deploymentInterviewLocation}
                          </p>
                        </div>
                      )}

                      {deployment.deploymentInterviewLink && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            {deployment.deploymentInterviewMode === "virtual" ? "Meeting Link" : "Contact"}
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white break-all">
                            {deployment.deploymentInterviewLink}
                          </p>
                        </div>
                      )}

                      {deployment.deploymentInterviewNotes && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Additional Notes</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {deployment.deploymentInterviewNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Pending Interview Message */}
              {deployment.status === "pending_office_interview" && (
                <Card className="border-yellow-200 dark:border-yellow-800">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                        <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          Interview Scheduling in Progress
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          The office will schedule an interview with you soon. You'll receive a notification once the interview is scheduled.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Office Information */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Office Assignment
                  </h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <Building className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Deployed To
                      </p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">
                        {deployment.office}
                      </p>
                    </div>
                  </div>

                  {deployment.supervisor && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Supervisor
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {deployment.supervisor.firstname}{" "}
                            {deployment.supervisor.lastname}
                          </p>
                        </div>
                      </div>
                      {deployment.supervisor.email && (
                        <div className="flex items-center gap-2 mt-2 ml-8">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {deployment.supervisor.email}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Timeline
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Start Date
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {deployment.startDate
                            ? formatDate(deployment.startDate)
                            : "Not specified"}
                        </p>
                      </div>
                    </div>

                    {deployment.endDate && (
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            End Date
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatDate(deployment.endDate)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Hours Progress - Only show for active trainees */}
              {(deployment.status === "trainee" || deployment.status === "training_completed") && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Training Progress
                      </h3>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {deployment.completedHours || 0} /{" "}
                          {deployment.requiredHours || 0} hrs
                        </span>
                      </div>
                    </div>

                  <div className="mb-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                      <div
                        className="bg-gray-600 dark:bg-gray-400 h-6 rounded-full transition-all flex items-center justify-end pr-3"
                        style={{
                          width: `${Math.min(
                            ((deployment.completedHours || 0) /
                              (deployment.requiredHours || 1)) *
                              100,
                            100
                          )}%`,
                        }}
                      >
                        {deployment.completedHours >=
                          deployment.requiredHours && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {(
                        ((deployment.completedHours || 0) /
                          (deployment.requiredHours || 1)) *
                        100
                      ).toFixed(1)}
                      % complete
                    </p>
                  </div>

                  {deployment.completedHours >= deployment.requiredHours && (
                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-gray-400 dark:border-gray-500">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        <p className="font-semibold text-gray-900 dark:text-white">
                          Congratulations! You have completed all required
                          hours.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              )}

              {/* Performance & Notes */}
              {(deployment.performanceRating || deployment.notes) && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Additional Information
                    </h3>
                    <div className="space-y-4">
                      {deployment.performanceRating && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Performance Rating
                          </p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-6 h-6 ${
                                  star <= deployment.performanceRating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </svg>
                            ))}
                            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                              {deployment.performanceRating}/5
                            </span>
                          </div>
                        </div>
                      )}

                      {deployment.notes && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Notes
                          </p>
                          <p className="text-gray-700 dark:text-gray-300 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            {deployment.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyDeployment;
