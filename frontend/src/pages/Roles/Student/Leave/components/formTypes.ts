export type LeaveFormData = {
  name: string;
  schoolDept: string;
  courseYear: string;
  typeOfLeave: string;
  dateFrom: string;
  dateTo: string;
  daysHours: string;
  reasons: string;
  proofUrl?: string;
};

export const defaultLeaveData: LeaveFormData = {
  name: "",
  schoolDept: "",
  courseYear: "",
  typeOfLeave: "",
  dateFrom: "",
  dateTo: "",
  daysHours: "",
  reasons: "",
  proofUrl: "",
};
