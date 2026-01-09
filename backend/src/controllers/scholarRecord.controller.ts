import { Request, Response } from "express";
import { OK } from "../constants/http";
import ScholarRecordModel from "../models/scholarRecord.model";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";

// Get all scholar records (with filters)
export const getScholarRecordsHandler = catchErrors(
  async (req: Request, res: Response) => {
    const {
      semesterYear,
      search,
      scholarType,
      office,
      page = 1,
      limit = 50,
    } = req.query;

    const query: any = {};

    if (semesterYear) {
      query.semesterYear = semesterYear;
    }

    if (scholarType) {
      query.scholarType = scholarType;
    }

    if (office) {
      query.scholarOffice = { $regex: office, $options: "i" };
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { scholarOffice: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [records, total] = await Promise.all([
      ScholarRecordModel.find(query)
        .sort({ recordedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("recordedBy", "firstname lastname email")
        .populate("deployedBy", "firstname lastname email")
        .lean(),
      ScholarRecordModel.countDocuments(query),
    ]);

    return res.status(OK).json({
      records,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  }
);

// Get unique semester years for filtering
export const getScholarRecordSemesterYearsHandler = catchErrors(
  async (req: Request, res: Response) => {
    const semesterYears = await ScholarRecordModel.distinct("semesterYear");

    return res.status(OK).json({
      semesterYears: semesterYears.sort().reverse(),
    });
  }
);

// Get unique offices for filtering
export const getScholarRecordOfficesHandler = catchErrors(
  async (req: Request, res: Response) => {
    const offices = await ScholarRecordModel.distinct("scholarOffice");

    return res.status(OK).json({
      offices: offices.sort(),
    });
  }
);

// Get a single scholar record by ID
export const getScholarRecordByIdHandler = catchErrors(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const record = await ScholarRecordModel.findById(id)
      .populate("recordedBy", "firstname lastname email")
      .populate("deployedBy", "firstname lastname email")
      .lean();

    appAssert(record, 404, "Scholar record not found");

    return res.status(OK).json(record);
  }
);

// Get statistics about scholar records
export const getScholarRecordStatsHandler = catchErrors(
  async (req: Request, res: Response) => {
    const stats = await ScholarRecordModel.aggregate([
      {
        $group: {
          _id: "$semesterYear",
          count: { $sum: 1 },
          types: { $push: "$scholarType" },
          totalHours: { $sum: "$completedHours" },
        },
      },
      {
        $project: {
          _id: 0,
          semesterYear: "$_id",
          count: 1,
          totalHours: 1,
          studentAssistants: {
            $size: {
              $filter: {
                input: "$types",
                as: "type",
                cond: { $eq: ["$$type", "student_assistant"] },
              },
            },
          },
          studentMarshals: {
            $size: {
              $filter: {
                input: "$types",
                as: "type",
                cond: { $eq: ["$$type", "student_marshal"] },
              },
            },
          },
        },
      },
      {
        $sort: { semesterYear: -1 },
      },
    ]);

    // Get total counts
    const totalStats = await ScholarRecordModel.aggregate([
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          totalHours: { $sum: "$completedHours" },
        },
      },
    ]);

    return res.status(OK).json({
      stats,
      totals: totalStats[0] || {
        totalRecords: 0,
        totalHours: 0,
      },
    });
  }
);

// Get scholar records by user ID (for student's own history)
export const getScholarRecordsByUserHandler = catchErrors(
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    const records = await ScholarRecordModel.find({ userId })
      .sort({ recordedAt: -1 })
      .populate("recordedBy", "firstname lastname email")
      .populate("deployedBy", "firstname lastname email")
      .lean();

    return res.status(OK).json({
      records,
      total: records.length,
    });
  }
);
