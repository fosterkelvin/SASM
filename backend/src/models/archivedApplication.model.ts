import mongoose from "mongoose";
import { ApplicationDocument } from "./application.model";

export interface ArchivedApplicationDocument extends mongoose.Document {
  // Original application data (entire application object)
  originalApplication: any; // Stores the complete application

  // Archive metadata
  archivedAt: Date;
  archivedBy: mongoose.Types.ObjectId; // HR/Office user who archived it
  archivedReason: string; // e.g., "End of Semester - AY 2024-2025"
  semesterYear: string; // e.g., "2024-2025 First Semester"

  // Quick access fields (duplicated from original for easier querying)
  userID: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  position: string;
  email: string;
  originalStatus: string; // Status before archiving (should be "accepted")

  createdAt: Date;
  updatedAt: Date;
}

const archivedApplicationSchema =
  new mongoose.Schema<ArchivedApplicationDocument>(
    {
      originalApplication: {
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
        required: true,
      },
      archivedReason: {
        type: String,
        required: true,
        default: "End of Semester",
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
    },
    {
      timestamps: true,
    }
  );

// Indexes for efficient querying
archivedApplicationSchema.index({ userID: 1 });
archivedApplicationSchema.index({ semesterYear: 1 });
archivedApplicationSchema.index({ archivedAt: -1 });
archivedApplicationSchema.index({ firstName: 1, lastName: 1 });

const ArchivedApplicationModel = mongoose.model<ArchivedApplicationDocument>(
  "ArchivedApplication",
  archivedApplicationSchema,
  "archivedapplications"
);

export default ArchivedApplicationModel;
