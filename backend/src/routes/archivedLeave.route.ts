import { Router } from "express";
import catchErrors from "../utils/catchErrors";
import { OK, BAD_REQUEST } from "../constants/http";
import ArchivedLeaveModel from "../models/archivedLeave.model";
import appAssert from "../utils/appAssert";

const archivedLeaveRoutes = Router();

// Get all archived leaves with pagination and filters
archivedLeaveRoutes.get(
  "/",
  catchErrors(async (req, res) => {
    const {
      page = "1",
      limit = "10",
      semesterYear,
      typeOfLeave,
      search,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};

    if (semesterYear) {
      query.semesterYear = semesterYear;
    }

    if (typeOfLeave) {
      query.typeOfLeave = typeOfLeave;
    }

    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.name = searchRegex;
    }

    const [leaves, total] = await Promise.all([
      ArchivedLeaveModel.find(query)
        .sort({ archivedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("archivedBy", "firstname lastname"),
      ArchivedLeaveModel.countDocuments(query),
    ]);

    return res.status(OK).json({
      success: true,
      leaves,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  })
);

// Get semester years for filter dropdown
archivedLeaveRoutes.get(
  "/semester-years",
  catchErrors(async (req, res) => {
    const semesterYears = await ArchivedLeaveModel.distinct("semesterYear");

    return res.status(OK).json({
      success: true,
      semesterYears: semesterYears.sort().reverse(),
    });
  })
);

// Get single archived leave by ID
archivedLeaveRoutes.get(
  "/:id",
  catchErrors(async (req, res) => {
    const { id } = req.params;

    const leave = await ArchivedLeaveModel.findById(id)
      .populate("archivedBy", "firstname lastname");

    appAssert(leave, BAD_REQUEST, "Archived leave not found");

    return res.status(OK).json({
      success: true,
      leave,
    });
  })
);

// Get stats
archivedLeaveRoutes.get(
  "/stats/summary",
  catchErrors(async (req, res) => {
    const stats = await ArchivedLeaveModel.aggregate([
      {
        $group: {
          _id: "$semesterYear",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const total = await ArchivedLeaveModel.countDocuments();

    return res.status(OK).json({
      success: true,
      stats,
      total,
    });
  })
);

export default archivedLeaveRoutes;
