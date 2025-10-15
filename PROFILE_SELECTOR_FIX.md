# Profile Selector Redirect Fix

## Problem
When OFFICE users logged in, they were redirected directly to `/office-dashboard` instead of the Netflix-style `/profile-selector` page.

## Root Cause
The frontend had duplicate redirect logic that was overriding the backend's correct redirect URL:

1. **Backend** ([backend/src/utils/roleRedirect.ts](backend/src/utils/roleRedirect.ts)) - ✅ CORRECT
   - Correctly sends main OFFICE users to `/profile-selector`
   - Correctly sends sub-users to `/office-dashboard`

2. **Frontend** ([frontend/src/lib/roleUtils.ts](frontend/src/lib/roleUtils.ts)) - ❌ OUTDATED
   - Had hardcoded logic: ALL office users → `/office-dashboard`
   - Used as fallback in [AuthContext.tsx:89-91](frontend/src/context/AuthContext.tsx#L89-91)

## Solution

### 1. Updated `frontend/src/lib/roleUtils.ts`
```typescript
export const getRoleBasedRedirect = (role: string, isSubUser?: boolean): string => {
  switch (role) {
    case "office":
      // If it's a sub-user, go directly to dashboard
      // If it's main user login, go to profile selector
      return isSubUser ? "/office-dashboard" : "/profile-selector";
    // ... other cases
  }
};
```

### 2. Updated `frontend/src/context/AuthContext.tsx`
```typescript
const redirectUrl =
  signinResponse?.redirectUrl ||
  getRoleBasedRedirect(fetchedUser?.data?.role || "", fetchedUser?.data?.isSubUser);
```

### 3. Added Profile Routes to Access Control
Updated `hasRouteAccess` in `roleUtils.ts` to include:
- `/profile-selector`
- `/office/sub-users`
- `/office/audit-logs`

## Testing

### Test Case 1: Main OFFICE User Login
1. Go to `/signin`
2. Login with OFFICE account (main user)
3. **Expected**: Redirected to `/profile-selector` (Netflix-style "Who's using SASM?" page)
4. **Result**: ✅ Should work now

### Test Case 2: Sub-User Login
1. Go to `/signin`
2. Login with sub-user credentials
3. **Expected**: Redirected directly to `/office-dashboard`
4. **Result**: ✅ Should work now

### Test Case 3: Profile Switching
1. Login as main OFFICE user
2. See profile selector with main user + sub-users
3. Click on a profile
4. **Expected**: Redirected to `/office-dashboard` with that profile's context
5. **Result**: ✅ Should work

## Files Modified
- ✅ `frontend/src/lib/roleUtils.ts` - Fixed redirect logic
- ✅ `frontend/src/context/AuthContext.tsx` - Pass isSubUser to fallback
- ✅ `frontend/tsconfig.app.json` - Removed invalid ignoreDeprecations

## Next Steps
1. Clear browser cache and cookies
2. Restart browser if needed
3. Test login with OFFICE account
4. You should now see the Netflix-style profile selector!
