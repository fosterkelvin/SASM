import { Router } from "express";
import authenticate from "../middleware/authenticate";
import multer from "multer";
import leaveProofStorage from "../config/multerCloudinaryLeave";
import {
  decideLeave,
  getMyLeaves,
  listLeavesForOffice,
  submitLeave,
  cancelLeave,
  updateLeave,
} from "../controllers/leave.controller";

const leaveRoutes = Router();
const upload = multer({ storage: leaveProofStorage });

leaveRoutes.use(authenticate);

// Student endpoints
leaveRoutes.post("/", upload.single("proof"), submitLeave);
leaveRoutes.get("/my", getMyLeaves);
leaveRoutes.put("/:id", upload.single("proof"), updateLeave);
leaveRoutes.delete("/:id", cancelLeave);

// Office / HR endpoints
leaveRoutes.get("/office", listLeavesForOffice);
leaveRoutes.post("/:id/decision", decideLeave);

export default leaveRoutes;
