import { Router } from "express";
import catchErrors from "../utils/catchErrors";
import { OK, BAD_REQUEST } from "../constants/http";
import ArchivedReApplicationModel from "../models/archivedReApplication.model";
import appAssert from "../utils/appAssert";

const archivedReApplicationRoutes = Router();

// Get all archived reapplications with pagination and filters
archivedReApplicationRoutes.get(
  "/",
  catchErrors(async (req, res) => {
    const {
      page = "1",
      limit = "10",
      semesterYear,
      position,
      search,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};

    if (semesterYear) {
      query.semesterYear = semesterYear;
    }

    if (position) {
      query.position = position;
    }

    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
      ];
    }

    const [reapplications, total] = await Promise.all([
      ArchivedReApplicationModel.find(query)
        .sort({ archivedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("archivedBy", "firstname lastname"),
      ArchivedReApplicationModel.countDocuments(query),
    ]);

    return res.status(OK).json({
      success: true,
      reapplications,
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
archivedReApplicationRoutes.get(
  "/semester-years",
  catchErrors(async (req, res) => {
    const semesterYears = await ArchivedReApplicationModel.distinct("semesterYear");

    return res.status(OK).json({
      success: true,
      semesterYears: semesterYears.sort().reverse(),
    });
  })
);

// Get single archived reapplication by ID
archivedReApplicationRoutes.get(
  "/:id",
  catchErrors(async (req, res) => {
    const { id } = req.params;

    const reapplication = await ArchivedReApplicationModel.findById(id)
      .populate("archivedBy", "firstname lastname");

    appAssert(reapplication, BAD_REQUEST, "Archived reapplication not found");

    return res.status(OK).json({
      success: true,
      reapplication,
    });
  })
);

// Get stats
archivedReApplicationRoutes.get(
  "/stats/summary",
  catchErrors(async (req, res) => {
    const stats = await ArchivedReApplicationModel.aggregate([
      {
        $group: {
          _id: "$semesterYear",
          count: { $sum: 1 },
          saCount: {
            $sum: { $cond: [{ $eq: ["$position", "student_assistant"] }, 1, 0] },
          },
          smCount: {
            $sum: { $cond: [{ $eq: ["$position", "student_marshal"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const total = await ArchivedReApplicationModel.countDocuments();

    return res.status(OK).json({
      success: true,
      stats,
      total,
    });
  })
);

export default archivedReApplicationRoutes;
