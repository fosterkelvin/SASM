import { Request, Response } from "express";
import { NOT_FOUND, OK } from "../constants/http";
import UserModel from "../models/user.model";
import OfficeProfileModel from "../models/officeProfile.model";
import ApplicationModel from "../models/application.model";
import ArchivedApplicationModel from "../models/archivedApplication.model";
import ScheduleModel from "../models/schedule.model";
import ScholarModel from "../models/scholar.model";
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

    // Find all active scholars from Scholar collection
    const activeScholars = await ScholarModel.find({ status: "active" });
    console.log("Found active scholars:", activeScholars.length);

    // Get user IDs from scholars
    const scholarUserIds = activeScholars.map((scholar) => scholar.userId);

    // Find users who are scholars (with SA or SM status, or any user with scholar record)
    const scholarUsers = await UserModel.find({
      $or: [
        { _id: { $in: scholarUserIds } },
        { status: { $in: ["SA", "SM", "accepted"] } },
      ],
    });
    console.log("Found scholar users:", scholarUsers.length);

    // Find all applications with status "accepted"
    const acceptedApplications = await ApplicationModel.find({
      status: "accepted",
    });
    console.log("Found accepted applications:", acceptedApplications.length);

    // Get current semester year for archiving
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const semester = month >= 1 && month <= 5 ? "Second" : "First";
    const academicYear =
      month >= 8 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    const semesterYear = `${academicYear} ${semester} Semester`;

    // Archive all accepted applications
    const archivedApplications = acceptedApplications.map((app) => ({
      originalApplication: app.toObject(),
      archivedBy: req.userID,
      archivedReason: "End of Semester - Scholar Reset",
      semesterYear,
      userID: app.userID,
      firstName: app.firstName,
      lastName: app.lastName,
      position: app.position,
      email: app.email,
      originalStatus: app.status,
    }));

    let archivedCount = 0;
    if (archivedApplications.length > 0) {
      await ArchivedApplicationModel.insertMany(archivedApplications);
      archivedCount = archivedApplications.length;
      console.log("Applications archived:", archivedCount);
    }

    // Get user IDs for schedule and scholar deletion
    const scholarUserIds = scholarUsers.map((user) => user._id);

    // Delete scholar records for active scholars
    const scholarDeleteResult = await ScholarModel.deleteMany({
      userId: { $in: scholarUserIds },
    });
    console.log("Scholar records deleted:", scholarDeleteResult.deletedCount);

    // Delete only schedules for scholars (NOT DTR records)
    const scheduleDeleteResult = await ScheduleModel.deleteMany({
      userId: { $in: scholarUserIds },
      userType: "scholar",
    });
    console.log("Schedules deleted:", scheduleDeleteResult.deletedCount);
    // NOTE: DTR records are preserved for historical tracking

    // Update users to "reapplicant" status
    const userUpdateResult = await UserModel.updateMany(
      { _id: { $in: scholarUserIds } },
      { $set: { status: "reapplicant" } }
    );

    // Delete the original accepted applications (they're now archived)
    const applicationDeleteResult = await ApplicationModel.deleteMany({
      status: "accepted",
    });

    const totalUpdated = userUpdateResult.modifiedCount;

    console.log("Users updated:", userUpdateResult.modifiedCount);
    console.log(
      "Applications archived and deleted:",
      applicationDeleteResult.deletedCount
    );
    console.log("Total records updated:", totalUpdated);

    return res.status(OK).json({
      success: true,
      message: `Successfully reset ${userUpdateResult.modifiedCount} scholars to reapplicant status and archived ${archivedCount} applications`,
      details: {
        usersUpdated: userUpdateResult.modifiedCount,
        applicationsArchived: archivedCount,
        scholarsDeleted: scholarDeleteResult.deletedCount,
        schedulesDeleted: scheduleDeleteResult.deletedCount,
        semesterYear,
        totalUpdated,
      },
    });
  }
);
