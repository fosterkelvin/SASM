# Why Vercel is Using localhost:4004

## The Mystery Explained 🔍

You didn't set localhost in Vercel, but it's still using `localhost:4004` because:

### How Vite Environment Variables Work

```mermaid
┌─────────────────────────────────────────┐
│  1. Vercel clones your GitHub repo      │
│     ✓ Includes: frontend/.env           │
│     ✓ Contains: VITE_API=localhost:4004 │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  2. Vercel runs: npm run build          │
│     ✓ Vite reads .env file              │
│     ✓ Replaces import.meta.env.VITE_API │
│       with "http://localhost:4004"      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  3. Creates JavaScript bundle           │
│     const baseURL = "localhost:4004"    │
│     ✓ HARDCODED into bundle!            │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  4. Deploys bundle to Vercel            │
│     ✓ All users get localhost hardcoded │
│     ✗ Calls to localhost fail           │
└─────────────────────────────────────────┘
```

### The Problem

Your `frontend/.env` file in GitHub has:

```
VITE_API=http://localhost:4004
```

**Vite bakes environment variables into the JavaScript at BUILD time, not RUN time!**

## 🎯 THE SOLUTION - You Have 2 Options

### Option 1: Use Vercel Environment Variables (BEST)

**Vercel environment variables OVERRIDE .env files during build!**

**Steps:**

1. Go to https://vercel.com/dashboard
2. Click your SASM project
3. Settings → Environment Variables
4. Add variable:
   - **Name**: `VITE_API`
   - **Value**: `https://your-backend-url.com` (see below for how to find it)
   - **Environments**: ✓ Production, ✓ Preview, ✓ Development
5. Click Save
6. Go to Deployments → Click ⋮ → Redeploy

**After redeploy, Vercel will use YOUR backend URL instead of localhost!**

---

### Option 2: Update .env.production and Commit (SIMPLER but less flexible)

**Update this file:** `frontend/.env.production`

**Change from:**

```env
VITE_API=https://your-backend-domain.com
```

**Change to:**

```env
VITE_API=https://your-actual-backend-url.com
```

**Then:**

```bash
git add frontend/.env.production
git commit -m "fix: Set production backend URL"
git push origin main
```

Vercel will automatically rebuild with the new URL!

---

## 🔍 How to Find Your Backend URL

### If deployed on Render:

1. Go to https://dashboard.render.com
2. Find your backend service
3. URL is shown at the top (e.g., `https://sasm-backend-abc.onrender.com`)

### If deployed on Railway:

1. Go to https://railway.app
2. Click your project
3. Click backend service
4. Copy the deployment URL

### If NOT deployed yet:

**You need to deploy your backend first!** See the deployment guide in `URGENT_FIX_DTR_ERROR.md`

---

## 📋 Quick Comparison

| Method                        | Pros                                                                                                    | Cons                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **Option 1: Vercel Env Vars** | ✅ Can change without git commit<br>✅ Different URLs per environment<br>✅ More secure (not in GitHub) | ⚠️ Requires Vercel dashboard access                      |
| **Option 2: .env.production** | ✅ Simple to update<br>✅ Versioned in git<br>✅ Works automatically                                    | ⚠️ URL visible in GitHub<br>⚠️ Requires commit to change |

---

## 🧪 How to Verify It's Fixed

After deploying, open your Vercel site and check browser console:

**Before Fix:**

```javascript
// In browser console on your Vercel site
import.meta.env.VITE_API;
// Output: "http://localhost:4004" ❌
```

**After Fix:**

```javascript
import.meta.env.VITE_API;
// Output: "https://your-backend.onrender.com" ✅
```

Or check Network tab:

- ❌ Before: Requests to `localhost:4004` → ERR_BLOCKED_BY_CLIENT
- ✅ After: Requests to `https://your-backend.com` → 200 OK

---

## 🎬 Action Plan

**Right Now:**

1. **Do you have a backend deployed?**

   - ✅ YES → Skip to step 2
   - ❌ NO → Deploy backend first (see URGENT_FIX_DTR_ERROR.md)

2. **What's your backend URL?**

   - Copy it (e.g., `https://sasm-backend-xyz.onrender.com`)

3. **Choose your option:**

   - **Option 1**: Add to Vercel env vars (recommended)
   - **Option 2**: Update .env.production and commit

4. **Wait for rebuild** (2-3 minutes)

5. **Test your site** - DTR should load! 🎉

---

## ❓ Quick FAQ

**Q: Why didn't .env.production work automatically?**  
A: It does! But it was set to `https://your-backend-domain.com` (placeholder). You need to replace it with your REAL backend URL.

**Q: Can I just change .env (without .production)?**  
A: No! That's for local development. Vercel production builds use `.env.production` (if no Vercel env var is set).

**Q: Do I need both options?**  
A: No! Pick ONE. Option 1 (Vercel env vars) is more professional.

**Q: Will this affect my local development?**  
A: No! Your local `.env` file will still use `localhost:4004` for development.

---

## 🆘 Still Stuck?

Provide:

1. Is your backend deployed? Where?
2. What's your backend URL?
3. Which option did you choose (1 or 2)?
4. Screenshot of the error in browser console

I'll help you get it working! 🚀
