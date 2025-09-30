import React, { useState } from "react";
import StudentSidebar from "@/components/sidebar/Student/StudentSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import LeaveForm from "./components/LeaveForm";
import { useAuth } from "@/context/AuthContext";

const Leave: React.FC = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (user && !user.verified) {
    return (
      <div className="flex min-h-screen">
        <StudentSidebar
          currentPage="Leave"
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
                    submit a leave form. Please check your inbox for the
                    verification link.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-950 dark:via-gray-900">
      <StudentSidebar
        currentPage="Leave"
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
          <h1 className="text-2xl font-bold text-white ml-4">Leave Form</h1>
        </div>

        <div className="p-4 md:p-10 mt-12">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6 md:p-8">
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
                      Leave Application Form
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Student Assistant and Student Marshal
                    </p>
                  </div>
                </div>
              </div>

              <LeaveForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Leave;
