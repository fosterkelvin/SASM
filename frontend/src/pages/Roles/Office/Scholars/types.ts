export type ScholarRow = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  program?: string;
  status?: string;
  createdAt?: string;
  requiredHours?: number;
  completedHours?: number;
  traineeOffice?: string;
  traineeSupervisor?: any;
  traineeStartDate?: string;
  traineeEndDate?: string;
  traineeNotes?: string;
};
