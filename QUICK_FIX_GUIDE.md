# Quick Fix Guide: "Profile: kel" Not Showing

## The Problem

The text "Profile: kel" (or your profile name) is not appearing in the sidebar on your deployed site, even though it works on localhost.

## Root Cause

When you select an office profile, the `profileID` needs to be stored in:

1. The session (in database)
2. The JWT access token

When the token refreshes, the old code was losing the `profileID`, so the backend couldn't find which profile you selected.

## The Fix (Step-by-Step)

### Step 1: Deploy Backend Code ⚠️ MOST IMPORTANT

The code changes are already made in your local files. You MUST deploy them:

```bash
# From your backend directory
git add .
git commit -m "Fix: Preserve profileID in session and token refresh"
git push origin main

# Then deploy to your hosting service (Railway, Render, Vercel, etc.)
```

### Step 2: Clear Database Sessions

After backend is deployed, clear all sessions so users get fresh sessions with profileID:

**Option A - Using MongoDB Compass:**

1. Connect to your production database
2. Find the `sessions` collection
3. Click "Delete All"

**Option B - Using Mongo Shell:**

```javascript
db.sessions.deleteMany({});
```

**Option C - Using your hosting dashboard:**
If your host has a database console, run:

```javascript
db.sessions.deleteMany({});
```

### Step 3: Test on Deployed Site

1. Go to https://sasm.site
2. **Sign out** (important!)
3. **Clear browser cookies** (press Ctrl+Shift+Delete, select "Cookies")
4. **Sign in** again
5. **Select your profile** with PIN
6. You should now see "Profile: kel" in the sidebar! ✅

## How to Verify Backend is Deployed

1. Open https://sasm.site in browser
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Type:

```javascript
fetch("YOUR_BACKEND_URL/user", { credentials: "include" })
  .then((r) => r.json())
  .then(console.log);
```

Replace YOUR_BACKEND_URL with your actual backend URL

5. Look at the response - if it has `profileName: "kel"`, backend is working! ✅

## If Still Not Working

Run the debug script:

1. Open `frontend/debug-profile.js`
2. Copy all the code
3. Paste in browser console on deployed site
4. It will tell you exactly what's wrong

## What Changed in the Code

**File: `backend/src/models/session.model.ts`**

- Added `profileID` field to store which profile is selected

**File: `backend/src/services/officeProfile.service.ts`**

- When selecting profile, now saves `profileID` to session

**File: `backend/src/services/auth.service.ts`**

- When refreshing token, includes `profileID` from session

**File: `backend/src/controllers/user.controller.ts`** (already existed)

- When user has `profileID` in token, fetches profile info and includes `profileName` in response

## Expected Result

**Before Fix:**

```
SIT
Office
```

**After Fix:**

```
SIT
Profile: kel  ← This line should appear!
Office
```

---

**Need Help?** Make sure you've completed Step 1 (Deploy Backend) and Step 2 (Clear Sessions) before testing!
