import mongoose, { Schema, Document } from "mongoose";

export type LeaveStatus = "pending" | "approved" | "disapproved";

export interface ILeave extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  schoolDept?: string;
  courseYear?: string;
  typeOfLeave: string;
  dateFrom: Date;
  dateTo: Date;
  daysHours?: string;
  reasons: string;
  signatureName?: string;
  signatureDate?: Date;
  proofUrl?: string; // URL to uploaded proof document (optional)
  proofFileName?: string; // Original filename with extension
  proofMimeType?: string; // MIME type of the uploaded file
  status: LeaveStatus;
  remarks?: string;
  decidedBy?: mongoose.Types.ObjectId; // office user id
  decidedByProfile?: string; // office profile name or user name
  decidedAt?: Date;
  allowResubmit?: boolean; // Allow student to resubmit this request
  createdAt: Date;
  updatedAt: Date;
}

const LeaveSchema = new Schema<ILeave>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    schoolDept: { type: String },
    courseYear: { type: String },
    typeOfLeave: { type: String, required: true },
    dateFrom: { type: Date, required: true },
    dateTo: { type: Date, required: true },
    daysHours: { type: String },
    reasons: { type: String, required: true },
    signatureName: { type: String },
    signatureDate: { type: Date },
    proofUrl: { type: String },
    proofFileName: { type: String },
    proofMimeType: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "disapproved"],
      default: "pending",
      index: true,
    },
    remarks: { type: String },
    decidedBy: { type: Schema.Types.ObjectId, ref: "User" },
    decidedByProfile: { type: String },
    decidedAt: { type: Date },
    allowResubmit: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Ensure dateTo is not before dateFrom
LeaveSchema.pre("save", function (next) {
  if (this.dateTo.getTime() < this.dateFrom.getTime()) {
    return next(new Error("dateTo cannot be before dateFrom"));
  }
  next();
});

const LeaveModel = mongoose.model<ILeave>("Leave", LeaveSchema);
export default LeaveModel;
