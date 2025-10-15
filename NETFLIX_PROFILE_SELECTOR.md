# Netflix-Style Profile Selector Feature

## Overview

The Netflix-style profile selector provides a seamless, user-friendly way for OFFICE users to choose which profile (main account or sub-user) they want to use after logging in. This mimics the "Who's watching?" screen from Netflix.

## How It Works

### 1. **Login Flow**

```
OFFICE User enters credentials
↓
Authentication successful
↓
Main user logged in
↓
Redirected to /profile-selector
↓
User sees all available profiles
↓
User selects a profile
↓
System creates appropriate session
↓
User redirected to dashboard
```

### 2. **Profile Types**

#### Main User Profile
- **Color**: Red gradient
- **Badge**: "Main Account"
- **Access**: Full admin access
- **Can**: Manage sub-users, view audit logs, all permissions

#### Sub-User Profiles
- **Color**: Blue gradient
- **Badge**: "Sub-User"
- **Access**: Based on assigned permissions
- **Can**: Only perform actions they have permission for

## User Interface

### Profile Selector Screen

```
┌──────────────────────────────────────────────────────────────┐
│                          SASM Logo                     Logout │
│                                                                │
│                   Who's using SASM?                           │
│                                                                │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │    M    │  │    J    │  │    S    │  │    +    │       │
│  │  Main   │  │  John   │  │  Sarah  │  │ Manage  │       │
│  │ Account │  │Sub-User │  │Sub-User │  │ Profiles│       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                                │
│  ┌──────────────────────────────────────────────────┐      │
│  │  About Sub-Users                                  │      │
│  │  Sub-users allow multiple people to access...    │      │
│  └──────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

### Features

1. **Visual Profile Cards**
   - Large avatar with first letter of name
   - Name display
   - Account type badge
   - Last login time (for sub-users)
   - Hover effects
   - Loading indicator when selecting

2. **Manage Profiles Card**
   - Dashed border
   - Plus icon
   - Navigates to sub-user management
   - Automatically switches to main user first

3. **Quick Actions**
   - Logout button (top right)
   - Manage profiles button
   - Direct profile selection

## API Endpoints

### GET /profiles
Get all available profiles for the logged-in OFFICE user.

**Response:**
```json
{
  "mainUser": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "type": "main",
    "avatar": "J"
  },
  "subUsers": [
    {
      "_id": "...",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "type": "sub",
      "avatar": "J",
      "permissions": {...},
      "lastLoginAt": "2025-10-14T08:30:00Z"
    }
  ]
}
```

### POST /profiles/switch
Switch to a specific profile.

**Request Body:**
```json
{
  "profileID": "..." // Optional - omit to switch to main user
}
```

**Response:**
```json
{
  "message": "Profile switched successfully",
  "user": {...},
  "redirectUrl": "/office-dashboard",
  "profileType": "sub"
}
```

## Frontend Implementation

### 1. Profile Selector Page
Location: `frontend/src/pages/Auth/ProfileSelector/ProfileSelector.tsx`

**Features:**
- Fetches available profiles
- Displays profile cards
- Handles profile selection
- Shows loading states
- Responsive design
- Dark theme

### 2. API Integration
Location: `frontend/src/lib/api.ts`

```typescript
// Get available profiles
export const getAvailableProfiles = async () => {
  const response = await API.get("/profiles");
  return response.data;
};

// Switch to a profile
export const switchProfile = async (profileID?: string) => {
  const response = await API.post("/profiles/switch", { profileID });
  return response.data;
};
```

### 3. Routing Setup

Add this route to your router:

```typescript
import ProfileSelector from "./pages/Auth/ProfileSelector/ProfileSelector";

{
  path: "/profile-selector",
  element: <ProfileSelector />,
  // Add authentication guard
}
```

## Backend Implementation

### 1. Profile Switch Service
Location: `backend/src/services/profileSwitch.service.ts`

**Functions:**
- `getAvailableProfiles()` - Retrieves all profiles
- `switchToProfile()` - Switches to selected profile

### 2. Profile Switch Controller
Location: `backend/src/controllers/profileSwitch.controller.ts`

**Endpoints:**
- `getProfilesHandler` - GET /profiles
- `switchProfileHandler` - POST /profiles/switch

### 3. Updated Role Redirect
Location: `backend/src/utils/roleRedirect.ts`

**Logic:**
- Main OFFICE user login → `/profile-selector`
- Sub-user login → `/office-dashboard` (direct)
- Other roles → Their respective dashboards

## User Experience Flow

### Scenario 1: Main User Login
```
1. User enters email/password for main OFFICE account
2. System authenticates
3. User redirected to /profile-selector
4. User sees:
   - Main account profile
   - All active sub-user profiles
   - Manage profiles option
5. User selects a profile
6. System creates session for that profile
7. User redirected to dashboard
```

### Scenario 2: Sub-User Direct Login
```
1. User enters sub-user email/password
2. System authenticates as sub-user
3. User redirected directly to /office-dashboard
4. No profile selector shown (direct access)
```

### Scenario 3: Managing Profiles
```
1. User on profile selector clicks "Manage Profiles"
2. System switches to main user profile
3. User redirected to /office/sub-users
4. User can create/edit/delete sub-users
5. User can return to profile selector
```

## Security Considerations

### 1. Authentication
- Profile selector requires valid login
- Only OFFICE users see profile selector
- Sub-users must be active to appear

### 2. Authorization
- Profile switching validates ownership
- Can only switch to own sub-users
- Main user must exist and be valid

### 3. Session Management
- New session created on profile switch
- Old session invalidated
- JWT tokens updated with profile info

### 4. Audit Logging
- Profile switches are logged
- Includes timestamp and IP address
- Tracks which profile was selected

## Customization

### Profile Avatars
Current: First letter of name
Possible: Upload custom profile pictures

```typescript
// In profile card
<div className="bg-gradient-to-br from-red-600 to-red-800">
  {profile.avatar} // Or <img src={profile.avatarUrl} />
</div>
```

### Profile Colors
Customize colors for different profiles:

```typescript
const getProfileColor = (type: string, index: number) => {
  if (type === "main") return "from-red-600 to-red-800";

  const colors = [
    "from-blue-600 to-blue-800",
    "from-green-600 to-green-800",
    "from-purple-600 to-purple-800",
    "from-yellow-600 to-yellow-800",
  ];

  return colors[index % colors.length];
};
```

### Profile Limits
Set maximum number of sub-users:

```typescript
// In sub-user creation service
const MAX_SUB_USERS = 10;
const currentCount = await OfficeSubUserModel.countDocuments({ mainUserID });
appAssert(currentCount < MAX_SUB_USERS, BAD_REQUEST, "Maximum sub-users reached");
```

## Testing

### Test Checklist
- [ ] Main user login redirects to profile selector
- [ ] Sub-user login skips profile selector
- [ ] All active profiles appear on selector
- [ ] Inactive profiles don't appear
- [ ] Profile selection works correctly
- [ ] "Manage Profiles" switches to main user
- [ ] Profile cards show correct information
- [ ] Loading states work properly
- [ ] Responsive design on mobile
- [ ] Dark theme displays correctly

### Test Scenarios

#### Test 1: Profile Selection
```
1. Log in as main OFFICE user
2. Verify redirect to /profile-selector
3. Verify main profile appears
4. Verify sub-users appear
5. Click a sub-user profile
6. Verify redirect to dashboard
7. Verify logged in as that sub-user
```

#### Test 2: Sub-User Direct Login
```
1. Log out
2. Log in with sub-user credentials
3. Verify direct redirect to /office-dashboard
4. Verify no profile selector shown
5. Verify logged in as sub-user
```

#### Test 3: Manage Profiles
```
1. On profile selector
2. Click "Manage Profiles"
3. Verify switch to main user
4. Verify redirect to sub-user management
5. Create a new sub-user
6. Navigate back to profile selector
7. Verify new sub-user appears
```

## Benefits

### For Organizations
✅ **Familiar UX** - Netflix-like interface everyone knows
✅ **Quick Switching** - Change profiles in seconds
✅ **Visual Clarity** - Easy to see who's who
✅ **Professional** - Modern, polished appearance

### For Users
✅ **Easy Selection** - Click and go
✅ **No Confusion** - Clear profile types
✅ **Quick Access** - Manage profiles easily
✅ **Visual Feedback** - Loading states and hover effects

### For Administrators
✅ **Clear Separation** - Main vs sub-users
✅ **Easy Management** - One click to manage
✅ **Audit Trail** - All switches logged
✅ **Flexible** - Easy to customize

## Troubleshooting

### Profile Selector Not Showing
**Cause**: Not an OFFICE user or routing issue
**Solution**: Verify user role is "office" and route is configured

### Sub-Users Not Appearing
**Cause**: Sub-users marked as inactive or don't exist
**Solution**: Check sub-user isActive status in database

### Profile Switch Fails
**Cause**: Invalid profileID or session issue
**Solution**: Check profileID matches existing sub-user

### Redirect Loop
**Cause**: Profile selector redirecting back to itself
**Solution**: Verify role redirect logic is correct

## Future Enhancements

1. **Custom Avatars**
   - Upload profile pictures
   - Choose from avatar library
   - Automatic avatar generation

2. **Profile Settings**
   - Per-profile preferences
   - Custom themes
   - Notification settings

3. **Recent Profiles**
   - Show most used profiles first
   - Quick access to last used
   - Profile usage statistics

4. **Profile Switching History**
   - Track when profiles are switched
   - Show in audit logs
   - Generate reports

5. **Keyboard Navigation**
   - Arrow keys to navigate
   - Enter to select
   - Escape to logout

6. **Profile Descriptions**
   - Add custom descriptions
   - Role indicators
   - Department labels

## Summary

The Netflix-style profile selector provides:

✅ **Intuitive Interface** - Familiar UX pattern
✅ **Quick Profile Switching** - One-click selection
✅ **Visual Clarity** - Clear profile types
✅ **Seamless Integration** - Works with existing auth
✅ **Secure** - Validated profile switching
✅ **Auditable** - All actions logged
✅ **Customizable** - Easy to extend

**Status**: ✅ Fully Implemented and Ready to Use

**Next Steps**: Add the `/profile-selector` route to your frontend router!
