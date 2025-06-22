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

  //create session
  const session = await SessionModel.create({
    userID,
    userAgent: data.userAgent,
  });

  //refresh token and access token
  const refreshToken = signToken(
    { sessionID: session._id },
    refreshTokenSignOptions
  );

  const accessToken = signToken({ userID, sessionID: session._id });

  //return response
  return {
    user: user.omitPassword(),
    refreshToken,
    accessToken,
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

  return {
    user: user.omitPassword(),
    refreshToken,
    accessToken,
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

  return {
    user: updatedUser.omitPassword(),
  };
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

  const updatedUser = await UserModel.findByIdAndUpdate(validCode.userID, {
    password: await hashValue(password),
  });
  appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to reset password");

  await validCode.deleteOne();
  await SessionModel.deleteMany({
    userID: updatedUser._id,
  });

  return {
    user: updatedUser.omitPassword(),
  };
};
