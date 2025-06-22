import { Router } from "express";
import {
  refreshHandler,
  resetPasswordHandler,
  sendPasswordResetHandler,
  signinHandler,
  signoutHandler,
  signupHandler,
  verifyEmailHandler,
} from "../controllers/auth.controller";

const authRoutes = Router();

// routes
authRoutes.post("/signup", signupHandler);
authRoutes.post("/signin", signinHandler);
authRoutes.get("/refresh", refreshHandler);
authRoutes.get("/signout", signoutHandler);
authRoutes.get("/email/verify/:code", verifyEmailHandler);
authRoutes.post("/password/forgot", sendPasswordResetHandler);
authRoutes.post("/password/reset", resetPasswordHandler);

export default authRoutes;
