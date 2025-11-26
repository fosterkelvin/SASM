# Service Duration Tracking System

## Overview

This feature tracks the total time a student has served as a scholar (Student Assistant or Student Marshal). The system automatically adds 6 months to a student's service record each time they complete a semester.

## Key Features

### 1. **Automatic Service Duration Calculation**

- When a scholar is deployed, the system records the semester start date
- When HR ends/undeployes a scholar, the system automatically:
  - Adds 6 months to the student's total service duration
  - Records the service period details (start date, end date, scholar type)
  - Updates the display to show years and months in service

### 2. **Service Duration Display**

- Shows in the Personal Info section of the Profile Settings
- Format: "X years and Y months" or "X months" (depending on total)
- Only displayed for students with service time
- Automatically converts months to years (12 months = 1 year)

### 3. **Service Period Tracking**

- Each semester served is recorded with:
  - Start date (when scholar was deployed)
  - End date (when scholar was undeployed/ended)
  - Number of months (default: 6)
  - Scholar type (Student Assistant or Student Marshal)

## Database Schema Updates

### UserData Model

```typescript
{
  serviceMonths: Number, // Total months in service (accumulated)
  servicePeriods: [{
    startDate: Date,
    endDate: Date,
    months: Number,
    scholarType: "student_assistant" | "student_marshal"
  }]
}
```

### Scholar Model

```typescript
{
  semesterStartDate: Date, // When this semester started
  semesterEndDate: Date,   // When this semester ended
  semesterMonths: Number   // Months for this semester (default: 6)
}
```

## How It Works

### When a Scholar is Deployed:

1. A Scholar record is created with `status: "active"`
2. `semesterStartDate` is set to current date
3. `semesterMonths` is set to 6 (default)

### When a Scholar's Semester Ends (Undeploy):

1. Scholar status is changed to `"inactive"`
2. `semesterEndDate` is set to current date
3. Service duration service automatically:
   - Adds 6 months to `serviceMonths` in UserData
   - Creates a new entry in `servicePeriods` array
   - Records all details of the completed semester

### When a Scholar is Reactivated:

1. Scholar status is changed back to `"active"`
2. `semesterStartDate` is reset to current date (new semester)
3. `semesterEndDate` is cleared
4. When this semester ends, another 6 months will be added

## API Endpoints

### Get My Service Duration

```
GET /service-duration/my-service-duration
Response: {
  serviceDuration: {
    years: 1,
    months: 6,
    totalMonths: 18
  }
}
```

### Get Service Duration for User (HR/Office)

```
GET /service-duration/user/:userId
Response: {
  serviceDuration: {
    years: 1,
    months: 6,
    totalMonths: 18
  }
}
```

### Complete Semester Manually (HR Only)

```
POST /service-duration/complete-semester
Body: {
  userId: "user_id",
  scholarId: "scholar_id"
}
Response: {
  message: "Semester completed successfully. +6 months added to service.",
  serviceDuration: { years: 1, months: 6 },
  totalMonths: 18
}
```

## Examples

### Example 1: First Semester

- Student becomes a scholar on Sept 1, 2024
- HR ends the semester on Feb 1, 2025
- Result: Student has **6 months** of service

### Example 2: Second Semester

- Student is reactivated on Sept 1, 2025
- HR ends the semester on Feb 1, 2026
- Result: Student has **1 year** of service (12 months)

### Example 3: Third Semester

- Student is reactivated on Sept 1, 2026
- HR ends the semester on Feb 1, 2027
- Result: Student has **1 year and 6 months** of service (18 months)

### Example 4: Fourth Semester

- Student is reactivated on Sept 1, 2027
- HR ends the semester on Feb 1, 2028
- Result: Student has **2 years** of service (24 months)

## UI Display

The service duration appears in the Profile Settings page under Personal Info:

```
Personal Info
├── Full Name: John Doe
├── Role: Student
├── Gender: Male
├── Birthdate: 9/17/2002
├── Age: 23 years old
├── Civil Status: Single
├── Member Since: November 25, 2025
├── Time in Service: 1 year and 6 months  ← NEW FIELD
└── Status: Student Assistant
```

## Backend Files Modified/Created

### New Files:

- `backend/src/services/serviceDuration.service.ts` - Service layer for duration calculations
- `backend/src/controllers/serviceDuration.controller.ts` - API endpoints
- `backend/src/routes/serviceDuration.routes.ts` - Route definitions

### Modified Files:

- `backend/src/models/userdata.model.ts` - Added service duration fields
- `backend/src/models/scholar.model.ts` - Added semester tracking fields
- `backend/src/controllers/userdata.controller.ts` - Return service duration in responses
- `backend/src/controllers/trainee.controller.ts` - Auto-add service when scholar ends
- `backend/src/index.ts` - Register new routes

## Frontend Files Modified

- `frontend/src/lib/api.ts` - Added API client functions
- `frontend/src/pages/Auth/Profile/components/PersonalInfoCard.tsx` - Display service duration

## Notes

- Service duration is only tracked for students who become scholars
- The default semester duration is 6 months but can be customized in the Scholar model
- Service periods are preserved for historical tracking
- The feature works automatically - no manual intervention needed from HR
- If a scholar is reactivated, a new service period begins
- The calculation happens when HR undeployes/deactivates a scholar

## Future Enhancements

Potential improvements:

1. Allow customization of semester duration (not fixed at 6 months)
2. Add service duration to student dashboard
3. Generate service certificates based on duration
4. Track service across different offices
5. Add service duration filtering/reporting for HR
6. Show service history timeline
