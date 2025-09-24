export type LeaveStatus = "pending" | "approved" | "disapproved";

export interface LeaveRequest {
  id: string;
  studentName: string;
  studentId: string;
  startDate: string; // ISO
  endDate: string; // ISO
  reason: string;
  remarks?: string;
  status: LeaveStatus;
  submittedAt: string;
}
