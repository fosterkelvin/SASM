# Cookie and Sign-out Issues Fix

## Issues Fixed

### 1. Cookie Configuration Issues

- **Problem**: Cookies weren't being set properly in production due to SameSite and domain configuration
- **Fix**: Updated cookie configuration to handle production cross-origin requests

### 2. Sign-out Problems

- **Problem**: Sign-out wasn't properly clearing sessions and cookies
- **Fix**: Enhanced sign-out handler to clear both access and refresh tokens, delete sessions, and force UI refresh

### 3. Token Refresh Issues

- **Problem**: 401 errors weren't being handled properly, causing users to appear signed in when they weren't
- **Fix**: Added automatic token refresh logic and proper error handling

## Changes Made

### Backend Changes

#### 1. Enhanced Cookie Configuration (`backend/src/utils/cookies.ts`)

```typescript
// Added support for cookie domain configuration
// Improved cookie clearing to match exact options used when setting cookies
```

#### 2. Improved Sign-out Handler (`backend/src/controllers/auth.controller.ts`)

```typescript
// Enhanced to handle both access and refresh tokens
// Better session cleanup
// More robust error handling
```

#### 3. Added Cookie Domain Environment Variable (`backend/src/constants/env.ts`)

```typescript
// Added COOKIE_DOMAIN for production cross-domain cookie support
```

### Frontend Changes

#### 1. Robust Logout Logic (`frontend/src/context/AuthContext.tsx`)

```typescript
// Clear user state immediately for better UX
// Force page redirect to ensure complete cleanup
// Better error handling
```

#### 2. Automatic Token Refresh (`frontend/src/config/apiClient.ts`)

```typescript
// Added interceptor for automatic token refresh on 401 errors
// Queue failed requests during refresh
// Redirect to sign-in if refresh fails
// Added request timeout
```

## Deployment Configuration

### Environment Variables

Add to your production backend environment:

```bash
# Required
NODE_ENV=production
APP_ORIGIN=https://your-frontend-domain.com
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Optional - for cross-domain cookie support
COOKIE_DOMAIN=.yourdomain.com
```

### Frontend Environment

```bash
VITE_API=https://your-backend-domain.com
```

### CORS Configuration

Ensure your production domains are added to the allowed origins in `backend/src/index.ts`:

```typescript
const allowedOrigins = APP_ORIGIN?.split(",") || [
  "https://your-frontend-domain.com",
  "https://your-backend-domain.com",
];
```

## Testing the Fix

### 1. Sign-in Test

1. Sign in to your application
2. Check browser dev tools > Application > Cookies
3. Verify `accessToken` and `refreshToken` cookies are set
4. Verify cookies have proper `HttpOnly`, `Secure`, and `SameSite` attributes

### 2. Sign-out Test

1. Sign out from the application
2. Check that cookies are cleared from browser
3. Try refreshing the page - should redirect to sign-in
4. Try accessing protected routes directly - should redirect to sign-in

### 3. Token Refresh Test

1. Sign in and wait for access token to expire (15 minutes)
2. Make an API request - should automatically refresh token
3. Check network tab for refresh request
4. Verify new access token is set

### 4. Inactivity Test

1. Sign in and remain inactive for 1 hour
2. Should see warning at 55 minutes
3. Should auto-sign out at 60 minutes
4. Should redirect to sign-in page

## Common Production Issues and Solutions

### Issue: Cookies not being set

**Solution**:

- Ensure `NODE_ENV=production` is set
- Verify CORS origins include your production domain
- Check that your frontend and backend are using HTTPS in production

### Issue: Sign-out not working completely

**Solution**:

- Clear browser cache and cookies manually
- Check browser dev tools for any JavaScript errors
- Verify the sign-out endpoint is being called successfully

### Issue: "Access Denied" after deployment

**Solution**:

- Check CORS configuration
- Verify environment variables are set correctly
- Ensure both frontend and backend are accessible

### Issue: Session persistence problems

**Solution**:

- Check MongoDB connection
- Verify JWT secrets are consistent
- Check server logs for session-related errors

## Security Notes

1. **HTTPS Required**: In production, cookies will only work over HTTPS
2. **Secure Secrets**: Use strong, unique JWT secrets
3. **Domain Configuration**: Only set COOKIE_DOMAIN if you need cross-subdomain support
4. **CORS**: Keep allowed origins as restrictive as possible

## Monitoring

Add these logs to monitor cookie and authentication issues:

```typescript
// In production, monitor these endpoints:
// POST /auth/signin - Sign-in attempts
// GET /auth/signout - Sign-out attempts
// GET /auth/refresh - Token refresh attempts
// GET /user - User authentication checks
```
