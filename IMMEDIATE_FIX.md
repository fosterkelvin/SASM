# IMMEDIATE FIX - Profile Not Showing

## Current Situation
✅ Backend is deployed (logs show it's running)
✅ You're logged in (User ID is present)
❌ Profile ID is undefined (old session without profileID)

## Fix in 3 Steps (Takes 2 minutes)

### Step 1: Clear Old Sessions (CRITICAL)
Your current session doesn't have `profileID`. Clear all sessions in your production database:

**If using MongoDB Atlas:**
1. Go to https://cloud.mongodb.com
2. Click "Browse Collections"
3. Find `sessions` collection
4. Click "Delete All Documents"
5. Confirm deletion

**If using Render/Railway database console:**
Run this command:
```javascript
db.sessions.deleteMany({})
```

**If you have mongo shell access:**
```bash
mongo YOUR_MONGODB_CONNECTION_STRING
use your_database_name
db.sessions.deleteMany({})
exit
```

### Step 2: Sign Out on Website
1. Go to https://sasm.site
2. Click "Sign out"
3. **Clear browser cookies:**
   - Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
   - Select "Cookies and other site data"
   - Time range: "All time"
   - Click "Clear data"

### Step 3: Sign In and Select Profile Again
1. Go to https://sasm.site/signin
2. Sign in with your credentials
3. You'll be redirected to profile selector
4. Select "SIT" profile (or whichever profile name is "kel")
5. Enter your 4-digit PIN
6. Click to confirm

### Step 4: Verify It Works
After selecting profile, check the sidebar:
- Should show: **"SIT"**
- Should show: **"Profile: kel"** ← This line should appear now!
- Should show: **"Office"**

## Why This Is Necessary

The old sessions in your database were created BEFORE the code was deployed. They don't have the `profileID` field. By clearing sessions and signing in again, you'll get a NEW session that includes `profileID`.

## Quick Database Clear (Choose One Method)

### Method A: MongoDB Compass
1. Open MongoDB Compass
2. Connect to your production database
3. Navigate to `sessions` collection
4. Click the trash icon → "Delete All"

### Method B: Database GUI (Studio 3T, Robo 3T, etc.)
1. Connect to production database
2. Right-click `sessions` collection
3. Select "Delete all documents"

### Method C: Cloud Provider Dashboard
- **MongoDB Atlas:** Database → Browse Collections → sessions → Delete All
- **Render:** Dashboard → Database → Shell → Run command
- **Railway:** Dashboard → Database → Query → Run command

## After Fix Is Complete

The backend logs should then show:
```
Profile ID: 673abc123def456789  ← Should have a value now!
```

And the frontend sidebar will display "Profile: kel" correctly!

---

**Next Step:** Clear the sessions database now, then sign out and sign in again. That's it! 🚀
