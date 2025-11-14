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
  getOfficeTrainees,
  getOfficeScholars,
} from "@/lib/api";
import { ArrowLeft, Clock, Plus, Save, Trash2 } from "lucide-react";

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
    document.title = "Schedule Management | SASM-IMS";
  }, []);

  // Fetch trainees
  const { data: traineesData } = useQuery({
    queryKey: ["office-trainees"],
    queryFn: () => getOfficeTrainees(),
  });

  // Fetch scholars
  const { data: scholarsData } = useQuery({
    queryKey: ["office-scholars"],
    queryFn: () => getOfficeScholars(),
  });

  // Find the person - could be a trainee or scholar
  const trainee = traineesData?.trainees?.find(
    (t: any) => t._id === applicationId
  );

  // Check multiple ways to find scholar:
  // 1. applicationId matches (when coming from ScholarsList using u.applicationId)
  // 2. userId matches (when coming from ScholarsList using u.userId as fallback)
  // 3. _id matches (direct scholar ID)
  const scholar = scholarsData?.trainees?.find((s: any) => {
    const scholarApplicationId = s.applicationId?._id || s.applicationId;
    const scholarUserId = s.userID?._id || s.userID;

    return (
      s._id === applicationId ||
      scholarApplicationId === applicationId ||
      scholarUserId === applicationId
    );
  });

  // Use scholar if found, otherwise use trainee
  const person = scholar || trainee;
  const isScholar = !!scholar;

  console.log("🔍 TraineeSchedule Debug:");
  console.log("- applicationId from URL:", applicationId);
  console.log("- Found trainee:", !!trainee);
  console.log("- Found scholar:", !!scholar);
  console.log("- isScholar:", isScholar);
  if (scholar) {
    console.log("- Scholar data:", {
      _id: scholar._id,
      applicationId: scholar.applicationId,
      userID: scholar.userID,
    });
  }

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

  // Remove duty hours mutation
  const removeDutyHoursMutation = useMutation({
    mutationFn: (data: { day: string; startTime: string; endTime: string }) =>
      // For trainees we use the applicationId directly
      removeDutyHoursFromSchedule(applicationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["classSchedule", applicationId],
      });
      alert("Duty hours removed successfully!");
    },
    onError: (error: any) => {
      alert(
        error.response?.data?.message ||
          "Failed to remove duty hours. Please try again."
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

    // Helper: convert time string (24h or 12h) to minutes since midnight
    const timeToMinutes = (time: string): number => {
      if (!time) return 0;
      const hasMeridiem = /am|pm/i.test(time);
      if (!hasMeridiem) {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
      }
      const [tp, mer] = time.trim().split(/\s+/);
      let [h, m] = tp.split(":").map(Number);
      const merUpper = (mer || "").toUpperCase();
      if (merUpper === "PM" && h !== 12) h += 12;
      if (merUpper === "AM" && h === 12) h = 0;
      return h * 60 + m;
    };

    // Validate start < end
    const startMin = timeToMinutes(dutyHourEntry.startTime);
    const endMin = timeToMinutes(dutyHourEntry.endTime);
    if (endMin <= startMin) {
      alert("End time must be after start time");
      return;
    }

    const dayUpper = dutyHourEntry.day.toUpperCase();

    // 1) Check overlap with existing duty hours
    const dutyOverlap = (scheduleData?.dutyHours || []).some((dh: any) => {
      if (!dh?.day) return false;
      const sameDay = (dh.day as string).toUpperCase() === dayUpper;
      if (!sameDay) return false;
      const s = timeToMinutes(dh.startTime);
      const e = timeToMinutes(dh.endTime);
      // Overlap if newStart < existEnd && newEnd > existStart
      return startMin < e && endMin > s;
    });
    if (dutyOverlap) {
      alert(
        "The duty hours you entered conflict with existing duty hours for this day. Please choose a different time."
      );
      return;
    }

    // 2) Check overlap with class/work schedules in scheduleData.scheduleData
    // Parse schedule strings like "T/Th 8:00 AM-9:30 AM / F215"
    const parseSchedule = (schedule: string) => {
      const results: Array<{ day: string; start: number; end: number }> = [];
      if (!schedule) return results;
      const dayMap: Record<string, string> = {
        M: "MONDAY",
        T: "TUESDAY",
        W: "WEDNESDAY",
        Th: "THURSDAY",
        F: "FRIDAY",
        S: "SATURDAY",
        Su: "SUNDAY",
      };

      // Split segments by comma
      const segments = schedule.split(",").map((s) => s.trim());
      for (const seg of segments) {
        const daysMatch = seg.match(
          /^((?:[MTWFS]|Th|Su)(?:\/(?:[MTWFS]|Th|Su))*)\s+/
        );
        const timeMatch = seg.match(
          /(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)/i
        );
        if (!daysMatch || !timeMatch) continue;
        const dayTokens = daysMatch[1].split("/").map((d) => d.trim());
        const start = timeToMinutes(timeMatch[1].trim());
        const end = timeToMinutes(timeMatch[2].trim());
        for (const token of dayTokens) {
          const mapped = dayMap[token];
          if (mapped) results.push({ day: mapped, start, end });
        }
      }
      return results;
    };

    const classOverlap = (scheduleData?.scheduleData || []).some((cls: any) => {
      const parsed = parseSchedule(cls?.schedule || "");
      return parsed.some((p) => {
        if (p.day !== dayUpper) return false;
        return startMin < p.end && endMin > p.start;
      });
    });

    if (classOverlap) {
      alert(
        "The duty hours you entered conflict with an existing class/work schedule. Please choose a different time."
      );
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900">
      <OfficeSidebar
        currentPage={isScholar ? "Scholars" : "MyTrainees"}
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
            onClick={() =>
              navigate(isScholar ? "/office/scholars" : "/office/my-trainees")
            }
            className="ml-4 text-white hover:bg-red-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {isScholar ? "Back to Scholars" : "Back to Trainees"}
          </Button>
          <h1 className="text-2xl font-bold text-white">
            {person
              ? `${person.userID?.firstname || ""} ${
                  person.userID?.lastname || ""
                }'s Schedule`
              : "Schedule Management"}
          </h1>
        </div>

        <div className="p-4 md:p-10 pt-16 md:pt-[96px]">
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
                    {isScholar
                      ? "Work Schedule Not Available"
                      : "Schedule Not Available"}
                  </p>
                  <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                    {isScholar
                      ? "This scholar needs to upload their work schedule (duty hours and shifts). The old trainee class schedule is no longer applicable now that they are a scholar."
                      : "This trainee hasn't uploaded their class schedule yet."}
                  </p>
                  <p className="text-xs mt-2 text-gray-500">
                    You can add duty hours now. Once a schedule is uploaded,
                    these temporary duty hours will be cleared so you can assign
                    new ones.
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="day">Day</Label>
                            <select
                              id="day"
                              value={dutyHourEntry.day}
                              onChange={(e) =>
                                setDutyHourEntry({
                                  ...dutyHourEntry,
                                  day: e.target.value,
                                })
                              }
                              className="w-full mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                            >
                              <option value="">Select day</option>
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
                              value={dutyHourEntry.location}
                              onChange={(e) =>
                                setDutyHourEntry({
                                  ...dutyHourEntry,
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
                          <div className="md:col-span-2">
                            <Button
                              onClick={handleAddDutyHours}
                              disabled={addDutyHoursMutation.isPending}
                              className="w-full bg-red-600 hover:bg-red-700"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {addDutyHoursMutation.isPending
                                ? "Adding..."
                                : "Add Duty Hours"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {scheduleData?.dutyHours &&
                  scheduleData.dutyHours.length > 0 ? (
                    <div className="mt-4 space-y-4">
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
                          {isScholar
                            ? "Scholar Work Schedule"
                            : "Trainee Class Schedule"}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {isScholar
                            ? "Duty hours and work shifts"
                            : "View and manage duty hours"}
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
