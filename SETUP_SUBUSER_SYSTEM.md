# Quick Setup Guide - Office Sub-User System

## Backend Setup

### 1. Install Dependencies
All required dependencies are already in your package.json. No additional installation needed.

### 2. Start the Backend Server
```bash
cd backend
npm run dev
```

The backend will automatically load the new models and routes.

## Frontend Setup

### 1. Add Routes to Your Router

Add these routes to your frontend router configuration:

```typescript
// In your router file (e.g., App.tsx or routes.tsx)
import SubUserManagement from "./pages/Roles/Office/SubUserManagement/SubUserManagement";
import AuditLogs from "./pages/Roles/Office/AuditLogs/AuditLogs";

// Add these routes for OFFICE role
{
  path: "/office/sub-users",
  element: <SubUserManagement />,
},
{
  path: "/office/audit-logs",
  element: <AuditLogs />,
}
```

### 2. Add Navigation Links to Office Sidebar

Find your Office Sidebar component and add these menu items:

```typescript
// In OfficeSidebar component
import { User, FileText } from "lucide-react";

// Add these menu items
{
  label: "Sub-Users",
  icon: <User />,
  path: "/office/sub-users",
},
{
  label: "Audit Logs",
  icon: <FileText />,
  path: "/office/audit-logs",
}
```

### 3. Start the Frontend Server
```bash
cd frontend
npm run dev
```

## Quick Test

### Test 1: Create a Sub-User
1. Log in as an OFFICE user
2. Go to **Sub-User Management**
3. Click **Add Sub-User**
4. Fill in:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
   - Select a few permissions
5. Click **Create Sub-User**

### Test 2: Log in as Sub-User
1. Log out from the main OFFICE account
2. Go to the login page
3. Enter:
   - Email: "test@example.com"
   - Password: "password123"
4. You should be logged in as the sub-user

### Test 3: Perform an Action
1. While logged in as the sub-user, perform any action (e.g., view applications)
2. Log out and log back in as the main OFFICE user
3. Go to **Audit Logs**
4. You should see the sub-user's actions logged

## Integrating Audit Logging into Existing Features

To add audit logging to an existing controller:

```typescript
// Step 1: Import the audit logger
import { createAuditLog } from "../utils/auditLogger";

// Step 2: Import the enhanced middleware
import authenticateWithSubUser from "../middleware/authenticateWithSubUser";

// Step 3: Use the enhanced middleware in your routes
app.use("/your-route", authenticateWithSubUser, yourController);

// Step 4: Add audit logging to your controller actions
export const yourAction = async (req, res) => {
  // Your existing code...

  // Add audit logging
  await createAuditLog({
    userID: req.userID,
    subUserID: req.subUserID || null,
    actorName: req.user.firstname + " " + req.user.lastname,
    actorEmail: req.user.email,
    action: "your_action_name",           // e.g., "application_approved"
    module: "your_module_name",           // e.g., "applications"
    targetType: "YourModel",              // e.g., "Application"
    targetID: someId,                     // ID of the affected entity
    targetName: someName,                 // Name/description of the entity
    details: { key: "value" },           // Any additional details
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  // Your response...
};
```

## Common Actions to Log

Here are suggested action names and modules for logging:

### Applications Module
- `application_viewed`
- `application_status_updated`
- `application_approved`
- `application_rejected`
- `application_deleted`

### Requirements Module
- `requirement_viewed`
- `requirement_verified`
- `requirement_rejected`
- `requirement_deleted`

### DTR Module
- `dtr_viewed`
- `dtr_updated`
- `dtr_approved`

### Leave Requests Module
- `leave_request_viewed`
- `leave_request_approved`
- `leave_request_rejected`

### Scholars Module
- `scholar_viewed`
- `scholar_updated`
- `scholar_deleted`

### Evaluations Module
- `evaluation_viewed`
- `evaluation_submitted`
- `evaluation_updated`

## Environment Variables

No additional environment variables are needed. The system uses your existing MongoDB connection and JWT secrets.

## Database

The system will automatically create two new collections:
- `officesubusers` - Stores sub-user accounts
- `auditlogs` - Stores all action logs

No manual database setup is required.

## Permissions Reference

When creating sub-users, here's what each permission allows:

| Permission | Description |
|------------|-------------|
| viewApplications | Can see the list of applications |
| editApplications | Can update application status, add comments |
| viewRequirements | Can see submitted requirements |
| processRequirements | Can verify/reject requirements |
| viewDTR | Can see DTR records |
| editDTR | Can update DTR entries |
| viewLeaveRequests | Can see leave requests |
| approveLeaveRequests | Can approve/reject leave requests |
| viewScholars | Can see scholar list |
| editScholars | Can update scholar information |
| viewEvaluations | Can see evaluations |
| submitEvaluations | Can submit new evaluations |

## Next Steps

1. **Add Permission Checks**: Go through your existing controllers and add permission checks for sub-users
2. **Add Audit Logging**: Add `createAuditLog()` calls to important actions
3. **Update Middleware**: Replace `authenticate` with `authenticateWithSubUser` in routes that should support sub-users
4. **Test Thoroughly**: Test all features with both main users and sub-users
5. **Train Users**: Show main OFFICE users how to create and manage sub-users

## Need Help?

Refer to the comprehensive documentation in `OFFICE_SUBUSER_SYSTEM.md` for detailed information about:
- Complete API documentation
- Database schema details
- Advanced usage examples
- Troubleshooting guide
- Security considerations

---

Your sub-user system is now ready to use! 🎉
