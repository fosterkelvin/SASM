import { Router } from "express";
import {
  getProfilesHandler,
  createProfileHandler,
  selectProfileHandler,
  updateProfileHandler,
  deleteProfileHandler,
  resetProfilePINHandler,
} from "../controllers/officeProfile.controller";

const officeProfileRoutes = Router();

// GET /office/profiles - Get all profiles
officeProfileRoutes.get("/", getProfilesHandler);

// POST /office/profiles - Create a new profile
officeProfileRoutes.post("/", createProfileHandler);

// POST /office/profiles/select - Select a profile
officeProfileRoutes.post("/select", selectProfileHandler);

// POST /office/profiles/reset-pin - Reset profile PIN
officeProfileRoutes.post("/reset-pin", resetProfilePINHandler);

// PATCH /office/profiles/:id - Update a profile
officeProfileRoutes.patch("/:id", updateProfileHandler);

// DELETE /office/profiles/:id - Delete a profile
officeProfileRoutes.delete("/:id", deleteProfileHandler);

export default officeProfileRoutes;
