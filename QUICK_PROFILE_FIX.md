# ❓ Profile Still Not Showing - Quick Checklist

## Most Likely Cause

You probably haven't **selected the profile again AFTER deploying the code**.

## The Simple Fix (Takes 2 Minutes)

### Step 1: Clear Database Sessions

```javascript
db.sessions.deleteMany({});
```

### Step 2: Clear Browser Everything

1. Close ALL tabs of sasm.site
2. Press `Ctrl + Shift + Delete`
3. Select "All time"
4. Check "Cookies and other site data"
5. Click "Clear data"

### Step 3: Fresh Start

1. Open NEW incognito/private window
2. Go to https://sasm.site
3. **Sign in** with your credentials
4. You should be redirected to **profile selector**
5. **SELECT your profile** (the one named "kel")
6. **Enter your 4-digit PIN**
7. Click to confirm
8. Check sidebar → Should show "Profile: kel" ✅

## Did You Do Step 3?

**IMPORTANT:** You MUST select your profile again after clearing sessions!

The code creates a new session with `profileID` only when you **select a profile**. If you just sign in, you'll have a session without `profileID`.

## Quick Test

Run this in browser console on https://sasm.site:

```javascript
fetch(import.meta.env.VITE_API + "/user", { credentials: "include" })
  .then((r) => r.json())
  .then((d) => {
    if (d.profileName) {
      console.log("✅ Working! Profile:", d.profileName);
    } else {
      console.log("❌ Missing! Did you SELECT profile after sign in?");
    }
  });
```

## Other Possible Issues

### Issue 1: You didn't push the debug code

**Solution:**

```bash
cd d:\CODE\SASM-1
git add .
git commit -m "Debug: Add logging"
git push
```

Wait 3-5 minutes for Render to deploy.

### Issue 2: Old sessions still in database

**Check:**

```javascript
db.sessions.find().pretty();
```

If you see sessions without `profileID` field, delete them:

```javascript
db.sessions.deleteMany({});
```

### Issue 3: Environment variables not set

**Render (backend):**

```
APP_ORIGIN = https://sasm.site,https://www.sasm.site
NODE_ENV = production
```

**Vercel (frontend):**

```
VITE_API = https://your-backend.onrender.com
```

### Issue 4: Not using the profile selector

After sign in, you MUST go through profile selection:

1. Sign in → Redirected to profile selector
2. Click on your profile (the one named "kel")
3. Enter PIN
4. Confirm

If you skip this, you won't have a `profileID` in your session!

## Check Backend Logs

After deploying debug code, check Render logs for:

```
=== AUTHENTICATE DEBUG ===
Token payload: { userID: "...", sessionID: "...", profileID: "..." }
Session profileID: <should have value>
```

If `profileID` is undefined, you need to select profile again.

## TL;DR

1. ☐ Clear database: `db.sessions.deleteMany({})`
2. ☐ Clear browser cookies
3. ☐ Sign in to sasm.site
4. ☐ **SELECT PROFILE with PIN** ← **MOST IMPORTANT!**
5. ☐ Check sidebar for "Profile: kel"

**The profile selection step is REQUIRED!** Don't skip it! 🎯
