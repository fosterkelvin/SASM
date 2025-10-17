# FIX: CORS Error - Backend Blocking Vercel Frontend

## ✅ Progress So Far
- Frontend now correctly calls `https://sasm.onrender.com` ✅
- Environment variable is working ✅

## ❌ Current Problem
Backend is blocking requests from Vercel with CORS error:
```
Access to XMLHttpRequest at 'https://sasm.onrender.com/user' 
from origin 'https://sasm-7rcwq8yqo-fosterkelvins-projects.vercel.app' 
has been blocked by CORS policy
```

## 🎯 The Fix: Add Vercel URL to Render Environment Variables

### Step 1: Go to Render Dashboard
1. Open: https://dashboard.render.com
2. Click on your **backend service** (the one running on `sasm.onrender.com`)

### Step 2: Find Your Current APP_ORIGIN
1. Click **Environment** tab (left sidebar)
2. Find the `APP_ORIGIN` variable
3. Note the current value (it might look like: `https://sasm.site,https://www.sasm.site`)

### Step 3: Update APP_ORIGIN
1. Click **Edit** (pencil icon) next to `APP_ORIGIN`
2. Add your Vercel URL to the list (comma-separated)

**Current Vercel URL (from error):**
```
https://sasm-7rcwq8yqo-fosterkelvins-projects.vercel.app
```

**New APP_ORIGIN value should be:**
```
https://sasm.site,https://www.sasm.site,https://sasm-7rcwq8yqo-fosterkelvins-projects.vercel.app
```

**OR if you want to allow ALL Vercel preview deployments:**
```
https://sasm.site,https://www.sasm.site,https://sasm-7rcwq8yqo-fosterkelvins-projects.vercel.app,https://*.vercel.app
```

3. Click **Save Changes**

### Step 4: Wait for Redeploy
- Render will automatically redeploy the backend (2-3 minutes)
- Watch the **Logs** tab to see when it completes

### Step 5: Verify Backend Logs
After redeploy, check logs for:
```
APP_ORIGIN from env: https://sasm.site,https://www.sasm.site,https://sasm-7rcwq8yqo-fosterkelvins-projects.vercel.app
Allowed CORS origins: [
  'https://sasm.site',
  'https://www.sasm.site',
  'https://sasm-7rcwq8yqo-fosterkelvins-projects.vercel.app'
]
```

---

## 🔄 Alternative: Get Your Production Vercel Domain

Instead of using the preview URL (`sasm-7rcwq8yqo-fosterkelvins-projects.vercel.app`), you can:

### Option A: Use Vercel Production Domain
1. Go to Vercel Dashboard → Your Project
2. Click **Settings** → **Domains**
3. Your production domain will be something like:
   - `sasm-fosterkelvins-projects.vercel.app` (default)
   - OR a custom domain if you set one up

Use THIS domain instead of the preview URL!

### Option B: Add Custom Domain (Recommended)
1. Buy a domain (e.g., `sasm-app.com`)
2. Add it in Vercel: Settings → Domains → Add
3. Configure DNS
4. Use your custom domain in APP_ORIGIN

---

## 📋 Quick Summary

**What to do RIGHT NOW:**

### On Render (Backend):
1. Dashboard → Your Service → Environment
2. Edit `APP_ORIGIN`
3. Add: `,https://sasm-7rcwq8yqo-fosterkelvins-projects.vercel.app`
4. Save
5. Wait 2-3 minutes for redeploy

### Expected Result After Fix:
```
✅ Frontend → sasm.onrender.com/user → 200 OK
✅ Frontend → sasm.onrender.com/auth/signin → 200 OK
✅ No more CORS errors
✅ Login works
✅ DTR loads
```

---

## 🧪 How to Test After Fix

1. **Wait for Render redeploy** (check Logs tab)
2. **Hard refresh your Vercel site** (Ctrl+Shift+R)
3. **Open DevTools Console** (F12)
4. **Try to sign in**
5. **Check Network tab**

**Before Fix:**
```
❌ sasm.onrender.com/auth/signin → CORS error
```

**After Fix:**
```
✅ sasm.onrender.com/auth/signin → 200 OK
```

---

## ⚠️ Important Notes

### About Preview URLs
- Vercel creates unique URLs for each deployment
- Format: `https://sasm-RANDOM.vercel.app`
- They change with each deployment!

### Recommendations:
1. **For Development:** Use the PRODUCTION Vercel domain
2. **For Production:** Use a custom domain (more stable)
3. **For Testing:** Allow `https://*.vercel.app` pattern (if Render supports it)

### If Using Wildcard Doesn't Work
You'll need to update `APP_ORIGIN` each time you deploy to Vercel, OR:
- Use Vercel's production domain (doesn't change)
- Set up a custom domain

---

## 📸 What to Look For

### In Render Environment Variables:
```
Key: APP_ORIGIN
Value: https://sasm.site,https://www.sasm.site,https://sasm-7rcwq8yqo-fosterkelvins-projects.vercel.app
```

### In Render Logs (after redeploy):
```
APP_ORIGIN from env: https://sasm.site,https://www.sasm.site,https://sasm-7rcwq8yqo-fosterkelvins-projects.vercel.app
Allowed CORS origins: [
  'https://sasm.site',
  'https://www.sasm.site', 
  'https://sasm-7rcwq8yqo-fosterkelvins-projects.vercel.app'
]
Server listening on port 10000
```

---

## 🆘 Still Getting CORS Error?

### Check These:

1. **Did Render finish redeploying?**
   - Check Logs tab for "Server listening on port..."

2. **Did you hard refresh your browser?**
   - Ctrl+Shift+R (Windows)
   - Cmd+Shift+R (Mac)

3. **Is the URL exactly correct?**
   - No trailing slash
   - Includes `https://`
   - Matches exactly what's in the error

4. **Are there any typos?**
   - Copy-paste the URL from the error message
   - Don't type it manually

---

## ✅ Success Checklist

- [ ] Copied Vercel URL from error message
- [ ] Went to Render Dashboard → Environment
- [ ] Updated APP_ORIGIN with Vercel URL
- [ ] Saved changes
- [ ] Waited for Render redeploy (2-3 min)
- [ ] Checked Render logs show new CORS origins
- [ ] Hard refreshed Vercel site (Ctrl+Shift+R)
- [ ] Tried to sign in
- [ ] No more CORS errors! ✅
- [ ] Login works! ✅
- [ ] DTR loads! ✅

---

**Once you've updated APP_ORIGIN on Render, let me know and we'll verify it's working!** 🚀
