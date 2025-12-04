# Duty Hours Multi-Day Selection Update

## Overview

Redesigned the duty hours form to support selecting multiple days of the week at once, improving efficiency when assigning the same schedule across multiple days.

## Changes Made

### 1. TraineeSchedule.tsx (`frontend/src/pages/Roles/Office/TraineeSchedule.tsx`)

#### Interface Updates

- Added new `DutyHourFormData` interface for the form state:
  ```typescript
  interface DutyHourFormData {
    days: string[]; // Changed from single day to array of days
    startTime: string;
    endTime: string;
    location: string;
  }
  ```

#### State Management

- Renamed `dutyHourEntry` to `dutyHourForm`
- Changed from single day selection to multiple day array

#### Form UI Changes

- **Before**: Dropdown (`<select>`) for single day selection
- **After**: Checkbox grid for multiple day selection
  - 2 columns on mobile, 4 columns on desktop
  - Visual hover effects
  - Shows all 7 days of the week
  - Users can select any combination of days

#### Logic Updates

- Updated `handleAddDutyHours()`:

  - Validates at least one day is selected
  - Checks for conflicts on each selected day
  - Skips conflicting days and shows warning
  - Creates individual entries for each valid day
  - All entries added to pending list

- Updated `handleCancelAddDutyForm()`:

  - Resets form with empty `days` array

- Mutation success handler:
  - Resets form to initial state with empty days array

### 2. ScholarSchedule.tsx (`frontend/src/pages/Roles/Office/ScholarSchedule.tsx`)

#### Interface Updates

- Added same `DutyHourFormData` interface as TraineeSchedule

#### State Management

- Renamed `dutyHourEntry` to `dutyHourForm`
- Changed to support multiple days array

#### Form UI Changes (2 instances updated)

- Both forms (no schedule view and schedule exists view) updated with checkbox grid
- Identical checkbox implementation as TraineeSchedule

#### Logic Updates

- Updated `handleAddDutyHours()`:

  - Creates array of entries (one per selected day)
  - Adds entries sequentially
  - Shows success message with count
  - Resets form after all additions complete

- Updated mutation success handler:
  - Removed form reset (handled in handleAddDutyHours)

## User Experience Improvements

### Before

1. Select one day from dropdown
2. Fill in time and location
3. Click "Add to List"
4. **Repeat steps 1-3 for each additional day**
5. Click "Save All"

### After

1. **Check all desired days (multiple)**
2. Fill in time and location once
3. Click "Add to List"
4. (Optional) Add more entries
5. Click "Save All"

## Benefits

1. **Efficiency**: Assign same hours to multiple days in one action
2. **Fewer clicks**: No need to repeat for each day
3. **Better UX**: Visual representation of selected days
4. **Conflict handling**: Automatically detects and skips conflicting days
5. **Flexibility**: Still allows different times for different days by adding multiple entries

## Example Use Cases

### Use Case 1: Weekly Office Hours

Office staff wants to set Monday-Friday, 9:00 AM - 5:00 PM, Main Office

- **Before**: 5 separate additions
- **After**: 1 addition (select all 5 days at once)

### Use Case 2: MWF Schedule

Scholar has duty hours on Monday, Wednesday, Friday at the same time

- **Before**: 3 separate additions
- **After**: 1 addition (check M, W, F)

### Use Case 3: Mixed Schedule

Different hours on different days

- Still flexible: Add one entry for M/W/F, another for T/Th with different times

## Technical Details

### Conflict Detection

The system still validates conflicts for each individual day:

- Checks against existing duty hours
- Checks against pending duty hours (TraineeSchedule)
- Checks against class/work schedules
- Shows which specific days had conflicts

### Data Structure

Each selected day still creates a separate `DutyHourEntry`:

```typescript
{
  day: "Monday",
  startTime: "09:00",
  endTime: "17:00",
  location: "Main Office"
}
```

This maintains backward compatibility with the existing API and database structure.

## Files Modified

1. `frontend/src/pages/Roles/Office/TraineeSchedule.tsx`
2. `frontend/src/pages/Roles/Office/ScholarSchedule.tsx`

## Testing Recommendations

1. ✅ Select multiple days and verify each creates a separate entry
2. ✅ Test conflict detection for each selected day
3. ✅ Verify form resets after successful submission
4. ✅ Test with all 7 days selected
5. ✅ Test with single day (should work like before)
6. ✅ Test canceling with pending entries
7. ✅ Verify both TraineeSchedule and ScholarSchedule forms work identically
