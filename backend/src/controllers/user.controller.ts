import { Request, Response } from "express";
import { NOT_FOUND, OK } from "../constants/http";
import UserModel from "../models/user.model";
import OfficeProfileModel from "../models/officeProfile.model";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";

export const getUserHandler = catchErrors(async (req: Request, res: Response) => {
  const user = await UserModel.findById(req.userID);
  appAssert(user, NOT_FOUND, "User not found");

  const userData = user.omitPassword();

  // If user is OFFICE and has a profileID in the token, include profile info
  if (user.role === "office" && req.profileID) {
    const profile = await OfficeProfileModel.findById(req.profileID).select("-profilePIN");
    if (profile) {
      return res.status(OK).json({
        ...userData,
        profileName: profile.profileName,
        profileAvatar: profile.avatar,
        profilePermissions: profile.permissions,
        profileID: profile._id,
      });
    }
  }

  return res.status(OK).json(userData);
});
