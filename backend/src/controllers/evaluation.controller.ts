import { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import EvaluationModel from "../models/evaluation.model";
import UserModel from "../models/user.model";
import ScholarModel from "../models/scholar.model";
import OfficeProfileModel from "../models/officeProfile.model";
import catchErrors from "../utils/catchErrors";
import appAssert from "../utils/appAssert";
import { BAD_REQUEST, FORBIDDEN, NOT_FOUND, OK } from "../constants/http";

const criterionEvaluationSchema = z.object({
  criterion: z.string().min(1),
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().optional(),
});

const createEvaluationSchema = z.object({
  scholarId: z.string().min(1),
  items: z.array(criterionEvaluationSchema).min(1),
  areasOfStrength: z.string().optional(),
  areasOfImprovement: z.string().optional(),
  recommendedForNextSemester: z.boolean().optional(),
  justification: z.string().optional(),
});

// Office: Submit evaluation for a scholar
export const submitEvaluation = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const profileID = req.profileID;

    appAssert(userID, FORBIDDEN, "Not authorized");
    appAssert(
      profileID,
      FORBIDDEN,
      "No active profile selected. Please select an office profile."
    );

    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "office",
      FORBIDDEN,
      "Only office users can submit evaluations"
    );

    const profile = await OfficeProfileModel.findById(profileID);
    appAssert(profile, NOT_FOUND, "Office profile not found");
    appAssert(
      profile.permissions.submitEvaluations,
      FORBIDDEN,
      "You don't have permission to submit evaluations"
    );

    const parsed = createEvaluationSchema.safeParse(req.body);
    appAssert(parsed.success, BAD_REQUEST, "Invalid payload");

    const {
      scholarId,
      items,
      areasOfStrength,
      areasOfImprovement,
      recommendedForNextSemester,
      justification,
    } = parsed.data;

    // Verify scholar exists
    const scholar = await ScholarModel.findById(scholarId).populate({
      path: "userId",
      select: "firstname lastname",
    });
    appAssert(scholar, NOT_FOUND, "Scholar not found");

    // Get scholar's name from the populated userId
    const scholarUser = scholar.userId as any;
    const scholarName = scholarUser
      ? `${scholarUser.firstname || ""} ${scholarUser.lastname || ""}`.trim()
      : "Unknown";
    const scholarType =
      scholar.scholarType === "student_assistant"
        ? "Student Assistant"
        : scholar.scholarType === "student_marshal"
          ? "Student Marshal"
          : "Unknown";

    // Get the office name from the user's officeName field
    const officeName = user.officeName || user.office || "Unknown Office";

    const evaluation = await EvaluationModel.create({
      scholarId: new mongoose.Types.ObjectId(scholarId),
      userId: scholar.userId._id || scholar.userId, // Store userId for future lookup
      scholarName, // Store name directly to persist after semester ends
      scholarType, // Store type directly
      officeProfileId: new mongoose.Types.ObjectId(profileID),
      officeName: officeName,
      evaluatorName: profile.profileName,
      items,
      areasOfStrength,
      areasOfImprovement,
      recommendedForNextSemester,
      justification,
    });

    return res
      .status(OK)
      .json({ message: "Evaluation submitted successfully", evaluation });
  }
);

// Office: Get my submitted evaluations
export const getMyEvaluations = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const profileID = req.profileID;

    appAssert(userID, FORBIDDEN, "Not authorized");
    appAssert(profileID, FORBIDDEN, "No active profile selected");

    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(user.role === "office", FORBIDDEN, "Office access required");

    const profile = await OfficeProfileModel.findById(profileID);
    appAssert(profile, NOT_FOUND, "Office profile not found");
    appAssert(
      profile.permissions.viewEvaluations,
      FORBIDDEN,
      "You don't have permission to view evaluations"
    );

    const evaluations = await EvaluationModel.find({
      officeProfileId: profileID,
    })
      .populate({
        path: "scholarId",
        populate: {
          path: "userId",
          select: "firstname lastname email",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(OK).json({ evaluations });
  }
);

// HR: Get all evaluations
export const getAllEvaluations = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    appAssert(userID, FORBIDDEN, "Not authorized");

    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "hr",
      FORBIDDEN,
      "Only HR can view all evaluations"
    );

    const { office, scholar, startDate, endDate } = req.query;

    const filter: any = {};

    if (office) {
      filter.officeName = new RegExp(String(office), "i");
    }

    if (scholar) {
      filter.scholarId = scholar;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(String(startDate));
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(String(endDate));
      }
    }

    const evaluations = await EvaluationModel.find(filter)
      .populate({
        path: "scholarId",
        select: "userId scholarType",
        populate: {
          path: "userId",
          select: "firstname lastname email",
        },
      })
      .sort({ createdAt: -1 });

    // Get user details for each scholar
    const evaluationsWithDetails = await Promise.all(
      evaluations.map(async (evaluation: any) => {
        const evaluationObj = evaluation.toObject();
        const scholarData = evaluationObj.scholarId;
        const userData = scholarData?.userId;

        // Use stored scholarName first (persists after semester ends), fallback to populated data
        const scholarNameFromPopulate = userData
          ? `${userData.firstname || ""} ${userData.lastname || ""}`.trim()
          : null;
        
        const scholarTypeFromPopulate = scholarData?.scholarType === "student_assistant"
          ? "Student Assistant"
          : scholarData?.scholarType === "student_marshal"
            ? "Student Marshal"
            : null;

        return {
          ...evaluationObj,
          scholarName: evaluationObj.scholarName || scholarNameFromPopulate || "Unknown",
          scholarshipType: evaluationObj.scholarType || scholarTypeFromPopulate || "Unknown",
        };
      })
    );

    return res.status(OK).json({ evaluations: evaluationsWithDetails });
  }
);

// HR or Office: Get evaluation details
export const getEvaluationDetails = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const { id } = req.params;

    appAssert(userID, FORBIDDEN, "Not authorized");

    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "hr" || user.role === "office",
      FORBIDDEN,
      "Only HR or Office can view evaluation details"
    );

    const evaluation = await EvaluationModel.findById(id).populate({
      path: "scholarId",
      select: "userId scholarType",
      populate: {
        path: "userId",
        select: "firstname lastname email",
      },
    });
    appAssert(evaluation, NOT_FOUND, "Evaluation not found");

    // If office user, verify they own this evaluation
    if (user.role === "office") {
      appAssert(
        evaluation.officeProfileId.toString() === req.profileID,
        FORBIDDEN,
        "You can only view your own evaluations"
      );
    }

    return res.status(OK).json({ evaluation });
  }
);
