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
  homeCity: z.string().min(2, "City/Municipality is required"),
  homeProvince: z.string().min(2, "Province/State is required"),
  baguioAddress: z.string().min(5, "Baguio/Benguet address is required"),
  baguioStreet: z.string().optional(),
  baguioBarangay: z.string().min(2, "Barangay is required"),
  baguioCity: z.string().min(2, "City/Municipality is required"),
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
  elementary: z.string().optional(),
  elementaryYears: z.string().optional(),
  highSchool: z.string().optional(),
  highSchoolYears: z.string().optional(),
  college: z.string().optional(),
  collegeYears: z.string().optional(),
  others: z.string().optional(),
  othersYears: z.string().optional(),
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
  // signature removed; replaced by conformity checkbox
  conformity: z.boolean().refine((val) => val === true, {
    message: "You must confirm that the information provided is true",
  }),
  profilePhoto: z.any().refine((file) => file !== null && file !== undefined, {
    message: "2x2 picture is required",
  }),
  idDocument: z.any().optional(),
  certificates: z.any().optional(),
});

// Add cross-field validation to enforce required fields only when not marked Unknown
export const applicationSchemaWithConditional = applicationSchema.superRefine(
  (data, ctx) => {
    // fatherName
    if (!data.fatherNameUnknown) {
      if (!data.fatherName || data.fatherName.trim().length < 2) {
        ctx.addIssue({
          path: ["fatherName"],
          message: "Father's name is required",
          code: z.ZodIssueCode.custom,
        });
      }
    }
    // fatherOccupation
    if (!data.fatherOccupationUnknown) {
      if (!data.fatherOccupation || data.fatherOccupation.trim().length < 2) {
        ctx.addIssue({
          path: ["fatherOccupation"],
          message: "Father's occupation is required",
          code: z.ZodIssueCode.custom,
        });
      }
    }
    // motherName
    if (!data.motherNameUnknown) {
      if (!data.motherName || data.motherName.trim().length < 2) {
        ctx.addIssue({
          path: ["motherName"],
          message: "Mother's name is required",
          code: z.ZodIssueCode.custom,
        });
      }
    }
    // motherOccupation
    if (!data.motherOccupationUnknown) {
      if (!data.motherOccupation || data.motherOccupation.trim().length < 2) {
        ctx.addIssue({
          path: ["motherOccupation"],
          message: "Mother's occupation is required",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  }
);

export type ApplicationFormData = z.infer<
  typeof applicationSchemaWithConditional
>;
