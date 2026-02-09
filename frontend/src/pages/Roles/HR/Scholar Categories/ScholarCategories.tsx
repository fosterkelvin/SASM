import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import HRSidebar from "@/components/sidebar/HR/HRSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  GraduationCap,
  Archive,
  UserX,
  Ban,
  Search,
  Download,
  RefreshCw,
  Calendar,
  Mail,
  Building,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
  Plus,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  getScholarCategoryStats,
  getActiveScholarsList,
  getTraineesListByCategory,
  getArchivedScholarsList,
  getWithdrawnApplicants,
  getBlacklistedPersons,
  getCategoryReportData,
  graduateScholar,
  withdrawApplicant,
  blacklistPerson,
  removeFromBlacklist,
  triggerCategoryCleanup,
  getOfficeUsers,
} from "@/lib/api";
import {
  generateArchivedScholarsReport,
  generateWithdrawnReport,
  generateBlacklistReport,
  generateActiveScholarsReport,
  generateTraineesReport,
  type CategoryReportData,
} from "@/utils/categoryPdfGenerator";

type TabType = "scholars" | "trainees" | "archive" | "withdrawn" | "blacklist";

const ScholarCategories = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("scholars");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOffice, setSelectedOffice] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modal states
  const [showGraduateModal, setShowGraduateModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // Form states
  const [graduateForm, setGraduateForm] = useState({
    graduationDate: new Date().toISOString().split("T")[0],
    academicYear: new Date().getFullYear().toString(),
    notes: "",
    totalServiceMonths: 6,
    completedHours: 0,
  });

  const [withdrawForm, setWithdrawForm] = useState({
    reason: "",
    notes: "",
  });

  const [blacklistForm, setBlacklistForm] = useState({
    reason: "",
    restrictionPeriod: 0,
    notes: "",
  });

  // Fetch statistics
  const { data: statsData } = useQuery({
    queryKey: ["scholar-category-stats"],
    queryFn: getScholarCategoryStats,
  });

  const stats = statsData?.stats || {
    scholars: 0,
    trainees: 0,
    archived: 0,
    withdrawn: 0,
    blacklisted: 0,
  };

  // Fetch office users for dropdown
  const { data: officeUsersData } = useQuery({
    queryKey: ["office-users"],
    queryFn: getOfficeUsers,
  });
  const offices = [...new Set((officeUsersData?.users || []).map((u: any) => u.office).filter(Boolean))];

  // Fetch active scholars
  const { data: scholarsData, isLoading: loadingScholars } = useQuery({
    queryKey: ["active-scholars", searchTerm, selectedOffice, selectedType],
    queryFn: () =>
      getActiveScholarsList({
        search: searchTerm,
        office: selectedOffice,
        scholarType: selectedType,
      }),
    enabled: activeTab === "scholars",
  });

  // Fetch trainees
  const { data: traineesData, isLoading: loadingTrainees } = useQuery({
    queryKey: ["trainees-list", searchTerm, selectedOffice, selectedType],
    queryFn: () =>
      getTraineesListByCategory({
        search: searchTerm,
        office: selectedOffice,
        position: selectedType,
      }),
    enabled: activeTab === "trainees",
  });

  // Fetch archived
  const { data: archivedData, isLoading: loadingArchived } = useQuery({
    queryKey: ["archived-scholars", searchTerm, selectedOffice, selectedType, selectedYear],
    queryFn: () =>
      getArchivedScholarsList({
        search: searchTerm,
        office: selectedOffice,
        scholarType: selectedType,
        academicYear: selectedYear,
      }),
    enabled: activeTab === "archive",
  });

  // Fetch withdrawn
  const { data: withdrawnData, isLoading: loadingWithdrawn } = useQuery({
    queryKey: ["withdrawn-applicants", searchTerm],
    queryFn: () => getWithdrawnApplicants({ search: searchTerm }),
    enabled: activeTab === "withdrawn",
  });

  // Fetch blacklisted
  const { data: blacklistedData, isLoading: loadingBlacklisted } = useQuery({
    queryKey: ["blacklisted-persons", searchTerm],
    queryFn: () => getBlacklistedPersons({ search: searchTerm }),
    enabled: activeTab === "blacklist",
  });

  // Graduate mutation
  const graduateMutation = useMutation({
    mutationFn: ({ scholarId, data }: { scholarId: string; data: any }) =>
      graduateScholar(scholarId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-scholars"] });
      queryClient.invalidateQueries({ queryKey: ["archived-scholars"] });
      queryClient.invalidateQueries({ queryKey: ["scholar-category-stats"] });
      addToast("Scholar graduated and archived successfully", "success");
      setShowGraduateModal(false);
      setSelectedRecord(null);
    },
    onError: (error: any) => {
      addToast(error.response?.data?.message || "Failed to graduate scholar", "error");
    },
  });

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: ({ applicationId, data }: { applicationId: string; data: any }) =>
      withdrawApplicant(applicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainees-list"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawn-applicants"] });
      queryClient.invalidateQueries({ queryKey: ["scholar-category-stats"] });
      addToast("Applicant withdrawn. Record will be removed after 3 months.", "success");
      setShowWithdrawModal(false);
      setSelectedRecord(null);
    },
    onError: (error: any) => {
      addToast(error.response?.data?.message || "Failed to withdraw applicant", "error");
    },
  });

  // Blacklist mutation
  const blacklistMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      blacklistPerson(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blacklisted-persons"] });
      queryClient.invalidateQueries({ queryKey: ["scholar-category-stats"] });
      addToast("Person added to blacklist", "success");
      setShowBlacklistModal(false);
      setSelectedRecord(null);
    },
    onError: (error: any) => {
      addToast(error.response?.data?.message || "Failed to blacklist person", "error");
    },
  });

  // Remove from blacklist mutation
  const removeBlacklistMutation = useMutation({
    mutationFn: (recordId: string) => removeFromBlacklist(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blacklisted-persons"] });
      queryClient.invalidateQueries({ queryKey: ["scholar-category-stats"] });
      addToast("Person removed from blacklist", "success");
    },
    onError: (error: any) => {
      addToast(error.response?.data?.message || "Failed to remove from blacklist", "error");
    },
  });

  // Cleanup mutation
  const cleanupMutation = useMutation({
    mutationFn: triggerCategoryCleanup,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["withdrawn-applicants"] });
      queryClient.invalidateQueries({ queryKey: ["blacklisted-persons"] });
      queryClient.invalidateQueries({ queryKey: ["scholar-category-stats"] });
      addToast(
        `Cleanup complete: ${data.withdrawnRemoved} withdrawn, ${data.blacklistRemoved} blacklisted removed`,
        "success"
      );
    },
  });

  // Generate reports
  const handleGenerateReport = async () => {
    try {
      if (activeTab === "scholars") {
        const scholars = scholarsData?.scholars || [];
        if (scholars.length === 0) {
          addToast("No scholars to generate report", "warning");
          return;
        }
        generateActiveScholarsReport(scholars);
      } else if (activeTab === "trainees") {
        const trainees = traineesData?.trainees || [];
        if (trainees.length === 0) {
          addToast("No trainees to generate report", "warning");
          return;
        }
        generateTraineesReport(trainees);
      } else {
        const reportData = await getCategoryReportData({
          category: activeTab === "archive" ? "graduated" : activeTab === "withdrawn" ? "withdrawn" : "blacklisted",
        });
        
        if (reportData.records.length === 0) {
          addToast("No records to generate report", "warning");
          return;
        }

        if (activeTab === "archive") {
          generateArchivedScholarsReport(reportData);
        } else if (activeTab === "withdrawn") {
          generateWithdrawnReport(reportData);
        } else if (activeTab === "blacklist") {
          generateBlacklistReport(reportData);
        }
      }
      addToast("Report generated successfully", "success");
    } catch (error) {
      addToast("Failed to generate report", "error");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntilExpiry = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const tabs = [
    { id: "scholars" as TabType, label: "Scholars", icon: GraduationCap, count: stats.scholars, color: "text-blue-600" },
    { id: "trainees" as TabType, label: "Trainees", icon: Users, count: stats.trainees, color: "text-cyan-600" },
    { id: "archive" as TabType, label: "Archive", icon: Archive, count: stats.archived, color: "text-green-600" },
    { id: "withdrawn" as TabType, label: "Withdrawn", icon: UserX, count: stats.withdrawn, color: "text-amber-600" },
    { id: "blacklist" as TabType, label: "Blacklist", icon: Ban, count: stats.blacklisted, color: "text-red-600" },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
      <HRSidebar
        currentPage="Scholar Categories"
        onCollapseChange={setIsSidebarCollapsed}
      />

      <div
        className={`flex-1 pt-16 md:pt-[81px] transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Header */}
        <div
          className={`hidden md:flex items-center justify-between gap-4 fixed top-0 left-0 z-30 bg-gradient-to-r from-red-600 to-red-700 h-[81px] ${
            isSidebarCollapsed
              ? "md:w-[calc(100%-5rem)] md:ml-20"
              : "md:w-[calc(100%-16rem)] md:ml-64"
          }`}
        >
          <div className="flex items-center gap-4">
            <Users className="ml-4 h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Scholar Categories</h1>
          </div>
          <div className="flex items-center gap-3 mr-4">
            <Button
              onClick={() => cleanupMutation.mutate()}
              disabled={cleanupMutation.isPending}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${cleanupMutation.isPending ? "animate-spin" : ""}`} />
              Cleanup Expired
            </Button>
            <Button
              onClick={handleGenerateReport}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Download className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        <div className="p-6 md:p-10">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {tabs.map((tab) => (
              <Card
                key={tab.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  activeTab === tab.id ? "ring-2 ring-red-500 shadow-lg" : ""
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{tab.label}</p>
                      <p className={`text-2xl font-bold ${tab.color}`}>{tab.count}</p>
                    </div>
                    <tab.icon className={`h-8 w-8 ${tab.color} opacity-50`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {(activeTab === "scholars" || activeTab === "trainees" || activeTab === "archive") && (
                  <>
                    <div>
                      <Label htmlFor="office">Office</Label>
                      <select
                        id="office"
                        title="Filter by office"
                        value={selectedOffice}
                        onChange={(e) => setSelectedOffice(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                      >
                        <option value="">All Offices</option>
                        {(offices as string[]).map((office) => (
                          <option key={office} value={office}>{office}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="type">Type</Label>
                      <select
                        id="type"
                        title="Filter by type"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                      >
                        <option value="">All Types</option>
                        <option value="student_assistant">Student Assistant</option>
                        <option value="student_marshal">Student Marshal</option>
                      </select>
                    </div>
                  </>
                )}

                {activeTab === "archive" && (
                  <div>
                    <Label htmlFor="year">Academic Year</Label>
                    <select
                      id="year"
                      title="Filter by academic year"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                    >
                      <option value="">All Years</option>
                      {archivedData?.academicYears?.map((year: string) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tab Content */}
          <Card>
            <CardContent className="pt-6">
              {/* Scholars Tab */}
              {activeTab === "scholars" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                      Active Scholars ({scholarsData?.scholars?.length || 0})
                    </h2>
                  </div>

                  {loadingScholars ? (
                    <div className="text-center py-12">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                      <p className="text-gray-500 mt-2">Loading scholars...</p>
                    </div>
                  ) : scholarsData?.scholars?.length > 0 ? (
                    <div className="space-y-3">
                      {scholarsData.scholars.map((scholar: any) => {
                        const user = scholar.userId || {};
                        return (
                          <div
                            key={scholar._id}
                            className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                  <GraduationCap className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium">{user.firstname} {user.lastname}</p>
                                  <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  scholar.scholarType === "student_assistant"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-purple-100 text-purple-800"
                                }`}>
                                  {scholar.scholarType === "student_assistant" ? "SA" : "SM"}
                                </span>
                                <span className="text-sm text-gray-500">
                                  <Building className="w-4 h-4 inline mr-1" />
                                  {scholar.scholarOffice || "N/A"}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedRecord(scholar);
                                    setShowGraduateModal(true);
                                  }}
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Graduate
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedRecord({
                                      ...scholar,
                                      userId: user._id,
                                      scholarId: scholar._id,
                                    });
                                    setShowBlacklistModal(true);
                                  }}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <Ban className="w-4 h-4 mr-1" />
                                  Blacklist
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No active scholars found</p>
                    </div>
                  )}
                </div>
              )}

              {/* Trainees Tab */}
              {activeTab === "trainees" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="w-5 h-5 text-cyan-600" />
                      Trainees ({traineesData?.trainees?.length || 0})
                    </h2>
                  </div>

                  {loadingTrainees ? (
                    <div className="text-center py-12">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                      <p className="text-gray-500 mt-2">Loading trainees...</p>
                    </div>
                  ) : traineesData?.trainees?.length > 0 ? (
                    <div className="space-y-3">
                      {traineesData.trainees.map((trainee: any) => {
                        const user = trainee.userID || {};
                        return (
                          <div
                            key={trainee._id}
                            className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900 flex items-center justify-center">
                                  <Users className="w-5 h-5 text-cyan-600" />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {trainee.firstName || user.firstname} {trainee.lastName || user.lastname}
                                  </p>
                                  <p className="text-sm text-gray-500">{trainee.email || user.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  trainee.status === "trainee"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}>
                                  {trainee.status}
                                </span>
                                <span className="text-sm text-gray-500">
                                  <Building className="w-4 h-4 inline mr-1" />
                                  {trainee.traineeOffice || "N/A"}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedRecord(trainee);
                                    setShowWithdrawModal(true);
                                  }}
                                  className="text-amber-600 border-amber-200 hover:bg-amber-50"
                                >
                                  <UserX className="w-4 h-4 mr-1" />
                                  Withdraw
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedRecord({
                                      ...trainee,
                                      userId: user._id || trainee.userID,
                                      applicationId: trainee._id,
                                    });
                                    setShowBlacklistModal(true);
                                  }}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <Ban className="w-4 h-4 mr-1" />
                                  Blacklist
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No trainees found</p>
                    </div>
                  )}
                </div>
              )}

              {/* Archive Tab */}
              {activeTab === "archive" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Archive className="w-5 h-5 text-green-600" />
                      Archived Graduated Scholars ({archivedData?.records?.length || 0})
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4" />
                      Protected Records (Cannot be deleted)
                    </div>
                  </div>

                  {loadingArchived ? (
                    <div className="text-center py-12">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                      <p className="text-gray-500 mt-2">Loading archived graduated scholars...</p>
                    </div>
                  ) : archivedData?.records?.length > 0 ? (
                    <div className="space-y-3">
                      {archivedData.records.map((record: any) => (
                        <div
                          key={record._id}
                          className="border border-green-200 rounded-lg p-4 bg-green-50/30 dark:bg-green-900/10"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                <Archive className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium">{record.firstName} {record.lastName}</p>
                                <p className="text-sm text-gray-500">{record.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                record.scholarType === "student_assistant"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}>
                                {record.scholarType === "student_assistant" ? "SA" : "SM"}
                              </span>
                              <span className="text-sm text-gray-500">
                                <Building className="w-4 h-4 inline mr-1" />
                                {record.scholarOffice || "N/A"}
                              </span>
                              <span className="text-sm text-gray-500">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                {formatDate(record.graduationDate)}
                              </span>
                              <span className="text-sm text-green-600">
                                {record.totalServiceMonths || 0} months
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Archive className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No archived graduated scholars found</p>
                    </div>
                  )}
                </div>
              )}

              {/* Withdrawn Tab */}
              {activeTab === "withdrawn" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <UserX className="w-5 h-5 text-amber-600" />
                      Withdrawn Applicants ({withdrawnData?.records?.length || 0})
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                      <Clock className="w-4 h-4" />
                      Auto-removed after 3 months
                    </div>
                  </div>

                  {loadingWithdrawn ? (
                    <div className="text-center py-12">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                      <p className="text-gray-500 mt-2">Loading withdrawn applicants...</p>
                    </div>
                  ) : withdrawnData?.records?.length > 0 ? (
                    <div className="space-y-3">
                      {withdrawnData.records.map((record: any) => {
                        const daysLeft = getDaysUntilExpiry(record.expiresAt);
                        return (
                          <div
                            key={record._id}
                            className="border border-amber-200 rounded-lg p-4 bg-amber-50/30 dark:bg-amber-900/10"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                                  <UserX className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                  <p className="font-medium">{record.firstName} {record.lastName}</p>
                                  <p className="text-sm text-gray-500">{record.email}</p>
                                  {record.withdrawalReason && (
                                    <p className="text-xs text-amber-600 mt-1">
                                      Reason: {record.withdrawalReason}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500">
                                  <Calendar className="w-4 h-4 inline mr-1" />
                                  {formatDate(record.withdrawalDate)}
                                </span>
                                {daysLeft !== null && (
                                  <span className={`text-sm px-2 py-1 rounded ${
                                    daysLeft <= 7 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                                  }`}>
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    {daysLeft > 0 ? `${daysLeft} days left` : "Expiring soon"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <UserX className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No withdrawn applicants found</p>
                    </div>
                  )}
                </div>
              )}

              {/* Blacklist Tab */}
              {activeTab === "blacklist" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Ban className="w-5 h-5 text-red-600" />
                      Blacklisted Persons ({blacklistedData?.records?.length || 0})
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                      <AlertTriangle className="w-4 h-4" />
                      Cannot apply/reapply
                    </div>
                  </div>

                  {loadingBlacklisted ? (
                    <div className="text-center py-12">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                      <p className="text-gray-500 mt-2">Loading blacklisted persons...</p>
                    </div>
                  ) : blacklistedData?.records?.length > 0 ? (
                    <div className="space-y-3">
                      {blacklistedData.records.map((record: any) => {
                        const daysLeft = getDaysUntilExpiry(record.blacklistExpiresAt);
                        const isPermanent = !record.blacklistExpiresAt || record.restrictionPeriod === 0;
                        return (
                          <div
                            key={record._id}
                            className="border border-red-200 rounded-lg p-4 bg-red-50/30 dark:bg-red-900/10"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                                  <Ban className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                  <p className="font-medium">{record.firstName} {record.lastName}</p>
                                  <p className="text-sm text-gray-500">{record.email}</p>
                                  {record.blacklistReason && (
                                    <p className="text-xs text-red-600 mt-1">
                                      Reason: {record.blacklistReason}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500">
                                  <Calendar className="w-4 h-4 inline mr-1" />
                                  {formatDate(record.blacklistDate)}
                                </span>
                                <span className={`text-sm px-2 py-1 rounded font-medium ${
                                  isPermanent 
                                    ? "bg-red-200 text-red-800" 
                                    : "bg-amber-100 text-amber-700"
                                }`}>
                                  {isPermanent ? "Permanent" : `${record.restrictionPeriod} months`}
                                </span>
                                {!isPermanent && daysLeft !== null && (
                                  <span className="text-sm text-gray-500">
                                    {daysLeft > 0 ? `${daysLeft} days left` : "Expiring soon"}
                                  </span>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeBlacklistMutation.mutate(record._id)}
                                  disabled={removeBlacklistMutation.isPending}
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Ban className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No blacklisted persons found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Graduate Modal */}
      {showGraduateModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Graduate Scholar
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Moving <strong>{selectedRecord.userId?.firstname} {selectedRecord.userId?.lastname}</strong> to Archive.
              This record will be permanently protected.
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="graduationDate">Graduation Date</Label>
                <Input
                  id="graduationDate"
                  type="date"
                  value={graduateForm.graduationDate}
                  onChange={(e) => setGraduateForm({ ...graduateForm, graduationDate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input
                  id="academicYear"
                  value={graduateForm.academicYear}
                  onChange={(e) => setGraduateForm({ ...graduateForm, academicYear: e.target.value })}
                  placeholder="e.g., 2024-2025"
                />
              </div>

              <div>
                <Label htmlFor="serviceMonths">Total Service Months</Label>
                <Input
                  id="serviceMonths"
                  type="number"
                  value={graduateForm.totalServiceMonths}
                  onChange={(e) => setGraduateForm({ ...graduateForm, totalServiceMonths: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <textarea
                  id="notes"
                  value={graduateForm.notes}
                  onChange={(e) => setGraduateForm({ ...graduateForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowGraduateModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  graduateMutation.mutate({
                    scholarId: selectedRecord._id,
                    data: graduateForm,
                  });
                }}
                disabled={graduateMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {graduateMutation.isPending ? "Graduating..." : "Graduate & Archive"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserX className="w-5 h-5 text-amber-600" />
              Withdraw Applicant
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Withdrawing <strong>{selectedRecord.firstName || selectedRecord.userID?.firstname} {selectedRecord.lastName || selectedRecord.userID?.lastname}</strong>.
              This record will be automatically removed after 3 months.
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="withdrawReason">Reason for Withdrawal *</Label>
                <textarea
                  id="withdrawReason"
                  value={withdrawForm.reason}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                  rows={3}
                  placeholder="Why is this applicant withdrawing?"
                  required
                />
              </div>

              <div>
                <Label htmlFor="withdrawNotes">Additional Notes (optional)</Label>
                <textarea
                  id="withdrawNotes"
                  value={withdrawForm.notes}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowWithdrawModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!withdrawForm.reason.trim()) {
                    addToast("Please provide a reason for withdrawal", "warning");
                    return;
                  }
                  withdrawMutation.mutate({
                    applicationId: selectedRecord._id,
                    data: withdrawForm,
                  });
                }}
                disabled={withdrawMutation.isPending}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {withdrawMutation.isPending ? "Withdrawing..." : "Withdraw"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Blacklist Modal */}
      {showBlacklistModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-600" />
              Add to Blacklist
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Blacklisting <strong>{selectedRecord.firstName || selectedRecord.userId?.firstname} {selectedRecord.lastName || selectedRecord.userId?.lastname}</strong>.
              This person will not be able to apply or reapply.
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="blacklistReason">Reason for Blacklisting *</Label>
                <textarea
                  id="blacklistReason"
                  value={blacklistForm.reason}
                  onChange={(e) => setBlacklistForm({ ...blacklistForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                  rows={3}
                  placeholder="Why is this person being blacklisted?"
                  required
                />
              </div>

              <div>
                <Label htmlFor="restrictionPeriod">Restriction Period</Label>
                <select
                  id="restrictionPeriod"
                  title="Select restriction period"
                  value={blacklistForm.restrictionPeriod}
                  onChange={(e) => setBlacklistForm({ ...blacklistForm, restrictionPeriod: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                >
                  <option value={0}>Permanent (Never expires)</option>
                  <option value={6}>6 months</option>
                  <option value={12}>1 year</option>
                  <option value={24}>2 years</option>
                  <option value={36}>3 years</option>
                  <option value={60}>5 years</option>
                </select>
              </div>

              <div>
                <Label htmlFor="blacklistNotes">Additional Notes (optional)</Label>
                <textarea
                  id="blacklistNotes"
                  value={blacklistForm.notes}
                  onChange={(e) => setBlacklistForm({ ...blacklistForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mt-4">
              <p className="text-sm text-red-700 dark:text-red-300">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                This action will prevent the person from submitting new applications.
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowBlacklistModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!blacklistForm.reason.trim()) {
                    addToast("Please provide a reason for blacklisting", "warning");
                    return;
                  }
                  blacklistMutation.mutate({
                    userId: selectedRecord.userId || selectedRecord.userID?._id || selectedRecord._id,
                    data: {
                      ...blacklistForm,
                      applicationId: selectedRecord.applicationId || selectedRecord._id,
                      scholarId: selectedRecord.scholarId,
                    },
                  });
                }}
                disabled={blacklistMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {blacklistMutation.isPending ? "Adding..." : "Add to Blacklist"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScholarCategories;
