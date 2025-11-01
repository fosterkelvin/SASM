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
  getOfficeTrainees,
} from "@/lib/api";
import { ArrowLeft, Clock, Plus, Save } from "lucide-react";

interface DutyHourEntry {
  day: string;
  startTime: string;
  endTime: string;
  location: string;
}

const TraineeSchedule: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showAddDutyForm, setShowAddDutyForm] = useState(false);
  const [dutyHourEntry, setDutyHourEntry] = useState<DutyHourEntry>({
    day: "",
    startTime: "",
    endTime: "",
    location: "",
  });

  useEffect(() => {
    document.title = "Trainee Schedule | SASM-IMS";
  }, []);

  // Fetch trainee info
  const { data: traineesData } = useQuery({
    queryKey: ["office-trainees"],
    queryFn: () => getOfficeTrainees(),
  });

  const trainee = traineesData?.trainees?.find(
    (t: any) => t._id === applicationId
  );

  // Fetch schedule
  const {
    data: scheduleData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["classSchedule", applicationId],
    queryFn: () => getClassSchedule(applicationId),
    enabled: !!applicationId,
  });

  // Add duty hours mutation
  const addDutyHoursMutation = useMutation({
    mutationFn: (data: DutyHourEntry) =>
      addDutyHoursToSchedule(applicationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["classSchedule", applicationId],
      });
      setShowAddDutyForm(false);
      setDutyHourEntry({
        day: "",
        startTime: "",
        endTime: "",
        location: "",
      });
      alert("Duty hours added successfully!");
    },
    onError: (error: any) => {
      alert(
        error.response?.data?.message ||
          "Failed to add duty hours. Please try again."
      );
    },
  });

  const handleAddDutyHours = () => {
    if (
      !dutyHourEntry.day ||
      !dutyHourEntry.startTime ||
      !dutyHourEntry.endTime ||
      !dutyHourEntry.location
    ) {
      alert("Please fill in all fields");
      return;
    }
    addDutyHoursMutation.mutate(dutyHourEntry);
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
        currentPage="MyTrainees"
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
            onClick={() => navigate("/office/my-trainees")}
            className="ml-4 text-white hover:bg-red-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Trainees
          </Button>
          <h1 className="text-2xl font-bold text-white">
            {trainee
              ? `${trainee.userID?.firstname || ""} ${
                  trainee.userID?.lastname || ""
                }'s Schedule`
              : "Trainee Schedule"}
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
          ) : error ? (
            <Card className="max-w-7xl mx-auto">
              <CardContent className="p-6 md:p-8 text-center">
                <div className="text-red-600 dark:text-red-400 mb-4">
                  <Clock className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg font-semibold">
                    Unable to load schedule
                  </p>
                  <p className="text-sm mt-2">
                    The trainee may not have uploaded their schedule yet.
                  </p>
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
                          Trainee Class Schedule
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          View and manage duty hours
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
                        Add Duty Hours
                      </Button>
                    </div>
                  </div>

                  {showAddDutyForm && (
                    <Card className="mb-6 border-2 border-red-200 dark:border-red-800">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-red-600" />
                          Add Duty Hours
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="day">Day of Week</Label>
                            <select
                              id="day"
                              value={dutyHourEntry.day}
                              onChange={(e) =>
                                setDutyHourEntry({
                                  ...dutyHourEntry,
                                  day: e.target.value,
                                })
                              }
                              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                              <option value="">Select a day</option>
                              {daysOfWeek.map((day) => (
                                <option key={day} value={day}>
                                  {day}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              type="text"
                              value={dutyHourEntry.location}
                              onChange={(e) =>
                                setDutyHourEntry({
                                  ...dutyHourEntry,
                                  location: e.target.value,
                                })
                              }
                              placeholder="e.g., Main Office, Room 205"
                            />
                          </div>
                          <div>
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input
                              id="startTime"
                              type="time"
                              value={dutyHourEntry.startTime}
                              onChange={(e) =>
                                setDutyHourEntry({
                                  ...dutyHourEntry,
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
                              value={dutyHourEntry.endTime}
                              onChange={(e) =>
                                setDutyHourEntry({
                                  ...dutyHourEntry,
                                  endTime: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            onClick={handleAddDutyHours}
                            disabled={addDutyHoursMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {addDutyHoursMutation.isPending
                              ? "Saving..."
                              : "Save Duty Hours"}
                          </Button>
                          <Button
                            onClick={() => setShowAddDutyForm(false)}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <ScheduleVisualization
                    scheduleClasses={scheduleData.scheduleData}
                    dutyHours={scheduleData.dutyHours || []}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="max-w-7xl mx-auto">
              <CardContent className="p-6 md:p-8 text-center">
                <div className="text-gray-600 dark:text-gray-400 mb-4">
                  <Clock className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg font-semibold">No Schedule Available</p>
                  <p className="text-sm mt-2">
                    This trainee hasn't uploaded their class schedule yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TraineeSchedule;
