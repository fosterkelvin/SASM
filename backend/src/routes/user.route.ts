import { Router } from "express";
import { getUserHandler } from "../controllers/user.controller";
import authenticate from "../middleware/authenticate";

const userRoutes = Router();

// prefix: /user
userRoutes.get("/", authenticate, getUserHandler); // <-- protect this route

export default userRoutes;
