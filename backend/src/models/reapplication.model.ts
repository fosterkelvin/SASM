import mongoose from "mongoose";

export interface ReApplicationDocument extends mongoose.Document {
  userID: mongoose.Types.ObjectId;

  // Reference to previous/archived application
  previousApplicationId?: mongoose.Types.ObjectId;

  // Basic info from previous application
  firstName: string;
  lastName: string;
  email: string;
  position: "student_assistant" | "student_marshal";

  // Re-application specific fields
  effectivityDate: Date;
  yearsInService: string;
  term: "first" | "second" | "short";
  academicYear: string;
  reapplicationReasons: string;
  submissionDate: Date;

  // Grades file (Cloudinary URL)
  recentGrades?: string;

  // Status
  status: "pending" | "under_review" | "approved" | "rejected" | "withdrawn";

  // School info
  college?: string;
  courseYear?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const reApplicationSchema = new mongoose.Schema<ReApplicationDocument>(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    previousApplicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
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
    position: {
      type: String,
      enum: ["student_assistant", "student_marshal"],
      required: true,
    },
    effectivityDate: {
      type: Date,
      required: true,
    },
    yearsInService: {
      type: String,
      required: true,
    },
    term: {
      type: String,
      enum: ["first", "second", "short"],
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    reapplicationReasons: {
      type: String,
      required: true,
    },
    submissionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    recentGrades: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "under_review", "approved", "rejected", "withdrawn"],
      default: "pending",
    },
    college: {
      type: String,
    },
    courseYear: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
reApplicationSchema.index({ userID: 1 });
reApplicationSchema.index({ status: 1 });
reApplicationSchema.index({ createdAt: -1 });

const ReApplicationModel = mongoose.model<ReApplicationDocument>(
  "ReApplication",
  reApplicationSchema,
  "reapplications"
);

export default ReApplicationModel;
