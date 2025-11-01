# DTR Schedule Synchronization Feature

## Overview

This feature automatically synchronizes the student's Daily Time Record (DTR) with their class schedule and duty hours to calculate if the student is **late** or **undertime**.

## How It Works

### 1. Schedule Data Sources

The system uses two sources to build a complete schedule for each student:

- **Class Schedule**: Uploaded by students as a PDF, parsed into structured data containing:

  - Subject code and name
  - Days of the week (e.g., MW, TTh, F)
  - Time slots (e.g., 7:00-8:30 AM)
  - Instructor and section information

- **Duty Hours**: Added by office staff, containing:
  - Day of the week
  - Start and end times
  - Location

### 2. Automatic Calculation

When a student saves their DTR entry (or when office staff edits it), the system:

1. **Fetches the student's schedule** from their application record
2. **Determines the day of the week** for that DTR entry
3. **Builds a complete schedule map** combining classes and duty hours
4. **Calculates late and undertime** based on:
   - **Late**: Time between scheduled start and actual time in (`in1`)
   - **Undertime**: Time between actual time out (`out2` or `out1`) and scheduled end

### 3. Schedule Format Support

The system can parse various schedule formats:

- `MW 7:00-8:30 AM` (Monday and Wednesday)
- `TTh 1:00-2:30 PM` (Tuesday and Thursday)
- `F 10:00 AM-12:00 PM` (Friday)
- `MWF 9:00-10:00 AM` (Monday, Wednesday, Friday)

Day abbreviations:

- `M` = Monday
- `T` = Tuesday
- `W` = Wednesday
- `Th` = Thursday
- `F` = Friday
- `S` = Saturday
- `Su` = Sunday

## Implementation Details

### Backend Components

#### 1. **Schedule Sync Utility** (`backend/src/utils/scheduleSync.ts`)

Core functions:

- `parseDayAbbreviations()`: Converts day codes (MW, TTh) to day names
- `convertTo24Hour()`: Converts 12-hour time to 24-hour format
- `parseScheduleString()`: Extracts days and times from schedule strings
- `buildScheduleMap()`: Creates a day-by-day schedule map
- `calculateLateAndUndertime()`: Calculates late/undertime for a specific date
- `syncDTRWithSchedule()`: Main function that fetches data and calculates

#### 2. **DTR Service Updates** (`backend/src/services/dtr.service.ts`)

Enhanced methods:

- `updateDTREntry()`: Now calls schedule sync before saving
- `updateDTREntryByOffice()`: Includes schedule sync for office edits

#### 3. **New API Endpoint** (`backend/src/controllers/dtr.controller.ts`)

New endpoint:

- `GET /api/dtr/schedule/:year/:month/:day`
- Returns the student's schedule for a specific date
- Useful for displaying schedule info in the DTR interface

### Frontend Components

#### 1. **API Client** (`frontend/src/lib/api.ts`)

New function:

```typescript
export const getScheduleForDate = async (
  year: number,
  month: number,
  day: number
) => {
  const response = await API.get(`/dtr/schedule/${year}/${month}/${day}`);
  return response.data;
};
```

## Example Usage

### Backend (Automatic)

When a student updates their DTR:

```typescript
// Student saves time in/out
await DTRService.updateDTREntry(dtrId, day, {
  in1: "07:15", // Student came in at 7:15 AM
  out1: "12:00",
  in2: "13:00",
  out2: "16:00", // Student left at 4:00 PM
});

// System automatically:
// 1. Fetches student's schedule for that day
// 2. Finds scheduled time: 7:00 AM - 5:00 PM
// 3. Calculates late: 15 minutes (7:15 - 7:00)
// 4. Calculates undertime: 60 minutes (4:00 - 5:00)
// 5. Saves with late=15, undertime=60
```

### Frontend (Optional Display)

Display schedule for a specific date:

```typescript
const scheduleInfo = await getScheduleForDate(2024, 11, 15);
console.log(scheduleInfo);
// {
//   date: "2024-11-15T00:00:00.000Z",
//   dayName: "Friday",
//   schedule: [
//     {
//       startTime: "09:00",
//       endTime: "10:30",
//       type: "class",
//       description: "CS101 - Intro to Programming"
//     },
//     {
//       startTime: "14:00",
//       endTime: "17:00",
//       type: "duty",
//       description: "Duty at Main Office"
//     }
//   ]
// }
```

## Benefits

1. **Accuracy**: Eliminates manual calculation errors
2. **Consistency**: Same logic applied to all students
3. **Transparency**: Students can see exactly when they're expected
4. **Automation**: Saves time for office staff
5. **Fairness**: Objective calculation based on actual schedule

## Future Enhancements

Potential improvements:

- Grace period configuration (e.g., 5 minutes before marking late)
- Different rules for different days
- Holiday detection
- Excused tardiness/absences based on official leaves
- Email notifications when late/undertime exceeds threshold
- Visual schedule display in DTR interface

## Technical Notes

### Time Format

- All times are stored in 24-hour format (HH:MM)
- Schedule parsing supports both 12-hour (AM/PM) and 24-hour formats

### Day Matching

- DTR entries are matched to schedules by day of the week
- System handles month/year to determine correct day

### Edge Cases Handled

- No schedule for the day (returns 0 late/undertime)
- Partial time entries (only in1, no out)
- Multiple sessions (morning and afternoon)
- No active trainee application (returns 0 late/undertime)

### Performance

- Schedule sync happens only when DTR entries are saved
- Results are cached in the DTR entry
- No real-time calculation needed for display

## Database Schema

### DTR Entry Fields

```typescript
interface IDTREntry {
  day: number;
  in1?: string;
  out1?: string;
  in2?: string;
  out2?: string;
  late?: number; // Auto-calculated, in minutes
  undertime?: number; // Auto-calculated, in minutes
  totalHours?: number;
  status?: string;
  // ... other fields
}
```

### Application Fields

```typescript
interface Application {
  classScheduleData?: Array<{
    section: string;
    subjectCode: string;
    subjectName: string;
    instructor: string;
    schedule: string; // e.g., "MW 7:00-8:30 AM"
    units: number;
  }>;
  dutyHours?: Array<{
    day: string; // e.g., "Monday"
    startTime: string; // e.g., "14:00"
    endTime: string; // e.g., "17:00"
    location: string;
  }>;
}
```

## Testing

To test the feature:

1. **Create a student with schedule**:

   - Student uploads class schedule PDF
   - Office staff adds duty hours

2. **Fill DTR entries**:

   - Student enters time in/out for various days
   - Check that late/undertime are calculated automatically

3. **Verify calculations**:

   - Compare calculated values with manual calculations
   - Test edge cases (no schedule, partial entries)

4. **Check API endpoint**:
   ```bash
   curl -H "Authorization: Bearer TOKEN" \
     http://localhost:4004/api/dtr/schedule/2024/11/15
   ```

## Troubleshooting

### Late/Undertime not calculating?

- Check if student has an active trainee application
- Verify class schedule data is present
- Check console logs for sync errors

### Wrong calculations?

- Verify schedule format is correct
- Check day abbreviations in schedule strings
- Ensure times are in correct format

### API endpoint returning empty schedule?

- Student might not be in trainee status
- No class schedule uploaded
- No duty hours assigned
