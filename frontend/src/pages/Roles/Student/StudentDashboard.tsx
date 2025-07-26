import { useState } from "react";
import StudentSidebar from "@/components/StudentSidebar";

const StudentDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
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
        <div className="hidden md:block bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-800 p-4 md:p-6">
          <h1 className="text-2xl font-bold text-white dark:text-white">
            Student Dashboard
          </h1>
        </div>

        {/* Main content */}
        <div className="p-6 md:p-10">
          {/* Welcome Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-red-100 dark:border-red-800/30 p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">📚</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  Welcome to SASM-IMS
                </h2>
                <p className="text-red-600 dark:text-red-400 font-medium">
                  Student Information Management System
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Your comprehensive academic portal for managing courses,
              assignments, grades, and academic progress. Navigate through your
              educational journey with ease and stay connected with your
              academic community.
            </p>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Courses Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-red-100 dark:border-red-800/30 p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 dark:text-red-400 text-lg">
                    📖
                  </span>
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-red-100 dark:border-red-800/30 p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 dark:text-orange-400 text-lg">
                    📝
                  </span>
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-red-100 dark:border-red-800/30 p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-lg">
                    🎯
                  </span>
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-red-100 dark:border-red-800/30 p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-lg">
                    📊
                  </span>
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-red-100 dark:border-red-800/30 p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400">⚡</span>
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200 border border-red-200 dark:border-red-800/50">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📚</span>
                </div>
                <span className="font-medium text-red-700 dark:text-red-300">
                  View Courses
                </span>
              </button>

              <button className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200 border border-red-200 dark:border-red-800/50">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📝</span>
                </div>
                <span className="font-medium text-red-700 dark:text-red-300">
                  Assignments
                </span>
              </button>

              <button className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200 border border-red-200 dark:border-red-800/50">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📊</span>
                </div>
                <span className="font-medium text-red-700 dark:text-red-300">
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
