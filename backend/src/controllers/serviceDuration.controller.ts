import { Request, Response } from "express";
import mongoose from "mongoose";
import catchErrors from "../utils/catchErrors";
import appAssert from "../utils/appAssert";
import { OK, FORBIDDEN } from "../constants/http";
import * as serviceDurationService from "../services/serviceDuration.service";
import UserModel from "../models/user.model";

/**
 * Get service duration for the current user
 */
export const getMyServiceDuration = catchErrors(
  async (req: Request, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.userID);

    const serviceDuration =
      await serviceDurationService.getServiceDuration(userId);

    res.status(OK).json({
      serviceDuration,
    });
  }
);

/**
 * Get service duration for a specific user (HR/Office access)
 */
export const getUserServiceDuration = catchErrors(
  async (req: Request, res: Response) => {
    const requesterId = new mongoose.Types.ObjectId(req.userID);
    const requester = await UserModel.findById(requesterId);

    // Check if user is HR or Office
    appAssert(
      requester?.role === "hr" || requester?.role === "office",
      FORBIDDEN,
      "Only HR and Office staff can view other users' service duration"
    );

    const { userId } = req.params;
    const userIdObj = new mongoose.Types.ObjectId(userId);

    const serviceDuration =
      await serviceDurationService.getServiceDuration(userIdObj);

    res.status(OK).json({
      serviceDuration,
    });
  }
);

/**
 * Complete a semester for a scholar (HR only)
 * This will automatically add 6 months to the student's service duration
 */
export const completeSemester = catchErrors(
  async (req: Request, res: Response) => {
    const requesterId = new mongoose.Types.ObjectId(req.userID);
    const requester = await UserModel.findById(requesterId);

    // Check if user is HR
    appAssert(
      requester?.role === "hr",
      FORBIDDEN,
      "Only HR staff can complete semesters"
    );

    const { userId, scholarId } = req.body;

    const userIdObj = new mongoose.Types.ObjectId(userId);
    const scholarIdObj = new mongoose.Types.ObjectId(scholarId);

    const result = await serviceDurationService.completeSemester(
      userIdObj,
      scholarIdObj
    );

    res.status(OK).json({
      message: "Semester completed successfully. +6 months added to service.",
      serviceDuration: result.userData.getServiceDuration(),
      totalMonths: result.userData.serviceMonths,
    });
  }
);
