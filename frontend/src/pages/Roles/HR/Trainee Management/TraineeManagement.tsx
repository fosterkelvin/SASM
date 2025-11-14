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
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllTrainees,
  deployTrainee,
  updateTraineeDeployment,
  getOfficeUsers,
  getUserDTRForOffice,
  getClassSchedule,
} from "@/lib/api";
import HRSidebar from "@/components/sidebar/HR/HRSidebar";
import ScheduleVisualization from "@/pages/Roles/Student/Schedule/components/ScheduleVisualization";

const TraineeManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    office: "",
    status: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [officeSearchTerm, setOfficeSearchTerm] = useState("");
  const [showOfficeDropdown, setShowOfficeDropdown] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState<any>(null);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"dtr" | "leave" | "schedule">(
    "dtr"
  );
  const [deploymentData, setDeploymentData] = useState({
    traineeOffice: "",
    traineeSupervisor: "",
    requiredHours: "130",
    completedHours: "",
    traineeNotes: "",
  });

  // DTR and Schedule data
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dtrData, setDtrData] = useState<any>(null);
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [loadingDTR, setLoadingDTR] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // Fetch trainees
  const { data: traineesData, isLoading } = useQuery({
    queryKey: ["trainees", filters],
    queryFn: () => getAllTrainees(filters),
  });

  // Fetch office users for dropdown
  const { data: officeUsersData, isLoading: isLoadingOffices } = useQuery({
    queryKey: ["office-users"],
    queryFn: getOfficeUsers,
  });

  const officeUsers = officeUsersData?.users || [];

  console.log("Office Users Data:", officeUsersData);
  console.log("Office Users Array:", officeUsers);

  // Deploy trainee mutation
  const deployMutation = useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string;
      data: any;
    }) => deployTrainee(applicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainees"] });
      closeDeployModal();
      alert("Trainee deployed successfully!");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to deploy trainee");
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
    }) => updateTraineeDeployment(applicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainees"] });
      closeDeployModal();
      alert("Deployment updated successfully!");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to update deployment");
    },
  });

  const closeDeployModal = () => {
    setShowDeployModal(false);
    setSelectedTrainee(null);
    setOfficeSearchTerm("");
    setShowOfficeDropdown(false);
    setDeploymentData({
      traineeOffice: "",
      traineeSupervisor: "",
      requiredHours: "130",
      completedHours: "",
      traineeNotes: "",
    });
  };

  const handleDeployClick = (trainee: any) => {
    setSelectedTrainee(trainee);
    setDeploymentData({
      traineeOffice: trainee.traineeOffice || "",
      traineeSupervisor: trainee.traineeSupervisor?._id || "",
      // Required hours are fixed to 130 for all trainees
      requiredHours: "130",
      completedHours: trainee.dtrCompletedHours?.toString() || "0",
      traineeNotes: trainee.traineeNotes || "",
    });
    setShowDeployModal(true);
  };

  const handleViewDetails = async (trainee: any) => {
    setSelectedTrainee(trainee);
    setActiveTab("dtr");
    setShowDetailsModal(true);

    // Fetch DTR data when modal opens
    if (trainee.userID?._id) {
      await fetchDTRData(trainee.userID._id);
    }

    // Fetch schedule data
    if (trainee._id) {
      await fetchScheduleData(trainee._id);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedTrainee(null);
    setActiveTab("dtr");
    setDtrData(null);
    setScheduleData(null);
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
      alert("Failed to load DTR data");
    } finally {
      setLoadingDTR(false);
    }
  };

  const fetchScheduleData = async (applicationId: string) => {
    setLoadingSchedule(true);
    try {
      const response = await getClassSchedule(applicationId);
      console.log("Schedule API response:", response);
      // The response already contains scheduleUrl, scheduleData, and dutyHours
      setScheduleData(response);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      // Don't show error if no schedule exists yet
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleMonthYearChange = async (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    if (selectedTrainee?.userID?._id) {
      // Fetch DTR with the new month/year values directly
      setLoadingDTR(true);
      try {
        const response = await getUserDTRForOffice(
          selectedTrainee.userID._id,
          month,
          year
        );
        setDtrData(response.dtr);
      } catch (error) {
        console.error("Error fetching DTR:", error);
        alert("Failed to load DTR data");
      } finally {
        setLoadingDTR(false);
      }
    }
  };

  const handleSubmitDeployment = () => {
    if (!selectedTrainee) return;

    const data: any = {
      traineeOffice: deploymentData.traineeOffice,
      // Enforce fixed required hours (server also enforces)
      requiredHours: 130,
    };

    if (deploymentData.traineeSupervisor)
      data.traineeSupervisor = deploymentData.traineeSupervisor;
    if (deploymentData.traineeNotes)
      data.traineeNotes = deploymentData.traineeNotes;

    // Check if already deployed (update) or new deployment
    if (selectedTrainee.traineeOffice) {
      // Update existing deployment - performance rating is set by office, not HR
      updateMutation.mutate({
        applicationId: selectedTrainee._id,
        data,
      });
    } else {
      // New deployment
      deployMutation.mutate({
        applicationId: selectedTrainee._id,
        data,
      });
    }
  };

  const trainees = traineesData?.trainees || [];

  // Filter trainees by search term
  const filteredTrainees = trainees.filter((trainee: any) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName =
      `${trainee.userID?.firstname} ${trainee.userID?.lastname}`.toLowerCase();
    const office = (trainee.traineeOffice || "").toLowerCase();
    return fullName.includes(searchLower) || office.includes(searchLower);
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
      <HRSidebar
        currentPage="Trainees"
        onCollapseChange={setIsSidebarCollapsed}
      />

      <div
        className={`flex-1 pt-16 md:pt-[81px] transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <div
          className={`hidden md:flex items-center gap-4 fixed top-0 left-0 z-30 bg-gradient-to-r from-red-600 to-red-700 h-[81px] ${
            isSidebarCollapsed
              ? "md:w-[calc(100%-5rem)] md:ml-20"
              : "md:w-[calc(100%-16rem)] md:ml-64"
          }`}
        >
          <h1 className="text-2xl font-bold text-white ml-4">
            Trainee Management
          </h1>
        </div>

        <div className="p-6 md:p-10">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label htmlFor="status">Filter by Status</Label>
                  <select
                    id="status"
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending_office_interview">
                      Pending Office Interview
                    </option>
                    <option value="office_interview_scheduled">
                      Interview Scheduled
                    </option>
                    <option value="trainee">Active Trainee</option>
                    <option value="training_completed">
                      Training Completed
                    </option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trainees List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading trainees...
              </p>
            </div>
          ) : filteredTrainees.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No trainees found
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrainees.map((trainee: any) => (
                <Card
                  key={trainee._id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {trainee.userID?.firstname} {trainee.userID?.lastname}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {trainee.userID?.email}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {trainee.traineeOffice || (
                            <span className="text-gray-400 italic">
                              Not deployed
                            </span>
                          )}
                        </span>
                      </div>
                      {trainee.traineeStartDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700 dark:text-gray-300">
                            Started: {formatDate(trainee.traineeStartDate)}
                          </span>
                        </div>
                      )}
                      {trainee.requiredHours && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {trainee.dtrCompletedHours || 0} /{" "}
                            {trainee.requiredHours} hours
                            <span className="text-xs text-gray-500 ml-1">
                              (from DTR)
                            </span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Hours Progress Bar */}
                    {trainee.requiredHours && (
                      <div className="mb-4">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-red-600 dark:bg-red-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                ((trainee.dtrCompletedHours || 0) /
                                  trainee.requiredHours) *
                                  100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {(
                            ((trainee.dtrCompletedHours || 0) /
                              (trainee.requiredHours || 1)) *
                            100
                          ).toFixed(1)}
                          % complete
                        </p>
                      </div>
                    )}

                    {/* Office Rating */}
                    {trainee.traineePerformanceRating && (
                      <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/30">
                        <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400 mb-2">
                          Office Performance Rating:
                        </p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= trainee.traineePerformanceRating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {trainee.traineePerformanceRating}/5
                          </span>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={() => handleDeployClick(trainee)}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      {trainee.traineeOffice
                        ? "Update Deployment"
                        : "Deploy to Office"}
                    </Button>

                    {/* Show View Details button only if trainee is deployed */}
                    {trainee.traineeOffice && (
                      <Button
                        onClick={() => handleViewDetails(trainee)}
                        variant="outline"
                        className="w-full mt-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        View DTR, Leave & Schedule
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
      {showDeployModal && selectedTrainee && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              onClick={closeDeployModal}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {selectedTrainee.traineeOffice
                ? "Update Deployment"
                : "Deploy Trainee"}
            </h2>

            <div className="space-y-4">
              <div className="relative">
                <Label htmlFor="traineeOffice">
                  Office Assignment <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="traineeOffice"
                    value={officeSearchTerm || deploymentData.traineeOffice}
                    onChange={(e) => {
                      setOfficeSearchTerm(e.target.value);
                      setShowOfficeDropdown(true);
                      // Clear the selected office if user is actively searching
                      if (e.target.value !== deploymentData.traineeOffice) {
                        setDeploymentData({
                          ...deploymentData,
                          traineeOffice: "",
                        });
                      }
                    }}
                    onFocus={() => setShowOfficeDropdown(true)}
                    disabled={isLoadingOffices}
                    placeholder={
                      isLoadingOffices
                        ? "Loading offices..."
                        : "Type to search offices..."
                    }
                    className="w-full pr-10"
                    autoComplete="off"
                  />
                  {(officeSearchTerm || deploymentData.traineeOffice) &&
                    !isLoadingOffices && (
                      <button
                        type="button"
                        onClick={() => {
                          setOfficeSearchTerm("");
                          setDeploymentData({
                            ...deploymentData,
                            traineeOffice: "",
                          });
                          setShowOfficeDropdown(true);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label="Clear office selection"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                </div>
                {showOfficeDropdown &&
                  officeUsers.length > 0 &&
                  (() => {
                    const filteredOffices = officeUsers.filter(
                      (office: any) => {
                        const searchLower = (
                          officeSearchTerm || ""
                        ).toLowerCase();
                        const fullName =
                          `${office.firstname} ${office.lastname}`.toLowerCase();
                        // Use officeName (preferred) or fall back to office field
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
                              // Use officeName (preferred) or fall back to office field or firstname
                              setDeploymentData({
                                ...deploymentData,
                                traineeOffice:
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
                              {/* Display officeName prominently if available */}
                              <div className="font-medium">
                                {office.officeName ||
                                  `${office.firstname} ${office.lastname}`}
                              </div>
                              {/* Show additional info if officeName is set */}
                              {office.officeName && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {office.firstname} {office.lastname}
                                </div>
                              )}
                              {/* Fallback: show office field if no officeName */}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Required Hours:</Label>
                  <div className="text-gray-900 dark:text-gray-100 ">
                    130 hours
                  </div>
                </div>

                {selectedTrainee.traineeOffice && (
                  <div>
                    <Label htmlFor="completedHours">
                      Completed Hours
                      <span className="text-xs text-gray-500 ml-2">
                        (Auto-calculated from DTR)
                      </span>
                    </Label>
                    <Input
                      id="completedHours"
                      type="number"
                      min="0"
                      value={deploymentData.completedHours}
                      readOnly
                      disabled
                      className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                      placeholder="Calculated from DTR"
                      title="This field is automatically calculated based on the trainee's Daily Time Record (DTR)"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="traineeNotes">Notes (Optional)</Label>
                <textarea
                  id="traineeNotes"
                  rows={3}
                  value={deploymentData.traineeNotes}
                  onChange={(e) =>
                    setDeploymentData({
                      ...deploymentData,
                      traineeNotes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                  placeholder="Any additional notes about the deployment..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" onClick={closeDeployModal}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitDeployment}
                disabled={deployMutation.isPending || updateMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deployMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : selectedTrainee.traineeOffice
                  ? "Update Deployment"
                  : "Deploy Trainee"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Trainee Details Modal with Tabs */}
      {showDetailsModal && selectedTrainee && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden relative flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={closeDetailsModal}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedTrainee.userID?.firstname}{" "}
                {selectedTrainee.userID?.lastname}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  {selectedTrainee.traineeOffice}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {selectedTrainee.dtrCompletedHours || 0} /{" "}
                  {selectedTrainee.requiredHours} hours
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("dtr")}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                    activeTab === "dtr"
                      ? "border-b-2 border-red-600 text-red-600 dark:text-red-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Daily Time Record
                </button>
                <button
                  onClick={() => setActiveTab("leave")}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                    activeTab === "leave"
                      ? "border-b-2 border-red-600 text-red-600 dark:text-red-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <CalendarDays className="w-4 h-4" />
                  Leave Requests
                </button>
                <button
                  onClick={() => setActiveTab("schedule")}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                    activeTab === "schedule"
                      ? "border-b-2 border-red-600 text-red-600 dark:text-red-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  Schedule
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "dtr" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Daily Time Record
                    </h3>
                    <div className="flex gap-2">
                      <select
                        value={selectedMonth}
                        onChange={(e) =>
                          handleMonthYearChange(
                            parseInt(e.target.value),
                            selectedYear
                          )
                        }
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                      >
                        {[
                          "January",
                          "February",
                          "March",
                          "April",
                          "May",
                          "June",
                          "July",
                          "August",
                          "September",
                          "October",
                          "November",
                          "December",
                        ].map((month, idx) => (
                          <option key={idx} value={idx + 1}>
                            {month}
                          </option>
                        ))}
                      </select>
                      <select
                        value={selectedYear}
                        onChange={(e) =>
                          handleMonthYearChange(
                            selectedMonth,
                            parseInt(e.target.value)
                          )
                        }
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                      >
                        {Array.from({ length: 5 }, (_, i) => {
                          const year = new Date().getFullYear() - i;
                          return (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {loadingDTR ? (
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 text-center">
                      <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3 animate-pulse" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Loading DTR data...
                      </p>
                    </div>
                  ) : dtrData ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Total Hours
                          </p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {((dtrData.totalMonthlyHours || 0) / 60).toFixed(2)}{" "}
                            hrs
                          </p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Office
                          </p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {selectedTrainee.traineeOffice || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                              <th className="px-4 py-3 text-left">Day</th>
                              <th className="px-4 py-3 text-left">Time In</th>
                              <th className="px-4 py-3 text-left">Time Out</th>
                              <th className="px-4 py-3 text-left">Hours</th>
                              <th className="px-4 py-3 text-left">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dtrData.entries?.map((entry: any) => {
                              // Collect all shifts - prioritize new format over legacy
                              let shifts = [];

                              // Check if new format (shifts array) exists and has data
                              if (entry.shifts && entry.shifts.length > 0) {
                                shifts = entry.shifts.filter(
                                  (shift: any) => shift.in || shift.out
                                );
                              } else {
                                // Fallback to legacy format (in1/out1, in2/out2, etc.)
                                if (entry.in1 || entry.out1)
                                  shifts.push({
                                    in: entry.in1,
                                    out: entry.out1,
                                  });
                                if (entry.in2 || entry.out2)
                                  shifts.push({
                                    in: entry.in2,
                                    out: entry.out2,
                                  });
                                if (entry.in3 || entry.out3)
                                  shifts.push({
                                    in: entry.in3,
                                    out: entry.out3,
                                  });
                                if (entry.in4 || entry.out4)
                                  shifts.push({
                                    in: entry.in4,
                                    out: entry.out4,
                                  });
                              }

                              const hasShifts = shifts.length > 0;

                              return (
                                <tr
                                  key={entry.day}
                                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/30"
                                >
                                  <td className="px-4 py-3 font-medium">
                                    {entry.day}
                                  </td>
                                  <td className="px-4 py-3">
                                    {hasShifts ? (
                                      <div className="space-y-1">
                                        {shifts.map(
                                          (shift: any, idx: number) => (
                                            <div key={idx} className="text-sm">
                                              {shifts.length > 1 && (
                                                <span className="font-semibold text-gray-600 dark:text-gray-400">
                                                  Shift {idx + 1}:{" "}
                                                </span>
                                              )}
                                              {shift.in || "-"}
                                            </div>
                                          )
                                        )}
                                      </div>
                                    ) : (
                                      "-"
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    {hasShifts ? (
                                      <div className="space-y-1">
                                        {shifts.map(
                                          (shift: any, idx: number) => (
                                            <div key={idx} className="text-sm">
                                              {shifts.length > 1 && (
                                                <span className="font-semibold text-gray-600 dark:text-gray-400">
                                                  Shift {idx + 1}:{" "}
                                                </span>
                                              )}
                                              {shift.out || "-"}
                                            </div>
                                          )
                                        )}
                                      </div>
                                    ) : (
                                      "-"
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    {((entry.totalHours || 0) / 60).toFixed(2)}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`px-2 py-1 rounded text-xs ${
                                        entry.excusedStatus === "excused"
                                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                                          : entry.confirmationStatus ===
                                            "confirmed"
                                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                                      }`}
                                    >
                                      {entry.excusedStatus === "excused"
                                        ? "Excused"
                                        : entry.confirmationStatus ===
                                          "confirmed"
                                        ? "Confirmed"
                                        : "Pending"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {dtrData.remarks && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            Remarks:
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {dtrData.remarks}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 text-center">
                      <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        No DTR records found for this period
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        The trainee hasn't submitted a DTR for {selectedMonth}/
                        {selectedYear} yet
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "leave" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Leave Requests
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 text-center">
                    <CalendarDays className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Leave requests will be displayed here
                    </p>
                    {/* TODO: Add actual leave requests table here */}
                  </div>
                </div>
              )}

              {activeTab === "schedule" && (
                <div>
                  {loadingSchedule ? (
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 text-center">
                      <ClipboardList className="w-12 h-12 mx-auto text-gray-400 mb-3 animate-pulse" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Loading schedule...
                      </p>
                    </div>
                  ) : scheduleData?.scheduleData &&
                    Array.isArray(scheduleData.scheduleData) &&
                    scheduleData.scheduleData.length > 0 ? (
                    <div className="space-y-4">
                      {/* Schedule Visualization Component */}
                      <ScheduleVisualization
                        scheduleClasses={scheduleData.scheduleData}
                        dutyHours={scheduleData.dutyHours || []}
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 text-center">
                      <ClipboardList className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        No schedule found for this trainee
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        The trainee hasn't uploaded their class schedule yet
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TraineeManagement;
