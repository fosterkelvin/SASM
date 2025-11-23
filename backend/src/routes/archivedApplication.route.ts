import { Router } from "express";
import {
  getArchivedApplicationsHandler,
  getSemesterYearsHandler,
  getArchivedApplicationByIdHandler,
  getArchivedStatsHandler,
} from "../controllers/archivedApplication.controller";
import authenticate from "../middleware/authenticate";

const archivedApplicationRoutes = Router();

// Get all archived applications (with filters)
archivedApplicationRoutes.get(
  "/",
  authenticate,
  getArchivedApplicationsHandler
);

// Get unique semester years for filtering
archivedApplicationRoutes.get(
  "/semester-years",
  authenticate,
  getSemesterYearsHandler
);

// Get archived application statistics
archivedApplicationRoutes.get("/stats", authenticate, getArchivedStatsHandler);

// Get single archived application by ID
archivedApplicationRoutes.get(
  "/:id",
  authenticate,
  getArchivedApplicationByIdHandler
);

export default archivedApplicationRoutes;
