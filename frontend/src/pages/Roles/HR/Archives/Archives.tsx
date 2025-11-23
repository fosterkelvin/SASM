import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import HRSidebar from "@/components/sidebar/HR/HRSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Archive,
  Search,
  Calendar,
  User,
  Mail,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import {
  getArchivedApplications,
  getSemesterYears,
  getArchivedStats,
} from "@/lib/api";

const Archives = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "applications" | "reapplications" | "leave"
  >("applications");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Fetch archived applications
  const { data: archivedData, isLoading } = useQuery({
    queryKey: [
      "archived-applications",
      selectedSemester,
      searchTerm,
      selectedPosition,
      page,
    ],
    queryFn: () =>
      getArchivedApplications({
        semesterYear: selectedSemester || undefined,
        search: searchTerm || undefined,
        position: selectedPosition || undefined,
        page,
        limit: 20,
      }),
  });

  // Fetch semester years for filter
  const { data: semesterYearsData } = useQuery({
    queryKey: ["semester-years"],
    queryFn: getSemesterYears,
  });

  // Fetch statistics
  const { data: statsData } = useQuery({
    queryKey: ["archived-stats"],
    queryFn: getArchivedStats,
  });

  const applications = archivedData?.applications || [];
  const totalPages = archivedData?.totalPages || 1;
  const semesterYears = semesterYearsData?.semesterYears || [];
  const stats = statsData?.stats || [];

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getPositionBadge = (position: string) => {
    if (position === "student_assistant")
      return (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-semibold">
          Student Assistant
        </span>
      );
    if (position === "student_marshal")
      return (
        <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-xs font-semibold">
          Student Marshal
        </span>
      );
    return (
      <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full text-xs font-semibold">
        {position}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
      <HRSidebar
        currentPage="Archives"
        onCollapseChange={setIsSidebarCollapsed}
      />

      <div
        className={`flex-1 pt-16 md:pt-[81px] transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Header */}
        <div
          className={`hidden md:flex items-center gap-4 fixed top-0 left-0 z-30 bg-gradient-to-r from-red-600 to-red-700 h-[81px] ${
            isSidebarCollapsed
              ? "md:w-[calc(100%-5rem)] md:ml-20"
              : "md:w-[calc(100%-16rem)] md:ml-64"
          }`}
        >
          <Archive className="ml-4 h-8 w-8 text-white" />
          <h1 className="text-2xl font-bold text-white">Archives</h1>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-1 px-6">
            <button
              onClick={() => setActiveTab("applications")}
              className={`py-3 px-6 font-medium text-sm transition-all relative ${
                activeTab === "applications"
                  ? "text-red-600 dark:text-red-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-red-600"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Applications
            </button>
            <button
              onClick={() => setActiveTab("reapplications")}
              className={`py-3 px-6 font-medium text-sm transition-all relative ${
                activeTab === "reapplications"
                  ? "text-red-600 dark:text-red-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-red-600"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Reapplications
            </button>
            <button
              onClick={() => setActiveTab("leave")}
              className={`py-3 px-6 font-medium text-sm transition-all relative ${
                activeTab === "leave"
                  ? "text-red-600 dark:text-red-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-red-600"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Leave
            </button>
          </div>
        </div>

        <div className="p-6 md:p-10">
          {/* Applications Tab */}
          {activeTab === "applications" && (
            <>
              {/* Statistics Cards */}
              {stats.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {stats.slice(0, 3).map((stat: any) => (
                    <Card key={stat.semesterYear}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {stat.semesterYear}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {stat.count}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              SA: {stat.studentAssistants} | SM:{" "}
                              {stat.studentMarshals}
                            </p>
                          </div>
                          <Archive className="h-8 w-8 text-red-600" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Filters */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4">
                    <div>
                      <Label htmlFor="search">Search</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="search"
                          placeholder="Search by name or email..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                          }}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="semester" className="mb-2 block">
                        Semester
                      </Label>
                      <select
                        id="semester"
                        value={selectedSemester}
                        onChange={(e) => {
                          setSelectedSemester(e.target.value);
                          setPage(1);
                        }}
                        className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">All Semesters</option>
                        {semesterYears.map((year: string) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="position" className="mb-2 block">
                        Scholarship
                      </Label>
                      <select
                        id="position"
                        value={selectedPosition}
                        onChange={(e) => {
                          setSelectedPosition(e.target.value);
                          setPage(1);
                        }}
                        className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">All Scholarships</option>
                        <option value="student_assistant">
                          Student Assistant
                        </option>
                        <option value="student_marshal">Student Marshal</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedSemester("");
                          setSelectedPosition("");
                          setPage(1);
                        }}
                        variant="outline"
                        className="w-full h-10"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Applications List */}
              <Card>
                <CardContent className="pt-6">
                  {isLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Loading archived applications...
                      </p>
                    </div>
                  ) : applications.length === 0 ? (
                    <div className="text-center py-12">
                      <Archive className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        No archived applications found
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.map((app: any) => (
                        <div
                          key={app._id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                          {/* Application Header */}
                          <div
                            className="p-4 bg-white dark:bg-gray-800 cursor-pointer"
                            onClick={() => toggleExpand(app._id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <User className="h-10 w-10 text-red-600" />
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                    {app.firstName} {app.lastName}
                                  </h3>
                                  <div className="flex items-center gap-4 mt-1">
                                    <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                      <Mail className="h-4 w-4" />
                                      {app.email}
                                    </span>
                                    <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                      <Calendar className="h-4 w-4" />
                                      {formatDate(app.archivedAt)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {getPositionBadge(app.position)}
                                  <span className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full text-xs font-semibold">
                                    {app.semesterYear}
                                  </span>
                                </div>
                              </div>
                              {expandedId === app._id ? (
                                <ChevronUp className="h-5 w-5 text-gray-400 ml-4" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400 ml-4" />
                              )}
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {expandedId === app._id && (
                            <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Archive Information
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <p className="text-gray-600 dark:text-gray-400">
                                      <span className="font-medium">
                                        Archived Reason:
                                      </span>{" "}
                                      {app.archivedReason}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                      <span className="font-medium">
                                        Original Status:
                                      </span>{" "}
                                      <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs">
                                        {app.originalStatus}
                                      </span>
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                      <span className="font-medium">
                                        Archived By:
                                      </span>{" "}
                                      {app.archivedBy?.firstname}{" "}
                                      {app.archivedBy?.lastname}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4" />
                                    Original Application Details
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <p className="text-gray-600 dark:text-gray-400">
                                      <span className="font-medium">Age:</span>{" "}
                                      {app.originalApplication?.age}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                      <span className="font-medium">
                                        Gender:
                                      </span>{" "}
                                      {app.originalApplication?.gender}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                      <span className="font-medium">
                                        Contact:
                                      </span>{" "}
                                      {app.originalApplication?.homeContact}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                      <span className="font-medium">
                                        Address:
                                      </span>{" "}
                                      {app.originalApplication?.homeAddress}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                                  This application was archived on{" "}
                                  {formatDate(app.archivedAt)} and contains the
                                  complete original application data for
                                  historical records.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        variant="outline"
                        size="sm"
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                        variant="outline"
                        size="sm"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Reapplications Tab */}
          {activeTab === "reapplications" && (
            <>
              {/* Filters */}
              <Card className="mb-6">
                <CardContent className="pt-6 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="reapp-search" className="mb-2 block">
                        Search
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="reapp-search"
                          placeholder="Search by name or email..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                          }}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="reapp-semester" className="mb-2 block">
                        Semester
                      </Label>
                      <select
                        id="reapp-semester"
                        value={selectedSemester}
                        onChange={(e) => {
                          setSelectedSemester(e.target.value);
                          setPage(1);
                        }}
                        className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">All Semesters</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="reapp-position" className="mb-2 block">
                        Scholarship
                      </Label>
                      <select
                        id="reapp-position"
                        value={selectedPosition}
                        onChange={(e) => {
                          setSelectedPosition(e.target.value);
                          setPage(1);
                        }}
                        className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">All Scholarships</option>
                        <option value="student_assistant">
                          Student Assistant
                        </option>
                        <option value="student_marshal">Student Marshal</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedSemester("");
                          setSelectedPosition("");
                          setPage(1);
                        }}
                        variant="outline"
                        className="w-full h-10"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content */}
              <Card>
                <CardContent className="pt-12 pb-12">
                  <div className="text-center">
                    <Archive className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      No Archived Reapplications
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Archived reapplications will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Leave Tab */}
          {activeTab === "leave" && (
            <>
              {/* Filters */}
              <Card className="mb-6">
                <CardContent className="pt-6 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="leave-search" className="mb-2 block">
                        Search
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="leave-search"
                          placeholder="Search by name or email..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                          }}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="leave-semester" className="mb-2 block">
                        Semester
                      </Label>
                      <select
                        id="leave-semester"
                        value={selectedSemester}
                        onChange={(e) => {
                          setSelectedSemester(e.target.value);
                          setPage(1);
                        }}
                        className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">All Semesters</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="leave-status" className="mb-2 block">
                        Status
                      </Label>
                      <select
                        id="leave-status"
                        value={selectedPosition}
                        onChange={(e) => {
                          setSelectedPosition(e.target.value);
                          setPage(1);
                        }}
                        className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">All Statuses</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedSemester("");
                          setSelectedPosition("");
                          setPage(1);
                        }}
                        variant="outline"
                        className="w-full h-10"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content */}
              <Card>
                <CardContent className="pt-12 pb-12">
                  <div className="text-center">
                    <Archive className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      No Archived Leave Requests
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Archived leave requests will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Archives;
