import { Router } from "express";
import {
  getUserHandler,
  getUsersHandler,
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

export default userRoutes;
