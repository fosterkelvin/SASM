# Deployment Checklist for Profile Selection Issue

## Backend Deployment Steps

### 1. ✅ Code Changes Applied (Already Done)
- [x] `backend/src/models/session.model.ts` - Added `profileID` field
- [x] `backend/src/services/officeProfile.service.ts` - Store profileID in session
- [x] `backend/src/services/auth.service.ts` - Include profileID in token refresh

### 2. 🔴 **CRITICAL: Deploy Backend Changes**
**You MUST deploy these backend changes for the fix to work!**

```bash
# From backend directory
cd d:\CODE\SASM-1\backend

# If using git for deployment
git add .
git commit -m "Fix: Preserve profileID in session and token refresh"
git push

# Or deploy to your hosting service (Railway, Render, etc.)
```

### 3. 🔴 **CRITICAL: Clear Old Sessions in Database**
After deploying backend, you need to clear old sessions that don't have profileID:

```javascript
// Run this in your MongoDB (using MongoDB Compass, Studio 3T, or mongo shell)
// This removes all sessions - users will need to re-login and re-select profile
db.sessions.deleteMany({});

// OR if you want to only remove sessions without profileID:
db.sessions.deleteMany({ profileID: { $exists: false } });
```

**Why?** Old sessions in the database don't have the `profileID` field, so even with the code fix, old sessions will still fail to show the profile.

## Frontend Deployment Steps

### 4. 🔴 **CRITICAL: Set Production Environment Variable**

#### If deploying to **Vercel**:
1. Go to: https://vercel.com/[your-username]/[your-project]/settings/environment-variables
2. Add environment variable:
   - **Key:** `VITE_API`
   - **Value:** Your backend URL (e.g., `https://api.sasm.site` or `https://sasm-api.railway.app`)
   - **Environment:** Production
3. Click "Save"
4. Redeploy from Vercel dashboard

#### If deploying to **Netlify**:
1. Site settings → Environment variables
2. Add: `VITE_API` = `https://your-backend-url.com`
3. Redeploy

#### If using **Custom Server**:
Edit `frontend/.env.production`:
```bash
VITE_API=https://your-actual-backend-url.com
```

### 5. 🔴 **CRITICAL: Rebuild Frontend**
```bash
cd d:\CODE\SASM-1\frontend
npm run build
# Then deploy the 'dist' folder
```

## Verification Steps

### After Deployment:

1. **Clear Browser Cache & Cookies** for your deployed site
2. **Sign in** to your deployed application
3. **Select a profile** with PIN
4. **Check browser console** for any errors:
   - Press F12 → Console tab
   - Look for any API errors or CORS issues
5. **Verify API URL**:
   - In console, type: `console.log(import.meta.env.VITE_API)`
   - Should show your production backend URL, NOT localhost
6. **Check Network Tab**:
   - F12 → Network tab
   - Look at the `/user` request
   - Response should include `profileName` field

## Debug Tool

Before proceeding, diagnose the issue:

1. Open your deployed site: https://sasm.site
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Copy and paste the contents of `frontend/debug-profile.js`
5. Press Enter
6. Check the output - it will tell you exactly what's wrong

## Common Issues & Solutions

### Issue: "Profile: kel" not showing (profileName missing)
**Cause:** Backend not deployed OR old session still active OR profileID not in session
**Solution:** 
1. **Deploy backend code** (CRITICAL - must be done first!)
2. **Clear all sessions** in database: `db.sessions.deleteMany({})`
3. **Sign out** from deployed site
4. **Clear browser cookies** for sasm.site
5. **Sign in again** and **select profile** with PIN
6. Profile should now show "Profile: kel"

### Issue: CORS errors in console
**Cause:** Backend CORS not configured for frontend domain
**Solution:** Update backend CORS settings to allow your frontend domain

### Issue: API requests going to localhost
**Cause:** Environment variable not set or not rebuilding
**Solution:** 
- Set `VITE_API` in production environment
- Rebuild frontend completely

### Issue: 401 Unauthorized errors
**Cause:** Cookies not being sent cross-domain
**Solution:** 
- Ensure backend and frontend are on same domain or proper CORS setup
- Check `withCredentials: true` in axios config
- Verify cookie `sameSite` settings in backend

## Backend Environment Check

Ensure your backend `.env` has:
```env
# CORS - Must include your frontend domain
APP_ORIGIN=https://sasm.site

# Cookie settings for production
NODE_ENV=production
```

## Expected Result

After completing ALL steps above:
- User selects profile → sees profile name in sidebar ✅
- Profile persists after page refresh ✅
- Profile persists even after 15+ minutes (token refresh) ✅

---

**Current Status:** ⏳ Waiting for deployment
**Next Action:** Deploy backend changes + clear database sessions
