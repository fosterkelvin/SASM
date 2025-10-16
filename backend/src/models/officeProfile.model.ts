import mongoose from "mongoose";
import { hashValue } from "../utils/bcrypt";

export interface OfficeProfileDocument extends mongoose.Document {
  accountID: mongoose.Types.ObjectId; // Reference to the main OFFICE account (user)
  profileName: string; // Display name for the profile (e.g., "John Doe")
  profilePIN: string; // 4-digit PIN for quick profile access
  isActive: boolean; // Can be enabled/disabled
  permissions: {
    viewApplications: boolean;
    editApplications: boolean;
    viewRequirements: boolean;
    processRequirements: boolean;
    viewDTR: boolean;
    editDTR: boolean;
    viewLeaveRequests: boolean;
    approveLeaveRequests: boolean;
    viewScholars: boolean;
    editScholars: boolean;
    viewEvaluations: boolean;
    submitEvaluations: boolean;
  };
  avatar?: string; // Optional custom avatar URL
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
  comparePIN(candidatePIN: string): Promise<boolean>; // Method to compare PIN
}

const officeProfileSchema = new mongoose.Schema<OfficeProfileDocument>(
  {
    accountID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    profileName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    profilePIN: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    permissions: {
      viewApplications: { type: Boolean, default: true },
      editApplications: { type: Boolean, default: true },
      viewRequirements: { type: Boolean, default: true },
      processRequirements: { type: Boolean, default: true },
      viewDTR: { type: Boolean, default: true },
      editDTR: { type: Boolean, default: true },
      viewLeaveRequests: { type: Boolean, default: true },
      approveLeaveRequests: { type: Boolean, default: true },
      viewScholars: { type: Boolean, default: true },
      editScholars: { type: Boolean, default: true },
      viewEvaluations: { type: Boolean, default: true },
      submitEvaluations: { type: Boolean, default: true },
    },
    avatar: {
      type: String,
    },
    lastAccessedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash PIN before saving
officeProfileSchema.pre("save", async function (next) {
  if (this.isModified("profilePIN")) {
    this.profilePIN = await hashValue(this.profilePIN);
  }
  next();
});

// Method to compare PIN
officeProfileSchema.methods.comparePIN = async function (candidatePIN: string) {
  const { compareValue } = await import("../utils/bcrypt");
  return compareValue(candidatePIN, this.profilePIN);
};

// Indexes for better query performance
officeProfileSchema.index({ accountID: 1, isActive: 1 });
officeProfileSchema.index({ accountID: 1, profileName: 1 });

const OfficeProfileModel = mongoose.model<OfficeProfileDocument>(
  "OfficeProfile",
  officeProfileSchema
);

export default OfficeProfileModel;
