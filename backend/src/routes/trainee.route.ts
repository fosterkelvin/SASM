import { Router } from "express";
import multer from "multer";
import storage from "../config/multerCloudinary";
import {
  getAllTraineesHandler,
  getOfficeTraineesHandler,
  getOfficeScholarsHandler,
  deployTraineeHandler,
  updateTraineeDeploymentHandler,
  updateTraineeHoursHandler,
  getMyTraineeInfoHandler,
  getMyScholarInfoHandler,
  scheduleDeploymentInterviewHandler,
  acceptDeploymentHandler,
  rejectDeploymentHandler,
  uploadClassScheduleHandler,
  getClassScheduleHandler,
  downloadClassScheduleHandler,
  addDutyHoursHandler,
} from "../controllers/trainee.controller";

const upload = multer({ storage });
const traineeRoutes = Router();

// Get all trainees (HR only)
traineeRoutes.get("/all", getAllTraineesHandler);

// Get trainees for specific office (Office staff and HR)
traineeRoutes.get("/office", getOfficeTraineesHandler);

// Get scholars for specific office (Office staff and HR) - SEPARATE from trainees
traineeRoutes.get("/office/scholars", getOfficeScholarsHandler);

// Deploy trainee to office (HR only)
traineeRoutes.post("/:applicationId/deploy", deployTraineeHandler);

// Update trainee deployment (HR only)
traineeRoutes.put("/:applicationId/deployment", updateTraineeDeploymentHandler);

// Update trainee hours (Office staff)
traineeRoutes.put("/:applicationId/hours", updateTraineeHoursHandler);

// Get student's own trainee deployment info
traineeRoutes.get("/my-deployment", getMyTraineeInfoHandler);

// Get student's own scholar deployment info
traineeRoutes.get("/my-scholar", getMyScholarInfoHandler);

// Deployment interview workflow (Office staff)
traineeRoutes.post(
  "/:applicationId/deployment/interview/schedule",
  scheduleDeploymentInterviewHandler
);
traineeRoutes.post(
  "/:applicationId/deployment/accept",
  acceptDeploymentHandler
);
traineeRoutes.post(
  "/:applicationId/deployment/reject",
  rejectDeploymentHandler
);

// Class schedule upload (Student only)
traineeRoutes.post(
  "/schedule/upload",
  upload.single("schedule"),
  uploadClassScheduleHandler
);
traineeRoutes.get("/schedule", getClassScheduleHandler);
traineeRoutes.get("/schedule/download", downloadClassScheduleHandler);
traineeRoutes.get("/:applicationId/schedule", getClassScheduleHandler);
traineeRoutes.get(
  "/:applicationId/schedule/download",
  downloadClassScheduleHandler
);

// Add duty hours to schedule (Office only)
traineeRoutes.post("/:applicationId/schedule/duty-hours", addDutyHoursHandler);

export default traineeRoutes;
