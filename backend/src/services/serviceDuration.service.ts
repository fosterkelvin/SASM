import mongoose from "mongoose";
import UserDataModel from "../models/userdata.model";
import ScholarModel from "../models/scholar.model";

/**
 * Add 6 months to a student's service duration when a semester is completed
 * @param userId - The user's ID
 * @param scholarId - The scholar record ID
 * @param scholarType - Type of scholar (student_assistant or student_marshal)
 * @returns Updated user data with new service duration
 */
export const addSemesterService = async (
  userId: mongoose.Types.ObjectId,
  scholarId: mongoose.Types.ObjectId,
  scholarType: "student_assistant" | "student_marshal"
) => {
  // Find or create user data
  let userData = await UserDataModel.findOne({ userId });

  if (!userData) {
    userData = new UserDataModel({
      userId,
      serviceMonths: 0,
      servicePeriods: [],
    });
  }

  // Get the scholar record to determine dates
  const scholar = await ScholarModel.findById(scholarId);

  if (!scholar) {
    throw new Error("Scholar record not found");
  }

  // Add 6 months to service
  const monthsToAdd = scholar.semesterMonths || 6;
  userData.serviceMonths = (userData.serviceMonths || 0) + monthsToAdd;

  // Add service period record
  const servicePeriod = {
    startDate: scholar.semesterStartDate || scholar.deployedAt || new Date(),
    endDate: new Date(), // Current date as end date
    months: monthsToAdd,
    scholarType,
  };

  userData.servicePeriods = userData.servicePeriods || [];
  userData.servicePeriods.push(servicePeriod);

  await userData.save();

  return userData;
};

/**
 * Get service duration for a user
 * @param userId - The user's ID
 * @returns Service duration in years and months
 */
export const getServiceDuration = async (
  userId: mongoose.Types.ObjectId
): Promise<{ years: number; months: number; totalMonths: number }> => {
  const userData = await UserDataModel.findOne({ userId });

  if (!userData) {
    return { years: 0, months: 0, totalMonths: 0 };
  }

  const totalMonths = userData.serviceMonths || 0;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  return { years, months, totalMonths };
};

/**
 * Start tracking a new semester for a scholar
 * @param scholarId - The scholar record ID
 * @returns Updated scholar record
 */
export const startScholarSemester = async (
  scholarId: mongoose.Types.ObjectId
) => {
  const scholar = await ScholarModel.findById(scholarId);

  if (!scholar) {
    throw new Error("Scholar record not found");
  }

  // Set semester start date if not already set
  if (!scholar.semesterStartDate) {
    scholar.semesterStartDate = new Date();
    scholar.semesterMonths = 6; // Default 6 months per semester
    await scholar.save();
  }

  return scholar;
};

/**
 * Complete a semester and add service duration
 * @param userId - The user's ID
 * @param scholarId - The scholar record ID
 * @returns Updated user data and scholar record
 */
export const completeSemester = async (
  userId: mongoose.Types.ObjectId,
  scholarId: mongoose.Types.ObjectId
) => {
  const scholar = await ScholarModel.findById(scholarId);

  if (!scholar) {
    throw new Error("Scholar record not found");
  }

  // Mark semester as ended
  scholar.semesterEndDate = new Date();
  await scholar.save();

  // Add service duration to user data
  const userData = await addSemesterService(
    userId,
    scholarId,
    scholar.scholarType
  );

  return { userData, scholar };
};
