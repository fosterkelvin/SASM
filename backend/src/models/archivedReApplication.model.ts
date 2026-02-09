import mongoose from "mongoose";

export interface ArchivedReApplicationDocument extends mongoose.Document {
  // Original reapplication data (entire object)
  originalReApplication: any;

  // Archive metadata
  archivedAt: Date;
  archivedBy?: mongoose.Types.ObjectId; // HR/Office user or "system" for auto-archive
  archivedReason: string;
  semesterYear: string;

  // Quick access fields
  userID: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  position: string;
  email: string;
  originalStatus: string;

  // For auto-deletion tracking
  scheduledDeletionDate: Date; // 2 years from archivedAt

  createdAt: Date;
  updatedAt: Date;
}

const archivedReApplicationSchema =
  new mongoose.Schema<ArchivedReApplicationDocument>(
    {
      originalReApplication: {
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
      userID: {
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
      position: {
        type: String,
        required: true,
      },
      email: {
        type: String,
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
archivedReApplicationSchema.index({ userID: 1 });
archivedReApplicationSchema.index({ semesterYear: 1 });
archivedReApplicationSchema.index({ archivedAt: -1 });
archivedReApplicationSchema.index({ scheduledDeletionDate: 1 });
archivedReApplicationSchema.index({ firstName: 1, lastName: 1 });

const ArchivedReApplicationModel =
  mongoose.model<ArchivedReApplicationDocument>(
    "ArchivedReApplication",
    archivedReApplicationSchema,
    "archivedreapplications"
  );

export default ArchivedReApplicationModel;
