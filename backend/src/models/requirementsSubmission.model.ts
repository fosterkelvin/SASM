import mongoose from "mongoose";

export interface RequirementsFile {
  label: string;
  note?: string;
  url: string;
  publicId?: string;
  originalName?: string;
  mimetype?: string;
  size?: number;
  clientId?: string; // stable client-side identifier for precise mapping
}

export interface RequirementsSubmissionDocument extends mongoose.Document {
  userID: mongoose.Types.ObjectId;
  items: RequirementsFile[];
  status: string; // draft | submitted
  submittedAt?: Date;
}

const RequirementsFileSchema = new mongoose.Schema<RequirementsFile>(
  {
    label: { type: String, required: true },
    note: { type: String },
    url: { type: String, required: true },
    publicId: { type: String },
    originalName: { type: String },
    mimetype: { type: String },
    size: { type: Number },
    clientId: { type: String },
  },
  { _id: false }
);

const requirementsSubmissionSchema =
  new mongoose.Schema<RequirementsSubmissionDocument>(
    {
      userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },
      items: { type: [RequirementsFileSchema], default: [] },
      status: { type: String, enum: ["draft", "submitted"], default: "draft" },
      submittedAt: { type: Date },
    },
    { timestamps: true }
  );

requirementsSubmissionSchema.index({ userID: 1, submittedAt: -1 });

const RequirementsSubmissionModel =
  mongoose.model<RequirementsSubmissionDocument>(
    "RequirementsSubmission",
    requirementsSubmissionSchema
  );

export default RequirementsSubmissionModel;
