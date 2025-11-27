import ScholarRequest, {
  IScholarRequest,
} from "../models/scholarRequest.model";
import mongoose from "mongoose";
import appError from "../utils/appError";
import { UNAUTHORIZED, NOT_FOUND, BAD_REQUEST } from "../constants/http";
import UserModel from "../models/user.model";
import { createNotification } from "./notification.service";

/**
 * Create a new scholar request
 */
export async function createScholarRequest(data: {
  requestedBy: mongoose.Types.ObjectId;
  totalScholars: number;
  maleScholars: number;
  femaleScholars: number;
  scholarType: string;
  notes?: string;
}) {
  // Validate that total matches male + female
  if (data.totalScholars !== data.maleScholars + data.femaleScholars) {
    throw new appError(
      BAD_REQUEST,
      "Total scholars must equal male + female scholars"
    );
  }

  // Validate scholar type
  if (!["Student Assistant", "Student Marshal"].includes(data.scholarType)) {
    throw new appError(BAD_REQUEST, "Invalid scholar type");
  }

  const scholarRequest = await ScholarRequest.create(data);

  // Get the requesting office information
  const requestingUser = await UserModel.findById(data.requestedBy);
  const officeName = requestingUser?.officeName || "An office";

  // Notify all HR users about the new scholar request
  try {
    const hrUsers = await UserModel.find({ role: "hr" });

    const notificationPromises = hrUsers.map((hrUser) =>
      createNotification({
        userID: (hrUser._id as mongoose.Types.ObjectId).toString(),
        title: "New Scholar Request",
        message: `${officeName} has submitted a new scholar request for ${data.totalScholars} ${data.scholarType}(s) (${data.maleScholars} male, ${data.femaleScholars} female).`,
        type: "info",
      })
    );

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error("Error creating notifications for HR users:", error);
    // Don't fail the request creation if notifications fail
  }

  return scholarRequest;
}

/**
 * Get all scholar requests (for HR)
 */
export async function getAllScholarRequests(filters?: {
  status?: string;
  scholarType?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  const query: any = {};
  if (filters?.status) {
    query.status = filters.status;
  }
  if (filters?.scholarType) {
    query.scholarType = filters.scholarType;
  }

  const [requests, total] = await Promise.all([
    ScholarRequest.find(query)
      .populate("requestedBy", "firstname lastname email")
      .populate("reviewedBy", "firstname lastname email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ScholarRequest.countDocuments(query),
  ]);

  return {
    requests,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get scholar requests by user (for office staff)
 */
export async function getUserScholarRequests(
  userID: mongoose.Types.ObjectId,
  filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }
) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  const query: any = { requestedBy: userID };
  if (filters?.status) {
    query.status = filters.status;
  }

  const [requests, total] = await Promise.all([
    ScholarRequest.find(query)
      .populate("reviewedBy", "firstname lastname email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ScholarRequest.countDocuments(query),
  ]);

  return {
    requests,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single scholar request by ID
 */
export async function getScholarRequestById(
  requestId: string,
  userId: mongoose.Types.ObjectId,
  isHR: boolean
) {
  const request = await ScholarRequest.findById(requestId)
    .populate("requestedBy", "firstname lastname email")
    .populate("reviewedBy", "firstname lastname email")
    .lean();

  if (!request) {
    throw new appError(NOT_FOUND, "Scholar request not found");
  }

  // Check authorization: user must be the requester or HR
  if (!isHR && request.requestedBy._id.toString() !== userId.toString()) {
    throw new appError(UNAUTHORIZED, "Not authorized to view this request");
  }

  return request;
}

/**
 * Review a scholar request (approve/reject) - HR only
 */
export async function reviewScholarRequest(data: {
  requestId: string;
  reviewedBy: mongoose.Types.ObjectId;
  status: "approved" | "rejected";
  reviewNotes?: string;
}) {
  const request = await ScholarRequest.findById(data.requestId);

  if (!request) {
    throw new appError(NOT_FOUND, "Scholar request not found");
  }

  if (request.status !== "pending") {
    throw new appError(BAD_REQUEST, "Request has already been reviewed");
  }

  request.status = data.status;
  request.reviewedBy = data.reviewedBy;
  request.reviewedAt = new Date();
  if (data.reviewNotes) {
    request.reviewNotes = data.reviewNotes;
  }

  await request.save();
  return request;
}

/**
 * Delete a scholar request (only if pending and by the requester)
 */
export async function deleteScholarRequest(
  requestId: string,
  userId: mongoose.Types.ObjectId
) {
  const request = await ScholarRequest.findById(requestId);

  if (!request) {
    throw new appError(NOT_FOUND, "Scholar request not found");
  }

  if (request.requestedBy.toString() !== userId.toString()) {
    throw new appError(UNAUTHORIZED, "Not authorized to delete this request");
  }

  if (request.status !== "pending") {
    throw new appError(
      BAD_REQUEST,
      "Cannot delete a request that has been reviewed"
    );
  }

  await ScholarRequest.findByIdAndDelete(requestId);
  return { message: "Scholar request deleted successfully" };
}
