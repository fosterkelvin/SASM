# CROSS-ORIGIN DEPLOYMENT FIX (Render + Vercel)

## The Real Problem

Your setup:

- **Frontend:** Vercel (https://sasm.site)
- **Backend:** Render (https://sasm-backend.onrender.com or similar)
- **Issue:** Cookies not working across different domains

This is a **cross-origin cookie issue**, not a code issue. Localhost works because everything is on the same domain (localhost).

## Root Cause

When backend and frontend are on different domains:

- Browser security blocks cookies by default
- Need special configuration: `sameSite: "none"` + `secure: true`
- Backend must explicitly allow frontend domain in CORS
- Frontend must send `credentials: true` in requests

## THE FIX (Step-by-Step)

### Step 1: Configure Backend Environment Variables (Render)

Go to your Render dashboard → Your backend service → Environment tab

**Set these EXACTLY:**

```env
# CRITICAL - Must match your frontend URL EXACTLY
APP_ORIGIN=https://sasm.site,https://www.sasm.site

# CRITICAL - Must be "production" for secure cookies
NODE_ENV=production

# Do NOT set COOKIE_DOMAIN for cross-origin
# Leave it unset or comment it out
# COOKIE_DOMAIN=

# Your other variables
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
EMAIL_SENDER=noreply@sasm.site
RESEND_API_KEY=your_key
PORT=4004
```

**IMPORTANT:**

- `APP_ORIGIN` must NOT have trailing slashes
- `NODE_ENV` MUST be exactly "production" (lowercase)
- Do NOT set `COOKIE_DOMAIN` - leave it blank

### Step 2: Update Frontend Environment Variable (Vercel)

Go to Vercel dashboard → Your project → Settings → Environment Variables

**Add/Update:**

```env
VITE_API=https://your-backend.onrender.com
```

Replace `your-backend.onrender.com` with your actual Render backend URL.

**IMPORTANT:** No trailing slash!

### Step 3: Verify Backend CORS (Already Set)

Your `backend/src/index.ts` already has:

```typescript
cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // ✅ This is critical!
});
```

This is correct! ✅

### Step 4: Verify Frontend API Config (Already Set)

Your `frontend/src/config/apiClient.ts` already has:

```typescript
const options = {
  baseURL: import.meta.env.VITE_API,
  withCredentials: true, // ✅ This is critical!
  timeout: 10000,
};
```

This is correct! ✅

### Step 5: Deploy Backend Changes

```bash
cd d:\CODE\SASM-1\backend
git add .
git commit -m "Fix: Cross-origin cookie configuration for Render+Vercel"
git push
```

Render will auto-deploy if connected to GitHub.

### Step 6: Rebuild and Deploy Frontend

```bash
cd d:\CODE\SASM-1\frontend
npm run build
```

Then push to trigger Vercel deployment:

```bash
git add .
git commit -m "Fix: Update production API URL"
git push
```

### Step 7: Clear Everything and Test

1. **Wait 2-3 minutes** for both deployments to complete
2. **Clear sessions** in MongoDB:
   ```javascript
   db.sessions.deleteMany({});
   ```
3. **Close ALL browser tabs** of sasm.site
4. **Clear browser data:**
   - Press `Ctrl + Shift + Delete`
   - Select "All time"
   - Check "Cookies and other site data"
   - Click "Clear data"
5. **Open a NEW incognito/private window**
6. Go to https://sasm.site
7. Sign in
8. Select profile with PIN

## Step 8: Debug If Still Not Working

Open browser console on https://sasm.site and run:

```javascript
// Check API URL
console.log("API URL:", import.meta.env.VITE_API);

// Try login and check cookies
fetch("https://your-backend.onrender.com/auth/signin", {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "your-email@example.com",
    password: "your-password",
  }),
})
  .then((r) => r.json())
  .then((data) => {
    console.log("Login response:", data);
    console.log("Cookies:", document.cookie);
  });
```

**Expected result:**

- Response shows success
- `document.cookie` shows `accessToken` and `refreshToken`

**If cookies are empty:**

- CORS issue or cookie configuration problem
- Check Render logs for CORS errors

## Common Issues & Solutions

### Issue: "Cookies are empty after login"

**Cause:** Cookie configuration or CORS issue

**Solution:**

1. Verify `NODE_ENV=production` on Render (EXACT spelling)
2. Verify `APP_ORIGIN` includes your frontend URL
3. Check Render logs for CORS errors
4. Make sure `COOKIE_DOMAIN` is NOT set (or is empty)

### Issue: "CORS blocked origin"

**Cause:** Frontend URL not in APP_ORIGIN

**Solution:**

```env
APP_ORIGIN=https://sasm.site,https://www.sasm.site
```

Include BOTH www and non-www versions.

### Issue: "Cookies working but profileName still missing"

**Cause:** Old sessions without profileID

**Solution:**

```javascript
db.sessions.deleteMany({});
```

Then sign out and sign in again.

## Verification Checklist

After completing all steps:

### On Render Dashboard:

- [ ] `NODE_ENV` = `production` (exact spelling)
- [ ] `APP_ORIGIN` = `https://sasm.site,https://www.sasm.site`
- [ ] `COOKIE_DOMAIN` is blank/not set
- [ ] Latest commit deployed
- [ ] No errors in logs

### On Vercel Dashboard:

- [ ] `VITE_API` = your Render backend URL
- [ ] Latest commit deployed
- [ ] Build successful

### In Browser:

- [ ] Can sign in successfully
- [ ] Cookies appear in DevTools → Application → Cookies
- [ ] `/user` API call returns `profileName`
- [ ] Sidebar shows "Profile: kel"

## Why Localhost Works But Production Doesn't

| Aspect   | Localhost             | Production                           |
| -------- | --------------------- | ------------------------------------ |
| Domain   | Same (localhost)      | Different (sasm.site ≠ onrender.com) |
| Protocol | HTTP (insecure)       | HTTPS (secure) required              |
| Cookies  | `sameSite: lax` works | Needs `sameSite: none`               |
| Security | Relaxed               | Strict (browser blocks by default)   |
| CORS     | Not needed            | Required                             |

## What Your Render Backend Logs Should Show

After fixing:

```
APP_ORIGIN from env: https://sasm.site,https://www.sasm.site
Allowed CORS origins: ['https://sasm.site', 'https://www.sasm.site']
Server listening on port 4004 in production environment.
```

If you see different values, environment variables aren't set correctly.

## Emergency Debug Commands

On your deployed frontend (https://sasm.site), open console:

```javascript
// 1. Check environment
console.log("API:", import.meta.env.VITE_API);
console.log("Mode:", import.meta.env.MODE);

// 2. Check cookies after login
console.log("Cookies:", document.cookie);

// 3. Test user endpoint
fetch(import.meta.env.VITE_API + "/user", {
  credentials: "include",
})
  .then((r) => r.json())
  .then((d) => console.log("User data:", d))
  .catch((e) => console.error("Error:", e));
```

---

## TL;DR - Quick Fix Checklist

1. ☐ Set `APP_ORIGIN=https://sasm.site,https://www.sasm.site` on Render
2. ☐ Set `NODE_ENV=production` on Render
3. ☐ Set `VITE_API=https://your-backend.onrender.com` on Vercel
4. ☐ Remove/leave blank `COOKIE_DOMAIN` on Render
5. ☐ Deploy backend (git push)
6. ☐ Deploy frontend (git push)
7. ☐ Clear MongoDB sessions: `db.sessions.deleteMany({})`
8. ☐ Clear browser cookies and cache
9. ☐ Test in incognito window

**Expected Result:** "Profile: kel" appears in sidebar! 🎉
