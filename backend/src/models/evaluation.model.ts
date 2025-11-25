import mongoose, { Schema, Document } from "mongoose";

export interface ICriterionEvaluation {
  criterion: string;
  rating?: number; // 1-5
  comment?: string;
}

export interface IEvaluation extends Document {
  scholarId: mongoose.Types.ObjectId;
  officeProfileId: mongoose.Types.ObjectId;
  officeName: string;
  evaluatorName: string;
  items: ICriterionEvaluation[];
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
    officeProfileId: {
      type: Schema.Types.ObjectId,
      ref: "OfficeProfile",
      required: true,
      index: true,
    },
    officeName: { type: String, required: true },
    evaluatorName: { type: String, required: true },
    items: { type: [CriterionEvaluationSchema], required: true },
  },
  { timestamps: true }
);

// Index for efficient queries
EvaluationSchema.index({ createdAt: -1 });
EvaluationSchema.index({ scholarId: 1, createdAt: -1 });

const EvaluationModel = mongoose.model<IEvaluation>(
  "Evaluation",
  EvaluationSchema
);

export default EvaluationModel;
