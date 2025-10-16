import { Router } from "express";
import {
  getUserDataHandler,
  upsertUserDataHandler,
  deleteUserDataHandler,
} from "../controllers/userdata.controller";
import authenticate from "../middleware/authenticate";

const userDataRoutes = Router();

// prefix: /userdata
userDataRoutes.get("/", authenticate, getUserDataHandler);
userDataRoutes.post("/", authenticate, upsertUserDataHandler);
userDataRoutes.put("/", authenticate, upsertUserDataHandler);
userDataRoutes.delete("/", authenticate, deleteUserDataHandler);

export default userDataRoutes;
