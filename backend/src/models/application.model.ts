import mongoose from "mongoose";

export interface ApplicationDocument extends mongoose.Document {
  userID: mongoose.Types.ObjectId;

  // Position
  position: "student_assistant" | "student_marshal";

  // Personal Information
  firstName: string;
  lastName: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  civilStatus: "Single" | "Married" | "Widowed" | "Separated";

  // Address
  homeAddress: string;
  homeStreet?: string;
  homeBarangay: string;
  homeCity: string;
  homeProvince: string;

  baguioAddress: string;
  baguioStreet?: string;
  baguioBarangay: string;
  baguioCity: string;

  // Contact Information
  homeContact: string;
  baguioContact: string;
  email: string;
  citizenship: string;

  // Parents Information
  fatherName?: string | null;
  fatherOccupation?: string | null;
  motherName?: string | null;
  motherOccupation?: string | null;
  // Unknown flags (if true, corresponding field may be empty)
  fatherNameUnknown?: boolean;
  fatherOccupationUnknown?: boolean;
  motherNameUnknown?: boolean;
  motherOccupationUnknown?: boolean;

  // Emergency Contact
  emergencyContact: string;
  emergencyContactNumber: string;

  // Relative Information
  hasRelativeWorking: boolean;
  relatives?: Array<{
    name: string;
    department: string;
    relationship: string;
  }>;

  // Educational Background
  elementary: string;
  elementaryYears: string;
  highSchool: string;
  highSchoolYears: string;
  college: string;
  collegeYears: string;
  others?: string;
  othersYears?: string;

  // Seminars/Trainings
  seminars?: Array<{
    title: string;
    sponsoringAgency: string;
    inclusiveDate: string;
    place: string;
  }>;

  // Application Status - New Workflow
  status:
    | "pending" // Initial submission
    | "under_review" // HR is reviewing
    | "psychometric_scheduled" // Psychometric test scheduled
    | "psychometric_completed" // Test taken, awaiting results
    | "psychometric_passed" // Passed test, ready for interview
    | "psychometric_failed" // Failed test, rejected
    | "interview_scheduled" // Interview date set
    | "interview_completed" // Interview done, awaiting decision
    | "interview_passed" // Passed interview, ready for training
    | "interview_failed" // Failed interview, rejected
    | "pending_office_interview" // Deployed to office, awaiting interview scheduling
    | "office_interview_scheduled" // Office interview scheduled
    | "trainee" // Set as trainee, training in progress
    | "training_completed" // Completed required hours
    | "accepted" // Final acceptance
    | "rejected" // Rejected at any stage
    | "withdrawn" // Applicant withdrew
    | "on_hold"; // Temporarily paused

  // Agreement
  agreedToTerms: boolean;
  conformity?: boolean;

  // Parent/Guardian Consent
  parentConsent?: boolean;
  parentGuardianName?: string;
  parentID?: string;

  // File uploads
  profilePhoto?: string;
  certificates?: string[];
  signature?: string;

  // Timestamps
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;

  // Comments/Notes from HR
  hrComments?: string;

  // Psychometric Test Information
  psychometricTestDate?: string;
  psychometricTestTime?: string;
  psychometricTestLocation?: string;
  psychometricTestWhatToBring?: string; // What to bring to the test
  psychometricTestLink?: string; // For online tests
  psychometricTestScore?: number; // Score percentage
  psychometricTestPassed?: boolean;
  psychometricTestNotes?: string;
  psychometricScheduledAt?: Date;
  psychometricCompletedAt?: Date;

  // Interview Information
  interviewDate?: string;
  interviewTime?: string;
  interviewLocation?: string;
  interviewWhatToBring?: string; // What to bring to the interview
  interviewMode?: "in-person" | "virtual" | "phone";
  interviewLink?: string; // For virtual interviews
  interviewNotes?: string;
  interviewScore?: number; // Interview rating
  interviewPassed?: boolean;
  interviewScheduledAt?: Date;
  interviewCompletedAt?: Date;

  // Deployment Interview Information (Office acceptance interview)
  deploymentInterviewDate?: string;
  deploymentInterviewTime?: string;
  deploymentInterviewLocation?: string;
  deploymentInterviewMode?: "in-person" | "virtual" | "phone";
  deploymentInterviewLink?: string;
  deploymentInterviewNotes?: string;
  deploymentInterviewWhatToBring?: string;
  deploymentRejectionReason?: string; // If office rejects deployment

  // Trainee Information
  traineeStartDate?: Date;
  traineeEndDate?: Date;
  requiredHours?: number; // Total hours required
  completedHours?: number; // Hours completed so far
  traineeOffice?: string; // Office/department assigned to
  traineeSupervisor?: mongoose.Types.ObjectId; // Supervisor assigned
  traineeNotes?: string;
  traineePerformanceRating?: number; // 1-5 rating during training

  // Assignment and Tracking
  assignedTo?: mongoose.Types.ObjectId; // HR staff assigned to this application
  assignedAt?: Date;

  // Rating/Scoring
  rating?: number; // 1-5 scale
  ratingNotes?: string;

  // Timeline/Activity Log
  timeline?: Array<{
    action: string;
    performedBy: mongoose.Types.ObjectId;
    performedByName?: string;
    timestamp: Date;
    notes?: string;
    previousStatus?: string;
    newStatus?: string;
  }>;

  // Priority flag
  priority?: "low" | "medium" | "high" | "urgent";

  // Tags for better organization
  tags?: string[];

  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new mongoose.Schema<ApplicationDocument>(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Position
    position: {
      type: String,
      enum: ["student_assistant", "student_marshal"],
      required: true,
    },

    // Personal Information
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 15,
      max: 30,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    civilStatus: {
      type: String,
      enum: ["Single", "Married", "Widowed", "Separated"],
      required: true,
    },

    // Address
    homeAddress: {
      type: String,
      required: true,
      trim: true,
    },
    homeStreet: {
      type: String,
      trim: true,
    },
    homeBarangay: {
      type: String,
      required: true,
      trim: true,
    },
    homeCity: {
      type: String,
      required: true,
      trim: true,
    },
    homeProvince: {
      type: String,
      required: true,
      trim: true,
    },

    baguioAddress: {
      type: String,
      required: true,
      trim: true,
    },
    baguioStreet: {
      type: String,
      trim: true,
    },
    baguioBarangay: {
      type: String,
      required: true,
      trim: true,
    },
    baguioCity: {
      type: String,
      required: true,
      trim: true,
    },

    // Contact Information
    homeContact: {
      type: String,
      required: true,
      trim: true,
    },
    baguioContact: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    citizenship: {
      type: String,
      required: true,
      trim: true,
    },

    // Parents Information
    fatherName: {
      type: String,
      trim: true,
      required: false,
      default: null,
    },
    fatherOccupation: {
      type: String,
      trim: true,
      required: false,
      default: null,
    },
    motherName: {
      type: String,
      trim: true,
      required: false,
      default: null,
    },
    motherOccupation: {
      type: String,
      trim: true,
      required: false,
      default: null,
    },

    // Unknown flags persisted if desired
    fatherNameUnknown: {
      type: Boolean,
      default: false,
    },
    fatherOccupationUnknown: {
      type: Boolean,
      default: false,
    },
    motherNameUnknown: {
      type: Boolean,
      default: false,
    },
    motherOccupationUnknown: {
      type: Boolean,
      default: false,
    },

    // Emergency Contact
    emergencyContact: {
      type: String,
      required: true,
      trim: true,
    },
    emergencyContactNumber: {
      type: String,
      required: true,
      trim: true,
    },

    // Relative Information
    hasRelativeWorking: {
      type: Boolean,
      required: true,
      default: false,
    },
    relatives: [
      {
        name: { type: String, trim: true },
        department: { type: String, trim: true },
        relationship: { type: String, trim: true },
      },
    ],

    // Educational Background
    elementary: {
      type: String,
      required: true,
      trim: true,
    },
    elementaryYears: {
      type: String,
      required: true,
      trim: true,
    },
    highSchool: {
      type: String,
      required: true,
      trim: true,
    },
    highSchoolYears: {
      type: String,
      required: true,
      trim: true,
    },
    college: {
      type: String,
      required: true,
      trim: true,
    },
    collegeYears: {
      type: String,
      required: true,
      trim: true,
    },
    others: {
      type: String,
      trim: true,
    },
    othersYears: {
      type: String,
      trim: true,
    },

    // Seminars/Trainings
    seminars: [
      {
        title: {
          type: String,
          trim: true,
        },
        sponsoringAgency: {
          type: String,
          trim: true,
        },
        inclusiveDate: {
          type: String,
          trim: true,
        },
        place: {
          type: String,
          trim: true,
        },
      },
    ],

    // Application Status - New Workflow
    status: {
      type: String,
      enum: [
        "pending",
        "under_review",
        "psychometric_scheduled",
        "psychometric_completed",
        "psychometric_passed",
        "psychometric_failed",
        "interview_scheduled",
        "interview_completed",
        "interview_passed",
        "interview_failed",
        "pending_office_interview",
        "office_interview_scheduled",
        "trainee",
        "training_completed",
        "accepted",
        "rejected",
        "withdrawn",
        "on_hold",
      ],
      default: "pending",
      required: true,
    },

    // Agreement
    agreedToTerms: {
      type: Boolean,
      required: true,
      validate: {
        validator: function (value: boolean) {
          return value === true;
        },
        message: "You must agree to the terms and conditions",
      },
    },

    // Conformity checkbox
    conformity: {
      type: Boolean,
      default: false,
    },

    // Parent/Guardian Consent
    parentConsent: {
      type: Boolean,
      default: false,
    },
    parentGuardianName: {
      type: String,
      trim: true,
    },
    parentID: {
      type: String,
      default: null,
    },

    // File uploads (store file paths)
    profilePhoto: {
      type: String,
      default: null,
    },
    certificates: [
      {
        type: String,
      },
    ],
    signature: {
      type: String,
      default: null,
    },

    // Timestamps
    submittedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Comments/Notes from HR
    hrComments: {
      type: String,
      trim: true,
    },

    // Psychometric Test Information
    psychometricTestDate: {
      type: String,
      trim: true,
    },
    psychometricTestTime: {
      type: String,
      trim: true,
    },
    psychometricTestLocation: {
      type: String,
      trim: true,
    },
    psychometricTestWhatToBring: {
      type: String,
      trim: true,
    },
    psychometricTestLink: {
      type: String,
      trim: true,
    },
    psychometricTestScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    psychometricTestPassed: {
      type: Boolean,
    },
    psychometricTestNotes: {
      type: String,
      trim: true,
    },
    psychometricScheduledAt: {
      type: Date,
    },
    psychometricCompletedAt: {
      type: Date,
    },

    // Interview Information
    interviewDate: {
      type: String,
      trim: true,
    },
    interviewTime: {
      type: String,
      trim: true,
    },
    interviewLocation: {
      type: String,
      trim: true,
    },
    interviewWhatToBring: {
      type: String,
      trim: true,
    },
    interviewMode: {
      type: String,
      enum: ["in-person", "virtual", "phone"],
    },
    interviewLink: {
      type: String,
      trim: true,
    },
    interviewNotes: {
      type: String,
      trim: true,
    },
    interviewScore: {
      type: Number,
      min: 1,
      max: 5,
    },
    interviewPassed: {
      type: Boolean,
    },
    interviewScheduledAt: {
      type: Date,
    },
    interviewCompletedAt: {
      type: Date,
    },

    // Deployment Interview Information (Office acceptance interview)
    deploymentInterviewDate: {
      type: String,
      trim: true,
    },
    deploymentInterviewTime: {
      type: String,
      trim: true,
    },
    deploymentInterviewLocation: {
      type: String,
      trim: true,
    },
    deploymentInterviewMode: {
      type: String,
      enum: ["in-person", "virtual", "phone"],
    },
    deploymentInterviewLink: {
      type: String,
      trim: true,
    },
    deploymentInterviewNotes: {
      type: String,
      trim: true,
    },
    deploymentInterviewWhatToBring: {
      type: String,
      trim: true,
    },
    deploymentRejectionReason: {
      type: String,
      trim: true,
    },

    // Trainee Information
    traineeStartDate: {
      type: Date,
    },
    traineeEndDate: {
      type: Date,
    },
    requiredHours: {
      type: Number,
      default: 0,
    },
    completedHours: {
      type: Number,
      default: 0,
    },
    traineeOffice: {
      type: String,
      trim: true,
    },
    traineeSupervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    traineeNotes: {
      type: String,
      trim: true,
    },
    traineePerformanceRating: {
      type: Number,
      min: 1,
      max: 5,
    },

    // Assignment and Tracking
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    assignedAt: {
      type: Date,
    },

    // Rating/Scoring
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    ratingNotes: {
      type: String,
      trim: true,
    },

    // Timeline/Activity Log
    timeline: [
      {
        action: {
          type: String,
          required: true,
        },
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        performedByName: {
          type: String,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        notes: {
          type: String,
        },
        previousStatus: {
          type: String,
        },
        newStatus: {
          type: String,
        },
      },
    ],

    // Priority flag
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    // Tags for better organization
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
applicationSchema.index({ userID: 1, createdAt: -1 });
applicationSchema.index({ status: 1, createdAt: -1 });
applicationSchema.index({ position: 1, status: 1 });
applicationSchema.index({ assignedTo: 1, status: 1 });
applicationSchema.index({ priority: 1, status: 1 });
applicationSchema.index({ rating: -1 });

const ApplicationModel = mongoose.model<ApplicationDocument>(
  "Application",
  applicationSchema
);

export default ApplicationModel;
