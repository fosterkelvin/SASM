# Personal Info Requirement for Application

## Overview

Students are now required to complete their personal information in Profile Settings before they can access the Apply or Re-apply features.

## Required Fields

The following fields must be filled before a student can apply:

1. **Gender** - Must select Male, Female, or Other
2. **Birthdate** - Must provide date of birth (Age must be between 16-24 years old)
3. **Civil Status** - Must select Single, Married, Divorced, or Widowed

> **Note:** Phone Number and Address are optional and not required for application.

## Age Restrictions

Students must meet the following age requirements:

- **Minimum Age:** 16 years old
- **Maximum Age:** 24 years old

If a student enters a birthdate that results in an age outside this range:

- **Under 16:** Shows error "You must be at least 16 years old to apply for this program."
- **Over 24:** Shows error "You must be 24 years old or younger to apply for this program."
- Save button is disabled until a valid birthdate is entered
- Age is calculated in real-time as the user updates the birthdate

## Implementation Details

### 1. Validation Helper (`frontend/src/lib/personalInfoValidator.ts`)

- **`isPersonalInfoComplete()`** - Checks if all required fields are filled
- **`getMissingPersonalInfoFields()`** - Returns list of missing fields

### 2. Student Sidebar Updates

**File:** `frontend/src/components/sidebar/Student/StudentSidebar.tsx`

- Fetches user data to check personal info completeness
- Disables Apply/Re-apply buttons when info is incomplete
- Shows toast notification with missing fields when clicked
- Redirects to Profile Settings page

**File:** `frontend/src/components/sidebar/Student/components/SidebarNav.tsx`

- Added `isPersonalInfoIncomplete` prop
- Visually disables Apply/Re-apply buttons when info is incomplete

### 3. Route Guards

**Apply Page:** `frontend/src/pages/Roles/Student/Apply/Application.tsx`

- Checks personal info on page load
- Redirects to profile if incomplete with error message

**Re-apply Page:** `frontend/src/pages/Roles/Student/ReApply/ReApply.tsx`

- Checks personal info on page load
- Redirects to profile if incomplete with error message

### 4. Profile Settings Enhancement

**File:** `frontend/src/pages/Auth/Profile/components/PersonalInfoCard.tsx`

- Added warning banner for students with incomplete info
- Shows missing fields in the warning
- Visual indicator helps students know what to complete
- Phone Number and Address remain optional fields
- **Age Validation:**
  - Real-time age calculation when birthdate is changed
  - Validates age is between 16-24 years old (for students only)
  - Shows red error message below birthdate field if age is invalid
  - Prevents saving with invalid age (disabled Save button)
  - Age restrictions only apply to students, not HR or Office users

### 5. Dashboard Alert

**File:** `frontend/src/pages/Roles/Student/Student Dashboard/components/PersonalInfoAlert.tsx`

- New component that displays a prominent alert on the dashboard
- Shows when verified students have incomplete personal info
- Lists the missing required fields
- Provides "Complete Profile Now" button for quick access
- Only shows for verified users (email verification alert takes priority)

## User Experience Flow

### When Personal Info is Incomplete:

**On Dashboard:**

1. Student logs in and sees the dashboard
2. If email is not verified, verification alert shows first (priority)
3. Once verified, if personal info is incomplete, a yellow alert banner appears
4. Alert shows: "Complete Your Personal Information" with missing fields listed
5. Student clicks "Complete Profile Now" button
6. Redirected to Profile Settings page

**On Sidebar:**

1. Student clicks "Apply" or "Re-apply" in sidebar
2. Toast notification appears: "Please complete your personal information in Profile Settings before applying. Missing: [list of fields]"
3. User is automatically redirected to Profile Settings page

**In Profile Settings:** 4. Yellow warning banner shows at top of Personal Info card 5. Student clicks "Edit" and fills in missing fields 6. Student clicks "Save" 7. Dashboard alert disappears 8. Student can now access Apply/Re-apply features

### When Personal Info is Complete:

1. Apply/Re-apply buttons work normally
2. No warning banner shown in Profile Settings
3. Full access to application features

## Benefits

- ✅ Ensures data quality and completeness
- ✅ Prevents incomplete applications
- ✅ Better user experience with clear guidance
- ✅ Proactive notification on dashboard
- ✅ Multiple touchpoints (dashboard, sidebar, profile)
- ✅ Consistent data collection across all students
- ✅ Validates fields before allowing application submission
- ✅ Email verification takes priority over personal info alerts
- ✅ Age restriction enforcement (16-24 years old)
- ✅ Real-time validation feedback for birthdate
- ✅ Prevents invalid age data from being saved

## Technical Notes

- Uses React Query for data fetching
- Validation happens both in UI and on navigation
- Toast notifications use existing ToastContext
- Works with existing authentication system
- No backend changes required (uses existing UserData model)
