# Scholar Masterlist PDF - Visual Guide

## PDF Preview Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                              Page 1 of 2     │
│  Scholar Masterlist Report                                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  Summary Statistics                                                         │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│  │ Total Scholars  │  │ Male Students   │  │ Female Students │           │
│  │      45         │  │      28         │  │      17         │           │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘           │
│                                                                             │
│  ───────────────────────────────────────────────────────────────────────   │
│                                                                             │
│  Scholar Details                                                            │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │ Student Name │ Email          │ Dept │ Role │ Status │ Schedule... │   │
│  ├────────────────────────────────────────────────────────────────────┤   │
│  │ Juan Dela    │ juan@ub.edu.ph │ OSAS │  SA  │ Active │ Mon: 8-12.. │   │
│  │ Cruz         │                │      │      │        │             │   │
│  ├────────────────────────────────────────────────────────────────────┤   │
│  │ Maria Santos │ maria@ub...    │ OSA  │  SM  │ Active │ Tue: 1-5... │   │
│  ├────────────────────────────────────────────────────────────────────┤   │
│  │ Pedro Garcia │ pedro@ub...    │ OSAS │  SA  │ On     │ Wed: 9-3... │   │
│  │              │                │      │      │ leave  │             │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                     Generated on November 26, 2025                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Complete Table Columns

The PDF table includes the following columns (in landscape A4):

| #   | Column Name   | Width | Content Example                    | Alignment |
| --- | ------------- | ----- | ---------------------------------- | --------- |
| 1   | Student Name  | Auto  | "Juan Dela Cruz"                   | Left      |
| 2   | Email         | Auto  | "juan.delacruz@ub.edu.ph"          | Left      |
| 3   | Department    | Auto  | "OSAS", "OSA", "Library"           | Left      |
| 4   | Role          | 30px  | "SA", "SM"                         | Center    |
| 5   | Status        | Auto  | "Active", "Graduating", "Resigned" | Left      |
| 6   | Duty Schedule | Flex  | "Mon: 8:00-12:00, Tue: 1:00-5:00"  | Left      |
| 7   | Hours         | 40px  | "120.5"                            | Right     |
| 8   | Eval Score    | 50px  | "4.75", "N/A"                      | Center    |

## Color Scheme

### Summary Cards:

- **Total Count**: Blue (#2563eb)
- **Male Count**: Cyan (#0891b2)
- **Female Count**: Pink (#ec4899)

### Table:

- **Header Row**: Light gray background (#f3f4f6)
- **Even Rows**: Very light gray (#fafafa)
- **Odd Rows**: White
- **Border**: Light gray (#e5e7eb)

## Typography

- **Header**: 18pt, Bold
- **Subheader**: 14pt, Bold
- **Summary Numbers**: 24pt, Bold
- **Summary Labels**: 11pt, Bold
- **Table Header**: 9pt, Bold
- **Table Cells**: 9pt, Regular
- **Footer**: 9pt, Regular, Gray

## Button Location

```
┌──────────────────────────────────────────────────────────────┐
│ Scholar Management                                           │
│                                                              │
│  [📥 Generate Masterlist PDF]  [🔄 End Semester]            │
└──────────────────────────────────────────────────────────────┘
```

## User Flow

1. **Click Button**

   ```
   User clicks "Generate Masterlist PDF" button
            ↓
   ```

2. **Loading Alert**

   ```
   Alert shows: "Generating... Fetching masterlist data..."
            ↓
   ```

3. **Fetch Data**

   ```
   Backend aggregates data from:
   - Scholars collection
   - Users collection
   - Userdata collection
   - Schedules collection
   - DTR collection
   - Evaluations collection
            ↓
   ```

4. **Generate PDF**

   ```
   Frontend generates PDF using pdfmake
   with formatted data and styling
            ↓
   ```

5. **Download**

   ```
   Browser automatically downloads file:
   "Scholar_Masterlist_November_26_2025.pdf"
            ↓
   ```

6. **Success Alert**
   ```
   Alert shows: "Success! Masterlist PDF generated successfully!"
   ```

## Sample Data Display

### Student with Full Data:

```
Name:  Juan Dela Cruz
Email: juan.delacruz@ub.edu.ph
Dept:  OSAS
Role:  SA
Status: Active
Schedule: Monday: 08:00-12:00 @ Main Office,
          Wednesday: 13:00-17:00 @ Front Desk
Hours: 156.5
Score: 4.75
```

### Student with Partial Data:

```
Name:  Maria Santos
Email: maria.santos@ub.edu.ph
Dept:  OSA
Role:  SM
Status: Graduating
Schedule: No schedule assigned
Hours: 0
Score: N/A
```

## Error Scenarios

### Backend Errors:

- No scholars found → Empty table with summary showing 0
- Database connection error → Error alert displayed
- Invalid data → Handled gracefully with "N/A"

### Frontend Errors:

- PDF generation fails → Error alert with message
- Network error → Error alert with retry option

## Mobile Responsiveness

The button adapts on smaller screens:

- Desktop: Full text "Generate Masterlist PDF"
- Mobile: Icon only or abbreviated text

## Performance Notes

- Generation time: ~2-5 seconds for 50 scholars
- PDF size: ~100-200 KB for typical dataset
- No pagination needed (pdfMake handles multi-page)
- Client-side generation (no server load for PDF creation)
