# 🔍 DEBUG GUIDE - Profile Not Showing

## Current Situation

You've deployed the code but the profile is still not showing. Let's systematically debug this.

## Step-by-Step Debugging

### ✅ Step 1: Commit Debug Code (DO THIS NOW)

I've added detailed logging to help us see what's happening:

```bash
cd d:\CODE\SASM-1
git add .
git commit -m "Debug: Add logging to track profile data flow"
git push
```

Wait 3-5 minutes for Render to deploy.

### ✅ Step 2: Check Render Logs

1. Go to https://dashboard.render.com
2. Click your backend service
3. Click "Logs" tab
4. Look for these debug messages after you try to access the site:

**Look for:**

```
=== AUTHENTICATE DEBUG ===
Token payload: { ... }
Session found: true/false
Session profileID: <some value or undefined>
Request profileID set to: <some value or undefined>
```

**Then:**

```
=== GET USER DEBUG ===
User ID: <user id>
User role: office
Profile ID from token: <should have value or undefined>
Session ID: <session id>
```

### ✅ Step 3: Identify The Issue

Based on the logs, identify which scenario you're in:

#### Scenario A: profileID is undefined in token

**Logs show:**

```
Profile ID from token: undefined
```

**Cause:** Old session without profileID OR you haven't selected a profile after deployment

**Solution:**

1. Clear database sessions:
   ```javascript
   db.sessions.deleteMany({});
   ```
2. Sign out completely
3. Clear browser cookies (Ctrl+Shift+Delete)
4. Sign in again
5. **SELECT YOUR PROFILE AGAIN with PIN**

#### Scenario B: profileID exists but profile not found in database

**Logs show:**

```
Profile ID from token: 673abc123...
Fetching profile with ID: 673abc123...
Profile found: NOT FOUND
```

**Cause:** Profile was deleted or ID is incorrect

**Solution:**

1. Go to profile selector page manually: https://sasm.site/profile-selector
2. Select your profile again with PIN
3. This will create a new session with correct profileID

#### Scenario C: Session doesn't have profileID

**Logs show:**

```
Session found: true
Session profileID: undefined
```

**Cause:** Session was created before code deployment

**Solution:**

```javascript
db.sessions.deleteMany({});
```

Then sign in and select profile again.

#### Scenario D: No cookies being sent

**Logs show:**

```
PATH: /user AppError: Not authorized
InvalidAccessToken
```

**Cause:** Cookies not working (CORS/environment variable issue)

**Solution:** See "Cookie Issues" section below.

### ✅ Step 4: Test Profile Selection Flow

After clearing sessions and cookies:

1. **Sign In** to https://sasm.site
2. You should be redirected to profile selector
3. **Select your profile** (the one named "kel")
4. **Enter PIN**
5. You should be redirected to dashboard
6. **Check sidebar** - should show "Profile: kel"

### ✅ Step 5: Verify Backend Environment Variables

Go to Render Dashboard → Your Service → Environment

**Must have:**

```
APP_ORIGIN = https://sasm.site,https://www.sasm.site
NODE_ENV = production
```

**Must NOT have (or leave blank):**

```
COOKIE_DOMAIN = (should be empty or not set)
```

### ✅ Step 6: Verify Frontend Environment Variable

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Must have:**

```
VITE_API = https://your-actual-backend.onrender.com
```

NOT localhost!

### ✅ Step 7: Manual API Test

Open browser console on https://sasm.site and run:

```javascript
// Test 1: Check API URL
console.log("API URL:", import.meta.env.VITE_API);
// Should NOT be localhost!

// Test 2: Check cookies
console.log("Cookies:", document.cookie);
// Should have accessToken and refreshToken

// Test 3: Test user endpoint
fetch(import.meta.env.VITE_API + "/user", {
  credentials: "include",
})
  .then((r) => r.json())
  .then((data) => {
    console.log("User data:", data);
    if (data.profileName) {
      console.log("✅ SUCCESS! profileName:", data.profileName);
    } else {
      console.log("❌ PROBLEM! profileName is missing");
      console.log("profileID:", data.profileID);
    }
  })
  .catch((err) => console.error("❌ API Error:", err));
```

## Cookie Issues Checklist

If you're getting "Not authorized" errors:

### ☐ Check 1: CORS Configuration

Backend logs should show:

```
Allowed CORS origins: ['https://sasm.site', 'https://www.sasm.site']
```

### ☐ Check 2: Cookie Settings

In browser DevTools:

1. F12 → Application tab → Cookies
2. Look at https://sasm.site
3. Should see:
   - `accessToken`
   - `refreshToken`
4. If missing, cookies aren't being set

### ☐ Check 3: Environment Variables

Render must have:

```
NODE_ENV=production  (exact spelling, lowercase)
APP_ORIGIN=https://sasm.site,https://www.sasm.site  (no trailing slashes)
```

Vercel must have:

```
VITE_API=https://your-backend.onrender.com  (your actual backend URL)
```

## Common Issues & Solutions

### Issue: "I selected profile but it's not showing"

**Check:**

1. Did you clear sessions AFTER deploying the code?
2. Did you clear browser cookies?
3. Did you select profile AFTER clearing everything?

**Solution:**

```javascript
// In MongoDB
db.sessions.deleteMany({});
```

Then:

1. Close ALL browser tabs
2. Open incognito window
3. Sign in fresh
4. Select profile
5. Check sidebar

### Issue: "Profile shows on some pages but not others"

**Cause:** Token refresh losing profileID

**Check backend logs for:**

```
=== Token Refresh ===
Including profileID in new token: <should have value>
```

### Issue: "Profile disappeared after 15 minutes"

**Cause:** Token refresh not including profileID

**Solution:** Make sure you deployed ALL the code changes:

- `backend/src/models/session.model.ts` (has profileID field)
- `backend/src/services/officeProfile.service.ts` (stores profileID in session)
- `backend/src/services/auth.service.ts` (includes profileID in token refresh)

## Debug Commands for MongoDB

```javascript
// Check sessions structure
db.sessions.findOne();
// Should show: { userID: ..., profileID: ..., ... }

// Count sessions with profileID
db.sessions.countDocuments({ profileID: { $exists: true } });
// Should be > 0 after you select profile

// Count sessions without profileID (old sessions)
db.sessions.countDocuments({ profileID: { $exists: false } });
// Should be 0 after clearing

// Find your user's session
db.sessions.find({ userID: ObjectId("68f06e1fa78957f9fca6bf4c") });
// Replace with your actual user ID
```

## What To Send Me If Still Not Working

If you've tried everything above and it still doesn't work, send me:

1. **Render backend logs** (last 50 lines after accessing /user endpoint)
2. **Browser console output** from the API test above
3. **Screenshot** of Render environment variables
4. **Screenshot** of Vercel environment variables
5. **MongoDB session document** (run `db.sessions.findOne()`)

## Expected Successful Flow

```
1. User signs in
   → Session created with userID (no profileID yet)
   → Token created with userID (no profileID yet)
   → Redirected to profile selector

2. User selects profile with PIN
   → New session created with userID AND profileID
   → New token created with userID AND profileID
   → Redirected to dashboard

3. User accesses any page
   → Token contains profileID
   → Backend fetches profile info
   → Returns user data WITH profileName
   → Frontend displays "Profile: kel"

4. Token expires (after 15 min)
   → Token refresh called
   → Reads profileID from session
   → New token includes profileID
   → Profile info persists ✅
```

---

## Next Steps

1. ✅ Commit and push the debug code (Step 1)
2. ✅ Wait for deployment
3. ✅ Check Render logs (Step 2)
4. ✅ Identify your scenario (Step 3)
5. ✅ Apply the specific solution
6. ✅ Test profile selection (Step 4)

The debug logs will tell us EXACTLY where the problem is! 🔍
