import { Router } from "express";
import {
  getScholarsByCategory,
  getCategoryStats,
  getActiveScholars,
  getTraineesList,
  graduateScholar,
  withdrawApplicant,
  blacklistPerson,
  removeFromBlacklist,
  checkBlacklist,
  getArchivedScholars,
  getWithdrawnApplicants,
  getBlacklistedPersons,
  getCategoryReportData,
  triggerCleanup,
} from "../controllers/scholarCategory.controller";

const router = Router();

// Get statistics for all categories
router.get("/stats", getCategoryStats);

// Get all records by category
router.get("/", getScholarsByCategory);

// Active scholars (current)
router.get("/scholars", getActiveScholars);

// Trainees (applicants in training)
router.get("/trainees", getTraineesList);

// Archived (graduated)
router.get("/archived", getArchivedScholars);

// Withdrawn
router.get("/withdrawn", getWithdrawnApplicants);

// Blacklisted
router.get("/blacklisted", getBlacklistedPersons);

// Check if user is blacklisted (for validation)
router.get("/check-blacklist", checkBlacklist);

// Report data for PDF generation
router.get("/report-data", getCategoryReportData);

// Graduate a scholar (move to archive)
router.post("/graduate/:scholarId", graduateScholar);

// Withdraw an applicant
router.post("/withdraw/:applicationId", withdrawApplicant);

// Blacklist a person
router.post("/blacklist/:userId", blacklistPerson);

// Remove from blacklist
router.delete("/blacklist/:recordId", removeFromBlacklist);

// Manual cleanup trigger (admin only)
router.post("/cleanup", triggerCleanup);

export default router;
