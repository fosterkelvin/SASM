import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "path";
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
import {
  createApplicationStatusNotification,
  createNotification,
} from "../services/notification.service";
import { sendMail } from "../utils/sendMail";
import { getApplicationStatusEmailTemplate } from "../utils/emailTemplate";

// Create a new application
export const createApplicationHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;

    // Parse form data - seminars and relatives might be JSON string
    const requestBody = { ...req.body };
    if (requestBody.seminars && typeof requestBody.seminars === "string") {
      try {
        requestBody.seminars = JSON.parse(requestBody.seminars);
      } catch (error) {
        requestBody.seminars = [];
      }
    }
    if (requestBody.relatives && typeof requestBody.relatives === "string") {
      try {
        requestBody.relatives = JSON.parse(requestBody.relatives);
      } catch (error) {
        requestBody.relatives = [];
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

    // Handle file uploads (Cloudinary URLs)
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    // Debug: log received file fieldnames and counts (temporary)
    try {
      if (files) {
        console.log(
          "[DEBUG] Received file fields:",
          Object.keys(files).map((k) => ({ field: k, count: files[k].length }))
        );
      } else {
        console.log("[DEBUG] No files received in req.files");
      }
    } catch (err) {
      console.error("[DEBUG] Error logging req.files:", err);
    }
    let profilePhoto: string | undefined;
    let idDocument: string | undefined;
    let certificates: string[] = [];
    let signature: string | undefined;

    if (files) {
      // Helper: prefer secure_url/url over path and append .pdf when mimetype is PDF
      const ensurePdfExt = (file: any): string | undefined => {
        if (!file) return undefined;
        // Prefer secure_url or url if provided by Cloudinary storage
        const candidate: string | undefined =
          file.secure_url || file.url || file.path;
        if (candidate) {
          // If Cloudinary already returned a URL, try to return a URL that ends with .pdf for PDFs.
          try {
            const isPdf = file && file.mimetype === "application/pdf";
            if (isPdf && !candidate.toLowerCase().endsWith(".pdf")) {
              // If public_id available, use cloudinary.url to generate a canonical URL with format
              const pub = file.public_id;
              if (pub) {
                try {
                  return cloudinary.url(pub, {
                    resource_type: "raw",
                    format: "pdf",
                    secure: true,
                  });
                } catch (err) {
                  // fallback to appending .pdf
                  return `${candidate}.pdf`;
                }
              }

              // Attempt to parse public_id from the candidate URL (after '/upload/')
              try {
                const uploadIndex = candidate.indexOf("/upload/");
                if (uploadIndex !== -1) {
                  let rest = candidate.substring(
                    uploadIndex + "/upload/".length
                  );
                  // remove version prefix if present (e.g. v123456789/)
                  const versionMatch = rest.match(/^v\d+\/(.*)$/);
                  if (versionMatch && versionMatch[1]) {
                    rest = versionMatch[1];
                  }
                  const parsedPublicId = rest;
                  try {
                    return cloudinary.url(parsedPublicId, {
                      resource_type: "raw",
                      format: "pdf",
                      secure: true,
                    });
                  } catch (err) {
                    return `${candidate}.pdf`;
                  }
                }
              } catch (err) {
                // fallback
                return `${candidate}.pdf`;
              }
            }
          } catch (err) {
            // ignore
          }
          return candidate;
        }

        // If there's no URL but we have a public_id, construct one via cloudinary API
        if (file.public_id) {
          try {
            const resource_type =
              file.resource_type ||
              (file.mimetype === "application/pdf" ? "raw" : "image");
            const format =
              file.format ||
              (file.mimetype === "application/pdf" ? "pdf" : undefined);
            const url = cloudinary.url(file.public_id, {
              resource_type,
              format,
              secure: true,
            });
            return url;
          } catch (err) {
            console.error(
              "[DEBUG] Failed to construct cloudinary url from public_id:",
              err
            );
          }
        }

        return undefined;
      };

      // Debug: log received file fieldnames and counts (temporary)
      try {
        console.log(
          "[DEBUG] Received file fields:",
          Object.keys(files).map((k) => ({ field: k, count: files[k].length }))
        );
      } catch (err) {
        console.error("[DEBUG] Error logging req.files:", err);
      }

      // Debug: log metadata of first certificate file (temporary)
      try {
        if (files.certificates && files.certificates[0]) {
          const sample = files.certificates[0] as any;
          console.log("[DEBUG] Sample certificate file metadata:", {
            originalname: sample.originalname,
            mimetype: sample.mimetype,
            size: sample.size,
            path: sample.path,
            url: sample.url || sample.secure_url || sample.path,
            secure_url: sample.secure_url,
            public_id: sample.public_id,
          });
        }
      } catch (err) {
        console.error(
          "[DEBUG] Error logging sample certificate metadata:",
          err
        );
      }

      if (files.profilePhoto && files.profilePhoto[0]) {
        profilePhoto = ensurePdfExt(files.profilePhoto[0]);
      }
      if (files.idDocument && files.idDocument[0]) {
        idDocument = ensurePdfExt(files.idDocument[0]);
      }
      if (files.certificates) {
        certificates = files.certificates
          .map((f) => {
            const file = f as any;
            const computed =
              ensurePdfExt(file) || file.path || file.url || file.secure_url;
            if (
              file &&
              file.mimetype === "application/pdf" &&
              typeof computed === "string" &&
              !computed.toLowerCase().endsWith(".pdf")
            ) {
              return `${computed}.pdf`;
            }
            return computed;
          })
          .filter((v): v is string => typeof v === "string");
      }
      if (files.signature && files.signature[0]) {
        signature = ensurePdfExt(files.signature[0]);
        // set requestBody.signature to Cloudinary URL for validation
        requestBody.signature = signature;
      }
    }

    // Debug: show final certificate URLs
    try {
      console.log("[DEBUG] Final certificate URLs:", certificates);
    } catch (err) {
      console.error("[DEBUG] Error logging final certificates:", err);
    }

    // Create the application
    const application = await ApplicationModel.create({
      ...requestData,
      userID,
      profilePhoto,
      idDocument,
      certificates,
      signature,
    });

    // Populate user information
    await application.populate("userID", "firstname lastname email role");

    // Create application submission notification
    try {
      const positionTitle =
        application.position === "student_assistant"
          ? "Student Assistant"
          : "Student Marshal";

      await createNotification({
        userID: userID,
        title: "Application Submitted Successfully! \u2705",
        message: `Your application for ${positionTitle} position has been submitted successfully. You will be notified of any updates via this system and email.`,
        type: "success",
        relatedApplicationID: (application as any)._id.toString(),
      });

      // Send confirmation email to the student
      const applicantName = `${user.firstname} ${user.lastname}`;
      const emailTemplate = getApplicationStatusEmailTemplate(
        applicantName,
        positionTitle,
        "submitted",
        `Your application for ${positionTitle} position has been submitted successfully. You will be notified of any updates via this system and email.`
      );

      await sendMail({
        to: user.email,
        subject: emailTemplate.subject,
        text: emailTemplate.text,
        html: emailTemplate.html,
      });

      console.log(
        `Application submission confirmation email sent to ${user.email}`
      );
    } catch (error) {
      console.error(
        "Failed to create application submission notification or send email:",
        error
      );
      // Don't fail the request if notification or email creation fails
    }

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

    // Get the current application to check if status is changing
    const currentApplication = await ApplicationModel.findById(applicationId);
    appAssert(currentApplication, NOT_FOUND, "Application not found");

    const statusChanged = currentApplication.status !== updateData.status;

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

    // Create notification if status changed and not from pending to under_review
    // (skip notification for the initial status change when HR first reviews)
    if (
      statusChanged &&
      !(
        currentApplication.status === "pending" &&
        updateData.status === "under_review"
      )
    ) {
      try {
        // Prepare interview details if status is interview_scheduled
        const interviewDetails =
          updateData.status === "interview_scheduled"
            ? {
                interviewDate: updateData.interviewDate,
                interviewTime: updateData.interviewTime,
                interviewLocation: updateData.interviewLocation,
                interviewNotes: updateData.interviewNotes,
              }
            : undefined;

        await createApplicationStatusNotification(
          (application.userID as any)._id,
          applicationId,
          updateData.status,
          application.position,
          updateData.hrComments,
          interviewDetails
        );
      } catch (error) {
        console.error("Failed to create notification:", error);
        // Don't fail the request if notification creation fails
      }
    }

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

    // Delete files from Cloudinary
    const filesToDelete = [];
    if (application.profilePhoto) filesToDelete.push(application.profilePhoto);
    if (application.certificates && application.certificates.length > 0) {
      filesToDelete.push(...application.certificates);
    }
    if (application.signature) filesToDelete.push(application.signature);

    // Extract public_id from Cloudinary URLs and delete
    for (const fileUrl of filesToDelete) {
      try {
        // Extract public_id from Cloudinary URL (supports folders)
        // Example: https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<folder>/<public_id>.<ext>
        const matches = fileUrl.match(
          /\/upload\/(?:v\d+\/)?(.+?)(\.[a-zA-Z0-9]+)?$/
        );
        const publicId = matches ? matches[1] : null;
        if (publicId) {
          // If the file was uploaded as a PDF it was stored as a raw resource_type.
          // Detect PDF by url extension and pass resource_type: 'raw' when destroying.
          const isPdf = /\.pdf$/i.test(fileUrl);
          if (isPdf) {
            await cloudinary.uploader.destroy(publicId, {
              resource_type: "raw",
            });
          } else {
            await cloudinary.uploader.destroy(publicId);
          }
        } else {
          console.error(
            "Could not extract Cloudinary public_id from URL:",
            fileUrl
          );
        }
      } catch (err) {
        // Log error but continue
        console.error("Failed to delete file from Cloudinary:", fileUrl, err);
      }
    }

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
