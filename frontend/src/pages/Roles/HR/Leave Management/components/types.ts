import { ReactNode } from "react";

export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export type LeaveType =
  | "Sick Leave"
  | "Social Orientation"
  | "Bereavement Leave"
  | "Others";

export interface LeaveRecord {
  id: string;
  userId: string;
  name: string;
  startDate: string; // ISO
  endDate: string; // ISO
  type: LeaveType;
  reason?: string;
  status: LeaveStatus;
  hrNote?: string;
  createdAt: string;
}

export interface LeaveFilters {
  status?: LeaveStatus | "all";
  type?: LeaveType | "all";
  query?: string; // name search
}

export interface LeaveFormValues {
  userId?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  type?: LeaveType;
  reason?: string;
  hrNote?: string;
}

export interface CardProps {
  title?: string;
  children?: ReactNode;
}
