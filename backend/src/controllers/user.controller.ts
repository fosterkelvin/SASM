import { Request, Response } from "express";
import { NOT_FOUND, OK } from "../constants/http";
import UserModel from "../models/user.model";
import OfficeProfileModel from "../models/officeProfile.model";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";

// User controller handlers

export const getUserHandler = catchErrors(
  async (req: Request, res: Response) => {
    const user = await UserModel.findById(req.userID);
    appAssert(user, NOT_FOUND, "User not found");

    const userData = user.omitPassword();

    // DEBUG: Log profile info
    console.log("=== GET USER DEBUG ===");
    console.log("User ID:", req.userID);
    console.log("User role:", user.role);
    console.log("Profile ID from token:", req.profileID);
    console.log("Session ID:", req.sessionID);

    // If user is OFFICE and has a profileID in the token, include profile info
    if (user.role === "office" && req.profileID) {
      console.log("Fetching profile with ID:", req.profileID);
      const profile = await OfficeProfileModel.findById(req.profileID).select(
        "-profilePIN"
      );
      console.log(
        "Profile found:",
        profile ? profile.profileName : "NOT FOUND"
      );

      if (profile) {
        const responseData = {
          ...userData,
          profileName: profile.profileName,
          profileAvatar: profile.avatar,
          profilePermissions: profile.permissions,
          profileID: profile._id,
        };
        console.log("Returning user data WITH profile:", {
          profileName: responseData.profileName,
        });
        return res.status(OK).json(responseData);
      }
    }

    console.log(
      "Returning user data WITHOUT profile (profileID:",
      req.profileID,
      ")"
    );
    return res.status(OK).json(userData);
  }
);

export const getUsersHandler = catchErrors(
  async (req: Request, res: Response) => {
    const { role } = req.query;

    let query = {};
    if (role) {
      const roles = (role as string).split(",");
      query = { role: { $in: roles } };
    }

    console.log("=== GET USERS DEBUG ===");
    console.log("Query:", query);
    console.log("User making request:", req.userID);

    const users = await UserModel.find(query).select(
      "-password -verificationCode"
    );

    console.log("Users found:", users.length);
    console.log("Sample user:", users[0]);

    return res.status(OK).json({
      users,
      count: users.length,
    });
  }
);
