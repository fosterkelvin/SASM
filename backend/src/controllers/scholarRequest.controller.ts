import { Request, Response } from "express";
import catchErrors from "../utils/catchErrors";
import { CREATED, OK } from "../constants/http";
import * as scholarRequestService from "../services/scholarRequest.service";
import mongoose from "mongoose";
import UserModel from "../models/user.model";

/**
 * Create a new scholar request
 */
export const createScholarRequest = catchErrors(
  async (req: Request, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.userID);
    const { totalScholars, maleScholars, femaleScholars, scholarType, notes } =
      req.body;

    const scholarRequest = await scholarRequestService.createScholarRequest({
      requestedBy: userId,
      totalScholars: Number(totalScholars),
      maleScholars: Number(maleScholars),
      femaleScholars: Number(femaleScholars),
      scholarType,
      notes,
    });

    res.status(CREATED).json({
      message: "Scholar request created successfully",
      request: scholarRequest,
    });
  }
);

/**
 * Get all scholar requests (HR only)
 */
export const getAllScholarRequests = catchErrors(
  async (req: Request, res: Response) => {
    const { status, scholarType, page, limit } = req.query;

    const result = await scholarRequestService.getAllScholarRequests({
      status: status as string,
      scholarType: scholarType as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    res.status(OK).json(result);
  }
);

/**
 * Get scholar requests for the current user
 */
export const getUserScholarRequests = catchErrors(
  async (req: Request, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.userID);
    const { status, page, limit } = req.query;

    const result = await scholarRequestService.getUserScholarRequests(userId, {
      status: status as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    res.status(OK).json(result);
  }
);

/**
 * Get a single scholar request by ID
 */
export const getScholarRequestById = catchErrors(
  async (req: Request, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.userID);
    const { id } = req.params;

    const user = await UserModel.findById(userId);
    const isHR = user?.role === "hr";

    const request = await scholarRequestService.getScholarRequestById(
      id,
      userId,
      isHR
    );

    res.status(OK).json(request);
  }
);

/**
 * Review a scholar request (approve/reject) - HR only
 */
export const reviewScholarRequest = catchErrors(
  async (req: Request, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.userID);
    const { requestId, status, reviewNotes } = req.body;

    const request = await scholarRequestService.reviewScholarRequest({
      requestId,
      reviewedBy: userId,
      status,
      reviewNotes,
    });

    res.status(OK).json({
      message: `Scholar request ${status} successfully`,
      request,
    });
  }
);

/**
 * Delete a scholar request
 */
export const deleteScholarRequest = catchErrors(
  async (req: Request, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.userID);
    const { id } = req.params;

    const result = await scholarRequestService.deleteScholarRequest(id, userId);

    res.status(OK).json(result);
  }
);
