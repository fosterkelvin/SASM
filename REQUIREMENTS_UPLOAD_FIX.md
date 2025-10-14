# Requirements Upload System - Complete Rebuild

## Problem
The original requirements upload system had a complex file mapping system that was causing:
1. Files being saved to wrong requirement items
2. Items array being reduced when replacing files
3. Resubmit failures

## Solution
Complete rebuild with a simplified, straightforward approach.

---

## New Backend Implementation

### Key Changes ([requirements.controller.ts](backend/src/controllers/requirements.controller.ts))

**Simplified to 4 functions:**
1. `createRequirementsSubmission` - Handles both initial submission and resubmit
2. `getUserRequirementsSubmissions` - Get all user submissions
3. `deleteRequirementFile` - Delete a specific file
4. `getCurrentRequirementsStatus` - Get current submission status

**How it works:**

```typescript
// 1. Parse itemsJson from frontend (contains all 6 items with current state)
let itemsJson: any[] = [];

// 2. Loop through all items by index (0-5)
for (let idx = 0; idx < itemsJson.length; idx++) {
  const expectedFieldname = `file_item_${idx}`;
  const uploadedFile = files.find(f => f.fieldname === expectedFieldname);

  if (uploadedFile) {
    // New file uploaded - use it
    processedItems.push({ ...uploadedFile data... });
  } else if (jsonItem.file && jsonItem.file.url) {
    // No new upload - preserve existing file
    processedItems.push({ ...existing file data... });
  }
}

// 3. For resubmit: Replace entire items array
if (existingSubmission && isResubmit) {
  existingSubmission.items = processedItems;
  await existingSubmission.save();
}
```

---

## Frontend Implementation

### Key Logic ([Requirements.tsx](frontend/src/pages/Roles/Student/Requirements/Requirements.tsx))

**File Upload:**
```typescript
// Store files by item ID in ref
filesRef.current[itemId] = file;

// On submit, map files to their correct indices
items.forEach((it, idx) => {
  form.append(`items[${idx}][label]`, it.text);
  form.append(`items[${idx}][clientId]`, it.id);

  const f = filesRef.current[it.id];
  if (f) {
    form.append(`items[${idx}][hasFile]`, "1");
    form.append(`file_item_${idx}`, fileObject);  // ← Correct fieldname
  }
});

// Include full state in JSON
form.append("itemsJson", JSON.stringify(items));

// Auto-enable resubmit if already submitted
if (isSubmitted) {
  form.append("resubmit", "true");
}
```

---

## How It Works Now

### Initial Submission (All 6 Files)
1. User uploads files to all 6 requirement items
2. Frontend sends:
   - 6 files with fieldnames `file_item_0` through `file_item_5`
   - `itemsJson` with all 6 items' metadata
3. Backend processes each file by index and creates submission with 6 items
4. All files saved correctly at their respective indices

### Resubmit (Replace One File)
1. User uploads new file to one item (e.g., index 2 "Photocopy of Recent Grades")
2. Frontend sends:
   - 1 file with fieldname `file_item_2`
   - `itemsJson` with all 6 items (including existing files)
   - `resubmit=true`
3. Backend processes:
   - Index 0, 1, 3, 4, 5: Preserves existing files from `itemsJson`
   - Index 2: Uses new uploaded file
4. Replaces entire items array (6 items) with new file at index 2
5. Deletes old cloudinary file at index 2

---

## Testing

### 1. Initial Submission
```bash
# Test uploading all 6 files
# Expected: All 6 files saved at correct indices
# Check database: items array should have 6 entries
```

### 2. Resubmit
```bash
# Upload new file to index 2
# Expected:
# - Items array still has 6 entries
# - Index 2 has new file
# - All other indices unchanged
```

### 3. Debug Logs
**Backend console:**
```
[requirements] Processing submission: { filesCount, itemsCount, fileFieldnames }
[requirements] New upload at index 2: { label, fieldname, filename }
[requirements] Preserving existing file at index 0: { label, url }
[requirements] Processed items count: 6
[requirements] Resubmit successful
```

**Browser console:**
```
[requirements] filesRef.current: [{ itemId, hasFile, fileName }]
[requirements] items order: [{ idx, id, text }]
[requirements] appending file for item 2: fieldname=file_item_2, filename=...
```

---

## Key Improvements

1. **Simple & Clear**: Straightforward index-based mapping
2. **Preserves Order**: Items array always maintains correct size and order
3. **No Merge Complexity**: Direct array replacement on resubmit
4. **Better Logging**: Clear debug output at each step
5. **Removed Unused Code**: Eliminated draft system, item replacement endpoint

---

## Files Modified

### Backend
- `backend/src/controllers/requirements.controller.ts` - Complete rewrite
- `backend/src/routes/requirements.route.ts` - Removed unused endpoints
- `backend/src/controllers/requirements.controller.backup.ts` - Backup of old version

### Frontend
- `frontend/src/pages/Roles/Student/Requirements/Requirements.tsx` - Auto-resubmit logic

---

## Migration Notes

**Old submissions** with files uploaded using the old system will still work because:
1. The new code reads `itemsJson` which contains all existing files
2. On resubmit, it preserves any existing files from `itemsJson`
3. File URLs remain valid in Cloudinary

**No database migration needed** - The items array structure remains the same.

---

## Troubleshooting

### Issue: "Failed to submit requirements"
**Check:** Backend logs for `[requirements]` messages
**Common causes:**
- `itemsJson` not being sent
- File fieldnames don't match `file_item_${idx}` pattern

### Issue: Files going to wrong items
**Check:** Frontend console logs
**Look for:** Mismatch between item index and file fieldname

### Issue: Items array reduced
**Check:** Backend logs for "Processed items count"
**Should be:** 6 (or total number of required items)
**If less:** Some items not being preserved from `itemsJson`

---

## Future Improvements

1. Add retry logic for Cloudinary uploads
2. Implement progress tracking for large files
3. Add file type validation on backend
4. Create admin endpoint to view all submissions
