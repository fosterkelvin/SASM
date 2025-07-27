# Multiple Delete Feature for Notifications

## Overview

This feature allows users to select and delete multiple notifications at once, improving the user experience when managing large numbers of notifications.

## Backend Implementation

### New API Endpoint

- **URL**: `DELETE /api/notifications/bulk`
- **Method**: DELETE
- **Authentication**: Required (JWT token)
- **Request Body**:
  ```json
  {
    "notificationIDs": ["id1", "id2", "id3"]
  }
  ```
- **Response**:
  ```json
  {
    "message": "3 notification(s) deleted successfully",
    "deletedCount": 3
  }
  ```

### Files Modified

1. **`backend/src/services/notification.service.ts`**

   - Added `deleteMultipleNotifications()` function

2. **`backend/src/controllers/notification.controller.ts`**

   - Added `deleteMultipleNotificationsHandler()` function
   - Added request validation using Zod schema

3. **`backend/src/routes/notification.route.ts`**
   - Added new route: `DELETE /bulk`

## Frontend Implementation

### New Features

1. **Selection Mode**: Toggle between normal view and selection mode
2. **Checkbox Selection**: Each notification can be individually selected
3. **Bulk Actions**: Select all, clear selection, and bulk delete
4. **Visual Feedback**: Selected notifications are highlighted

### Files Modified

1. **`frontend/src/lib/api.ts`**

   - Added `deleteMultipleNotifications()` API function

2. **`frontend/src/hooks/useNotificationMutations.ts`**

   - Added `deleteMultipleNotificationsMutation` hook

3. **`frontend/src/pages/Notifications.tsx`**
   - Added selection mode state management
   - Added UI controls for bulk operations
   - Modified notification cards to show checkboxes in selection mode

### UI Components Added

- **Select Button**: Enters selection mode
- **Select All Button**: Selects all visible notifications
- **Clear Button**: Clears current selection
- **Delete Button**: Shows count of selected notifications
- **Cancel Button**: Exits selection mode
- **Checkboxes**: On each notification card when in selection mode

### User Flow

1. User clicks "Select" button to enter selection mode
2. Checkboxes appear on all notification cards
3. User can:
   - Click individual checkboxes to select notifications
   - Click "Select All" to select all visible notifications
   - Click "Clear" to deselect all notifications
4. Once notifications are selected, user clicks "Delete (X)" button
5. Selected notifications are deleted and selection mode is exited

## Usage Examples

### API Usage (Backend)

```typescript
// Delete multiple notifications
const result = await deleteMultipleNotifications(["id1", "id2", "id3"], userId);
console.log(`Deleted ${result.deletedCount} notifications`);
```

### Frontend Usage

```typescript
// Using the mutation hook
const { deleteMultipleNotificationsMutation } = useNotificationMutations();

// Delete selected notifications
deleteMultipleNotificationsMutation.mutate(["id1", "id2", "id3"]);
```

## Security Considerations

- All deletions are scoped to the authenticated user
- Validation ensures at least one notification ID is provided
- Only notifications belonging to the user can be deleted

## Performance Benefits

- Reduces API calls (one request instead of multiple)
- Improved user experience for bulk operations
- Database optimization with single `deleteMany` operation

## Future Enhancements

- Add bulk mark as read functionality
- Add notification filtering in selection mode
- Add confirmation dialog for bulk delete
- Add undo functionality
