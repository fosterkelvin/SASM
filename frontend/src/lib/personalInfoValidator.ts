// Validation helper for checking if student has completed personal info

export interface UserData {
  gender?: string | null;
  birthdate?: Date | string | null;
  civilStatus?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  college?: string | null;
  courseYear?: string | null;
}

/**
 * Checks if the student has filled all required PERSONAL info fields
 * Required for APPLICATION: gender, birthdate, civilStatus
 */
export const isPersonalInfoComplete = (
  userData: UserData | undefined | null
): boolean => {
  if (!userData) return false;

  // Check if all required personal fields are filled
  const hasGender = !!userData.gender && userData.gender !== "";
  const hasBirthdate = !!userData.birthdate;
  const hasCivilStatus = !!userData.civilStatus && userData.civilStatus !== "";

  return hasGender && hasBirthdate && hasCivilStatus;
};

/**
 * Checks if the student has filled all required ACADEMIC info fields
 * Required for LEAVE (scholars only): college, courseYear
 */
export const isAcademicInfoComplete = (
  userData: UserData | undefined | null
): boolean => {
  if (!userData) return false;

  const hasCollege = !!userData.college && userData.college !== "";
  const hasCourseYear = !!userData.courseYear && userData.courseYear !== "";

  return hasCollege && hasCourseYear;
};

/**
 * Gets a list of missing required PERSONAL info fields (for application)
 */
export const getMissingPersonalInfoFields = (
  userData: UserData | undefined | null
): string[] => {
  if (!userData) {
    return ["Gender", "Birthdate", "Civil Status"];
  }

  const missing: string[] = [];

  if (!userData.gender || userData.gender === "") {
    missing.push("Gender");
  }
  if (!userData.birthdate) {
    missing.push("Birthdate");
  }
  if (!userData.civilStatus || userData.civilStatus === "") {
    missing.push("Civil Status");
  }

  return missing;
};

/**
 * Gets a list of missing required ACADEMIC info fields (for leave)
 */
export const getMissingAcademicInfoFields = (
  userData: UserData | undefined | null
): string[] => {
  if (!userData) {
    return ["School/Department", "Course & Year"];
  }

  const missing: string[] = [];

  if (!userData.college || userData.college === "") {
    missing.push("School/Department");
  }
  if (!userData.courseYear || userData.courseYear === "") {
    missing.push("Course & Year");
  }

  return missing;
};
