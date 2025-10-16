import { Router } from "express";
import {
  schedulePsychometricTestHandler,
  submitPsychometricTestScoreHandler,
  scheduleInterviewHandler,
  submitInterviewResultHandler,
  setAsTraineeHandler,
  updateTraineeHoursHandler,
  acceptApplicationHandler,
  rejectApplicationHandler,
} from "../controllers/workflow.controller";
import authenticate from "../middleware/authenticate";

const workflowRoutes = Router();

// All routes require authentication
workflowRoutes.use(authenticate);

// Psychometric Test Workflow
workflowRoutes.post(
  "/applications/:id/psychometric/schedule",
  schedulePsychometricTestHandler
);
workflowRoutes.post(
  "/applications/:id/psychometric/score",
  submitPsychometricTestScoreHandler
);

// Interview Workflow
workflowRoutes.post(
  "/applications/:id/interview/schedule",
  scheduleInterviewHandler
);
workflowRoutes.post(
  "/applications/:id/interview/result",
  submitInterviewResultHandler
);

// Trainee Workflow
workflowRoutes.post("/applications/:id/trainee/set", setAsTraineeHandler);
workflowRoutes.put(
  "/applications/:id/trainee/hours",
  updateTraineeHoursHandler
);

// Final Actions
workflowRoutes.post("/applications/:id/accept", acceptApplicationHandler);
workflowRoutes.post("/applications/:id/reject", rejectApplicationHandler);

export default workflowRoutes;
