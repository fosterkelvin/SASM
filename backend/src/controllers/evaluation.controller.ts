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

    const { scholarId, items } = parsed.data;

    // Verify scholar exists
    const scholar = await ScholarModel.findById(scholarId);
    appAssert(scholar, NOT_FOUND, "Scholar not found");

    const evaluation = await EvaluationModel.create({
      scholarId: new mongoose.Types.ObjectId(scholarId),
      officeProfileId: new mongoose.Types.ObjectId(profileID),
      officeName: profile.profileName,
      evaluatorName: `${user.firstname} ${user.lastname}`,
      items,
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
      .populate("scholarId", "name")
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
      .populate("scholarId", "name userId scholarType")
      .sort({ createdAt: -1 });

    // Get user details for each scholar
    const evaluationsWithDetails = await Promise.all(
      evaluations.map(async (evaluation: any) => {
        const evaluationObj = evaluation.toObject();
        const scholarData = evaluationObj.scholarId;

        return {
          ...evaluationObj,
          scholarName: scholarData?.name || "Unknown",
          scholarshipType:
            scholarData?.scholarType === "student_assistant"
              ? "Student Assistant"
              : scholarData?.scholarType === "student_marshal"
                ? "Student Marshal"
                : "Unknown",
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

    const evaluation = await EvaluationModel.findById(id).populate(
      "scholarId",
      "name userId"
    );
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
