# Visual Guide: Why Localhost Works But Production Doesn't

## The Architecture Difference

### LOCALHOST (Works Fine ✅)

```
┌─────────────────────────────────────┐
│         Your Computer               │
│                                     │
│  ┌──────────────┐  ┌─────────────┐ │
│  │   Frontend   │  │   Backend   │ │
│  │  localhost   │  │  localhost  │ │
│  │    :5173     │◄─┤    :4004    │ │
│  └──────────────┘  └─────────────┘ │
│         ▲                ▲          │
│         │   Same Domain  │          │
│         └────────────────┘          │
└─────────────────────────────────────┘
         Cookies work automatically!
```

### PRODUCTION (Doesn't Work ❌)

```
┌──────────────────┐        ┌──────────────────┐
│     Vercel       │        │     Render       │
│                  │        │                  │
│   ┌──────────┐   │        │  ┌───────────┐  │
│   │ Frontend │   │        │  │  Backend  │  │
│   │ sasm.site│   │   ✗    │  │.onrender  │  │
│   │          │   │◄──────►│  │   .com    │  │
│   └──────────┘   │        │  └───────────┘  │
└──────────────────┘        └──────────────────┘
  Different domains = Browser blocks cookies!
```

## The Cookie Problem

### Why Browsers Block Cookies

```
Browser Security Logic:
─────────────────────

1. User visits: https://sasm.site (Vercel)
2. Site makes request to: https://backend.onrender.com (Render)
3. Backend tries to set cookie
4. Browser sees: "Wait! Different domain!"
5. Browser blocks cookie ❌

Result: No cookie = No authentication = No profile data
```

## The Solution: Special Configuration

### What We Need To Tell The Browser

```
Backend (Render) says:
─────────────────────
"Hey browser! I trust these domains:
 - https://sasm.site
 - https://www.sasm.site

Please allow cookies from me to them!"

Cookie settings:
 - sameSite: "none"  (allow cross-origin)
 - secure: true       (HTTPS only)
 - httpOnly: true     (security)
```

### How We Tell The Browser

**On Render (Backend):**

```
APP_ORIGIN = https://sasm.site,https://www.sasm.site
  ↓
  Tells CORS: "Allow these origins"

NODE_ENV = production
  ↓
  Sets cookies with sameSite:"none" & secure:true
```

**On Vercel (Frontend):**

```
VITE_API = https://your-backend.onrender.com
  ↓
  Frontend knows where to send requests
```

## The Profile Flow

### What Happens When You Select A Profile

```
STEP 1: Sign In
───────────────
Browser → Backend: "Sign me in"
Backend creates: Session { userID: "abc123" }
Backend creates: Token { userID: "abc123", sessionID: "xyz" }
Backend sends: Cookie with Token
Status: ✅ Signed in, but NO profile yet


STEP 2: Select Profile
───────────────────────
Browser → Backend: "Select profile 'kel' with PIN 1234"
Backend validates: PIN correct ✅
Backend creates: NEW Session {
  userID: "abc123",
  profileID: "profile123"  ← NEW!
}
Backend creates: NEW Token {
  userID: "abc123",
  sessionID: "xyz",
  profileID: "profile123"  ← NEW!
}
Backend sends: NEW Cookie with NEW Token
Status: ✅ Profile selected!


STEP 3: Access Any Page
────────────────────────
Browser sends: Cookie (contains Token with profileID)
Backend reads: Token → profileID = "profile123"
Backend fetches: Profile from database
Backend returns: {
  firstname: "...",
  lastname: "...",
  profileName: "kel",  ← This is what shows!
  role: "office"
}
Frontend displays: "Profile: kel" ✅


STEP 4: Token Refresh (after 15 min)
─────────────────────────────────────
Browser: Token expired, need refresh
Backend reads: Session from database
Backend sees: Session has profileID = "profile123"
Backend creates: NEW Token {
  userID: "abc123",
  sessionID: "xyz",
  profileID: "profile123"  ← Preserved!
}
Backend sends: NEW Cookie with NEW Token
Status: ✅ Profile still there after refresh!
```

## Why Old Sessions Break This

### Old Session (Before Code Fix)

```javascript
{
  _id: "session123",
  userID: "abc123",
  sessionID: "xyz",
  expiresAt: ...
  // NO profileID! ❌
}
```

When token refreshes:

```javascript
// Backend looks at session
session = { userID: "abc123", sessionID: "xyz" };
// profileID is missing!

// Creates new token WITHOUT profileID
newToken = {
  userID: "abc123",
  sessionID: "xyz",
  // profileID missing! ❌
};

// Frontend can't show profile info
// because profileID is not in token
```

### New Session (After Code Fix)

```javascript
{
  _id: "session123",
  userID: "abc123",
  sessionID: "xyz",
  profileID: "profile123",  ← ADDED!
  expiresAt: ...
}
```

When token refreshes:

```javascript
// Backend looks at session
session = { userID: "abc123", sessionID: "xyz", profileID: "profile123" }
// profileID is there! ✅

// Creates new token WITH profileID
newToken = {
  userID: "abc123",
  sessionID: "xyz",
  profileID: "profile123"  ← Preserved! ✅
}

// Frontend shows profile info
// because profileID is in token ✅
```

## The Complete Picture

```
┌─────────────────────────────────────────────────────────┐
│                     PRODUCTION SETUP                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐                    ┌──────────────┐  │
│  │   Vercel     │   HTTPS Request    │   Render     │  │
│  │  (Frontend)  │◄──────────────────►│  (Backend)   │  │
│  │              │   with Cookies     │              │  │
│  │ sasm.site    │                    │ .onrender.com│  │
│  └──────────────┘                    └──────────────┘  │
│         │                                     │          │
│         │ VITE_API tells                      │          │
│         │ where backend is                    │          │
│         │                                     │          │
│         │                           APP_ORIGIN tells     │
│         │                           which frontends      │
│         │                           are allowed          │
│         │                                     │          │
│         └─────────────────────────────────────┘          │
│                     Configuration                         │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │              MongoDB Atlas/Cloud               │ │
│  │                                                     │ │
│  │  Sessions Collection:                              │ │
│  │  { userID, sessionID, profileID, ... }            │ │
│  │         ▲                                           │ │
│  │         └──── Must have profileID field!           │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Key Points To Remember

1. **Localhost = Same Domain** → Cookies work automatically
2. **Production = Different Domains** → Need special config
3. **Environment variables** → Tell browser to allow cookies
4. **Profile selection** → Creates session WITH profileID
5. **Old sessions** → Must be cleared (don't have profileID)
6. **Token refresh** → Preserves profileID from session

## The Fix Checklist

```
☐ Set APP_ORIGIN on Render
☐ Set NODE_ENV=production on Render
☐ Set VITE_API on Vercel
☐ Deploy code (git push)
☐ Clear database sessions
☐ Clear browser cookies
☐ Sign in fresh
☐ SELECT PROFILE with PIN
☐ Check sidebar shows "Profile: kel"
```

If you follow all these steps, it WILL work! 🎯
