import { Router } from "express";
import {
  createApplicationHandler,
  getUserApplicationsHandler,
  getApplicationByIdHandler,
  getAllApplicationsHandler,
  updateApplicationStatusHandler,
  withdrawApplicationHandler,
  deleteApplicationHandler,
  getApplicationStatsHandler,
  assignApplicationHandler,
  rateApplicationHandler,
  addApplicationNoteHandler,
  updateApplicationPriorityHandler,
  bulkUpdateApplicationsHandler,
} from "../controllers/application.controller";
import authenticate from "../middleware/authenticate";
import { uploadApplicationFiles } from "../middleware/fileUpload";

const applicationRoutes = Router();

// All routes require authentication
applicationRoutes.use(authenticate);

// Student routes
applicationRoutes.post("/", uploadApplicationFiles, createApplicationHandler);
applicationRoutes.get("/my-applications", getUserApplicationsHandler);
applicationRoutes.get("/my-applications/:id", getApplicationByIdHandler);
applicationRoutes.put("/:id/withdraw", withdrawApplicationHandler);
applicationRoutes.delete("/:id", deleteApplicationHandler);

// HR/Office routes
applicationRoutes.get("/all", getAllApplicationsHandler);
applicationRoutes.put("/:id/status", updateApplicationStatusHandler);
applicationRoutes.get("/stats", getApplicationStatsHandler);

// New HR management features
applicationRoutes.put("/:id/assign", assignApplicationHandler);
applicationRoutes.put("/:id/rate", rateApplicationHandler);
applicationRoutes.post("/:id/notes", addApplicationNoteHandler);
applicationRoutes.put("/:id/priority", updateApplicationPriorityHandler);
applicationRoutes.post("/bulk-update", bulkUpdateApplicationsHandler);

export default applicationRoutes;
