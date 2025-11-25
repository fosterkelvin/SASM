import { Router } from "express";
import {
  submitReApplicationHandler,
  getUserReApplicationsHandler,
  getAllReApplicationsHandler,
  updateReApplicationStatusHandler,
  deleteReApplicationHandler,
} from "../controllers/reapplication.controller";
import { uploadApplicationFiles } from "../middleware/fileUpload";

const reapplicationRoutes = Router();

// Student routes
reapplicationRoutes.post(
  "/",
  uploadApplicationFiles,
  submitReApplicationHandler
);

reapplicationRoutes.get("/my-reapplications", getUserReApplicationsHandler);

reapplicationRoutes.delete("/:id", deleteReApplicationHandler);

// HR/Office routes
reapplicationRoutes.get("/all", getAllReApplicationsHandler);

reapplicationRoutes.put("/:id/status", updateReApplicationStatusHandler);

export default reapplicationRoutes;
