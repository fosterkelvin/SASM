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
  decidedByProfile?: string;
  decidedAt?: string;
  allowResubmit?: boolean; // Allow student to resubmit this request
}
