import React, { useState, useEffect, useCallback, useRef } from "react";
import OfficeSidebar from "@/components/sidebar/Office/OfficeSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/context/ToastContext";
import {
  Calendar,
  Loader2,
  CheckCircle,
  CheckCircle2,
  Clock,
  X,
  Check,
  Search,
  Info,
  ShieldCheck,
  AlertCircle,
  Mail,
} from "lucide-react";
import API from "@/config/apiClient";

interface EditHistoryEntry {
  editedBy: string;
  editedByName: string;
  editedAt: string;
  changes: { field: string; oldValue: string; newValue: string }[];
}

interface Shift {
  in?: string;
  out?: string;
}

interface Entry {
  id: number;
  day: number;
  // Legacy fields (kept for backward compatibility)
  in1?: string;
  out1?: string;
  in2?: string;
  out2?: string;
  in3?: string;
  out3?: string;
  in4?: string;
  out4?: string;
  // NEW: Dynamic shifts array
  shifts?: Shift[];
  late?: number;
  undertime?: number;
  totalHours?: number;
  status?: string;
  excusedStatus?: "none" | "excused";
  excusedReason?: string;
  confirmationStatus?: "unconfirmed" | "confirmed";
  confirmedBy?: string;
  confirmedByProfile?: string;
  confirmedAt?: string;
  editHistory?: EditHistoryEntry[];
}

interface DTR {
  _id: string;
  userId: string;
  month: number;
  year: number;
  department?: string;
  dutyHours?: string;
  entries: Entry[];
  status: "draft" | "submitted" | "approved" | "rejected";
  submittedAt?: string;
  checkedBy?: string;
  checkedAt?: string;
  remarks?: string;
  totalMonthlyHours?: number;
  createdAt: string;
  updatedAt: string;
}

interface Trainee {
  _id: string;
  userID: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  traineeOffice?: string;
  status: string;
  position?: "student_assistant" | "student_marshal";
}

const OfficeDTRCheck: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { addToast } = useToast();

  // Current date for defaults
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // State
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [filteredTrainees, setFilteredTrainees] = useState<Trainee[]>([]);
  const [selectedTrainee, setSelectedTrainee] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [dtr, setDtr] = useState<DTR | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTrainees, setLoadingTrainees] = useState(true);
  const [editingEntry, setEditingEntry] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Entry | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    [key: number]: "top" | "bottom";
  }>({});
  const [showExcusedModal, setShowExcusedModal] = useState(false);
  const [excusedDay, setExcusedDay] = useState<number | null>(null);
  const [excusedReason, setExcusedReason] = useState("");
  const [absentLoadingDay, setAbsentLoadingDay] = useState<number | null>(null);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [actionsModalDay, setActionsModalDay] = useState<number | null>(null);

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const infoIconRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Month/Year data
  const months = [
    { value: 1, label: "January", short: "Jan" },
    { value: 2, label: "February", short: "Feb" },
    { value: 3, label: "March", short: "Mar" },
    { value: 4, label: "April", short: "Apr" },
    { value: 5, label: "May", short: "May" },
    { value: 6, label: "June", short: "Jun" },
    { value: 7, label: "July", short: "Jul" },
    { value: 8, label: "August", short: "Aug" },
    { value: 9, label: "September", short: "Sep" },
    { value: 10, label: "October", short: "Oct" },
    { value: 11, label: "November", short: "Nov" },
    { value: 12, label: "December", short: "Dec" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Helper function to get shifts (use legacy fields if shifts array doesn't exist)
  const getShifts = (entry: Entry): Shift[] => {
    if (entry.shifts && entry.shifts.length > 0) {
      return entry.shifts;
    }
    // Migrate legacy fields
    const legacyShifts: Shift[] = [];
    if (entry.in1 || entry.out1)
      legacyShifts.push({ in: entry.in1, out: entry.out1 });
    if (entry.in2 || entry.out2)
      legacyShifts.push({ in: entry.in2, out: entry.out2 });
    if (entry.in3 || entry.out3)
      legacyShifts.push({ in: entry.in3, out: entry.out3 });
    if (entry.in4 || entry.out4)
      legacyShifts.push({ in: entry.in4, out: entry.out4 });
    return legacyShifts;
  };

  // Fetch trainees AND scholars
  useEffect(() => {
    const fetchTraineesAndScholars = async () => {
      try {
        // Fetch both trainees and scholars
        const [traineesResponse, scholarsResponse] = await Promise.all([
          API.get("/trainees/office"),
          API.get("/trainees/office/scholars"),
        ]);

        const traineesData = traineesResponse.data.trainees || [];
        const scholarsData = scholarsResponse.data.trainees || []; // API returns as "trainees" key

        // Combine trainees and scholars
        const combined = [...traineesData, ...scholarsData];

        console.log("📊 Fetched trainees:", traineesData.length);
        console.log("📊 Fetched scholars:", scholarsData.length);
        console.log("📊 Total combined:", combined.length);

        setTrainees(combined);
        setFilteredTrainees(combined);
      } catch (error) {
        console.error("Error fetching trainees/scholars:", error);
        addToast("Failed to load trainees and scholars", "error");
      } finally {
        setLoadingTrainees(false);
      }
    };

    fetchTraineesAndScholars();
  }, [addToast]);

  // Filter trainees based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTrainees(trainees);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = trainees.filter((trainee) => {
      const fullName =
        `${trainee.userID.firstname} ${trainee.userID.lastname}`.toLowerCase();
      const email = trainee.userID.email.toLowerCase();
      return fullName.includes(query) || email.includes(query);
    });
    setFilteredTrainees(filtered);
  }, [searchQuery, trainees]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch DTR when trainee, month, or year changes
  const fetchDTR = useCallback(async () => {
    if (!selectedTrainee) {
      setDtr(null);
      setEntries([]);
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/dtr/office/get-user-dtr", {
        userId: selectedTrainee,
        month: selectedMonth,
        year: selectedYear,
      });

      setDtr(response.data.dtr);
      const mappedEntries = (response.data.dtr.entries || []).map(
        (entry: any) => ({
          ...entry,
          id: entry.day,
        })
      );
      setEntries(mappedEntries);
    } catch (error) {
      console.error("Error fetching DTR:", error);
      addToast("Failed to load DTR", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedTrainee, selectedMonth, selectedYear, addToast]);

  useEffect(() => {
    fetchDTR();
  }, [fetchDTR]);

  // Confirm single entry
  const handleConfirmEntry = async (day: number) => {
    if (!dtr) return;

    try {
      const response = await API.post("/dtr/office/confirm-entry", {
        dtrId: dtr._id,
        day,
      });

      setDtr(response.data.dtr);
      const mappedEntries = (response.data.dtr.entries || []).map(
        (entry: any) => ({
          ...entry,
          id: entry.day,
        })
      );
      setEntries(mappedEntries);
      addToast("Entry confirmed successfully", "success");
    } catch (error) {
      console.error("Error confirming entry:", error);
      addToast("Failed to confirm entry", "error");
    }
  };

  // Unconfirm single entry
  const handleUnconfirmEntry = async (day: number) => {
    if (!dtr) return;
    try {
      const response = await API.post("/dtr/office/unconfirm-entry", {
        dtrId: dtr._id,
        day,
      });

      setDtr(response.data.dtr);
      const mappedEntries = (response.data.dtr.entries || []).map(
        (entry: any) => ({
          ...entry,
          id: entry.day,
        })
      );
      setEntries(mappedEntries);
      addToast("Entry set to unconfirmed", "success");
    } catch (error) {
      console.error("Error unconfirming entry:", error);
      addToast("Failed to unconfirm entry", "error");
    }
  };

  // Confirm all entries
  const handleConfirmAll = async () => {
    if (!dtr) return;

    try {
      const response = await API.post("/dtr/office/confirm-all-entries", {
        dtrId: dtr._id,
      });

      setDtr(response.data.dtr);
      const mappedEntries = (response.data.dtr.entries || []).map(
        (entry: any) => ({
          ...entry,
          id: entry.day,
        })
      );
      setEntries(mappedEntries);
      addToast("All entries confirmed successfully", "success");
    } catch (error) {
      console.error("Error confirming all entries:", error);
      addToast("Failed to confirm all entries", "error");
    }
  };

  // Start editing an entry
  const handleStartEdit = (entry: Entry) => {
    setEditingEntry(entry.day);
    // Ensure shifts array exists in edit values
    const editEntry = { ...entry };
    if (!editEntry.shifts || editEntry.shifts.length === 0) {
      // Initialize with one empty shift if no shifts exist
      editEntry.shifts = [{ in: "", out: "" }];
    }
    setEditValues(editEntry);
  };

  // Add a new shift to editing entry
  const handleAddShift = () => {
    if (!editValues) return;
    const updatedShifts = [...(editValues.shifts || []), { in: "", out: "" }];
    setEditValues({ ...editValues, shifts: updatedShifts });
  };

  // Remove a shift from editing entry
  const handleRemoveShift = (index: number) => {
    if (!editValues || !editValues.shifts) return;
    const updatedShifts = editValues.shifts.filter((_, i) => i !== index);
    setEditValues({ ...editValues, shifts: updatedShifts });
  };

  // Update shift time
  const handleShiftTimeChange = (
    index: number,
    field: "in" | "out",
    value: string
  ) => {
    if (!editValues || !editValues.shifts) return;
    const updatedShifts = [...editValues.shifts];
    updatedShifts[index] = { ...updatedShifts[index], [field]: value };
    setEditValues({ ...editValues, shifts: updatedShifts });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditValues(null);
  };

  // Save edited entry
  const handleSaveEdit = async () => {
    if (!dtr || !editValues) return;

    try {
      // Calculate total hours from shifts
      const toMinutes = (time?: string) => {
        if (!time) return 0;
        const [h, m] = time.split(":").map(Number);
        return (h || 0) * 60 + (m || 0);
      };

      let totalMinutes = 0;

      // Calculate from shifts array if it exists
      if (editValues.shifts && editValues.shifts.length > 0) {
        editValues.shifts.forEach((shift) => {
          const inTime = toMinutes(shift.in);
          const outTime = toMinutes(shift.out);
          if (outTime > inTime) {
            totalMinutes += outTime - inTime;
          }
        });
      }

      const response = await API.put("/dtr/office/update-user-entry", {
        userId: selectedTrainee,
        dtrId: dtr._id,
        day: editValues.day,
        entryData: {
          shifts: editValues.shifts || [],
          // Keep legacy fields for backward compatibility
          in1: editValues.in1 || "",
          out1: editValues.out1 || "",
          in2: editValues.in2 || "",
          out2: editValues.out2 || "",
          in3: editValues.in3 || "",
          out3: editValues.out3 || "",
          in4: editValues.in4 || "",
          out4: editValues.out4 || "",
          totalHours: totalMinutes,
        },
      });

      setDtr(response.data.dtr);
      const mappedEntries = (response.data.dtr.entries || []).map(
        (entry: any) => ({
          ...entry,
          id: entry.day,
        })
      );
      setEntries(mappedEntries);
      addToast("Entry updated successfully", "success");
      handleCancelEdit();
    } catch (error) {
      console.error("Error updating entry:", error);
      addToast("Failed to update entry", "error");
    }
  };

  // Format total hours
  const formatTotalHours = () => {
    if (!dtr?.totalMonthlyHours) return "0h 00m";
    const hours = Math.floor(dtr.totalMonthlyHours / 60);
    const minutes = dtr.totalMonthlyHours % 60;
    return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
  };

  // Calculate weekly hours and check 30h limit
  const calculateWeeklyHours = () => {
    const weeks: {
      weekNum: number;
      hours: number;
      days: number[];
      exceeds: boolean;
    }[] = [];

    let currentWeek: number[] = [];

    // Group days by week (Sunday to Saturday)
    entries.forEach((entry) => {
      const dayOfMonth = entry.day;
      const date = new Date(selectedYear, selectedMonth - 1, dayOfMonth);
      const dayOfWeek = date.getDay();

      // Start new week on Sunday
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        // Calculate hours for the completed week (only confirmed entries)
        const weekHours = currentWeek.reduce((sum, day) => {
          const e = entries.find((ent) => ent.day === day);
          // Only count hours if the entry is confirmed
          if (e?.confirmationStatus === "confirmed") {
            return sum + (e?.totalHours || 0);
          }
          return sum;
        }, 0);

        const weekHoursInHours = weekHours / 60;
        const exceeds = weekHoursInHours > 30;

        weeks.push({
          weekNum: weeks.length + 1,
          hours: weekHours,
          days: [...currentWeek],
          exceeds,
        });

        currentWeek = [];
      }

      currentWeek.push(dayOfMonth);
    });

    // Add the last week if it has days
    if (currentWeek.length > 0) {
      const weekHours = currentWeek.reduce((sum, day) => {
        const e = entries.find((ent) => ent.day === day);
        // Only count hours if the entry is confirmed
        if (e?.confirmationStatus === "confirmed") {
          return sum + (e?.totalHours || 0);
        }
        return sum;
      }, 0);

      const weekHoursInHours = weekHours / 60;
      const exceeds = weekHoursInHours > 30;

      weeks.push({
        weekNum: weeks.length + 1,
        hours: weekHours,
        days: [...currentWeek],
        exceeds,
      });
    }

    return weeks;
  };

  // Calculate attendance statistics
  const calculateStats = () => {
    const hasAnyTime = (e: Entry) => {
      // Use dynamic shifts first
      if (e.shifts && e.shifts.length > 0) {
        return e.shifts.some(
          (s) => (s.in && s.in.trim()) || (s.out && s.out.trim())
        );
      }
      // Fall back to legacy fields
      const fields = [
        e.in1,
        e.out1,
        e.in2,
        e.out2,
        e.in3,
        e.out3,
        e.in4,
        e.out4,
      ];
      return (
        fields.some((v) => typeof v === "string" && v.trim() !== "") ||
        (typeof e.totalHours === "number" && e.totalHours > 0)
      );
    };

    // Present = any recorded time (shifts or legacy) or computed hours > 0
    const present = entries.filter((e) => hasAnyTime(e)).length;

    // Absent = explicitly marked absent by office (do not infer to avoid false positives)
    const absent = entries.filter((e) => e.status === "Absent").length;

    // Late = either computed late minutes > 0 or explicitly tagged as Late
    const late = entries.filter(
      (e) => (typeof e.late === "number" && e.late > 0) || e.status === "Late"
    ).length;

    // Undertime = computed undertime minutes > 0
    const undertime = entries.filter(
      (e) => typeof e.undertime === "number" && e.undertime > 0
    ).length;

    return { present, absent, late, undertime };
  };

  // Get day name
  const getDayName = (day: number) => {
    const date = new Date(selectedYear, selectedMonth - 1, day);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  // Check if a day is Sunday
  const isSunday = (day: number) => {
    const date = new Date(selectedYear, selectedMonth - 1, day);
    return date.getDay() === 0;
  };

  // Handle marking day as excused
  const handleMarkAsExcused = (day: number) => {
    setExcusedDay(day);
    const entry = entries.find((e) => e.day === day);
    setExcusedReason(entry?.excusedReason || "");
    setShowExcusedModal(true);
    setActionsModalDay(null); // Close actions modal
  };

  // Handle removing excused status
  const handleRemoveExcused = async (day: number) => {
    if (!dtr) return;

    try {
      const response = await API.post("/dtr/office/mark-day-excused", {
        dtrId: dtr._id,
        day,
        excusedStatus: "none",
        excusedReason: "",
        confirmationStatus: "unconfirmed", // Reset to unconfirmed when removing excused
      });

      setDtr(response.data.dtr);
      const mappedEntries = (response.data.dtr.entries || []).map(
        (entry: any) => ({
          ...entry,
          id: entry.day,
        })
      );
      setEntries(mappedEntries);
      addToast("Excused status removed successfully", "success");
    } catch (error) {
      console.error("Error removing excused status:", error);
      addToast("Failed to remove excused status", "error");
    }
  };

  // Mark day as absent
  const handleMarkAbsent = async (day: number) => {
    if (!dtr) return;
    setAbsentLoadingDay(day);
    try {
      const response = await API.post("/dtr/office/mark-day-absent", {
        dtrId: dtr._id,
        day,
        absentStatus: "absent",
      });
      setDtr(response.data.dtr);
      const mappedEntries = (response.data.dtr.entries || []).map(
        (entry: any) => ({
          ...entry,
          id: entry.day,
        })
      );
      setEntries(mappedEntries);
      addToast("Day marked as absent", "success");
    } catch (error) {
      console.error("Error marking day as absent:", error);
      addToast("Failed to mark day as absent", "error");
    } finally {
      setAbsentLoadingDay(null);
    }
  };

  // Remove absent status
  const handleRemoveAbsent = async (day: number) => {
    if (!dtr) return;
    setAbsentLoadingDay(day);
    try {
      const response = await API.post("/dtr/office/mark-day-absent", {
        dtrId: dtr._id,
        day,
        absentStatus: "none",
        confirmationStatus: "unconfirmed",
      });
      setDtr(response.data.dtr);
      const mappedEntries = (response.data.dtr.entries || []).map(
        (entry: any) => ({
          ...entry,
          id: entry.day,
        })
      );
      setEntries(mappedEntries);
      addToast("Absent status removed", "success");
    } catch (error) {
      console.error("Error removing absent status:", error);
      addToast("Failed to remove absent status", "error");
    } finally {
      setAbsentLoadingDay(null);
    }
  };

  // Submit excused status
  const handleSubmitExcused = async () => {
    if (!dtr || !excusedDay || !excusedReason.trim()) {
      addToast("Please provide a reason for excusing this day", "error");
      return;
    }

    try {
      const response = await API.post("/dtr/office/mark-day-excused", {
        dtrId: dtr._id,
        day: excusedDay,
        excusedStatus: "excused",
        excusedReason: excusedReason.trim(),
      });

      setDtr(response.data.dtr);
      const mappedEntries = (response.data.dtr.entries || []).map(
        (entry: any) => ({
          ...entry,
          id: entry.day,
        })
      );
      setEntries(mappedEntries);
      addToast("Day marked as excused successfully", "success");
      setShowExcusedModal(false);
      setExcusedDay(null);
      setExcusedReason("");
    } catch (error) {
      console.error("Error marking day as excused:", error);
      addToast("Failed to mark day as excused", "error");
    }
  };

  // Open inquiry modal
  const handleOpenInquiryModal = () => {
    if (!selectedTrainee) {
      addToast("Please select a trainee/scholar first", "error");
      return;
    }
    setShowInquiryModal(true);
  };

  // Send inquiry email
  const handleSendInquiry = async () => {
    if (!selectedTrainee || !inquiryMessage.trim()) {
      addToast("Please provide a message for the inquiry", "error");
      return;
    }

    setSendingInquiry(true);
    try {
      await API.post("/dtr/office/send-inquiry", {
        userId: selectedTrainee,
        message: inquiryMessage.trim(),
        month: selectedMonth,
        year: selectedYear,
      });

      addToast("Inquiry email sent successfully", "success");
      setShowInquiryModal(false);
      setInquiryMessage("");
    } catch (error) {
      console.error("Error sending inquiry email:", error);
      addToast("Failed to send inquiry email", "error");
    } finally {
      setSendingInquiry(false);
    }
  };

  // Validate time input against constraints
  const validateTimeInput = (field: string, value: string): boolean => {
    if (!value) return true; // Allow empty values

    const [hours, minutes] = value.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;

    // Morning shift: in1 should be 7:00 AM - 11:59 AM
    if (field === "in1") {
      const morningStart = 7 * 60; // 7:00 AM
      const morningEnd = 12 * 60 - 1; // 11:59 AM
      return totalMinutes >= morningStart && totalMinutes <= morningEnd;
    }

    // Morning shift: out1 should be 7:00 AM - 12:00 PM
    if (field === "out1") {
      const morningStart = 7 * 60; // 7:00 AM
      const morningEnd = 12 * 60; // 12:00 PM
      return totalMinutes >= morningStart && totalMinutes <= morningEnd;
    }

    // Afternoon shift: in2 should be 1:00 PM - 8:00 PM
    if (field === "in2") {
      const afternoonStart = 13 * 60; // 1:00 PM
      const afternoonEnd = 20 * 60; // 8:00 PM
      return totalMinutes >= afternoonStart && totalMinutes <= afternoonEnd;
    }

    // Afternoon shift: out2 should be 1:00 PM - 8:00 PM
    if (field === "out2") {
      const afternoonStart = 13 * 60; // 1:00 PM
      const afternoonEnd = 20 * 60; // 8:00 PM
      return totalMinutes >= afternoonStart && totalMinutes <= afternoonEnd;
    }

    return true;
  };

  // Handle time input change with validation
  const handleTimeInputChange = (field: keyof Entry, value: string) => {
    if (!editValues) return;

    // Validate the input
    if (value && !validateTimeInput(field, value)) {
      let errorMessage = "";
      switch (field) {
        case "in1":
          errorMessage = "Morning In must be between 7:00 AM and 11:59 AM";
          break;
        case "out1":
          errorMessage = "Morning Out must be between 7:00 AM and 12:00 PM";
          break;
        case "in2":
          errorMessage = "Afternoon In must be between 1:00 PM and 8:00 PM";
          break;
        case "out2":
          errorMessage = "Afternoon Out must be between 1:00 PM and 8:00 PM";
          break;
        default:
          errorMessage = "Invalid time. Please check time constraints.";
      }
      addToast(errorMessage, "error");
      return;
    }

    // Create updated entry with new value
    const updatedValues = {
      ...editValues,
      [field]: value,
    };

    // Validate that Out time is greater than In time
    const toMinutes = (time?: string) => {
      if (!time) return 0;
      const [h, m] = time.split(":").map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    // Check morning shift
    if (field === "out1" && value && updatedValues.in1) {
      const in1Minutes = toMinutes(updatedValues.in1);
      const out1Minutes = toMinutes(value);
      if (out1Minutes <= in1Minutes) {
        addToast("Morning Out must be after Morning In", "error");
        return;
      }
    }

    if (field === "in1" && value && updatedValues.out1) {
      const in1Minutes = toMinutes(value);
      const out1Minutes = toMinutes(updatedValues.out1);
      if (out1Minutes <= in1Minutes) {
        addToast("Morning In must be before Morning Out", "error");
        return;
      }
    }

    // Check afternoon shift
    if (field === "out2" && value && updatedValues.in2) {
      const in2Minutes = toMinutes(updatedValues.in2);
      const out2Minutes = toMinutes(value);
      if (out2Minutes <= in2Minutes) {
        addToast("Afternoon Out must be after Afternoon In", "error");
        return;
      }
    }

    if (field === "in2" && value && updatedValues.out2) {
      const in2Minutes = toMinutes(value);
      const out2Minutes = toMinutes(updatedValues.out2);
      if (out2Minutes <= in2Minutes) {
        addToast("Afternoon In must be before Afternoon Out", "error");
        return;
      }
    }

    setEditValues(updatedValues);
  };

  // Handle trainee selection
  const handleSelectTrainee = (traineeId: string) => {
    setSelectedTrainee(traineeId);
    const trainee = trainees.find((t) => t.userID._id === traineeId);
    if (trainee) {
      setSearchQuery(`${trainee.userID.firstname} ${trainee.userID.lastname}`);
    }
    setIsDropdownOpen(false);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true);
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedTrainee("");
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  // Handle tooltip position detection
  const handleTooltipHover = (day: number, ref: HTMLDivElement | null) => {
    if (!ref) return;

    const rect = ref.getBoundingClientRect();
    const tooltipHeight = 150; // Approximate tooltip height with padding
    const spaceAbove = rect.top;
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;

    // Prefer showing below for top rows (first 7 days or if in top 200px of screen)
    // Show below if not enough space above OR if element is in top portion of screen
    if (spaceAbove < tooltipHeight + 30 || rect.top < 250) {
      setTooltipPosition((prev) => ({ ...prev, [day]: "bottom" }));
    } else if (spaceBelow < tooltipHeight + 30) {
      // Force top if no space below
      setTooltipPosition((prev) => ({ ...prev, [day]: "top" }));
    } else {
      // Default to top if there's space
      setTooltipPosition((prev) => ({ ...prev, [day]: "top" }));
    }
  };

  const selectedTraineeName = selectedTrainee
    ? trainees.find((t) => t.userID._id === selectedTrainee)?.userID
    : null;

  const selectedTraineeData = selectedTrainee
    ? trainees.find((t) => t.userID._id === selectedTrainee)
    : null;

  // Get position display label
  const getPositionLabel = (
    position?: "student_assistant" | "student_marshal"
  ) => {
    if (position === "student_assistant") return "Trainee";
    if (position === "student_marshal") return "Scholar";
    return "Trainee"; // Default
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900">
      <OfficeSidebar onCollapseChange={setIsSidebarCollapsed} />

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Header */}
        <div
          className={`hidden md:flex items-center gap-4 fixed top-0 left-0 z-30 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-800 h-[81px] ${
            isSidebarCollapsed
              ? "md:w-[calc(100%-5rem)] md:ml-20"
              : "md:w-[calc(100%-16rem)] md:ml-64"
          }`}
        >
          <h1 className="text-2xl font-bold text-white ml-4">DTR Checking</h1>
        </div>

        <div className="p-4 md:p-10 mt-12 max-w-7xl mx-auto">
          {/* Selection Card */}
          <Card className="mb-6 shadow-lg">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Trainee Selection with Search */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Trainee/Scholar
                  </label>
                  {loadingTrainees ? (
                    <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Loading...
                      </span>
                    </div>
                  ) : (
                    <div className="relative" ref={dropdownRef}>
                      {/* Search Input */}
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={handleSearchChange}
                          onFocus={() => setIsDropdownOpen(true)}
                          autoComplete="off"
                          placeholder="Search by name..."
                          className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {selectedTrainee && (
                          <button
                            onClick={handleClearSelection}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>

                      {/* Dropdown Results */}
                      {isDropdownOpen && filteredTrainees.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredTrainees.map((trainee) => (
                            <button
                              key={trainee.userID._id}
                              onClick={() =>
                                handleSelectTrainee(trainee.userID._id)
                              }
                              className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                selectedTrainee === trainee.userID._id
                                  ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {trainee.userID.firstname}{" "}
                                    {trainee.userID.lastname}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {trainee.userID.email}
                                  </div>
                                </div>
                                <span
                                  className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                                    trainee.position === "student_marshal"
                                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                  }`}
                                >
                                  {getPositionLabel(trainee.position)}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* No Results Message */}
                      {isDropdownOpen &&
                        searchQuery &&
                        filteredTrainees.length === 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                              No trainees found matching "{searchQuery}"
                            </p>
                          </div>
                        )}
                    </div>
                  )}
                </div>

                {/* Month Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Month
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    disabled={!selectedTrainee}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    disabled={!selectedTrainee}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Stats */}
              {dtr && !loading && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {(() => {
                      const stats = calculateStats();
                      return (
                        <>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-gray-600 dark:text-gray-400">
                              Present:{" "}
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {stats.present}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="text-gray-600 dark:text-gray-400">
                              Absent:{" "}
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {stats.absent}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <span className="text-gray-600 dark:text-gray-400">
                              Late:{" "}
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {stats.late}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <span className="text-gray-600 dark:text-gray-400">
                              Undertime:{" "}
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {stats.undertime}
                              </span>
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Confirm All Button */}
              {dtr && entries.length > 0 && (
                <>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Total Monthly Hours:
                      </span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {formatTotalHours()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleOpenInquiryModal}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                        title="Send email inquiry to trainee/scholar"
                      >
                        <Mail className="h-4 w-4" />
                        Send Inquiry
                      </button>
                      <button
                        onClick={handleConfirmAll}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Confirm All
                      </button>
                    </div>
                  </div>

                  {/* Weekly Hours Breakdown */}
                  {(() => {
                    const weeklyHours = calculateWeeklyHours();
                    const hasWeeklyViolations = weeklyHours.some(
                      (w) => w.exceeds
                    );

                    return weeklyHours.length > 0 ? (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Weekly Hours (30h Quota)
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          {weeklyHours.map((week) => {
                            const hours = Math.floor(week.hours / 60);
                            const minutes = week.hours % 60;
                            const percentage = (week.hours / 60 / 30) * 100;
                            const isComplete = percentage >= 100;

                            return (
                              <div
                                key={week.weekNum}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                  isComplete
                                    ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                                    : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                    Week {week.weekNum}
                                  </span>
                                  {isComplete && (
                                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                  )}
                                </div>
                                <div className="text-lg font-bold mb-1">
                                  <span
                                    className={
                                      isComplete
                                        ? "text-green-700 dark:text-green-300"
                                        : "text-gray-800 dark:text-gray-200"
                                    }
                                  >
                                    {hours}h{" "}
                                    {minutes.toString().padStart(2, "0")}m
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden mb-1">
                                  <div
                                    className={`h-full transition-all duration-300 ${
                                      isComplete
                                        ? "bg-gradient-to-r from-green-500 to-green-600"
                                        : "bg-gradient-to-r from-blue-500 to-blue-600"
                                    }`}
                                    style={{
                                      width: `${Math.min(percentage, 100)}%`,
                                    }}
                                  ></div>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {percentage >= 100 ? (
                                    <span className="text-green-600 dark:text-green-400 font-semibold">
                                      {percentage.toFixed(0)}% of quota
                                    </span>
                                  ) : (
                                    <span>{percentage.toFixed(0)}% of 30h</span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  Days {week.days[0]}-
                                  {week.days[week.days.length - 1]}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </>
              )}
            </CardContent>
          </Card>

          {/* DTR Content */}
          {loading && (
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                  <span className="text-gray-600 dark:text-gray-400 text-lg">
                    Loading DTR...
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && !selectedTrainee && (
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Calendar className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Select a Trainee or Scholar
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose a trainee or scholar from the dropdown above to view
                    and manage their DTR.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && selectedTrainee && dtr && (
            <Card className="shadow-lg">
              <CardContent className="p-6 md:p-8">
                {/* Header */}
                <div className="mb-6 border-b pb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                      DTR for {selectedTraineeName?.firstname}{" "}
                      {selectedTraineeName?.lastname}
                    </h2>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedTraineeData?.position === "student_marshal"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}
                    >
                      {getPositionLabel(selectedTraineeData?.position)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {months.find((m) => m.value === selectedMonth)?.label}{" "}
                    {selectedYear}
                  </p>
                </div>

                {/* DTR Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Day
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Date
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                          <div className="flex flex-col items-center">
                            <span>Duty</span>
                            <span className="text-[10px] font-normal text-gray-500 dark:text-gray-400">
                              IN → OUT times
                            </span>
                          </div>
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Hours
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Late
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Undertime
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Status
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => {
                        const isEditing = editingEntry === entry.day;
                        const currentEntry = isEditing ? editValues : entry;
                        const hours = Math.floor(
                          (currentEntry?.totalHours || 0) / 60
                        );
                        const minutes = (currentEntry?.totalHours || 0) % 60;
                        const hasTimeData =
                          // Prefer dynamic shifts if present
                          (Array.isArray(entry.shifts) &&
                            entry.shifts.some(
                              (s: any) =>
                                (s?.in && String(s.in).trim() !== "") ||
                                (s?.out && String(s.out).trim() !== "")
                            )) ||
                          // Fallback to legacy fields
                          !!(
                            entry.in1 ||
                            entry.out1 ||
                            entry.in2 ||
                            entry.out2 ||
                            entry.in3 ||
                            entry.out3 ||
                            entry.in4 ||
                            entry.out4
                          ) ||
                          // Or computed total hours
                          (typeof entry.totalHours === "number" &&
                            entry.totalHours > 0);

                        return (
                          <tr
                            key={entry.day}
                            className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                              entry.confirmationStatus === "confirmed"
                                ? "bg-green-50 dark:bg-green-900/10"
                                : ""
                            }`}
                          >
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                              {getDayName(entry.day)}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {entry.day}
                            </td>
                            {/* Duty Column */}
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                              {(() => {
                                // Edit mode
                                if (isEditing) {
                                  const editShifts = editValues?.shifts || [];
                                  const isConfirmed =
                                    entry.confirmationStatus === "confirmed";
                                  return (
                                    <div className="space-y-2">
                                      {editShifts.map((shift, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center gap-2 text-xs"
                                        >
                                          <span className="font-semibold text-gray-600 dark:text-gray-400 w-14">
                                            Duty {index + 1}:
                                          </span>
                                          <input
                                            type="time"
                                            value={shift.in || ""}
                                            onChange={(e) =>
                                              handleShiftTimeChange(
                                                index,
                                                "in",
                                                e.target.value
                                              )
                                            }
                                            className="px-2 py-1 text-xs border rounded dark:bg-gray-700 dark:border-gray-600"
                                            placeholder="IN"
                                          />
                                          <span className="text-gray-400">
                                            →
                                          </span>
                                          <input
                                            type="time"
                                            value={shift.out || ""}
                                            onChange={(e) =>
                                              handleShiftTimeChange(
                                                index,
                                                "out",
                                                e.target.value
                                              )
                                            }
                                            className="px-2 py-1 text-xs border rounded dark:bg-gray-700 dark:border-gray-600"
                                            placeholder="OUT"
                                          />
                                          {!isConfirmed && (
                                            <button
                                              onClick={() =>
                                                handleRemoveShift(index)
                                              }
                                              className="p-1 text-red-600 hover:text-red-700 dark:text-red-400"
                                              title="Remove shift"
                                            >
                                              <X className="h-3 w-3" />
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                      {!isConfirmed && (
                                        <button
                                          onClick={handleAddShift}
                                          className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                                        >
                                          <span>+ Add Duty</span>
                                        </button>
                                      )}
                                    </div>
                                  );
                                }

                                // View mode
                                const shifts = getShifts(entry);
                                const hasData = shifts.some(
                                  (s) => s.in || s.out
                                );
                                const isConfirmed = entry.confirmationStatus === "confirmed";
                                const isExcused = entry.excusedStatus === "excused";
                                const isAbsent = entry.status === "Absent";
                                const canEdit = !isConfirmed && !isExcused && !isAbsent;

                                return (
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex-1">
                                      {hasData ? (
                                        <div className="space-y-1">
                                          {shifts.map((shift, index) => {
                                            if (!shift.in && !shift.out) return null;
                                            return (
                                              <div
                                                key={index}
                                                className="flex items-center gap-2 text-xs justify-center"
                                              >
                                                <span className="font-semibold text-gray-600 dark:text-gray-400">
                                                  Duty {index + 1}:
                                                </span>
                                                <span className="font-mono text-gray-700 dark:text-gray-300">
                                                  {shift.in || "--:--"}
                                                </span>
                                                <span className="text-gray-400">
                                                  →
                                                </span>
                                                <span className="font-mono text-gray-700 dark:text-gray-300">
                                                  {shift.out || "--:--"}
                                                </span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      ) : (
                                        <div className="text-center text-gray-400 text-xs">
                                          -
                                        </div>
                                      )}
                                    </div>
                                    {/* Edit/Add Duty Button */}
                                    {canEdit && (
                                      <button
                                        onClick={() => handleStartEdit(entry)}
                                        className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors flex-shrink-0"
                                        title={hasData ? "Edit Duty" : "Add Duty"}
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                          />
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                );
                              })()}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-sm text-gray-700 dark:text-gray-300">
                              {hours}h {minutes.toString().padStart(2, "0")}m
                            </td>
                            {/* Late Column */}
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-xs">
                              {entry.late && entry.late > 0 ? (
                                <span className="text-orange-600 dark:text-orange-400 font-semibold">
                                  {entry.late}m
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            {/* Undertime Column */}
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-xs">
                              {entry.undertime && entry.undertime > 0 ? (
                                <span className="text-red-600 dark:text-red-400 font-semibold">
                                  {entry.undertime}m
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {entry.status === "Absent" ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                    <AlertCircle className="h-3 w-3" />
                                    Absent
                                  </span>
                                ) : entry.excusedStatus === "excused" ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                    <ShieldCheck className="h-3 w-3" />
                                    Excused
                                  </span>
                                ) : entry.confirmationStatus === "confirmed" ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Confirmed
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                    <Clock className="h-3 w-3" />
                                    Unconfirmed
                                  </span>
                                )}
                                {(entry.confirmedByProfile ||
                                  entry.excusedReason ||
                                  (entry.editHistory &&
                                    entry.editHistory.length > 0)) && (
                                  <div
                                    className="relative inline-block group"
                                    ref={(el) => {
                                      infoIconRefs.current[entry.day] = el;
                                    }}
                                    onMouseEnter={() =>
                                      handleTooltipHover(
                                        entry.day,
                                        infoIconRefs.current[entry.day]
                                      )
                                    }
                                  >
                                    <Info className="h-4 w-4 text-blue-500 cursor-help" />
                                    <div
                                      className={`invisible group-hover:visible fixed ${
                                        tooltipPosition[entry.day] === "bottom"
                                          ? "translate-y-2"
                                          : "-translate-y-full -mt-2"
                                      } left-1/2 -translate-x-1/2 w-60 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-[9999] pointer-events-none`}
                                      style={{
                                        top: infoIconRefs.current[entry.day]
                                          ? `${
                                              infoIconRefs.current[
                                                entry.day
                                              ]!.getBoundingClientRect().top +
                                              (tooltipPosition[entry.day] ===
                                              "bottom"
                                                ? infoIconRefs.current[
                                                    entry.day
                                                  ]!.getBoundingClientRect()
                                                    .height
                                                : 0)
                                            }px`
                                          : "0",
                                        left: infoIconRefs.current[entry.day]
                                          ? `${
                                              infoIconRefs.current[
                                                entry.day
                                              ]!.getBoundingClientRect().left +
                                              infoIconRefs.current[
                                                entry.day
                                              ]!.getBoundingClientRect().width /
                                                2
                                            }px`
                                          : "0",
                                      }}
                                    >
                                      {/* Arrow */}
                                      <div
                                        className={`absolute left-1/2 -translate-x-1/2 ${
                                          tooltipPosition[entry.day] ===
                                          "bottom"
                                            ? "bottom-full -mb-px"
                                            : "top-full -mt-px"
                                        }`}
                                      >
                                        <div
                                          className={`w-3 h-3 rotate-45 bg-white dark:bg-gray-800 ${
                                            tooltipPosition[entry.day] ===
                                            "bottom"
                                              ? "border-l border-t"
                                              : "border-r border-b"
                                          } border-gray-200 dark:border-gray-700`}
                                        ></div>
                                      </div>
                                      <div className="text-xs space-y-2 text-left">
                                        {entry.excusedReason && (
                                          <div className="text-purple-700 dark:text-purple-400">
                                            <div className="font-semibold">
                                              Excused:
                                            </div>
                                            <div className="mt-0.5">
                                              {entry.excusedReason}
                                            </div>
                                          </div>
                                        )}
                                        {entry.confirmedByProfile && (
                                          <div className="text-green-700 dark:text-green-400">
                                            <div className="font-semibold">
                                              Confirmed by:
                                            </div>
                                            <div className="mt-0.5">
                                              {entry.confirmedByProfile}
                                            </div>
                                          </div>
                                        )}
                                        {entry.editHistory &&
                                          entry.editHistory.length > 0 && (
                                            <div className="text-blue-700 dark:text-blue-400">
                                              <div className="font-semibold">
                                                Last edited by:
                                              </div>
                                              <div className="mt-0.5">
                                                {
                                                  entry.editHistory[
                                                    entry.editHistory.length - 1
                                                  ].editedByName
                                                }
                                              </div>
                                            </div>
                                          )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                              {isEditing ? (
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={handleSaveEdit}
                                    className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded"
                                    title="Save"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="p-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded"
                                    title="Cancel"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-1 flex-wrap">
                                  {(() => {
                                    const hasTimeData = getShifts(entry).some((s) => s.in || s.out);
                                    const isAbsent = entry.status === "Absent";
                                    const isExcused = entry.excusedStatus === "excused";
                                    const isConfirmed = entry.confirmationStatus === "confirmed";

                                    return (
                                      <>
                                        {/* Confirm Button */}
                                        {hasTimeData && !isConfirmed && !isExcused && !isAbsent && (
                                          <button
                                            onClick={() => handleConfirmEntry(entry.day)}
                                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                            title="Confirm Entry"
                                          >
                                            <Check className="h-3 w-3" />
                                            Confirm
                                          </button>
                                        )}

                                        {/* Unconfirm Button */}
                                        {isConfirmed && (
                                          <button
                                            onClick={() => handleUnconfirmEntry(entry.day)}
                                            className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                            title="Unconfirm Entry"
                                          >
                                            <AlertCircle className="h-3 w-3" />
                                            Unconfirm
                                          </button>
                                        )}

                                        {/* Excused Button */}
                                        {!isConfirmed && !isExcused && !isAbsent && (
                                          <button
                                            onClick={() => handleMarkAsExcused(entry.day)}
                                            className="px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                            title="Mark as Excused"
                                          >
                                            <ShieldCheck className="h-3 w-3" />
                                            Excused
                                          </button>
                                        )}

                                        {/* Remove Excused Button */}
                                        {isExcused && (
                                          <button
                                            onClick={() => handleRemoveExcused(entry.day)}
                                            className="px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                            title="Remove Excused"
                                          >
                                            <X className="h-3 w-3" />
                                            Remove Excused
                                          </button>
                                        )}

                                        {/* Absent Button */}
                                        {!isConfirmed && !isExcused && !isAbsent && (
                                          <button
                                            onClick={() => handleMarkAbsent(entry.day)}
                                            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                            title="Mark as Absent"
                                          >
                                            <X className="h-3 w-3" />
                                            Absent
                                          </button>
                                        )}

                                        {/* Remove Absent Button */}
                                        {isAbsent && (
                                          <button
                                            onClick={() => handleRemoveAbsent(entry.day)}
                                            disabled={absentLoadingDay === entry.day}
                                            className="px-2 py-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                            title="Remove Absent"
                                          >
                                            <X className="h-3 w-3" />
                                            Remove Absent
                                          </button>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Excused Modal */}
      {showExcusedModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    Mark Day as Excused
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowExcusedModal(false);
                    setExcusedDay(null);
                    setExcusedReason("");
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Info Alert */}
              <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-purple-800 dark:text-purple-300">
                    <p className="font-semibold mb-1">
                      Excused days do NOT count towards hours
                    </p>
                    <p>
                      Use this for medical or personal emergencies where the
                      trainee/scholar cannot fulfill duty hours.
                    </p>
                  </div>
                </div>
              </div>

              {/* Day Info */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Day:{" "}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {excusedDay &&
                      `${getDayName(excusedDay)}, ${
                        months.find((m) => m.value === selectedMonth)?.label
                      } ${excusedDay}, ${selectedYear}`}
                  </span>
                </p>
              </div>

              {/* Reason Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Excusing <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={excusedReason}
                  onChange={(e) => setExcusedReason(e.target.value)}
                  placeholder="e.g., Medical emergency, Family emergency, etc."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Be specific about the reason for excusing this day.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowExcusedModal(false);
                    setExcusedDay(null);
                    setExcusedReason("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitExcused}
                  disabled={!excusedReason.trim()}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  Mark as Excused
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    Send DTR Inquiry
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowInquiryModal(false);
                    setInquiryMessage("");
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={sendingInquiry}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Info Alert */}
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex gap-2">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-semibold mb-1">Email Notification</p>
                    <p>
                      An email will be sent to the trainee/scholar requesting
                      them to come to the office to discuss their DTR.
                    </p>
                  </div>
                </div>
              </div>

              {/* Trainee Info */}
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Trainee/Scholar:
                </p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {selectedTraineeName?.firstname}{" "}
                  {selectedTraineeName?.lastname}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedTraineeName?.email}
                </p>
              </div>

              {/* DTR Period */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  DTR Period:{" "}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {months.find((m) => m.value === selectedMonth)?.label}{" "}
                    {selectedYear}
                  </span>
                </p>
              </div>

              {/* Message Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  placeholder="e.g., I have some questions about your time entries on the 15th. Please come to the office when you have time."
                  rows={5}
                  disabled={sendingInquiry}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Be clear about what you need to discuss regarding their DTR.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowInquiryModal(false);
                    setInquiryMessage("");
                  }}
                  disabled={sendingInquiry}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInquiry}
                  disabled={!inquiryMessage.trim() || sendingInquiry}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {sendingInquiry ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions Modal */}
      {actionsModalDay !== null &&
        (() => {
          const entry = entries.find((e) => e.day === actionsModalDay);
          if (!entry) return null;
          const hasTimeData = getShifts(entry).some((s) => s.in || s.out);
          const isAbsent = entry.status === "Absent";
          const isExcused = entry.excusedStatus === "excused";
          const isConfirmed = entry.confirmationStatus === "confirmed";

          return (
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                      Day {actionsModalDay} - Actions
                    </h3>
                    <button
                      onClick={() => setActionsModalDay(null)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Day Info */}
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getDayName(actionsModalDay)},{" "}
                      {months.find((m) => m.value === selectedMonth)?.label}{" "}
                      {actionsModalDay}, {selectedYear}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Status:{" "}
                      <span className="font-medium">
                        {entry.status || "No Status"}
                      </span>
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {/* Status Actions */}
                    {isAbsent ? (
                      <button
                        onClick={() => {
                          handleRemoveAbsent(actionsModalDay);
                          setActionsModalDay(null);
                        }}
                        disabled={absentLoadingDay === actionsModalDay}
                        className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-left flex items-center gap-3"
                      >
                        <X className="h-5 w-5" />
                        <div>
                          <div>Remove Absent Status</div>
                          <div className="text-xs text-red-100">
                            Reset this day to unconfirmed
                          </div>
                        </div>
                      </button>
                    ) : isExcused ? (
                      <button
                        onClick={() => {
                          handleRemoveExcused(actionsModalDay);
                          setActionsModalDay(null);
                        }}
                        className="w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors text-left flex items-center gap-3"
                      >
                        <X className="h-5 w-5" />
                        <div>
                          <div>Remove Excused Status</div>
                          <div className="text-xs text-purple-100">
                            Reset this day to unconfirmed
                          </div>
                        </div>
                      </button>
                    ) : (
                      <>
                        {!isConfirmed && (
                          <>
                            <button
                              onClick={() =>
                                handleMarkAsExcused(actionsModalDay)
                              }
                              className="w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors text-left flex items-center gap-3"
                            >
                              <ShieldCheck className="h-5 w-5" />
                              <div>
                                <div>Mark as Excused</div>
                                <div className="text-xs text-purple-100">
                                  For medical/personal emergencies
                                </div>
                              </div>
                            </button>

                            <button
                              onClick={() => {
                                handleMarkAbsent(actionsModalDay);
                                setActionsModalDay(null);
                              }}
                              className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors text-left flex items-center gap-3"
                            >
                              <X className="h-5 w-5" />
                              <div>
                                <div>Mark as Absent</div>
                                <div className="text-xs text-red-100">
                                  No hours for this day
                                </div>
                              </div>
                            </button>
                          </>
                        )}
                      </>
                    )}

                    {/* Edit/Confirm Actions */}
                    {!isExcused && !isAbsent && (
                      <>
                        {!isConfirmed && (
                          <button
                            onClick={() => {
                              handleStartEdit(entry);
                              setActionsModalDay(null);
                            }}
                            className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-left flex items-center gap-3"
                          >
                            <Clock className="h-5 w-5" />
                            <div>
                              <div>Edit Time Entries</div>
                              <div className="text-xs text-blue-100">
                                Modify in/out times
                              </div>
                            </div>
                          </button>
                        )}

                        {hasTimeData && !isConfirmed && (
                          <button
                            onClick={() => {
                              handleConfirmEntry(actionsModalDay);
                              setActionsModalDay(null);
                            }}
                            className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors text-left flex items-center gap-3"
                          >
                            <CheckCircle2 className="h-5 w-5" />
                            <div>
                              <div>Confirm Entry</div>
                              <div className="text-xs text-green-100">
                                Mark as verified
                              </div>
                            </div>
                          </button>
                        )}

                        {isConfirmed && (
                          <button
                            onClick={() => {
                              handleUnconfirmEntry(actionsModalDay);
                              setActionsModalDay(null);
                            }}
                            className="w-full px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors text-left flex items-center gap-3"
                          >
                            <AlertCircle className="h-5 w-5" />
                            <div>
                              <div>Unconfirm Entry</div>
                              <div className="text-xs text-amber-200">
                                Reset to unconfirmed status
                              </div>
                            </div>
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => setActionsModalDay(null)}
                    className="w-full mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default OfficeDTRCheck;
