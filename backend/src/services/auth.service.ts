import { APP_ORIGIN, JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";
import jwt, { sign } from "jsonwebtoken";
import VerificationCodeType from "../constants/verificationCodeType";
import SessionModel from "../models/session.model";
import UserModel from "../models/user.model";
import VerificationCodeModel from "../models/verificationCode.model";
import {
  fifteenMinutesFromNow,
  fiveMinutesAgo,
  ONE_DAY_MS,
  oneWeekFromNow,
} from "../utils/date";
import appAssert from "../utils/appAssert";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
  BAD_REQUEST,
} from "../constants/http";
import {
  RefreshTokenPayload,
  refreshTokenSignOptions,
  signToken,
  verifyToken,
} from "../utils/jwt";
import { now } from "mongoose";
import { sendMail } from "../utils/sendMail";
import {
  getPasswordResetTemplate,
  getVerifyEmailTemplate,
} from "../utils/emailTemplate";
import { hashValue } from "../utils/bcrypt";
import { getRoleBasedRedirect } from "../utils/roleRedirect";
import { createNotification } from "./notification.service";

type signupParams = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirm_password: string;
  userAgent?: string;
};

// Signup user======================================================
export const signup = async (data: signupParams) => {
  //verify if user already exists
  const existingUser = await UserModel.findOne({ email: data.email });
  appAssert(!existingUser, CONFLICT, "User already in use.");

  //create user
  const user = await UserModel.create({
    firstname: data.firstname,
    lastname: data.lastname,
    email: data.email,
    password: data.password,
  });
  const userID = user._id;

  //verification code
  const verificationCode = await VerificationCodeModel.create({
    userID,
    type: VerificationCodeType.EmailVerification,
    expiresAt: fifteenMinutesFromNow(),
  });

  const url = `${APP_ORIGIN}/email/verify/${verificationCode._id}`;
  //send email verification code
  const { error } = await sendMail({
    to: user.email,
    ...getVerifyEmailTemplate(url),
  });

  if (error) {
    console.log(error);
  }

  // Don't create session or tokens - user needs to verify email first
  // Session and tokens will be created after email verification

  //return response
  return {
    message:
      "Account created successfully. Please check your email to verify your account.",
    user: user.omitPassword(),
  };
};

// Resend verification email======================================================
export const resendVerificationEmail = async (email: string) => {
  const user = await UserModel.findOne({ email });
  appAssert(user, NOT_FOUND, "User not found.");

  // Check if user is already verified
  appAssert(!user.verified, CONFLICT, "Email is already verified.");

  // Delete any existing verification codes for this user
  await VerificationCodeModel.deleteMany({
    userID: user._id,
    type: VerificationCodeType.EmailVerification,
  });

  // Create new verification code
  const verificationCode = await VerificationCodeModel.create({
    userID: user._id,
    type: VerificationCodeType.EmailVerification,
    expiresAt: fifteenMinutesFromNow(),
  });

  const url = `${APP_ORIGIN}/email/verify/${verificationCode._id}`;

  // Send verification email
  const emailTemplate = getVerifyEmailTemplate(url);
  await sendMail({
    to: user.email,
    ...emailTemplate,
  });

  return {
    message: "Verification email sent successfully",
  };
};

type signinParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export const signinUser = async ({
  email,
  password,
  userAgent,
}: signinParams) => {
  const user = await UserModel.findOne({ email });
  appAssert(user, UNAUTHORIZED, "Invalid email or password.");

  const isValid = await user.comparePassword(password);
  appAssert(isValid, UNAUTHORIZED, "Invalid email or password.");

  // Note: Email verification check removed - users can sign in without verification

  const userID = user._id;

  const session = await SessionModel.create({
    userID,
    userAgent,
  });

  const sessionInfo = {
    sessionID: session._id,
  };

  const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);

  const accessToken = signToken({
    ...sessionInfo,
    userID: user._id,
  });

  const redirectUrl = getRoleBasedRedirect(user.role);

  return {
    user: user.omitPassword(),
    refreshToken,
    accessToken,
    redirectUrl,
  };
};

export const refreshUserAccessToken = async (refreshToken: string) => {
  const { payload } = verifyToken<RefreshTokenPayload>(refreshToken, {
    secret: refreshTokenSignOptions.secret,
  });
  appAssert(payload, UNAUTHORIZED, "Invalid refresh token");

  const session = await SessionModel.findById(payload.sessionID);
  const now = Date.now();
  appAssert(
    session && session.expiresAt.getTime() > now,
    UNAUTHORIZED,
    "Session expired"
  );

  //refresh session if it expires in the next 24 hours
  const sessionNeedsRefresh = session.expiresAt.getTime() - now <= ONE_DAY_MS;
  if (sessionNeedsRefresh) {
    session.expiresAt = oneWeekFromNow();
    await session.save();
  }

  const newRefreshToken = sessionNeedsRefresh
    ? signToken(
        {
          sessionID: session._id,
        },
        refreshTokenSignOptions
      )
    : undefined;

  const accessToken = signToken({
    userID: session.userID,
    sessionID: session._id,
  });

  return {
    accessToken,
    newRefreshToken,
  };
};

export const verifyEmail = async (code: string) => {
  const validCode = await VerificationCodeModel.findOne({
    _id: code,
    type: VerificationCodeType.EmailVerification,
    expiresAt: { $gt: now() },
  });
  appAssert(validCode, NOT_FOUND, "Invalid or expired verification code");

  const user = await UserModel.findById(validCode.userID);
  appAssert(user, NOT_FOUND, "User not found");

  // Check if this is an email change verification
  if (user.pendingEmail) {
    // This is an email change verification
    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.verified = true;
    await user.save();

    await validCode.deleteOne();

    // For email change, return the role-based redirect URL
    const redirectUrl = getRoleBasedRedirect(user.role);

    return {
      message: "Email changed and verified successfully",
      user: user.omitPassword(),
      accessToken: null,
      refreshToken: null,
      redirectUrl,
    };
  } else {
    // This is a regular email verification (new user)
    const updatedUser = await UserModel.findByIdAndUpdate(
      validCode.userID,
      {
        verified: true,
      },
      {
        new: true,
      }
    );
    appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to verify email");

    await validCode.deleteOne();

    // Create welcome notification for new user
    try {
      await createNotification({
        userID: (updatedUser as any)._id.toString(),
        title: "Welcome to SASM-IMS! 🎉",
        message:
          "Welcome to the Student Assistant and Student Marshal Information Management System. Get started by completing your profile and submitting your application.",
        type: "info",
      });
    } catch (error) {
      console.error("Failed to create welcome notification:", error);
      // Don't fail the verification if notification creation fails
    }

    // Create session and tokens after successful email verification
    const session = await SessionModel.create({
      userID: updatedUser._id,
      userAgent: "Email verification", // Default user agent for email verification
    });

    const refreshToken = signToken(
      { sessionID: session._id },
      refreshTokenSignOptions
    );

    const accessToken = signToken({
      userID: updatedUser._id,
      sessionID: session._id,
    });

    const redirectUrl = getRoleBasedRedirect(updatedUser.role);

    return {
      user: updatedUser.omitPassword(),
      accessToken,
      refreshToken,
      redirectUrl,
    };
  }
};

export const sendPasswordResetEmail = async (email: string) => {
  // Catch any errors that were thrown and log them (but always return a success)
  // This will prevent leaking sensitive data back to the client (e.g. user not found, email not sent).
  try {
    const user = await UserModel.findOne({ email });
    appAssert(user, NOT_FOUND, "User not found");

    // check for max password reset requests (2 emails in 5min)
    const fiveMinAgo = fiveMinutesAgo();
    const count = await VerificationCodeModel.countDocuments({
      userID: user._id,
      type: VerificationCodeType.PasswordReset,
      createdAt: { $gt: fiveMinAgo },
    });
    appAssert(
      count <= 1,
      TOO_MANY_REQUESTS,
      "Too many requests, please try again later"
    );

    const expiresAt = fifteenMinutesFromNow();
    const verificationCode = await VerificationCodeModel.create({
      userID: user._id,
      type: VerificationCodeType.PasswordReset,
      expiresAt,
    });

    const url = `${APP_ORIGIN}/password/reset?code=${
      verificationCode._id
    }&exp=${expiresAt.getTime()}`;

    const { data, error } = await sendMail({
      to: email,
      ...getPasswordResetTemplate(url),
    });

    appAssert(
      data?.id,
      INTERNAL_SERVER_ERROR,
      `${error?.name} - ${error?.message}`
    );
    return {
      url,
      emailId: data.id,
    };
  } catch (error: any) {
    console.log("SendPasswordResetError:", error.message);
    return {};
  }
};

type ResetPasswordParams = {
  password: string;
  verificationCode: string;
};

export const resetPassword = async ({
  password,
  verificationCode,
}: ResetPasswordParams) => {
  const validCode = await VerificationCodeModel.findOne({
    _id: verificationCode,
    type: VerificationCodeType.PasswordReset,
    expiresAt: { $gt: new Date() },
  });
  appAssert(validCode, NOT_FOUND, "Invalid or expired verification code");

  const user = await UserModel.findById(validCode.userID);
  appAssert(user, NOT_FOUND, "User not found");

  const isSame = await user.comparePassword(password);
  appAssert(
    !isSame,
    CONFLICT,
    "New password must be different from old password"
  );

  user.password = await hashValue(password);
  await user.save();

  await validCode.deleteOne();
  await SessionModel.deleteMany({
    userID: user._id,
  });

  return {
    user: user.omitPassword(),
  };
};

type ChangePasswordParams = {
  currentPassword: string;
  newPassword: string;
  userID: string;
};

export const changePassword = async ({
  currentPassword,
  newPassword,
  userID,
}: ChangePasswordParams) => {
  const user = await UserModel.findById(userID);
  appAssert(user, NOT_FOUND, "User not found");

  const isValidCurrentPassword = await user.comparePassword(currentPassword);
  appAssert(
    isValidCurrentPassword,
    UNAUTHORIZED,
    "Current password is incorrect"
  );

  const isSamePassword = await user.comparePassword(newPassword);
  appAssert(
    !isSamePassword,
    CONFLICT,
    "New password must be different from current password"
  );

  user.password = newPassword;
  await user.save();

  return {
    user: user.omitPassword(),
  };
};

// Change Email======================================================
type ChangeEmailParams = {
  newEmail: string;
  userID: string;
};

export const changeEmail = async ({ newEmail, userID }: ChangeEmailParams) => {
  // Check if the user exists
  const user = await UserModel.findById(userID);
  appAssert(user, NOT_FOUND, "User not found");

  // Prevent abuse: disallow requesting another email change within 5 minutes
  const recentCount = await VerificationCodeModel.countDocuments({
    userID,
    type: VerificationCodeType.EmailVerification,
    createdAt: { $gt: fiveMinutesAgo() },
  });
  appAssert(
    recentCount === 0,
    TOO_MANY_REQUESTS,
    "Please wait 5 minutes before requesting another email change"
  );

  // Check if the new email is already in use by another user
  const existingUser = await UserModel.findOne({
    email: newEmail,
    _id: { $ne: userID },
  });
  appAssert(!existingUser, CONFLICT, "Email is already in use");

  // Check if the new email is the same as current email
  appAssert(
    user.email !== newEmail,
    CONFLICT,
    "New email must be different from current email"
  );

  // Delete any existing verification codes for this user
  await VerificationCodeModel.deleteMany({
    userID,
    type: VerificationCodeType.EmailVerification,
  });

  // Create a new verification code for email change
  const verificationCode = await VerificationCodeModel.create({
    userID,
    type: VerificationCodeType.EmailVerification,
    expiresAt: fifteenMinutesFromNow(),
  });

  // Store the new email temporarily (we'll update it after verification)
  user.pendingEmail = newEmail;
  await user.save();

  // Send verification email to the new email address
  const url = `${APP_ORIGIN}/email/verify/${verificationCode._id}`;
  await sendMail({
    to: newEmail,
    ...getVerifyEmailTemplate(url),
  });

  return {
    message: "Verification email sent to your new email address",
  };
};

// Cancel Email Change=====================================================
export const cancelEmailChange = async (userID: string) => {
  const user = await UserModel.findById(userID);

  appAssert(user, NOT_FOUND, "User not found");
  appAssert(user.pendingEmail, BAD_REQUEST, "No pending email change found");

  // Clear the pending email
  user.pendingEmail = undefined;
  await user.save();

  // Delete any verification codes for email change
  await VerificationCodeModel.deleteMany({
    userId: userID,
    type: VerificationCodeType.EmailVerification,
  });

  return {
    message: "Email change cancelled successfully",
  };
};
