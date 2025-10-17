# 🎯 LOCALHOST WORKS, PRODUCTION DOESN'T - THE REAL FIX

## Why This Happens

**Localhost:**

- Frontend: http://localhost:5173
- Backend: http://localhost:4004
- **SAME DOMAIN** → Cookies work automatically ✅

**Production:**

- Frontend: https://sasm.site (Vercel)
- Backend: https://your-backend.onrender.com (Render)
- **DIFFERENT DOMAINS** → Browsers block cookies by default ❌

## The Complete Fix (Do Every Step)

### PART 1: Backend Configuration (Render)

#### Step 1: Set Render Environment Variables

1. Go to https://dashboard.render.com
2. Click on your backend service (the API)
3. Click **"Environment"** on the left
4. Add or update these variables:

| Key          | Value                                     |
| ------------ | ----------------------------------------- |
| `APP_ORIGIN` | `https://sasm.site,https://www.sasm.site` |
| `NODE_ENV`   | `production`                              |

**CRITICAL:**

- Type EXACTLY as shown (case-sensitive!)
- `production` must be lowercase
- No trailing slashes in URLs
- No spaces around commas

5. Click **"Save Changes"**
6. Render will redeploy (wait 3-5 minutes)

#### Step 2: Verify Backend Deployment

After Render redeploys, click **"Logs"** tab and look for:

```
APP_ORIGIN from env: https://sasm.site,https://www.sasm.site
Allowed CORS origins: ['https://sasm.site', 'https://www.sasm.site']
Server listening on port 4004 in production environment.
```

If you don't see this, the environment variables aren't set correctly.

---

### PART 2: Frontend Configuration (Vercel)

#### Step 3: Set Vercel Environment Variable

1. Go to https://vercel.com/dashboard
2. Click on your project
3. Click **"Settings"**
4. Click **"Environment Variables"** on the left
5. Add or update this variable:

| Key        | Value                                    |
| ---------- | ---------------------------------------- |
| `VITE_API` | `https://your-backend-name.onrender.com` |

**Replace `your-backend-name.onrender.com` with your ACTUAL Render backend URL!**

To find your Render backend URL:

- Go to Render dashboard
- Click your backend service
- Look for the URL at the top (something like `https://sasm-api-xxxx.onrender.com`)

6. Select **"Production"** environment
7. Click **"Save"**

#### Step 4: Redeploy Frontend

1. Go to **"Deployments"** tab
2. Find the latest deployment
3. Click the **"..."** menu
4. Click **"Redeploy"**
5. Wait 2-3 minutes

---

### PART 3: Push Code Changes

#### Step 5: Deploy the Fixes

Open your terminal:

```bash
cd d:\CODE\SASM-1

# Make sure all changes are committed
git add .
git commit -m "Fix: Cross-origin cookies and profile persistence"
git push
```

**Wait 3-5 minutes** for both Render and Vercel to deploy.

---

### PART 4: Clean Slate

#### Step 6: Clear Database Sessions

**You MUST clear old sessions!** They don't have the new structure.

**Option A - MongoDB Atlas Web UI:**

1. Go to https://cloud.mongodb.com
2. Click **"Browse Collections"**
3. Find the `sessions` collection
4. Click the **trash icon** at the top
5. Click **"Delete All Documents"**
6. Confirm

**Option B - MongoDB Shell/Compass:**

```javascript
db.sessions.deleteMany({});
```

**Option C - If you have mongo CLI:**

```bash
mongo "your-mongodb-connection-string"
use your-database-name
db.sessions.deleteMany({})
exit
```

#### Step 7: Clear Browser Completely

1. **Close ALL tabs** of sasm.site
2. **Clear browser data:**
   - Windows: Press `Ctrl + Shift + Delete`
   - Mac: Press `Cmd + Shift + Delete`
3. Select **"All time"**
4. Check **"Cookies and other site data"**
5. Check **"Cached images and files"**
6. Click **"Clear data"**

---

### PART 5: Fresh Test

#### Step 8: Test in Incognito/Private Window

1. **Open a NEW incognito/private window**

   - Chrome: `Ctrl + Shift + N`
   - Firefox: `Ctrl + Shift + P`
   - Edge: `Ctrl + Shift + N`

2. **Go to** https://sasm.site

3. **Sign in** with your credentials

4. **YOU WILL BE REDIRECTED TO PROFILE SELECTOR**

   - This is normal!
   - This is where you select your profile

5. **Click on your profile** (the one with name "kel")

6. **Enter your 4-digit PIN**

7. **You should be redirected to the dashboard**

8. **Check the sidebar** - Should now show:
   ```
   SIT
   Profile: kel  ← This line!
   Office
   ```

---

## 🔍 Verify It's Working

### Test 1: Check Cookies

1. Press `F12` (open DevTools)
2. Go to **Application** tab
3. Click **Cookies** → https://sasm.site
4. You should see:
   - `accessToken` (with a long value)
   - `refreshToken` (with a long value)

**If you DON'T see cookies:**

- Environment variables not set correctly
- Go back to Step 1

### Test 2: Check API Response

In browser console (F12 → Console), paste:

```javascript
fetch(import.meta.env.VITE_API + "/user", { credentials: "include" })
  .then((r) => r.json())
  .then((data) => {
    console.log("✅ User Data:", data);
    console.log("Profile Name:", data.profileName);
    console.log("Profile ID:", data.profileID);

    if (data.profileName) {
      console.log("🎉 SUCCESS! Profile is showing!");
    } else {
      console.log("❌ PROBLEM: profileName is missing");
      console.log("Did you SELECT your profile after sign in?");
    }
  })
  .catch((err) => console.error("❌ Error:", err));
```

**Expected output:**

```
✅ User Data: { ..., profileName: "kel", profileID: "..." }
Profile Name: kel
Profile ID: 673abc123...
🎉 SUCCESS! Profile is showing!
```

---

## 📋 Complete Checklist

Go through this checklist IN ORDER:

- [ ] **Step 1:** Set Render environment variables (`APP_ORIGIN`, `NODE_ENV`)
- [ ] **Step 2:** Verify Render logs show correct CORS origins
- [ ] **Step 3:** Set Vercel environment variable (`VITE_API`)
- [ ] **Step 4:** Redeploy frontend on Vercel
- [ ] **Step 5:** Push code changes (`git push`)
- [ ] **Step 6:** Clear database sessions (`db.sessions.deleteMany({})`)
- [ ] **Step 7:** Clear browser cookies and cache
- [ ] **Step 8:** Test in incognito window
  - [ ] Sign in
  - [ ] Select profile with PIN
  - [ ] Check sidebar shows "Profile: kel"

---

## 🚨 Common Mistakes

### Mistake 1: Wrong APP_ORIGIN format

❌ Wrong: `APP_ORIGIN=https://sasm.site/` (has trailing slash)
❌ Wrong: `APP_ORIGIN= https://sasm.site` (has space)
❌ Wrong: `APP_ORIGIN="https://sasm.site"` (has quotes)
✅ Correct: `APP_ORIGIN=https://sasm.site,https://www.sasm.site`

### Mistake 2: Wrong NODE_ENV

❌ Wrong: `NODE_ENV=Production` (capital P)
❌ Wrong: `NODE_ENV=PRODUCTION` (all caps)
✅ Correct: `NODE_ENV=production` (lowercase)

### Mistake 3: Wrong VITE_API

❌ Wrong: `VITE_API=http://localhost:4004` (localhost)
❌ Wrong: `VITE_API=https://sasm.site` (frontend URL)
✅ Correct: `VITE_API=https://your-backend.onrender.com` (backend URL)

### Mistake 4: Not clearing sessions

Even with correct code, old sessions won't have `profileID`. You MUST clear them!

### Mistake 5: Not selecting profile again

After clearing sessions, you MUST go through profile selection again!

---

## 🆘 Still Not Working?

### Check Render Logs

Go to Render → Your Service → Logs

**Look for:**

```
=== AUTHENTICATE DEBUG ===
Token payload: { userID: "...", profileID: "..." }
Session profileID: 673abc123...
Request profileID set to: 673abc123...
```

**If you see `profileID: undefined`:**

- You haven't selected your profile after clearing sessions
- Go to https://sasm.site/profile-selector manually
- Select profile with PIN

### Check Browser Console

**If you see CORS errors:**

```
Access to fetch at 'https://...' from origin 'https://sasm.site' has been blocked by CORS
```

- APP_ORIGIN not set correctly on Render
- Go back to Step 1

**If you see Network errors:**

```
Failed to fetch
```

- VITE_API not set correctly on Vercel
- Go back to Step 3

### Check Environment Variables Again

**On Render (Backend):**

```
APP_ORIGIN = https://sasm.site,https://www.sasm.site
NODE_ENV = production
```

**On Vercel (Frontend):**

```
VITE_API = https://your-actual-backend.onrender.com
```

Make sure there are NO typos!

---

## 📞 Need More Help?

If you've followed ALL steps and it still doesn't work, check:

1. Render backend logs (last 50 lines)
2. Browser console errors
3. Browser DevTools → Network tab → Look at /user request

Send me screenshots of these and I can help you debug further!

---

## ⏱️ Total Time Required

- Configuration: 5 minutes
- Deployment wait: 5 minutes
- Testing: 2 minutes
- **Total: ~12 minutes**

---

## 🎯 Key Takeaway

The main difference between localhost and production:

**Localhost:** Same domain → Cookies work automatically
**Production:** Different domains → Need explicit CORS + cookie config

Once you set the environment variables correctly and clear old sessions, it WILL work! 🚀
