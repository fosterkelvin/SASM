# HR Requirements Management - Visual Guide

## 🎨 UI Components Overview

### 1. Statistics Dashboard (Top Section)

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 STATISTICS CARDS (3 Cards in a Row)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ 📄 Total         │  │ ✅ Complete      │  │ ⏰ Pending    │  │
│  │ Submissions      │  │                  │  │ Review        │  │
│  │                  │  │                  │  │               │  │
│  │    25            │  │     18           │  │     7         │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│   Blue Border           Green Border          Amber Border      │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Search & Filter Toolbar

```
┌─────────────────────────────────────────────────────────────────┐
│  🔍 SEARCH TOOLBAR                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────┐  ┌──────────┐  │
│  │ 🔍 Search by name, student number...        │  │ 🔄 Refresh│  │
│  └─────────────────────────────────────────────┘  └──────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Requirements Table

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📋 REQUIREMENTS TABLE                                                    │
├────────────┬───────────┬──────────┬──────────────┬──────────┬──────────┤
│ Applicant  │ Student # │ Documents│ Submitted    │ Status   │ Actions  │
├────────────┼───────────┼──────────┼──────────────┼──────────┼──────────┤
│ Juan Dela  │ 2021-1234 │ 📄 5 items│ Oct 24, 2025│ ✅ Complete│ [View   │
│ Cruz       │           │          │ 10:30 AM     │          │ Details] │
│ juan@...   │           │          │              │          │          │
├────────────┼───────────┼──────────┼──────────────┼──────────┼──────────┤
│ Maria      │ 2021-5678 │ 📄 3 items│ Oct 23, 2025│ ⏰ Incomplete│[View   │
│ Santos     │           │          │ 2:15 PM      │          │ Details] │
│ maria@...  │           │          │              │          │          │
└────────────┴───────────┴──────────┴──────────────┴──────────┴──────────┘
```

### 4. View Submission Modal (When clicking "View Details")

```
┌───────────────────────────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════════════════════════╗  │
│  ║ 📄 Requirements Submission                           ❌   ║  │
│  ║    View submitted documents                                ║  │
│  ╚═══════════════════════════════════════════════════════════╝  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ✅ Applicant Information                                │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ Full Name: Juan Dela Cruz                               │    │
│  │ Student Number: 2021-1234                               │    │
│  │ Email: juan.delacruz@example.com                        │    │
│  │ Submitted On: Oct 24, 2025, 10:30 AM                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 📄 Submitted Documents (5)                              │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │                                                          │    │
│  │  ┌────┐  Letter of Application                          │    │
│  │  │📄 │  application-letter.pdf                          │    │
│  │  │PDF │  application/pdf • 245 KB                       │    │
│  │  └────┘  [🔗 Open] [⬇️ Download]                        │    │
│  │                                                          │    │
│  │  ┌────┐  Resume/Curriculum Vitae                        │    │
│  │  │📄 │  resume.pdf                                      │    │
│  │  │PDF │  application/pdf • 512 KB                       │    │
│  │  └────┘  [🔗 Open] [⬇️ Download]                        │    │
│  │                                                          │    │
│  │  ┌────┐  Photocopy of Recent Grades                     │    │
│  │  │🖼️ │  grades.jpg                                      │    │
│  │  │JPG │  image/jpeg • 1.2 MB                            │    │
│  │  └────┘  [🔗 Open] [⬇️ Download]                        │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                           [Close]        │    │
│  └─────────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────────┘
```

## 🎨 Color Palette

### Light Mode

- **Background**: White (#FFFFFF) with red gradient accents
- **Primary**: Red (#DC2626)
- **Text**: Gray (#374151)
- **Borders**: Light Gray (#E5E7EB)

### Dark Mode

- **Background**: Dark Gray (#1F2937) with red accents
- **Primary**: Red (#DC2626)
- **Text**: Light Gray (#F3F4F6)
- **Borders**: Dark Gray (#4B5563)

## 📊 Status Badges

### Complete ✅

```
┌──────────────┐
│ ✅ Complete  │ Green background, green text
└──────────────┘
```

### Incomplete ⏰

```
┌──────────────┐
│ ⏰ Incomplete│ Amber background, amber text
└──────────────┘
```

## 🔄 Loading States

### Loading Spinner

```
┌─────────────────────────────┐
│                             │
│      ⟳  (Animated)          │
│                             │
│  Loading requirements...    │
│                             │
└─────────────────────────────┘
```

### Error State

```
┌─────────────────────────────────────┐
│ ⚠️ Error Loading Requirements       │
│                                     │
│ Failed to fetch requirements        │
│                                     │
│ [Try Again]                         │
└─────────────────────────────────────┘
```

### Empty State

```
┌─────────────────────────────────────┐
│                                     │
│          📄                         │
│                                     │
│   No Requirements Found             │
│                                     │
│   No applicants have submitted      │
│   requirements yet.                 │
│                                     │
└─────────────────────────────────────┘
```

## 💡 Interactive Elements

### Hover Effects

- **Table Rows**: Light gray background on hover
- **Buttons**: Darker shade on hover
- **Cards**: Shadow increase on hover

### Buttons

```
Primary Button (Red):
┌──────────────┐
│ View Details │ Red background, white text
└──────────────┘

Secondary Button (Gray):
┌──────────┐
│  Close   │ Gray background, white text
└──────────┘

Icon Button (Blue):
┌────────┐
│ 🔗 Open │ Blue background, white text
└────────┘

Icon Button (Gray):
┌────────────┐
│ ⬇️ Download│ Gray background, white text
└────────────┘
```

## 📱 Responsive Behavior

### Desktop (> 768px)

- 3-column statistics cards
- Full table with all columns
- Side-by-side search and refresh button

### Tablet (768px - 1024px)

- 2-column statistics cards
- Scrollable table
- Stacked search and button

### Mobile (< 768px)

- Single column statistics cards
- Scrollable table
- Full-width search and button

## 🎯 Key Features Visualization

### 1. Real-Time Data

```
Database → API → Frontend → Display
   ↓                          ↑
   └──────── Auto Refresh ────┘
```

### 2. Document Flow

```
Student Uploads → Database → HR Views → Actions
                                      ├─ Open
                                      └─ Download
```

### 3. Search Flow

```
Search Input → Filter Logic → Filtered Results
    ↓              ↓               ↓
  Name         Multiple          Display
  Email        Fields            Matches
  Student #    Checked
  Documents
```

---

**This visual guide helps understand the layout and interaction patterns of the improved HR Requirements Management page.**
