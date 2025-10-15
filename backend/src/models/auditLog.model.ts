import mongoose from "mongoose";

export interface AuditLogDocument extends mongoose.Document {
  userID: mongoose.Types.ObjectId; // Account ID
  profileID?: mongoose.Types.ObjectId; // Profile ID if action was performed via a profile
  actorName: string; // Display name of who performed the action
  actorEmail?: string; // Email of who performed the action (optional now)
  action: string; // Action performed (e.g., "application_status_updated", "requirement_verified")
  module: string; // Module where action occurred (e.g., "applications", "requirements", "dtr")
  targetType?: string; // Type of target entity (e.g., "Application", "Requirement")
  targetID?: mongoose.Types.ObjectId; // ID of the affected entity
  targetName?: string; // Name/description of the affected entity
  details: Record<string, any>; // Additional details about the action
  oldValue?: any; // Previous value (for updates)
  newValue?: any; // New value (for updates)
  ipAddress?: string; // IP address of the actor
  userAgent?: string; // Browser/device info
  timestamp: Date;
  createdAt: Date;
}

const auditLogSchema = new mongoose.Schema<AuditLogDocument>(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    profileID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OfficeProfile",
      index: true,
    },
    actorName: {
      type: String,
      required: true,
      trim: true,
    },
    actorEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    module: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    targetType: {
      type: String,
      trim: true,
    },
    targetID: {
      type: mongoose.Schema.Types.ObjectId,
    },
    targetName: {
      type: String,
      trim: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
auditLogSchema.index({ userID: 1, timestamp: -1 });
auditLogSchema.index({ profileID: 1, timestamp: -1 });
auditLogSchema.index({ module: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ targetID: 1, timestamp: -1 });

const AuditLogModel = mongoose.model<AuditLogDocument>(
  "AuditLog",
  auditLogSchema
);

export default AuditLogModel;
