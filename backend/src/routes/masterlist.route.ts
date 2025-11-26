import { Router } from "express";
import { getMasterlistData } from "../controllers/masterlist.controller";

const masterlistRoutes = Router();

// GET /api/masterlist - Get all scholars masterlist data
masterlistRoutes.get("/", getMasterlistData);

export default masterlistRoutes;
