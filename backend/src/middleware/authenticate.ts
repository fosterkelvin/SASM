import { RequestHandler, Request } from "express";

// Extend the Request interface to include userID, sessionID, and profileID
declare module "express-serve-static-core" {
  interface Request {
    userID?: string;
    sessionID?: string;
    profileID?: string;
  }
}
import appAssert from "../utils/appAssert";
import AppErrorCode from "../constants/appErrorCode";
import { UNAUTHORIZED } from "../constants/http";
import { verifyToken } from "../utils/jwt";
import SessionModel from "../models/session.model";
import catchErrors from "../utils/catchErrors";

// wrap with catchErrors() if you need this to be async
const authenticate: RequestHandler = catchErrors(async (req, res, next) => {
  const accessToken = req.cookies.accessToken as string | undefined;
  appAssert(
    accessToken,
    UNAUTHORIZED,
    "Not authorized",
    AppErrorCode.InvalidAccessToken
  );

  const { error, payload } = verifyToken(accessToken);
  appAssert(
    payload,
    UNAUTHORIZED,
    error === "jwt expired" ? "Token expired" : "Invalid token",
    AppErrorCode.InvalidAccessToken
  );

  // DEBUG: Log token payload
  console.log("=== AUTHENTICATE DEBUG ===");
  console.log("Token payload:", JSON.stringify(payload, null, 2));

  // Verify that the session still exists and is valid
  if (payload.sessionID) {
    const session = await SessionModel.findById(payload.sessionID);
    const now = Date.now();

    // DEBUG: Log session info
    console.log("Session found:", !!session);
    if (session) {
      console.log("Session userID:", session.userID);
      console.log("Session profileID:", session.profileID);
      console.log("Session expires:", session.expiresAt);
    }

    appAssert(
      session && session.expiresAt.getTime() > now,
      UNAUTHORIZED,
      "Session expired or invalid",
      AppErrorCode.InvalidAccessToken
    );
  }

  req.userID = payload.userID as string;
  req.sessionID = payload.sessionID as string | undefined;
  req.profileID = payload.profileID as string | undefined;

  console.log("Request profileID set to:", req.profileID);
  console.log("======================");

  next();
});

export default authenticate;
