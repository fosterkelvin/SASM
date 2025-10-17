# IMMEDIATE ACTION REQUIRED: Add Environment Variable in Vercel

## Why You're Still Seeing localhost:4004

The `.env.production` file is correctly set in GitHub with `https://sasm.onrender.com`, BUT:
- Vercel is using **build cache** from before the change
- OR Vercel needs the environment variable set in **Vercel Dashboard** (not just in the file)

## 🚨 DO THIS NOW (Takes 2 minutes)

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. Click on your **SASM project**

### Step 2: Add Environment Variable
1. Click **Settings** tab (top menu)
2. Click **Environment Variables** (left sidebar)
3. Click **Add New** button

### Step 3: Enter the Variable
```
Name:  VITE_API
Value: https://sasm.onrender.com
```

**Important:** 
- ✅ Check ALL three environment boxes:
  - ☑️ Production
  - ☑️ Preview  
  - ☑️ Development
- ❌ NO trailing slash in the URL!

### Step 4: Save
Click **Save** button

### Step 5: Force Redeploy WITHOUT Cache
1. Click **Deployments** tab (top menu)
2. Find the LATEST deployment (top of the list)
3. Click the **⋮** (three dots) on the right
4. Click **Redeploy**
5. **IMPORTANT:** ❌ **UNCHECK** "Use existing Build Cache"
6. Click **Redeploy** button

### Step 6: Wait (2-3 minutes)
Watch the deployment progress in Vercel dashboard

---

## ✅ After Deployment Completes

### Test 1: Check the Bundle
1. Go to your Vercel site
2. Press **Ctrl + Shift + R** (hard refresh to clear browser cache)
3. Open **Developer Tools** (F12)
4. Go to **Console** tab
5. Type: `import.meta.env.VITE_API`
6. Press Enter

**Expected Result:**
```
"https://sasm.onrender.com"  ✅
```

**NOT:**
```
"http://localhost:4004"  ❌
```

### Test 2: Check Network Requests
1. Go to **Network** tab in DevTools
2. Clear the network log (🚫 icon)
3. Try to load DTR
4. Look at the requests

**Expected Result:**
```
✅ https://sasm.onrender.com/dtr/get-or-create → 200 OK
```

**NOT:**
```
❌ localhost:4004/dtr/get-or-create → ERR_BLOCKED_BY_CLIENT
```

---

## 📸 Visual Guide

### Where to Add the Environment Variable:

```
Vercel Dashboard
  └─ Your Project
      └─ Settings (tab)
          └─ Environment Variables (sidebar)
              └─ Add New
                  ├─ Name: VITE_API
                  ├─ Value: https://sasm.onrender.com
                  ├─ ☑️ Production
                  ├─ ☑️ Preview
                  └─ ☑️ Development
```

### Where to Redeploy WITHOUT Cache:

```
Vercel Dashboard
  └─ Your Project
      └─ Deployments (tab)
          └─ Latest Deployment
              └─ ⋮ (three dots)
                  └─ Redeploy
                      └─ ❌ Use existing Build Cache (UNCHECK THIS!)
                      └─ Click "Redeploy"
```

---

## Why This is Necessary

**Vite bakes environment variables into the JavaScript at BUILD time.**

Even though `.env.production` is updated in GitHub, Vercel might:
1. Use cached build artifacts (= old localhost value)
2. Not pick up .env files correctly without explicit env vars

**Setting it in Vercel Dashboard:**
- ✅ Overrides ALL .env files
- ✅ Forces Vercel to use the correct value
- ✅ Works even with caching

---

## 🆘 Troubleshooting

### If still showing localhost after redeploy:

**Did you uncheck "Use existing Build Cache"?**
- This is CRITICAL - the cache has the old localhost value
- You MUST rebuild from scratch

**Hard refresh your browser:**
- Windows: Ctrl + Shift + R
- Mac: Cmd + Shift + R
- Or use Incognito/Private window

**Check Vercel build logs:**
1. Deployments → Click on the deployment
2. Click **Building** section
3. Look for: `VITE_API=https://sasm.onrender.com`
4. Should NOT see: `VITE_API=http://localhost:4004`

---

## 📋 Checklist

- [ ] Went to Vercel Dashboard → Settings → Environment Variables
- [ ] Added VITE_API = https://sasm.onrender.com
- [ ] Checked all 3 environments (Production, Preview, Development)
- [ ] Clicked Save
- [ ] Went to Deployments tab
- [ ] Clicked ⋮ on latest deployment
- [ ] Clicked Redeploy
- [ ] **UNCHECKED** "Use existing Build Cache" ← IMPORTANT!
- [ ] Clicked Redeploy button
- [ ] Waited 2-3 minutes for deployment
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Tested DTR - now works! ✅

---

## Screenshot of What It Should Look Like

When you check `import.meta.env.VITE_API` in console after the fix:

```javascript
// Console on your Vercel site
> import.meta.env.VITE_API
< "https://sasm.onrender.com"  ✅ CORRECT!
```

Network tab should show:
```
GET https://sasm.onrender.com/dtr/get-or-create
Status: 200 OK  ✅
```

---

**Once you've done this, reply with a screenshot of the console showing the VITE_API value and I'll verify it's correct!** 🚀
