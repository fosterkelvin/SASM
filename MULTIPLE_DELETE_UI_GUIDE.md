# UI Changes for Multiple Delete Feature

## Normal Mode (Default)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Filter Buttons: [All (15)] [Unread (5)]                            │
│ Action Buttons: [Select] [Mark All as Read] [Refresh]              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ 🔔 Application Status Update                    [Mark as Read] [🗑] │
│    Your application has been approved...                           │
│    ⏰ 2 hours ago                                                  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ ⚠️  Interview Scheduled                                      [🗑] │
│    An interview has been scheduled...                              │
│    ⏰ 1 day ago                                                    │
└─────────────────────────────────────────────────────────────────────┘
```

## Selection Mode (When "Select" is clicked)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Filter Buttons: [All (15)] [Unread (5)]                            │
│ Selection Info: 2 selected                                         │
│ Action Buttons: [Select All] [Clear] [Delete (2)] [❌ Cancel]      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ ☑️ 🔔 Application Status Update                                    │
│      Your application has been approved...                        │
│      ⏰ 2 hours ago                                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ ☑️ ⚠️  Interview Scheduled                                        │
│      An interview has been scheduled...                           │
│      ⏰ 1 day ago                                                 │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ ☐ ℹ️  New Message                                                  │
│     You have received a new message...                            │
│     ⏰ 3 days ago                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

## Visual Changes Summary

### When Selection Mode is OFF:

- Standard notification cards with individual action buttons
- "Select" button in the top action bar
- Individual "Mark as Read" and "Delete" buttons on each card

### When Selection Mode is ON:

- Checkboxes appear at the left of each notification card
- Selected cards have blue border highlight
- Top action bar changes to show:
  - Selection count (e.g., "2 selected")
  - "Select All" button (if not all are selected)
  - "Clear" button (if any are selected)
  - "Delete (X)" button showing count of selected items
  - "Cancel" button with X icon to exit selection mode
- Individual action buttons are hidden on notification cards

### Color Coding:

- **Selected cards**: Blue border (`ring-blue-500`)
- **Unread cards**: Red border (`ring-red-100`)
- **Action buttons**: Red theme for primary actions
- **Selection controls**: Blue theme for selection-related actions
- **Cancel/Clear**: Gray theme for neutral actions

### Responsive Design:

- Buttons wrap on smaller screens
- Selection info shows clearly on all screen sizes
- Maintains accessibility with proper focus states
