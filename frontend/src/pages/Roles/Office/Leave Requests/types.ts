export type LeaveStatus = "pending" | "approved" | "disapproved";

export interface LeaveRequest {
  id: string;
  studentName: string;
  startDate: string; // ISO
  endDate: string; // ISO
  reason: string;
  type?: string; // Type of leave (e.g., sick leave, personal leave, etc.)
  remarks?: string;
  status: LeaveStatus;
  submittedAt: string;
  proofUrl?: string; // URL to uploaded proof document (optional)
  proofFileName?: string; // Original filename with extension
  proofMimeType?: string; // MIME type of the uploaded file
  decidedByProfile?: string;
  decidedAt?: string;
  allowResubmit?: boolean; // Allow student to resubmit this request
}
