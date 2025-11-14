import { Request, Response } from "express";
import catchErrors from "../utils/catchErrors";
import RequirementsSubmissionModel from "../models/requirementsSubmission.model";
import ApplicationModel from "../models/application.model";
import UserModel from "../models/user.model";
import { CREATED, OK } from "../constants/http";
import cloudinary from "../config/cloudinary";
import mongoose from "mongoose";
import { createNotification } from "../services/notification.service";

// Helper to extract URL from uploaded file (robust for PDFs/raw)
// This is kept for compatibility when a storage adapter provides direct URLs,
// but requirements now use memory storage + manual upload.
const getFileUrl = (file: any): string | null => {
  // Prefer the direct URL returned by the storage adapter
  const direct = file?.secure_url || file?.url || file?.path;
  const isPdf = file?.mimetype === "application/pdf";
  if (direct) {
    // If it's a PDF and the URL doesn't end with .pdf, attempt to generate a canonical PDF URL
    try {
      if (
        isPdf &&
        typeof direct === "string" &&
        !direct.toLowerCase().endsWith(".pdf")
      ) {
        const pub = file?.public_id || file?.publicId;
        if (pub) {
          try {
            return cloudinary.url(pub, {
              resource_type: "raw",
              format: "pdf",
              secure: true,
            });
          } catch {
            // Fallback: append .pdf to the provided URL (best-effort)
            return `${direct}.pdf`;
          }
        }
      }
    } catch {
      // ignore and return direct below
    }
    return direct;
  }

  // If no direct URL, try constructing one from public_id
  const publicId = file?.public_id || file?.publicId;
  if (publicId) {
    try {
      return cloudinary.url(publicId, {
        resource_type: isPdf ? "raw" : "image",
        format: isPdf ? "pdf" : undefined,
        secure: true,
      });
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

// Upload a single file buffer to Cloudinary and return the result
const uploadToCloudinary = async (
  file: Express.Multer.File,
  fieldname: string
): Promise<{ url: string; publicId: string }> => {
  const isPdf = file.mimetype === "application/pdf";
  const folder = `uploads/${fieldname}`;
  const publicId = `${fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}`;

  return await new Promise((resolve, reject) => {
    const options: any = {
      resource_type: isPdf ? "raw" : "image",
      folder,
      public_id: publicId,
      use_filename: false,
      unique_filename: false,
      overwrite: true,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (err, result) => {
        if (err || !result) {
          return reject(err || new Error("Failed to upload file"));
        }
        resolve({
          url: (result.secure_url as string) || (result.url as string),
          publicId: (result.public_id as string) || "",
        });
      }
    );

    // Write the in-memory buffer to Cloudinary
    uploadStream.end(file.buffer);
  });
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
    // Track uploaded assets in case we need to roll back on a later failure
    const uploadedTemp: Array<{ publicId: string; mimetype: string }> = [];

    const rollbackUploads = async () => {
      for (const up of uploadedTemp) {
        try {
          const isPdf = (up.mimetype || "").includes("pdf");
          await cloudinary.uploader.destroy(up.publicId, {
            resource_type: isPdf ? "raw" : "image",
          });
        } catch (e) {
          console.error("[requirements] rollback failed for", up.publicId, e);
        }
      }
    };

    for (let idx = 0; idx < itemsJson.length; idx++) {
      const jsonItem = itemsJson[idx];
      const expectedFieldname = `file_item_${idx}`;

      // Check if there's a new file upload for this item
      const uploadedFile = files.find((f) => f.fieldname === expectedFieldname);

      if (uploadedFile) {
        // New file uploaded - send to Cloudinary (memory storage -> cloud)
        let url: string | null = null;
        let publicId: string | null = null;
        try {
          const uploaded = await uploadToCloudinary(
            uploadedFile,
            expectedFieldname
          );
          url = uploaded.url;
          publicId = uploaded.publicId;
          // Track temp upload for potential rollback
          if (publicId) {
            uploadedTemp.push({ publicId, mimetype: uploadedFile.mimetype });
          }
        } catch (e: any) {
          console.error(
            `[requirements] Cloudinary upload failed at index ${idx}`,
            e
          );
          // Attempt to rollback previously uploaded assets so we don't leave orphans
          await rollbackUploads();
          // Surface a clear error for empty file condition
          if (
            e?.message &&
            String(e.message).toLowerCase().includes("empty file")
          ) {
            return res.status(400).json({
              message: `Upload failed for item ${idx + 1}: File appears to be empty. Please reselect and try again.`,
              failedIndex: idx,
            });
          }
          return res.status(400).json({
            message: `Upload failed for item ${idx + 1}. Please try again.`,
            failedIndex: idx,
          });
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

      const resubmittedRejectedDocuments: string[] = [];

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

          // Check if this was a rejected document being replaced
          if (oldItem.documentStatus === "rejected") {
            resubmittedRejectedDocuments.push(newItem.label);
            // Reset document status to pending for review
            (newItem as any).documentStatus = "pending";
            (newItem as any).rejectionReason = undefined;
            (newItem as any).reviewedByHR = undefined;
            (newItem as any).reviewedAt = undefined;
          }
        }
      }

      // Update existing submission
      existingSubmission.items = processedItems as any;
      existingSubmission.submittedAt = new Date();

      // If submission was approved but rejected documents were resubmitted, set back to pending
      if (
        resubmittedRejectedDocuments.length > 0 &&
        existingSubmission.reviewStatus === "approved"
      ) {
        existingSubmission.reviewStatus = "pending";
      }

      await existingSubmission.save();

      // Notify HR about resubmitted rejected documents
      if (resubmittedRejectedDocuments.length > 0) {
        try {
          // Get user info for the notification
          const user = await UserModel.findById(userID);
          const userName = user
            ? `${user.firstname} ${user.lastname}`
            : "A student";

          // Get all HR users
          const hrUsers = await UserModel.find({ role: "hr" });

          // Create notification for each HR user
          for (const hrUser of hrUsers) {
            await createNotification({
              userID: (hrUser as any)._id.toString(),
              title: "📄 Rejected Document Resubmitted",
              message: `${userName} has resubmitted the following rejected document(s): ${resubmittedRejectedDocuments.join(", ")}. Please review the updated submission.`,
              type: "info",
            });
          }

          console.log(
            `[requirements] Notified HR about ${resubmittedRejectedDocuments.length} resubmitted document(s)`
          );
        } catch (error) {
          console.error(
            "[requirements] Failed to notify HR about resubmission:",
            error
          );
          // Don't fail the resubmission if notification fails
        }
      }

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

    // If approving the entire submission, also approve all individual documents
    if (reviewStatus === "approved") {
      submission.items = submission.items.map((item: any) => ({
        ...item,
        documentStatus: "approved",
        reviewedByHR: new mongoose.Types.ObjectId(userID),
        reviewedAt: new Date(),
        // Clear rejection reason if any
        rejectionReason: undefined,
      }));
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

// Review individual document (HR only)
export const reviewDocument = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const { submissionId, documentIndex, documentStatus, rejectionReason } =
      req.body;

    // Fetch user to check role
    const user = await UserModel.findById(userID);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Only allow HR to access this endpoint
    if (user.role !== "hr") {
      return res.status(403).json({ message: "Unauthorized access - HR only" });
    }

    // Validate documentStatus
    if (!["approved", "rejected", "pending"].includes(documentStatus)) {
      return res.status(400).json({
        message:
          "Invalid document status. Must be 'approved', 'rejected', or 'pending'",
      });
    }

    // Find the submission
    const submission = await RequirementsSubmissionModel.findById(submissionId);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Validate document index
    if (documentIndex < 0 || documentIndex >= submission.items.length) {
      return res.status(400).json({ message: "Invalid document index" });
    }

    // Update the specific document
    const document = submission.items[documentIndex];
    document.documentStatus = documentStatus as any;
    document.reviewedByHR = new mongoose.Types.ObjectId(userID);
    document.reviewedAt = new Date();

    if (documentStatus === "rejected" && rejectionReason) {
      document.rejectionReason = rejectionReason;
    } else if (documentStatus === "approved") {
      // Clear rejection reason if approving
      document.rejectionReason = undefined;
    }

    await submission.save();

    // Check if all documents are reviewed
    const allApproved = submission.items.every(
      (item) => item.documentStatus === "approved"
    );
    const anyRejected = submission.items.some(
      (item) => item.documentStatus === "rejected"
    );

    // Update overall submission status if needed
    if (allApproved && submission.reviewStatus !== "approved") {
      submission.reviewStatus = "approved";
      submission.reviewedByHR = new mongoose.Types.ObjectId(userID);
      submission.reviewedAt = new Date();
      await submission.save();
    } else if (anyRejected && submission.reviewStatus === "approved") {
      // If was approved but now has rejected documents, set back to pending
      submission.reviewStatus = "pending";
      await submission.save();
    }

    // Create notification for student
    const statusText =
      documentStatus === "approved"
        ? "approved"
        : documentStatus === "rejected"
          ? "rejected"
          : "under review";

    const documentLabel = document.label || "Document";

    await createNotification({
      userID: submission.userID.toString(),
      title: `Document ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}: ${documentLabel}`,
      message:
        documentStatus === "approved"
          ? `Your document "${documentLabel}" has been approved by HR.`
          : documentStatus === "rejected"
            ? `Your document "${documentLabel}" needs attention. Reason: ${rejectionReason || "Please review and resubmit."}`
            : `Your document "${documentLabel}" is being reviewed by HR.`,
      type:
        documentStatus === "approved"
          ? "success"
          : documentStatus === "rejected"
            ? "error"
            : "info",
    });

    return res.status(OK).json({
      message: `Document ${statusText}`,
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
  reviewDocument,
};
