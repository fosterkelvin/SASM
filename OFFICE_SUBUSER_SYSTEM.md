# Office Sub-User Management System (Netflix-Style)

## Overview

This system implements a Netflix-style sub-user management feature for OFFICE users in the SASM (Student Assistant and Student Marshal Information Management System). It allows a main OFFICE user to create multiple sub-users with different permissions, and all actions performed by sub-users are tracked in a comprehensive audit log system.

## Features

### 1. **Sub-User Management**
- Main OFFICE users can create multiple sub-user accounts
- Each sub-user has:
  - Unique email address for login
  - Individual password
  - Custom display name
  - Granular permissions
  - Active/Inactive status
- Sub-users can be edited, deactivated, or deleted

### 2. **Granular Permissions**
Sub-users can be assigned specific permissions for different modules:
- **Applications**: View, Edit
- **Requirements**: View, Process
- **DTR**: View, Edit
- **Leave Requests**: View, Approve
- **Scholars**: View, Edit
- **Evaluations**: View, Submit

### 3. **Audit Trail System**
- Every action performed by a sub-user is logged
- Audit logs include:
  - Actor (who performed the action)
  - Action type (create, update, delete, approve, etc.)
  - Module (which part of the system)
  - Target (what was affected)
  - Timestamp
  - Old and new values (for updates)
  - IP address and user agent
- Audit logs can be filtered by:
  - Sub-user
  - Module
  - Action type
  - Date range
- Export audit logs to CSV for reporting

### 4. **Enhanced Authentication**
- Sub-users log in using their unique email and password
- System automatically detects if login is for a main user or sub-user
- Sub-user sessions are tracked separately
- Last login time is recorded for each sub-user

## Database Schema

### OfficeSubUser Model
```typescript
{
  mainUserID: ObjectId,        // Reference to main OFFICE user
  subUserName: string,          // Display name
  subUserEmail: string,         // Unique email (for login)
  password: string,             // Hashed password
  role: "office",               // Always office
  isActive: boolean,            // Can be enabled/disabled
  permissions: {
    viewApplications: boolean,
    editApplications: boolean,
    viewRequirements: boolean,
    processRequirements: boolean,
    viewDTR: boolean,
    editDTR: boolean,
    viewLeaveRequests: boolean,
    approveLeaveRequests: boolean,
    viewScholars: boolean,
    editScholars: boolean,
    viewEvaluations: boolean,
    submitEvaluations: boolean,
  },
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### AuditLog Model
```typescript
{
  userID: ObjectId,             // Main user ID
  subUserID: ObjectId,          // Sub-user ID (if applicable)
  actorName: string,            // Display name of actor
  actorEmail: string,           // Email of actor
  action: string,               // Action performed
  module: string,               // Module where action occurred
  targetType: string,           // Type of target entity
  targetID: ObjectId,           // ID of affected entity
  targetName: string,           // Name of affected entity
  details: Object,              // Additional details
  oldValue: any,                // Previous value (for updates)
  newValue: any,                // New value (for updates)
  ipAddress: string,            // IP address
  userAgent: string,            // Browser/device info
  timestamp: Date,
  createdAt: Date
}
```

## API Endpoints

### Sub-User Management
- `POST /office/sub-users` - Create a new sub-user
- `GET /office/sub-users` - Get all sub-users for the main user
- `PUT /office/sub-users/:subUserID` - Update a sub-user
- `DELETE /office/sub-users/:subUserID` - Delete a sub-user
- `POST /office/sub-users/:subUserID/change-password` - Change sub-user password

### Audit Logs
- `GET /office/sub-users/audit-logs` - Get audit logs with filters

## Frontend Pages

### 1. Sub-User Management (`/office/sub-users`)
- List all sub-users
- Create new sub-user
- Edit sub-user details and permissions
- Change sub-user password
- Delete sub-user
- View sub-user activity (last login)

### 2. Audit Logs (`/office/audit-logs`)
- View all audit logs
- Filter by:
  - Sub-user
  - Module
  - Action type
  - Date range
- Export logs to CSV
- View detailed log information

## Usage Guide

### For Main OFFICE Users

#### Creating a Sub-User
1. Navigate to **Sub-User Management** from the sidebar
2. Click **Add Sub-User** button
3. Fill in the form:
   - Full Name (e.g., "John Doe")
   - Email (unique email for login)
   - Password (minimum 6 characters)
   - Select permissions
4. Click **Create Sub-User**

#### Managing Sub-Users
- **Edit**: Click the edit (pencil) icon to update details or permissions
- **Change Password**: Click the key icon to change the sub-user's password
- **Delete**: Click the trash icon to permanently delete a sub-user
- **Deactivate**: Edit the sub-user and uncheck "Active" to disable login

#### Viewing Audit Logs
1. Navigate to **Audit Logs** from the sidebar
2. Use filters to find specific actions:
   - Select a sub-user to see their actions
   - Select a module to see actions in that area
   - Set date range for specific time periods
3. Export logs to CSV for reporting or compliance

### For Sub-Users

#### Logging In
1. Go to the login page
2. Enter your unique email (provided by main user)
3. Enter your password
4. You'll be logged in with your assigned permissions

#### Using the System
- You can only access features you have permissions for
- All your actions are automatically logged
- Your display name will appear on all audit logs

## Integration with Existing System

### How Audit Logging Works

When a sub-user (or main user) performs an action, the system automatically creates an audit log entry. Here's how to integrate audit logging into your controllers:

```typescript
import { createAuditLog } from "../utils/auditLogger";

// Example: Logging an application status change
export const updateApplicationStatus = async (req, res) => {
  const application = await ApplicationModel.findById(req.params.id);
  const oldStatus = application.status;
  application.status = req.body.status;
  await application.save();

  // Create audit log
  await createAuditLog({
    userID: req.userID,                    // Main user ID
    subUserID: req.subUserID || null,      // Sub-user ID (if sub-user action)
    actorName: req.user.firstname + " " + req.user.lastname,
    actorEmail: req.user.email,
    action: "application_status_updated",
    module: "applications",
    targetType: "Application",
    targetID: application._id,
    targetName: `${application.firstName} ${application.lastName}`,
    oldValue: oldStatus,
    newValue: req.body.status,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  return res.json({ message: "Status updated" });
};
```

### Adding Sub-User Support to Existing Routes

Replace the standard `authenticate` middleware with `authenticateWithSubUser`:

```typescript
// Before
import authenticate from "./middleware/authenticate";
app.use("/applications", authenticate, applicationRoutes);

// After
import authenticateWithSubUser from "./middleware/authenticateWithSubUser";
app.use("/applications", authenticateWithSubUser, applicationRoutes);
```

This middleware automatically:
- Detects if the user is a main user or sub-user
- Populates `req.user`, `req.subUser`, `req.isSubUser`, and `req.subUserID`
- Validates sub-user is active
- Loads main user information for sub-users

### Checking Permissions

In your controllers, check if a sub-user has permission:

```typescript
export const updateApplication = async (req, res) => {
  // Check if sub-user has edit permission
  if (req.isSubUser && !req.subUser.permissions.editApplications) {
    return res.status(403).json({
      message: "You don't have permission to edit applications",
    });
  }

  // Proceed with update...
};
```

## Security Considerations

1. **Password Security**: All passwords are hashed using bcrypt
2. **Session Management**: Each sub-user has separate sessions
3. **Permission Checks**: All operations should verify permissions
4. **Audit Trail**: All actions are logged for accountability
5. **Account Disabling**: Main users can instantly disable sub-user accounts

## Future Enhancements

Potential improvements for the sub-user system:
1. **Email Notifications**: Notify sub-users when their account is created or modified
2. **Two-Factor Authentication**: Add 2FA for sub-user logins
3. **Role Templates**: Pre-defined permission sets (e.g., "Viewer", "Editor", "Admin")
4. **Activity Dashboard**: Visual analytics of sub-user activity
5. **Bulk Operations**: Create/update multiple sub-users at once
6. **Permission Groups**: Group permissions for easier management
7. **Self-Service Password Reset**: Allow sub-users to reset their own passwords
8. **Login History**: Track all login attempts and sessions
9. **Scheduled Reports**: Automatic audit log reports via email

## Testing Checklist

- [ ] Create a sub-user with various permissions
- [ ] Log in as a sub-user
- [ ] Verify permissions are enforced correctly
- [ ] Perform actions and verify audit logs are created
- [ ] Edit sub-user permissions and verify changes take effect
- [ ] Deactivate a sub-user and verify they can't log in
- [ ] Delete a sub-user and verify audit logs are preserved
- [ ] Export audit logs to CSV
- [ ] Test filters on audit log page
- [ ] Change sub-user password
- [ ] Test concurrent logins (main user and sub-user)
- [ ] Verify sub-user can't access features they don't have permission for

## Troubleshooting

### Sub-User Can't Log In
- Verify the sub-user is marked as "Active"
- Check that the email is correct (case-sensitive)
- Ensure the main user account is still active

### Audit Logs Not Appearing
- Verify `createAuditLog()` is being called in controllers
- Check that `authenticateWithSubUser` middleware is being used
- Ensure `req.userID` and `req.subUserID` are being passed correctly

### Permission Errors
- Verify the sub-user has the required permission enabled
- Check that permission checks are implemented in controllers
- Ensure `req.subUser.permissions` is being checked correctly

## Support

For questions or issues with the sub-user system, contact the development team or refer to the main SASM documentation.

---

**Note**: This feature implements a complete multi-user system similar to Netflix profiles, allowing organizations to manage multiple users under a single main OFFICE account with full audit trail capabilities.
