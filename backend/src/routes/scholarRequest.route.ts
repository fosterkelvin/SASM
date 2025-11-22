import express from "express";
import authenticate from "../middleware/authenticate";
import {
  createScholarRequest,
  getAllScholarRequests,
  getUserScholarRequests,
  getScholarRequestById,
  reviewScholarRequest,
  deleteScholarRequest,
} from "../controllers/scholarRequest.controller";

const router = express.Router();

// Protected endpoints
router.post("/", authenticate, createScholarRequest);
router.get("/", authenticate, getUserScholarRequests); // Get current user's requests
router.get("/all", authenticate, getAllScholarRequests); // HR only - get all requests
router.get("/:id", authenticate, getScholarRequestById); // Get single request
router.patch("/review", authenticate, reviewScholarRequest); // HR only - approve/reject
router.delete("/:id", authenticate, deleteScholarRequest); // Delete own pending request

export default router;
