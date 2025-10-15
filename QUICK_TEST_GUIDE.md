# Quick Test Guide - Netflix-Style Profile Selector

## ✅ Routes Added Successfully!

The following routes have been added to your App.tsx:
- `/profile-selector` - Netflix-style profile selection screen
- `/office/sub-users` - Sub-user management page
- `/office/audit-logs` - Audit logs viewer

## 🧪 Testing Instructions

### Step 1: Start Your Frontend

```bash
cd frontend
npm run dev
```

### Step 2: Test Main User Login

1. **Go to**: http://localhost:5173/signin
2. **Log in** with your OFFICE user credentials
3. **Expected Result**: You should be redirected to `/profile-selector`
4. **You should see**: "Who's using SASM?" with profile cards

### Step 3: What You'll See

```
┌──────────────────────────────────────────────────┐
│             SASM Logo              Logout        │
│                                                   │
│           Who's using SASM?                      │
│                                                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │    M    │  │    +    │  │         │         │
│  │  Main   │  │ Manage  │  │         │         │
│  │ Account │  │ Profiles│  │         │         │
│  └─────────┘  └─────────┘  └─────────┘         │
│                                                   │
│  Main Account will be RED                        │
│  Sub-Users will be BLUE (if you create them)    │
│  Manage Profiles will be dashed border with +   │
└──────────────────────────────────────────────────┘
```

### Step 4: Create Your First Sub-User

1. **On Profile Selector**: Click "Manage Profiles" (the card with +)
2. **You'll be redirected to**: `/office/sub-users`
3. **Click**: "Add Sub-User" button
4. **Fill in the form**:
   - Full Name: Test User
   - Email: test@example.com
   - Password: password123
   - Select some permissions (check a few boxes)
5. **Click**: "Create Sub-User"
6. **Navigate back** to profile selector (or logout and login again)

### Step 5: See Your Sub-User Profile

1. **After creating sub-user**: Go back to `/profile-selector`
2. **You should now see**:
   - Main Account (RED card)
   - Test User (BLUE card)
   - Manage Profiles (+)

### Step 6: Switch Profiles

1. **Click on "Test User"** profile
2. **System will**: Switch you to that sub-user
3. **You'll be redirected to**: `/office-dashboard`
4. **You're now**: Logged in as the sub-user with limited permissions

### Step 7: Test Sub-User Direct Login

1. **Logout**
2. **Log in with**: test@example.com / password123
3. **Expected**: Direct redirect to `/office-dashboard` (NO profile selector)
4. **This is correct!** Sub-users skip the selector

## 🐛 Troubleshooting

### Issue 1: Profile Selector Not Showing

**Symptoms**: Login successful but redirected to dashboard instead of profile selector

**Possible Causes**:
1. Backend not sending correct redirectUrl
2. Frontend not respecting the redirectUrl

**Solution**: Check browser console for errors and network tab for the signin response

**Debug Steps**:
```javascript
// Check the signin response in browser DevTools > Network tab
// Look for the signin request
// Response should contain:
{
  "redirectUrl": "/profile-selector"  // This should be present for main OFFICE users
}
```

### Issue 2: "Component not found" Error

**Symptoms**: Error about ProfileSelector component not found

**Cause**: Import path issue

**Solution**: Verify the file exists at:
```
frontend/src/pages/Auth/ProfileSelector/ProfileSelector.tsx
```

### Issue 3: Blank Screen

**Symptoms**: Profile selector shows blank screen

**Possible Causes**:
1. API endpoint not responding
2. User data not loading

**Solution**: Check browser console and network tab

**Debug Steps**:
```javascript
// Open DevTools > Console
// You should see a request to: GET /profiles
// Response should contain mainUser and subUsers
```

### Issue 4: Manage Profiles Not Working

**Symptoms**: Clicking "Manage Profiles" does nothing or errors

**Cause**: Navigation or route issue

**Solution**: Check that `/office/sub-users` route exists and is accessible

## 📋 Expected API Calls

When you visit the profile selector, you should see these API calls in DevTools > Network:

1. **GET /profiles**
   - Status: 200
   - Response: `{ mainUser: {...}, subUsers: [...] }`

2. **POST /profiles/switch** (when you click a profile)
   - Status: 200
   - Request: `{ profileID: "..." }` or empty for main user
   - Response: `{ user: {...}, redirectUrl: "/office-dashboard" }`

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ Main OFFICE user login → Profile selector appears
2. ✅ Profile selector shows "Who's using SASM?"
3. ✅ Main account card is visible (RED)
4. ✅ Manage Profiles option is visible
5. ✅ Can create sub-users
6. ✅ New sub-users appear on profile selector
7. ✅ Can switch between profiles
8. ✅ Sub-user direct login skips selector

## 🎨 Visual Checklist

Profile Selector Should Have:
- [x] Dark gradient background (gray-900 to black)
- [x] "Who's using SASM?" heading (large, white, centered)
- [x] Profile cards in a grid layout
- [x] Main account card (RED gradient)
- [x] Sub-user cards (BLUE gradient, if any exist)
- [x] Manage Profiles card (dashed border, + icon)
- [x] Logout button (top right)
- [x] UB Logo (top left)
- [x] Info section at bottom (about sub-users)
- [x] Hover effects on cards (scale + glow)
- [x] Loading spinner when selecting

## 🔍 Backend Verification

Check backend logs for these messages when testing:

```bash
# When you visit profile selector
GET /profiles 200

# When you switch profiles
POST /profiles/switch 200

# When you create a sub-user
POST /office/sub-users 201
```

## 📞 Still Having Issues?

### Quick Checklist:
1. ✅ Backend server running on port 4004?
2. ✅ Frontend running on port 5173?
3. ✅ Routes added to App.tsx?
4. ✅ ProfileSelector.tsx file exists?
5. ✅ Logged in as OFFICE user (not student/hr)?
6. ✅ Browser console shows no errors?
7. ✅ Network tab shows successful API calls?

### Common Mistakes:
- ❌ Testing with HR or Student account (only OFFICE users see selector)
- ❌ Backend not restarted after changes
- ❌ Frontend not restarted after route changes
- ❌ Wrong port (check if frontend is on 5173 or 5174)
- ❌ Browser cache (try hard refresh: Ctrl+Shift+R)

## 🎉 Success!

Once you see the profile selector with your profile cards, you're all set!

Next steps:
1. Create more sub-users with different permissions
2. Test profile switching
3. Check audit logs at `/office/audit-logs`
4. Share credentials with team members

---

**Note**: The profile selector only appears for **MAIN OFFICE users**. Sub-users who log in directly with their credentials will skip the profile selector and go straight to the dashboard.
