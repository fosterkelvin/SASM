import { z } from "zod";

// Seminar schema
const seminarSchema = z.object({
  title: z.string().optional(),
  sponsoringAgency: z.string().optional(),
  inclusiveDate: z.string().optional(),
  place: z.string().optional(),
});

// Main application schema
export const createApplicationSchema = z.object({
  // Position
  position: z.enum(["student_assistant", "student_marshal"], {
    required_error: "Please select a position",
  }),

  // Personal Information
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50),
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

  // Address
  homeAddress: z.string().min(5, "Home address is required").max(200),
  homeStreet: z.string().max(100).optional(),
  homeBarangay: z.string().min(2, "Barangay is required").max(50),
  homeCity: z.string().min(2, "City/Municipality is required").max(50),
  homeProvince: z.string().min(2, "Province/State is required").max(50),

  baguioAddress: z
    .string()
    .min(5, "Baguio/Benguet address is required")
    .max(200),
  baguioStreet: z.string().max(100).optional(),
  baguioBarangay: z.string().min(2, "Barangay is required").max(50),
  baguioCity: z.string().min(2, "City/Municipality is required").max(50),

  // Contact Information
  homeContact: z.string().min(10, "Home contact number is required").max(20),
  baguioContact: z
    .string()
    .min(10, "Baguio/Benguet contact number is required")
    .max(20),
  email: z.string().email("Valid email is required").max(100),
  citizenship: z.string().min(2, "Citizenship is required").max(50),

  // Parents Information
  fatherName: z.string().max(100).optional(),
  fatherOccupation: z.string().max(100).optional(),
  motherName: z.string().max(100).optional(),
  motherOccupation: z.string().max(100).optional(),
  // Unknown / Not Applicable flags — when true, the corresponding field may be empty
  fatherNameUnknown: z.boolean().optional(),
  fatherOccupationUnknown: z.boolean().optional(),
  motherNameUnknown: z.boolean().optional(),
  motherOccupationUnknown: z.boolean().optional(),

  // Emergency Contact
  emergencyContact: z
    .string()
    .min(2, "Emergency contact name is required")
    .max(100),
  emergencyContactNumber: z
    .string()
    .min(10, "Emergency contact number is required")
    .max(20),

  // Relative Information
  hasRelativeWorking: z.boolean(),
  relatives: z
    .array(
      z.object({
        name: z.string().max(100),
        department: z.string().max(100),
        relationship: z.string().max(50),
      })
    )
    .optional(),

  // Educational Background
  elementary: z
    .string()
    .min(2, "Elementary school is required")
    .max(200),
  elementaryYears: z
    .string()
    .min(2, "Elementary years attended is required")
    .max(20),
  highSchool: z
    .string()
    .min(2, "High school is required")
    .max(200),
  highSchoolYears: z
    .string()
    .min(2, "High school years attended is required")
    .max(20),
  college: z
    .string()
    .min(2, "College/University is required")
    .max(200),
  collegeYears: z
    .string()
    .min(2, "College years attended is required")
    .max(20),
  others: z.string().max(200).optional(),
  othersYears: z.string().max(20).optional(),

  // Seminars/Trainings
  seminars: z.array(seminarSchema).optional(),

  // Agreement
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

  // E-Signature (optional - replaced by conformity)
  signature: z.string().min(1, "Electronic signature is required").optional(),
});

// Schema for updating application status (HR use)
export const updateApplicationStatusSchema = z.object({
  status: z.enum([
    "pending",
    "under_review",
    "interview_scheduled",
    "passed_interview",
    "failed_interview",
    "hours_completed",
    "accepted",
    "rejected",
    "withdrawn",
    "on_hold",
  ]),
  hrComments: z.string().max(1000).optional(),
  interviewDate: z.string().optional(),
  interviewTime: z.string().optional(),
  interviewLocation: z.string().optional(),
  interviewNotes: z.string().max(1000).optional(),
});

// Schema for getting applications with filters
export const getApplicationsSchema = z.object({
  status: z
    .enum([
      "pending",
      "under_review",
      "interview_scheduled",
      "passed_interview",
      "failed_interview",
      "hours_completed",
      "accepted",
      "rejected",
      "withdrawn",
      "on_hold",
    ])
    .optional(),
  position: z.enum(["student_assistant", "student_marshal"]).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

export type CreateApplicationData = z.infer<typeof createApplicationSchema>;
// Add cross-field validation to enforce required parent fields only when not marked Unknown
export const createApplicationSchemaWithConditional =
  createApplicationSchema.superRefine((data, ctx) => {
    if (!data.fatherNameUnknown) {
      if (!data.fatherName || data.fatherName.trim().length < 2) {
        ctx.addIssue({
          path: ["fatherName"],
          message: "Father's name is required",
          code: z.ZodIssueCode.custom,
        });
      }
    }
    if (!data.fatherOccupationUnknown) {
      if (!data.fatherOccupation || data.fatherOccupation.trim().length < 2) {
        ctx.addIssue({
          path: ["fatherOccupation"],
          message: "Father's occupation is required",
          code: z.ZodIssueCode.custom,
        });
      }
    }
    if (!data.motherNameUnknown) {
      if (!data.motherName || data.motherName.trim().length < 2) {
        ctx.addIssue({
          path: ["motherName"],
          message: "Mother's name is required",
          code: z.ZodIssueCode.custom,
        });
      }
    }
    if (!data.motherOccupationUnknown) {
      if (!data.motherOccupation || data.motherOccupation.trim().length < 2) {
        ctx.addIssue({
          path: ["motherOccupation"],
          message: "Mother's occupation is required",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });
export type UpdateApplicationStatusData = z.infer<
  typeof updateApplicationStatusSchema
>;
export type GetApplicationsQuery = z.infer<typeof getApplicationsSchema>;
