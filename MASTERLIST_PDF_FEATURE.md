# Scholar Masterlist PDF Generation Feature

## Overview

A comprehensive feature that generates a downloadable PDF masterlist containing all scholar information with summary statistics.

## Features Implemented

### 1. Backend API Endpoint

**File**: `backend/src/controllers/masterlist.controller.ts`

- Fetches all scholars with complete details
- Aggregates data from multiple collections:
  - Scholar information (scholarModel)
  - User details (userModel)
  - Gender data (userdatas collection)
  - Duty schedules (scheduleModel)
  - DTR hours worked (dtrModel)
  - Evaluation scores (evaluationModel)
- Calculates summary statistics (total, male count, female count)

**Route**: `backend/src/routes/masterlist.route.ts`

- Endpoint: `GET /api/masterlist`
- Authentication required

**Added to**: `backend/src/index.ts`

- Registered route: `/masterlist`

### 2. Frontend PDF Generation

**File**: `frontend/src/utils/pdfGenerator.ts`

- Uses `pdfmake` library for PDF generation
- Professional landscape-oriented PDF layout
- Includes:
  - Header with report title and page numbers
  - Summary statistics section with:
    - Total scholars count
    - Male students count (blue)
    - Female students count (pink)
  - Detailed table with columns:
    - Student Name
    - Email
    - Department
    - Role (SA/SM)
    - Status (Active/On leave/Graduating/Resigned)
    - Duty Schedule
    - Hours Worked
    - Evaluation Score
  - Footer with generation date
  - Alternating row colors for better readability

### 3. Frontend Integration

**File**: `frontend/src/pages/Roles/HR/Scholar Management/ScholarManagement.tsx`

**New Imports**:

- `Download` icon from lucide-react
- `getMasterlistData` API function
- `generateMasterlistPDF` utility function

**New Handler**:

```typescript
handleGenerateMasterlist();
```

- Fetches masterlist data from backend
- Generates and downloads PDF
- Shows success/error alerts

**New UI Component**:

- Green "Generate Masterlist PDF" button with download icon
- Positioned next to "End Semester" button in the header
- Styled to match the existing design

### 4. API Integration

**File**: `frontend/src/lib/api.ts`

- Added `getMasterlistData()` function
- Connects to `/masterlist` endpoint

## Data Included in PDF

### Per Scholar:

1. **Student Name**: Full name (firstname + lastname)
2. **Student Email**: Email address
3. **Assigned Department**: Office/department assignment
4. **Role**: SA (Student Assistant) or SM (Student Marshal)
5. **Status**: Active, Inactive (shown as "Resigned"), Completed (shown as "Graduating")
6. **Duty Schedule**: Days and time slots with locations
7. **Hours Worked**: Total hours from DTR records for current year (in hours)
8. **Evaluation Score**: Average rating from all evaluations (1-5 scale)

### Summary Statistics:

- **Total**: Total number of scholars
- **Male**: Number of male students
- **Female**: Number of female students

## Dependencies Added

- `pdfmake`: PDF generation library
- `@types/pdfmake`: TypeScript definitions

## Usage

1. Navigate to Scholar Management page (HR role)
2. Click the "Generate Masterlist PDF" button in the header
3. PDF will be automatically generated and downloaded
4. Filename format: `Scholar_Masterlist_[Date].pdf`

## Technical Details

### PDF Layout:

- **Page Size**: A4 Landscape
- **Margins**: 30px sides, 80px top, 50px bottom
- **Font**: Roboto (default pdfMake font)
- **Colors**:
  - Headers: Dark gray (#374151)
  - Male count: Blue (#0891b2)
  - Female count: Pink (#ec4899)
  - Total count: Primary blue (#2563eb)

### Backend Performance:

- Aggregates data from 5+ collections
- Calculates hours worked from all DTR records for current year
- Computes average evaluation scores across all criteria
- Returns structured JSON response

## Future Enhancements (Optional)

1. Add filters to generate PDF for specific:
   - Departments
   - Status (active only, etc.)
   - Date ranges
2. Add "On Leave" status detection from leave requests
3. Include additional statistics (by department, by role, etc.)
4. Add charts/graphs to PDF
5. Export to Excel option
6. Email PDF functionality
7. Schedule automatic generation (monthly/semester)

## Files Modified/Created

### Created:

1. `backend/src/controllers/masterlist.controller.ts`
2. `backend/src/routes/masterlist.route.ts`
3. `frontend/src/utils/pdfGenerator.ts`

### Modified:

1. `backend/src/index.ts` - Added route registration
2. `frontend/src/lib/api.ts` - Added API function
3. `frontend/src/pages/Roles/HR/Scholar Management/ScholarManagement.tsx` - Added button and handler
4. `frontend/package.json` - Added pdfmake dependency

## Testing Checklist

- [ ] Backend endpoint returns correct data
- [ ] PDF generates without errors
- [ ] All scholar data displays correctly
- [ ] Summary statistics are accurate
- [ ] PDF downloads with proper filename
- [ ] Works with empty scholar list
- [ ] Works with scholars missing some data (evaluations, DTR, etc.)
- [ ] Authentication required for endpoint
- [ ] Error handling displays proper messages

## Notes

- DTR hours are stored in minutes in the database and converted to hours for display
- Evaluation scores are averaged across all criteria in all evaluations
- Gender is pulled from the userdata collection
- If a scholar has no evaluations, it shows "N/A"
- If a scholar has no schedule, it shows "No schedule assigned"
