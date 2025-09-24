export interface Scholar {
  id: string;
  name: string;
}

export interface CriterionEvaluation {
  criterion: string;
  rating?: number; // 1..5
  comment?: string;
}

export interface ScholarEvaluation {
  scholarId: string;
  date: string; // ISO
  items: CriterionEvaluation[];
}

export const defaultCriteria = [
  "Attendance",
  "Punctuality",
  "Engagement",
  "Attitude",
  "Performance",
];
