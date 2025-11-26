import { Router } from "express";
import * as serviceDurationController from "../controllers/serviceDuration.controller";
import authenticate from "../middleware/authenticate";

const serviceDurationRoutes = Router();

// Get my service duration (authenticated user)
serviceDurationRoutes.get(
  "/my-service-duration",
  authenticate,
  serviceDurationController.getMyServiceDuration
);

// Get service duration for a specific user (HR/Office only - checked in controller)
serviceDurationRoutes.get(
  "/user/:userId",
  authenticate,
  serviceDurationController.getUserServiceDuration
);

// Complete semester and add service duration (HR only - checked in controller)
serviceDurationRoutes.post(
  "/complete-semester",
  authenticate,
  serviceDurationController.completeSemester
);

export default serviceDurationRoutes;
