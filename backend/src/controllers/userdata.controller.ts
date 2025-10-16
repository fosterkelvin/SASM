import { NOT_FOUND, OK, CREATED, BAD_REQUEST } from "../constants/http";
import UserDataModel from "../models/userdata.model";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";

// Get user data for the authenticated user
export const getUserDataHandler = catchErrors(async (req, res) => {
  const userData = await UserDataModel.findOne({ userId: req.userID });

  if (!userData) {
    // Return empty data structure if not found
    return res.status(OK).json({
      userId: req.userID,
      gender: null,
      birthdate: null,
      civilStatus: null,
      phoneNumber: null,
      address: null,
      age: null,
    });
  }

  const age = userData.getAge();

  return res.status(OK).json({
    ...userData.toObject(),
    age,
  });
});

// Create or update user data
export const upsertUserDataHandler = catchErrors(async (req, res) => {
  const { gender, birthdate, civilStatus, phoneNumber, address } = req.body;

  // Validate birthdate if provided
  if (birthdate) {
    const date = new Date(birthdate);
    if (isNaN(date.getTime())) {
      appAssert(false, BAD_REQUEST, "Invalid birthdate format");
    }
  }

  // Find existing userData or create new one
  let userData = await UserDataModel.findOne({ userId: req.userID });

  if (userData) {
    // Update existing userData
    userData.gender = gender !== undefined ? gender : userData.gender;
    userData.birthdate = birthdate !== undefined ? birthdate : userData.birthdate;
    userData.civilStatus = civilStatus !== undefined ? civilStatus : userData.civilStatus;
    userData.phoneNumber = phoneNumber !== undefined ? phoneNumber : userData.phoneNumber;
    userData.address = address !== undefined ? address : userData.address;

    await userData.save();
  } else {
    // Create new userData
    userData = await UserDataModel.create({
      userId: req.userID,
      gender,
      birthdate,
      civilStatus,
      phoneNumber,
      address,
    });
  }

  const age = userData.getAge();

  return res.status(userData ? OK : CREATED).json({
    message: "User data saved successfully",
    data: {
      ...userData.toObject(),
      age,
    },
  });
});

// Delete user data
export const deleteUserDataHandler = catchErrors(async (req, res) => {
  const userData = await UserDataModel.findOneAndDelete({ userId: req.userID });
  appAssert(userData, NOT_FOUND, "User data not found");

  return res.status(OK).json({
    message: "User data deleted successfully",
  });
});
