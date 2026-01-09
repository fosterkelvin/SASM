import { Router } from "express";
import {
  getScholarRecordsHandler,
  getScholarRecordSemesterYearsHandler,
  getScholarRecordOfficesHandler,
  getScholarRecordByIdHandler,
  getScholarRecordStatsHandler,
  getScholarRecordsByUserHandler,
} from "../controllers/scholarRecord.controller";
import authenticate from "../middleware/authenticate";

const scholarRecordRoutes = Router();

// Get all scholar records (with filters)
scholarRecordRoutes.get("/", authenticate, getScholarRecordsHandler);

// Get unique semester years for filtering
scholarRecordRoutes.get(
  "/semester-years",
  authenticate,
  getScholarRecordSemesterYearsHandler
);

// Get unique offices for filtering
scholarRecordRoutes.get(
  "/offices",
  authenticate,
  getScholarRecordOfficesHandler
);

// Get scholar record statistics
scholarRecordRoutes.get("/stats", authenticate, getScholarRecordStatsHandler);

// Get scholar records by user ID
scholarRecordRoutes.get(
  "/user/:userId",
  authenticate,
  getScholarRecordsByUserHandler
);

// Get single scholar record by ID
scholarRecordRoutes.get("/:id", authenticate, getScholarRecordByIdHandler);

export default scholarRecordRoutes;
