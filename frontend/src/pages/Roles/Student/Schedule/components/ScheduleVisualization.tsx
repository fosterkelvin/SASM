import React from "react";

interface ScheduleClass {
  section: string;
  subjectCode: string;
  subjectName: string;
  instructor: string;
  schedule: string;
  units: number;
  day?: string;
  startTime?: string;
  endTime?: string;
  room?: string;
}

interface DutyHour {
  day: string;
  startTime: string;
  endTime: string;
  location: string;
}

interface ScheduleVisualizationProps {
  scheduleClasses: ScheduleClass[];
  dutyHours?: DutyHour[];
}

const ScheduleVisualization: React.FC<ScheduleVisualizationProps> = ({
  scheduleClasses,
  dutyHours = [],
}) => {
  const days = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];

  // Generate 30-minute interval time slots from 6:00 AM to 9:00 PM
  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 6; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 21 && minute > 0) break; // Stop at 9:00 PM
        const period = hour >= 12 ? "PM" : "AM";
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const displayMinute = minute === 0 ? "00" : minute.toString();
        slots.push(`${displayHour}:${displayMinute} ${period}`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Parse schedule string to extract day and time info
  const parseSchedule = (schedule: string) => {
    const classes: Array<{
      day: string;
      startTime: string;
      endTime: string;
      room: string;
    }> = [];

    // Example format: "T/Th 8:00 AM-9:30 AM / F215" or "T/Th 8:00 AM-9:30 AM" (no room)
    // Or multiple schedules: "T/Th 11:00 AM-12:30 PM / F218, F 8:00 AM-11:00 AM / D204"
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
      const roomMatch = segment.match(/\/\s*([A-Z0-9]+)\s*$/i);

      if (daysMatch && timeMatch) {
        const daysStr = daysMatch[1];
        const startTime = timeMatch[1].trim();
        const endTime = timeMatch[2].trim();
        const room = roomMatch ? roomMatch[1] : "";

        // Parse individual days
        const dayTokens = daysStr.split("/");

        dayTokens.forEach((token) => {
          const trimmedToken = token.trim();
          const day = dayMap[trimmedToken];
          if (day) {
            classes.push({ day, startTime, endTime, room });
          }
        });
      }
    }

    return classes;
  };

  // Convert 24-hour time to 12-hour format with AM/PM
  const formatTime = (time: string): string => {
    // If already in 12-hour format, return as is
    if (
      time.includes("AM") ||
      time.includes("PM") ||
      time.includes("am") ||
      time.includes("pm")
    ) {
      return time;
    }

    // Convert 24-hour to 12-hour format
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Convert time string to minutes since midnight
  const timeToMinutes = (time: string): number => {
    // Handle 24-hour format (HH:MM) from time input
    if (
      !time.includes("AM") &&
      !time.includes("PM") &&
      !time.includes("am") &&
      !time.includes("pm")
    ) {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    }

    // Handle 12-hour format (HH:MM AM/PM)
    const [timePart, meridiem] = time.split(/\s+/);
    let [hours, minutes] = timePart.split(":").map(Number);

    if (meridiem && meridiem.toUpperCase() === "PM" && hours !== 12) {
      hours += 12;
    } else if (meridiem && meridiem.toUpperCase() === "AM" && hours === 12) {
      hours = 0;
    }

    return hours * 60 + minutes;
  };

  // Calculate row span for a class (how many 30-min slots it occupies)
  const calculateRowSpan = (startTime: string, endTime: string): number => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const durationMinutes = endMinutes - startMinutes;
    return Math.ceil(durationMinutes / 30);
  };

  // Find the row index for a given time
  const getRowIndex = (time: string): number => {
    const minutes = timeToMinutes(time);
    const startMinutes = 6 * 60; // 6:00 AM in minutes
    return Math.floor((minutes - startMinutes) / 30);
  };

  // Build schedule grid with proper positioning
  type ScheduleGridType = {
    [key: string]: {
      [key: number]: {
        class: ScheduleClass;
        rowSpan: number;
        isDuty?: boolean;
      }[];
    };
  };
  const scheduleGrid: ScheduleGridType = {};

  scheduleClasses.forEach((cls) => {
    const parsedClasses = parseSchedule(cls.schedule);
    parsedClasses.forEach((parsed) => {
      if (!scheduleGrid[parsed.day]) {
        scheduleGrid[parsed.day] = {};
      }
      const rowIndex = getRowIndex(parsed.startTime);
      const rowSpan = calculateRowSpan(parsed.startTime, parsed.endTime);

      if (!scheduleGrid[parsed.day][rowIndex]) {
        scheduleGrid[parsed.day][rowIndex] = [];
      }
      scheduleGrid[parsed.day][rowIndex].push({
        class: { ...cls, ...parsed },
        rowSpan,
        isDuty: false,
      });
    });
  });

  // Add duty hours to the grid
  dutyHours.forEach((duty) => {
    const dayUpper = duty.day.toUpperCase();
    if (!scheduleGrid[dayUpper]) {
      scheduleGrid[dayUpper] = {};
    }
    const rowIndex = getRowIndex(duty.startTime);
    const rowSpan = calculateRowSpan(duty.startTime, duty.endTime);

    // Format times for display
    const formattedStartTime = formatTime(duty.startTime);
    const formattedEndTime = formatTime(duty.endTime);

    if (!scheduleGrid[dayUpper][rowIndex]) {
      scheduleGrid[dayUpper][rowIndex] = [];
    }
    scheduleGrid[dayUpper][rowIndex].push({
      class: {
        section: "",
        subjectCode: "DUTY",
        subjectName: `Duty Hours - ${duty.location}`,
        instructor: "",
        schedule: `${duty.day} ${formattedStartTime}-${formattedEndTime} / ${duty.location}`,
        units: 0,
        day: dayUpper,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        room: duty.location,
      },
      rowSpan,
      isDuty: true,
    });
  });

  const getColorForSubject = (subjectCode: string, isDuty?: boolean) => {
    if (isDuty) {
      return "bg-red-600 text-white border-2 border-red-800";
    }
    // Use consistent colors based on subject code
    const hash = subjectCode
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      "bg-blue-500 text-white",
      "bg-green-500 text-white",
      "bg-purple-500 text-white",
      "bg-orange-500 text-white",
      "bg-pink-500 text-white",
      "bg-teal-500 text-white",
      "bg-indigo-500 text-white",
      "bg-cyan-500 text-white",
    ];
    return colors[hash % colors.length];
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded">
          SCHEDULE PROJECTION
        </h3>
      </div>

      {/* Schedule Grid - Similar to the reference image */}
      <div className="overflow-x-auto border border-gray-300 dark:border-gray-600 rounded-lg">
        <table className="w-full border-collapse bg-white dark:bg-gray-900">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="border border-gray-300 dark:border-gray-600 p-3 text-center font-semibold text-sm w-24">
                <div className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </th>
              {days.map((day) => (
                <th
                  key={day}
                  className="border border-gray-300 dark:border-gray-600 p-3 text-center font-semibold text-sm text-gray-700 dark:text-gray-200"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((timeSlot, timeIndex) => (
              <tr
                key={timeSlot}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                style={{ height: "50px" }}
              >
                {/* Time Label */}
                <td
                  className="border border-gray-300 dark:border-gray-600 p-2 text-xs font-medium text-gray-600 dark:text-gray-400 text-right bg-gray-50 dark:bg-gray-800"
                  style={{ height: "50px" }}
                >
                  {timeSlot}
                </td>

                {/* Day Cells */}
                {days.map((day) => {
                  const classesInSlot = scheduleGrid[day]?.[timeIndex] || [];

                  // Check if this cell is part of a previous class's rowspan
                  const isPreviousSpan = () => {
                    for (let i = timeIndex - 1; i >= 0; i--) {
                      const prevClasses = scheduleGrid[day]?.[i] || [];
                      for (const item of prevClasses) {
                        if (i + item.rowSpan > timeIndex) {
                          return true;
                        }
                      }
                    }
                    return false;
                  };

                  if (isPreviousSpan()) {
                    return null; // This cell is spanned by a previous class
                  }

                  return (
                    <td
                      key={`${day}-${timeIndex}`}
                      className="border border-gray-300 dark:border-gray-600 p-0 align-top relative"
                      rowSpan={
                        classesInSlot.length > 0 ? classesInSlot[0].rowSpan : 1
                      }
                    >
                      {classesInSlot.length > 0 ? (
                        <div className="absolute inset-0 w-full h-full overflow-hidden">
                          {classesInSlot.map((item, idx) => (
                            <div
                              key={idx}
                              className={`p-2 w-full h-full ${getColorForSubject(
                                item.class.subjectCode,
                                item.isDuty
                              )} font-medium text-xs flex flex-col overflow-auto`}
                            >
                              <div className="flex items-start gap-1 mb-1 flex-shrink-0">
                                {item.isDuty ? (
                                  <svg
                                    className="w-3 h-3 mt-0.5 flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                                  </svg>
                                ) : (
                                  <svg
                                    className="w-3 h-3 mt-0.5 flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                                <span className="font-bold text-xs leading-tight">
                                  {item.class.startTime} - {item.class.endTime}
                                </span>
                              </div>
                              <div className="ml-4 space-y-0.5 overflow-hidden">
                                <div className="font-bold text-sm leading-tight">
                                  {item.isDuty
                                    ? "🏢 DUTY"
                                    : `[${item.class.subjectCode}]`}
                                </div>
                                <div className="font-semibold text-xs leading-tight break-words">
                                  {item.isDuty
                                    ? item.class.room
                                    : item.class.subjectName}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-[50px]"></div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6">
        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
          Class Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {scheduleClasses.map((cls, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${getColorForSubject(
                cls.subjectCode
              )}`}
            >
              <div className="font-bold text-base mb-1">
                {cls.subjectCode} - {cls.subjectName}
              </div>
              <div className="text-sm opacity-90 space-y-1">
                <div>📍 {cls.schedule}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleVisualization;
