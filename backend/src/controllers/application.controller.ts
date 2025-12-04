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
  createApplicationSchemaWithConditional,
  updateApplicationStatusSchema,
  getApplicationsSchema,
} from "./application.schemas";
import {
  createApplicationStatusNotification,
  createNotification,
  notifyHRAboutNewApplication,
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

    // Helper to normalize boolean-like values coming from FormData
    const parseBooleanLike = (val: any): boolean | undefined => {
      if (val === undefined || val === null) return undefined;
      if (typeof val === "boolean") return val;
      if (Array.isArray(val)) {
        // If multiple entries exist for the same field, consider true if any entry equals 'true' or boolean true
        try {
          return val.some((v) => String(v) === "true" || v === true);
        } catch (err) {
          return undefined;
        }
      }
      if (typeof val === "string") return val === "true";
      return Boolean(val);
    };

    // Normalize common boolean fields that may come from FormData as strings or arrays
    requestBody.hasRelativeWorking = parseBooleanLike(
      requestBody.hasRelativeWorking
    );
    requestBody.agreedToTerms = parseBooleanLike(requestBody.agreedToTerms);
    // conformity may be present from the frontend
    requestBody.conformity = parseBooleanLike(requestBody.conformity);
    // parentConsent for parent/guardian consent
    requestBody.parentConsent = parseBooleanLike(requestBody.parentConsent);

    // Normalize unknown flag values that may come from FormData as strings/arrays
    const booleanFlags = [
      "fatherNameUnknown",
      "fatherOccupationUnknown",
      "motherNameUnknown",
      "motherOccupationUnknown",
    ];
    for (const f of booleanFlags) {
      if (requestBody[f] !== undefined) {
        requestBody[f] = parseBooleanLike(requestBody[f]);
      }
    }

    const requestData =
      createApplicationSchemaWithConditional.parse(requestBody);

    // Check if user exists
    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");

    // Check if user is blocked
    appAssert(
      !user.blocked,
      FORBIDDEN,
      "Your account has been blocked. You cannot submit applications. Please contact HR for assistance."
    );

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
    let parentIDUrl: string | undefined;

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
      // Handle parentID file upload
      if (files.parentID && files.parentID[0]) {
        parentIDUrl = ensurePdfExt(files.parentID[0]);
        requestBody.parentID = parentIDUrl;
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

    // Defensive: convert parent fields to null when flagged Unknown so Mongoose won't fail on empty strings
    if (requestData.fatherNameUnknown) requestData.fatherName = undefined;
    if (requestData.fatherOccupationUnknown)
      requestData.fatherOccupation = undefined;
    if (requestData.motherNameUnknown) requestData.motherName = undefined;
    if (requestData.motherOccupationUnknown)
      requestData.motherOccupation = undefined;

    // Create the application
    const application = await ApplicationModel.create({
      ...requestData,
      userID,
      profilePhoto,
      idDocument,
      certificates,
      signature,
      parentID: requestBody.parentID || parentIDUrl,
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
        title: "Application Submitted Successfully! ✅",
        message: `Your application for ${positionTitle} position has been submitted successfully. You will be notified of any updates via this system and email.`,
        type: "success",
        relatedApplicationID: (application as any)._id.toString(),
      });

      // Create notification to complete requirements
      await createNotification({
        userID: userID,
        title: "📋 Complete Your Requirements",
        message: `Please submit all required documents to complete your application. Go to the Requirements page to upload your documents.`,
        type: "info",
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

    // Notify all HR users about the new application
    try {
      const applicantName = `${user.firstname} ${user.lastname}`;
      await notifyHRAboutNewApplication(
        (application as any)._id.toString(),
        applicantName,
        application.position
      );
      console.log("HR users notified about new application");
    } catch (error) {
      console.error("Failed to notify HR about new application:", error);
      // Don't fail the request if HR notification fails
    }

    return res.status(CREATED).json({
      message: "Application submitted successfully",
      application,
      requirementsNeeded: true, // Flag to indicate requirements need to be completed
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
    const {
      status,
      position,
      page = 1,
      limit = 10,
      assignedTo,
      priority,
      minRating,
      maxRating,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
    } = query;

    // Build filter object
    const filter: any = {};
    if (status) filter.status = status;
    if (position) filter.position = position;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (priority) filter.priority = priority;

    // Rating range filter
    if (minRating !== undefined || maxRating !== undefined) {
      filter.rating = {};
      if (minRating !== undefined) filter.rating.$gte = minRating;
      if (maxRating !== undefined) filter.rating.$lte = maxRating;
    }

    // Search filter (searches in applicant name, email)
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sortObj: any = {};
    if (sortBy === "priority") {
      // Custom priority sorting: urgent > high > medium > low
      sortObj.priority = sortOrder === "asc" ? 1 : -1;
    } else if (sortBy === "rating") {
      sortObj.rating = sortOrder === "asc" ? 1 : -1;
    } else if (sortBy === "submittedAt") {
      sortObj.submittedAt = sortOrder === "asc" ? 1 : -1;
    } else {
      sortObj.createdAt = sortOrder === "asc" ? 1 : -1;
    }

    // Get applications with pagination
    const applications = await ApplicationModel.find(filter)
      .populate("userID", "firstname lastname email role")
      .populate("reviewedBy", "firstname lastname email role")
      .populate("assignedTo", "firstname lastname email role")
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    // Fetch requirements submission review status for each application
    const RequirementsSubmissionModel = (
      await import("../models/requirementsSubmission.model")
    ).default;

    const applicationsWithRequirements = await Promise.all(
      applications.map(async (app) => {
        const appObj = app.toObject();

        // Find the most recent requirements submission for this user
        const requirementsSubmission =
          await RequirementsSubmissionModel.findOne({
            userID: app.userID._id,
            status: "submitted",
          })
            .sort({ submittedAt: -1 })
            .limit(1);

        // Add the review status to the application object
        return {
          ...appObj,
          requirementsReviewStatus:
            requirementsSubmission?.reviewStatus || "pending",
        };
      })
    );

    // Get total count for pagination
    const totalCount = await ApplicationModel.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    return res.status(OK).json({
      applications: applicationsWithRequirements,
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

    // Add timeline entry for status change
    if (statusChanged) {
      const timelineEntry = {
        action: "status_updated",
        performedBy: userID,
        performedByName: `${user.firstname} ${user.lastname}`,
        timestamp: new Date(),
        previousStatus: currentApplication.status,
        newStatus: updateData.status,
        notes:
          updateData.hrComments || `Status changed to ${updateData.status}`,
      };

      currentApplication.timeline = currentApplication.timeline || [];
      currentApplication.timeline.push(timelineEntry as any);
    }

    // Update student's user status when application status changes to "trainee"
    if (statusChanged && updateData.status === "trainee") {
      const student = await UserModel.findById(currentApplication.userID);
      console.log(
        "🔍 Updating student status to trainee (from Application Management):"
      );
      console.log("- Student found:", !!student);
      console.log("- Student ID:", currentApplication.userID);
      if (student) {
        console.log("- Previous student status:", student.status);
        student.status = "trainee";
        await student.save();
        console.log("✅ Student status updated to:", student.status);
      } else {
        console.log("❌ Student not found!");
      }
    }

    // Update student's user status when application status changes to "training_completed"
    if (statusChanged && updateData.status === "training_completed") {
      const student = await UserModel.findById(currentApplication.userID);
      if (student) {
        console.log("✅ Updating student status to training_completed");
        student.status = "training_completed";
        await student.save();
      }
    }

    // Update student's user status when application is accepted (SA or SM based on position)
    if (statusChanged && updateData.status === "accepted") {
      try {
        const student = await UserModel.findById(currentApplication.userID);
        console.log("🔍 Accept Applicant - Processing status change:");
        console.log("- Application ID:", applicationId);
        console.log("- Student ID:", currentApplication.userID);
        console.log("- Student found:", !!student);
        console.log("- Application position:", currentApplication.position);
        console.log("- Current student status:", student?.status);

        if (student) {
          // Determine status based on position
          const newStatus =
            currentApplication.position === "student_assistant" ? "SA" : "SM";
          console.log(
            `✅ Updating student status from '${student.status}' to '${newStatus}' (position: ${currentApplication.position})`
          );

          student.status = newStatus;
          await student.save();
          console.log(
            "✅ Student status successfully updated to:",
            student.status
          );

          // Update timeline entry to include the new status
          if (
            currentApplication.timeline &&
            currentApplication.timeline.length > 0
          ) {
            const lastEntry = currentApplication.timeline[
              currentApplication.timeline.length - 1
            ] as any;
            lastEntry.notes = `${lastEntry.notes} - User status updated from trainee to ${newStatus}`;
          }
        } else {
          console.error(
            "❌ Student not found for ID:",
            currentApplication.userID
          );
        }
      } catch (error) {
        console.error(
          "❌ Error updating student status during acceptance:",
          error
        );
      }
    }

    // Find and update the application
    const application = await ApplicationModel.findByIdAndUpdate(
      applicationId,
      {
        ...updateData,
        reviewedBy: userID,
        reviewedAt: new Date(),
        timeline: currentApplication.timeline,
      },
      { new: true, runValidators: false }
    )
      .populate("userID", "firstname lastname email role")
      .populate("reviewedBy", "firstname lastname email role")
      .populate("assignedTo", "firstname lastname email role");

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
                interviewWhatToBring: updateData.interviewWhatToBring,
                interviewNotes: updateData.interviewNotes,
              }
            : undefined;

        // Prepare psychometric test details if status is psychometric_scheduled
        const psychometricTestDetails =
          updateData.status === "psychometric_scheduled"
            ? {
                psychometricTestDate: updateData.psychometricTestDate,
                psychometricTestTime: updateData.psychometricTestTime,
                psychometricTestLocation: updateData.psychometricTestLocation,
                psychometricTestWhatToBring:
                  updateData.psychometricTestWhatToBring,
              }
            : undefined;

        await createApplicationStatusNotification(
          (application.userID as any)._id,
          applicationId,
          updateData.status,
          application.position,
          updateData.hrComments,
          interviewDetails,
          psychometricTestDetails
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

// Withdraw application (user can withdraw their own application at any time except accepted)
export const withdrawApplicationHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const applicationId = req.params.id;

    // Find the application
    const application = await ApplicationModel.findOne({
      _id: applicationId,
      userID,
    });

    appAssert(application, NOT_FOUND, "Application not found");

    // Prevent withdrawal of already accepted, rejected, or withdrawn applications
    appAssert(
      application.status !== "accepted" &&
        application.status !== "rejected" &&
        application.status !== "withdrawn",
      BAD_REQUEST,
      "You cannot withdraw an application that has been accepted, rejected, or already withdrawn"
    );

    // Get user info for timeline
    const user = await UserModel.findById(userID);
    const userName = user ? `${user.firstname} ${user.lastname}` : "Applicant";

    // Add timeline entry
    const timelineEntry = {
      action: "withdrawn",
      performedBy: userID,
      performedByName: userName,
      timestamp: new Date(),
      previousStatus: application.status,
      newStatus: "withdrawn",
      notes: "Application withdrawn by applicant",
    };

    application.status = "withdrawn";
    application.timeline = application.timeline || [];
    application.timeline.push(timelineEntry as any);
    await application.save();

    // Do NOT delete the profilePhoto (2x2 pic) - keep all files intact

    return res.status(OK).json({
      message: "Application withdrawn successfully",
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
        // Remove any query string first to make matching reliable
        const urlNoQuery = fileUrl.split("?")[0];

        // Extract public_id from Cloudinary URL (supports folders)
        // Example: https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<folder>/<public_id>.<ext>
        const matches = urlNoQuery.match(
          /\/upload\/(?:v\d+\/)?(.+?)(\.[a-zA-Z0-9]+)?$/
        );
        const publicId = matches ? matches[1] : null;
        if (publicId) {
          // Try deleting as an image first, then fall back to raw if that fails.
          // This covers cases where PDFs/raw files may not end with .pdf in the stored URL
          try {
            // Try deleting as image first
            const res = await cloudinary.uploader.destroy(publicId);
            // If destroy did not succeed (result not 'ok'), try deleting as raw
            if (!res || res.result !== "ok") {
              try {
                await cloudinary.uploader.destroy(publicId, {
                  resource_type: "raw",
                });
              } catch (rawErr) {
                console.error(
                  "Failed to delete file from Cloudinary as raw:",
                  fileUrl,
                  rawErr
                );
              }
            }
          } catch (err) {
            // If deleting as image threw an error, try raw as a fallback
            try {
              await cloudinary.uploader.destroy(publicId, {
                resource_type: "raw",
              });
            } catch (err2) {
              console.error(
                "Failed to delete file from Cloudinary (both image/raw):",
                fileUrl,
                err2
              );
            }
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

// Assign application to HR staff
export const assignApplicationHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const applicationId = req.params.id;
    const { assignedTo } = req.body;

    // Check if user has permission
    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "hr" || user.role === "office",
      FORBIDDEN,
      "Access denied. Only HR and Office staff can assign applications."
    );

    // Verify assigned user exists and is HR/Office
    if (assignedTo) {
      const assignedUser = await UserModel.findById(assignedTo);
      appAssert(assignedUser, NOT_FOUND, "Assigned user not found");
      appAssert(
        assignedUser.role === "hr" || assignedUser.role === "office",
        BAD_REQUEST,
        "Can only assign to HR or Office staff"
      );
    }

    const application = await ApplicationModel.findById(applicationId);
    appAssert(application, NOT_FOUND, "Application not found");

    // Add timeline entry
    const timelineEntry = {
      action: assignedTo ? "assigned" : "unassigned",
      performedBy: userID,
      performedByName: `${user.firstname} ${user.lastname}`,
      timestamp: new Date(),
      notes: assignedTo
        ? `Assigned to ${(await UserModel.findById(assignedTo))?.firstname} ${(await UserModel.findById(assignedTo))?.lastname}`
        : "Assignment removed",
    };

    application.assignedTo = assignedTo || undefined;
    application.assignedAt = assignedTo ? new Date() : undefined;
    application.timeline = application.timeline || [];
    application.timeline.push(timelineEntry as any);
    await application.save();

    await application.populate([
      { path: "userID", select: "firstname lastname email role" },
      { path: "assignedTo", select: "firstname lastname email role" },
      { path: "reviewedBy", select: "firstname lastname email role" },
    ]);

    return res.status(OK).json({
      message: "Application assignment updated successfully",
      application,
    });
  }
);

// Rate application
export const rateApplicationHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const applicationId = req.params.id;
    const { rating, ratingNotes } = req.body;

    // Check if user has permission
    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "hr" || user.role === "office",
      FORBIDDEN,
      "Access denied. Only HR and Office staff can rate applications."
    );

    // Validate rating
    appAssert(
      rating >= 1 && rating <= 5,
      BAD_REQUEST,
      "Rating must be between 1 and 5"
    );

    const application = await ApplicationModel.findById(applicationId);
    appAssert(application, NOT_FOUND, "Application not found");

    // Add timeline entry
    const timelineEntry = {
      action: "rated",
      performedBy: userID,
      performedByName: `${user.firstname} ${user.lastname}`,
      timestamp: new Date(),
      notes: `Rated ${rating}/5${ratingNotes ? `: ${ratingNotes}` : ""}`,
    };

    application.rating = rating;
    application.ratingNotes = ratingNotes || application.ratingNotes;
    application.timeline = application.timeline || [];
    application.timeline.push(timelineEntry as any);
    await application.save();

    await application.populate([
      { path: "userID", select: "firstname lastname email role" },
      { path: "assignedTo", select: "firstname lastname email role" },
      { path: "reviewedBy", select: "firstname lastname email role" },
    ]);

    return res.status(OK).json({
      message: "Application rated successfully",
      application,
    });
  }
);

// Add note to application timeline
export const addApplicationNoteHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const applicationId = req.params.id;
    const { notes } = req.body;

    // Check if user has permission
    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "hr" || user.role === "office",
      FORBIDDEN,
      "Access denied. Only HR and Office staff can add notes."
    );

    appAssert(notes && notes.trim(), BAD_REQUEST, "Note content is required");

    const application = await ApplicationModel.findById(applicationId);
    appAssert(application, NOT_FOUND, "Application not found");

    // Add timeline entry
    const timelineEntry = {
      action: "note_added",
      performedBy: userID,
      performedByName: `${user.firstname} ${user.lastname}`,
      timestamp: new Date(),
      notes: notes.trim(),
    };

    application.timeline = application.timeline || [];
    application.timeline.push(timelineEntry as any);
    await application.save();

    await application.populate([
      { path: "userID", select: "firstname lastname email role" },
      { path: "assignedTo", select: "firstname lastname email role" },
      { path: "reviewedBy", select: "firstname lastname email role" },
    ]);

    return res.status(OK).json({
      message: "Note added successfully",
      application,
    });
  }
);

// Update application priority
export const updateApplicationPriorityHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const applicationId = req.params.id;
    const { priority } = req.body;

    // Check if user has permission
    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "hr" || user.role === "office",
      FORBIDDEN,
      "Access denied. Only HR and Office staff can update priority."
    );

    const validPriorities = ["low", "medium", "high", "urgent"];
    appAssert(
      validPriorities.includes(priority),
      BAD_REQUEST,
      "Invalid priority value"
    );

    const application = await ApplicationModel.findById(applicationId);
    appAssert(application, NOT_FOUND, "Application not found");

    const oldPriority = application.priority || "medium";

    // Add timeline entry
    const timelineEntry = {
      action: "priority_updated",
      performedBy: userID,
      performedByName: `${user.firstname} ${user.lastname}`,
      timestamp: new Date(),
      notes: `Priority changed from ${oldPriority} to ${priority}`,
    };

    application.priority = priority;
    application.timeline = application.timeline || [];
    application.timeline.push(timelineEntry as any);
    await application.save();

    await application.populate([
      { path: "userID", select: "firstname lastname email role" },
      { path: "assignedTo", select: "firstname lastname email role" },
      { path: "reviewedBy", select: "firstname lastname email role" },
    ]);

    return res.status(OK).json({
      message: "Priority updated successfully",
      application,
    });
  }
);

// Bulk update applications
export const bulkUpdateApplicationsHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const { applicationIds, action, data } = req.body;

    // Check if user has permission
    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "hr" || user.role === "office",
      FORBIDDEN,
      "Access denied. Only HR and Office staff can bulk update applications."
    );

    appAssert(
      Array.isArray(applicationIds) && applicationIds.length > 0,
      BAD_REQUEST,
      "Application IDs array is required"
    );

    const validActions = [
      "assign",
      "update_status",
      "update_priority",
      "add_tag",
    ];
    appAssert(validActions.includes(action), BAD_REQUEST, "Invalid action");

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const appId of applicationIds) {
      try {
        const application = await ApplicationModel.findById(appId);
        if (!application) {
          results.failed++;
          results.errors.push(`Application ${appId} not found`);
          continue;
        }

        const timelineEntry: any = {
          action: `bulk_${action}`,
          performedBy: userID,
          performedByName: `${user.firstname} ${user.lastname}`,
          timestamp: new Date(),
        };

        switch (action) {
          case "assign":
            if (data.assignedTo) {
              const assignedUser = await UserModel.findById(data.assignedTo);
              if (
                assignedUser &&
                (assignedUser.role === "hr" || assignedUser.role === "office")
              ) {
                application.assignedTo = data.assignedTo;
                application.assignedAt = new Date();
                timelineEntry.notes = `Bulk assigned to ${assignedUser.firstname} ${assignedUser.lastname}`;
              }
            }
            break;

          case "update_status":
            if (data.status) {
              timelineEntry.previousStatus = application.status;
              timelineEntry.newStatus = data.status;
              application.status = data.status;
              timelineEntry.notes = `Bulk status update: ${data.status}`;
            }
            break;

          case "update_priority":
            if (data.priority) {
              const oldPriority = application.priority || "medium";
              application.priority = data.priority;
              timelineEntry.notes = `Bulk priority update: ${oldPriority} → ${data.priority}`;
            }
            break;

          case "add_tag":
            if (data.tag) {
              application.tags = application.tags || [];
              if (!application.tags.includes(data.tag)) {
                application.tags.push(data.tag);
                timelineEntry.notes = `Bulk tag added: ${data.tag}`;
              }
            }
            break;
        }

        application.timeline = application.timeline || [];
        application.timeline.push(timelineEntry);
        await application.save();
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Application ${appId}: ${error.message}`);
      }
    }

    return res.status(OK).json({
      message: `Bulk update completed. Success: ${results.success}, Failed: ${results.failed}`,
      results,
    });
  }
);
