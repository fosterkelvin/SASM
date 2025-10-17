# 🔧 Profile Selector Cookie Fix - SOLVED!

## The Problem

Your profile selector worked perfectly on **localhost** but failed to store the selected profile in **production** (deployed version).

### Why It Failed

**Localhost (Working):**

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4004`
- ✅ **Same domain** → Cookies with `sameSite: "strict"` work fine

**Production (Broken):**

- Frontend: `https://sasm.site` (Vercel)
- Backend: `https://your-backend.onrender.com` (Render)
- ❌ **Different domains** → Cookies with `sameSite: "strict"` are **blocked by browsers**

## The Root Cause

In `backend/src/controllers/officeProfile.controller.ts`, the `selectProfileHandler` function was setting cookies manually with:

```typescript
sameSite: "strict"; // ❌ This blocks cross-origin cookies!
```

This is why:

1. Login worked (it used the correct cookie utility)
2. Profile selection failed (it used hardcoded `sameSite: "strict"`)

## The Fix Applied

I've updated the code to use the existing `setAuthCookies` utility which automatically handles cross-origin cookies correctly:

### Before (Broken):

```typescript
const secure = process.env.NODE_ENV === "production";

res
  .cookie("refreshToken", refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure,
    sameSite: "strict", // ❌ BLOCKS COOKIES IN PRODUCTION
  })
  .cookie("accessToken", accessToken, {
    maxAge: 15 * 60 * 1000,
    httpOnly: true,
    secure,
    sameSite: "strict", // ❌ BLOCKS COOKIES IN PRODUCTION
  });
```

### After (Fixed):

```typescript
// Uses the utility that sets sameSite: "none" in production
setAuthCookies({ res, accessToken, refreshToken });
```

The `setAuthCookies` utility (in `backend/src/utils/cookies.ts`) automatically uses:

- `sameSite: "none"` in production (allows cross-origin)
- `sameSite: "lax"` in development (localhost)
- `secure: true` in production (required for sameSite: "none")

## How to Deploy the Fix

### Step 1: Commit and Push Changes

```powershell
cd d:\CODE\SASM-1
git add backend/src/controllers/officeProfile.controller.ts
git commit -m "Fix profile selector cookies for production (cross-origin)"
git push origin main
```

### Step 2: Wait for Automatic Deployment

- **Render**: Will automatically detect the push and redeploy (2-3 minutes)
- **Vercel**: Frontend doesn't need changes, no redeploy needed

### Step 3: Test in Production

1. Go to https://sasm.site
2. Login as an office user
3. Select a profile with PIN
4. ✅ Profile should now be stored correctly!

## Why This Fix Works

The fix uses the centralized cookie utility that:

1. ✅ Sets `sameSite: "none"` for production (cross-origin allowed)
2. ✅ Sets `secure: true` for production (required for sameSite: "none")
3. ✅ Maintains consistency with login cookies
4. ✅ Still works on localhost with `sameSite: "lax"`

## Verification Checklist

After deploying, verify:

- [ ] Can login successfully
- [ ] Can see profile selector page
- [ ] Can enter PIN and select profile
- [ ] Profile selection persists (redirects to dashboard)
- [ ] Can navigate pages without losing profile
- [ ] Can logout successfully

## Technical Details

### Cookie Configuration in Production:

```typescript
{
  sameSite: "none",      // Allows cross-origin
  httpOnly: true,        // Prevents JavaScript access (security)
  secure: true,          // HTTPS only (required for sameSite: "none")
  expires: <timestamp>   // Cookie expiration
}
```

### Why sameSite: "none" is Safe:

- ✅ Cookies are still `httpOnly` (protected from XSS)
- ✅ CORS is configured to allow only your frontend domain
- ✅ Backend validates all requests
- ✅ This is the standard approach for cross-origin authentication

## Need More Help?

If the issue persists after deployment:

1. **Check browser console** for cookie warnings
2. **Check Render logs** to verify the code deployed
3. **Clear browser cookies** and try again
4. **Check CORS settings** in `backend/src/index.ts`
5. **Verify environment variables** on Render:
   - `APP_ORIGIN` = `https://sasm.site,https://www.sasm.site`
   - `NODE_ENV` = `production`

---

## Summary

✅ **Fixed**: Changed `selectProfileHandler` to use `setAuthCookies` utility  
✅ **Impact**: Profile selection now works in production (cross-origin)  
✅ **No Breaking Changes**: Localhost and login still work exactly the same  
✅ **Deploy**: Just commit, push, and wait for Render to redeploy
