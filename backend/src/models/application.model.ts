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
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;

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
  elementary?: string;
  elementaryYears?: string;
  highSchool?: string;
  highSchoolYears?: string;
  college?: string;
  collegeYears?: string;
  others?: string;
  othersYears?: string;

  // Seminars/Trainings
  seminars?: Array<{
    title: string;
    sponsoringAgency: string;
    inclusiveDate: string;
    place: string;
  }>;

  // Application Status
  status:
    | "pending"
    | "under_review"
    | "interview_scheduled"
    | "passed_interview"
    | "failed_interview"
    | "hours_completed"
    | "accepted"
    | "rejected"
    | "withdrawn"
    | "on_hold";

  // Agreement
  agreedToTerms: boolean;

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

  // Interview Information
  interviewDate?: string;
  interviewTime?: string;
  interviewLocation?: string;
  interviewNotes?: string;

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
      required: true,
      trim: true,
    },
    fatherOccupation: {
      type: String,
      required: true,
      trim: true,
    },
    motherName: {
      type: String,
      required: true,
      trim: true,
    },
    motherOccupation: {
      type: String,
      required: true,
      trim: true,
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
      trim: true,
    },
    elementaryYears: {
      type: String,
      trim: true,
    },
    highSchool: {
      type: String,
      trim: true,
    },
    highSchoolYears: {
      type: String,
      trim: true,
    },
    college: {
      type: String,
      trim: true,
    },
    collegeYears: {
      type: String,
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

    // Application Status
    status: {
      type: String,
      enum: [
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
    interviewNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
applicationSchema.index({ userID: 1, createdAt: -1 });
applicationSchema.index({ status: 1, createdAt: -1 });
applicationSchema.index({ position: 1, status: 1 });

const ApplicationModel = mongoose.model<ApplicationDocument>(
  "Application",
  applicationSchema
);

export default ApplicationModel;
