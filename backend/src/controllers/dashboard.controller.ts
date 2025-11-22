import { Request, Response } from "express";
import catchErrors from "../utils/catchErrors";
import { OK, FORBIDDEN, NOT_FOUND } from "../constants/http";
import appAssert from "../utils/appAssert";
import UserModel from "../models/user.model";
import ApplicationModel from "../models/application.model";
import OfficeProfileModel from "../models/officeProfile.model";
import RequirementsSubmissionModel from "../models/requirementsSubmission.model";
import ScholarModel from "../models/scholar.model";
import UserDataModel from "../models/userdata.model";
import LeaveModel from "../models/leave.model";

// Get dashboard statistics (HR only)
export const getDashboardStatsHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;

    // Check if user has permission
    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "hr",
      FORBIDDEN,
      "Access denied. Only HR staff can view dashboard statistics."
    );

    // Get total active users count (students only)
    const totalUsers = await UserModel.countDocuments({
      verified: true,
      role: "student",
    });

    // Get pending leave requests count
    const pendingLeaveRequests = await LeaveModel.countDocuments({
      status: "pending",
    });

    // Get active offices count (distinct parent office accounts)
    const activeOffices = await UserModel.countDocuments({
      role: "office",
      verified: true,
    });

    // Get trainee count (applications in training stages)
    const traineeCount = await ApplicationModel.countDocuments({
      status: {
        $in: [
          "trainee",
          "training_completed",
          "interview_passed",
          "pending_office_interview",
          "office_interview_scheduled",
        ],
      },
    });

    // Get active students/scholars count for pie charts
    const activeStudents = await ScholarModel.countDocuments({
      status: "active",
    });

    // Get gender distribution from UserData
    const scholars = await ScholarModel.find({ status: "active" }).select(
      "userId"
    );
    const scholarUserIds = scholars.map((s) => s.userId);

    const userDataList = await UserDataModel.find({
      userId: { $in: scholarUserIds },
    }).select("gender");

    const genderCounts = userDataList.reduce((acc: any, data: any) => {
      const gender = data.gender || "unknown";
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    const femaleCount = genderCounts.female || 0;
    const maleCount = genderCounts.male || 0;

    // Get scholarship type distribution
    const scholarshipCounts = await ScholarModel.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: "$scholarType",
          count: { $sum: 1 },
        },
      },
    ]);

    const studentAssistantCount =
      scholarshipCounts.find((s) => s._id === "student_assistant")?.count || 0;
    const studentMarshalCount =
      scholarshipCounts.find((s) => s._id === "student_marshal")?.count || 0;

    return res.status(OK).json({
      totalUsers,
      pendingLeaveRequests,
      activeOffices,
      traineeCount,
      activeStudents,
      genderDistribution: {
        female: femaleCount,
        male: maleCount,
        femalePercentage:
          activeStudents > 0
            ? Math.round((femaleCount / activeStudents) * 100)
            : 0,
        malePercentage:
          activeStudents > 0
            ? Math.round((maleCount / activeStudents) * 100)
            : 0,
      },
      scholarshipDistribution: {
        studentAssistant: studentAssistantCount,
        studentMarshal: studentMarshalCount,
        studentAssistantPercentage:
          activeStudents > 0
            ? Math.round((studentAssistantCount / activeStudents) * 100)
            : 0,
        studentMarshalPercentage:
          activeStudents > 0
            ? Math.round((studentMarshalCount / activeStudents) * 100)
            : 0,
      },
    });
  }
);

// Get analytics data (HR only)
export const getAnalyticsHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;

    // Check if user has permission
    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "hr",
      FORBIDDEN,
      "Access denied. Only HR staff can view analytics."
    );

    // Get date range from query params
    const { start, end } = req.query;
    let dateFilter: any = {};

    if (start || end) {
      dateFilter.createdAt = {};
      if (start) {
        dateFilter.createdAt.$gte = new Date(start as string);
      }
      if (end) {
        const endDate = new Date(end as string);
        endDate.setHours(23, 59, 59, 999); // End of day
        dateFilter.createdAt.$lte = endDate;
      }
    } else {
      // Default to last 14 days
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      dateFilter.createdAt = { $gte: fourteenDaysAgo };
    }

    // Get active students (scholars)
    const activeStudents = await ScholarModel.countDocuments({
      status: "active",
    });

    // Get new students this month (from applications that became scholars)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newThisMonth = await ScholarModel.countDocuments({
      status: "active",
      createdAt: { $gte: startOfMonth },
    });

    // Get pending applications (all non-final statuses)
    const pendingApplications = await ApplicationModel.countDocuments({
      status: {
        $nin: ["accepted", "rejected", "withdrawn"],
      },
    });

    // Get pending leaves
    const pendingLeaves = await LeaveModel.countDocuments({
      status: "pending",
    });

    // Get application pipeline stats
    const pipelineStats = await ApplicationModel.aggregate([
      {
        $group: {
          _id: null,
          applied: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$status", "rejected"] },
                    { $ne: ["$status", "withdrawn"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          reviewed: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$status",
                    [
                      "psychometric_completed",
                      "psychometric_passed",
                      "interview_scheduled",
                      "interview_completed",
                      "interview_passed",
                      "trainee",
                      "training_completed",
                      "pending_office_interview",
                      "office_interview_scheduled",
                      "accepted",
                    ],
                  ],
                },
                1,
                0,
              ],
            },
          },
          interviewed: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$status",
                    [
                      "interview_completed",
                      "interview_passed",
                      "trainee",
                      "training_completed",
                      "pending_office_interview",
                      "office_interview_scheduled",
                      "accepted",
                    ],
                  ],
                },
                1,
                0,
              ],
            },
          },
          trainee: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$status",
                    [
                      "trainee",
                      "training_completed",
                      "pending_office_interview",
                      "office_interview_scheduled",
                    ],
                  ],
                },
                1,
                0,
              ],
            },
          },
          accepted: {
            $sum: {
              $cond: [{ $eq: ["$status", "accepted"] }, 1, 0],
            },
          },
          rejected: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$status",
                    ["rejected", "psychometric_failed", "interview_failed"],
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const pipeline = pipelineStats[0] || {
      applied: 0,
      reviewed: 0,
      interviewed: 0,
      trainee: 0,
      accepted: 0,
      rejected: 0,
    };

    // Get trends data based on date filter
    const trendsData = await ApplicationModel.aggregate([
      {
        $match: dateFilter,
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          applications: { $sum: 1 },
          hires: {
            $sum: {
              $cond: [{ $eq: ["$status", "accepted"] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          applications: 1,
          hires: 1,
        },
      },
    ]);

    // Get gender distribution from applications (only accepted or trainee stage)
    const applications = await ApplicationModel.find({
      status: {
        $in: [
          "accepted",
          "trainee",
          "training_completed",
          "pending_office_interview",
          "office_interview_scheduled",
        ],
      },
    }).select("gender");

    const genderCounts = applications.reduce((acc: any, app: any) => {
      const gender = app.gender?.toLowerCase() || "unknown";
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    const femaleCount = genderCounts.female || 0;
    const maleCount = genderCounts.male || 0;

    // Get scholarship distribution from applications (only accepted or trainee stage)
    const scholarshipCounts = await ApplicationModel.aggregate([
      {
        $match: {
          status: {
            $in: [
              "accepted",
              "trainee",
              "training_completed",
              "pending_office_interview",
              "office_interview_scheduled",
            ],
          },
        },
      },
      {
        $group: {
          _id: "$position",
          count: { $sum: 1 },
        },
      },
    ]);

    const studentAssistantCount =
      scholarshipCounts.find((s) => s._id === "student_assistant")?.count || 0;
    const studentMarshalCount =
      scholarshipCounts.find((s) => s._id === "student_marshal")?.count || 0;

    const totalApplications = studentAssistantCount + studentMarshalCount;

    return res.status(OK).json({
      activeStudents,
      newThisMonth,
      pendingApplications,
      pendingLeaves,
      pipeline,
      trends: trendsData,
      genderDistribution: {
        female: femaleCount,
        male: maleCount,
        femalePercentage:
          totalApplications > 0
            ? Math.round((femaleCount / totalApplications) * 100)
            : 0,
        malePercentage:
          totalApplications > 0
            ? Math.round((maleCount / totalApplications) * 100)
            : 0,
      },
      scholarshipDistribution: {
        studentAssistant: studentAssistantCount,
        studentMarshal: studentMarshalCount,
        studentAssistantPercentage:
          totalApplications > 0
            ? Math.round((studentAssistantCount / totalApplications) * 100)
            : 0,
        studentMarshalPercentage:
          totalApplications > 0
            ? Math.round((studentMarshalCount / totalApplications) * 100)
            : 0,
      },
    });
  }
);
