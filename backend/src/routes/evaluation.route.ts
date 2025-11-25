import { Router } from "express";
import authenticate from "../middleware/authenticate";
import {
  submitEvaluation,
  getMyEvaluations,
  getAllEvaluations,
  getEvaluationDetails,
} from "../controllers/evaluation.controller";

const evaluationRoutes = Router();

evaluationRoutes.use(authenticate);

// Office endpoints
evaluationRoutes.post("/", submitEvaluation);
evaluationRoutes.get("/my", getMyEvaluations);

// HR endpoints
evaluationRoutes.get("/all", getAllEvaluations);

// Shared endpoint
evaluationRoutes.get("/:id", getEvaluationDetails);

export default evaluationRoutes;
