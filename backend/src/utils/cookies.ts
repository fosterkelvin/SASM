import { CookieOptions, Response } from "express";
import { fifteenMinutesFromNow, oneWeekFromNow } from "./date";
import { COOKIE_DOMAIN } from "../constants/env";

export const REFRESH_PATH = "/auth/refresh";
const secure = process.env.NODE_ENV !== "development";

// For cross-origin requests (Render backend + Vercel frontend)
// we need sameSite: "none" and secure: true
const defaults: CookieOptions = {
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  httpOnly: true,
  secure, // MUST be true in production for sameSite: "none"
  // Only set domain if explicitly configured (usually not needed for cross-origin)
  ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
};

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: fifteenMinutesFromNow(),
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: oneWeekFromNow(),
  path: REFRESH_PATH,
});

type Params = {
  res: Response;
  accessToken: string;
  refreshToken: string;
};

export const setAuthCookies = ({ res, accessToken, refreshToken }: Params) =>
  res
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

export const clearAuthCookies = (res: Response) =>
  res
    .clearCookie("accessToken", {
      ...defaults,
    })
    .clearCookie("refreshToken", {
      ...defaults,
      path: REFRESH_PATH,
    });
