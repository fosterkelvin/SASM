# DTR Schedule Sync - Visual Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         STUDENT                                  │
├─────────────────────────────────────────────────────────────────┤
│  1. Uploads Class Schedule PDF                                   │
│  2. Enters DTR Time In/Out                                       │
│     ┌─────────────┐                                             │
│     │  DTR Entry  │                                             │
│     ├─────────────┤                                             │
│     │ Day: 15     │                                             │
│     │ in1: 07:15  │ ◄─── Student enters these                  │
│     │ out1: 12:00 │                                             │
│     │ in2: 13:00  │                                             │
│     │ out2: 16:00 │                                             │
│     │ late: ???   │ ◄─── System calculates                     │
│     │ undertime: ?│                                             │
│     └─────────────┘                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND PROCESSING                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 1: DTR Service receives update request                    │
│  ┌────────────────────────────────────┐                        │
│  │  DTRService.updateDTREntry()       │                        │
│  │  - dtrId, day, entryData           │                        │
│  └────────────────────────────────────┘                        │
│                   │                                              │
│                   ▼                                              │
│  Step 2: Call Schedule Sync                                     │
│  ┌────────────────────────────────────┐                        │
│  │  syncDTRWithSchedule()             │                        │
│  │  - userId, day, month, year        │                        │
│  │  - in1, out1, in2, out2            │                        │
│  └────────────────────────────────────┘                        │
│                   │                                              │
│       ┌───────────┴───────────┐                                 │
│       ▼                       ▼                                 │
│  ┌──────────┐          ┌──────────┐                            │
│  │ Fetch    │          │ Fetch    │                            │
│  │ Class    │          │ Duty     │                            │
│  │ Schedule │          │ Hours    │                            │
│  └──────────┘          └──────────┘                            │
│       │                       │                                 │
│       └───────────┬───────────┘                                 │
│                   ▼                                              │
│  Step 3: Build Schedule Map                                     │
│  ┌────────────────────────────────────┐                        │
│  │  buildScheduleMap()                │                        │
│  │                                    │                        │
│  │  Monday: [                         │                        │
│  │    {start: 07:00, end: 10:00,     │                        │
│  │     type: "class"}                 │                        │
│  │    {start: 14:00, end: 17:00,     │                        │
│  │     type: "duty"}                  │                        │
│  │  ]                                 │                        │
│  └────────────────────────────────────┘                        │
│                   │                                              │
│                   ▼                                              │
│  Step 4: Calculate Late & Undertime                             │
│  ┌────────────────────────────────────┐                        │
│  │  calculateLateAndUndertime()       │                        │
│  │                                    │                        │
│  │  Expected: 07:00 - 17:00          │                        │
│  │  Actual:   07:15 - 16:00          │                        │
│  │                                    │                        │
│  │  Late = 07:15 - 07:00 = 15 mins   │                        │
│  │  Undertime = 17:00 - 16:00 = 60   │                        │
│  └────────────────────────────────────┘                        │
│                   │                                              │
│                   ▼                                              │
│  Step 5: Save to Database                                       │
│  ┌────────────────────────────────────┐                        │
│  │  DTR Entry (saved)                 │                        │
│  ├────────────────────────────────────┤                        │
│  │ Day: 15                            │                        │
│  │ in1: 07:15                         │                        │
│  │ out1: 12:00                        │                        │
│  │ in2: 13:00                         │                        │
│  │ out2: 16:00                        │                        │
│  │ late: 15          ◄── Calculated!  │                        │
│  │ undertime: 60     ◄── Calculated!  │                        │
│  └────────────────────────────────────┘                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RESPONSE TO FRONTEND                          │
├─────────────────────────────────────────────────────────────────┤
│  DTR with calculated late/undertime values                      │
│  Student/Office can see the results immediately                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Detail

### Input Data

```
Student's Schedule:
┌─────────────────────────────────────┐
│ Class Schedule (from PDF):          │
│ • MW 7:00-10:00 AM - CS101          │
│ • TTh 2:00-4:00 PM - MATH201        │
│ • F 9:00-12:00 PM - ENG101          │
├─────────────────────────────────────┤
│ Duty Hours (from Office):           │
│ • Monday: 2:00 PM - 5:00 PM         │
│ • Wednesday: 2:00 PM - 5:00 PM      │
│ • Friday: 1:00 PM - 5:00 PM         │
└─────────────────────────────────────┘
```

### Processing

```
For Monday (Day 15):

1. Parse Schedule:
   ┌─────────────────────────┐
   │ 07:00-10:00  Class      │
   │ 14:00-17:00  Duty       │
   └─────────────────────────┘

2. Determine Boundaries:
   Start: 07:00 (earliest)
   End:   17:00 (latest)

3. Compare with Actual:
   ┌──────────────┬──────────┬──────────┐
   │              │ Expected │ Actual   │
   ├──────────────┼──────────┼──────────┤
   │ Start Time   │ 07:00    │ 07:15    │
   │ End Time     │ 17:00    │ 16:00    │
   ├──────────────┼──────────┼──────────┤
   │ Late         │ -        │ 15 mins  │
   │ Undertime    │ -        │ 60 mins  │
   └──────────────┴──────────┴──────────┘
```

### Output

```json
{
  "late": 15,
  "undertime": 60,
  "scheduledStartTime": "07:00",
  "scheduledEndTime": "17:00"
}
```

## Edge Cases Handled

### Case 1: No Schedule

```
Input: DTR entry, but no schedule uploaded
Output: late = 0, undertime = 0
Reason: Can't calculate without reference
```

### Case 2: Partial Entry

```
Input: Only in1 provided, no out times
Output: late = calculated, undertime = 0
Reason: Can't determine undertime without out time
```

### Case 3: No Class That Day

```
Input: DTR entry for Sunday, no classes
Output: late = 0, undertime = 0
Reason: No scheduled time to compare against
```

### Case 4: Early Arrival

```
Input: Arrived at 6:45, scheduled 7:00
Output: late = 0
Reason: Early arrival is not late!
```

### Case 5: Stayed Late

```
Input: Left at 5:30, scheduled until 5:00
Output: undertime = 0
Reason: Staying late is not undertime!
```

## Integration Points

```
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION DATA                         │
├─────────────────────────────────────────────────────────────┤
│  Student's trainee record contains:                         │
│  • classScheduleData (from PDF upload)                      │
│  • dutyHours (from office assignment)                       │
│                                                              │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────┐                   │
│  │   Schedule Sync Utility             │                   │
│  │   (scheduleSync.ts)                 │                   │
│  │                                     │                   │
│  │   • Parse schedule strings          │                   │
│  │   • Build day-by-day map            │                   │
│  │   • Calculate late/undertime        │                   │
│  └─────────────────────────────────────┘                   │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────┐                   │
│  │   DTR Service                       │                   │
│  │   (dtr.service.ts)                  │                   │
│  │                                     │                   │
│  │   • Calls schedule sync             │                   │
│  │   • Merges results into entry       │                   │
│  │   • Saves to database               │                   │
│  └─────────────────────────────────────┘                   │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────┐                   │
│  │   DTR Model                         │                   │
│  │   (dtr.model.ts)                    │                   │
│  │                                     │                   │
│  │   • Stores late/undertime values    │                   │
│  │   • Used for reports and display    │                   │
│  └─────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

## Timeline

```
┌────────────────────────────────────────────────────────────────┐
│ Student Workflow                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. Student uploads schedule      [Student Action]              │
│    ↓                                                            │
│ 2. Office assigns duty hours     [Office Action]               │
│    ↓                                                            │
│ 3. Student enters DTR times      [Student Action]              │
│    ↓                                                            │
│ 4. System calculates late/under  [AUTOMATIC]                   │
│    ↓                                                            │
│ 5. Results saved & displayed     [AUTOMATIC]                   │
│    ↓                                                            │
│ 6. Office reviews DTR            [Office Action]               │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

## Visual Calculation Example

```
Monday Schedule:
07:00 ═══════════════════════════════════════ 17:00
│                                                 │
│  Classes: 07:00-10:00                          │
│  Lunch Break: 10:00-14:00                      │
│  Duty: 14:00-17:00                             │
│                                                 │
└─────────────────────────────────────────────────┘

Actual Attendance:
07:15 ═══════════════════════════════════ 16:00
│                                            │
│  ◄── 15 min LATE                          │
│                             60 min EARLY ──►│
│                                            │
└────────────────────────────────────────────┘

Result: Late = 15 minutes, Undertime = 60 minutes
```
