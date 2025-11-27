import { Request, Response } from "express";
import ScholarModel from "../models/scholar.model";
import UserModel from "../models/user.model";
import EvaluationModel from "../models/evaluation.model";
import ScheduleModel from "../models/schedule.model";
import DTRModel from "../models/dtr.model";
import mongoose from "mongoose";

interface ScholarWithDetails {
  studentName: string;
  studentEmail: string;
  assignedDepartment: string;
  role: string;
  status: string;
  serviceMonths: number;
  evaluationScore: number | null;
  gender: string;
}

export const getMasterlistData = async (req: Request, res: Response) => {
  try {
    // Fetch all scholars with their user data
    const scholars = await ScholarModel.find({})
      .populate("userId", "firstname lastname email")
      .lean();

    // Deduplicate scholars by userId to prevent duplicates in masterlist
    const seenUserIds = new Set<string>();
    const uniqueScholars = scholars.filter((scholar) => {
      const userId = (scholar.userId as any)?._id?.toString();
      if (!userId || seenUserIds.has(userId)) {
        console.warn(`⚠️ Skipping duplicate scholar for userId: ${userId}`);
        return false;
      }
      seenUserIds.add(userId);
      return true;
    });

    const masterlistData: ScholarWithDetails[] = [];

    // Process each scholar
    for (const scholar of uniqueScholars) {
      const userId = scholar.userId as any;

      // Get user details including gender and service months from user model
      const user = await UserModel.findById(scholar.userId).lean();

      // Get the actual userId ObjectId for querying userdatas
      const userIdForQuery =
        typeof scholar.userId === "object"
          ? (scholar.userId as any)._id
          : scholar.userId;

      // Try to get additional data from userdatas collection
      const userData = await mongoose.connection
        .collection("userdatas")
        .findOne({ userId: userIdForQuery });

      console.log(`📊 Scholar ${userId?.firstname} - userData:`, userData);

      // Get gender and serviceMonths from userData collection primarily
      const gender = userData?.sex || (user as any)?.gender || "Not specified";
      const serviceMonths =
        userData?.serviceMonths || (user as any)?.serviceMonths || 0;

      // Get evaluation score (average of all evaluations)
      const evaluations = await EvaluationModel.find({
        scholarId: scholar._id,
      }).lean();

      let avgScore: number | null = null;
      if (evaluations.length > 0) {
        let totalRatings = 0;
        let ratingCount = 0;

        evaluations.forEach((evaluation) => {
          evaluation.items.forEach((item) => {
            if (item.rating) {
              totalRatings += item.rating;
              ratingCount++;
            }
          });
        });

        if (ratingCount > 0) {
          avgScore = Math.round((totalRatings / ratingCount) * 100) / 100;
        }
      }

      // Determine role
      const role =
        scholar.scholarType === "student_assistant"
          ? "SA"
          : scholar.scholarType === "student_marshal"
            ? "SM"
            : "Unknown";

      // Determine status
      let status = "Active";
      if (scholar.status === "inactive") {
        status = "Resigned";
      } else if (scholar.status === "completed") {
        status = "Graduating";
      }
      // TODO: Add "On leave" logic if you have leave tracking

      masterlistData.push({
        studentName: userId
          ? `${userId.firstname} ${userId.lastname}`
          : "Unknown",
        studentEmail: userId?.email || "N/A",
        assignedDepartment: scholar.scholarOffice || "Not assigned",
        role,
        status,
        serviceMonths,
        evaluationScore: avgScore,
        gender,
      });
    }

    // Calculate summary statistics
    const totalScholars = masterlistData.length;
    const maleCount = masterlistData.filter(
      (s) => s.gender.toLowerCase() === "male"
    ).length;
    const femaleCount = masterlistData.filter(
      (s) => s.gender.toLowerCase() === "female"
    ).length;

    res.status(200).json({
      success: true,
      data: {
        scholars: masterlistData,
        summary: {
          total: totalScholars,
          male: maleCount,
          female: femaleCount,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching masterlist data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch masterlist data",
      error: error.message,
    });
  }
};
