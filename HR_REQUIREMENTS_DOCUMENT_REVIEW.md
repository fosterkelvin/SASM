# Individual Document Review System - Complete Guide

## 🎯 Overview

The HR Requirements Management system now supports **granular document-level reviews**. HR can approve or reject **individual documents** within a submission, allowing applicants to fix only problematic documents instead of resubmitting everything.

---

## ✨ New Features

### 1. **Document-Level Status Tracking**

Each document now has its own review status:

- **⏰ Pending** (Amber) - Not yet reviewed
- **✅ Approved** (Green) - Approved by HR
- **❌ Rejected** (Red) - Needs resubmission with specific reason

### 2. **Individual Approve/Reject Buttons**

In the View Details modal, each document has:

- **Approve** button (Green) - Approve this specific document
- **Reject** button (Red) - Reject with specific reason
- Status badge showing current review state

### 3. **Rejection Reasons**

When rejecting a document, HR can:

- Enter a specific reason (required)
- Reason is displayed under the document
- Applicant receives detailed notification

### 4. **Automatic Submission Status Updates**

- If **all documents approved** → Submission status: **Approved** ✅
- If **any document rejected** → Submission status: **Pending** ⏰
- Smart logic prevents submission approval until all docs are approved

### 5. **Targeted Notifications**

Students receive specific notifications:

- "Document Approved: Letter of Application" ✅
- "Document Rejected: Resume/CV - Reason: Missing signature" ❌
- Clear indication of which document needs attention

---

## 🗄️ Database Schema Updates

### RequirementsFile Interface (Updated)

```typescript
interface RequirementsFile {
  label: string;
  url: string;
  publicId?: string;
  originalName?: string;
  mimetype?: string;
  size?: number;

  // NEW: Document-level review fields
  documentStatus?: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  reviewedByHR?: ObjectId;
  reviewedAt?: Date;
}
```

### Default Values

- New documents: `documentStatus = "pending"`
- All existing documents: Will default to "pending" until reviewed

---

## 🔄 Workflows

### Scenario 1: Approve All Documents One by One

```
1. HR opens submission
2. Reviews first document → Clicks "Approve" ✅
   - Document status: Approved
   - Notification sent to student
3. Reviews second document → Clicks "Approve" ✅
4. Reviews all documents...
5. When ALL approved:
   - Submission status automatically changes to "Approved" ✅
```

### Scenario 2: Reject Specific Document

```
1. HR opens submission
2. Reviews "Resume/CV"
3. Finds issue (e.g., missing signature)
4. Clicks "Reject" on that document ❌
5. Enters reason: "Missing signature on page 2"
6. Document status: Rejected ❌
7. Student receives notification:
   "Document Rejected: Resume/CV"
   "Reason: Missing signature on page 2"
8. Other documents remain unaffected
9. Submission status: Pending (has rejected document)
```

### Scenario 3: Mixed Review Status

```
Documents Status:
- Letter of Application: ✅ Approved
- Resume/CV: ❌ Rejected (Missing signature)
- Grades: ✅ Approved
- Birth Certificate: ⏰ Pending
- Good Moral: ✅ Approved

Result:
- Submission Status: ⏰ Pending
- Student can see which documents need action
- Student only resubmits "Resume/CV"
```

---

## 🎨 UI Components

### Document Card with Status Badge

```
┌─────────────────────────────────────────────────────────────┐
│ 📄 [PDF]                                                    │
│                                                             │
│ Letter of Application          [✅ Approved]               │
│ application-letter.pdf                                      │
│ application/pdf • 245 KB                                    │
│                                                             │
│ [🔗 Open] [⬇️ Download] [✅ Approve] [❌ Reject]           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 📄 [PDF]                                                    │
│                                                             │
│ Resume/Curriculum Vitae        [❌ Rejected]               │
│ resume.pdf                                                  │
│ application/pdf • 512 KB                                    │
│                                                             │
│ ⚠️ Rejection Reason:                                        │
│ Missing signature on page 2                                 │
│                                                             │
│ [🔗 Open] [⬇️ Download] [✅ Approve]                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🖼️ [JPG]                                                    │
│                                                             │
│ Photocopy of Grades            [⏰ Pending]                 │
│ grades.jpg                                                  │
│ image/jpeg • 1.2 MB                                         │
│                                                             │
│ [🔗 Open] [⬇️ Download] [✅ Approve] [❌ Reject]           │
└─────────────────────────────────────────────────────────────┘
```

### Rejection Reason Display

```
┌─────────────────────────────────────────────────┐
│ ⚠️ Rejection Reason:                            │
│ ─────────────────────────────────────────────  │
│ Missing signature on page 2. Please sign and   │
│ resubmit with a clear copy.                    │
└─────────────────────────────────────────────────┘
```

---

## 🔧 API Endpoints

### Review Individual Document

```http
PATCH /requirements/review-document
Authorization: Required (HR role)
Content-Type: application/json

Request Body:
{
  "submissionId": "67890abcdef...",
  "documentIndex": 1,  // Index of document in items array
  "documentStatus": "rejected",  // or "approved" or "pending"
  "rejectionReason": "Missing signature on page 2"  // Required if rejected
}

Response:
{
  "message": "Document rejected",
  "submission": {
    "_id": "...",
    "items": [
      {
        "label": "Resume/CV",
        "documentStatus": "rejected",
        "rejectionReason": "Missing signature on page 2",
        "reviewedByHR": "...",
        "reviewedAt": "2025-10-24T..."
      }
    ]
  }
}
```

---

## 🔔 Notification Examples

### Document Approved

```javascript
{
  title: "Document Approved: Letter of Application",
  message: "Your document 'Letter of Application' has been approved by HR.",
  type: "success"
}
```

### Document Rejected

```javascript
{
  title: "Document Rejected: Resume/Curriculum Vitae",
  message: "Your document 'Resume/Curriculum Vitae' needs attention. Reason: Missing signature on page 2",
  type: "error"
}
```

### All Documents Approved (Auto)

```javascript
{
  title: "Requirements Approved",
  message: "Congratulations! All your requirements have been approved by HR.",
  type: "success"
}
```

---

## 🎯 Button Logic

### Pending Document ⏰

Shows:

- **Approve** (Green) - Approve this document
- **Reject** (Red) - Reject with reason

### Approved Document ✅

Shows:

- **Reject** (Red) - Can re-reject if needed
- _(No Approve button - already approved)_

### Rejected Document ❌

Shows:

- **Approve** (Green) - Give second chance
- _(No Reject button - already rejected)_
- **Rejection reason displayed below**

---

## 📊 Smart Submission Status Logic

### Auto-Approval

```typescript
// When reviewing a document:
const allApproved = submission.items.every(
  (item) => item.documentStatus === "approved"
);

if (allApproved && submission.reviewStatus !== "approved") {
  submission.reviewStatus = "approved";
  // Send success notification to student
}
```

### Auto-Pending

```typescript
// When rejecting a document:
const anyRejected = submission.items.some(
  (item) => item.documentStatus === "rejected"
);

if (anyRejected && submission.reviewStatus === "approved") {
  submission.reviewStatus = "pending";
  // Reverts to pending if any document is rejected
}
```

---

## 🎬 Complete User Flow

### HR Reviewing Documents

```
1. Click "View" on a submission
2. Modal opens showing all documents
3. Review first document:
   a. Click "Open" to view file
   b. Decide: Approve or Reject

4. If Approve:
   - Click "Approve" button
   - Document badge turns green ✅
   - Button disappears
   - Student notified

5. If Reject:
   - Click "Reject" button
   - Prompt appears: "Why are you rejecting...?"
   - Enter reason: "Missing signature"
   - Document badge turns red ❌
   - Rejection reason displayed below document
   - Student notified with reason

6. Repeat for all documents
7. When all approved:
   - Submission automatically becomes "Approved"
   - Student receives final approval notification
```

### Student Receiving Notifications

```
1. Receives notification: "Document Rejected: Resume/CV"
2. Clicks notification → Opens requirements page
3. Sees document with rejection reason
4. Fixes issue (adds signature)
5. Resubmits only that document
6. HR reviews again
7. HR approves
8. Student receives: "Document Approved: Resume/CV"
9. When all docs approved → "Requirements Approved"
```

---

## 💡 Benefits

### For HR

✅ **Granular Control** - Review each document individually
✅ **Specific Feedback** - Provide exact reasons for rejection
✅ **Flexible Workflow** - Can review documents in any order
✅ **Clear Status** - Visual indicators for each document
✅ **Efficient Review** - Focus on problematic documents only

### For Students

✅ **Targeted Action** - Know exactly what needs fixing
✅ **Partial Progress** - Approved documents stay approved
✅ **Clear Reasons** - Understand why document was rejected
✅ **Faster Fixes** - Only resubmit problematic documents
✅ **Better Communication** - Specific notifications per document

---

## 🔄 Comparison

### Old System (Submission-Level Only)

```
❌ All or nothing - reject entire submission
❌ Student must resubmit ALL documents
❌ Generic rejection reasons
❌ Inefficient for small issues
❌ Approved documents need re-review
```

### New System (Document-Level) ✅

```
✅ Granular control - review each document
✅ Student resubmits only problematic docs
✅ Specific reasons per document
✅ Efficient targeted reviews
✅ Approved documents stay approved
```

---

## 📝 Example Scenarios

### Scenario A: Missing Signature

```
Problem: Resume missing signature on page 2

Old Way:
1. Reject entire submission
2. Reason: "Issues with resume"
3. Student resubmits ALL 6 documents
4. HR re-reviews ALL 6 documents

New Way:
1. Approve 5 documents
2. Reject only "Resume" with reason: "Missing signature on page 2"
3. Student fixes and resubmits ONLY resume
4. HR reviews ONLY that document
```

### Scenario B: Poor Quality Photo

```
Problem: Birth certificate photo is blurry

New Way:
1. HR reviews "Birth Certificate"
2. Clicks "Reject"
3. Enters: "Image is too blurry. Please take a clearer photo in good lighting"
4. Student receives specific notification
5. Student retakes photo and resubmits
6. HR approves on second review
7. Other 5 documents remain approved
```

---

## 🧪 Testing Checklist

### HR Testing

- [ ] Open submission details modal
- [ ] See status badge on each document
- [ ] Click "Approve" on a pending document
- [ ] Verify status changes to "Approved" ✅
- [ ] Verify button changes (no more approve button)
- [ ] Click "Reject" on a pending document
- [ ] Enter rejection reason in prompt
- [ ] Verify status changes to "Rejected" ❌
- [ ] Verify rejection reason displays under document
- [ ] Verify student receives notification
- [ ] Approve all documents one by one
- [ ] Verify submission status becomes "Approved"
- [ ] Reject one previously approved document
- [ ] Verify submission status reverts to "Pending"

### Student Testing

- [ ] Receive document rejection notification
- [ ] See which document was rejected
- [ ] Read rejection reason
- [ ] Fix the issue
- [ ] Resubmit only that document
- [ ] Receive document approval notification
- [ ] When all approved, receive submission approval

---

## 🚀 Future Enhancements

### Possible Additions

1. **Batch Document Review**

   - Select multiple documents
   - Approve/reject in bulk

2. **Document Comments**

   - Add notes to approved documents
   - "Approved with minor concerns"

3. **Version History**

   - Track document resubmissions
   - Show previous versions
   - Compare changes

4. **Review Templates**

   - Pre-defined rejection reasons
   - Quick select from dropdown
   - Common issues list

5. **Review Analytics**
   - Most rejected document types
   - Average review time per document
   - Common rejection reasons

---

## 📊 Statistics Impact

The statistics remain at **submission level**:

- **Total**: All submissions
- **Approved**: ALL documents approved
- **Pending**: Any document not approved

Individual document status **does not** affect statistics directly, but determines overall submission status.

---

## 🔒 Security

### Authorization

- Only HR can review documents
- User role validated from database
- Cannot review own submissions

### Audit Trail

- Records who reviewed each document
- Records when review occurred
- Stores rejection reasons permanently

---

## 📁 Files Modified

### Backend

1. **`backend/src/models/requirementsSubmission.model.ts`**

   - Added document-level review fields
   - Added `documentStatus`, `rejectionReason`, `reviewedByHR`, `reviewedAt`

2. **`backend/src/controllers/requirements.controller.ts`**

   - Added `reviewDocument` function
   - Smart submission status logic
   - Document-specific notifications

3. **`backend/src/routes/requirements.route.ts`**
   - Added `PATCH /review-document` route

### Frontend

1. **`ViewSubmissionModal.tsx`**

   - Added status badges per document
   - Added approve/reject buttons per document
   - Added rejection reason display
   - Added document review handlers
   - Auto-refresh after review

2. **`RequirementsManagement.tsx`**
   - Passed `onUpdate` callback to modal

---

**Last Updated**: October 24, 2025
**Version**: 3.0 with Document-Level Review
**Status**: ✅ Production Ready
