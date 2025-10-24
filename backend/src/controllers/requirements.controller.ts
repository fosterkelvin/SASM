import { Request, Response } from "express";
import catchErrors from "../utils/catchErrors";
import RequirementsSubmissionModel from "../models/requirementsSubmission.model";
import ApplicationModel from "../models/application.model";
import UserModel from "../models/user.model";
import { CREATED, OK } from "../constants/http";
import cloudinary from "../config/cloudinary";
import mongoose from "mongoose";
import { createNotification } from "../services/notification.service";

// Helper to extract URL from uploaded file
const getFileUrl = (file: any): string | null => {
  const url = file.secure_url || file.url || file.path;
  if (url) return url;

  const publicId = file.public_id || file.publicId;
  if (publicId) {
    try {
      return cloudinary.url(publicId, { secure: true });
    } catch (e) {
      return null;
    }
  }
  return null;
};

// Helper to extract public ID from file
const getFilePublicId = (file: any): string | null => {
  return file.public_id || file.publicId || null;
};

// Create or update requirements submission
export const createRequirementsSubmission = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const files = (req.files as Express.Multer.File[]) || [];

    // Check if this is a resubmit
    const isResubmit = req.body.resubmit === "true";

    // Parse itemsJson (contains all items with their current state)
    let itemsJson: any[] = [];
    if (req.body.itemsJson) {
      try {
        itemsJson =
          typeof req.body.itemsJson === "string"
            ? JSON.parse(req.body.itemsJson)
            : req.body.itemsJson;
      } catch (err) {
        console.error("[requirements] Failed to parse itemsJson", err);
      }
    }

    console.log("[requirements] Processing submission:", {
      userID,
      isResubmit,
      filesCount: files.length,
      itemsCount: itemsJson.length,
      fileFieldnames: files.map((f) => f.fieldname),
    });

    // Build the complete items array
    const processedItems: any[] = [];

    for (let idx = 0; idx < itemsJson.length; idx++) {
      const jsonItem = itemsJson[idx];
      const expectedFieldname = `file_item_${idx}`;

      // Check if there's a new file upload for this item
      const uploadedFile = files.find((f) => f.fieldname === expectedFieldname);

      if (uploadedFile) {
        // New file uploaded - use it
        const url = getFileUrl(uploadedFile);
        const publicId = getFilePublicId(uploadedFile);

        if (!url) {
          console.error(
            `[requirements] No URL for uploaded file at index ${idx}`
          );
          continue;
        }

        console.log(`[requirements] New upload at index ${idx}:`, {
          label: jsonItem.text || jsonItem.label,
          fieldname: expectedFieldname,
          filename: uploadedFile.originalname,
        });

        processedItems.push({
          label: jsonItem.text || jsonItem.label || `Item ${idx + 1}`,
          note: jsonItem.note || null,
          url,
          publicId,
          originalName: uploadedFile.originalname,
          mimetype: uploadedFile.mimetype,
          size: uploadedFile.size,
          clientId: jsonItem.id,
        });
      } else if (
        jsonItem.file &&
        jsonItem.file.url &&
        !jsonItem.file.url.startsWith("data:")
      ) {
        // No new upload - preserve existing file
        console.log(
          `[requirements] Preserving existing file at index ${idx}:`,
          {
            label: jsonItem.text || jsonItem.label,
            url: jsonItem.file.url,
          }
        );

        processedItems.push({
          label: jsonItem.text || jsonItem.label || `Item ${idx + 1}`,
          note: jsonItem.note || null,
          url: jsonItem.file.url,
          publicId: jsonItem.file.id || null,
          originalName: jsonItem.file.name || jsonItem.text || jsonItem.label,
          mimetype: jsonItem.file.type || null,
          size: jsonItem.file.size || 0,
          clientId: jsonItem.id,
        });
      } else {
        // No file for this item (should not happen if frontend validates)
        console.warn(`[requirements] No file at index ${idx}:`, {
          label: jsonItem.text || jsonItem.label,
        });
      }
    }

    console.log("[requirements] Processed items count:", processedItems.length);

    if (processedItems.length === 0) {
      return res.status(400).json({
        message: "No valid items to submit",
      });
    }

    // Find existing submission
    let existingSubmission = await RequirementsSubmissionModel.findOne({
      userID,
      status: "submitted",
    });

    if (existingSubmission) {
      if (!isResubmit) {
        return res.status(403).json({
          message: "Requirements already submitted. Use resubmit to update.",
        });
      }

      // Resubmit - delete old files that are being replaced
      console.log("[requirements] Resubmit - checking for old files to delete");

      for (let idx = 0; idx < processedItems.length; idx++) {
        const newItem = processedItems[idx];
        const oldItem = existingSubmission.items[idx];

        if (
          oldItem &&
          oldItem.publicId &&
          newItem.publicId &&
          oldItem.publicId !== newItem.publicId
        ) {
          // Different file - delete the old one
          try {
            const isPdf = (oldItem.mimetype || "").includes("pdf");
            await cloudinary.uploader.destroy(oldItem.publicId, {
              resource_type: isPdf ? "raw" : "image",
            });
            console.log(`[requirements] Deleted old file: ${oldItem.publicId}`);
          } catch (err) {
            console.error(
              `[requirements] Failed to delete old file: ${oldItem.publicId}`,
              err
            );
          }
        }
      }

      // Update existing submission
      existingSubmission.items = processedItems as any;
      existingSubmission.submittedAt = new Date();
      await existingSubmission.save();

      console.log("[requirements] Resubmit successful");

      return res.status(OK).json({
        message: "Requirements resubmitted successfully",
        submission: existingSubmission,
      });
    }

    // Initial submission - create new
    const newSubmission = await RequirementsSubmissionModel.create({
      userID,
      items: processedItems,
      status: "submitted",
      submittedAt: new Date(),
    });

    // Update the most recent application to mark requirements as completed
    try {
      const recentApplication = await ApplicationModel.findOne({ userID })
        .sort({ createdAt: -1 })
        .limit(1);

      if (recentApplication && !recentApplication.requirementsCompleted) {
        recentApplication.requirementsCompleted = true;
        recentApplication.requirementsCompletedAt = new Date();
        await recentApplication.save();

        // Create notification for successful requirements submission
        await createNotification({
          userID: userID,
          title: "✅ Requirements Submitted Successfully",
          message:
            "Your required documents have been submitted successfully. Your application is now complete and will be reviewed by HR.",
          type: "success",
          relatedApplicationID: (recentApplication as any)._id.toString(),
        });

        console.log(
          `[requirements] Marked application ${(recentApplication as any)._id} requirements as completed`
        );
      }
    } catch (error) {
      console.error(
        "[requirements] Failed to update application requirements status:",
        error
      );
      // Don't fail the requirements submission if application update fails
    }

    console.log("[requirements] Initial submission successful");

    return res.status(CREATED).json({
      message: "Requirements submitted successfully",
      submission: newSubmission,
    });
  }
);

// Get current user's submissions
export const getUserRequirementsSubmissions = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;

    const subs = await RequirementsSubmissionModel.find({ userID }).sort({
      submittedAt: -1,
    });
    return res.status(OK).json({ submissions: subs });
  }
);

// Delete a specific file from the user's submission by publicId
export const deleteRequirementFile = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ message: "publicId required" });
    }

    // Find the submission
    const submission = await RequirementsSubmissionModel.findOne({
      userID,
      status: "submitted",
    });

    if (!submission) {
      return res.status(404).json({ message: "No submission found" });
    }

    // Find and remove the item
    const itemIndex = submission.items.findIndex(
      (it: any) => it.publicId === publicId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "File not found" });
    }

    const removed = submission.items[itemIndex];

    // Delete from Cloudinary
    try {
      const isPdf = (removed.mimetype || "").includes("pdf");
      await cloudinary.uploader.destroy(publicId, {
        resource_type: isPdf ? "raw" : "image",
      });
    } catch (err) {
      console.error("[requirements] Failed to delete from cloudinary", err);
    }

    // Remove from array
    submission.items.splice(itemIndex, 1);
    await submission.save();

    return res.status(OK).json({
      message: "File removed successfully",
      submission,
    });
  }
);

// Get current requirements status
export const getCurrentRequirementsStatus = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;

    const submission = await RequirementsSubmissionModel.findOne({
      userID,
      status: "submitted",
    });

    return res.status(OK).json({
      submitted: submission,
      draft: null,
    });
  }
);

// Get all requirements submissions (HR only)
export const getAllRequirementsSubmissions = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;

    // Fetch user to check role
    const user = await UserModel.findById(userID);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Only allow HR to access this endpoint
    if (user.role !== "hr") {
      return res.status(403).json({ message: "Unauthorized access - HR only" });
    }

    // Get all submissions with user information
    const submissions = await RequirementsSubmissionModel.find({
      status: "submitted",
    })
      .populate("userID", "firstname lastname email")
      .populate("reviewedByHR", "firstname lastname")
      .sort({ submittedAt: -1 });

    return res.status(OK).json({ submissions });
  }
);

// Approve or reject requirements submission (HR only)
export const reviewRequirementsSubmission = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const { submissionId, reviewStatus, reviewNotes } = req.body;

    // Fetch user to check role
    const user = await UserModel.findById(userID);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Only allow HR to access this endpoint
    if (user.role !== "hr") {
      return res.status(403).json({ message: "Unauthorized access - HR only" });
    }

    // Validate reviewStatus
    if (!["approved", "rejected", "pending"].includes(reviewStatus)) {
      return res.status(400).json({
        message:
          "Invalid review status. Must be 'approved', 'rejected', or 'pending'",
      });
    }

    // Find the submission
    const submission = await RequirementsSubmissionModel.findById(submissionId);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Update review fields
    submission.reviewStatus = reviewStatus;
    submission.reviewedByHR = new mongoose.Types.ObjectId(userID);
    submission.reviewedAt = new Date();
    if (reviewNotes) {
      submission.reviewNotes = reviewNotes;
    }

    await submission.save();

    // Create notification for student
    const statusText =
      reviewStatus === "approved"
        ? "approved"
        : reviewStatus === "rejected"
          ? "rejected"
          : "pending review";

    await createNotification({
      userID: submission.userID.toString(),
      title: `Requirements ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
      message:
        reviewStatus === "approved"
          ? "Congratulations! Your requirements have been approved by HR."
          : reviewStatus === "rejected"
            ? `Your requirements submission needs attention. ${reviewNotes || "Please review and resubmit."}`
            : "Your requirements are being reviewed by HR.",
      type:
        reviewStatus === "approved"
          ? "success"
          : reviewStatus === "rejected"
            ? "error"
            : "info",
    });

    return res.status(OK).json({
      message: `Submission ${statusText}`,
      submission,
    });
  }
);

export default {
  createRequirementsSubmission,
  getUserRequirementsSubmissions,
  deleteRequirementFile,
  getCurrentRequirementsStatus,
  getAllRequirementsSubmissions,
  reviewRequirementsSubmission,
};
