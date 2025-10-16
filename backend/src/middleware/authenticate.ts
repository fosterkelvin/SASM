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

  // Verify that the session still exists and is valid
  if (payload.sessionID) {
    const session = await SessionModel.findById(payload.sessionID);
    const now = Date.now();
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
  next();
});

export default authenticate;
