# Multiple Duties Per Day - Implementation Guide

## Overview

The SASM DTR system now supports **up to 4 shifts per day** for students who need to log multiple duty periods in a single day.

## Current System Structure

### Database Schema (Backend)

Each DTR entry now supports 4 time pairs:

- **Shift 1**: `in1` / `out1`
- **Shift 2**: `in2` / `out2`
- **Shift 3**: `in3` / `out3`
- **Shift 4**: `in4` / `out4`

### How It Works

#### 1. **Student View**

Students will see a table with 4 shift columns:

```
| Day | Weekday | IN Shift 1 | OUT Shift 1 | IN Shift 2 | OUT Shift 2 | IN Shift 3 | OUT Shift 3 | IN Shift 4 | OUT Shift 4 | Late | Undertime | Total Hours | Status |
```

#### 2. **Time Input**

- Students can fill in any combination of shifts
- Each shift is independent
- Example scenarios:
  - **1 duty**: Fill in Shift 1 only
  - **2 duties**: Fill in Shift 1 and Shift 2
  - **3 duties**: Fill in Shift 1, Shift 2, and Shift 3
  - **4 duties**: Fill in all shifts

#### 3. **Calculations**

- **Total Hours**: Sum of all shift durations
  ```
  Total = (out1 - in1) + (out2 - in2) + (out3 - in3) + (out4 - in4)
  ```
- **Late**: Based on first IN time (in1 or in2 or in3 or in4)
- **Undertime**: Based on last OUT time (out4 or out3 or out2 or out1)

#### 4. **Validation**

- Shifts 1 & 2 have time restrictions (Morning: 7:00-12:00, Afternoon: 13:00-17:00)
- Shifts 3 & 4 have no time restrictions (flexible for extended duties)
- OUT time must be after IN time for each shift
- Sunday entries are disabled (No duty)

## Example Use Cases

### Case 1: Student with Morning and Afternoon Duty

```
Shift 1: 07:30 - 11:00 (3.5 hours)
Shift 2: 13:00 - 17:00 (4 hours)
Total: 7.5 hours (but capped at 5 hours officially)
```

### Case 2: Student with Multiple Short Duties

```
Shift 1: 08:00 - 10:00 (2 hours)
Shift 2: 11:00 - 12:00 (1 hour)
Shift 3: 14:00 - 16:00 (2 hours)
Total: 5 hours
```

### Case 3: Student with Extended Duty

```
Shift 1: 07:00 - 12:00 (5 hours)
Shift 2: 13:00 - 15:00 (2 hours)
Shift 3: 18:00 - 20:00 (2 hours - evening event)
Total: 9 hours (but capped at 5 hours officially)
```

## Technical Implementation

### Backend Changes

#### 1. Model Updates (`backend/src/models/dtr.model.ts`)

```typescript
export interface IDTREntry {
  day: number;
  in1?: string;
  out1?: string;
  in2?: string;
  out2?: string;
  in3?: string; // NEW
  out3?: string; // NEW
  in4?: string; // NEW
  out4?: string; // NEW
  // ... other fields
}
```

#### 2. Service Updates (`backend/src/services/dtr.service.ts`)

- Updated `updateDTREntry()` to handle in3, out3, in4, out4
- Updated `updateDTREntryByOffice()` to handle in3, out3, in4, out4
- Updated edit history tracking to include new fields

#### 3. Schedule Sync Updates (`backend/src/utils/scheduleSync.ts`)

- Updated `syncDTRWithSchedule()` to accept 4 shifts
- Updated `calculateLateAndUndertime()` to use first IN and last OUT from all shifts

### Frontend Changes

#### 1. Type Updates (`frontend/src/pages/Roles/Student/DTR/components/types.ts`)

```typescript
export interface Entry {
  id: number;
  in1?: string;
  out1?: string;
  in2?: string;
  out2?: string;
  in3?: string; // NEW
  out3?: string; // NEW
  in4?: string; // NEW
  out4?: string; // NEW
  // ... other fields
}
```

#### 2. Table Updates (`DTRTable.tsx`)

- Added 4 new columns (IN Shift 3, OUT Shift 3, IN Shift 4, OUT Shift 4)
- Changed labels from "Morning/Afternoon" to "Shift 1/2/3/4"
- Updated footer colspan

#### 3. Row Component Updates (`DayRow.tsx`)

- Added 4 new time input fields
- Updated `computeTotal()` to include all 4 shifts
- Updated status condition to check all 4 shifts

#### 4. Save Logic Updates (`Dtr.tsx`)

- Updated total hours calculation to include all 4 shifts
- Updated hasTimeEntry check to include all 4 shifts
- Updated completeEntryData to include all 4 shifts

## User Instructions

### For Students:

1. Navigate to your DTR page
2. Select the month you want to fill in
3. For each day:
   - **Single duty**: Fill in Shift 1 (IN and OUT)
   - **Two duties**: Fill in Shift 1 and Shift 2
   - **Three duties**: Fill in Shift 1, Shift 2, and Shift 3
   - **Four duties**: Fill in all shifts
4. System automatically saves after 2 seconds of inactivity
5. Submit at the end of the month

### Time Restrictions:

- **Shift 1** (Morning): 7:00 AM - 12:00 PM
- **Shift 2** (Afternoon): 1:00 PM - 5:00 PM
- **Shift 3** (Flexible): No restrictions
- **Shift 4** (Flexible): No restrictions

### Important Notes:

- ✅ You can skip shifts (e.g., fill Shift 1 and Shift 3, skip Shift 2)
- ✅ Total hours are automatically calculated
- ⚠️ Official totals are capped at 5 hours per day
- ⚠️ OUT time must be after IN time for each shift
- 🚫 Cannot edit on Sundays (No duty)
- 🔒 Cannot edit confirmed entries (locked by office)

## Testing

### Test Scenarios:

1. ✅ Add single shift
2. ✅ Add two consecutive shifts
3. ✅ Add non-consecutive shifts (1 and 3)
4. ✅ Add all four shifts
5. ✅ Verify total hours calculation
6. ✅ Verify late/undertime calculation
7. ✅ Test Sunday blocking
8. ✅ Test auto-save functionality

## Future Enhancements (Optional)

### If More Than 4 Shifts Are Needed:

1. **Dynamic Shifts**: Add "Add Shift" button to create unlimited shifts
2. **Shift Arrays**: Store shifts as an array instead of fixed fields
3. **Shift Naming**: Allow custom shift names (Morning, Lunch, Afternoon, Evening)
4. **Shift Templates**: Pre-defined shift patterns for common schedules

### Migration Path:

```typescript
// Current: Fixed 4 shifts
in1, out1, in2, out2, in3, out3, in4, out4;

// Future: Dynamic shifts array
shifts: [
  { name: "Morning", in: "07:00", out: "11:00" },
  { name: "Lunch", in: "11:30", out: "12:30" },
  { name: "Afternoon", in: "13:00", out: "17:00" },
  // ... unlimited
];
```

## Summary

✅ **Implemented**: Students can now log up to 4 duties per day
✅ **Backward Compatible**: Existing 2-shift data still works
✅ **Flexible**: Can use any combination of shifts
✅ **Validated**: Proper time constraints and calculations
✅ **Auto-saving**: Changes save automatically

The system is ready for students with multiple duty schedules!
