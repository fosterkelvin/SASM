import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import OfficeSidebar from "@/components/sidebar/Office/OfficeSidebar";
import ScheduleVisualization from "@/pages/Roles/Student/Schedule/components/ScheduleVisualization";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getClassSchedule,
  addDutyHoursToSchedule,
  removeDutyHoursFromSchedule,
  getOfficeScholars,
} from "@/lib/api";
import { ArrowLeft, Clock, Plus, Save, Trash2 } from "lucide-react";
import { CustomAlert, useCustomAlert } from "@/components/ui/custom-alert";

interface DutyHourEntry {
  day: string;
  startTime: string;
  endTime: string;
  location: string;
}

interface DutyHourFormData {
  days: string[];
  startTime: string;
  endTime: string;
  location: string;
}

const ScholarSchedule: React.FC = () => {
  const params = useParams<{ scholarId: string }>();
  const scholarIdParam = params.scholarId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showAddDutyForm, setShowAddDutyForm] = useState(false);
  const [dutyHourForm, setDutyHourForm] = useState<DutyHourFormData>({
    days: [],
    startTime: "",
    endTime: "",
    location: "",
  });
  const { alertState, showAlert, closeAlert } = useCustomAlert();

  useEffect(() => {
    document.title = "Scholar Work Schedule | SASM-IMS";
  }, []);

  console.log("🔍 URL Params Debug:");
  console.log("- Raw params:", params);
  console.log("- scholarIdParam:", scholarIdParam);
  console.log("- scholarIdParam type:", typeof scholarIdParam);

  // Fetch scholars
  const { data: scholarsData } = useQuery({
    queryKey: ["office-scholars"],
    queryFn: () => getOfficeScholars(),
  });

  // Find the scholar
  const scholar = scholarsData?.trainees?.find((s: any) => {
    const scholarApplicationId = s.applicationId?._id || s.applicationId;
    const scholarUserId = s.userID?._id || s.userID;

    return (
      s._id === scholarIdParam ||
      scholarApplicationId === scholarIdParam ||
      scholarUserId === scholarIdParam
    );
  });

  // Extract IDs for API calls
  const scholarId = scholar?._id || scholarIdParam; // Scholar's _id for remove duty hours
  const applicationId =
    scholar?.applicationId?._id || scholar?.applicationId || scholarIdParam; // applicationId for fetching schedule

  console.log("🎓 ScholarSchedule Debug:");
  console.log("- scholarId from URL:", scholarIdParam);
  console.log("- Found scholar:", !!scholar);
  console.log("- Scholar _id:", scholarId);
  console.log("- applicationId for API:", applicationId);
  if (scholar) {
    console.log("- Scholar data:", {
      _id: scholar._id,
      applicationId: scholar.applicationId,
      userID: scholar.userID,
    });
  }

  // Fetch schedule using applicationId
  const {
    data: scheduleData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["classSchedule", applicationId],
    queryFn: () => getClassSchedule(applicationId!),
    enabled: !!applicationId,
  });

  // Add duty hours mutation using applicationId
  const addDutyHoursMutation = useMutation({
    mutationFn: (data: DutyHourEntry) => {
      console.log("🔄 Adding duty hours with applicationId:", applicationId);
      console.log("🔄 Duty hour data:", data);
      return addDutyHoursToSchedule(applicationId!, data);
    },
    onSuccess: () => {
      console.log("✅ Duty hours added successfully!");
      queryClient.invalidateQueries({
        queryKey: ["classSchedule", applicationId],
      });
      // Note: Form reset is handled in handleAddDutyHours
    },
    onError: (error: any) => {
      console.error("❌ Failed to add duty hours:", error);
      console.error("❌ Error response:", error.response?.data);
      showAlert(
        "Error",
        error.response?.data?.message ||
          "Failed to add duty hours. Please try again.",
        "error"
      );
    },
  });

  // Remove duty hours mutation using scholarId (the Scholar's _id)
  const removeDutyHoursMutation = useMutation({
    mutationFn: (data: { day: string; startTime: string; endTime: string }) => {
      console.log("🗑️ Removing duty hours with scholarId:", scholarId);
      console.log("🗑️ Duty hour data:", data);
      return removeDutyHoursFromSchedule(scholarId!, data);
    },
    onSuccess: () => {
      console.log("✅ Duty hours removed successfully!");
      queryClient.invalidateQueries({
        queryKey: ["classSchedule", applicationId],
      });
      showAlert("Success", "Duty hours removed successfully!", "success");
    },
    onError: (error: any) => {
      console.error("❌ Failed to remove duty hours:", error);
      console.error("❌ Error response:", error.response?.data);
      showAlert(
        "Error",
        error.response?.data?.message ||
          "Failed to remove duty hours. Please try again.",
        "error"
      );
    },
  });

  const handleAddDutyHours = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      dutyHourForm.days.length === 0 ||
      !dutyHourForm.startTime ||
      !dutyHourForm.endTime
    ) {
      showAlert(
        "Validation Error",
        "Please fill in all required fields (select at least one day).",
        "warning"
      );
      return;
    }

    // Create entries for each selected day
    const entries: DutyHourEntry[] = dutyHourForm.days.map((day) => ({
      day,
      startTime: dutyHourForm.startTime,
      endTime: dutyHourForm.endTime,
      location: dutyHourForm.location,
    }));

    // Add each entry sequentially
    let successCount = 0;
    const addNext = (index: number) => {
      if (index >= entries.length) {
        // All done
        if (successCount > 0) {
          showAlert(
            "Success",
            `Added duty hours for ${successCount} day(s)!`,
            "success"
          );
          setShowAddDutyForm(false);
          setDutyHourForm({
            days: [],
            startTime: "",
            endTime: "",
            location: "",
          });
        }
        return;
      }

      addDutyHoursMutation.mutate(entries[index], {
        onSuccess: () => {
          successCount++;
          addNext(index + 1);
        },
        onError: (error: any) => {
          // Show error but continue with remaining days
          console.error(
            `Failed to add duty hours for ${entries[index].day}:`,
            error
          );
          addNext(index + 1);
        },
      });
    };

    addNext(0);
  };

  const handleRemoveDutyHours = (dutyHour: {
    day: string;
    startTime: string;
    endTime: string;
  }) => {
    if (
      window.confirm(
        `Are you sure you want to remove duty hours for ${dutyHour.day} ${dutyHour.startTime}-${dutyHour.endTime}?`
      )
    ) {
      removeDutyHoursMutation.mutate(dutyHour);
    }
  };

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900">
      <OfficeSidebar
        currentPage="Scholars"
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
          <Button
            variant="ghost"
            onClick={() => navigate("/office/scholars")}
            className="ml-4 text-white hover:bg-red-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Scholars
          </Button>
          <h1 className="text-2xl font-bold text-white">
            {scholar
              ? `${scholar.userID?.firstname || ""} ${
                  scholar.userID?.lastname || ""
                }'s Work Schedule`
              : "Scholar Work Schedule"}
          </h1>
        </div>

        <div className="p-4 md:p-10 pt-8 md:pt-[96px]">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Loading schedule...
                </p>
              </div>
            </div>
          ) : error ||
            !scheduleData?.scheduleData ||
            scheduleData.scheduleData.length === 0 ? (
            <Card className="max-w-7xl mx-auto">
              <CardContent className="p-6 md:p-8">
                <div className="text-center mb-6">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-amber-600 dark:text-amber-400" />
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Work Schedule Not Available
                  </p>
                  <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                    This scholar hasn't uploaded their work schedule yet.
                  </p>
                  <p className="text-xs mt-2 text-gray-500">
                    You can add duty hours now. When the scholar uploads their
                    schedule, it will replace these temporary duty hours.
                  </p>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {scheduleData?.dutyHours &&
                      scheduleData.dutyHours.length > 0
                        ? "Duty Hours Schedule"
                        : "Temporary Duty Hours"}
                    </h3>
                    <Button
                      onClick={() => setShowAddDutyForm(!showAddDutyForm)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {showAddDutyForm ? "Cancel" : "Add Duty Hours"}
                    </Button>
                  </div>

                  {showAddDutyForm && (
                    <Card className="mb-6 border-red-200 dark:border-red-800">
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                          Add Duty Hours
                        </h3>
                        <form
                          onSubmit={handleAddDutyHours}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          <div className="md:col-span-2">
                            <Label>Days of Week (select multiple)</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
                              {daysOfWeek.map((day) => (
                                <label
                                  key={day}
                                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded"
                                >
                                  <input
                                    type="checkbox"
                                    checked={dutyHourForm.days.includes(day)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setDutyHourForm({
                                          ...dutyHourForm,
                                          days: [...dutyHourForm.days, day],
                                        });
                                      } else {
                                        setDutyHourForm({
                                          ...dutyHourForm,
                                          days: dutyHourForm.days.filter(
                                            (d) => d !== day
                                          ),
                                        });
                                      }
                                    }}
                                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                  />
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {day}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              value={dutyHourForm.location}
                              onChange={(e) =>
                                setDutyHourForm({
                                  ...dutyHourForm,
                                  location: e.target.value,
                                })
                              }
                              placeholder="e.g., Main Office"
                            />
                          </div>

                          <div>
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input
                              id="startTime"
                              type="time"
                              value={dutyHourForm.startTime}
                              onChange={(e) =>
                                setDutyHourForm({
                                  ...dutyHourForm,
                                  startTime: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div>
                            <Label htmlFor="endTime">End Time</Label>
                            <Input
                              id="endTime"
                              type="time"
                              value={dutyHourForm.endTime}
                              onChange={(e) =>
                                setDutyHourForm({
                                  ...dutyHourForm,
                                  endTime: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Button
                              type="submit"
                              className="w-full bg-red-600 hover:bg-red-700"
                              disabled={addDutyHoursMutation.isPending}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {addDutyHoursMutation.isPending
                                ? "Adding..."
                                : "Add Duty Hours"}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  {scheduleData?.dutyHours &&
                  scheduleData.dutyHours.length > 0 ? (
                    <div className="mt-4 space-y-4">
                      {/* Duty Hours List with Delete Buttons */}
                      <Card className="border-red-200 dark:border-red-800">
                        <CardContent className="p-4">
                          <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                            Current Duty Hours ({scheduleData.dutyHours.length})
                          </h4>
                          <div className="space-y-2">
                            {scheduleData.dutyHours.map(
                              (dh: any, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {dh.day}
                                      </span>
                                      <span className="text-gray-600 dark:text-gray-400">
                                        {dh.startTime} - {dh.endTime}
                                      </span>
                                    </div>
                                    {dh.location && (
                                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        📍 {dh.location}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveDutyHours(dh)}
                                    disabled={removeDutyHoursMutation.isPending}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Calendar Visualization */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                          Schedule Preview
                        </h4>
                        <ScheduleVisualization
                          scheduleClasses={[]}
                          dutyHours={scheduleData.dutyHours}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No duty hours added yet. Click "Add Duty Hours" to get
                      started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : scheduleData?.scheduleData &&
            scheduleData.scheduleData.length > 0 ? (
            <div className="space-y-6">
              <Card className="max-w-7xl mx-auto shadow-lg">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">📅</span>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          Scholar Work Schedule
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Duty hours and work shifts
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!!scheduleData?.scheduleUrl && (
                        <Button
                          onClick={() =>
                            window.open(scheduleData.scheduleUrl, "_blank")
                          }
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          View PDF
                        </Button>
                      )}
                      <Button
                        onClick={() => setShowAddDutyForm(!showAddDutyForm)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {showAddDutyForm ? "Cancel" : "Add Duty Hours"}
                      </Button>
                    </div>
                  </div>

                  {showAddDutyForm && (
                    <Card className="mb-6 border-red-200 dark:border-red-800">
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                          Add Duty Hours
                        </h3>
                        <form
                          onSubmit={handleAddDutyHours}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          <div className="md:col-span-2">
                            <Label>Days of Week (select multiple)</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
                              {daysOfWeek.map((day) => (
                                <label
                                  key={day}
                                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded"
                                >
                                  <input
                                    type="checkbox"
                                    checked={dutyHourForm.days.includes(day)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setDutyHourForm({
                                          ...dutyHourForm,
                                          days: [...dutyHourForm.days, day],
                                        });
                                      } else {
                                        setDutyHourForm({
                                          ...dutyHourForm,
                                          days: dutyHourForm.days.filter(
                                            (d) => d !== day
                                          ),
                                        });
                                      }
                                    }}
                                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                  />
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {day}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              value={dutyHourForm.location}
                              onChange={(e) =>
                                setDutyHourForm({
                                  ...dutyHourForm,
                                  location: e.target.value,
                                })
                              }
                              placeholder="e.g., Main Office"
                            />
                          </div>

                          <div>
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input
                              id="startTime"
                              type="time"
                              value={dutyHourForm.startTime}
                              onChange={(e) =>
                                setDutyHourForm({
                                  ...dutyHourForm,
                                  startTime: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div>
                            <Label htmlFor="endTime">End Time</Label>
                            <Input
                              id="endTime"
                              type="time"
                              value={dutyHourForm.endTime}
                              onChange={(e) =>
                                setDutyHourForm({
                                  ...dutyHourForm,
                                  endTime: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Button
                              type="submit"
                              className="w-full bg-red-600 hover:bg-red-700"
                              disabled={addDutyHoursMutation.isPending}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {addDutyHoursMutation.isPending
                                ? "Adding..."
                                : "Add Duty Hours"}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  {/* Duty Hours Management - Show if any duty hours exist */}
                  {scheduleData?.dutyHours &&
                    scheduleData.dutyHours.length > 0 && (
                      <Card className="mb-6 border-red-200 dark:border-red-800">
                        <CardContent className="p-4">
                          <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                            Current Duty Hours ({scheduleData.dutyHours.length})
                          </h4>
                          <div className="space-y-2">
                            {scheduleData.dutyHours.map(
                              (dh: any, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {dh.day}
                                      </span>
                                      <span className="text-gray-600 dark:text-gray-400">
                                        {dh.startTime} - {dh.endTime}
                                      </span>
                                    </div>
                                    {dh.location && (
                                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        📍 {dh.location}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveDutyHours(dh)}
                                    disabled={removeDutyHoursMutation.isPending}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Schedule Calendar
                    </h4>
                    <ScheduleVisualization
                      scheduleClasses={scheduleData.scheduleData}
                      dutyHours={scheduleData.dutyHours || []}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="max-w-7xl mx-auto">
              <CardContent className="p-6 md:p-8 text-center">
                <div className="text-amber-600 dark:text-amber-400">
                  <Clock className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg font-semibold">
                    No Schedule Data Available
                  </p>
                  <p className="text-sm mt-2">
                    This scholar needs to upload their work schedule.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

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

export default ScholarSchedule;
