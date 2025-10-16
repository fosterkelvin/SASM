import { Request, Response } from "express";
import { z } from "zod";
import DTRService from "../services/dtr.service";
import UserModel from "../models/user.model";
import OfficeProfileModel from "../models/officeProfile.model";
import catchErrors from "../utils/catchErrors";

// Validation schemas
const DTREntrySchema = z.object({
  day: z.number().min(1).max(31),
  in1: z.string().optional(),
  out1: z.string().optional(),
  in2: z.string().optional(),
  out2: z.string().optional(),
  late: z.number().optional(),
  undertime: z.number().optional(),
  totalHours: z.number().optional(),
  status: z.string().optional(),
  confirmationStatus: z.enum(["unconfirmed", "confirmed"]).optional(),
  confirmedBy: z.string().optional(),
  confirmedAt: z.date().optional(),
});

const CreateOrGetDTRSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
});

const UpdateDTRSchema = z.object({
  dtrId: z.string(),
  department: z.string().optional(),
  dutyHours: z.string().optional(),
  entries: z.array(DTREntrySchema).optional(),
  remarks: z.string().optional(),
});

const UpdateEntrySchema = z.object({
  dtrId: z.string(),
  day: z.number().min(1).max(31),
  entryData: DTREntrySchema.partial(),
});

const SubmitDTRSchema = z.object({
  dtrId: z.string(),
});

const ApproveDTRSchema = z.object({
  dtrId: z.string(),
  remarks: z.string().optional(),
});

const RejectDTRSchema = z.object({
  dtrId: z.string(),
  remarks: z.string(),
});

const ConfirmEntrySchema = z.object({
  dtrId: z.string(),
  day: z.number().min(1).max(31),
});

const ConfirmAllEntriesSchema = z.object({
  dtrId: z.string(),
});

const SendDTRInquirySchema = z.object({
  userId: z.string(),
  message: z.string().min(1),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
});

const MarkDayExcusedSchema = z.object({
  dtrId: z.string(),
  day: z.number().min(1).max(31),
  excusedStatus: z.enum(["none", "excused"]),
  excusedReason: z.string().optional(),
});

/**
 * Get or create DTR for current user
 * POST /api/dtr/get-or-create
 */
export const getOrCreateDTR = catchErrors(
  async (req: Request, res: Response) => {
    try {
      console.log("getOrCreateDTR called with body:", req.body);
      const validatedData = CreateOrGetDTRSchema.parse(req.body);
      console.log("Validated data:", validatedData);

      const userId = req.userID;
      console.log("User ID:", userId);

      if (!userId) {
        console.log("No userId - Unauthorized");
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.log("Fetching DTR for:", {
        userId,
        month: validatedData.month,
        year: validatedData.year,
      });
      const dtr = await DTRService.getOrCreateDTR(
        userId,
        validatedData.month,
        validatedData.year
      );
      console.log("DTR fetched successfully:", dtr?._id);

      res.status(200).json({
        message: "DTR retrieved successfully",
        dtr,
      });
    } catch (error) {
      console.error("Error in getOrCreateDTR:", error);
      throw error;
    }
  }
);

/**
 * Get all DTRs for current user
 * GET /api/dtr/my-dtrs
 */
export const getMyDTRs = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userID;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const dtrs = await DTRService.getUserDTRs(userId);

  res.status(200).json({
    message: "DTRs retrieved successfully",
    dtrs,
  });
});

/**
 * Get DTR by ID
 * GET /api/dtr/:id
 */
export const getDTRById = catchErrors(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.userID;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const dtr = await DTRService.getDTRById(id);

  if (!dtr) {
    return res.status(404).json({ message: "DTR not found" });
  }

  // Check if user owns this DTR or is office staff
  const user = await UserModel.findById(userId);
  if (dtr.userId.toString() !== userId && user?.role !== "office") {
    return res.status(403).json({ message: "Access denied" });
  }

  res.status(200).json({
    message: "DTR retrieved successfully",
    dtr,
  });
});

/**
 * Update DTR
 * PUT /api/dtr/update
 */
export const updateDTR = catchErrors(async (req: Request, res: Response) => {
  const validatedData = UpdateDTRSchema.parse(req.body);
  const userId = req.userID;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const dtr = await DTRService.getDTRById(validatedData.dtrId);

  if (!dtr) {
    return res.status(404).json({ message: "DTR not found" });
  }

  // Check ownership
  if (dtr.userId.toString() !== userId) {
    return res.status(403).json({ message: "Access denied" });
  }

  // Don't allow updates if already submitted/approved
  if (dtr.status === "approved") {
    return res.status(400).json({ message: "Cannot update approved DTR" });
  }

  const { dtrId, ...updates } = validatedData;
  const updatedDTR = await DTRService.updateDTR(dtrId, updates);

  res.status(200).json({
    message: "DTR updated successfully",
    dtr: updatedDTR,
  });
});

/**
 * Update specific entry in DTR
 * PUT /api/dtr/update-entry
 */
export const updateEntry = catchErrors(async (req: Request, res: Response) => {
  const validatedData = UpdateEntrySchema.parse(req.body);
  const userId = req.userID;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const dtr = await DTRService.getDTRById(validatedData.dtrId);

  if (!dtr) {
    return res.status(404).json({ message: "DTR not found" });
  }

  // Check ownership
  if (dtr.userId.toString() !== userId) {
    return res.status(403).json({ message: "Access denied" });
  }

  // Don't allow updates if already approved
  if (dtr.status === "approved") {
    return res.status(400).json({ message: "Cannot update approved DTR" });
  }

  const updatedDTR = await DTRService.updateDTREntry(
    validatedData.dtrId,
    validatedData.day,
    validatedData.entryData
  );

  res.status(200).json({
    message: "Entry updated successfully",
    dtr: updatedDTR,
  });
});

/**
 * Submit DTR for approval
 * POST /api/dtr/submit
 */
export const submitDTR = catchErrors(async (req: Request, res: Response) => {
  const validatedData = SubmitDTRSchema.parse(req.body);
  const userId = req.userID;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const dtr = await DTRService.getDTRById(validatedData.dtrId);

  if (!dtr) {
    return res.status(404).json({ message: "DTR not found" });
  }

  // Check ownership
  if (dtr.userId.toString() !== userId) {
    return res.status(403).json({ message: "Access denied" });
  }

  if (dtr.status === "submitted" || dtr.status === "approved") {
    return res.status(400).json({ message: "DTR already submitted" });
  }

  const submittedDTR = await DTRService.submitDTR(validatedData.dtrId);

  res.status(200).json({
    message: "DTR submitted successfully",
    dtr: submittedDTR,
  });
});

/**
 * Approve DTR (Office only)
 * POST /api/dtr/approve
 */
export const approveDTR = catchErrors(async (req: Request, res: Response) => {
  const validatedData = ApproveDTRSchema.parse(req.body);
  const userId = req.userID;

  if (!userId) {
    return res.status(403).json({ message: "Access denied" });
  }

  const user = await UserModel.findById(userId);

  if (!user || user.role !== "office") {
    return res.status(403).json({ message: "Access denied" });
  }

  const checkedBy = `${user.firstname} ${user.lastname}`;

  const approvedDTR = await DTRService.approveDTR(
    validatedData.dtrId,
    checkedBy,
    validatedData.remarks
  );

  if (!approvedDTR) {
    return res.status(404).json({ message: "DTR not found" });
  }

  res.status(200).json({
    message: "DTR approved successfully",
    dtr: approvedDTR,
  });
});

/**
 * Reject DTR (Office only)
 * POST /api/dtr/reject
 */
export const rejectDTR = catchErrors(async (req: Request, res: Response) => {
  const validatedData = RejectDTRSchema.parse(req.body);
  const userId = req.userID;

  if (!userId) {
    return res.status(403).json({ message: "Access denied" });
  }

  const user = await UserModel.findById(userId);

  if (!user || user.role !== "office") {
    return res.status(403).json({ message: "Access denied" });
  }

  const checkedBy = `${user.firstname} ${user.lastname}`;

  const rejectedDTR = await DTRService.rejectDTR(
    validatedData.dtrId,
    checkedBy,
    validatedData.remarks
  );

  if (!rejectedDTR) {
    return res.status(404).json({ message: "DTR not found" });
  }

  res.status(200).json({
    message: "DTR rejected successfully",
    dtr: rejectedDTR,
  });
});

/**
 * Get all submitted DTRs (Office only)
 * GET /api/dtr/submitted
 */
export const getSubmittedDTRs = catchErrors(
  async (req: Request, res: Response) => {
    const userId = req.userID;

    if (!userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await UserModel.findById(userId);

    if (!user || user.role !== "office") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { month, year, status } = req.query;

    const filters: any = {};
    if (month) filters.month = parseInt(month as string);
    if (year) filters.year = parseInt(year as string);
    if (status) filters.status = status as string;

    const dtrs = await DTRService.getSubmittedDTRs(filters);

    res.status(200).json({
      message: "DTRs retrieved successfully",
      dtrs,
    });
  }
);

/**
 * Get DTR statistics for current user
 * GET /api/dtr/stats
 */
export const getDTRStats = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userID;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const stats = await DTRService.getUserDTRStats(userId);

  res.status(200).json({
    message: "Statistics retrieved successfully",
    stats,
  });
});

/**
 * Delete DTR
 * DELETE /api/dtr/:id
 */
export const deleteDTR = catchErrors(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.userID;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const dtr = await DTRService.getDTRById(id);

  if (!dtr) {
    return res.status(404).json({ message: "DTR not found" });
  }

  // Check ownership
  if (dtr.userId.toString() !== userId) {
    return res.status(403).json({ message: "Access denied" });
  }

  // Don't allow deletion if approved
  if (dtr.status === "approved") {
    return res.status(400).json({ message: "Cannot delete approved DTR" });
  }

  await DTRService.deleteDTR(id);

  res.status(200).json({
    message: "DTR deleted successfully",
  });
});

/**
 * Confirm a single DTR entry (Office use)
 * POST /api/dtr/confirm-entry
 */
export const confirmDTREntry = catchErrors(
  async (req: Request, res: Response) => {
    const validatedData = ConfirmEntrySchema.parse(req.body);
    const userId = req.userID;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(userId);
    if (!user || user.role !== "office") {
      return res.status(403).json({ message: "Access denied - Office only" });
    }

    const dtr = await DTRService.getDTRById(validatedData.dtrId);

    if (!dtr) {
      return res.status(404).json({ message: "DTR not found" });
    }

    // Get profile name if available
    let profileName = `${user.firstname} ${user.lastname}`;
    if (req.profileID) {
      const profile = await OfficeProfileModel.findById(req.profileID);
      if (profile) {
        profileName = profile.profileName;
        console.log(
          `[DTR Confirm] Using profile: ${profileName} (Profile ID: ${req.profileID})`
        );
      } else {
        console.log(
          `[DTR Confirm] Profile ID ${req.profileID} not found, using fallback: ${profileName}`
        );
      }
    } else {
      console.log(
        `[DTR Confirm] No profileID in request, using fallback: ${profileName}`
      );
    }

    const updatedDTR = await DTRService.confirmDTREntry(
      validatedData.dtrId,
      validatedData.day,
      userId,
      profileName
    );

    res.status(200).json({
      message: "Entry confirmed successfully",
      dtr: updatedDTR,
    });
  }
);

/**
 * Confirm all DTR entries for a month (Office use)
 * POST /api/dtr/confirm-all-entries
 */
export const confirmAllDTREntries = catchErrors(
  async (req: Request, res: Response) => {
    const validatedData = ConfirmAllEntriesSchema.parse(req.body);
    const userId = req.userID;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(userId);
    if (!user || user.role !== "office") {
      return res.status(403).json({ message: "Access denied - Office only" });
    }

    const dtr = await DTRService.getDTRById(validatedData.dtrId);

    if (!dtr) {
      return res.status(404).json({ message: "DTR not found" });
    }

    // Get profile name if available
    let profileName = `${user.firstname} ${user.lastname}`;
    if (req.profileID) {
      const profile = await OfficeProfileModel.findById(req.profileID);
      if (profile) {
        profileName = profile.profileName;
        console.log(
          `[DTR Confirm All] Using profile: ${profileName} (Profile ID: ${req.profileID})`
        );
      } else {
        console.log(
          `[DTR Confirm All] Profile ID ${req.profileID} not found, using fallback: ${profileName}`
        );
      }
    } else {
      console.log(
        `[DTR Confirm All] No profileID in request, using fallback: ${profileName}`
      );
    }

    const updatedDTR = await DTRService.confirmAllDTREntries(
      validatedData.dtrId,
      userId,
      profileName
    );

    res.status(200).json({
      message: "All entries confirmed successfully",
      dtr: updatedDTR,
    });
  }
);

/**
 * Get DTR for a specific user (Office and HR)
 * POST /api/dtr/office/get-user-dtr
 */
const GetUserDTRSchema = z.object({
  userId: z.string(),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
});

export const getUserDTRForOffice = catchErrors(
  async (req: Request, res: Response) => {
    const validatedData = GetUserDTRSchema.parse(req.body);
    const userId = req.userID;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(userId);

    if (!user || (user.role !== "office" && user.role !== "hr")) {
      return res
        .status(403)
        .json({ message: "Access denied - Office or HR only" });
    }

    const dtr = await DTRService.getOrCreateDTR(
      validatedData.userId,
      validatedData.month,
      validatedData.year
    );

    res.status(200).json({
      message: "DTR retrieved successfully",
      dtr,
    });
  }
);

/**
 * Update DTR entry for a specific user (Office only)
 * PUT /api/dtr/office/update-user-entry
 */
const UpdateUserEntrySchema = z.object({
  userId: z.string(),
  dtrId: z.string(),
  day: z.number().min(1).max(31),
  entryData: DTREntrySchema.partial(),
});

export const updateUserEntryForOffice = catchErrors(
  async (req: Request, res: Response) => {
    const validatedData = UpdateUserEntrySchema.parse(req.body);
    const officeUserId = req.userID;

    if (!officeUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(officeUserId);

    if (!user || user.role !== "office") {
      return res.status(403).json({ message: "Access denied - Office only" });
    }

    const dtr = await DTRService.getDTRById(validatedData.dtrId);

    if (!dtr) {
      return res.status(404).json({ message: "DTR not found" });
    }

    // Get profile name if available (from profileID in request)
    let profileName = `${user.firstname} ${user.lastname}`;

    if (req.profileID) {
      const profile = await OfficeProfileModel.findById(req.profileID);
      if (profile) {
        profileName = profile.profileName;
        console.log(
          `[DTR Update] Using profile: ${profileName} (Profile ID: ${req.profileID})`
        );
      } else {
        console.log(
          `[DTR Update] Profile ID ${req.profileID} not found, using fallback: ${profileName}`
        );
      }
    } else {
      console.log(
        `[DTR Update] No profileID in request, using fallback: ${profileName}`
      );
    }

    // Office can update entries regardless of status
    const updatedDTR = await DTRService.updateDTREntryByOffice(
      validatedData.dtrId,
      validatedData.day,
      validatedData.entryData,
      officeUserId,
      profileName
    );

    res.status(200).json({
      message: "Entry updated successfully",
      dtr: updatedDTR,
    });
  }
);

/**
 * Mark a day as excused or remove excused status
 * POST /api/dtr/office/mark-day-excused
 */
export const markDayAsExcused = catchErrors(
  async (req: Request, res: Response) => {
    const validatedData = MarkDayExcusedSchema.parse(req.body);
    const officeUserId = req.userID;

    if (!officeUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(officeUserId);

    if (!user || user.role !== "office") {
      return res.status(403).json({ message: "Access denied - Office only" });
    }

    const dtr = await DTRService.getDTRById(validatedData.dtrId);

    if (!dtr) {
      return res.status(404).json({ message: "DTR not found" });
    }

    // Find the entry
    const entryIndex = dtr.entries.findIndex(
      (e: any) => e.day === validatedData.day
    );

    if (entryIndex === -1) {
      return res.status(404).json({ message: "Entry not found" });
    }

    // Get profile name if available
    let profileName = `${user.firstname} ${user.lastname}`;

    if (req.profileID) {
      const profile = await OfficeProfileModel.findById(req.profileID);
      if (profile) {
        profileName = profile.profileName;
      }
    }

    // Update the entry
    if (validatedData.excusedStatus === "excused") {
      dtr.entries[entryIndex].excusedStatus = "excused";
      dtr.entries[entryIndex].excusedReason = validatedData.excusedReason || "";
      // Excused days count as 5 hours (300 minutes)
      dtr.entries[entryIndex].totalHours = 300;
      // Auto-confirm excused days since office staff is marking them
      dtr.entries[entryIndex].confirmationStatus = "confirmed";
      dtr.entries[entryIndex].confirmedBy = officeUserId;
      dtr.entries[entryIndex].confirmedByProfile = profileName;
      dtr.entries[entryIndex].confirmedAt = new Date();
    } else {
      dtr.entries[entryIndex].excusedStatus = "none";
      dtr.entries[entryIndex].excusedReason = "";
      // Recalculate total hours from time entries
      const entry = dtr.entries[entryIndex];
      const toMinutes = (time?: string) => {
        if (!time) return 0;
        const [h, m] = time.split(":").map(Number);
        return (h || 0) * 60 + (m || 0);
      };

      const in1 = toMinutes(entry.in1);
      const out1 = toMinutes(entry.out1);
      const in2 = toMinutes(entry.in2);
      const out2 = toMinutes(entry.out2);

      let totalMinutes = 0;
      if (out1 > in1) totalMinutes += out1 - in1;
      if (out2 > in2) totalMinutes += out2 - in2;

      dtr.entries[entryIndex].totalHours = totalMinutes;
    }

    // Save the DTR - the pre-save hook will recalculate totalMonthlyHours
    await dtr.save();

    res.status(200).json({
      message:
        validatedData.excusedStatus === "excused"
          ? "Day marked as excused successfully"
          : "Excused status removed successfully",
      dtr,
    });
  }
);

/**
 * Send DTR inquiry email to trainee/scholar
 * POST /api/dtr/office/send-inquiry
 */
export const sendDTRInquiry = catchErrors(
  async (req: Request, res: Response) => {
    const validatedData = SendDTRInquirySchema.parse(req.body);
    const officeUserId = req.userID;

    if (!officeUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const officeUser = await UserModel.findById(officeUserId);

    if (!officeUser || officeUser.role !== "office") {
      return res.status(403).json({ message: "Access denied - Office only" });
    }

    // Get the trainee/scholar user
    const traineeUser = await UserModel.findById(validatedData.userId);

    if (!traineeUser) {
      return res.status(404).json({ message: "Trainee/Scholar not found" });
    }

    // Get profile name if available
    let officeName = `${officeUser.firstname} ${officeUser.lastname}`;
    let officeEmail = officeUser.email;

    if (req.profileID) {
      const profile = await OfficeProfileModel.findById(req.profileID);
      if (profile) {
        officeName = profile.profileName;
      }
    }

    // Import sendMail utility
    const { sendMail } = require("../utils/sendMail");

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const monthName = monthNames[validatedData.month - 1];

    const emailSubject = `DTR Inquiry - ${monthName} ${validatedData.year}`;
    const emailText = `Hello ${traineeUser.firstname},\n\n${officeName} has a question about your DTR for ${monthName} ${validatedData.year}.\n\nMessage:\n${validatedData.message}\n\nPlease proceed to the office at your earliest convenience to discuss this matter.\n\nThank you,\n${officeName}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">DTR Inquiry</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hello <strong>${traineeUser.firstname}</strong>,
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            <strong>${officeName}</strong> has a question about your DTR for <strong>${monthName} ${validatedData.year}</strong>.
          </p>
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: 600;">Message:</p>
            <p style="color: #78350f; margin: 10px 0 0 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${validatedData.message}</p>
          </div>
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0;">
            <strong>Please proceed to the office at your earliest convenience to discuss this matter.</strong>
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Thank you,<br>
              <strong>${officeName}</strong>
            </p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; padding: 20px;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            This is an automated notification from the University of Baguio SASM System.
          </p>
        </div>
      </div>
    `;

    try {
      await sendMail({
        to: traineeUser.email,
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
        replyTo: officeEmail,
      });

      res.status(200).json({
        message: "DTR inquiry email sent successfully",
        sentTo: traineeUser.email,
      });
    } catch (error) {
      console.error("Error sending DTR inquiry email:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  }
);
