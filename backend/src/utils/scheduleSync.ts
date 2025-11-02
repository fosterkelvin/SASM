/**
 * Schedule Synchronization Utility
 * Calculates late and undertime based on student's class schedule and duty hours
 */

interface ScheduleClass {
  section: string;
  subjectCode: string;
  subjectName: string;
  instructor: string;
  schedule: string; // e.g., "MW 7:00-8:30 AM"
  units: number;
}

interface DutyHour {
  day: string;
  startTime: string;
  endTime: string;
  location: string;
}

interface TimeSlot {
  startTime: string; // HH:MM format (24-hour)
  endTime: string;
  type: "class" | "duty";
  description: string;
}

interface DaySchedule {
  [key: string]: TimeSlot[]; // key is day name (e.g., "Monday", "M", "MW")
}

/**
 * Parse day abbreviations to full day names
 */
function parseDayAbbreviations(dayStr: string): string[] {
  const dayMap: { [key: string]: string } = {
    M: "Monday",
    T: "Tuesday",
    W: "Wednesday",
    Th: "Thursday",
    F: "Friday",
    S: "Saturday",
    Su: "Sunday",
  };

  const days: string[] = [];
  let i = 0;

  while (i < dayStr.length) {
    // Check for "Th" first (two characters)
    if (i < dayStr.length - 1 && dayStr.substring(i, i + 2) === "Th") {
      days.push(dayMap["Th"]);
      i += 2;
    }
    // Check for "Su" (two characters)
    else if (i < dayStr.length - 1 && dayStr.substring(i, i + 2) === "Su") {
      days.push(dayMap["Su"]);
      i += 2;
    }
    // Single character days
    else if (dayMap[dayStr[i]]) {
      days.push(dayMap[dayStr[i]]);
      i++;
    } else {
      i++;
    }
  }

  return days;
}

/**
 * Convert 12-hour time to 24-hour format (HH:MM)
 */
function convertTo24Hour(time: string): string {
  const timePattern = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
  const match = time.match(timePattern);

  if (!match) {
    // Try without minutes
    const simplePattern = /(\d{1,2})\s*(AM|PM)/i;
    const simpleMatch = time.match(simplePattern);
    if (simpleMatch) {
      let hours = parseInt(simpleMatch[1]);
      const period = simpleMatch[2].toUpperCase();

      if (period === "PM" && hours !== 12) {
        hours += 12;
      } else if (period === "AM" && hours === 12) {
        hours = 0;
      }

      return `${hours.toString().padStart(2, "0")}:00`;
    }
    return "00:00"; // Default if parsing fails
  }

  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

/**
 * Parse schedule string to extract days and time
 * Examples:
 * - "MW 7:00-8:30 AM"
 * - "TTh 1:00-2:30 PM"
 * - "F 10:00 AM-12:00 PM"
 */
function parseScheduleString(schedule: string): {
  days: string[];
  startTime: string;
  endTime: string;
} | null {
  // Pattern: Day abbreviations followed by time range
  const pattern =
    /([MTWFSu]+[Th]?)\s+(\d{1,2}:\d{2}|\d{1,2})\s*(AM|PM)?\s*[-–]\s*(\d{1,2}:\d{2}|\d{1,2})\s*(AM|PM)/i;
  const match = schedule.match(pattern);

  if (!match) {
    return null;
  }

  const dayStr = match[1];
  const startTimeStr = match[2];
  const startPeriod = match[3] || match[5]; // Use end period if start period not specified
  const endTimeStr = match[4];
  const endPeriod = match[5];

  const days = parseDayAbbreviations(dayStr);
  const startTime = convertTo24Hour(`${startTimeStr} ${startPeriod}`);
  const endTime = convertTo24Hour(`${endTimeStr} ${endPeriod}`);

  return { days, startTime, endTime };
}

/**
 * Build a schedule map from class schedule data and duty hours
 */
export function buildScheduleMap(
  classScheduleData: ScheduleClass[],
  dutyHours: DutyHour[]
): DaySchedule {
  const scheduleMap: DaySchedule = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  // Add classes to schedule
  if (classScheduleData && Array.isArray(classScheduleData)) {
    classScheduleData.forEach((classItem) => {
      const parsed = parseScheduleString(classItem.schedule);
      if (parsed) {
        const { days, startTime, endTime } = parsed;
        days.forEach((day) => {
          if (scheduleMap[day]) {
            scheduleMap[day].push({
              startTime,
              endTime,
              type: "class",
              description: `${classItem.subjectCode} - ${classItem.subjectName}`,
            });
          }
        });
      }
    });
  }

  // Add duty hours to schedule
  if (dutyHours && Array.isArray(dutyHours)) {
    dutyHours.forEach((duty) => {
      const day = duty.day;
      if (scheduleMap[day]) {
        scheduleMap[day].push({
          startTime: duty.startTime, // Assumes HH:MM format
          endTime: duty.endTime,
          type: "duty",
          description: `Duty at ${duty.location}`,
        });
      }
    });
  }

  // Sort time slots by start time for each day
  Object.keys(scheduleMap).forEach((day) => {
    scheduleMap[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  return scheduleMap;
}

/**
 * Get the day name from a date
 */
function getDayName(date: Date): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[date.getDay()];
}

/**
 * Calculate time difference in minutes
 */
function calculateMinutesDifference(time1: string, time2: string): number {
  const [hours1, minutes1] = time1.split(":").map(Number);
  const [hours2, minutes2] = time2.split(":").map(Number);

  const totalMinutes1 = hours1 * 60 + minutes1;
  const totalMinutes2 = hours2 * 60 + minutes2;

  return totalMinutes2 - totalMinutes1;
}

/**
 * Calculate late and undertime based on schedule
 */
export function calculateLateAndUndertime(
  date: Date,
  in1: string | undefined,
  out1: string | undefined,
  in2: string | undefined,
  out2: string | undefined,
  in3: string | undefined,
  out3: string | undefined,
  in4: string | undefined,
  out4: string | undefined,
  scheduleMap: DaySchedule
): {
  late: number;
  undertime: number;
  scheduledStartTime: string | null;
  scheduledEndTime: string | null;
} {
  const dayName = getDayName(date);
  const daySchedule = scheduleMap[dayName] || [];

  let late = 0;
  let undertime = 0;
  let scheduledStartTime: string | null = null;
  let scheduledEndTime: string | null = null;

  if (daySchedule.length === 0) {
    // No schedule for this day
    return {
      late: 0,
      undertime: 0,
      scheduledStartTime: null,
      scheduledEndTime: null,
    };
  }

  // Get the earliest start time and latest end time from schedule
  const firstSlot = daySchedule[0];
  const lastSlot = daySchedule[daySchedule.length - 1];

  scheduledStartTime = firstSlot.startTime;
  scheduledEndTime = lastSlot.endTime;

  // Calculate late (if student came in late)
  // Use the first IN time that is provided
  const firstInTime = in1 || in2 || in3 || in4;
  if (firstInTime) {
    const minutesLate = calculateMinutesDifference(
      scheduledStartTime,
      firstInTime
    );
    if (minutesLate > 0) {
      late = minutesLate;
    }
  } else {
    // No time in at all - consider entire period as late/absent
    // This is handled by status field, not late calculation
    late = 0;
  }

  // Calculate undertime (if student left early)
  // Use the last OUT time that is provided (check in reverse order)
  const actualOutTime = out4 || out3 || out2 || out1;
  if (actualOutTime && scheduledEndTime) {
    const minutesEarly = calculateMinutesDifference(
      actualOutTime,
      scheduledEndTime
    );
    if (minutesEarly > 0) {
      undertime = minutesEarly;
    }
  } else if (!actualOutTime && scheduledEndTime) {
    // No time out at all - consider entire period as undertime
    // This is handled by status field, not undertime calculation
    undertime = 0;
  }

  return { late, undertime, scheduledStartTime, scheduledEndTime };
}

/**
 * Main function to synchronize DTR entry with schedule
 */
export async function syncDTRWithSchedule(
  userId: string,
  day: number,
  month: number,
  year: number,
  in1: string | undefined,
  out1: string | undefined,
  in2: string | undefined,
  out2: string | undefined,
  in3?: string | undefined,
  out3?: string | undefined,
  in4?: string | undefined,
  out4?: string | undefined
): Promise<{
  late: number;
  undertime: number;
  scheduledStartTime: string | null;
  scheduledEndTime: string | null;
}> {
  try {
    // Import models dynamically to avoid circular dependencies
    const ApplicationModel = require("../models/application.model").default;
    const ScholarModel = require("../models/scholar.model").default;
    const ScheduleModel = require("../models/schedule.model").default;

    let classScheduleData: ScheduleClass[] = [];
    let dutyHours: DutyHour[] = [];

    // Check if user is a scholar first
    console.log(`🔍 Schedule sync called for userId: ${userId}`);
    const scholar = await ScholarModel.findOne({
      userId: userId,
      status: "active",
    });

    if (scholar) {
      console.log(`✅ Found scholar: ${scholar._id}`);
      // User is an active scholar - get schedule from Schedule model
      const schedule = await ScheduleModel.findOne({
        scholarId: scholar._id,
        userType: "scholar",
      });

      if (schedule) {
        // For scholars, use their work schedule (duty hours)
        dutyHours = schedule.dutyHours || [];
        classScheduleData = []; // Scholars don't have class schedules
        console.log(
          `📋 Scholar DTR sync - Found ${dutyHours.length} duty hours:`,
          JSON.stringify(dutyHours)
        );
      } else {
        console.log(`❌ No schedule found for scholar ${scholar._id}`);
      }
    } else {
      console.log(`❌ No scholar found for userId: ${userId}`);

      // Not a scholar - check for trainee application
      const application = await ApplicationModel.findOne({
        userID: userId,
        status: { $in: ["trainee", "training_completed"] },
      });

      if (!application) {
        // No active trainee application - return zeros
        return {
          late: 0,
          undertime: 0,
          scheduledStartTime: null,
          scheduledEndTime: null,
        };
      }

      // Get class schedule and duty hours from application (trainees)
      classScheduleData = application.classScheduleData || [];
      dutyHours = application.dutyHours || [];
    }

    // Build schedule map
    const scheduleMap = buildScheduleMap(classScheduleData, dutyHours);

    // Create date object for the DTR entry
    const date = new Date(year, month - 1, day);

    // Calculate late and undertime
    const result = calculateLateAndUndertime(
      date,
      in1,
      out1,
      in2,
      out2,
      in3,
      out3,
      in4,
      out4,
      scheduleMap
    );

    return result;
  } catch (error) {
    console.error("Error syncing DTR with schedule:", error);
    return {
      late: 0,
      undertime: 0,
      scheduledStartTime: null,
      scheduledEndTime: null,
    };
  }
}
