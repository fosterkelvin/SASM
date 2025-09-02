export type LeaveFormData = {
  name: string;
  idNumber: string;
  schoolDept: string;
  courseYear: string;
  typeOfLeave: string;
  dateFrom: string;
  dateTo: string;
  daysHours: string;
  reasons: string;
  signatureName: string;
  signatureDate: string;
};

export const defaultLeaveData: LeaveFormData = {
  name: "",
  idNumber: "",
  schoolDept: "",
  courseYear: "",
  typeOfLeave: "",
  dateFrom: "",
  dateTo: "",
  daysHours: "",
  reasons: "",
  signatureName: "",
  signatureDate: "",
};
