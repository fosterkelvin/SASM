# Schedule & Duty Hours Feature Implementation

## Overview

This feature allows office staff to view trainee class schedules and add duty hours that will be displayed on the schedule visualization. Students can see both their class schedule and assigned duty hours.

## Features Implemented

### 1. **Office Staff Capabilities**

- View trainee class schedules
- Add duty hours for trainees
- Specify day, time, and location for duty assignments
- Duty hours are color-coded (red) to distinguish from classes

### 2. **Student Capabilities**

- View their uploaded class schedule
- See duty hours assigned by office staff
- Visual distinction between classes and duty hours

### 3. **Schedule Visualization**

- Weekly calendar view with time slots from 6:00 AM to 9:00 PM
- Classes displayed in various colors
- Duty hours displayed in red with building icon
- PDF download and view options

## Files Created/Modified

### Frontend Files Created:

1. **`frontend/src/pages/Roles/Office/TraineeSchedule.tsx`**
   - New page for office staff to view trainee schedules
   - Form to add duty hours (day, start time, end time, location)
   - Integration with schedule visualization component

### Frontend Files Modified:

1. **`frontend/src/pages/Roles/Student/Schedule/Schedule.tsx`**

   - Updated to display duty hours alongside classes

2. **`frontend/src/pages/Roles/Student/Schedule/components/ScheduleVisualization.tsx`**

   - Added support for duty hours display
   - Visual differentiation with red background and building icon
   - Updated type definitions to include DutyHour interface

3. **`frontend/src/pages/Roles/Office/MyTrainees.tsx`**

   - Added "View Schedule & Add Duty Hours" button for active trainees
   - Button navigates to the trainee schedule page

4. **`frontend/src/lib/api.ts`**

   - Added `addDutyHoursToSchedule` API function

5. **`frontend/src/App.tsx`**
   - Added route: `/office/trainee/:applicationId/schedule`
   - Imported TraineeSchedule component

### Backend Files Modified:

1. **`backend/src/models/application.model.ts`**

   - Added `dutyHours` array field to ApplicationDocument interface
   - Schema includes: day, startTime, endTime, location, addedBy, addedAt

2. **`backend/src/controllers/trainee.controller.ts`**

   - Updated `getClassScheduleHandler` to return duty hours
   - Created `addDutyHoursHandler` to add duty hours to a trainee's schedule
   - Validation for office staff permissions
   - Timeline tracking for duty hour additions

3. **`backend/src/routes/trainee.route.ts`**
   - Added route: `POST /trainees/:applicationId/schedule/duty-hours`
   - Imported and registered `addDutyHoursHandler`

## Data Structure

### Duty Hours Schema:

```typescript
{
  day: string; // e.g., "Monday", "Tuesday"
  startTime: string; // e.g., "8:00 AM"
  endTime: string; // e.g., "5:00 PM"
  location: string; // e.g., "Main Office", "Room 205"
  addedBy: ObjectId; // User who added the duty hours
  addedAt: Date; // Timestamp
}
```

## User Flow

### Office Staff:

1. Navigate to "My Trainees"
2. Click "View Schedule & Add Duty Hours" for an active trainee
3. View the trainee's class schedule
4. Click "Add Duty Hours" button
5. Fill in the form:
   - Select day of week
   - Enter location
   - Set start and end times
6. Click "Save Duty Hours"
7. Duty hours appear on the schedule in red

### Students:

1. Navigate to "Schedule" page
2. Upload their class schedule (PDF)
3. View their schedule with:
   - Classes in various colors
   - Duty hours in red (if assigned by office)

## API Endpoints

### Get Class Schedule

```
GET /api/trainees/schedule (Student - own schedule)
GET /api/trainees/:applicationId/schedule (Office/HR - any trainee)
```

### Add Duty Hours

```
POST /api/trainees/:applicationId/schedule/duty-hours
Body: {
  day: string,
  startTime: string,
  endTime: string,
  location: string
}
```

## Visual Design

- **Classes**: Blue, green, purple, orange, pink, teal, indigo, cyan (color-coded)
- **Duty Hours**: Red background with border, building icon (🏢)
- **Time Grid**: 30-minute intervals, 6 AM - 9 PM
- **Responsive**: Works on mobile and desktop

## Security & Permissions

- Only office staff and HR can add duty hours
- Office staff can only add duty hours for trainees in their office
- Students can only view their own schedule
- Office/HR can view any trainee's schedule

## Future Enhancements

- Edit/delete duty hours
- Bulk duty hour assignment
- Conflict detection (duty hours overlapping with classes)
- Email notifications when duty hours are assigned
- Export schedule with duty hours to PDF
- Duty hours history/audit log

## Testing Checklist

- [ ] Office staff can view trainee schedules
- [ ] Office staff can add duty hours
- [ ] Duty hours appear correctly on the schedule
- [ ] Students can see their assigned duty hours
- [ ] Permissions are enforced correctly
- [ ] Timeline entries are created
- [ ] Responsive design works on mobile
- [ ] Form validation works properly
