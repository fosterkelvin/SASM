import express from "express";
import authenticate from "../middleware/authenticate";
import { uploadRequirementsFiles } from "../middleware/fileUpload";
import {
  createRequirementsSubmission,
  deleteRequirementFile,
  getUserRequirementsSubmissions,
  getCurrentRequirementsStatus,
  getAllRequirementsSubmissions,
  reviewRequirementsSubmission,
  reviewDocument,
} from "../controllers/requirements.controller";

const router = express.Router();

// Protected endpoints
router.post(
  "/",
  authenticate,
  uploadRequirementsFiles,
  createRequirementsSubmission
);
router.delete("/file", authenticate, deleteRequirementFile);
router.get("/", authenticate, getUserRequirementsSubmissions);
router.get("/current", authenticate, getCurrentRequirementsStatus);
router.get("/all", authenticate, getAllRequirementsSubmissions); // HR only
router.patch("/review", authenticate, reviewRequirementsSubmission); // HR only - approve/reject submission
router.patch("/review-document", authenticate, reviewDocument); // HR only - approve/reject specific document

export default router;
