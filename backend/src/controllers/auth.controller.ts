import catchErrors from "../utils/catchErrors";
import {
  refreshUserAccessToken,
  resetPassword,
  sendPasswordResetEmail,
  signinUser,
  signup,
  verifyEmail,
} from "../services/auth.service";
import { CREATED, OK, UNAUTHORIZED } from "../constants/http";
import {
  clearAuthCookies,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAuthCookies,
} from "../utils/cookies";
import {
  emailSchema,
  resetPasswordSchema,
  signinSchema,
  signupSchema,
  verificationCodeSchema,
} from "./auth.schemas";
import { verifyToken } from "../utils/jwt";
import SessionModel from "../models/session.model";
import appAssert from "../utils/appAssert";
import e from "express";

// Signup=====================================================
export const signupHandler = catchErrors(async (req, res) => {
  // Validate request
  const request = signupSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });
  // Call service
  const { user, accessToken, refreshToken } = await signup(request);
  // Return response
  return setAuthCookies({ res, accessToken, refreshToken })
    .status(CREATED)
    .json(user);
});

// Signin=====================================================
export const signinHandler = catchErrors(async (req, res) => {
  const request = signinSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  const { accessToken, refreshToken } = await signinUser(request);

  return setAuthCookies({ res, accessToken, refreshToken })
    .status(OK)
    .json({ message: "Signin successful" });
});

// Signout=====================================================
export const signoutHandler = catchErrors(async (req, res) => {
  const accessToken = req.cookies.accessToken as string | undefined;
  const { payload } = verifyToken(accessToken || "");

  if (payload) {
    await SessionModel.findByIdAndDelete(payload.sessionID);
  }

  return clearAuthCookies(res)
    .status(OK)
    .json({ message: "Signout successful" });
});

// Refresh=====================================================
export const refreshHandler = catchErrors(async (req, res) => {
  const refreshToken = req.cookies.refreshToken as string | undefined;
  appAssert(refreshToken, UNAUTHORIZED, "Refresh token not found");

  const { accessToken, newRefreshToken } =
    await refreshUserAccessToken(refreshToken);

  if (newRefreshToken) {
    res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());
  }

  return res
    .status(OK)
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .json({
      message: "Access token refreshed",
    });
});

// Verify Email=====================================================
export const verifyEmailHandler = catchErrors(async (req, res) => {
  const verificationCode = verificationCodeSchema.parse(req.params.code);

  await verifyEmail(verificationCode);

  return res.status(OK).json({
    message: "Email verified successfully",
  });
});

// Send Password Reset=====================================================
export const sendPasswordResetHandler = catchErrors(async (req, res) => {
  const email = emailSchema.parse(req.body.email);

  await sendPasswordResetEmail(email);

  return res.status(OK).json({
    message: "Password reset email sent",
  });
});

// Reset Password=====================================================
export const resetPasswordHandler = catchErrors(async (req, res) => {
  const request = resetPasswordSchema.parse(req.body);

  await resetPassword(request);

  return clearAuthCookies(res).status(OK).json({
    message: "Password reset successful",
  });
});
