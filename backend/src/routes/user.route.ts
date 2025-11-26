import { Router } from "express";
import {
  getUserHandler,
  getUsersHandler,
  updateUserHandler,
  resetScholarsToApplicantsHandler,
} from "../controllers/user.controller";
import authenticate from "../middleware/authenticate";

const userRoutes = Router();

// This router handles both /user and /users routes
// When used with /user prefix: get current user
// When used with /users prefix: get multiple users (with query params)
userRoutes.get("/", authenticate, (req, res, next) => {
  // If there are query params (like ?role=office), use getUsersHandler
  if (Object.keys(req.query).length > 0) {
    return getUsersHandler(req, res, next);
  }
  // Otherwise, get current user
  return getUserHandler(req, res, next);
});

// PATCH /users/:userId - Update user information (HR only)
userRoutes.patch("/:userId", authenticate, updateUserHandler);

// POST /users/reset-to-applicants - Reset accepted scholars to applicants for new semester
userRoutes.post(
  "/reset-to-applicants",
  authenticate,
  resetScholarsToApplicantsHandler
);

export default userRoutes;
