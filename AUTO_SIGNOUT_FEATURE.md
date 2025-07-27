# Auto-Signout Feature

## Overview

The application now includes an automatic signout feature that signs users out after 1 hour of inactivity to enhance security.

## How it works

### Inactivity Detection

The system tracks user activity through the following events:

- Mouse movements (`mousemove`)
- Mouse clicks (`mousedown`, `click`)
- Keyboard input (`keypress`, `keydown`)
- Page scrolling (`scroll`)
- Touch interactions (`touchstart`)

### Timeline

- **Warning**: After 55 minutes of inactivity, users receive a warning notification
- **Auto-signout**: After 60 minutes (1 hour) of inactivity, users are automatically signed out

### User Experience

1. **Warning Notification**: A toast notification appears 5 minutes before auto-signout, warning users about impending session expiration
2. **Grace Period**: Users can interact with the page during the warning period to reset the timer
3. **Auto-signout**: If no activity is detected, users are automatically signed out and redirected to the login page
4. **Signout Notification**: A notification confirms the auto-signout action

## Implementation Details

### Components Added

1. **`useInactivityTimer` Hook** (`src/hooks/useInactivityTimer.ts`)

   - Reusable hook for tracking user inactivity
   - Configurable timeout and warning periods
   - Activity event listeners management

2. **Toast Notification System** (`src/context/ToastContext.tsx`)

   - User-friendly notifications instead of browser alerts
   - Multiple toast types (info, warning, error, success)
   - Auto-dismiss functionality

3. **Enhanced AuthContext** (`src/context/AuthContext.tsx`)
   - Integrated inactivity timer
   - Automatic cleanup on signout
   - Warning and timeout handlers

### Configuration

Current settings:

- **Inactivity Timeout**: 60 minutes (1 hour)
- **Warning Time**: 5 minutes before timeout
- **Warning Duration**: 10 seconds display time
- **Signout Notification**: 5 seconds display time

### Customization

To modify the timeout duration, update the `INACTIVITY_TIMEOUT` constant in `src/context/AuthContext.tsx`:

```typescript
// Change from 1 hour to 30 minutes
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
```

To adjust the warning time:

```typescript
// Change warning to 10 minutes before timeout
const WARNING_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds
```

## Security Benefits

- Prevents unauthorized access if users leave their devices unattended
- Reduces risk of session hijacking
- Complies with security best practices for web applications
- Automatically cleans up server-side sessions

## User Benefits

- Clear warnings before automatic signout
- Non-intrusive toast notifications
- Activity-based timer reset (any interaction extends the session)
- Smooth user experience with proper cleanup
