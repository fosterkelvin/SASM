# Cookie & Authentication Troubleshooting

## The Error You're Seeing

```
PATH: /user AppError: Not authorized
InvalidAccessToken
```

AND

```
Profile ID: undefined
```

## Root Cause Analysis

Your backend logs show:
- ✅ Backend is deployed and running
- ✅ User ID exists: `68f06e1fa78957f9fca6bf4c`
- ✅ Office name: `SIT`
- ❌ **Profile ID: undefined**

This means the access token reaching your backend **doesn't contain `profileID`**.

## Two Possible Scenarios

### Scenario 1: Old Session (Most Likely)
You're using a session created BEFORE the code was deployed. Old sessions don't have `profileID` stored.

**Fix:** Clear database sessions and re-login (see IMMEDIATE_FIX.md)

### Scenario 2: Cookie Not Being Sent
The frontend is not sending cookies to the backend (cross-origin issue).

**Check if this is the issue:**
1. Open https://sasm.site
2. Press F12 → Network tab
3. Look for `/user` request
4. Click on it
5. Check "Cookies" or "Request Headers"
6. If you DON'T see `accessToken` cookie, this is the issue

## Backend Environment Variables (For Render)

Your backend needs these environment variables set correctly:

```env
# Critical for cookies to work cross-origin
APP_ORIGIN=https://sasm.site
NODE_ENV=production
COOKIE_DOMAIN=.sasm.site

# Database
MONGO_URI=your_mongodb_connection_string

# JWT Secrets
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Email (if using)
EMAIL_SENDER=noreply@sasm.site
RESEND_API_KEY=your_key
```

### Important Cookie Settings Explained:

**`APP_ORIGIN=https://sasm.site`**
- Tells backend which frontend domain is allowed
- Must match your deployed frontend URL exactly
- No trailing slash!

**`COOKIE_DOMAIN=.sasm.site`**
- With the dot (.) prefix, cookies work across subdomains
- If your backend is at `api.sasm.site` and frontend at `sasm.site`, use `.sasm.site`
- If backend is at different domain entirely, you might need to omit this

**`NODE_ENV=production`**
- Enables secure cookies (HTTPS only)
- Sets `sameSite: "none"` for cross-origin
- Critical for production!

## Frontend Environment Variables

Make sure your `.env.production` has:

```env
VITE_API=https://your-backend-url.com
```

Or if your backend is on Render:
```env
VITE_API=https://sasm-backend.onrender.com
```

## CORS Configuration Check

Your backend needs CORS configured. Check if you have this in `backend/src/index.ts`:

```typescript
app.use(cors({
  origin: process.env.APP_ORIGIN || 'http://localhost:5173',
  credentials: true, // CRITICAL - allows cookies
}));
```

## Step-by-Step Fix

### 1. Check Backend Environment Variables (Render Dashboard)
1. Go to Render dashboard
2. Click on your backend service
3. Go to "Environment" tab
4. Verify these are set:
   - `APP_ORIGIN=https://sasm.site`
   - `NODE_ENV=production`
   - `COOKIE_DOMAIN=.sasm.site` (or appropriate domain)

### 2. Clear Database Sessions
Since you're using Render with MongoDB, you need to access your database:

**If MongoDB Atlas:**
```javascript
// In MongoDB Atlas → Browse Collections → Shell
db.sessions.deleteMany({})
```

**If Railway/Render DB Console:**
```javascript
db.sessions.deleteMany({})
```

### 3. Test Cookie Flow
1. Clear browser cache and cookies
2. Go to https://sasm.site
3. Open DevTools (F12) → Application tab → Cookies
4. Sign in
5. After sign in, check if you see cookies:
   - `accessToken`
   - `refreshToken`
6. If you DON'T see these cookies, there's a cookie configuration issue

### 4. If Cookies Are Not Being Set

This usually means:
- `APP_ORIGIN` doesn't match your frontend URL
- CORS not configured with `credentials: true`
- `NODE_ENV` not set to `production`

**Check backend logs during login:**
You should see the cookies being set. If you see CORS errors, that's the issue.

## Quick Verification Commands

### Check if backend is receiving cookies:
Add this temporarily to your backend `authenticate.ts`:
```typescript
console.log('Cookies received:', req.cookies);
console.log('AccessToken:', req.cookies.accessToken ? 'present' : 'MISSING');
```

### Check frontend API URL:
In browser console on deployed site:
```javascript
console.log(import.meta.env.VITE_API)
// Should show your backend URL, NOT localhost
```

## Most Likely Solution

Based on your error, the most likely fix is:

1. **Clear sessions in database** (old sessions don't have profileID)
2. **Sign out** from website
3. **Clear browser cookies**
4. **Sign in again**
5. **Select profile with PIN**

The backend IS deployed (your logs prove it), but you're using an old session that doesn't have `profileID`.

---

**Next Action:** Clear the sessions database NOW, then test by signing in fresh. That should fix it! 🎯
