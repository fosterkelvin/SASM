import { z } from "zod";

export const applicationSchema = z.object({
  position: z.enum(["student_assistant", "student_marshal"], {
    required_error: "Please select a position",
  }),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  age: z
    .number()
    .min(15, "Age must be at least 15")
    .max(30, "Age must be under 30"),
  gender: z.enum(["Male", "Female", "Other"], {
    required_error: "Gender is required",
  }),
  civilStatus: z.enum(["Single", "Married", "Widowed", "Separated"], {
    required_error: "Civil status is required",
  }),
  homeAddress: z.string().min(5, "Home address is required"),
  homeStreet: z.string().optional(),
  homeBarangay: z.string().min(2, "Barangay is required"),
  homeBarangayCode: z.string().optional(), // PSGC code for barangay
  homeCity: z.string().min(2, "City/Municipality is required"),
  homeCityCode: z.string().optional(), // PSGC code for city/municipality
  homeProvince: z.string().min(2, "Province/State is required"),
  homeProvinceCode: z.string().optional(), // PSGC code for province
  baguioAddress: z.string().min(5, "Baguio/Benguet address is required"),
  baguioStreet: z.string().optional(),
  baguioBarangay: z.string().min(2, "Barangay is required"),
  baguioBarangayCode: z.string().optional(), // PSGC code for barangay
  baguioCity: z.string().min(2, "City/Municipality is required"),
  baguioCityCode: z.string().optional(), // PSGC code for city/municipality
  homeContact: z.string().min(10, "Home contact number is required"),
  baguioContact: z
    .string()
    .min(10, "Baguio/Benguet contact number is required"),
  email: z.string().email("Valid email is required"),
  citizenship: z.string().min(2, "Citizenship is required"),
  fatherName: z.string().optional(),
  fatherOccupation: z.string().optional(),
  motherName: z.string().optional(),
  motherOccupation: z.string().optional(),
  // Unknown / Not Applicable flags — when true, the corresponding field may be empty
  fatherNameUnknown: z.boolean().optional(),
  fatherOccupationUnknown: z.boolean().optional(),
  motherNameUnknown: z.boolean().optional(),
  motherOccupationUnknown: z.boolean().optional(),
  emergencyContact: z.string().min(2, "Emergency contact name is required"),
  emergencyContactNumber: z
    .string()
    .min(10, "Emergency contact number is required"),
  hasRelativeWorking: z.boolean(),
  relativeName: z.string().optional(),
  relativeDepartment: z.string().optional(),
  relativeRelationship: z.string().optional(),
  elementary: z.string().min(2, "Elementary school is required"),
  elementaryFrom: z
    .string()
    .min(4, "Elementary start year is required")
    .refine(
      (val) => {
        const year = parseInt(val);
        const currentYear = new Date().getFullYear();
        return !isNaN(year) && year <= currentYear && year >= 1900;
      },
      (val) => {
        const year = parseInt(val);
        const currentYear = new Date().getFullYear();
        if (isNaN(year))
          return { message: "Elementary start year must be a valid year" };
        if (year > currentYear)
          return {
            message: `Elementary start year cannot be in the future (current year: ${currentYear})`,
          };
        if (year < 1900)
          return { message: "Elementary start year must be after 1900" };
        return { message: "Invalid year" };
      }
    ),
  elementaryTo: z
    .string()
    .min(4, "Elementary end year is required")
    .refine(
      (val) => {
        const year = parseInt(val);
        const currentYear = new Date().getFullYear();
        return !isNaN(year) && year <= currentYear && year >= 1900;
      },
      (val) => {
        const year = parseInt(val);
        const currentYear = new Date().getFullYear();
        if (isNaN(year))
          return { message: "Elementary end year must be a valid year" };
        if (year > currentYear)
          return {
            message: `Elementary end year cannot be in the future (current year: ${currentYear})`,
          };
        if (year < 1900)
          return { message: "Elementary end year must be after 1900" };
        return { message: "Invalid year" };
      }
    ),
  highSchool: z.string().min(2, "High school is required"),
  highSchoolFrom: z
    .string()
    .min(4, "High school start year is required")
    .refine(
      (val) => {
        const year = parseInt(val);
        const currentYear = new Date().getFullYear();
        return !isNaN(year) && year <= currentYear && year >= 1900;
      },
      (val) => {
        const year = parseInt(val);
        const currentYear = new Date().getFullYear();
        if (isNaN(year))
          return { message: "High school start year must be a valid year" };
        if (year > currentYear)
          return {
            message: `High school start year cannot be in the future (current year: ${currentYear})`,
          };
        if (year < 1900)
          return { message: "High school start year must be after 1900" };
        return { message: "Invalid year" };
      }
    ),
  highSchoolTo: z
    .string()
    .min(4, "High school end year is required")
    .refine(
      (val) => {
        const year = parseInt(val);
        const currentYear = new Date().getFullYear();
        return !isNaN(year) && year <= currentYear && year >= 1900;
      },
      (val) => {
        const year = parseInt(val);
        const currentYear = new Date().getFullYear();
        if (isNaN(year))
          return { message: "High school end year must be a valid year" };
        if (year > currentYear)
          return {
            message: `High school end year cannot be in the future (current year: ${currentYear})`,
          };
        if (year < 1900)
          return { message: "High school end year must be after 1900" };
        return { message: "Invalid year" };
      }
    ),
  college: z.string().optional(),
  collegeFrom: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const year = parseInt(val);
        const currentYear = new Date().getFullYear();
        return !isNaN(year) && year <= currentYear && year >= 1900;
      },
      (val) => {
        if (!val) return { message: "" };
        const year = parseInt(val);
        const currentYear = new Date().getFullYear();
        if (isNaN(year))
          return { message: "College start year must be a valid year" };
        if (year > currentYear)
          return {
            message: `College start year cannot be in the future (current year: ${currentYear})`,
          };
        if (year < 1900)
          return { message: "College start year must be after 1900" };
        return { message: "Invalid year" };
      }
    ),
  collegeTo: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const year = parseInt(val);
        const currentYear = new Date().getFullYear();
        return !isNaN(year) && year <= currentYear && year >= 1900;
      },
      (val) => {
        if (!val) return { message: "" };
        const year = parseInt(val);
        const currentYear = new Date().getFullYear();
        if (isNaN(year))
          return { message: "College end year must be a valid year" };
        if (year > currentYear)
          return {
            message: `College end year cannot be in the future (current year: ${currentYear})`,
          };
        if (year < 1900)
          return { message: "College end year must be after 1900" };
        return { message: "Invalid year" };
      }
    ),
  others: z.string().optional(),
  othersFrom: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const year = parseInt(val);
        const currentYear = new Date().getFullYear();
        return !isNaN(year) && year <= currentYear && year >= 1900;
      },
      (val) => {
        if (!val) return { message: "" };
        const year = parseInt(val);
        const currentYear = new Date().getFullYear();
        if (isNaN(year))
          return { message: "Others start year must be a valid year" };
        if (year > currentYear)
          return {
            message: `Others start year cannot be in the future (current year: ${currentYear})`,
          };
        if (year < 1900)
          return { message: "Others start year must be after 1900" };
        return { message: "Invalid year" };
      }
    ),
  othersTo: z.string().optional(),
  seminars: z
    .array(
      z.object({
        title: z.string(),
        sponsoringAgency: z.string(),
        inclusiveDate: z.string(),
        place: z.string(),
      })
    )
    .optional(),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
  // Conformity checkbox (replacing signature)
  conformity: z.boolean().refine((val) => val === true, {
    message: "You must confirm that the information provided is true",
  }),
  // Parent/Guardian Consent
  parentConsent: z.boolean().refine((val) => val === true, {
    message: "Parent/Guardian consent is required",
  }),
  parentGuardianName: z
    .string()
    .min(2, "Parent/Guardian name is required")
    .max(100),
  parentID: z.any().optional(),
  profilePhoto: z.any().optional(),
  idDocument: z.any().optional(),
  certificates: z.any().optional(),
});

// Add cross-field validation to enforce required fields only when not marked Unknown
export const applicationSchemaWithConditional = applicationSchema.superRefine(
  (data, ctx) => {
    const currentYear = new Date().getFullYear();

    // fatherName - only required if NOT marked as unknown
    if (data.fatherNameUnknown !== true) {
      if (!data.fatherName || data.fatherName.trim().length < 2) {
        ctx.addIssue({
          path: ["fatherName"],
          message: "Father's name is required",
          code: z.ZodIssueCode.custom,
        });
      }
    }
    // fatherOccupation - now optional, no validation
    // motherName - only required if NOT marked as unknown
    if (data.motherNameUnknown !== true) {
      if (!data.motherName || data.motherName.trim().length < 2) {
        ctx.addIssue({
          path: ["motherName"],
          message: "Mother's name is required",
          code: z.ZodIssueCode.custom,
        });
      }
    }
    // motherOccupation - now optional, no validation

    // Year validation for education fields
    const validateYearField = (field: string, value: any, label: string) => {
      if (value) {
        const year = parseInt(value.toString());
        if (isNaN(year)) {
          ctx.addIssue({
            path: [field],
            message: `${label} must be a valid year`,
            code: z.ZodIssueCode.custom,
          });
        } else if (year > currentYear) {
          ctx.addIssue({
            path: [field],
            message: `${label} cannot be in the future (current year: ${currentYear})`,
            code: z.ZodIssueCode.custom,
          });
        } else if (year < 1900) {
          ctx.addIssue({
            path: [field],
            message: `${label} must be after 1900`,
            code: z.ZodIssueCode.custom,
          });
        }
      }
    };

    // Validate year ranges (From must be strictly less than To)
    const validateYearRange = (
      fromField: string,
      toField: string,
      fromValue: any,
      toValue: any,
      level: string
    ) => {
      if (fromValue && toValue) {
        const fromYear = parseInt(fromValue);
        const toYear = parseInt(toValue);
        if (!isNaN(fromYear) && !isNaN(toYear) && fromYear >= toYear) {
          ctx.addIssue({
            path: [toField],
            message: `${level} end year must be after start year`,
            code: z.ZodIssueCode.custom,
          });
        }
      }
    };

    // Elementary validation
    validateYearField(
      "elementaryFrom",
      data.elementaryFrom,
      "Elementary start year"
    );
    validateYearField("elementaryTo", data.elementaryTo, "Elementary end year");
    validateYearRange(
      "elementaryFrom",
      "elementaryTo",
      data.elementaryFrom,
      data.elementaryTo,
      "Elementary"
    );

    // High School validation
    validateYearField(
      "highSchoolFrom",
      data.highSchoolFrom,
      "High school start year"
    );
    validateYearField(
      "highSchoolTo",
      data.highSchoolTo,
      "High school end year"
    );
    validateYearRange(
      "highSchoolFrom",
      "highSchoolTo",
      data.highSchoolFrom,
      data.highSchoolTo,
      "High school"
    );

    // Validate chronological order: High School must start on or after Elementary ends
    if (data.elementaryTo && data.highSchoolFrom) {
      const elemTo = parseInt(data.elementaryTo);
      const hsFrom = parseInt(data.highSchoolFrom);
      if (!isNaN(elemTo) && !isNaN(hsFrom) && hsFrom < elemTo) {
        ctx.addIssue({
          path: ["highSchoolFrom"],
          message: `High school start year must be on or after Elementary end year (${elemTo})`,
          code: z.ZodIssueCode.custom,
        });
      }
    }

    // College validation (optional)
    if (data.collegeFrom) {
      validateYearField("collegeFrom", data.collegeFrom, "College start year");
    }
    if (data.collegeTo) {
      validateYearField("collegeTo", data.collegeTo, "College end year");
    }
    if (data.collegeFrom && data.collegeTo) {
      validateYearRange(
        "collegeFrom",
        "collegeTo",
        data.collegeFrom,
        data.collegeTo,
        "College"
      );
    }

    // Validate chronological order: College must start on or after High School ends
    if (data.highSchoolTo && data.collegeFrom) {
      const hsTo = parseInt(data.highSchoolTo);
      const colFrom = parseInt(data.collegeFrom);
      if (!isNaN(hsTo) && !isNaN(colFrom) && colFrom < hsTo) {
        ctx.addIssue({
          path: ["collegeFrom"],
          message: `College start year must be on or after High School end year (${hsTo})`,
          code: z.ZodIssueCode.custom,
        });
      }
    }

    // Others validation (optional)
    if (data.othersFrom) {
      validateYearField("othersFrom", data.othersFrom, "Others start year");
    }
    if (data.othersTo) {
      validateYearField("othersTo", data.othersTo, "Others end year");
    }
    if (data.othersFrom && data.othersTo) {
      validateYearRange(
        "othersFrom",
        "othersTo",
        data.othersFrom,
        data.othersTo,
        "Others"
      );
    }
  }
);

export type ApplicationFormData = z.infer<
  typeof applicationSchemaWithConditional
>;
