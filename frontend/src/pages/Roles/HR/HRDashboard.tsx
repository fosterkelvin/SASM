import { useState } from "react";
import HRSidebar from "@/components/sidebar/HRSidebar";
import {
  Users,
  FileText,
  Building2,
  Star,
  BarChart2,
  RefreshCw,
} from "lucide-react";

const HRDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
      <HRSidebar
        currentPage="HR Dashboard"
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
            HR Dashboard
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
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-red-200">
                  Welcome to SASM-IMS
                </h2>
                <p className="text-red-600 dark:text-red-400 font-medium">
                  Human Resources Management System
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Your comprehensive HR portal for managing employees, recruitment,
              performance reviews, and organizational analytics. Streamline your
              human resources processes and foster a productive work
              environment.
            </p>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Employees Card */}
            <div className="bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-xl shadow-md border border-red-100 dark:border-red-700/60 p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-red-600 dark:bg-red-700 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                  234
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Total Employees
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active workforce
              </p>
            </div>

            {/* Pending Applications Card */}
            <div className="bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-xl shadow-md border border-orange-100 dark:border-orange-700/60 p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-orange-500 dark:bg-orange-700 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  18
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Pending Reviews
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Awaiting approval
              </p>
            </div>

            {/* Department Count Card */}
            <div className="bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-xl shadow-md border border-green-100 dark:border-green-700/60 p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-600 dark:bg-green-700 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  12
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Departments
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active divisions
              </p>
            </div>

            {/* Average Satisfaction Card */}
            <div className="bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-xl shadow-md border border-purple-100 dark:border-purple-700/60 p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-purple-600 dark:bg-purple-700 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  4.2
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Satisfaction
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Employee rating
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
                  Manage Employees
                </span>
              </button>

              <button className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-gray-900 hover:bg-orange-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 border border-orange-200 dark:border-orange-700/60 shadow">
                <div className="w-8 h-8 bg-orange-500 dark:bg-orange-700 rounded-lg flex items-center justify-center">
                  <BarChart2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-orange-700 dark:text-gray-200">
                  View Reports
                </span>
              </button>

              <button className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-gray-900 hover:bg-purple-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 border border-purple-200 dark:border-purple-700/60 shadow">
                <div className="w-8 h-8 bg-purple-600 dark:bg-purple-700 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-purple-700 dark:text-gray-200">
                  Schedule Review
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
