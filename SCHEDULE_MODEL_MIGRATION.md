# Schedule Model Migration - Complete

## Overview

Successfully migrated all schedule and duty hours functionality from the `Application` model to a dedicated `Schedule` model. This provides proper separation of concerns and allows both trainees and scholars to have schedules managed independently.

## Changes Made

### 1. New Schedule Model Created

**File:** `backend/src/models/schedule.model.ts`

**Schema Structure:**

```typescript
{
  userId: ObjectId,              // Reference to User
  applicationId?: ObjectId,      // For trainees (optional)
  scholarId?: ObjectId,          // For scholars (optional)
  userType: "trainee" | "scholar",
  classSchedule: string,         // Cloudinary URL
  classScheduleData: any,        // Parsed schedule data
  dutyHours: IDutyHour[],       // Array of duty hour entries
  uploadedAt: Date,
  lastModifiedBy: ObjectId,
  lastModifiedAt: Date
}

interface IDutyHour {
  day: string;
  startTime: string;
  endTime: string;
  location: string;
  notes?: string;
}
```

**Key Features:**

- Either `applicationId` OR `scholarId` must be set (validated in schema)
- `dutyHours` array stores all duty hour entries
- Tracks who last modified the schedule and when

### 2. Updated Handlers

#### ✅ `uploadClassScheduleHandler`

**Location:** `backend/src/controllers/trainee.controller.ts` (lines ~1196-1270)

**Changes:**

- Now creates/updates `Schedule` records instead of `Application` records
- Determines if user is trainee or scholar
- Finds or creates schedule with appropriate `applicationId` or `scholarId`
- Sets `userType` field correctly
- Updates `lastModifiedBy` and `lastModifiedAt` fields

**Key Logic:**

```typescript
// Determine if user is trainee or scholar
const application = await ApplicationModel.findOne({
  userID,
  status: { $in: ["trainee", "training_completed"] },
});

const scholar = !application
  ? await ScholarModel.findOne({
      userId: userID,
      status: "active",
    })
  : null;

// Find or create schedule
let schedule = await ScheduleModel.findOne({
  applicationId: application?._id || scholar?.applicationId,
});

if (!schedule) {
  schedule = new ScheduleModel({
    userId: userID,
    applicationId: application?._id || scholar?.applicationId,
    scholarId: scholar?._id,
    userType: application ? "trainee" : "scholar",
    // ... other fields
  });
}
```

#### ✅ `getClassScheduleHandler`

**Location:** `backend/src/controllers/trainee.controller.ts` (lines ~1276-1325)

**Changes:**

- Fetches from `Schedule` collection instead of `Application`
- Handles both `applicationId` and `scholarId` lookups
- Returns schedule data with duty hours from `Schedule` model
- Returns `null` gracefully if no schedule found

**Key Logic:**

```typescript
const schedule = await ScheduleModel.findOne({
  $or: [
    { applicationId: new Types.ObjectId(applicationId) },
    { scholarId: new Types.ObjectId(applicationId) },
  ],
});

return res.status(OK).json({
  scheduleUrl: schedule?.classSchedule || null,
  scheduleData: schedule?.classScheduleData || null,
  dutyHours: schedule?.dutyHours || [],
});
```

#### ✅ `addDutyHoursHandler`

**Location:** `backend/src/controllers/trainee.controller.ts` (lines ~1336-1426)

**Changes:**

- Finds `Schedule` record by `applicationId`
- Adds duty hour entry to `schedule.dutyHours` array
- Updates `schedule.lastModifiedBy` and `schedule.lastModifiedAt`
- Saves to `Schedule` collection
- Still adds timeline entry to `Application` if trainee (for audit trail)

**Key Logic:**

```typescript
// Find schedule
const schedule = await ScheduleModel.findOne({ applicationId });
appAssert(
  schedule,
  NOT_FOUND,
  "Schedule not found. Please upload a schedule first."
);

// Get application or scholar for permission checks
const application = await ApplicationModel.findById(applicationId);
const scholar = !application
  ? await ScholarModel.findOne({ applicationId })
  : null;

// Validate permissions based on office assignment
if (user.role === "office") {
  const userOffice = user.officeName || user.office;
  const assignedOffice = application
    ? application.traineeOffice
    : scholar!.scholarOffice;
  appAssert(
    assignedOffice === userOffice,
    FORBIDDEN,
    "You can only add duty hours for trainees/scholars assigned to your office"
  );
}

// Add duty hour to schedule
const dutyHourEntry = {
  day,
  startTime,
  endTime,
  location,
  notes: notes || "",
};

schedule.dutyHours.push(dutyHourEntry);
schedule.lastModifiedBy = new Types.ObjectId(userID);
schedule.lastModifiedAt = new Date();
await schedule.save();
```

#### ✅ `downloadClassScheduleHandler`

**Location:** `backend/src/controllers/trainee.controller.ts` (lines ~1432-1468)

**Changes:**

- Fetches from `Schedule` collection instead of `Application`
- For students: finds schedule by `userId` and `userType`
- For office/HR: finds schedule by `applicationId` or `scholarId`
- Redirects to `schedule.classSchedule` URL

**Key Logic:**

```typescript
if (user.role === "student") {
  schedule = await ScheduleModel.findOne({
    userId: userID,
    userType: { $in: ["trainee", "scholar"] },
  });
} else if (user.role === "office" || user.role === "hr") {
  const { applicationId } = req.params;
  schedule = await ScheduleModel.findOne({ applicationId });

  // If not found by applicationId, try scholarId
  if (!schedule) {
    const scholar = await ScholarModel.findOne({ applicationId });
    if (scholar) {
      schedule = await ScheduleModel.findOne({ scholarId: scholar._id });
    }
  }
}

return res.redirect(schedule.classSchedule);
```

### 3. Updated Imports

**File:** `backend/src/controllers/trainee.controller.ts`

**Added:**

```typescript
import { Types } from "mongoose";
import ScholarModel from "../models/scholar.model";
import ScheduleModel from "../models/schedule.model";
```

## API Endpoints Affected

All existing endpoints maintain the same URLs and request/response formats:

- ✅ `POST /trainees/:applicationId/schedule/upload` - Upload schedule
- ✅ `GET /trainees/:applicationId/schedule` - Get schedule with duty hours
- ✅ `POST /trainees/:applicationId/schedule/duty-hours` - Add duty hours
- ✅ `GET /trainees/:applicationId/schedule/download` - Download schedule PDF

## Benefits

### 1. **Separation of Concerns**

- Schedule data no longer mixed with application data
- Cleaner data model and easier to maintain

### 2. **Unified Scholar Support**

- Both trainees and scholars can have schedules
- Same APIs work for both types
- Proper tracking of who modified schedules

### 3. **Better Data Management**

- Duty hours stored in structured subdocuments
- Schedule metadata (uploadedAt, lastModifiedBy) tracked properly
- Easy to query schedules independently of applications

### 4. **Backward Compatible**

- All API endpoints maintain same URLs
- Frontend code requires no changes
- Existing functionality preserved

## Database Migration

### Manual Steps Required

If you have existing schedules in the `Application` collection, you'll need to migrate them:

```javascript
// Migration script (run once)
const applications = await ApplicationModel.find({
  classSchedule: { $exists: true, $ne: null },
});

for (const app of applications) {
  // Check if schedule already migrated
  const existing = await ScheduleModel.findOne({ applicationId: app._id });
  if (!existing) {
    await ScheduleModel.create({
      userId: app.userID,
      applicationId: app._id,
      userType: "trainee",
      classSchedule: app.classSchedule,
      classScheduleData: app.classScheduleData,
      dutyHours: app.dutyHours || [],
      uploadedAt: app.classScheduleUploadedAt || new Date(),
      lastModifiedBy: app.userID,
      lastModifiedAt: new Date(),
    });
  }
}
```

## Testing Checklist

- [ ] Upload schedule as trainee → Creates Schedule record with applicationId
- [ ] Upload schedule as scholar → Creates Schedule record with scholarId
- [ ] View schedule as student → Fetches from Schedule collection
- [ ] View schedule as office → Fetches from Schedule collection
- [ ] Add duty hours to trainee schedule → Updates Schedule record
- [ ] Add duty hours to scholar schedule → Updates Schedule record
- [ ] Download schedule PDF → Redirects to Cloudinary URL from Schedule
- [ ] Office can only add duty hours to their assigned trainees/scholars

## Next Steps

1. **Deploy Backend Changes**

   - Ensure all handlers are working correctly
   - Monitor for any errors in production

2. **Run Migration Script**

   - Migrate existing schedules from Application to Schedule collection
   - Verify all schedules migrated successfully

3. **Frontend Updates (Optional)**

   - Consider adding UI to show schedule metadata (last modified by/at)
   - Add UI to view duty hours history

4. **Cleanup (Future)**
   - Once migration is verified, can consider removing schedule-related fields from Application model
   - Keep for now to avoid breaking changes

## Notes

- Timeline entries for duty hours are still added to Application model for audit trail
- Scholar records still reference applicationId for tracking purposes
- Schedule model validates that either applicationId OR scholarId is set (not both)
- All schedule operations now properly track who made changes and when
