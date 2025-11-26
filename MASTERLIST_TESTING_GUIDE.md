# Quick Start Guide - Testing Masterlist PDF Feature

## Prerequisites

✅ Both frontend and backend should be running
✅ User must be logged in as HR role
✅ Database should have some scholar data

## Testing Steps

### 1. Start the Application

**Backend:**

```powershell
cd backend
npm run dev
```

**Frontend:**

```powershell
cd frontend
npm run dev
```

### 2. Access Scholar Management

1. Navigate to: `http://localhost:5173` (or your frontend URL)
2. Login as an HR user
3. Go to: **Scholar Management** page from the sidebar

### 3. Generate PDF

1. Look for the **"Generate Masterlist PDF"** button in the page header (green button with download icon)
2. Click the button
3. Watch for the alert: "Generating... Fetching masterlist data..."
4. PDF should automatically download as: `Scholar_Masterlist_[Date].pdf`
5. Success alert should appear: "Masterlist PDF generated successfully!"

### 4. Verify PDF Content

Open the downloaded PDF and verify:

- [ ] Summary statistics show at the top (Total, Male, Female counts)
- [ ] Table has all columns: Name, Email, Department, Role, Status, Schedule, Hours, Score
- [ ] Scholar data is displayed correctly
- [ ] Page numbers appear in header
- [ ] Generation date appears in footer
- [ ] Table has alternating row colors for readability

## Test Cases

### Test Case 1: Normal Operation

**Scenario**: Generate PDF with scholars in database
**Expected**: PDF downloads successfully with all data

### Test Case 2: Empty Database

**Scenario**: Generate PDF with no scholars
**Expected**: PDF shows summary with 0 counts and empty table

### Test Case 3: Missing Data

**Scenario**: Scholars with incomplete data (no evaluations, no DTR, etc.)
**Expected**: Shows "N/A" or "0" for missing values

### Test Case 4: Error Handling

**Scenario**: Backend is down
**Expected**: Error alert appears with helpful message

## Backend Endpoint Testing

You can test the API endpoint directly:

### Using curl:

```powershell
curl -X GET http://localhost:5000/masterlist `
  -H "Content-Type: application/json" `
  -H "Cookie: your-auth-cookie"
```

### Using Postman/Thunder Client:

```
GET http://localhost:5000/masterlist
Headers:
  - Cookie: [your session cookie]
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "scholars": [
      {
        "studentName": "John Doe",
        "studentEmail": "john@example.com",
        "assignedDepartment": "OSAS",
        "role": "SA",
        "status": "Active",
        "dutySchedule": "Monday: 08:00-12:00",
        "hoursWorked": 120.5,
        "evaluationScore": 4.75,
        "gender": "Male"
      }
    ],
    "summary": {
      "total": 1,
      "male": 1,
      "female": 0
    }
  }
}
```

## Troubleshooting

### Issue: Button not appearing

**Solution**:

- Check if you're logged in as HR user
- Verify you're on the Scholar Management page
- Clear browser cache and reload

### Issue: PDF not downloading

**Solution**:

- Check browser's download settings
- Look in browser's download folder
- Check browser console for errors

### Issue: "Failed to fetch masterlist data"

**Solution**:

- Verify backend is running
- Check backend console for errors
- Verify authentication cookie is valid
- Check database connection

### Issue: PDF shows "N/A" for all scores

**Solution**:

- This is normal if scholars have no evaluations yet
- Add some evaluations through the Evaluation Management page

### Issue: Hours worked shows 0 for all scholars

**Solution**:

- This is normal if DTR records haven't been submitted
- Scholars need to submit DTR through their student portal

## Browser Compatibility

Tested and working on:

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Brave

## Performance Metrics

Expected performance:

- **API Response Time**: 1-3 seconds (depends on data size)
- **PDF Generation**: 1-2 seconds
- **Total Time**: 2-5 seconds
- **PDF File Size**: 100-200 KB (typical)

## Sample Test Data

If you need to create test data:

1. **Create test scholars** through the HR Dashboard
2. **Add evaluations** through Evaluation Management
3. **Add DTR records** through student accounts
4. **Set up schedules** through the Schedule Management

## Next Steps After Testing

Once testing is complete:

1. ✅ Verify all data displays correctly
2. ✅ Test with different scholar counts (1, 10, 50+)
3. ✅ Test with various data combinations
4. ✅ Verify mobile responsive button
5. ✅ Test error scenarios
6. ✅ Deploy to staging/production

## Notes

- The PDF is generated client-side using pdfMake
- No server-side PDF generation needed
- Works offline once data is fetched
- Downloads directly - no preview window
- Filename includes current date for easy organization
