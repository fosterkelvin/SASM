import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import HRSidebar from "@/components/sidebar/HR/HRSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Search,
  Calendar,
  User,
  Mail,
  Building,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  Award,
  Users,
} from "lucide-react";
import {
  getScholarRecords,
  getScholarRecordSemesterYears,
  getScholarRecordOffices,
  getScholarRecordStats,
} from "@/lib/api";

const ScholarRecords = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedScholarType, setSelectedScholarType] = useState<string>("");
  const [selectedOffice, setSelectedOffice] = useState<string>("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Fetch scholar records
  const { data: recordsData, isLoading } = useQuery({
    queryKey: [
      "scholar-records",
      selectedSemester,
      searchTerm,
      selectedScholarType,
      selectedOffice,
      page,
    ],
    queryFn: () =>
      getScholarRecords({
        semesterYear: selectedSemester || undefined,
        search: searchTerm || undefined,
        scholarType: selectedScholarType || undefined,
        office: selectedOffice || undefined,
        page,
        limit: 20,
      }),
  });

  // Fetch semester years for filter
  const { data: semesterYearsData } = useQuery({
    queryKey: ["scholar-record-semester-years"],
    queryFn: getScholarRecordSemesterYears,
  });

  // Fetch offices for filter
  const { data: officesData } = useQuery({
    queryKey: ["scholar-record-offices"],
    queryFn: getScholarRecordOffices,
  });

  // Fetch statistics
  const { data: statsData } = useQuery({
    queryKey: ["scholar-record-stats"],
    queryFn: getScholarRecordStats,
  });

  const records = recordsData?.records || [];
  const totalPages = recordsData?.totalPages || 1;
  const semesterYears = semesterYearsData?.semesterYears || [];
  const offices = officesData?.offices || [];
  const stats = statsData?.stats || [];
  const totals = statsData?.totals || {
    totalRecords: 0,
    totalHours: 0,
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getScholarTypeBadge = (scholarType: string) => {
    if (scholarType === "student_assistant")
      return (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-semibold">
          Student Assistant
        </span>
      );
    if (scholarType === "student_marshal")
      return (
        <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-xs font-semibold">
          Student Marshal
        </span>
      );
    return (
      <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full text-xs font-semibold">
        {scholarType}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
      <HRSidebar
        currentPage="Scholar Records"
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
          <GraduationCap className="ml-4 h-8 w-8 text-white" />
          <h1 className="text-2xl font-bold text-white">Scholar Records</h1>
        </div>

        <div className="p-6 md:p-10 pb-16">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Records
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                      {totals.totalRecords}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      All-time scholars
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <Users className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Hours Served
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                      {totals.totalHours?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Combined service hours
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Semesters Tracked
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                      {semesterYears.length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Academic periods
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Per Semester Stats */}
          {stats.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {stats.slice(0, 6).map((stat: any) => (
                <Card key={stat.semesterYear} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {stat.semesterYear}
                        </p>
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {stat.count}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            scholars
                          </span>
                        </div>
                        <div className="flex gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            SA: {stat.studentAssistants}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                            SM: {stat.studentMarshals}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <Clock className="inline h-3 w-3 mr-1" />
                          {stat.totalHours?.toLocaleString() || 0} hours
                        </p>
                      </div>
                      <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <Award className="h-5 w-5 text-red-500 dark:text-red-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pb-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name, email, office..."
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
                    aria-label="Filter by semester"
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
                  <Label htmlFor="scholarType" className="mb-2 block">
                    Scholar Type
                  </Label>
                  <select
                    id="scholarType"
                    aria-label="Filter by scholar type"
                    value={selectedScholarType}
                    onChange={(e) => {
                      setSelectedScholarType(e.target.value);
                      setPage(1);
                    }}
                    className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">All Types</option>
                    <option value="student_assistant">Student Assistant</option>
                    <option value="student_marshal">Student Marshal</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="office" className="mb-2 block">
                    Office
                  </Label>
                  <select
                    id="office"
                    aria-label="Filter by office"
                    value={selectedOffice}
                    onChange={(e) => {
                      setSelectedOffice(e.target.value);
                      setPage(1);
                    }}
                    className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">All Offices</option>
                    {offices.map((office: string) => (
                      <option key={office} value={office}>
                        {office}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedSemester("");
                      setSelectedScholarType("");
                      setSelectedOffice("");
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

          {/* Scholar Records List */}
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Loading scholar records...
                  </p>
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No scholar records found
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Scholar records are created when a semester ends and
                    scholars are reset.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Office</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Hours</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Semester</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record: any) => (
                        <>
                          <tr
                            key={record._id}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <User className="h-8 w-8 text-red-600" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {record.firstName} {record.lastName}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                              {record.email}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                              {record.scholarOffice}
                            </td>
                            <td className="py-4 px-4">
                              {getScholarTypeBadge(record.scholarType)}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                              {record.completedHours || 0} / {record.requiredHours || "N/A"}
                            </td>
                            <td className="py-4 px-4">
                              <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-semibold">
                                {record.semesterYear}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs font-semibold">
                                {record.finalStatus}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpand(record._id)}
                                className="h-8 w-8 p-0"
                              >
                                {expandedId === record._id ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </td>
                          </tr>
                          {expandedId === record._id && (
                            <tr key={`${record._id}-details`}>
                              <td colSpan={8} className="bg-gray-50 dark:bg-gray-900 p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                      <FileText className="h-4 w-4" />
                                      Deployment Information
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <p className="text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">Office:</span> {record.scholarOffice}
                                      </p>
                                      <p className="text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">Deployed At:</span> {formatDate(record.deployedAt)}
                                      </p>
                                      <p className="text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">Deployed By:</span> {record.deployedBy?.firstname} {record.deployedBy?.lastname}
                                      </p>
                                      <p className="text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">Semester Start:</span> {formatDate(record.semesterStartDate)}
                                      </p>
                                      <p className="text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">Semester End:</span> {formatDate(record.semesterEndDate)}
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                      <Clock className="h-4 w-4" />
                                      Service Hours
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <p className="text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">Required Hours:</span> {record.requiredHours || "N/A"}
                                      </p>
                                      <p className="text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">Completed Hours:</span> {record.completedHours || 0}
                                      </p>
                                      {record.scholarNotes && (
                                        <p className="text-gray-600 dark:text-gray-400">
                                          <span className="font-medium">Notes:</span> {record.scholarNotes}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                      <GraduationCap className="h-4 w-4" />
                                      Record Information
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <p className="text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">Status:</span>{" "}
                                        <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs">
                                          {record.finalStatus}
                                        </span>
                                      </p>
                                      <p className="text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">Recorded At:</span> {formatDate(record.recordedAt)}
                                      </p>
                                      <p className="text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">Recorded By:</span> {record.recordedBy?.firstname} {record.recordedBy?.lastname}
                                      </p>
                                      <p className="text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">Reason:</span> {record.recordReason}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
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
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
        </div>
      </div>
    </div>
  );
};

export default ScholarRecords;
