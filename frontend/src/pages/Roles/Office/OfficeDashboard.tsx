import { useState } from "react";
import OfficeSidebar from "@/components/sidebar/OfficeSidebar";
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  BarChart2,
  Users,
  FileText,
  Building2,
  FileBarChart,
  RefreshCw,
} from "lucide-react";

const OfficeDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
      <OfficeSidebar
        currentPage="Office Dashboard"
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
            Office Dashboard
          </h1>
        </div>

        {/* Main content */}
        <div className="p-6 md:p-10">
          {/* Welcome Card */}
          <div className="bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-xl shadow-lg border border-red-100 dark:border-red-700/60 p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-700 dark:from-red-700 dark:to-red-900 rounded-lg flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-red-200">
                  Welcome to SASM-IMS
                </h2>
                <p className="text-red-600 dark:text-red-400 font-medium">
                  Office Management System
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Your comprehensive administrative portal for managing office
              operations, staff records, academic programs, and institutional
              resources. Streamline your workflow and maintain efficient
              oversight of all office activities.
            </p>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Staff Card */}
            <div className="bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-xl shadow-md border border-red-100 dark:border-red-700/60 p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-red-600 dark:bg-red-700 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                  45
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Active Staff
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current semester
              </p>
            </div>

            {/* Documents Card */}
            <div className="bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-xl shadow-md border border-orange-100 dark:border-orange-700/60 p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-orange-500 dark:bg-orange-700 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  28
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Pending Reviews
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Requires attention
              </p>
            </div>

            {/* Programs Card */}
            <div className="bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-xl shadow-md border border-green-100 dark:border-green-700/60 p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-600 dark:bg-green-700 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  12
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Active Programs
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Academic year
              </p>
            </div>

            {/* Reports Card */}
            <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-xl shadow-md border border-blue-100 dark:border-blue-700/60 p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center">
                  <FileBarChart className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  8
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Monthly Reports
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generated this month
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
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-red-700 dark:text-gray-200">
                  Manage Staff
                </span>
              </button>

              <button className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-gray-900 hover:bg-orange-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 border border-orange-200 dark:border-orange-700/60 shadow">
                <div className="w-8 h-8 bg-orange-500 dark:bg-orange-700 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-orange-700 dark:text-gray-200">
                  Review Documents
                </span>
              </button>

              <button className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-gray-900 hover:bg-blue-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 border border-blue-200 dark:border-blue-700/60 shadow">
                <div className="w-8 h-8 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center">
                  <FileBarChart className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-blue-700 dark:text-gray-200">
                  Generate Reports
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeDashboard;
