import catchErrors from "../utils/catchErrors";
import {
  changePassword,
  refreshUserAccessToken,
  resetPassword,
  sendPasswordResetEmail,
  signinUser,
  signup,
  verifyEmail,
  resendVerificationEmail,
  changeEmail,
  cancelEmailChange,
} from "../services/auth.service";
import { CREATED, OK, UNAUTHORIZED } from "../constants/http";
import {
  clearAuthCookies,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAuthCookies,
} from "../utils/cookies";
import {
  changePasswordSchema,
  emailSchema,
  resetPasswordSchema,
  signinSchema,
  signupSchema,
  verificationCodeSchema,
  changeEmailSchema,
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
  const { user, message } = await signup(request);
  // Return response (no cookies set - user needs to verify email first)
  return res.status(CREATED).json({
    message,
    user,
  });
});

// Signin=====================================================
export const signinHandler = catchErrors(async (req, res) => {
  const request = signinSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  const { user, accessToken, refreshToken, redirectUrl } =
    await signinUser(request);

  return setAuthCookies({ res, accessToken, refreshToken }).status(OK).json({
    message: "Signin successful",
    user,
    redirectUrl,
  });
});

// Signout=====================================================
export const signoutHandler = catchErrors(async (req, res) => {
  const accessToken = req.cookies.accessToken as string | undefined;
  const refreshToken = req.cookies.refreshToken as string | undefined;

  // Try to get session from access token first, then refresh token
  let sessionID: string | undefined;

  if (accessToken) {
    const { payload, error } = verifyToken(accessToken);
    if (!error && payload) {
      sessionID = (payload as any).sessionID;
    }
  }

  if (!sessionID && refreshToken) {
    const { payload, error } = verifyToken(refreshToken);
    if (!error && payload) {
      sessionID = (payload as any).sessionID;
    }
  }

  // Delete session from database if we found a session ID
  if (sessionID) {
    try {
      await SessionModel.findByIdAndDelete(sessionID);
    } catch (error) {
      console.error("Error deleting session:", error);
      // Continue with signout even if session deletion fails
    }
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

  const result = await verifyEmail(verificationCode);

  // Check if this is an email change verification (no tokens)
  if (!result.accessToken || !result.refreshToken) {
    return res.status(OK).json({
      message: result.message || "Email verified successfully",
      user: result.user,
      redirectUrl: result.redirectUrl,
    });
  }

  // Regular email verification with tokens
  return setAuthCookies({
    res,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  })
    .status(OK)
    .json({
      message: "Email verified successfully",
      user: result.user,
      redirectUrl: result.redirectUrl,
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

// Resend Verification Email=====================================================
export const resendVerificationEmailHandler = catchErrors(async (req, res) => {
  const email = emailSchema.parse(req.body.email);

  const result = await resendVerificationEmail(email);

  return res.status(OK).json(result);
});

// Reset Password=====================================================
export const resetPasswordHandler = catchErrors(async (req, res) => {
  const request = resetPasswordSchema.parse(req.body);

  await resetPassword(request);

  return clearAuthCookies(res).status(OK).json({
    message: "Password reset successful",
  });
});

// Change Password=====================================================
export const changePasswordHandler = catchErrors(async (req, res) => {
  const request = changePasswordSchema.parse(req.body);

  await changePassword({
    ...request,
    userID: req.userID!,
  });

  return res.status(OK).json({
    message: "Password changed successfully",
  });
});

// Change Email=====================================================
export const changeEmailHandler = catchErrors(async (req, res) => {
  console.log("changeEmailHandler called with body:", req.body);
  console.log("User ID:", req.userID);

  const request = changeEmailSchema.parse(req.body);
  console.log("Parsed request:", request);

  const result = await changeEmail({
    ...request,
    userID: req.userID!,
  });

  console.log("Change email result:", result);
  return res.status(OK).json(result);
});

// Cancel Email Change=====================================================
export const cancelEmailChangeHandler = catchErrors(async (req, res) => {
  const result = await cancelEmailChange(req.userID!);
  return res.status(OK).json(result);
});
