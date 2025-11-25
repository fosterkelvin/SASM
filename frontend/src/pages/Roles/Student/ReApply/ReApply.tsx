import React, { useState, useEffect } from "react";
import StudentSidebar from "@/components/sidebar/Student/StudentSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import ReApplyForm from "./components/ReApplyForm";
import { useAuth } from "@/context/AuthContext";
import {
  isPersonalInfoComplete,
  getMissingPersonalInfoFields,
} from "@/lib/personalInfoValidator";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/context/ToastContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserData,
  getUserReApplications,
  deleteReApplication,
} from "@/lib/api";

const ReApply: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Fetch user data to check personal info completeness
  const { data: userData, isLoading: isLoadingUserData } = useQuery({
    queryKey: ["userData"],
    queryFn: getUserData,
    enabled: !!user,
  });

  // Fetch user's re-applications
  const { data: reApplicationsData, isLoading: isLoadingReApplications } =
    useQuery({
      queryKey: ["userReApplications"],
      queryFn: getUserReApplications,
      enabled: !!user,
    });

  // Withdraw re-application mutation
  const withdrawMutation = useMutation({
    mutationFn: deleteReApplication,
    onSuccess: () => {
      addToast("Re-application withdrawn successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["userReApplications"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to withdraw re-application";
      addToast(errorMessage, "error");
    },
  });

  const handleWithdraw = (reApplicationId: string) => {
    if (
      window.confirm(
        "Are you sure you want to withdraw your re-application? This action cannot be undone."
      )
    ) {
      withdrawMutation.mutate(reApplicationId);
    }
  };

  // Check if there's a pending re-application
  const pendingReApplication = reApplicationsData?.reApplications?.find(
    (app: any) => app.status === "pending" || app.status === "under_review"
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "under_review":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "withdrawn":
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "under_review":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "withdrawn":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  // Check if personal info is complete, redirect if not
  useEffect(() => {
    if (!isLoadingUserData && userData !== undefined) {
      const personalInfoComplete = isPersonalInfoComplete(userData);
      if (!personalInfoComplete) {
        const missingFields = getMissingPersonalInfoFields(userData);
        addToast(
          `Please complete your personal information in Profile Settings before re-applying. Missing: ${missingFields.join(
            ", "
          )}`,
          "error",
          6000
        );
        navigate("/profile");
      }
    }
  }, [userData, isLoadingUserData, navigate, addToast]);

  if (user && !user.verified) {
    return (
      <div className="flex min-h-screen">
        <StudentSidebar
          currentPage="ReApply"
          onCollapseChange={setIsSidebarCollapsed}
        />
        <div
          className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
          } pt-24`}
        >
          <div className="p-6 md:p-10 flex items-center justify-center min-h-screen">
            <Card className="max-w-2xl w-full mx-4">
              <CardContent className="p-6 md:p-8 text-center">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h1 className="text-2xl font-bold">
                    Email Verification Required
                  </h1>
                  <p className="text-sm text-gray-600">
                    You need to verify your email ({user?.email}) before you can
                    re-apply. Please check your inbox for the verification link.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => window.location.reload()}
                    >
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-950 dark:via-gray-900">
      <StudentSidebar
        currentPage="ReApply"
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
          <h1 className="text-2xl font-bold text-white ml-4">Re-Apply</h1>
        </div>

        <div className="p-4 md:p-10 mt-12">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6 md:p-8">
              {/* University Header */}
              <div className="text-center mb-6 md:mb-8 border-b pb-4 md:pb-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-4">
                  <img
                    src="/UBLogo.svg"
                    alt="University of Baguio Logo"
                    className="h-12 sm:h-14 md:h-16 w-auto"
                  />
                  <div className="text-center sm:text-left">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200">
                      UNIVERSITY OF BAGUIO
                    </h2>
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-red-600 dark:text-red-400">
                      ReApplication Form
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Student Assistant and Student Marshal Scholarship
                    </p>
                  </div>
                </div>
              </div>

              {/* Show pending re-application status */}
              {!isLoadingReApplications && pendingReApplication && (
                <div className="mb-6 p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getStatusIcon(pendingReApplication.status)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        You have a pending re-application
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Submitted on:{" "}
                        {new Date(
                          pendingReApplication.submissionDate
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs">Status:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            pendingReApplication.status
                          )}`}
                        >
                          {pendingReApplication.status
                            .replace("_", " ")
                            .toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          You cannot submit another re-application while one is
                          pending review.
                        </p>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleWithdraw(pendingReApplication._id)
                          }
                          disabled={withdrawMutation.isPending}
                        >
                          {withdrawMutation.isPending
                            ? "Withdrawing..."
                            : "Withdraw"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Show form only if no pending re-application */}
              {!isLoadingReApplications && !pendingReApplication && (
                <ReApplyForm />
              )}

              {/* Show loading state */}
              {isLoadingReApplications && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Loading...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReApply;
