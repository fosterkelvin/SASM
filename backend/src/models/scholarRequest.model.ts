import mongoose, { Document, Schema } from "mongoose";

export interface IScholarRequest extends Document {
  requestedBy: mongoose.Types.ObjectId;
  totalScholars: number;
  maleScholars: number;
  femaleScholars: number;
  scholarType: "Student Assistant" | "Student Marshal";
  notes?: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const scholarRequestSchema = new Schema<IScholarRequest>(
  {
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalScholars: {
      type: Number,
      required: true,
      min: 0,
    },
    maleScholars: {
      type: Number,
      required: true,
      min: 0,
    },
    femaleScholars: {
      type: Number,
      required: true,
      min: 0,
    },
    scholarType: {
      type: String,
      enum: ["Student Assistant", "Student Marshal"],
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    reviewNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
scholarRequestSchema.index({ requestedBy: 1, createdAt: -1 });
scholarRequestSchema.index({ status: 1, createdAt: -1 });

const ScholarRequest = mongoose.model<IScholarRequest>(
  "ScholarRequest",
  scholarRequestSchema
);

export default ScholarRequest;
