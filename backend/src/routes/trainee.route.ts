import { Router } from "express";
import {
  getAllTraineesHandler,
  getOfficeTraineesHandler,
  deployTraineeHandler,
  updateTraineeDeploymentHandler,
  updateTraineeHoursHandler,
  getMyTraineeInfoHandler,
  scheduleDeploymentInterviewHandler,
  acceptDeploymentHandler,
  rejectDeploymentHandler,
} from "../controllers/trainee.controller";

const traineeRoutes = Router();

// Get all trainees (HR only)
traineeRoutes.get("/all", getAllTraineesHandler);

// Get trainees for specific office (Office staff and HR)
traineeRoutes.get("/office", getOfficeTraineesHandler);

// Deploy trainee to office (HR only)
traineeRoutes.post("/:applicationId/deploy", deployTraineeHandler);

// Update trainee deployment (HR only)
traineeRoutes.put("/:applicationId/deployment", updateTraineeDeploymentHandler);

// Update trainee hours (Office staff)
traineeRoutes.put("/:applicationId/hours", updateTraineeHoursHandler);

// Get student's own trainee deployment info
traineeRoutes.get("/my-deployment", getMyTraineeInfoHandler);

// Deployment interview workflow (Office staff)
traineeRoutes.post("/:applicationId/deployment/interview/schedule", scheduleDeploymentInterviewHandler);
traineeRoutes.post("/:applicationId/deployment/accept", acceptDeploymentHandler);
traineeRoutes.post("/:applicationId/deployment/reject", rejectDeploymentHandler);

export default traineeRoutes;
