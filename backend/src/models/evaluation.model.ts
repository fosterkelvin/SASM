import mongoose, { Schema, Document } from "mongoose";

export interface ICriterionEvaluation {
  criterion: string;
  rating?: number; // 1-5
  comment?: string;
}

export interface IEvaluation extends Document {
  scholarId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId; // Store userId for lookup after scholar deletion
  scholarName?: string; // Store name directly to persist after semester ends
  scholarType?: string; // Store type directly to persist after semester ends
  officeProfileId: mongoose.Types.ObjectId;
  officeName: string;
  evaluatorName: string;
  items: ICriterionEvaluation[];
  areasOfStrength?: string;
  areasOfImprovement?: string;
  recommendedForNextSemester?: boolean;
  justification?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CriterionEvaluationSchema = new Schema<ICriterionEvaluation>(
  {
    criterion: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
  },
  { _id: false }
);

const EvaluationSchema = new Schema<IEvaluation>(
  {
    scholarId: {
      type: Schema.Types.ObjectId,
      ref: "Scholar",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    scholarName: { type: String },
    scholarType: { type: String },
    officeProfileId: {
      type: Schema.Types.ObjectId,
      ref: "OfficeProfile",
      required: true,
      index: true,
    },
    officeName: { type: String, required: true },
    evaluatorName: { type: String, required: true },
    items: { type: [CriterionEvaluationSchema], required: true },
    areasOfStrength: { type: String },
    areasOfImprovement: { type: String },
    recommendedForNextSemester: { type: Boolean },
    justification: { type: String },
  },
  { timestamps: true }
);

// Index for efficient queries
EvaluationSchema.index({ createdAt: -1 });
EvaluationSchema.index({ scholarId: 1, createdAt: -1 });
EvaluationSchema.index({ userId: 1, createdAt: -1 }); // For lookup after scholar deletion

const EvaluationModel = mongoose.model<IEvaluation>(
  "Evaluation",
  EvaluationSchema
);

export default EvaluationModel;
