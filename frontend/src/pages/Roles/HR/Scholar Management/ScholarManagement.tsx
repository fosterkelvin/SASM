import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  Building,
  Calendar,
  Clock,
  Search,
  X,
  Star,
  FileText,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  AlertTriangle,
  Download,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllScholars,
  deployScholar,
  updateScholarDeployment,
  undeployScholar,
  getOfficeUsers,
  getUserDTRForOffice,
  getClassSchedule,
  resetScholarsToApplicants,
  getMasterlistData,
} from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import HRSidebar from "@/components/sidebar/HR/HRSidebar";
import ScheduleVisualization from "@/pages/Roles/Student/Schedule/components/ScheduleVisualization";
import { CustomAlert, useCustomAlert } from "@/components/ui/custom-alert";
import { generateMasterlistPDF } from "@/utils/pdfGenerator";

const ScholarManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showEndSemesterModal, setShowEndSemesterModal] = useState(false);
  const { alertState, showAlert, closeAlert } = useCustomAlert();

  // Filters
  const [filters, setFilters] = useState({
    office: "",
    status: "",
    scholarType: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [officeSearchTerm, setOfficeSearchTerm] = useState("");
  const [showOfficeDropdown, setShowOfficeDropdown] = useState(false);
  const [selectedScholar, setSelectedScholar] = useState<any>(null);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"dtr" | "leave" | "schedule">(
    "dtr"
  );
  const [deploymentData, setDeploymentData] = useState({
    scholarOffice: "",
    scholarSupervisor: "",
    requiredHours: "",
    completedHours: "",
    scholarNotes: "",
    scholarType: "",
  });

  // DTR and Schedule data
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dtrData, setDtrData] = useState<any>(null);
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [loadingDTR, setLoadingDTR] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // Fetch scholars
  const { data: scholarsData, isLoading } = useQuery({
    queryKey: ["scholars", filters],
    queryFn: () => getAllScholars(filters),
  });

  // Fetch office users for dropdown
  const { data: officeUsersData, isLoading: isLoadingOffices } = useQuery({
    queryKey: ["office-users"],
    queryFn: getOfficeUsers,
  });

  const officeUsers = officeUsersData?.users || [];

  console.log("Office Users Data:", officeUsersData);
  console.log("Office Users Array:", officeUsers);

  // Deploy scholar mutation
  const deployMutation = useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string;
      data: any;
    }) => deployScholar(applicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scholars"] });
      closeDeployModal();
      showAlert("Success", "Scholar deployed successfully!", "success");
    },
    onError: (error: any) => {
      showAlert(
        "Error",
        error.response?.data?.message || "Failed to deploy scholar",
        "error"
      );
    },
  });

  // Update deployment mutation
  const updateMutation = useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string;
      data: any;
    }) => updateScholarDeployment(applicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scholars"] });
      closeDeployModal();
      showAlert("Success", "Deployment updated successfully!", "success");
    },
    onError: (error: any) => {
      showAlert(
        "Error",
        error.response?.data?.message || "Failed to update deployment",
        "error"
      );
    },
  });

  // Undeploy scholar mutation
  const undeployMutation = useMutation({
    mutationFn: (applicationId: string) => undeployScholar(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scholars"] });
      showAlert("Success", "Scholar undeployed successfully!", "success");
    },
    onError: (error: any) => {
      showAlert(
        "Error",
        error.response?.data?.message || "Failed to update deployment",
        "error"
      );
    },
  });

  const closeDeployModal = () => {
    setShowDeployModal(false);
    setSelectedScholar(null);
    setOfficeSearchTerm("");
    setShowOfficeDropdown(false);
    setDeploymentData({
      scholarOffice: "",
      scholarSupervisor: "",
      requiredHours: "",
      completedHours: "",
      scholarNotes: "",
      scholarType: "",
    });
  };

  const handleDeployClick = (scholar: any) => {
    setSelectedScholar(scholar);

    // For accepted scholars, start with fresh deployment data
    // Don't pre-fill with trainee deployment info
    if (scholar.status === "accepted") {
      setDeploymentData({
        scholarOffice: "",
        scholarSupervisor: "",
        requiredHours: "",
        completedHours: "0",
        scholarNotes: "",
        scholarType: scholar.position || "",
      });
    } else {
      // For other statuses, pre-fill with existing data
      setDeploymentData({
        scholarOffice: scholar.scholarOffice || scholar.traineeOffice || "",
        scholarSupervisor: scholar.traineeSupervisor?._id || "",
        requiredHours: scholar.requiredHours?.toString() || "",
        completedHours: scholar.dtrCompletedHours?.toString() || "0",
        scholarNotes: scholar.scholarNotes || scholar.traineeNotes || "",
        scholarType: scholar.position || "",
      });
    }

    setShowDeployModal(true);
  };

  const handleViewDetails = async (scholar: any) => {
    setSelectedScholar(scholar);
    setActiveTab("dtr");
    setShowDetailsModal(true);

    // Fetch DTR data
    if (scholar.userID?._id) {
      await fetchDTRData(scholar.userID._id);
      await fetchScheduleData(scholar.userID._id);
    }
  };

  const fetchDTRData = async (userId: string) => {
    setLoadingDTR(true);
    try {
      const response = await getUserDTRForOffice(
        userId,
        selectedMonth,
        selectedYear
      );
      setDtrData(response.dtr);
    } catch (error) {
      console.error("Error fetching DTR:", error);
      showAlert("Error", "Failed to load DTR data. Please try again.", "error");
    } finally {
      setLoadingDTR(false);
    }
  };

  const fetchScheduleData = async (userId: string) => {
    setLoadingSchedule(true);
    try {
      const response = await getClassSchedule(userId);
      setScheduleData(response);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      showAlert(
        "Error",
        "Failed to load schedule data. Please try again.",
        "error"
      );
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleMonthYearChange = async (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    if (selectedScholar?.userID?._id) {
      // Fetch DTR with the new month/year values directly
      setLoadingDTR(true);
      try {
        const response = await getUserDTRForOffice(
          selectedScholar.userID._id,
          month,
          year
        );
        setDtrData(response.dtr);
      } catch (error) {
        console.error("Error fetching DTR:", error);
        showAlert(
          "Error",
          "Failed to load DTR data. Please try again.",
          "error"
        );
      } finally {
        setLoadingDTR(false);
      }
    }
  };

  const handleSubmitDeployment = () => {
    if (!selectedScholar) return;

    const data: any = {
      traineeOffice: deploymentData.scholarOffice,
    };

    if (deploymentData.scholarNotes)
      data.traineeNotes = deploymentData.scholarNotes;

    // For scholars with existing deployment, update it
    if (selectedScholar.scholarOffice || selectedScholar.traineeOffice) {
      updateMutation.mutate({
        applicationId: selectedScholar._id,
        data,
      });
    } else {
      // New deployment (first time deploying)
      deployMutation.mutate({
        applicationId: selectedScholar._id,
        data,
      });
    }
  };

  const scholars = scholarsData?.trainees || [];

  // Filter scholars by search term
  const filteredScholars = scholars.filter((scholar: any) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName =
      `${scholar.userID?.firstname} ${scholar.userID?.lastname}`.toLowerCase();
    const office = (
      scholar.scholarOffice ||
      scholar.traineeOffice ||
      ""
    ).toLowerCase();
    const type = (scholar.position || "").toLowerCase();
    return (
      fullName.includes(searchLower) ||
      office.includes(searchLower) ||
      type.includes(searchLower)
    );
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getScholarTypeLabel = (position: string) => {
    // Handle both database formats
    if (position === "student_assistant" || position === "SA")
      return "Student Assistant";
    if (position === "student_marshal" || position === "SM")
      return "Student Marshal";
    // Fallback: capitalize and format the string nicely
    return position
      ? position.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
      : "Unknown";
  };

  const getScholarTypeBadgeColor = (position: string) => {
    if (position === "student_assistant" || position === "SA")
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (position === "student_marshal" || position === "SM")
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  const handleEndSemester = async () => {
    // Show custom modal instead of window.confirm
    setShowEndSemesterModal(true);
  };

  const confirmEndSemester = async () => {
    setShowEndSemesterModal(false);
    setIsResetting(true);

    try {
      const result = await resetScholarsToApplicants();

      addToast(
        `Successfully reset ${result.details.usersUpdated} scholars to reapplicant status and deleted ${result.details.schedulesDeleted} schedules. They can now reapply for the new semester.`,
        "success"
      );

      // Refresh all relevant queries to update user status and sidebar visibility
      queryClient.invalidateQueries({ queryKey: ["scholars"] });
      queryClient.invalidateQueries({ queryKey: ["userApplications"] });
      queryClient.invalidateQueries({ queryKey: ["myScholarInfo"] });
      queryClient.invalidateQueries({ queryKey: ["userData"] });

      console.log("End Semester Result:", result);
    } catch (error: any) {
      console.error("Error resetting scholars:", error);
      addToast(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to reset scholars. Please try again.",
        "error"
      );
    } finally {
      setIsResetting(false);
    }
  };

  const handleGenerateMasterlist = async () => {
    try {
      showAlert("Generating...", "Fetching masterlist data...", "info");
      const response = await getMasterlistData();

      if (response.success) {
        generateMasterlistPDF(response.data);
        showAlert(
          "Success",
          "Masterlist PDF generated successfully!",
          "success"
        );
      } else {
        throw new Error("Failed to fetch masterlist data");
      }
    } catch (error: any) {
      console.error("Error generating masterlist:", error);
      showAlert(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "Failed to generate masterlist. Please try again.",
        "error"
      );
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
      <HRSidebar
        currentPage="Scholars"
        onCollapseChange={setIsSidebarCollapsed}
      />

      <div
        className={`flex-1 pt-16 md:pt-[81px] transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <div
          className={`hidden md:flex items-center justify-between gap-4 fixed top-0 left-0 z-30 bg-gradient-to-r from-red-600 to-red-700 h-[81px] ${
            isSidebarCollapsed
              ? "md:w-[calc(100%-5rem)] md:ml-20"
              : "md:w-[calc(100%-16rem)] md:ml-64"
          }`}
        >
          <h1 className="text-2xl font-bold text-white ml-4">
            Scholar Management
          </h1>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={handleGenerateMasterlist}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Masterlist PDF
            </Button>

            <Button
              type="button"
              onClick={handleEndSemester}
              disabled={isResetting}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold mr-4 shadow-lg"
            >
              {isResetting ? "Resetting..." : "🔄 End Semester"}
            </Button>
          </div>
        </div>

        <div className="p-6 md:p-10">
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
                      placeholder="Search by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="office">Filter by Office</Label>
                  <Input
                    id="office"
                    placeholder="Office name..."
                    value={filters.office}
                    onChange={(e) =>
                      setFilters({ ...filters, office: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="scholarType">Scholar Type</Label>
                  <select
                    id="scholarType"
                    aria-label="Filter by scholar type"
                    value={filters.scholarType}
                    onChange={(e) =>
                      setFilters({ ...filters, scholarType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                  >
                    <option value="">All Types</option>
                    <option value="SA">Student Assistant</option>
                    <option value="SM">Student Marshal</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="status">Filter by Status</Label>
                  <select
                    id="status"
                    aria-label="Filter by status"
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                  >
                    <option value="">All Statuses</option>
                    <option value="accepted">Accepted</option>
                    <option value="pending_office_interview">
                      Pending Office Interview
                    </option>
                    <option value="office_interview_scheduled">
                      Interview Scheduled
                    </option>
                    <option value="trainee">Active Scholar</option>
                    <option value="training_completed">
                      Training Completed
                    </option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scholars List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading scholars...
              </p>
            </div>
          ) : filteredScholars.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <GraduationCap className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No scholars found
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScholars.map((scholar: any) => (
                <Card
                  key={scholar._id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {scholar.userID?.firstname} {scholar.userID?.lastname}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {scholar.userID?.email}
                        </p>
                        <span
                          className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full ${getScholarTypeBadgeColor(
                            scholar.position
                          )}`}
                        >
                          {getScholarTypeLabel(scholar.position)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      {/* Show current office for scholars */}
                      {scholar.status === "accepted" &&
                        scholar.scholarOffice && (
                          <div className="flex items-center gap-2 text-sm">
                            <Building className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700 dark:text-gray-300">
                              Office: {scholar.scholarOffice}
                            </span>
                          </div>
                        )}
                      {/* Show previous trainee office if exists but no scholar office yet */}
                      {scholar.status === "accepted" &&
                        !scholar.scholarOffice &&
                        scholar.traineeOffice && (
                          <div className="flex items-center gap-2 text-sm">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-500 dark:text-gray-400 italic">
                              Previous (as trainee): {scholar.traineeOffice}
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Office Rating - Only show if NOT deployed */}
                    {scholar.traineePerformanceRating &&
                      !scholar.scholarOffice && (
                        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/30">
                          <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400 mb-2">
                            Office Performance Rating:
                          </p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-5 h-5 ${
                                  star <= scholar.traineePerformanceRating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {scholar.traineePerformanceRating}/5
                            </span>
                          </div>
                        </div>
                      )}

                    {/* Deploy/Redeploy/Undeploy Buttons */}
                    {scholar.scholarOffice ? (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDeployClick(scholar)}
                          variant="outline"
                          className="flex-1 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          Redeploy Scholar
                        </Button>
                        <Button
                          onClick={() => {
                            if (
                              confirm(
                                `Are you sure you want to undeploy ${scholar.userID?.firstname} ${scholar.userID?.lastname}?`
                              )
                            ) {
                              undeployMutation.mutate(scholar._id);
                            }
                          }}
                          variant="outline"
                          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900/20"
                        >
                          Undeploy
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleDeployClick(scholar)}
                        className="w-full bg-red-600 hover:bg-red-700"
                      >
                        Deploy Scholar
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Deploy/Update Modal */}
      {showDeployModal && selectedScholar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedScholar.scholarOffice ||
                  selectedScholar.traineeOffice
                    ? "Update Deployment"
                    : "Deploy Scholar to Office"}
                </h2>
                {!selectedScholar.scholarOffice &&
                  selectedScholar.traineeOffice && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Creating scholar deployment (previous trainee data will
                      not be used)
                    </p>
                  )}
              </div>
              <button
                onClick={closeDeployModal}
                aria-label="Close deploy modal"
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Scholar Info */}
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Scholar Information
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Name:</strong> {selectedScholar.userID?.firstname}{" "}
                  {selectedScholar.userID?.lastname}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Email:</strong> {selectedScholar.userID?.email}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Type:</strong>{" "}
                  {getScholarTypeLabel(selectedScholar.position)}
                </p>
              </div>

              {/* Office Selection with Autocomplete */}
              <div>
                <Label>Office *</Label>
                {deploymentData.scholarOffice && (
                  <div className="mb-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded flex items-center justify-between">
                    <span className="text-sm text-gray-900 dark:text-white">
                      Selected: <strong>{deploymentData.scholarOffice}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setDeploymentData({
                          ...deploymentData,
                          scholarOffice: "",
                        });
                        setOfficeSearchTerm("");
                      }}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs"
                    >
                      Clear
                    </button>
                  </div>
                )}
                <div className="relative">
                  <Input
                    placeholder="Search and select office..."
                    value={officeSearchTerm}
                    onChange={(e) => {
                      setOfficeSearchTerm(e.target.value);
                      setShowOfficeDropdown(true);
                    }}
                    onFocus={() => setShowOfficeDropdown(true)}
                  />
                  {(() => {
                    if (!showOfficeDropdown) return null;

                    const searchLower = officeSearchTerm.toLowerCase();
                    const filteredOffices = officeUsers.filter(
                      (office: any) => {
                        if (!searchLower) return true;
                        const fullName =
                          `${office.firstname} ${office.lastname}`.toLowerCase();
                        const officeName = (
                          office.officeName ||
                          office.office ||
                          ""
                        ).toLowerCase();
                        return (
                          fullName.includes(searchLower) ||
                          officeName.includes(searchLower)
                        );
                      }
                    );

                    return (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredOffices.length > 0 && (
                          <div className="sticky top-0 bg-gray-50 dark:bg-gray-700 px-4 py-2 text-xs text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                            {filteredOffices.length} office
                            {filteredOffices.length !== 1 ? "s" : ""} available
                          </div>
                        )}
                        {filteredOffices.map((office: any) => (
                          <div
                            key={office._id}
                            onClick={() => {
                              setDeploymentData({
                                ...deploymentData,
                                scholarOffice:
                                  office.officeName ||
                                  office.office ||
                                  office.firstname,
                              });
                              setOfficeSearchTerm("");
                              setShowOfficeDropdown(false);
                            }}
                            className="px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer text-gray-900 dark:text-white"
                          >
                            <div>
                              <div className="font-medium">
                                {office.officeName ||
                                  `${office.firstname} ${office.lastname}`}
                              </div>
                              {office.officeName && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {office.firstname} {office.lastname}
                                </div>
                              )}
                              {!office.officeName && office.office && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Office: {office.office}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {filteredOffices.length === 0 && (
                          <div className="px-4 py-3 text-center">
                            <p className="text-gray-500 text-sm">
                              No offices found matching "{officeSearchTerm}"
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setOfficeSearchTerm("");
                              }}
                              className="mt-2 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Clear search to see all offices
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  {showOfficeDropdown && (
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowOfficeDropdown(false)}
                    />
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label>Notes (Optional)</Label>
                <textarea
                  placeholder="Additional notes..."
                  value={deploymentData.scholarNotes}
                  onChange={(e) =>
                    setDeploymentData({
                      ...deploymentData,
                      scholarNotes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 min-h-[100px]"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleSubmitDeployment}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={!deploymentData.scholarOffice}
                >
                  {selectedScholar.scholarOffice ||
                  selectedScholar.traineeOffice
                    ? "Update Deployment"
                    : "Deploy Scholar"}
                </Button>
                <Button
                  onClick={closeDeployModal}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal (DTR, Leave, Schedule) */}
      {showDetailsModal && selectedScholar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Scholar Details - {selectedScholar.userID?.firstname}{" "}
                {selectedScholar.userID?.lastname}
              </h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedScholar(null);
                  setDtrData(null);
                  setScheduleData(null);
                }}
                aria-label="Close details modal"
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 px-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab("dtr")}
                  className={`py-3 px-4 font-medium transition-colors border-b-2 ${
                    activeTab === "dtr"
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <FileText className="inline w-4 h-4 mr-2" />
                  DTR
                </button>
                <button
                  onClick={() => setActiveTab("leave")}
                  className={`py-3 px-4 font-medium transition-colors border-b-2 ${
                    activeTab === "leave"
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <CalendarDays className="inline w-4 h-4 mr-2" />
                  Leave Records
                </button>
                <button
                  onClick={() => setActiveTab("schedule")}
                  className={`py-3 px-4 font-medium transition-colors border-b-2 ${
                    activeTab === "schedule"
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <ClipboardList className="inline w-4 h-4 mr-2" />
                  Class Schedule
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "dtr" && (
                <div>
                  {/* Month/Year Selector */}
                  <div className="flex gap-4 mb-6">
                    <div>
                      <Label>Month</Label>
                      <select
                        value={selectedMonth}
                        aria-label="Select month"
                        onChange={(e) =>
                          handleMonthYearChange(
                            parseInt(e.target.value),
                            selectedYear
                          )
                        }
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          (month) => (
                            <option key={month} value={month}>
                              {new Date(2024, month - 1).toLocaleString(
                                "default",
                                { month: "long" }
                              )}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <div>
                      <Label>Year</Label>
                      <select
                        value={selectedYear}
                        aria-label="Select year"
                        onChange={(e) =>
                          handleMonthYearChange(
                            selectedMonth,
                            parseInt(e.target.value)
                          )
                        }
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                      >
                        {Array.from({ length: 5 }, (_, i) => 2024 + i).map(
                          (year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>

                  {loadingDTR ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                      <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Loading DTR data...
                      </p>
                    </div>
                  ) : dtrData ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                          <CardContent className="pt-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Total Hours
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {dtrData.totalHours || 0}
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Days Present
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {dtrData.totalDaysPresent || 0}
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Days Absent
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {dtrData.totalDaysAbsent || 0}
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Late Count
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {dtrData.lateCount || 0}
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* DTR Records Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Time In
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Time Out
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Hours
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {dtrData.records?.map(
                              (record: any, idx: number) => (
                                <tr key={idx}>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {formatDate(record.date)}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {record.timeIn || "-"}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {record.timeOut || "-"}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {record.hours?.toFixed(2) || "0.00"}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        record.status === "present"
                                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                          : record.status === "late"
                                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                      }`}
                                    >
                                      {record.status}
                                    </span>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      No DTR data available for this period
                    </div>
                  )}
                </div>
              )}

              {activeTab === "leave" && (
                <div className="text-center py-12 text-gray-500">
                  Leave records functionality coming soon...
                </div>
              )}

              {activeTab === "schedule" && (
                <div>
                  {loadingSchedule ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                      <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Loading schedule...
                      </p>
                    </div>
                  ) : scheduleData?.schedule ? (
                    <ScheduleVisualization
                      scheduleClasses={scheduleData.schedule}
                      dutyHours={scheduleData.dutyHours}
                    />
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      No class schedule uploaded yet
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* End Semester Confirmation Modal */}
      {showEndSemesterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border-2 border-orange-500/30">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">End Semester</h3>
                  <p className="text-orange-50 text-sm">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <p className="text-sm font-semibold text-orange-900 dark:text-orange-200 mb-2">
                  ⚠️ WARNING: This will reset ALL accepted scholars
                </p>
                <p className="text-sm text-orange-800 dark:text-orange-300">
                  This action will change their status to{" "}
                  <strong>REAPPLICANT</strong> for the new semester.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  This action will:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-orange-500 font-bold mt-0.5">•</span>
                    <span>
                      Change status from{" "}
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        'accepted'
                      </span>{" "}
                      to{" "}
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        'reapplicant'
                      </span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-orange-500 font-bold mt-0.5">•</span>
                    <span>Delete their class schedules and duty hours</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-orange-500 font-bold mt-0.5">•</span>
                    <span>
                      Archive their applications for historical records
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-orange-500 font-bold mt-0.5">•</span>
                    <span>
                      Preserve their DTR records for historical tracking
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-orange-500 font-bold mt-0.5">•</span>
                    <span>Allow them to reapply for the new semester</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  This should only be performed at the end of a semester when
                  starting a new application cycle. Make sure all evaluations
                  and records are completed before proceeding.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex gap-3 justify-end border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEndSemesterModal(false)}
                disabled={isResetting}
                className="px-6 font-medium"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmEndSemester}
                disabled={isResetting}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 font-semibold shadow-lg"
              >
                {isResetting ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Resetting...
                  </span>
                ) : (
                  "Confirm End Semester"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Modal */}
      <CustomAlert
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
    </div>
  );
};

export default ScholarManagement;
