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
  fatherName: z.string().min(2, "Father's name is required").max(100),
  fatherOccupation: z
    .string()
    .min(2, "Father's occupation is required")
    .max(100),
  motherName: z.string().min(2, "Mother's name is required").max(100),
  motherOccupation: z
    .string()
    .min(2, "Mother's occupation is required")
    .max(100),

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
  relativeName: z.string().max(100).optional(),
  relativeDepartment: z.string().max(100).optional(),
  relativeRelationship: z.string().max(50).optional(),

  // Educational Background
  elementary: z.string().max(200).optional(),
  elementaryYears: z.string().max(20).optional(),
  highSchool: z.string().max(200).optional(),
  highSchoolYears: z.string().max(20).optional(),
  college: z.string().max(200).optional(),
  collegeYears: z.string().max(20).optional(),
  others: z.string().max(200).optional(),
  othersYears: z.string().max(20).optional(),

  // Seminars/Trainings
  seminars: z.array(seminarSchema).optional(),

  // Agreement
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

// Schema for updating application status (HR use)
export const updateApplicationStatusSchema = z.object({
  status: z.enum([
    "pending",
    "under_review",
    "approved",
    "rejected",
    "interview_scheduled",
  ]),
  hrComments: z.string().max(1000).optional(),
});

// Schema for getting applications with filters
export const getApplicationsSchema = z.object({
  status: z
    .enum([
      "pending",
      "under_review",
      "approved",
      "rejected",
      "interview_scheduled",
    ])
    .optional(),
  position: z.enum(["student_assistant", "student_marshal"]).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

export type CreateApplicationData = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationStatusData = z.infer<
  typeof updateApplicationStatusSchema
>;
export type GetApplicationsQuery = z.infer<typeof getApplicationsSchema>;
