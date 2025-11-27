import { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import LeaveModel from "../models/leave.model";
import UserModel from "../models/user.model";
import DTRModel from "../models/dtr.model";
import OfficeProfileModel from "../models/officeProfile.model";
import catchErrors from "../utils/catchErrors";
import appAssert from "../utils/appAssert";
import { BAD_REQUEST, FORBIDDEN, NOT_FOUND, OK } from "../constants/http";

const createLeaveSchema = z.object({
  name: z.string().min(1),
  schoolDept: z.string().optional(),
  courseYear: z.string().optional(),
  typeOfLeave: z.string().min(1),
  dateFrom: z.string().datetime().or(z.string().min(1)),
  dateTo: z.string().datetime().or(z.string().min(1)),
  daysHours: z.string().optional(),
  reasons: z.string().min(1),
  proofUrl: z.string().optional(),
});

/**
 * Helper function to mark dates as excused in DTR
 * Automatically creates DTR records if they don't exist
 */
async function markDatesAsExcused(
  userId: string,
  dateFrom: Date,
  dateTo: Date,
  reason: string
) {
  // Get all dates in the range
  const dates: Date[] = [];
  const current = new Date(dateFrom);
  const end = new Date(dateTo);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // Group dates by month/year
  const datesByMonth = new Map<string, Date[]>();
  for (const date of dates) {
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!datesByMonth.has(key)) {
      datesByMonth.set(key, []);
    }
    datesByMonth.get(key)!.push(date);
  }

  // Process each month
  for (const [key, monthDates] of datesByMonth) {
    const [year, month] = key.split("-").map(Number);

    // Find or create DTR record
    let dtr = await DTRModel.findOne({
      userId,
      month,
      year,
    });

    if (!dtr) {
      // Create new DTR if it doesn't exist
      dtr = await DTRModel.create({
        userId,
        month,
        year,
        entries: [],
        status: "draft",
      });
    }

    // Mark each day as excused
    for (const date of monthDates) {
      const day = date.getDate();

      // Find existing entry or create new one
      let entry = dtr.entries.find((e) => e.day === day);

      if (!entry) {
        // Create new entry
        dtr.entries.push({
          day,
          shifts: [],
          late: 0,
          undertime: 0,
          totalHours: 0,
          status: "On Leave",
          confirmationStatus: "confirmed",
          excusedStatus: "excused",
          excusedReason: reason,
        });
      } else {
        // Update existing entry
        entry.excusedStatus = "excused";
        entry.excusedReason = reason;
        entry.status = "On Leave";
        entry.confirmationStatus = "confirmed";
      }
    }

    // Sort entries by day
    dtr.entries.sort((a, b) => a.day - b.day);

    await dtr.save();
  }
}

export const submitLeave = catchErrors(async (req: Request, res: Response) => {
  const userID = req.userID!;
  appAssert(userID, FORBIDDEN, "Not authorized");

  const parsed = createLeaveSchema.safeParse(req.body);
  appAssert(parsed.success, BAD_REQUEST, "Invalid payload");

  const body = parsed.data;
  const from = new Date(body.dateFrom);
  const to = new Date(body.dateTo);
  appAssert(
    !isNaN(from.getTime()) && !isNaN(to.getTime()),
    BAD_REQUEST,
    "Invalid date values"
  );
  appAssert(
    to.getTime() >= from.getTime(),
    BAD_REQUEST,
    "dateTo cannot be before dateFrom"
  );

  // Get uploaded proof URL from Cloudinary (if uploaded)
  const proofUrl = (req.file as any)?.path || body.proofUrl;
  const proofFileName = req.file?.originalname;
  const proofMimeType = req.file?.mimetype;

  const leave = await LeaveModel.create({
    userId: userID,
    name: body.name,
    schoolDept: body.schoolDept,
    courseYear: body.courseYear,
    typeOfLeave: body.typeOfLeave,
    dateFrom: from,
    dateTo: to,
    daysHours: body.daysHours,
    reasons: body.reasons,
    proofUrl: proofUrl,
    proofFileName: proofFileName,
    proofMimeType: proofMimeType,
    status: "pending",
  });

  return res.status(OK).json({ message: "Leave submitted", leave });
});

export const getMyLeaves = catchErrors(async (req: Request, res: Response) => {
  const userID = req.userID!;
  appAssert(userID, FORBIDDEN, "Not authorized");
  const leaves = await LeaveModel.find({ userId: userID }).sort({
    createdAt: -1,
  });
  return res.status(OK).json({ leaves });
});

export const listLeavesForOffice = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    appAssert(userID, FORBIDDEN, "Not authorized");
    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "office" || user.role === "hr",
      FORBIDDEN,
      "Only office or HR can view leave requests"
    );

    const { status, q } = req.query as { status?: string; q?: string };

    const filter: any = {};
    if (status && ["pending", "approved", "disapproved"].includes(status)) {
      filter.status = status;
    }
    if (q) {
      const regex = new RegExp(String(q), "i");
      filter.$or = [{ name: regex }, { reasons: regex }];
    }

    const leaves = await LeaveModel.find(filter).sort({ createdAt: -1 });
    return res.status(OK).json({ leaves });
  }
);

export const decideLeave = catchErrors(async (req: Request, res: Response) => {
  const userID = req.userID!;
  appAssert(userID, FORBIDDEN, "Not authorized");
  const user = await UserModel.findById(userID);
  appAssert(user, NOT_FOUND, "User not found");
  appAssert(
    user.role === "office" || user.role === "hr",
    FORBIDDEN,
    "Only office or HR can decide leave requests"
  );

  const id = req.params.id;
  const { status, remarks, allowResubmit } = req.body as {
    status: "approved" | "disapproved";
    remarks?: string;
    allowResubmit?: boolean;
  };
  appAssert(
    status === "approved" || status === "disapproved",
    BAD_REQUEST,
    "Invalid status"
  );

  const leave = await LeaveModel.findById(id);
  appAssert(leave, NOT_FOUND, "Leave not found");

  // Get profile name if available (same as DTR system)
  let profileName = `${user.firstname} ${user.lastname}`;

  if (user.role === "office" && req.profileID) {
    const profile = await OfficeProfileModel.findById(req.profileID);
    if (profile) {
      profileName = profile.profileName;
    }
  } else if (user.role === "hr") {
    profileName = `${user.firstname} ${user.lastname} (HR)`;
  }

  leave.status = status;
  leave.remarks = remarks;
  leave.decidedBy = new mongoose.Types.ObjectId(userID);
  leave.decidedByProfile = profileName;
  leave.decidedAt = new Date();
  leave.allowResubmit =
    status === "disapproved" ? allowResubmit || false : false;
  await leave.save();

  // If approved, automatically mark dates as excused in DTR
  if (status === "approved") {
    try {
      await markDatesAsExcused(
        leave.userId.toString(),
        leave.dateFrom,
        leave.dateTo,
        `Approved Leave: ${leave.typeOfLeave} - ${leave.reasons}`
      );
    } catch (error) {
      console.error("Error marking dates as excused:", error);
      // Continue even if DTR update fails - leave approval is still valid
    }
  }

  return res.status(OK).json({ message: "Leave updated", leave });
});

export const cancelLeave = catchErrors(async (req: Request, res: Response) => {
  const userID = req.userID!;
  appAssert(userID, FORBIDDEN, "Not authorized");

  const id = req.params.id;
  const leave = await LeaveModel.findById(id);
  appAssert(leave, NOT_FOUND, "Leave not found");

  // Check if the leave belongs to the user
  appAssert(
    leave.userId.toString() === userID,
    FORBIDDEN,
    "You can only cancel your own leave requests"
  );

  // Only allow cancellation of pending requests
  appAssert(
    leave.status === "pending",
    BAD_REQUEST,
    "Only pending leave requests can be cancelled"
  );

  await LeaveModel.findByIdAndDelete(id);

  return res
    .status(OK)
    .json({ message: "Leave request cancelled successfully" });
});

export const updateLeave = catchErrors(async (req: Request, res: Response) => {
  const userID = req.userID!;
  appAssert(userID, FORBIDDEN, "Not authorized");

  const id = req.params.id;
  const leave = await LeaveModel.findById(id);
  appAssert(leave, NOT_FOUND, "Leave not found");

  // Check if the leave belongs to the user
  appAssert(
    leave.userId.toString() === userID,
    FORBIDDEN,
    "You can only update your own leave requests"
  );

  // Only allow updating disapproved requests with allowResubmit flag
  appAssert(
    leave.status === "disapproved" && leave.allowResubmit,
    BAD_REQUEST,
    "Only disapproved leave requests with resubmit permission can be updated"
  );

  const parsed = createLeaveSchema.safeParse(req.body);
  appAssert(parsed.success, BAD_REQUEST, "Invalid payload");

  const body = parsed.data;
  const from = new Date(body.dateFrom);
  const to = new Date(body.dateTo);
  appAssert(
    !isNaN(from.getTime()) && !isNaN(to.getTime()),
    BAD_REQUEST,
    "Invalid date values"
  );
  appAssert(
    to.getTime() >= from.getTime(),
    BAD_REQUEST,
    "dateTo cannot be before dateFrom"
  );

  // Get uploaded proof URL from Cloudinary (if uploaded)
  const proofUrl = (req.file as any)?.path || body.proofUrl || leave.proofUrl;
  const proofFileName = req.file?.originalname || leave.proofFileName;
  const proofMimeType = req.file?.mimetype || leave.proofMimeType;

  // Update the leave request
  leave.name = body.name;
  leave.schoolDept = body.schoolDept;
  leave.courseYear = body.courseYear;
  leave.typeOfLeave = body.typeOfLeave;
  leave.dateFrom = from;
  leave.dateTo = to;
  leave.daysHours = body.daysHours;
  leave.reasons = body.reasons;
  leave.proofUrl = proofUrl;
  leave.proofFileName = proofFileName;
  leave.proofMimeType = proofMimeType;
  leave.status = "pending"; // Reset to pending
  leave.remarks = undefined; // Clear previous remarks
  leave.decidedBy = undefined;
  leave.decidedByProfile = undefined;
  leave.decidedAt = undefined;
  leave.allowResubmit = false; // Reset flag

  await leave.save();

  return res
    .status(OK)
    .json({ message: "Leave request updated and resubmitted", leave });
});
