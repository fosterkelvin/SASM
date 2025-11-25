# Leave Request Resubmit Feature

## Overview

Added functionality allowing office staff to mark disapproved leave requests as "resubmittable", enabling students to correct and resubmit their requests without creating entirely new applications.

## How It Works

### For Office Staff

1. When reviewing a leave request, office staff can now:

   - **Approve** - Accept the leave request
   - **Disapprove** - Reject the leave request
   - **Set Pending** - Return to pending status

2. When disapproving a request, a new checkbox appears:

   - ☑️ **"Allow student to resubmit this request with corrections"**
   - This gives students the ability to fix issues (e.g., add missing evidence) and resubmit

3. Office staff can add remarks explaining why the request was disapproved and what needs to be corrected

### For Students

1. In "My Leave Applications", disapproved requests will show one of two states:

   - **Resubmit button** (if `allowResubmit` is enabled) - Blue button to edit and resubmit
   - **No action** (if `allowResubmit` is not enabled) - Request is permanently disapproved

2. When clicking "Resubmit":

   - The form scrolls to the top
   - All fields are pre-filled with the previous submission data
   - A blue alert box shows: "Resubmitting Leave Request" with previous remarks
   - Student can make corrections (add proof document, update dates, modify reason, etc.)
   - Submit button changes to "Resubmit Leave Application"

3. Upon successful resubmission:
   - A new leave request is created with status "pending"
   - The old disapproved request is automatically deleted
   - The leave list refreshes to show the new pending request

## Technical Changes

### Backend

- **Model**: Added `allowResubmit` boolean field to Leave schema
- **Controller**: Updated `decideLeave` to handle `allowResubmit` flag
- **Logic**: When status is "disapproved", `allowResubmit` is saved; when "approved", it's set to false

### Frontend

- **Office Modal**: Added checkbox for "Allow Resubmit" (only visible when status is "disapproved")
- **Student List**: Added "Resubmit" button for disapproved requests with `allowResubmit = true`
- **Leave Form**:
  - Accepts `resubmitData` prop to pre-fill form
  - Shows resubmit alert with previous remarks
  - Deletes old request after successful resubmission
  - Changes button text to "Resubmit Leave Application"

## Benefits

1. **Reduces duplicate submissions** - Students update existing requests instead of creating new ones
2. **Clearer communication** - Students see why their request was denied and what to fix
3. **Better workflow** - Office staff can request corrections without losing the original context
4. **Audit trail** - Old request is replaced, keeping records clean

## Use Cases

- Student forgot to attach medical certificate → Office disapproves with resubmit → Student adds certificate and resubmits
- Wrong dates selected → Office disapproves with resubmit → Student corrects dates and resubmits
- Insufficient reason provided → Office disapproves with resubmit → Student provides detailed explanation and resubmits
