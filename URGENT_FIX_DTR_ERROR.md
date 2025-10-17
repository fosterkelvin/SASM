# URGENT: Fix Student DTR "Failed to fetch" Error

## Problem
Frontend on Vercel is trying to connect to `localhost:4004` which doesn't exist in production.

**Error:** `ERR_BLOCKED_BY_CLIENT` → `Failed to fetch`

## Root Cause
The production environment variable `VITE_API` is not configured in Vercel.

## IMMEDIATE FIX - 2 Steps

### Step 1: Find Your Backend URL

**Where is your backend deployed?**

Option A: **Render** (most common)
- Go to: https://dashboard.render.com
- Find your backend service
- Copy the URL (looks like: `https://sasm-backend-xxxx.onrender.com`)

Option B: **Railway**
- Go to: https://railway.app
- Find your project
- Copy the deployment URL

Option C: **Other** (Heroku, DigitalOcean, etc.)
- Copy your backend's public URL

### Step 2: Add Environment Variable to Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your SASM project

2. **Navigate to Settings**
   - Click **Settings** tab
   - Click **Environment Variables** in the left sidebar

3. **Add the Variable**
   - **Key**: `VITE_API`
   - **Value**: Your backend URL (from Step 1)
   - Example: `https://sasm-backend-xxxx.onrender.com`
   - **Important**: NO trailing slash!

4. **Select Environments**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. **Click "Save"**

6. **Trigger Redeploy**
   - Go to **Deployments** tab
   - Click the ⋮ (three dots) on latest deployment
   - Click **"Redeploy"**
   - ✅ Check "Use existing Build Cache"
   - Click **"Redeploy"**

## How to Verify

### After Redeployment (2-3 minutes):

1. **Open Your Vercel Site**
   - Go to your live URL (e.g., `https://sasm.vercel.app`)

2. **Open Browser Console** (F12)
   - Go to **Console** tab
   - Look for API calls

3. **Check Network Tab**
   - Go to **Network** tab
   - Try to load DTR
   - You should see requests to your backend URL (not localhost)

### Expected Results:
✅ **Before Fix**: `localhost:4004` → `ERR_BLOCKED_BY_CLIENT`  
✅ **After Fix**: `https://your-backend.onrender.com/dtr/get-or-create` → `200 OK`

## Common Mistakes to Avoid

❌ **Wrong:** `http://localhost:4004`  
❌ **Wrong:** `https://your-backend.com/`  (trailing slash)  
❌ **Wrong:** `https://your-frontend.vercel.app`  (frontend URL, not backend!)  
✅ **Correct:** `https://sasm-backend-xxxx.onrender.com`

## If Backend Not Deployed Yet

You need to deploy your backend first! Quick options:

### Option 1: Deploy to Render (Recommended - Free)

1. **Go to Render**: https://dashboard.render.com
2. **New → Web Service**
3. **Connect GitHub** → Select SASM repo
4. **Configure:**
   - Name: `sasm-backend`
   - Environment: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Root Directory: Leave blank
5. **Add Environment Variables:**
   - `MONGO_URI`: Your MongoDB connection string
   - `NODE_ENV`: `production`
   - `APP_ORIGIN`: `https://your-vercel-app.vercel.app`
   - (Add all other env vars from `backend/.env`)
6. **Create Web Service**
7. **Wait 5-10 minutes** for deployment
8. **Copy the URL** (shown at top)

### Option 2: Deploy to Railway

1. **Go to Railway**: https://railway.app
2. **New Project → Deploy from GitHub**
3. Select SASM repo
4. Configure similar to Render above
5. Add environment variables
6. Deploy and copy URL

## After Backend is Deployed

1. ✅ Copy the backend URL
2. ✅ Add `VITE_API` to Vercel environment variables (Step 2 above)
3. ✅ Redeploy Vercel
4. ✅ Test the DTR page

## Verification Checklist

- [ ] Backend is deployed and accessible
- [ ] Backend URL copied (no trailing slash)
- [ ] `VITE_API` added to Vercel environment variables
- [ ] Vercel redeployed
- [ ] Frontend can load DTR without errors
- [ ] Browser console shows requests to backend URL (not localhost)

## Quick Test

After fixing, open browser console on your Vercel site and run:

```javascript
console.log(import.meta.env.VITE_API);
```

Should show your backend URL, NOT localhost!

## Still Having Issues?

Check:
1. ✅ Backend is running (visit backend URL in browser)
2. ✅ CORS configured on backend (`APP_ORIGIN` = your Vercel URL)
3. ✅ MongoDB connection working
4. ✅ No typos in environment variable name (`VITE_API`)
5. ✅ Vercel was redeployed AFTER adding env var

---

**Need Help?** Provide:
- Your backend URL (if deployed)
- Screenshot of Vercel environment variables
- Browser console errors
