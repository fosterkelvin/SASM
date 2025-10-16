import RequirementsSubmissionModel, {
  RequirementsSubmissionDocument,
} from "../models/requirementsSubmission.model";

import mongoose from "mongoose";

/**
 * Fetch the active draft for a user (if any)
 */
export async function findDraft(userID: mongoose.Types.ObjectId) {
  return RequirementsSubmissionModel.findOne({ userID, status: "draft" });
}

/**
 * Fetch the submitted requirements document for a user (if any)
 */
export async function findSubmitted(userID: mongoose.Types.ObjectId) {
  return RequirementsSubmissionModel.findOne({ userID, status: "submitted" });
}

/**
 * Persist an updated submission document
 */
export async function saveSubmission(doc: RequirementsSubmissionDocument) {
  return doc.save();
}
