import OfficeProfileModel from "../models/officeProfile.model";
import UserModel from "../models/user.model";
import SessionModel from "../models/session.model";
import appAssert from "../utils/appAssert";
import { NOT_FOUND, UNAUTHORIZED, BAD_REQUEST, CONFLICT } from "../constants/http";
import { signToken, refreshTokenSignOptions } from "../utils/jwt";
import { createAuditLog } from "./auditLog.service";

const MAX_PROFILES_PER_ACCOUNT = 5; // Netflix-style limit

// Get all profiles for an OFFICE account
export const getProfiles = async (accountID: string) => {
  const account = await UserModel.findById(accountID);
  appAssert(account, NOT_FOUND, "Account not found");
  appAssert(account.role === "office", UNAUTHORIZED, "Only OFFICE accounts can have profiles");

  const profiles = await OfficeProfileModel.find({
    accountID,
    isActive: true,
  })
    .select("-profilePIN")
    .sort({ lastAccessedAt: -1, createdAt: -1 }); // Most recently used first

  return profiles.map((profile) => ({
    _id: profile._id,
    profileName: profile.profileName,
    avatar: profile.avatar || profile.profileName.charAt(0).toUpperCase(),
    permissions: profile.permissions,
    lastAccessedAt: profile.lastAccessedAt,
    createdAt: profile.createdAt,
  }));
};

// Create a new profile
export const createProfile = async (params: {
  accountID: string;
  profileName: string;
  profilePIN: string;
  permissions?: any;
  userAgent?: string;
  ipAddress?: string;
}) => {
  const account = await UserModel.findById(params.accountID);
  appAssert(account, NOT_FOUND, "Account not found");
  appAssert(account.role === "office", UNAUTHORIZED, "Only OFFICE accounts can have profiles");

  // Check profile limit
  const profileCount = await OfficeProfileModel.countDocuments({
    accountID: params.accountID,
  });
  appAssert(
    profileCount < MAX_PROFILES_PER_ACCOUNT,
    BAD_REQUEST,
    `Maximum of ${MAX_PROFILES_PER_ACCOUNT} profiles allowed`
  );

  // Validate PIN (must be 4 digits)
  appAssert(
    /^\d{4}$/.test(params.profilePIN),
    BAD_REQUEST,
    "PIN must be exactly 4 digits"
  );

  // Check for duplicate profile name within this account
  const existingProfile = await OfficeProfileModel.findOne({
    accountID: params.accountID,
    profileName: params.profileName,
  });
  appAssert(!existingProfile, CONFLICT, "A profile with this name already exists");

  // Create profile with all permissions enabled by default
  const profile = await OfficeProfileModel.create({
    accountID: params.accountID,
    profileName: params.profileName,
    profilePIN: params.profilePIN,
    permissions: params.permissions || {
      viewApplications: true,
      editApplications: true,
      viewRequirements: true,
      processRequirements: true,
      viewDTR: true,
      editDTR: true,
      viewLeaveRequests: true,
      approveLeaveRequests: true,
      viewScholars: true,
      editScholars: true,
      viewEvaluations: true,
      submitEvaluations: true,
    },
  });

  // Create audit log
  await createAuditLog({
    userID: params.accountID,
    profileID: profile._id as any,
    actorName: `${account.firstname} ${account.lastname}`,
    action: "CREATE_PROFILE",
    module: "Profiles",
    details: {
      profileName: params.profileName,
    },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  return {
    _id: profile._id,
    profileName: profile.profileName,
    avatar: profile.avatar || profile.profileName.charAt(0).toUpperCase(),
    permissions: profile.permissions,
  };
};

// Select a profile (switch to it)
export const selectProfile = async (params: {
  accountID: string;
  profileID: string;
  profilePIN: string;
  userAgent?: string;
  ipAddress?: string;
}) => {
  const account = await UserModel.findById(params.accountID);
  appAssert(account, NOT_FOUND, "Account not found");

  const profile = await OfficeProfileModel.findOne({
    _id: params.profileID,
    accountID: params.accountID,
  });

  appAssert(profile, NOT_FOUND, "Profile not found");
  appAssert(profile.isActive, UNAUTHORIZED, "This profile has been disabled");

  // Verify PIN
  const isPINValid = await profile.comparePIN(params.profilePIN);
  appAssert(isPINValid, UNAUTHORIZED, "Incorrect PIN");

  // Update last accessed time
  profile.lastAccessedAt = new Date();
  await profile.save();

  // Create session for this profile
  const session = await SessionModel.create({
    userID: account._id,
    userAgent: params.userAgent,
  });

  const sessionInfo = {
    sessionID: session._id,
  };

  const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);

  const accessToken = signToken({
    ...sessionInfo,
    userID: account._id,
    profileID: (profile._id as any).toString(),
  });

  // Create audit log
  await createAuditLog({
    userID: params.accountID,
    profileID: profile._id as any,
    actorName: profile.profileName,
    action: "SELECT_PROFILE",
    module: "Profiles",
    details: {
      profileName: profile.profileName,
    },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  return {
    profile: {
      _id: profile._id,
      profileName: profile.profileName,
      avatar: profile.avatar || profile.profileName.charAt(0).toUpperCase(),
      permissions: profile.permissions,
      accountEmail: account.email,
    },
    refreshToken,
    accessToken,
    redirectUrl: "/office-dashboard",
  };
};

// Update profile
export const updateProfile = async (params: {
  accountID: string;
  profileID: string;
  profileName?: string;
  profilePIN?: string;
  permissions?: any;
  isActive?: boolean;
  avatar?: string;
  userAgent?: string;
  ipAddress?: string;
}) => {
  const profile = await OfficeProfileModel.findOne({
    _id: params.profileID,
    accountID: params.accountID,
  });

  appAssert(profile, NOT_FOUND, "Profile not found");

  const oldValues: any = {};
  const newValues: any = {};

  if (params.profileName && params.profileName !== profile.profileName) {
    // Check for duplicate name
    const existingProfile = await OfficeProfileModel.findOne({
      accountID: params.accountID,
      profileName: params.profileName,
      _id: { $ne: params.profileID },
    });
    appAssert(!existingProfile, CONFLICT, "A profile with this name already exists");

    oldValues.profileName = profile.profileName;
    newValues.profileName = params.profileName;
    profile.profileName = params.profileName;
  }

  if (params.profilePIN) {
    appAssert(
      /^\d{4}$/.test(params.profilePIN),
      BAD_REQUEST,
      "PIN must be exactly 4 digits"
    );
    oldValues.profilePIN = "****";
    newValues.profilePIN = "****";
    profile.profilePIN = params.profilePIN;
  }

  if (params.permissions) {
    oldValues.permissions = profile.permissions;
    newValues.permissions = params.permissions;
    profile.permissions = params.permissions;
  }

  if (params.isActive !== undefined) {
    oldValues.isActive = profile.isActive;
    newValues.isActive = params.isActive;
    profile.isActive = params.isActive;
  }

  if (params.avatar !== undefined) {
    oldValues.avatar = profile.avatar;
    newValues.avatar = params.avatar;
    profile.avatar = params.avatar;
  }

  await profile.save();

  // Create audit log
  const account = await UserModel.findById(params.accountID);
  await createAuditLog({
    userID: params.accountID,
    profileID: profile._id as any,
    actorName: account ? `${account.firstname} ${account.lastname}` : "Unknown",
    action: "UPDATE_PROFILE",
    module: "Profiles",
    details: {
      profileName: profile.profileName,
    },
    oldValue: oldValues,
    newValue: newValues,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  return {
    _id: profile._id,
    profileName: profile.profileName,
    avatar: profile.avatar || profile.profileName.charAt(0).toUpperCase(),
    permissions: profile.permissions,
    isActive: profile.isActive,
  };
};

// Delete profile
export const deleteProfile = async (params: {
  accountID: string;
  profileID: string;
  userAgent?: string;
  ipAddress?: string;
}) => {
  const profile = await OfficeProfileModel.findOne({
    _id: params.profileID,
    accountID: params.accountID,
  });

  appAssert(profile, NOT_FOUND, "Profile not found");

  // Check if this is the last profile
  const profileCount = await OfficeProfileModel.countDocuments({
    accountID: params.accountID,
    isActive: true,
  });

  appAssert(
    profileCount > 1,
    BAD_REQUEST,
    "Cannot delete the last profile. At least one profile must remain."
  );

  const profileName = profile.profileName;
  await profile.deleteOne();

  // Create audit log
  const account = await UserModel.findById(params.accountID);
  await createAuditLog({
    userID: params.accountID,
    actorName: account ? `${account.firstname} ${account.lastname}` : "Unknown",
    action: "DELETE_PROFILE",
    module: "Profiles",
    details: {
      profileName: profileName,
    },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  return {
    message: "Profile deleted successfully",
  };
};

// Reset profile PIN (Netflix-style: requires account password verification)
export const resetProfilePIN = async (params: {
  accountID: string;
  profileID: string;
  accountPassword: string;
  newPIN: string;
  userAgent?: string;
  ipAddress?: string;
}) => {
  // Verify account password first
  const account = await UserModel.findById(params.accountID);
  appAssert(account, NOT_FOUND, "Account not found");

  const isPasswordValid = await account.comparePassword(params.accountPassword);
  appAssert(isPasswordValid, UNAUTHORIZED, "Incorrect account password");

  // Find the profile
  const profile = await OfficeProfileModel.findOne({
    _id: params.profileID,
    accountID: params.accountID,
  });

  appAssert(profile, NOT_FOUND, "Profile not found");

  // Validate new PIN
  appAssert(
    /^\d{4}$/.test(params.newPIN),
    BAD_REQUEST,
    "PIN must be exactly 4 digits"
  );

  // Update PIN
  profile.profilePIN = params.newPIN;
  await profile.save();

  // Create audit log
  await createAuditLog({
    userID: params.accountID,
    profileID: profile._id as any,
    actorName: `${account.firstname} ${account.lastname}`,
    action: "RESET_PROFILE_PIN",
    module: "Profiles",
    details: {
      profileName: profile.profileName,
      method: "password_verification",
    },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  return {
    message: "PIN reset successfully",
    profileName: profile.profileName,
  };
};
