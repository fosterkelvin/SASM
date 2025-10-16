import { Request, Response } from "express";
import { z } from "zod";
import catchErrors from "../utils/catchErrors";
import {
  getProfiles,
  createProfile,
  selectProfile,
  updateProfile,
  deleteProfile,
  resetProfilePIN,
} from "../services/officeProfile.service";
import { CREATED, OK } from "../constants/http";
import appAssert from "../utils/appAssert";
import { UNAUTHORIZED } from "../constants/http";

// GET /office/profiles - Get all profiles for the logged-in account
export const getProfilesHandler = catchErrors(async (req: Request, res: Response) => {
  const accountID = req.userID;
  appAssert(accountID, UNAUTHORIZED, "Not authenticated");
  const profiles = await getProfiles(accountID);

  return res.status(OK).json({
    profiles,
    hasProfiles: profiles.length > 0,
  });
});

// POST /office/profiles - Create a new profile
const createProfileSchema = z.object({
  profileName: z.string().trim().min(1).max(50),
  profilePIN: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
  permissions: z
    .object({
      viewApplications: z.boolean().optional(),
      editApplications: z.boolean().optional(),
      viewRequirements: z.boolean().optional(),
      processRequirements: z.boolean().optional(),
      viewDTR: z.boolean().optional(),
      editDTR: z.boolean().optional(),
      viewLeaveRequests: z.boolean().optional(),
      approveLeaveRequests: z.boolean().optional(),
      viewScholars: z.boolean().optional(),
      editScholars: z.boolean().optional(),
      viewEvaluations: z.boolean().optional(),
      submitEvaluations: z.boolean().optional(),
    })
    .optional(),
});

export const createProfileHandler = catchErrors(async (req: Request, res: Response) => {
  const body = createProfileSchema.parse(req.body);
  const accountID = req.userID;
  appAssert(accountID, UNAUTHORIZED, "Not authenticated");

  const profile = await createProfile({
    accountID,
    profileName: body.profileName,
    profilePIN: body.profilePIN,
    permissions: body.permissions,
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
  });

  return res.status(CREATED).json({
    message: "Profile created successfully",
    profile,
  });
});

// POST /office/profiles/select - Select a profile
const selectProfileSchema = z.object({
  profileID: z.string(),
  profilePIN: z.string(),
});

export const selectProfileHandler = catchErrors(async (req: Request, res: Response) => {
  const body = selectProfileSchema.parse(req.body);
  const accountID = req.userID;
  appAssert(accountID, UNAUTHORIZED, "Not authenticated");

  const result = await selectProfile({
    accountID,
    profileID: body.profileID,
    profilePIN: body.profilePIN,
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
  });

  // Set auth cookies
  const { refreshToken, accessToken, ...rest } = result;

  const secure = process.env.NODE_ENV === "production";

  res
    .cookie("refreshToken", refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure,
      sameSite: "strict",
    })
    .cookie("accessToken", accessToken, {
      maxAge: 15 * 60 * 1000, // 15 minutes
      httpOnly: true,
      secure,
      sameSite: "strict",
    });

  return res.status(OK).json({
    message: "Profile selected successfully",
    ...rest,
  });
});

// PATCH /office/profiles/:id - Update a profile
const updateProfileSchema = z.object({
  profileName: z.string().trim().min(1).max(50).optional(),
  profilePIN: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits").optional(),
  permissions: z
    .object({
      viewApplications: z.boolean().optional(),
      editApplications: z.boolean().optional(),
      viewRequirements: z.boolean().optional(),
      processRequirements: z.boolean().optional(),
      viewDTR: z.boolean().optional(),
      editDTR: z.boolean().optional(),
      viewLeaveRequests: z.boolean().optional(),
      approveLeaveRequests: z.boolean().optional(),
      viewScholars: z.boolean().optional(),
      editScholars: z.boolean().optional(),
      viewEvaluations: z.boolean().optional(),
      submitEvaluations: z.boolean().optional(),
    })
    .optional(),
  isActive: z.boolean().optional(),
  avatar: z.string().optional(),
});

export const updateProfileHandler = catchErrors(async (req: Request, res: Response) => {
  const body = updateProfileSchema.parse(req.body);
  const accountID = req.userID;
  appAssert(accountID, UNAUTHORIZED, "Not authenticated");
  const profileID = req.params.id;

  const profile = await updateProfile({
    accountID,
    profileID,
    profileName: body.profileName,
    profilePIN: body.profilePIN,
    permissions: body.permissions,
    isActive: body.isActive,
    avatar: body.avatar,
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
  });

  return res.status(OK).json({
    message: "Profile updated successfully",
    profile,
  });
});

// DELETE /office/profiles/:id - Delete a profile
export const deleteProfileHandler = catchErrors(async (req: Request, res: Response) => {
  const accountID = req.userID;
  appAssert(accountID, UNAUTHORIZED, "Not authenticated");
  const profileID = req.params.id;

  const result = await deleteProfile({
    accountID,
    profileID,
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
  });

  return res.status(OK).json(result);
});

// POST /office/profiles/reset-pin - Reset profile PIN (requires account password)
const resetPINSchema = z.object({
  profileID: z.string(),
  accountPassword: z.string().min(1, "Account password is required"),
  newPIN: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
});

export const resetProfilePINHandler = catchErrors(async (req: Request, res: Response) => {
  const body = resetPINSchema.parse(req.body);
  const accountID = req.userID;
  appAssert(accountID, UNAUTHORIZED, "Not authenticated");

  const result = await resetProfilePIN({
    accountID,
    profileID: body.profileID,
    accountPassword: body.accountPassword,
    newPIN: body.newPIN,
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
  });

  return res.status(OK).json(result);
});
