import mongoose from "mongoose";

export interface ScholarRecordDocument extends mongoose.Document {
  // User Information
  userId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;

  // Scholar Information
  scholarType: "student_assistant" | "student_marshal";
  scholarOffice: string;
  scholarSupervisor?: string;

  // Deployment Details
  deployedBy: mongoose.Types.ObjectId;
  deployedAt: Date;
  semesterStartDate?: Date;
  semesterEndDate?: Date;

  // Service Hours
  requiredHours?: number;
  completedHours?: number;
  scholarNotes?: string;

  // Original Application Data (for historical reference)
  applicationId: mongoose.Types.ObjectId;
  originalApplication: any;

  // Semester/Academic Year
  semesterYear: string;

  // Record Metadata
  recordedAt: Date;
  recordedBy: mongoose.Types.ObjectId;
  recordReason: string;

  // Status at time of recording
  finalStatus: string;

  createdAt: Date;
  updatedAt: Date;
}

const scholarRecordSchema = new mongoose.Schema<ScholarRecordDocument>(
  {
    // User Information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },

    // Scholar Information
    scholarType: {
      type: String,
      enum: ["student_assistant", "student_marshal"],
      required: true,
    },
    scholarOffice: {
      type: String,
      required: true,
    },
    scholarSupervisor: {
      type: String,
    },

    // Deployment Details
    deployedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deployedAt: {
      type: Date,
    },
    semesterStartDate: {
      type: Date,
    },
    semesterEndDate: {
      type: Date,
    },

    // Service Hours
    requiredHours: {
      type: Number,
    },
    completedHours: {
      type: Number,
      default: 0,
    },
    scholarNotes: {
      type: String,
    },

    // Original Application Data
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
    },
    originalApplication: {
      type: mongoose.Schema.Types.Mixed,
    },

    // Semester/Academic Year
    semesterYear: {
      type: String,
      required: true,
    },

    // Record Metadata
    recordedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recordReason: {
      type: String,
      required: true,
      default: "End of Semester",
    },

    // Status at time of recording
    finalStatus: {
      type: String,
      required: true,
      default: "completed",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
scholarRecordSchema.index({ userId: 1 });
scholarRecordSchema.index({ semesterYear: 1 });
scholarRecordSchema.index({ recordedAt: -1 });
scholarRecordSchema.index({ scholarOffice: 1 });
scholarRecordSchema.index({ scholarType: 1 });
scholarRecordSchema.index({ firstName: 1, lastName: 1 });
// Unique compound index to prevent duplicate records for same user in same semester
scholarRecordSchema.index({ userId: 1, semesterYear: 1 }, { unique: true });

const ScholarRecordModel = mongoose.model<ScholarRecordDocument>(
  "ScholarRecord",
  scholarRecordSchema,
  "scholarrecords"
);

export default ScholarRecordModel;
