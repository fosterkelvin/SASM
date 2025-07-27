# Real-Time Notifications Implementation

This document describes the real-time notification system implemented for the SASM application.

## Overview

The notification system provides real-time updates across the application using a combination of polling, React Query cache invalidation, and context-based state management. Users will see notifications update automatically without needing to refresh the page.

## Features

- ✅ **Automatic Polling**: Notifications refresh every 30 seconds
- ✅ **Background Updates**: Continues polling when tab is not active
- ✅ **Focus Refresh**: Refreshes when window regains focus
- ✅ **Manual Refresh**: Users can manually refresh notifications
- ✅ **Real-time Updates**: New notifications appear instantly after actions
- ✅ **Context-based Management**: Centralized notification state
- ✅ **Cross-component Integration**: Updates trigger from any component

## Architecture

### 1. Core Hook: `useRealTimeNotifications`

Located in `src/hooks/useRealTimeNotifications.ts`

This hook provides:

- Automated polling with configurable intervals
- Notification fetching with filters
- Unread count tracking
- Manual refresh capabilities
- Cache invalidation functions

**Usage:**

```typescript
const {
  notifications,
  unreadCount,
  isLoading,
  refreshNotifications,
  invalidateNotificationQueries,
} = useRealTimeNotifications({
  pollingInterval: 30000, // 30 seconds
  filter: { isRead: false }, // optional
});
```

### 2. Notification Context: `NotificationContext`

Located in `src/context/NotificationContext.tsx`

Provides application-wide notification state management:

- Centralized notification data
- Global refresh functions
- Context-safe hooks for optional usage

**Setup:**

```tsx
// Wrap your app with NotificationProvider
<NotificationProvider>
  <App />
</NotificationProvider>
```

**Usage:**

```typescript
// Safe usage (returns null if not in provider)
const context = useNotificationContextSafe();

// Required usage (throws error if not in provider)
const context = useNotificationContext();
```

### 3. Utility Hook: `useNotificationUpdater`

Located in `src/hooks/useNotificationUpdater.ts`

Simplified hook for triggering notification updates from any component:

```typescript
const { triggerNotificationUpdate, refreshNotifications } =
  useNotificationUpdater();

// Call after actions that might create notifications
triggerNotificationUpdate();
```

### 4. Mutation Hook: `useNotificationMutations`

Located in `src/hooks/useNotificationMutations.ts`

Handles notification actions (mark as read, delete) with automatic cache updates.

## Implementation Details

### Polling Strategy

- **Interval**: 30 seconds (configurable)
- **Background**: Continues when tab is not active
- **Window Focus**: Refreshes when window regains focus
- **Stale Time**: 5 seconds (considers data stale quickly for real-time feel)

### Cache Management

Uses React Query's cache invalidation:

```typescript
queryClient.invalidateQueries({ queryKey: ["notifications"] });
queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
```

### Integration Points

#### 1. Application Creation

When a user submits an application (`Application.tsx`):

```typescript
onSuccess: () => {
  // ... other success logic
  triggerNotificationUpdate(); // Updates notifications
};
```

#### 2. Status Updates

When HR/Office updates application status (`ApplicationManagement.tsx`):

```typescript
onSuccess: () => {
  // ... other success logic
  triggerNotificationUpdate(); // Updates notifications
};
```

#### 3. Notification Actions

When users interact with notifications (`Notifications.tsx`):

- Mark as read
- Delete notifications
- Mark all as read

All actions automatically update the cache and refresh the UI.

## Components Updated

### 1. Notifications Page (`src/pages/Notifications.tsx`)

- Uses `useRealTimeNotifications` hook
- Provides manual refresh button
- Automatic updates every 30 seconds
- Shows real-time unread counts

### 2. Application Page (`src/pages/Application.tsx`)

- Triggers notification updates when submitting applications
- Uses `useNotificationUpdater` hook

### 3. Application Management Page (`src/pages/ApplicationManagement.tsx`)

- Triggers notification updates when changing application status
- Uses `useNotificationUpdater` hook

## Configuration Options

### Polling Interval

Default: 30 seconds. Can be configured:

```typescript
useRealTimeNotifications({
  pollingInterval: 15000, // 15 seconds
});
```

### Background Polling

Default: enabled. Can be disabled:

```typescript
useRealTimeNotifications({
  pollInBackground: false,
});
```

### Focus Refresh

Default: enabled. Can be disabled:

```typescript
useRealTimeNotifications({
  refetchOnFocus: false,
});
```

## Performance Considerations

1. **Stale Time**: Set to 5 seconds to ensure fresh data
2. **Background Polling**: Continues updating even when tab is not active
3. **Smart Invalidation**: Only invalidates when actual changes occur
4. **Context-based**: Prevents duplicate polling across components

## Error Handling

- Graceful degradation if notification context is not available
- Fallback to direct query invalidation
- Error states exposed through hooks
- Safe hook variants for optional usage

## Future Enhancements

Potential improvements for the notification system:

1. **WebSocket Integration**: Replace polling with real-time WebSocket connections
2. **Push Notifications**: Browser push notifications for important updates
3. **Notification Categories**: Filter by notification types
4. **Sound Alerts**: Audio notifications for new messages
5. **Desktop Notifications**: System-level notifications
6. **Notification Preferences**: User-configurable notification settings

## Usage Examples

### Basic Notification Display

```typescript
const MyComponent = () => {
  const { notifications, unreadCount, isLoading } = useRealTimeNotifications();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Notifications ({unreadCount})</h2>
      {notifications.map((notification) => (
        <div key={notification._id}>{notification.title}</div>
      ))}
    </div>
  );
};
```

### Triggering Updates After Actions

```typescript
const MyActionComponent = () => {
  const { triggerNotificationUpdate } = useNotificationUpdater();

  const handleSubmit = async () => {
    await submitForm();
    triggerNotificationUpdate(); // Refresh notifications
  };

  return <button onClick={handleSubmit}>Submit</button>;
};
```

### Manual Refresh

```typescript
const RefreshButton = () => {
  const { refreshNotifications } = useNotificationUpdater();

  return <button onClick={refreshNotifications}>Refresh Notifications</button>;
};
```

## Testing

To test the real-time notification system:

1. **Create an Application**: Submit a new application and check if notifications update
2. **Change Status**: Have HR/Office change application status and verify notifications appear
3. **Multiple Tabs**: Open multiple tabs and verify updates appear across all tabs
4. **Background Updates**: Leave tab inactive and verify updates continue
5. **Manual Refresh**: Use the refresh button to manually update notifications
6. **Network Issues**: Test behavior with slow/offline connections

## Troubleshooting

### Notifications Not Updating

1. Check browser console for errors
2. Verify API endpoints are responding
3. Check React Query DevTools for cache status
4. Ensure proper authentication

### Slow Performance

1. Adjust polling interval if too frequent
2. Check for memory leaks in long-running tabs
3. Verify query cleanup on component unmount

### Missing Notifications

1. Verify backend notification creation
2. Check notification filters
3. Ensure proper cache invalidation after actions
