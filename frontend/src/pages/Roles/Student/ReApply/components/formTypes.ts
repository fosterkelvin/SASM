export type FormData = {
  name: string;
  idNumber: string;
  schoolDept: string;
  courseYear: string;
  effectivityDate: string;
  yearsInService: string;
  term: "first" | "second" | "short";
  academicYear: string;
  reasons: string;
  submissionDate: string;
  gradesFile: File | null;
  gradesFileUrl: string;
};

// Helper function to get current academic year
const getCurrentAcademicYear = (): string => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 0-indexed, so add 1

  // If we're in Jan-June, it's the second semester of AY (prev-current)
  // If we're in July-Dec, it's the first semester of AY (current-next)
  if (currentMonth <= 6) {
    return `${currentYear - 1}-${currentYear}`;
  } else {
    return `${currentYear}-${currentYear + 1}`;
  }
};

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

export const defaultData: FormData = {
  name: "",
  idNumber: "",
  schoolDept: "",
  courseYear: "",
  effectivityDate: "",
  yearsInService: "",
  term: "first",
  academicYear: getCurrentAcademicYear(),
  reasons: "",
  submissionDate: getTodayDate(),
  gradesFile: null,
  gradesFileUrl: "",
};
