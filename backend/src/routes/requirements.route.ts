import express from "express";
import authenticate from "../middleware/authenticate";
import { uploadRequirementsFiles } from "../middleware/fileUpload";
import {
  createRequirementsSubmission,
  saveDraftRequirements,
  deleteRequirementFile,
  getUserRequirementsSubmissions,
} from "../controllers/requirements.controller";

const router = express.Router();

// Protected endpoints
router.post(
  "/",
  authenticate,
  uploadRequirementsFiles,
  createRequirementsSubmission
);
router.post(
  "/draft",
  authenticate,
  uploadRequirementsFiles,
  saveDraftRequirements
);
router.delete("/file", authenticate, deleteRequirementFile);
router.get("/", authenticate, getUserRequirementsSubmissions);

export default router;
