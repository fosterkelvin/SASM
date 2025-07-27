import { Router } from "express";
import {
  createApplicationHandler,
  getUserApplicationsHandler,
  getApplicationByIdHandler,
  getAllApplicationsHandler,
  updateApplicationStatusHandler,
  deleteApplicationHandler,
  getApplicationStatsHandler,
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
applicationRoutes.delete("/:id", deleteApplicationHandler);

// HR/Office routes
applicationRoutes.get("/all", getAllApplicationsHandler);
applicationRoutes.put("/:id/status", updateApplicationStatusHandler);
applicationRoutes.get("/stats", getApplicationStatsHandler);

export default applicationRoutes;
