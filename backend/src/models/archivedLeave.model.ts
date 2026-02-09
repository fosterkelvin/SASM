import mongoose from "mongoose";

export interface ArchivedLeaveDocument extends mongoose.Document {
  // Original leave data (entire object)
  originalLeave: any;

  // Archive metadata
  archivedAt: Date;
  archivedBy?: mongoose.Types.ObjectId;
  archivedReason: string;
  semesterYear: string;

  // Quick access fields
  userId: mongoose.Types.ObjectId;
  name: string;
  typeOfLeave: string;
  dateFrom: Date;
  dateTo: Date;
  originalStatus: string;

  // For auto-deletion tracking
  scheduledDeletionDate: Date; // 2 years from archivedAt

  createdAt: Date;
  updatedAt: Date;
}

const archivedLeaveSchema = new mongoose.Schema<ArchivedLeaveDocument>(
  {
    originalLeave: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    archivedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    archivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    archivedReason: {
      type: String,
      required: true,
      default: "Auto-archived - Rejected over 1 year",
    },
    semesterYear: {
      type: String,
      required: true,
    },
    // Quick access fields
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    typeOfLeave: {
      type: String,
      required: true,
    },
    dateFrom: {
      type: Date,
      required: true,
    },
    dateTo: {
      type: Date,
      required: true,
    },
    originalStatus: {
      type: String,
      required: true,
    },
    scheduledDeletionDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
archivedLeaveSchema.index({ userId: 1 });
archivedLeaveSchema.index({ semesterYear: 1 });
archivedLeaveSchema.index({ archivedAt: -1 });
archivedLeaveSchema.index({ scheduledDeletionDate: 1 });
archivedLeaveSchema.index({ name: 1 });

const ArchivedLeaveModel = mongoose.model<ArchivedLeaveDocument>(
  "ArchivedLeave",
  archivedLeaveSchema,
  "archivedleaves"
);

export default ArchivedLeaveModel;
