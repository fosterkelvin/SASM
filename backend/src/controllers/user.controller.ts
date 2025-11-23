import { Request, Response } from "express";
import { NOT_FOUND, OK } from "../constants/http";
import UserModel from "../models/user.model";
import OfficeProfileModel from "../models/officeProfile.model";
import ApplicationModel from "../models/application.model";
import ScheduleModel from "../models/schedule.model";
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

// Reset accepted scholars to reapplicant status for new semester
export const resetScholarsToApplicantsHandler = catchErrors(
  async (req: Request, res: Response) => {
    const requestingUser = await UserModel.findById(req.userID);

    // Only HR or Office users can perform this operation
    appAssert(
      requestingUser &&
        (requestingUser.role === "hr" || requestingUser.role === "office"),
      403,
      "Unauthorized: Only HR or Office can reset scholars"
    );

    console.log("=== RESET SCHOLARS TO REAPPLICANTS ===");
    console.log(
      "Requested by:",
      requestingUser.email,
      "Role:",
      requestingUser.role
    );

    // Find all users with status "accepted"
    const acceptedUsers = await UserModel.find({ status: "accepted" });
    console.log("Found accepted users:", acceptedUsers.length);

    // Find all applications with status "accepted"
    const acceptedApplications = await ApplicationModel.find({
      status: "accepted",
    });
    console.log("Found accepted applications:", acceptedApplications.length);

    // Get user IDs for schedule deletion
    const acceptedUserIds = acceptedUsers.map((user) => user._id);

    // Delete only schedules for accepted scholars (NOT DTR records)
    const scheduleDeleteResult = await ScheduleModel.deleteMany({
      userId: { $in: acceptedUserIds },
      userType: "scholar",
    });
    console.log("Schedules deleted:", scheduleDeleteResult.deletedCount);
    // NOTE: DTR records are preserved for historical tracking

    // Update users to "reapplicant" status
    const userUpdateResult = await UserModel.updateMany(
      { status: "accepted" },
      { $set: { status: "reapplicant" } }
    );

    // Update applications to "pending" status (ready for reapplication)
    const applicationUpdateResult = await ApplicationModel.updateMany(
      { status: "accepted" },
      { $set: { status: "pending" } }
    );

    const totalUpdated =
      userUpdateResult.modifiedCount + applicationUpdateResult.modifiedCount;

    console.log("Users updated:", userUpdateResult.modifiedCount);
    console.log("Applications updated:", applicationUpdateResult.modifiedCount);
    console.log("Total records updated:", totalUpdated);

    return res.status(OK).json({
      success: true,
      message: `Successfully reset ${userUpdateResult.modifiedCount} scholars to reapplicant status`,
      details: {
        usersUpdated: userUpdateResult.modifiedCount,
        applicationsUpdated: applicationUpdateResult.modifiedCount,
        schedulesDeleted: scheduleDeleteResult.deletedCount,
        totalUpdated,
      },
    });
  }
);
