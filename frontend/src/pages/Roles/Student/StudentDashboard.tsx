import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Mail } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { resendVerificationEmail } from "@/lib/api";
import StudentSidebar from "@/components/sidebar/StudentSidebar";

// ResendVerificationButton component for Student Dashboard
import {
  Loader2,
  RefreshCw,
  BookOpen,
  ClipboardList,
  GraduationCap,
  BarChart2,
} from "lucide-react";
const ResendVerificationButton = ({ email }: { email: string }) => {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const resendMutation = useMutation({
    mutationFn: () => resendVerificationEmail({ email }),
    onSuccess: () => {
      setResendMessage(
        "Verification email sent successfully! Please check your inbox."
      );
      setTimeout(() => setResendMessage(""), 5000);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to send verification email";
      setResendMessage(message);
      setTimeout(() => setResendMessage(""), 5000);
    },
    onSettled: () => {
      setIsResending(false);
    },
  });

  const handleResend = () => {
    setIsResending(true);
    setResendMessage("");
    resendMutation.mutate();
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleResend}
        disabled={isResending}
        className="bg-yellow-600 hover:bg-yellow-700 text-white dark:bg-yellow-700 dark:hover:bg-yellow-800 dark:text-yellow-100 shadow-md"
        size="sm"
      >
        {isResending ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending...
          </div>
        ) : (
          <>
            <Mail className="w-4 h-4 mr-2" />
            Resend Verification
          </>
        )}
      </Button>
      {resendMessage && (
        <p
          className={`text-sm ${
            resendMessage.includes("successfully")
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {resendMessage}
        </p>
      )}
    </div>
  );
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900/80">
      <StudentSidebar
        currentPage="Student Dashboard"
        onCollapseChange={setIsSidebarCollapsed}
      />
      {/* Main content area with dynamic margin based on sidebar state */}
      <div
        className={`flex-1 pt-16 md:pt-0 transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Top header bar - only visible on desktop */}
        <div
          className={`hidden md:flex items-center gap-4 fixed top-0 left-0 z-30 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-800 h-[81px] ${
            isSidebarCollapsed
              ? "md:w-[calc(100%-5rem)] md:ml-20"
              : "md:w-[calc(100%-16rem)] md:ml-64"
          }`}
        >
          <h1 className="text-2xl font-bold text-white dark:text-white ml-4">
            Student Dashboard
          </h1>
        </div>

        {/* Main content */}
        <div
          className="p-6 md:p-10"
          style={{ borderTop: "0.5in solid #b91c1c" }} // #b91c1c is Tailwind's red-700
        >
          {/* Welcome Card */}
          <div className="bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-xl shadow-lg border border-red-100 dark:border-red-700/60 p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-700 dark:from-red-700 dark:to-red-900 rounded-lg flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-red-200">
                  Welcome to SASM-IMS
                </h2>
                <p className="text-red-600 dark:text-red-400 font-medium">
                  Student Information Management System
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Your comprehensive academic portal for managing courses,
              assignments, grades, and academic progress. Navigate through your
              educational journey with ease and stay connected with your
              academic community.
            </p>
          </div>

          {/* Email Verification Alert - Show only if not verified */}
          {user && !user.verified && (
            <Card className="mb-8 border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-gray-950/80">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      Email Verification Required
                    </h3>
                    <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                      Your email address <strong>{user.email}</strong> is not
                      yet verified. Some features may be limited until you
                      verify your email address.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <ResendVerificationButton email={user.email} />
                      <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        className="border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                        size="sm"
                      >
                        Refresh Page
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Courses Card */}
            <div className="bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-xl shadow-md border border-red-100 dark:border-red-700/60 p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-red-600 dark:bg-red-700 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                  6
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Active Courses
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This semester
              </p>
            </div>

            {/* Assignments Card */}
            <div className="bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-xl shadow-md border border-orange-100 dark:border-orange-700/60 p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-orange-500 dark:bg-orange-700 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  12
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Pending Tasks
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Due this week
              </p>
            </div>

            {/* GPA Card */}
            <div className="bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-xl shadow-md border border-green-100 dark:border-green-700/60 p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-600 dark:bg-green-700 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  3.8
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Current GPA
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Semester average
              </p>
            </div>

            {/* Attendance Card */}
            <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-xl shadow-md border border-blue-100 dark:border-blue-700/60 p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center">
                  <BarChart2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  94%
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Attendance
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This semester
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-xl shadow-lg border border-red-100 dark:border-red-700/60 p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-red-200 mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-red-600 dark:text-red-400" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center gap-3 p-4 bg-red-50 dark:bg-gray-900 hover:bg-red-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 border border-red-200 dark:border-red-700/60 shadow">
                <div className="w-8 h-8 bg-red-600 dark:bg-red-700 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-red-700 dark:text-gray-200">
                  View Courses
                </span>
              </button>

              <button className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-gray-900 hover:bg-orange-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 border border-orange-200 dark:border-orange-700/60 shadow">
                <div className="w-8 h-8 bg-orange-500 dark:bg-orange-700 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-orange-700 dark:text-gray-200">
                  Assignments
                </span>
              </button>

              <button className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-gray-900 hover:bg-blue-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 border border-blue-200 dark:border-blue-700/60 shadow">
                <div className="w-8 h-8 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center">
                  <BarChart2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-blue-700 dark:text-gray-200">
                  View Grades
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
