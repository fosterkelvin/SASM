import express from "express";
import authenticate from "../middleware/authenticate";
import { uploadRequirementsFiles } from "../middleware/fileUpload";
import {
  createRequirementsSubmission,
  deleteRequirementFile,
  getUserRequirementsSubmissions,
  getCurrentRequirementsStatus,
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

export default router;
