# ✅ SIMPLE FIX CHECKLIST - Do This Now!

## Why Localhost Works But Production Doesn't

**Localhost:** Everything on same domain → cookies work automatically ✅

**Production:** Frontend (Vercel) ≠ Backend (Render) → different domains → cookies blocked by browser ❌

## The Fix (5 Steps - Takes 10 Minutes)

### ✅ Step 1: Configure Render Backend (3 minutes)

1. Go to: https://dashboard.render.com
2. Click your backend service
3. Click "Environment" tab
4. Set these variables:

```
APP_ORIGIN = https://sasm.site,https://www.sasm.site
NODE_ENV = production
```

**IMPORTANT:** 
- Type EXACTLY as shown (case-sensitive!)
- No spaces around the = sign
- No trailing slashes in URLs

5. Click "Save Changes"
6. Wait for backend to redeploy (2-3 minutes)

### ✅ Step 2: Configure Vercel Frontend (2 minutes)

1. Go to: https://vercel.com/dashboard
2. Click your project
3. Click "Settings" → "Environment Variables"
4. Add new variable:

```
VITE_API = https://your-backend-name.onrender.com
```

Replace `your-backend-name` with your actual Render backend URL.

5. Click "Save"
6. Go to "Deployments" tab
7. Click "..." on latest deployment → "Redeploy"

### ✅ Step 3: Deploy Code Changes (1 minute)

```bash
cd d:\CODE\SASM-1

# Commit the cookie fix
git add .
git commit -m "Fix: Cross-origin cookies for Render+Vercel"
git push
```

Both Render and Vercel will auto-deploy.

### ✅ Step 4: Clear Database Sessions (30 seconds)

**Option A - MongoDB Atlas:**
1. Go to https://cloud.mongodb.com
2. Click "Browse Collections"
3. Find `sessions` collection
4. Click trash icon → "Delete All Documents"

**Option B - MongoDB Shell:**
```javascript
db.sessions.deleteMany({})
```

### ✅ Step 5: Test (2 minutes)

1. **Wait 3 minutes** for deployments to finish
2. **Close ALL browser tabs** of sasm.site
3. **Open NEW incognito/private window**
4. Go to: https://sasm.site
5. **Sign in** with your credentials
6. **Select profile** with PIN
7. **Check sidebar** → Should show:
   ```
   SIT
   Profile: kel ← This should appear!
   Office
   ```

## 🔍 If It Still Doesn't Work

### Check Backend Logs (Render)

1. Go to Render dashboard → Your service
2. Click "Logs" tab
3. Look for:

```
APP_ORIGIN from env: https://sasm.site,https://www.sasm.site
Allowed CORS origins: ['https://sasm.site', 'https://www.sasm.site']
Server listening on port 4004 in production environment.
```

**If you see different values:**
- Environment variables not set correctly
- Go back to Step 1

**If you see "CORS blocked origin":**
- Your frontend URL is not in APP_ORIGIN
- Add it and redeploy

### Check Frontend Console

1. Open https://sasm.site
2. Press F12 → Console tab
3. Type:

```javascript
console.log('API:', import.meta.env.VITE_API);
console.log('Cookies:', document.cookie);
```

**Expected:**
- API: `https://your-backend.onrender.com` (NOT localhost!)
- Cookies: Should have `accessToken=...` (NOT empty!)

**If API shows localhost:**
- VITE_API not set in Vercel
- Go back to Step 2

**If Cookies are empty:**
- Backend not setting cookies properly
- Check Render environment variables (Step 1)
- Make sure NODE_ENV=production (exact spelling!)

## 🚨 Common Mistakes

### ❌ WRONG:
```
APP_ORIGIN = https://sasm.site/
NODE_ENV = Production
COOKIE_DOMAIN = sasm.site
```

### ✅ CORRECT:
```
APP_ORIGIN = https://sasm.site,https://www.sasm.site
NODE_ENV = production
COOKIE_DOMAIN = (leave blank/not set)
```

## 🎯 Quick Verification

After completing all steps, run this in browser console on https://sasm.site:

```javascript
fetch(import.meta.env.VITE_API + '/user', { credentials: 'include' })
  .then(r => r.json())
  .then(data => {
    console.log('✅ Success!');
    console.log('profileName:', data.profileName); // Should be "kel"
    console.log('profileID:', data.profileID); // Should have a value
  })
  .catch(err => console.error('❌ Error:', err));
```

**If you see `profileName: "kel"`** → SUCCESS! 🎉

**If you see `profileName: undefined`** → Clear sessions again and re-login

## 📞 Emergency Debug

If nothing works, open `diagnostic.html` in your browser:

1. Copy `frontend/diagnostic.html` to your deployed Vercel site
2. Access it: https://sasm.site/diagnostic.html
3. Click "Run Diagnostics"
4. It will tell you exactly what's wrong

---

## What You Changed

**Files modified:**
- `backend/src/utils/cookies.ts` - Added comments explaining cross-origin setup
- Environment variables on Render - Added APP_ORIGIN and NODE_ENV
- Environment variables on Vercel - Added VITE_API

**Why it works now:**
- Backend explicitly allows frontend domain (CORS)
- Cookies use `sameSite: "none"` + `secure: true` for cross-origin
- Session stores `profileID` (from previous fix)
- Token refresh includes `profileID` (from previous fix)

---

## TL;DR - Just Do This:

1. ☐ Render: Set `APP_ORIGIN=https://sasm.site,https://www.sasm.site` and `NODE_ENV=production`
2. ☐ Vercel: Set `VITE_API=https://your-backend.onrender.com`
3. ☐ Push code: `git push`
4. ☐ Clear DB sessions: `db.sessions.deleteMany({})`
5. ☐ Test in incognito: Sign in → Select profile → Check sidebar

**Should take 10 minutes total. Profile will appear!** 🚀
