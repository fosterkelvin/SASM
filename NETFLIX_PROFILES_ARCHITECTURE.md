# Netflix-Style Profile System - Complete Architecture

## Overview

This system implements TRUE Netflix-style profiles where:
- ✅ **No "main" vs "sub" distinction** - Just PROFILES
- ✅ **Must create/select profile before accessing anything**
- ✅ **Account-level login → Profile selection → Dashboard access**
- ✅ **Profiles use 4-digit PINs** (like Netflix)
- ✅ **Full CRUD on profiles** (Create, Edit, Delete, Select)

## Architecture

###1. Database Schema

**OfficeProfile Model** (`backend/src/models/officeProfile.model.ts`)
```
{
  accountID: ObjectId,           // Reference to User account
  profileName: string,            // "John Doe"
  profilePIN: string (hashed),    // 4-digit PIN
  isActive: boolean,
  permissions: {
    viewApplications, editApplications,
    viewRequirements, processRequirements,
    viewDTR, editDTR,
    viewLeaveRequests, approveLeaveRequests,
    viewScholars, editScholars,
    viewEvaluations, submitEvaluations
  },
  avatar?: string,
  lastAccessedAt: Date
}
```

**AuditLog Model** (Updated to use profileID)
```
{
  userID: ObjectId,     // Account ID
  profileID: ObjectId,  // Which profile performed the action
  actorName: string,    // Profile name
  action, module, details, timestamp...
}
```

### 2. Authentication Flow

```
User logs in with account credentials
            ↓
    Account authenticated
            ↓
   Redirect to /profile-selector
            ↓
    User sees all profiles OR
    "Create your first profile" screen
            ↓
    User creates profile (if none) OR
    User selects existing profile + enters PIN
            ↓
    Profile authenticated
            ↓
    Session created with profileID in JWT
            ↓
    Access granted to dashboard
```

### 3. Backend API

**Base URL**: `/office/profiles`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all profiles for account |
| POST | `/` | Create new profile |
| POST | `/select` | Select a profile (with PIN) |
| PATCH | `/:id` | Update profile |
| DELETE | `/:id` | Delete profile |

**Example: Create Profile**
```json
POST /office/profiles
{
  "profileName": "John Doe",
  "profilePIN": "1234",
  "permissions": { ... }
}
```

**Example: Select Profile**
```json
POST /office/profiles/select
{
  "profileID": "507f1f77bcf86cd799439011",
  "profilePIN": "1234"
}

Response:
{
  "profile": {
    "_id": "...",
    "profileName": "John Doe",
    "avatar": "J",
    "permissions": {...}
  },
  "redirectUrl": "/office-dashboard"
}
```

### 4. Key Features

**Profile Limits**
- Maximum 5 profiles per account (configurable)
- Cannot delete last profile (must have at least 1)

**Security**
- PINs are hashed using bcrypt
- Must be exactly 4 digits
- Profile selection validates PIN
- JWT includes `profileID`

**Audit Trail**
- All profile actions logged
- CREATE_PROFILE, SELECT_PROFILE, UPDATE_PROFILE, DELETE_PROFILE
- Tracks which profile made which changes

**Permissions**
- Each profile has granular permissions
- Can customize per profile
- All permissions enabled by default

### 5. Frontend Implementation Plan

**ProfileSelector Component** (To be built)
- Shows all profiles as cards
- "Create Profile" button if none exist
- PIN entry modal on profile click
- Edit/Delete buttons (hover actions)
- Netflix-like grid layout

**CreateProfileModal** (To be built)
- Profile name input
- 4-digit PIN input
- PIN confirmation
- Permission toggles (optional)

**EditProfileModal** (To be built)
- Update name
- Change PIN
- Toggle permissions
- Deactivate profile

### 6. Route Guards

**Protected Routes** (To be implemented)
- Check if `profileID` exists in JWT
- If no profileID → Redirect to `/profile-selector`
- If profile exists → Allow access

## Migration from Old System

**Old System**:
- mainUser + subUsers
- subUsers had email/password
- Direct login with sub-user credentials

**New System**:
- One account + multiple profiles
- Profiles use PINs (no separate emails)
- Account login → Profile selection

**Migration Strategy**:
1. Keep old `officeSubUser` model temporarily
2. Run migration script to convert sub-users → profiles
3. Generate random PINs, send to users
4. After migration complete, remove old code

## Summary

This is a complete refactor to TRUE Netflix-style behavior:

| Feature | Old System | New System |
|---------|------------|------------|
| Profile concept | Main + Sub users | Just Profiles |
| Login method | Email + Password per sub-user | Account login + Profile PIN |
| Access control | isSubUser flag | profileID in JWT |
| First-time flow | Can access without sub-user | MUST create profile first |
| Profile selection | Optional | **REQUIRED** |

✅ Backend complete
⏳ Frontend in progress

## Next Steps

1. Create frontend API functions
2. Build ProfileSelector component
3. Create profile modals (Create/Edit/Delete)
4. Add route guard middleware
5. Test complete flow
6. (Optional) Migration script for existing data
