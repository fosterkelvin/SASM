// Validation helper for checking if student has completed personal info

export interface UserData {
  gender?: string | null;
  birthdate?: Date | string | null;
  civilStatus?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
}

/**
 * Checks if the student has filled all required personal info fields
 * Required fields: gender, birthdate, civilStatus
 */
export const isPersonalInfoComplete = (
  userData: UserData | undefined | null
): boolean => {
  if (!userData) return false;

  // Check if all required fields are filled
  const hasGender = !!userData.gender && userData.gender !== "";
  const hasBirthdate = !!userData.birthdate;
  const hasCivilStatus = !!userData.civilStatus && userData.civilStatus !== "";

  return hasGender && hasBirthdate && hasCivilStatus;
};

/**
 * Gets a list of missing required fields
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
