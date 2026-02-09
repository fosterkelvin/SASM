import { Router } from "express";
import { runArchivalTasks } from "../services/archival.service";
import catchErrors from "../utils/catchErrors";
import { OK } from "../constants/http";
import authenticate from "../middleware/authenticate";

const archivalRoutes = Router();

// Manually trigger archival tasks (HR only)
archivalRoutes.post(
  "/run",
  authenticate,
  catchErrors(async (req, res) => {
    console.log("Manual archival triggered by user:", req.userID);

    const result = await runArchivalTasks();

    return res.status(OK).json({
      success: true,
      message: "Archival tasks completed",
      ...result,
    });
  })
);

// Get archival status/stats
archivalRoutes.get(
  "/status",
  authenticate,
  catchErrors(async (req, res) => {
    const ArchivedApplicationModel = require("../models/archivedApplication.model").default;
    const ArchivedReApplicationModel = require("../models/archivedReApplication.model").default;
    const ArchivedLeaveModel = require("../models/archivedLeave.model").default;

    const now = new Date();

    const stats = {
      archivedApplications: await ArchivedApplicationModel.countDocuments(),
      archivedReApplications: await ArchivedReApplicationModel.countDocuments(),
      archivedLeaves: await ArchivedLeaveModel.countDocuments(),
      pendingDeletion: {
        applications: await ArchivedApplicationModel.countDocuments({
          scheduledDeletionDate: { $lte: now },
        }),
        reapplications: await ArchivedReApplicationModel.countDocuments({
          scheduledDeletionDate: { $lte: now },
        }),
        leaves: await ArchivedLeaveModel.countDocuments({
          scheduledDeletionDate: { $lte: now },
        }),
      },
    };

    return res.status(OK).json({
      success: true,
      stats,
    });
  })
);

export default archivalRoutes;
