# Quick Reference: DTR Schedule Sync

## What It Does

Automatically calculates if a student is **late** or **undertime** based on their class schedule and duty hours.

## How to Use

### For Students

1. Upload your class schedule (PDF)
2. Wait for office staff to assign duty hours
3. Enter your time in/out in DTR
4. **Late and undertime are calculated automatically!**

### For Office Staff

1. Assign duty hours to students
2. When checking DTR entries, late/undertime values are already calculated
3. Can edit DTR entries - late/undertime recalculate automatically

### For Developers

**Check schedule for a date:**

```typescript
import { getScheduleForDate } from "@/lib/api";

const schedule = await getScheduleForDate(2024, 11, 15);
// Returns schedule with all classes and duty hours for that day
```

**Update DTR entry (auto-calculates late/undertime):**

```typescript
await DTRService.updateDTREntry(dtrId, day, {
  in1: "07:15",
  out1: "12:00",
  in2: "13:00",
  out2: "16:00",
});
// late and undertime are calculated and saved automatically
```

## Key Files

| File                                        | Purpose                      |
| ------------------------------------------- | ---------------------------- |
| `backend/src/utils/scheduleSync.ts`         | Core calculation logic       |
| `backend/src/services/dtr.service.ts`       | Integration with DTR updates |
| `backend/src/controllers/dtr.controller.ts` | New schedule endpoint        |
| `backend/src/routes/dtr.route.ts`           | Route configuration          |
| `frontend/src/lib/api.ts`                   | Frontend API function        |

## Calculations

```
Late = max(0, actualIn - scheduledStart)
Undertime = max(0, scheduledEnd - actualOut)
```

**Example:**

- Schedule: 7:00 AM - 5:00 PM
- Actual: 7:15 AM - 4:00 PM
- Result: Late = 15 mins, Undertime = 60 mins

## API Endpoint

```http
GET /api/dtr/schedule/:year/:month/:day
Authorization: Bearer {token}
```

**Response:**

```json
{
  "dayName": "Monday",
  "schedule": [
    {
      "startTime": "07:00",
      "endTime": "10:00",
      "type": "class",
      "description": "CS101 - Programming"
    },
    {
      "startTime": "14:00",
      "endTime": "17:00",
      "type": "duty",
      "description": "Duty at Main Office"
    }
  ]
}
```

## Troubleshooting

| Issue                   | Solution                                                       |
| ----------------------- | -------------------------------------------------------------- |
| Late/undertime always 0 | Check if student has schedule uploaded and duty hours assigned |
| Wrong calculations      | Verify schedule format (MW 7:00-8:30 AM)                       |
| API returns empty       | Student not in trainee status or no schedule data              |

## Status Indicators

- ✅ **Implemented and Active**
- 🔄 **Automatic** - No manual intervention needed
- 📊 **Accurate** - Based on actual schedule data
- 🎯 **Fair** - Same logic for all students
