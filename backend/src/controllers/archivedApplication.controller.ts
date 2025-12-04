import { Request, Response } from "express";
import { OK } from "../constants/http";
import ArchivedApplicationModel from "../models/archivedApplication.model";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";

// Get all archived applications
export const getArchivedApplicationsHandler = catchErrors(
  async (req: Request, res: Response) => {
    const {
      type,
      semesterYear,
      search,
      position,
      page = 1,
      limit = 50,
    } = req.query;

    const query: any = {};

    // Filter by type (application or reapplication)
    if (type === "reapplication") {
      query.archivedReason = { $regex: "Re-application", $options: "i" };
    } else if (type === "application") {
      query.archivedReason = {
        $not: { $regex: "Re-application", $options: "i" },
      };
    }

    if (semesterYear) {
      query.semesterYear = semesterYear;
    }

    if (position) {
      query.position = position;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [applications, total] = await Promise.all([
      ArchivedApplicationModel.find(query)
        .sort({ archivedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("archivedBy", "firstname lastname email")
        .lean(),
      ArchivedApplicationModel.countDocuments(query),
    ]);

    return res.status(OK).json({
      applications,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  }
);

// Get unique semester years for filtering
export const getSemesterYearsHandler = catchErrors(
  async (req: Request, res: Response) => {
    const semesterYears =
      await ArchivedApplicationModel.distinct("semesterYear");

    return res.status(OK).json({
      semesterYears: semesterYears.sort().reverse(),
    });
  }
);

// Get a single archived application by ID
export const getArchivedApplicationByIdHandler = catchErrors(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const application = await ArchivedApplicationModel.findById(id)
      .populate("archivedBy", "firstname lastname email")
      .lean();

    appAssert(application, 404, "Archived application not found");

    return res.status(OK).json(application);
  }
);

// Get statistics about archived applications
export const getArchivedStatsHandler = catchErrors(
  async (req: Request, res: Response) => {
    const stats = await ArchivedApplicationModel.aggregate([
      {
        $group: {
          _id: "$semesterYear",
          count: { $sum: 1 },
          positions: { $push: "$position" },
        },
      },
      {
        $project: {
          _id: 0,
          semesterYear: "$_id",
          count: 1,
          studentAssistants: {
            $size: {
              $filter: {
                input: "$positions",
                as: "pos",
                cond: { $eq: ["$$pos", "student_assistant"] },
              },
            },
          },
          studentMarshals: {
            $size: {
              $filter: {
                input: "$positions",
                as: "pos",
                cond: { $eq: ["$$pos", "student_marshal"] },
              },
            },
          },
        },
      },
      {
        $sort: { semesterYear: -1 },
      },
    ]);

    return res.status(OK).json({ stats });
  }
);
