import { Request, Response } from "express";
import catchErrors from "../utils/catchErrors";
import ApplicationModel from "../models/application.model";
import UserModel from "../models/user.model";
import appAssert from "../utils/appAssert";
import {
  BAD_REQUEST,
  CREATED,
  FORBIDDEN,
  NOT_FOUND,
  OK,
} from "../constants/http";
import {
  createApplicationSchema,
  updateApplicationStatusSchema,
  getApplicationsSchema,
} from "./application.schemas";

// Create a new application
export const createApplicationHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;

    // Parse form data - seminars might be JSON string
    const requestBody = { ...req.body };
    if (requestBody.seminars && typeof requestBody.seminars === "string") {
      try {
        requestBody.seminars = JSON.parse(requestBody.seminars);
      } catch (error) {
        requestBody.seminars = [];
      }
    }

    // Convert string values to proper types for FormData submissions
    if (requestBody.age && typeof requestBody.age === "string") {
      requestBody.age = parseInt(requestBody.age, 10);
    }

    if (
      requestBody.hasRelativeWorking &&
      typeof requestBody.hasRelativeWorking === "string"
    ) {
      requestBody.hasRelativeWorking =
        requestBody.hasRelativeWorking === "true";
    }

    if (
      requestBody.agreedToTerms &&
      typeof requestBody.agreedToTerms === "string"
    ) {
      requestBody.agreedToTerms = requestBody.agreedToTerms === "true";
    }

    const requestData = createApplicationSchema.parse(requestBody);

    // Check if user exists
    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");

    // Check if user already has a pending or approved application
    const existingApplication = await ApplicationModel.findOne({
      userID,
      status: {
        $in: ["pending", "under_review", "approved", "interview_scheduled"],
      },
    });

    appAssert(
      !existingApplication,
      BAD_REQUEST,
      "You already have an active application. Please wait for it to be processed or contact HR."
    );

    // Handle file uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let profilePhoto: string | undefined;
    let idDocument: string | undefined;
    let certificates: string[] = [];

    if (files) {
      if (files.profilePhoto && files.profilePhoto[0]) {
        profilePhoto = files.profilePhoto[0].path;
      }
      if (files.idDocument && files.idDocument[0]) {
        idDocument = files.idDocument[0].path;
      }
      if (files.certificates) {
        certificates = files.certificates.map((file) => file.path);
      }
    }

    // Create the application
    const application = await ApplicationModel.create({
      ...requestData,
      userID,
      profilePhoto,
      idDocument,
      certificates,
    });

    // Populate user information
    await application.populate("userID", "firstname lastname email role");

    return res.status(CREATED).json({
      message: "Application submitted successfully",
      application,
    });
  }
);

// Get current user's applications
export const getUserApplicationsHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;

    const applications = await ApplicationModel.find({ userID })
      .populate("userID", "firstname lastname email role")
      .populate("reviewedBy", "firstname lastname email role")
      .sort({ createdAt: -1 });

    return res.status(OK).json({
      applications,
      count: applications.length,
    });
  }
);

// Get specific application by ID (for current user)
export const getApplicationByIdHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const applicationId = req.params.id;

    const application = await ApplicationModel.findOne({
      _id: applicationId,
      userID,
    })
      .populate("userID", "firstname lastname email role")
      .populate("reviewedBy", "firstname lastname email role");

    appAssert(application, NOT_FOUND, "Application not found");

    return res.status(OK).json({ application });
  }
);

// Get all applications (HR/Office staff only)
export const getAllApplicationsHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;

    // Check if user has permission to view all applications
    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "hr" || user.role === "office",
      FORBIDDEN,
      "Access denied. Only HR and Office staff can view all applications."
    );

    // Parse query parameters
    const query = getApplicationsSchema.parse(req.query);
    const { status, position, page = 1, limit = 10 } = query;

    // Build filter object
    const filter: any = {};
    if (status) filter.status = status;
    if (position) filter.position = position;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get applications with pagination
    const applications = await ApplicationModel.find(filter)
      .populate("userID", "firstname lastname email role")
      .populate("reviewedBy", "firstname lastname email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalCount = await ApplicationModel.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    return res.status(OK).json({
      applications,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  }
);

// Update application status (HR/Office staff only)
export const updateApplicationStatusHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const applicationId = req.params.id;
    const updateData = updateApplicationStatusSchema.parse(req.body);

    // Check if user has permission to update applications
    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "hr" || user.role === "office",
      FORBIDDEN,
      "Access denied. Only HR and Office staff can update applications."
    );

    // Find and update the application
    const application = await ApplicationModel.findByIdAndUpdate(
      applicationId,
      {
        ...updateData,
        reviewedBy: userID,
        reviewedAt: new Date(),
      },
      { new: true }
    )
      .populate("userID", "firstname lastname email role")
      .populate("reviewedBy", "firstname lastname email role");

    appAssert(application, NOT_FOUND, "Application not found");

    return res.status(OK).json({
      message: "Application status updated successfully",
      application,
    });
  }
);

// Delete application (user can only delete their own pending applications)
export const deleteApplicationHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const applicationId = req.params.id;

    // Find the application
    const application = await ApplicationModel.findOne({
      _id: applicationId,
      userID,
    });

    appAssert(application, NOT_FOUND, "Application not found");

    // Only allow deletion of pending applications
    appAssert(
      application.status === "pending",
      BAD_REQUEST,
      "You can only delete pending applications"
    );

    await ApplicationModel.findByIdAndDelete(applicationId);

    return res.status(OK).json({
      message: "Application deleted successfully",
    });
  }
);

// Get application statistics (HR/Office staff only)
export const getApplicationStatsHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;

    // Check if user has permission
    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "hr" || user.role === "office",
      FORBIDDEN,
      "Access denied. Only HR and Office staff can view application statistics."
    );

    // Get statistics
    const stats = await ApplicationModel.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const positionStats = await ApplicationModel.aggregate([
      {
        $group: {
          _id: "$position",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent applications
    const recentApplications = await ApplicationModel.find()
      .populate("userID", "firstname lastname email")
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(OK).json({
      statusStats: stats,
      positionStats,
      recentApplications,
    });
  }
);
