import { Router } from "express";
import {
  changePasswordHandler,
  refreshHandler,
  resetPasswordHandler,
  sendPasswordResetHandler,
  signinHandler,
  signoutHandler,
  signupHandler,
  verifyEmailHandler,
  resendVerificationEmailHandler,
  changeEmailHandler,
  cancelEmailChangeHandler,
} from "../controllers/auth.controller";
import authenticate from "../middleware/authenticate";

const authRoutes = Router();

// routes
authRoutes.post("/signup", signupHandler);
authRoutes.post("/signin", signinHandler);
authRoutes.get("/refresh", refreshHandler);
authRoutes.get("/signout", signoutHandler);
authRoutes.get("/email/verify/:code", verifyEmailHandler);
authRoutes.post("/email/resend", resendVerificationEmailHandler);
authRoutes.post("/password/forgot", sendPasswordResetHandler);
authRoutes.post("/password/reset", resetPasswordHandler);
authRoutes.post("/password/change", authenticate, changePasswordHandler);
authRoutes.post("/email/change", authenticate, changeEmailHandler);
authRoutes.delete("/email/cancel", authenticate, cancelEmailChangeHandler);

export default authRoutes;
