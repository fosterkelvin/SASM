import React, { useState } from "react";
import StudentSidebar from "@/components/sidebar/Student/StudentSidebar";
import UploadSchedule from "./components/UploadSchedule";
import ScheduleVisualization from "./components/ScheduleVisualization";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getClassSchedule } from "@/lib/api";

const Schedule: React.FC = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Fetch existing schedule
  const { data: existingSchedule, isLoading } = useQuery({
    queryKey: ["classSchedule"],
    queryFn: () => getClassSchedule(),
  });

  if (user && !user.verified) {
    return (
      <div className="flex min-h-screen">
        <StudentSidebar
          currentPage="Schedule"
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
                  <h1 className="text-2xl font-bold">
                    Email Verification Required
                  </h1>
                  <p className="text-sm text-gray-600">
                    You need to verify your email ({user?.email}) before you can
                    upload documents.
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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900">
      <StudentSidebar
        currentPage="Schedule"
        onCollapseChange={setIsSidebarCollapsed}
      />
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <div
          className={`hidden md:flex items-center gap-4 fixed top-0 left-0 z-30 bg-gradient-to-r from-red-600 to-red-700 shadow-lg border-b border-red-200 dark:border-red-800 h-[81px] ${
            isSidebarCollapsed
              ? "md:w-[calc(100%-5rem)] md:ml-20"
              : "md:w-[calc(100%-16rem)] md:ml-64"
          }`}
        >
          <h1 className="text-2xl font-bold text-white ml-4">
            {existingSchedule?.scheduleData &&
            existingSchedule.scheduleData.length > 0 &&
            !showUploadForm
              ? "My Class Schedule"
              : "Upload Schedule (PDF)"}
          </h1>
        </div>

        <div className="p-4 md:p-10 mt-12">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Loading schedule...
                </p>
              </div>
            </div>
          ) : existingSchedule?.scheduleData &&
            existingSchedule.scheduleData.length > 0 &&
            !showUploadForm ? (
            // Show Schedule Visualization
            <div className="space-y-6">
              <Card className="max-w-7xl mx-auto shadow-lg">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">📅</span>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          Your Schedule
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Weekly schedule overview
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!!existingSchedule?.scheduleUrl && (
                        <>
                          <button
                            onClick={() =>
                              window.open(
                                existingSchedule.scheduleUrl,
                                "_blank"
                              )
                            }
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            View Schedule
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const url = existingSchedule.scheduleUrl;
                                if (!url) return;
                                const res = await fetch(url);
                                if (!res.ok)
                                  throw new Error("Failed to download");
                                const blob = await res.blob();
                                const blobUrl =
                                  window.URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = blobUrl;
                                // Try to derive filename from url, fallback
                                const parts = url.split("/");
                                const name =
                                  parts[parts.length - 1].split("?")[0] ||
                                  "schedule.jpg";
                                a.download = name;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                window.URL.revokeObjectURL(blobUrl);
                              } catch (err) {
                                console.error(err);
                                alert(
                                  "Failed to download schedule. Please try again."
                                );
                              }
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                          >
                            Download Schedule
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setShowUploadForm(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                          />
                        </svg>
                        Upload New
                      </button>
                    </div>
                  </div>
                  <ScheduleVisualization
                    scheduleClasses={existingSchedule.scheduleData}
                    dutyHours={existingSchedule.dutyHours || []}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            // Show Upload Form
            <Card className="max-w-7xl mx-auto">
              <CardContent className="p-6 md:p-8">
                <div className="text-center mb-6 md:mb-8 border-b pb-4 md:pb-6">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-4">
                    <img
                      src="/UBLogo.svg"
                      alt="University Logo"
                      className="h-12 sm:h-14 md:h-16 w-auto"
                    />
                    <div className="text-center sm:text-left">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200">
                        Upload Class Schedule
                      </h2>
                      <p className="text-sm sm:text-base md:text-lg font-semibold text-red-600 dark:text-red-400">
                        Please upload your schedule as a PDF document.
                      </p>
                    </div>
                  </div>
                  {showUploadForm && (
                    <button
                      onClick={() => setShowUploadForm(false)}
                      className="mt-4 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      ← Back to Schedule View
                    </button>
                  )}
                </div>

                <UploadSchedule />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
