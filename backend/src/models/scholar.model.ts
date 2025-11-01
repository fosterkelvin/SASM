import { Schema, model, Document, Types } from "mongoose";

export interface IScholar extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId; // Reference to User
  applicationId: Types.ObjectId; // Reference to Application
  scholarOffice: string; // Office where scholar is deployed
  scholarType: "student_assistant" | "student_marshal";
  deployedBy: Types.ObjectId; // HR who deployed
  deployedAt: Date;
  scholarNotes?: string;
  status: "active" | "inactive" | "completed";
  // Performance tracking
  performanceRating?: number;
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const scholarSchema = new Schema<IScholar>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    scholarOffice: {
      type: String,
      required: true,
      trim: true,
    },
    scholarType: {
      type: String,
      enum: ["student_assistant", "student_marshal"],
      required: true,
    },
    deployedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deployedAt: {
      type: Date,
      default: Date.now,
    },
    scholarNotes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "completed"],
      default: "active",
    },
    performanceRating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
scholarSchema.index({ userId: 1 });
scholarSchema.index({ scholarOffice: 1 });
scholarSchema.index({ status: 1 });

const ScholarModel = model<IScholar>("Scholar", scholarSchema);

export default ScholarModel;
