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
  const [pendingDutyHours, setPendingDutyHours] = useState<DutyHourEntry[]>([]);
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

  // Calculate total weekly hours from duty hours
  const calculateTotalWeeklyHours = () => {
    if (!scheduleData?.dutyHours || scheduleData.dutyHours.length === 0) {
      return 0;
    }

    let totalMinutes = 0;
    scheduleData.dutyHours.forEach((dh: any) => {
      const [startHour, startMin] = dh.startTime.split(":").map(Number);
      const [endHour, endMin] = dh.endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      totalMinutes += endMinutes - startMinutes;
    });

    return totalMinutes / 60;
  };

  const totalWeeklyHours = calculateTotalWeeklyHours();
  const REQUIRED_HOURS = 30;
  const hoursRemaining = Math.max(0, REQUIRED_HOURS - totalWeeklyHours);

  // Calculate hours from pending list
  const calculatePendingHours = () => {
    let totalMinutes = 0;
    pendingDutyHours.forEach((dh) => {
      const [startHour, startMin] = dh.startTime.split(":").map(Number);
      const [endHour, endMin] = dh.endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      totalMinutes += endMinutes - startMinutes;
    });
    return totalMinutes / 60;
  };

  const pendingHours = calculatePendingHours();

  // Calculate hours that would be added by current form selection
  const calculateFormHours = () => {
    if (!dutyHourForm.startTime || !dutyHourForm.endTime || dutyHourForm.days.length === 0) {
      return 0;
    }
    const [startHour, startMin] = dutyHourForm.startTime.split(":").map(Number);
    const [endHour, endMin] = dutyHourForm.endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const hoursPerDay = (endMinutes - startMinutes) / 60;
    return hoursPerDay * dutyHourForm.days.length;
  };

  const formHours = calculateFormHours();
  const projectedTotalHours = totalWeeklyHours + pendingHours + formHours;
  const canAddToList = dutyHourForm.days.length > 0 && dutyHourForm.startTime && dutyHourForm.endTime && dutyHourForm.location;

  // Convert time string to minutes since midnight (handles both 24-hour and 12-hour formats)
  const timeToMinutes = (time: string): number => {
    if (!time) return 0;
    
    // Handle 24-hour format (HH:MM) from time input
    if (!time.includes("AM") && !time.includes("PM") && !time.includes("am") && !time.includes("pm")) {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + (minutes || 0);
    }

    // Handle 12-hour format (HH:MM AM/PM)
    const [timePart, meridiem] = time.split(/\s+/);
    let [hours, minutes] = timePart.split(":").map(Number);

    if (meridiem && meridiem.toUpperCase() === "PM" && hours !== 12) {
      hours += 12;
    } else if (meridiem && meridiem.toUpperCase() === "AM" && hours === 12) {
      hours = 0;
    }

    return hours * 60 + (minutes || 0);
  };

  // Check if two time ranges overlap
  const timesOverlap = (start1: string, end1: string, start2: string, end2: string) => {
    const start1Min = timeToMinutes(start1);
    const end1Min = timeToMinutes(end1);
    const start2Min = timeToMinutes(start2);
    const end2Min = timeToMinutes(end2);
    
    // Two ranges overlap if one starts before the other ends
    return start1Min < end2Min && start2Min < end1Min;
  };

  // Normalize day name for comparison (handles "Monday" vs "MONDAY")
  const normalizeDay = (day: string): string => {
    return day?.toUpperCase() || "";
  };

  // Parse schedule string to extract day and time info (same as ScheduleVisualization)
  const parseScheduleString = (schedule: string) => {
    const classes: Array<{
      day: string;
      startTime: string;
      endTime: string;
    }> = [];

    if (!schedule) return classes;

    const dayMap: { [key: string]: string } = {
      M: "MONDAY",
      T: "TUESDAY",
      W: "WEDNESDAY",
      Th: "THURSDAY",
      F: "FRIDAY",
      S: "SATURDAY",
      Su: "SUNDAY",
    };

    // Split by comma to handle multiple schedules
    const scheduleSegments = schedule.split(",").map((s) => s.trim());

    for (const segment of scheduleSegments) {
      // Extract days pattern (e.g., "T/Th" or "M/W/F") - must be at START of string
      const daysMatch = segment.match(
        /^((?:[MTWFS]|Th|Su)(?:\/(?:[MTWFS]|Th|Su))*)\s+/
      );
      const timeMatch = segment.match(
        /(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)/i
      );

      if (daysMatch && timeMatch) {
        const daysStr = daysMatch[1];
        const startTime = timeMatch[1].trim();
        const endTime = timeMatch[2].trim();

        // Parse individual days
        const dayTokens = daysStr.split("/");

        dayTokens.forEach((token) => {
          const trimmedToken = token.trim();
          const day = dayMap[trimmedToken];
          if (day) {
            classes.push({ day, startTime, endTime });
          }
        });
      }
    }

    return classes;
  };

  // Add current form to pending list
  const handleAddToList = () => {
    if (!canAddToList) {
      showAlert(
        "Validation Error",
        "Please fill in all required fields (days, location, start time, end time).",
        "warning"
      );
      return;
    }

    // Check for conflicts with class schedule
    const classSchedule = scheduleData?.scheduleData || [];
    const conflictsWithClasses: string[] = [];
    
    dutyHourForm.days.forEach((day) => {
      classSchedule.forEach((classItem: any) => {
        // Parse the schedule string to get individual day/time entries
        const parsedClasses = parseScheduleString(classItem.schedule || "");
        
        // Also check if day/startTime/endTime fields exist directly
        if (classItem.day && classItem.startTime && classItem.endTime) {
          parsedClasses.push({
            day: classItem.day,
            startTime: classItem.startTime,
            endTime: classItem.endTime,
          });
        }

        parsedClasses.forEach((parsed) => {
          if (normalizeDay(parsed.day) === normalizeDay(day) && timesOverlap(dutyHourForm.startTime, dutyHourForm.endTime, parsed.startTime, parsed.endTime)) {
            conflictsWithClasses.push(`${day} ${parsed.startTime}-${parsed.endTime} [${classItem.subjectCode || classItem.subjectName || 'Class'}]`);
          }
        });
      });
    });

    if (conflictsWithClasses.length > 0) {
      showAlert(
        "Class Schedule Conflict",
        `This time slot conflicts with class schedule: ${conflictsWithClasses.join(", ")}. Duty hours cannot overlap with classes.`,
        "error"
      );
      return;
    }

    // Check for conflicts with existing saved duty hours
    const existingDutyHours = scheduleData?.dutyHours || [];
    const conflictsWithSaved: string[] = [];
    
    dutyHourForm.days.forEach((day) => {
      existingDutyHours.forEach((dh: any) => {
        if (dh.day === day && timesOverlap(dutyHourForm.startTime, dutyHourForm.endTime, dh.startTime, dh.endTime)) {
          conflictsWithSaved.push(`${day} (${dh.startTime}-${dh.endTime})`);
        }
      });
    });

    if (conflictsWithSaved.length > 0) {
      showAlert(
        "Schedule Conflict",
        `This time slot conflicts with existing saved duty hours: ${conflictsWithSaved.join(", ")}. Please choose a different time.`,
        "error"
      );
      return;
    }

    // Check for conflicts with pending duty hours
    const conflictsWithPending: string[] = [];
    
    dutyHourForm.days.forEach((day) => {
      pendingDutyHours.forEach((dh) => {
        if (dh.day === day && timesOverlap(dutyHourForm.startTime, dutyHourForm.endTime, dh.startTime, dh.endTime)) {
          conflictsWithPending.push(`${day} (${dh.startTime}-${dh.endTime})`);
        }
      });
    });

    if (conflictsWithPending.length > 0) {
      showAlert(
        "Schedule Conflict",
        `This time slot conflicts with pending entries: ${conflictsWithPending.join(", ")}. Please choose a different time or remove the conflicting entry.`,
        "error"
      );
      return;
    }

    // Create entries for each selected day
    const newEntries: DutyHourEntry[] = dutyHourForm.days.map((day) => ({
      day,
      startTime: dutyHourForm.startTime,
      endTime: dutyHourForm.endTime,
      location: dutyHourForm.location,
    }));

    setPendingDutyHours([...pendingDutyHours, ...newEntries]);
    
    // Reset form but keep it open
    setDutyHourForm({
      days: [],
      startTime: "",
      endTime: "",
      location: "",
    });

    showAlert(
      "Added to List",
      `Added ${newEntries.length} duty hour entry(ies) to the list. Total pending: ${(pendingHours + formHours).toFixed(1)} hours.`,
      "success"
    );
  };

  // Remove from pending list
  const handleRemoveFromPending = (index: number) => {
    const newPending = [...pendingDutyHours];
    newPending.splice(index, 1);
    setPendingDutyHours(newPending);
  };

  // Submit all pending duty hours
  const handleSubmitAllDutyHours = () => {
    const allEntries = [...pendingDutyHours];
    
    // Also add current form if it has valid data
    if (canAddToList) {
      dutyHourForm.days.forEach((day) => {
        allEntries.push({
          day,
          startTime: dutyHourForm.startTime,
          endTime: dutyHourForm.endTime,
          location: dutyHourForm.location,
        });
      });
    }

    if (allEntries.length === 0) {
      showAlert(
        "No Entries",
        "Please add duty hours to the list first.",
        "warning"
      );
      return;
    }

    // Calculate total hours
    let totalMinutes = 0;
    allEntries.forEach((dh) => {
      const [startHour, startMin] = dh.startTime.split(":").map(Number);
      const [endHour, endMin] = dh.endTime.split(":").map(Number);
      totalMinutes += (endHour * 60 + endMin) - (startHour * 60 + startMin);
    });
    const totalHours = totalMinutes / 60;

    if (totalWeeklyHours + totalHours < REQUIRED_HOURS) {
      showAlert(
        "Insufficient Hours",
        `Total duty hours must be at least ${REQUIRED_HOURS} hours. Current total: ${(totalWeeklyHours + totalHours).toFixed(1)} hours. Need ${(REQUIRED_HOURS - totalWeeklyHours - totalHours).toFixed(1)} more hours.`,
        "warning"
      );
      return;
    }

    // Submit all entries sequentially
    let successCount = 0;
    const addNext = (index: number) => {
      if (index >= allEntries.length) {
        if (successCount > 0) {
          showAlert(
            "Success",
            `Added duty hours for ${successCount} day(s)!`,
            "success"
          );
          setShowAddDutyForm(false);
          setPendingDutyHours([]);
          setDutyHourForm({
            days: [],
            startTime: "",
            endTime: "",
            location: "",
          });
        }
        return;
      }

      addDutyHoursMutation.mutate(allEntries[index], {
        onSuccess: () => {
          successCount++;
          addNext(index + 1);
        },
        onError: (error: any) => {
          console.error(`Failed to add duty hours for ${allEntries[index].day}:`, error);
          addNext(index + 1);
        },
      });
    };

    addNext(0);
  };

  const handleAddDutyHours = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitAllDutyHours();
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

  // Predefined location options for duty hours
  const locationOptions = [
    "SIT Office",
    "OSAS Office",
    "Registrar Office",
    "Library",
    "Computer Lab",
    "Main Building",
    "Student Center",
    "Admin Building",
    "Guidance Office",
    "Clinic",
    "Cashier",
    "Accounting Office",
    "HR Office",
    "Dean's Office",
    "Faculty Room",
  ];

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
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

                          <div className="md:col-span-2">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <Label htmlFor="location">Location</Label>
                                <select
                                  id="location"
                                  title="Select duty location"
                                  value={dutyHourForm.location}
                                  onChange={(e) =>
                                    setDutyHourForm({
                                      ...dutyHourForm,
                                      location: e.target.value,
                                    })
                                  }
                                  className="w-full h-10 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                >
                                  <option value="">Select a location...</option>
                                  {locationOptions.map((loc) => (
                                    <option key={loc} value={loc}>
                                      {loc}
                                    </option>
                                  ))}
                                </select>
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
                            </div>
                          </div>

                          {/* Hours Summary */}
                          <div className="md:col-span-2">
                            <div className={`p-3 rounded-md ${projectedTotalHours >= REQUIRED_HOURS ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800'}`}>
                              <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Saved: </span>
                                  <span className="font-semibold">{totalWeeklyHours.toFixed(1)} hrs</span>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Pending: </span>
                                  <span className="font-semibold text-orange-600 dark:text-orange-400">+{pendingHours.toFixed(1)} hrs</span>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Form: </span>
                                  <span className="font-semibold text-blue-600 dark:text-blue-400">+{formHours.toFixed(1)} hrs</span>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Total: </span>
                                  <span className={`font-bold ${projectedTotalHours >= REQUIRED_HOURS ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                    {projectedTotalHours.toFixed(1)} / {REQUIRED_HOURS} hrs
                                  </span>
                                </div>
                              </div>
                              {projectedTotalHours < REQUIRED_HOURS && (
                                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                  ⚠️ Need at least {REQUIRED_HOURS} hours. Add {(REQUIRED_HOURS - projectedTotalHours).toFixed(1)} more hours.
                                </p>
                              )}
                              {projectedTotalHours >= REQUIRED_HOURS && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                  ✓ Meets the {REQUIRED_HOURS}-hour requirement!
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Pending Duty Hours List */}
                          {pendingDutyHours.length > 0 && (
                            <div className="md:col-span-2">
                              <Label className="mb-2 block">Pending Entries ({pendingDutyHours.length})</Label>
                              <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-orange-200 dark:border-orange-800 rounded-md bg-orange-50 dark:bg-orange-950">
                                {pendingDutyHours.map((dh, index) => (
                                  <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                    <div className="text-sm">
                                      <span className="font-semibold">{dh.day}</span>
                                      <span className="text-gray-500 mx-2">|</span>
                                      <span>{dh.startTime} - {dh.endTime}</span>
                                      <span className="text-gray-500 mx-2">|</span>
                                      <span className="text-gray-600 dark:text-gray-400">{dh.location}</span>
                                    </div>
                                    <button
                                      type="button"
                                      title="Remove from pending list"
                                      onClick={() => handleRemoveFromPending(index)}
                                      className="text-red-500 hover:text-red-700 p-1"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="md:col-span-2 flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                              onClick={handleAddToList}
                              disabled={!canAddToList}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add to List
                            </Button>
                            <Button
                              type="submit"
                              className="flex-1 bg-red-600 hover:bg-red-700"
                              disabled={addDutyHoursMutation.isPending || projectedTotalHours < REQUIRED_HOURS}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {addDutyHoursMutation.isPending
                                ? "Saving..."
                                : projectedTotalHours < REQUIRED_HOURS
                                ? `Need ${(REQUIRED_HOURS - projectedTotalHours).toFixed(1)} More Hours`
                                : "Save All Duty Hours"}
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

                          <div className="md:col-span-2">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <Label htmlFor="location2">Location</Label>
                                <select
                                  id="location2"
                                  title="Select duty location"
                                  value={dutyHourForm.location}
                                  onChange={(e) =>
                                    setDutyHourForm({
                                      ...dutyHourForm,
                                      location: e.target.value,
                                    })
                                  }
                                  className="w-full h-10 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                >
                                  <option value="">Select a location...</option>
                                  {locationOptions.map((loc) => (
                                    <option key={loc} value={loc}>
                                      {loc}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <Label htmlFor="startTime2">Start Time</Label>
                                <Input
                                  id="startTime2"
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
                                <Label htmlFor="endTime2">End Time</Label>
                                <Input
                                  id="endTime2"
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
                            </div>
                          </div>

                          {/* Hours Summary */}
                          <div className="md:col-span-2">
                            <div className={`p-3 rounded-md ${projectedTotalHours >= REQUIRED_HOURS ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800'}`}>
                              <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Saved: </span>
                                  <span className="font-semibold">{totalWeeklyHours.toFixed(1)} hrs</span>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Pending: </span>
                                  <span className="font-semibold text-orange-600 dark:text-orange-400">+{pendingHours.toFixed(1)} hrs</span>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Form: </span>
                                  <span className="font-semibold text-blue-600 dark:text-blue-400">+{formHours.toFixed(1)} hrs</span>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Total: </span>
                                  <span className={`font-bold ${projectedTotalHours >= REQUIRED_HOURS ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                    {projectedTotalHours.toFixed(1)} / {REQUIRED_HOURS} hrs
                                  </span>
                                </div>
                              </div>
                              {projectedTotalHours < REQUIRED_HOURS && (
                                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                  ⚠️ Need at least {REQUIRED_HOURS} hours. Add {(REQUIRED_HOURS - projectedTotalHours).toFixed(1)} more hours.
                                </p>
                              )}
                              {projectedTotalHours >= REQUIRED_HOURS && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                  ✓ Meets the {REQUIRED_HOURS}-hour requirement!
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Pending Duty Hours List */}
                          {pendingDutyHours.length > 0 && (
                            <div className="md:col-span-2">
                              <Label className="mb-2 block">Pending Entries ({pendingDutyHours.length})</Label>
                              <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-orange-200 dark:border-orange-800 rounded-md bg-orange-50 dark:bg-orange-950">
                                {pendingDutyHours.map((dh, index) => (
                                  <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                    <div className="text-sm">
                                      <span className="font-semibold">{dh.day}</span>
                                      <span className="text-gray-500 mx-2">|</span>
                                      <span>{dh.startTime} - {dh.endTime}</span>
                                      <span className="text-gray-500 mx-2">|</span>
                                      <span className="text-gray-600 dark:text-gray-400">{dh.location}</span>
                                    </div>
                                    <button
                                      type="button"
                                      title="Remove from pending list"
                                      onClick={() => handleRemoveFromPending(index)}
                                      className="text-red-500 hover:text-red-700 p-1"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="md:col-span-2 flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                              onClick={handleAddToList}
                              disabled={!canAddToList}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add to List
                            </Button>
                            <Button
                              type="submit"
                              className="flex-1 bg-red-600 hover:bg-red-700"
                              disabled={addDutyHoursMutation.isPending || projectedTotalHours < REQUIRED_HOURS}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {addDutyHoursMutation.isPending
                                ? "Saving..."
                                : projectedTotalHours < REQUIRED_HOURS
                                ? `Need ${(REQUIRED_HOURS - projectedTotalHours).toFixed(1)} More Hours`
                                : "Save All Duty Hours"}
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
