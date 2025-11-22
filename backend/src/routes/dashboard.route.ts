import { Router } from "express";
import {
  getDashboardStatsHandler,
  getAnalyticsHandler,
} from "../controllers/dashboard.controller";
import authenticate from "../middleware/authenticate";

const dashboardRoutes = Router();

// All routes require authentication
dashboardRoutes.use(authenticate);

// HR Dashboard statistics
dashboardRoutes.get("/stats", getDashboardStatsHandler);

// HR Analytics data
dashboardRoutes.get("/analytics", getAnalyticsHandler);

export default dashboardRoutes;
