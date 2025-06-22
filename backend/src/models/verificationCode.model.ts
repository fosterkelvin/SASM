import mongoose from "mongoose";
import VerificationCodeType from "../constants/verificationCodeType";

export interface VerificationCode extends mongoose.Document {
  userID: mongoose.Types.ObjectId;
  type: VerificationCodeType;
  expiresAt: Date;
  createdAt: Date;
}

const verificationCodeSchema = new mongoose.Schema<VerificationCode>({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  type: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  expiresAt: { type: Date, required: true },
});

const VerificationCodeModel = mongoose.model<VerificationCode>(
  "VerificationCode",
  verificationCodeSchema,
  "verification_codes"
);

export default VerificationCodeModel;
