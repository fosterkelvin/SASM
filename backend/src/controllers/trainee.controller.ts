import { Request, Response } from "express";
import { Types } from "mongoose";
import ApplicationModel from "../models/application.model";
import UserModel from "../models/user.model";
import OfficeProfileModel from "../models/officeProfile.model";
import ScholarModel from "../models/scholar.model";
import ScheduleModel from "../models/schedule.model";
import catchErrors from "../utils/catchErrors";
import { BAD_REQUEST, NOT_FOUND, OK, FORBIDDEN } from "../constants/http";
import appAssert from "../utils/appAssert";
import { createNotification } from "../services/notification.service";

// Fixed required hours for all trainees
const DEFAULT_REQUIRED_HOURS = 130;

// Get all trainees (for HR)
export const getAllTraineesHandler = catchErrors(
  async (req: Request, res: Response) => {
    const { office, status, position, scholarStatus } = req.query;

    // If scholarStatus is provided, fetch scholars from both Scholar collection and accepted Applications
    if (scholarStatus) {
      console.log(
        "🔍 [HR] Fetching scholars from Scholar collection AND accepted Applications"
      );

      // 1. Fetch deployed scholars from Scholar collection
      const scholarFilter: any = { status: "active" };
      if (office) {
        scholarFilter.scholarOffice = office;
      }
      if (position) {
        scholarFilter.scholarType = position;
      }

      const scholars = await ScholarModel.find(scholarFilter)
        .populate("userId", "firstname lastname email status")
        .sort({ semesterStartDate: -1 });

      console.log(
        `📊 [HR] Found ${scholars.length} deployed scholars in Scholar collection`
      );

      // 2. Fetch accepted applications (scholars not yet deployed)
      const applicationFilter: any = { status: "accepted" };
      if (office) {
        applicationFilter.scholarOffice = office;
      }
      if (position) {
        applicationFilter.position = position;
      }

      const acceptedApplications = await ApplicationModel.find(
        applicationFilter
      )
        .populate("userID", "firstname lastname email status")
        .sort({ updatedAt: -1 });

      console.log(
        `📊 [HR] Found ${acceptedApplications.length} accepted applications (not yet deployed)`
      );

      // Import DTR model
      const DTRModel = require("../models/dtr.model").default;

      // Process deployed scholars
      const scholarsWithDetails = await Promise.all(
        scholars.map(async (scholar) => {
          if (!scholar.userId || !scholar.userId._id) {
            console.warn(`⚠️  Scholar ${scholar._id} has no valid userId`);
            return null;
          }

          // Get DTR hours
          const dtrs = await DTRModel.find({ userId: scholar.userId._id });
          const dtrHours = dtrs.reduce((sum: number, dtr: any) => {
            return sum + (dtr.totalMonthlyHours || 0);
          }, 0);
          const dtrHoursInHours = Math.floor(dtrHours / 60);

          // Get application data if exists
          const application = await ApplicationModel.findOne({
            userID: scholar.userId._id,
            status: "accepted",
          });

          return {
            _id: application?._id || scholar._id,
            userID: scholar.userId,
            position: scholar.scholarType,
            status: "accepted",
            scholarOffice: scholar.scholarOffice || application?.scholarOffice,
            scholarNotes: scholar.scholarNotes || application?.scholarNotes,
            dtrCompletedHours: dtrHoursInHours,
            semesterStartDate: scholar.semesterStartDate,
            scholarRecord: scholar.toObject(),
            isDeployed: true,
          };
        })
      );

      // Process accepted applications (not yet deployed)
      const acceptedApplicationsWithDetails = await Promise.all(
        acceptedApplications.map(async (application) => {
          if (!application.userID || !application.userID._id) {
            console.warn(
              `⚠️  Application ${application._id} has no valid userID`
            );
            return null;
          }

          // Check if this user is already in scholars (to avoid duplicates)
          const applicationUserId = application.userID._id.toString();
          const alreadyDeployed = scholars.some((s) => {
            if (!s.userId) return false;
            const scholarUserId =
              typeof s.userId === "object" && s.userId._id
                ? s.userId._id.toString()
                : s.userId.toString();
            return scholarUserId === applicationUserId;
          });

          if (alreadyDeployed) {
            console.log(
              `⏭️  Skipping application ${application._id} - user ${applicationUserId} is already deployed`
            );
            return null; // Skip to avoid duplicate
          }

          // Get DTR hours
          const dtrs = await DTRModel.find({ userId: application.userID._id });
          const dtrHours = dtrs.reduce((sum: number, dtr: any) => {
            return sum + (dtr.totalMonthlyHours || 0);
          }, 0);
          const dtrHoursInHours = Math.floor(dtrHours / 60);

          return {
            _id: application._id,
            userID: application.userID,
            position: application.position,
            status: "accepted",
            scholarOffice: application.scholarOffice || null,
            scholarNotes: application.scholarNotes || null,
            dtrCompletedHours: dtrHoursInHours,
            semesterStartDate: application.updatedAt,
            scholarRecord: null,
            isDeployed: false,
          };
        })
      );

      const validScholars = scholarsWithDetails.filter((s) => s !== null);
      const validAcceptedApps = acceptedApplicationsWithDetails.filter(
        (s) => s !== null
      );

      // Final deduplication check: remove duplicates based on userID
      const seenUserIds = new Set<string>();
      const allScholars = [...validScholars, ...validAcceptedApps].filter(
        (scholar) => {
          const userId = scholar.userID._id.toString();
          if (seenUserIds.has(userId)) {
            console.log(`🔍 Removing duplicate for user ${userId}`);
            return false;
          }
          seenUserIds.add(userId);
          return true;
        }
      );

      console.log(
        `✅ [HR] Returning ${allScholars.length} scholars total (${validScholars.length} deployed + ${validAcceptedApps.length} accepted but not deployed, after deduplication)`
      );

      return res.status(OK).json({
        trainees: allScholars,
        totalCount: allScholars.length,
      });
    }

    // Otherwise, fetch trainees in training statuses from Application collection
    const filter: any = {};

    if (status) {
      // Specific status requested
      filter.status = status;
    } else {
      // For Trainee Management page - only trainees in training
      filter.status = {
        $in: [
          "pending_office_interview",
          "office_interview_scheduled",
          "trainee",
          "training_completed",
        ],
      };
    }

    if (office) {
      filter.traineeOffice = office;
    }

    if (position) {
      filter.position = position;
    }

    console.log(
      "🔍 [HR] Fetching trainees with filter:",
      JSON.stringify(filter, null, 2)
    );

    const trainees = await ApplicationModel.find(filter)
      .populate("userID", "firstname lastname email")
      .populate("traineeSupervisor", "firstname lastname email")
      .sort({ traineeStartDate: -1 });

    console.log(`📊 [HR] Found ${trainees.length} trainees`);

    // Import DTR model
    const DTRModel = require("../models/dtr.model").default;

    // For each trainee, calculate their DTR hours
    const traineesWithDTRHours = await Promise.all(
      trainees.map(async (trainee) => {
        // Check if userID exists (populate might fail if user was deleted)
        if (!trainee.userID || !trainee.userID._id) {
          console.warn(
            `⚠️  [HR] Trainee application ${trainee._id} has no valid userID - User may have been deleted. Filtering out from results.`
          );
          return null; // Return null to filter out
        }

        // Get all DTRs for this trainee
        const dtrs = await DTRModel.find({
          userId: trainee.userID._id,
        });

        // Sum up all totalMonthlyHours from all DTRs
        const dtrHours = dtrs.reduce((sum: number, dtr: any) => {
          return sum + (dtr.totalMonthlyHours || 0);
        }, 0);

        // Convert minutes to hours
        const dtrHoursInHours = Math.floor(dtrHours / 60);

        // Return trainee with DTR hours
        return {
          ...trainee.toObject(),
          dtrCompletedHours: dtrHoursInHours,
        };
      })
    );

    // Filter out null entries (trainees without valid users)
    const validTrainees = traineesWithDTRHours.filter((t) => t !== null);

    return res.status(OK).json({
      trainees: validTrainees,
    });
  }
);

// Get trainees for a specific office (for Office users)
export const getOfficeTraineesHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const user = await UserModel.findById(userID);

    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "office" || user.role === "hr",
      FORBIDDEN,
      "Only office staff and HR can access this endpoint"
    );

    // For office users, get trainees assigned to their office
    // For HR, allow filtering by office
    let filter: any = {
      status: {
        $in: [
          "pending_office_interview",
          "office_interview_scheduled",
          "trainee",
          "training_completed",
        ],
      },
    };

    if (user.role === "office") {
      // Office users can access trainees through any profile of their office account
      // Use officeName (preferred) or fall back to office field

      console.log("Office user attempting to fetch trainees:");
      console.log("- User ID:", userID);
      console.log("- User officeName field:", user.officeName);
      console.log("- User office field (fallback):", user.office);
      console.log("- Profile ID:", req.profileID);

      // Use officeName first (new field), then office (old field), then query param
      filter.traineeOffice = user.officeName || user.office;

      // If neither officeName nor office is set, try query parameter
      if (!filter.traineeOffice && req.query.office) {
        filter.traineeOffice = req.query.office;
      }

      // Log the final filter
      console.log("- Filter traineeOffice:", filter.traineeOffice);
    } else if (req.query.office) {
      filter.traineeOffice = req.query.office;
    }

    const trainees = await ApplicationModel.find(filter)
      .populate("userID", "firstname lastname email")
      .populate("traineeSupervisor", "firstname lastname email")
      .sort({ traineeStartDate: -1 });

    console.log(`📊 Found ${trainees.length} applications matching filter`);

    // Import DTR model
    const DTRModel = require("../models/dtr.model").default;

    // For each trainee, calculate their DTR hours
    const traineesWithDTRHours = await Promise.all(
      trainees.map(async (trainee) => {
        // Check if userID exists (populate might fail if user was deleted)
        if (!trainee.userID || !trainee.userID._id) {
          console.warn(
            `⚠️  [Office] Trainee application ${trainee._id} has no valid userID - User may have been deleted. Filtering out from results.`
          );
          return null; // Return null to filter out
        }

        // Get all DTRs for this trainee
        const dtrs = await DTRModel.find({
          userId: trainee.userID._id,
        });

        // Sum up all totalMonthlyHours from all DTRs
        const dtrHours = dtrs.reduce((sum: number, dtr: any) => {
          return sum + (dtr.totalMonthlyHours || 0);
        }, 0);

        // Convert minutes to hours
        const dtrHoursInHours = Math.floor(dtrHours / 60);

        // Return trainee with DTR hours
        return {
          ...trainee.toObject(),
          dtrCompletedHours: dtrHoursInHours,
        };
      })
    );

    // Filter out null entries (trainees without valid users)
    const validTrainees = traineesWithDTRHours.filter((t) => t !== null);

    return res.status(OK).json({
      trainees: validTrainees,
    });
  }
);

// Get scholars for a specific office (for Office users) - SEPARATE from trainees
export const getOfficeScholarsHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const user = await UserModel.findById(userID);

    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "office" || user.role === "hr",
      FORBIDDEN,
      "Only office staff and HR can access this endpoint"
    );

    // Import Scholar model
    const ScholarModel = require("../models/scholar.model").default;

    // Build filter for scholars
    let filter: any = {
      // Include both active and inactive scholars for evaluation purposes
      status: { $in: ["active", "inactive"] },
    };

    if (user.role === "office") {
      console.log("Office user attempting to fetch scholars:");
      console.log("- User ID:", userID);
      console.log("- User officeName field:", user.officeName);
      console.log("- User office field (fallback):", user.office);

      // Use officeName first (new field), then office (old field)
      filter.scholarOffice = user.officeName || user.office;

      // If neither officeName nor office is set, try query parameter
      if (!filter.scholarOffice && req.query.office) {
        filter.scholarOffice = req.query.office;
      }

      console.log("- Filter scholarOffice:", filter.scholarOffice);
    } else if (req.query.office) {
      filter.scholarOffice = req.query.office;
    }

    console.log("📋 Scholar filter:", JSON.stringify(filter, null, 2));

    // Fetch from Scholar collection
    const scholars = await ScholarModel.find(filter)
      .populate("userId", "firstname lastname email")
      .populate("applicationId", "position")
      .sort({ deployedAt: -1 });

    console.log(`📊 Found ${scholars.length} scholars matching filter`);

    // Import DTR model
    const DTRModel = require("../models/dtr.model").default;

    // For each scholar, calculate their DTR hours
    const scholarsWithDTRHours = await Promise.all(
      scholars.map(async (scholar: any) => {
        // Check if userId exists (populate might fail if user was deleted)
        if (!scholar.userId || !scholar.userId._id) {
          console.warn(
            `⚠️  [Office] Scholar ${scholar._id} has no valid userId - User may have been deleted. Filtering out from results.`
          );
          return null;
        }

        // Get all DTRs for this scholar
        const dtrs = await DTRModel.find({
          userId: scholar.userId._id,
        });

        // Sum up all totalMonthlyHours from all DTRs
        const dtrHours = dtrs.reduce((sum: number, dtr: any) => {
          return sum + (dtr.totalMonthlyHours || 0);
        }, 0);

        // Convert minutes to hours
        const dtrHoursInHours = Math.floor(dtrHours / 60);

        // Return scholar data in format expected by frontend
        return {
          _id: scholar._id,
          userID: scholar.userId, // Map userId to userID
          applicationId: scholar.applicationId, // For schedule navigation
          position: scholar.scholarType,
          scholarOffice: scholar.scholarOffice,
          scholarNotes: scholar.scholarNotes,
          status: scholar.status, // Return actual scholar status (active/inactive)
          createdAt: scholar.createdAt,
          dtrCompletedHours: dtrHoursInHours,
          // Normalize for consistency
          traineeOffice: scholar.scholarOffice,
          traineeNotes: scholar.scholarNotes,
        };
      })
    );

    // Filter out null entries (scholars without valid users)
    const validScholars = scholarsWithDTRHours.filter((s) => s !== null);

    console.log(`✅ Returning ${validScholars.length} scholars`);

    return res.status(OK).json({
      trainees: validScholars, // Keep "trainees" key for API consistency
    });
  }
);

// Deploy trainee to office (for HR)
export const deployTraineeHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const { applicationId } = req.params;
    const {
      traineeOffice,
      traineeSupervisor,
      traineeStartDate,
      traineeEndDate,
      // requiredHours is ignored; we use DEFAULT_REQUIRED_HOURS
      traineeNotes,
    } = req.body;

    const application = await ApplicationModel.findById(applicationId);
    appAssert(application, NOT_FOUND, "Application not found");

    appAssert(
      application.status === "interview_passed" ||
        application.status === "trainee" ||
        application.status === "pending_office_interview" ||
        application.status === "office_interview_scheduled" ||
        application.status === "accepted",
      BAD_REQUEST,
      "Application must be in interview_passed, pending_office_interview, office_interview_scheduled, trainee, or accepted status"
    );

    // Validate required fields
    appAssert(traineeOffice, BAD_REQUEST, "Office assignment is required");
    // requiredHours is optional for scholar deployments

    // Get HR user info for timeline
    const hrUser = await UserModel.findById(userID);
    const hrName = hrUser
      ? `${hrUser.firstname} ${hrUser.lastname}`
      : "HR Staff";

    // Update application - scholars keep "accepted" status, trainees go to "pending_office_interview"
    const previousStatus = application.status;
    const isScholar = application.status === "accepted";

    // Only change status if not already a scholar
    if (!isScholar) {
      application.status = "pending_office_interview";
    }

    // Use different fields for scholars vs trainees
    if (isScholar) {
      console.log("🎓 Deploying SCHOLAR:");
      console.log("- Application ID:", application._id);
      console.log("- Student ID:", application.userID);
      console.log("- Office:", traineeOffice);
      console.log("- Position:", application.position);

      application.scholarOffice = traineeOffice;
      application.scholarNotes = traineeNotes || "";
      // Scholars don't have supervisors, required hours, or date ranges during deployment

      try {
        // Create a Scholar record in the new Scholar collection
        const ScholarModel = require("../models/scholar.model").default;
        console.log("📋 Creating Scholar record in database...");

        const newScholar = new ScholarModel({
          userId: application.userID,
          applicationId: application._id,
          scholarOffice: traineeOffice,
          scholarType: application.position, // student_assistant or student_marshal
          deployedBy: userID,
          scholarNotes: traineeNotes || "",
          status: "active",
          semesterStartDate: new Date(), // Track when this semester started
          semesterMonths: 6, // Default semester duration
        });

        await newScholar.save();
        console.log("✅ Scholar record created successfully!");
        console.log("- Scholar ID:", newScholar._id);
        console.log("- Office:", newScholar.scholarOffice);
        console.log("- Type:", newScholar.scholarType);
        console.log("- Semester started:", newScholar.semesterStartDate);

        // Save effectivity date to user data (only if not already set)
        try {
          const UserDataModel = (await import("../models/userdata.model"))
            .default;

          // Check if effectivity date already exists
          const existingUserData = await UserDataModel.findOne({
            userId: application.userID,
          });

          if (!existingUserData?.effectivityDate) {
            const effectivityDate = new Date(); // Current date when scholar is FIRST deployed

            console.log("🔄 Setting effectivity date (first deployment):");
            console.log("- User ID:", application.userID);
            console.log("- Effectivity date:", effectivityDate);

            const result = await UserDataModel.findOneAndUpdate(
              { userId: application.userID },
              { effectivityDate },
              { upsert: true, new: true }
            );

            console.log("✅ Effectivity date saved successfully!");
            console.log("- effectivityDate field:", result?.effectivityDate);
          } else {
            console.log("ℹ️  Effectivity date already exists, skipping update");
            console.log("- Existing date:", existingUserData.effectivityDate);
          }
        } catch (effectivityError) {
          console.error("❌ Error saving effectivity date:", effectivityError);
          // Don't throw - let deployment continue
        }

        // Note: Scholars need to upload their own work schedule
        // Old trainee class schedules are kept as historical data
        console.log(
          "ℹ️  Scholar will need to upload their work schedule separately"
        );
        console.log("   (Trainee class schedule remains as historical data)");
      } catch (error) {
        console.error("❌ Failed to create Scholar record:", error);
        throw error;
      }
    } else {
      application.traineeOffice = traineeOffice;
      application.traineeSupervisor = traineeSupervisor || undefined;
      application.traineeStartDate = traineeStartDate
        ? new Date(traineeStartDate)
        : undefined;
      application.traineeEndDate = traineeEndDate
        ? new Date(traineeEndDate)
        : undefined;
      // Enforce fixed required hours for trainees
      application.requiredHours = DEFAULT_REQUIRED_HOURS;
      application.completedHours = 0;
      application.traineeNotes = traineeNotes || "";
    }

    // Update student's user status
    const student = await UserModel.findById(application.userID);
    const targetUserStatus = isScholar ? "active" : "pending_office_interview";
    console.log(`🔍 Updating student status to ${targetUserStatus}:`, {
      isScholar,
    });
    console.log("- Student found:", !!student);
    console.log("- Student ID:", application.userID);
    if (student) {
      console.log("- Previous student status:", student.status);
      student.status = targetUserStatus;
      await student.save();
      console.log("✅ Student status updated to:", student.status);
    } else {
      console.log("❌ Student not found!");
    }

    // Add timeline entry
    const newStatus = isScholar ? "accepted" : "pending_office_interview";
    const actionNotes = isScholar
      ? `Scholar deployed to ${traineeOffice}${traineeNotes ? `. Notes: ${traineeNotes}` : ""}`
      : `Deployed to ${traineeOffice}. Pending office interview. Required hours: ${DEFAULT_REQUIRED_HOURS}`;

    const timelineEntry = {
      action: isScholar ? "scholar_deployed" : "deployed_to_office",
      performedBy: userID,
      performedByName: hrName,
      timestamp: new Date(),
      previousStatus,
      newStatus,
      notes: actionNotes,
    };

    application.timeline = application.timeline || [];
    application.timeline.push(timelineEntry as any);

    await application.save({ validateBeforeSave: false });

    // Notify office users about the deployment (no email, just in-app notification)
    try {
      const officeUsers = await UserModel.find({
        role: "office",
        officeName: traineeOffice,
      });

      const studentName = student
        ? `${student.firstname} ${student.lastname}`
        : "A student";

      const notificationTitle = isScholar
        ? `New Scholar Deployed to ${traineeOffice}`
        : `New Trainee Deployed to ${traineeOffice}`;

      const notificationMessage = isScholar
        ? `${studentName} has been deployed to your office as a Scholar (${application.position}).${traineeNotes ? ` Notes: ${traineeNotes}` : ""}`
        : `${studentName} has been deployed to your office as a Trainee and is pending office interview. Required hours: ${DEFAULT_REQUIRED_HOURS}.${traineeNotes ? ` Notes: ${traineeNotes}` : ""}`;

      // Create notification for each office user
      const notificationPromises = officeUsers.map((officeUser) =>
        createNotification({
          userID: (officeUser._id as Types.ObjectId).toString(),
          title: notificationTitle,
          message: notificationMessage,
          type: "info",
          relatedApplicationID: (application._id as Types.ObjectId).toString(),
        })
      );

      await Promise.all(notificationPromises);
      console.log(
        `✅ Sent notifications to ${officeUsers.length} office user(s) in ${traineeOffice}`
      );
    } catch (notificationError) {
      console.error(
        "❌ Failed to send office notifications:",
        notificationError
      );
      // Don't fail the deployment if notifications fail
    }

    // Populate for response
    await application.populate("userID", "firstname lastname email");
    await application.populate("traineeSupervisor", "firstname lastname email");

    return res.status(OK).json({
      message: isScholar
        ? "Scholar deployed successfully"
        : "Trainee deployed successfully",
      application,
    });
  }
);

// Update trainee deployment (for HR)
export const updateTraineeDeploymentHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const { applicationId } = req.params;
    const {
      traineeOffice,
      traineeSupervisor,
      traineeStartDate,
      traineeEndDate,
      requiredHours,
      completedHours,
      traineeNotes,
      traineePerformanceRating,
    } = req.body;

    // First check if this is a Scholar ID (for scholars created via re-application)
    let scholar = await ScholarModel.findById(applicationId);

    if (scholar) {
      console.log("🎓 Updating SCHOLAR directly from Scholar collection:");
      console.log("- Scholar ID:", scholar._id);
      console.log("- User ID:", scholar.userId);
      console.log("- New Office:", traineeOffice);

      // Update scholar record
      if (traineeOffice !== undefined) scholar.scholarOffice = traineeOffice;
      if (traineeNotes !== undefined) scholar.scholarNotes = traineeNotes;

      // Reactivate if inactive
      if (scholar.status === "inactive") {
        console.log("🔄 Reactivating inactive scholar...");
        scholar.status = "active";
        scholar.semesterStartDate = new Date();
        scholar.semesterEndDate = undefined;
        scholar.semesterMonths = 6;
      }

      await scholar.save();
      console.log("✅ Scholar record updated successfully!");

      return res.status(OK).json({
        message: "Scholar deployment updated successfully",
        scholar,
      });
    }

    // Otherwise, it's an Application ID
    const application = await ApplicationModel.findById(applicationId);
    appAssert(application, NOT_FOUND, "Application not found");

    appAssert(
      application.status === "trainee" ||
        application.status === "training_completed" ||
        application.status === "accepted",
      BAD_REQUEST,
      "Application must be in trainee, training_completed, or accepted status"
    );

    // Get HR user info for timeline
    const hrUser = await UserModel.findById(userID);
    const hrName = hrUser
      ? `${hrUser.firstname} ${hrUser.lastname}`
      : "HR Staff";

    const isScholar = application.status === "accepted";

    // Update fields if provided - use different fields for scholars vs trainees
    if (isScholar) {
      console.log("🎓 Updating SCHOLAR deployment:");
      console.log("- Application ID:", application._id);
      console.log("- Student ID:", application.userID);
      console.log("- New Office:", traineeOffice);

      // Scholar updates
      if (traineeOffice !== undefined)
        application.scholarOffice = traineeOffice;
      if (traineeNotes !== undefined) application.scholarNotes = traineeNotes;
      // Scholars don't track supervisor, hours, dates, or performance rating

      // Check if Scholar record exists, create if not
      try {
        const ScholarModel = require("../models/scholar.model").default;
        let scholar = await ScholarModel.findOne({
          userId: application.userID,
          applicationId: application._id,
        });

        if (scholar) {
          console.log("📝 Updating existing Scholar record:", scholar._id);
          console.log("- Current status:", scholar.status);
          // Update existing scholar
          if (traineeOffice !== undefined)
            scholar.scholarOffice = traineeOffice;
          if (traineeNotes !== undefined) scholar.scholarNotes = traineeNotes;
          // Reactivate scholar if it was inactive
          if (scholar.status === "inactive") {
            console.log("🔄 Reactivating inactive scholar...");
            scholar.status = "active";
            scholar.semesterStartDate = new Date(); // Start new semester
            scholar.semesterEndDate = undefined; // Clear previous end date
            scholar.semesterMonths = 6; // Reset to 6 months
          }
          await scholar.save();
          console.log("✅ Scholar record updated successfully!");
          console.log("- New status:", scholar.status);
          console.log("- New office:", scholar.scholarOffice);
        } else {
          console.log("📋 No Scholar record found, creating new one...");
          // Create new Scholar record if it doesn't exist
          scholar = new ScholarModel({
            userId: application.userID,
            applicationId: application._id,
            scholarOffice: traineeOffice || application.scholarOffice,
            scholarType: application.position,
            deployedBy: userID,
            scholarNotes: traineeNotes || application.scholarNotes || "",
            status: "active",
            semesterStartDate: new Date(), // Track when this semester started
            semesterMonths: 6, // Default semester duration
          });
          await scholar.save();
          console.log("✅ Scholar record created successfully!");
          console.log("- Scholar ID:", scholar._id);
          console.log("- Office:", scholar.scholarOffice);

          // Note: Scholars need to upload their own work schedule
          // Old trainee class schedules are kept as historical data
          console.log(
            "ℹ️  Scholar will need to upload their work schedule separately"
          );
          console.log("   (Trainee class schedule remains as historical data)");
        }
      } catch (error) {
        console.error("❌ Failed to update/create Scholar record:", error);
        throw error;
      }
    } else {
      // Trainee updates
      if (traineeOffice !== undefined)
        application.traineeOffice = traineeOffice;
      if (traineeSupervisor !== undefined)
        application.traineeSupervisor = traineeSupervisor || undefined;
      if (traineeStartDate !== undefined)
        application.traineeStartDate = traineeStartDate
          ? new Date(traineeStartDate)
          : undefined;
      if (traineeEndDate !== undefined)
        application.traineeEndDate = traineeEndDate
          ? new Date(traineeEndDate)
          : undefined;
      // Always enforce the fixed required hours for trainees
      application.requiredHours = DEFAULT_REQUIRED_HOURS;
      if (completedHours !== undefined)
        application.completedHours = completedHours;
      if (traineeNotes !== undefined) application.traineeNotes = traineeNotes;
      if (traineePerformanceRating !== undefined)
        application.traineePerformanceRating = traineePerformanceRating;
    }

    // Check if training is completed
    if (
      application.completedHours &&
      application.requiredHours &&
      application.completedHours >= application.requiredHours &&
      application.status === "trainee"
    ) {
      const previousStatus = application.status;
      application.status = "training_completed";

      // Update student's user status to "training_completed"
      const student = await UserModel.findById(application.userID);
      if (student) {
        student.status = "training_completed";
        await student.save();
      }

      // Add timeline entry
      const timelineEntry = {
        action: "training_completed",
        performedBy: userID,
        performedByName: hrName,
        timestamp: new Date(),
        previousStatus,
        newStatus: "training_completed",
        notes: `Completed ${application.completedHours} out of ${application.requiredHours} required hours`,
      };

      application.timeline = application.timeline || [];
      application.timeline.push(timelineEntry as any);
    }

    await application.save({ validateBeforeSave: false });

    // Populate for response
    await application.populate("userID", "firstname lastname email");
    await application.populate("traineeSupervisor", "firstname lastname email");

    return res.status(OK).json({
      message: "Trainee deployment updated successfully",
      application,
    });
  }
);

// Undeploy scholar (HR only)
export const undeployScholarHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const { applicationId } = req.params;

    const application = await ApplicationModel.findById(applicationId);
    appAssert(application, NOT_FOUND, "Application not found");

    appAssert(
      application.status === "accepted",
      BAD_REQUEST,
      "Only deployed scholars can be undeployed"
    );

    // Get HR user info for timeline
    const hrUser = await UserModel.findById(userID);
    const hrName = hrUser
      ? `${hrUser.firstname} ${hrUser.lastname}`
      : "HR Staff";

    console.log("🔄 Undeploying SCHOLAR:");
    console.log("- Application ID:", application._id);
    console.log("- Student ID:", application.userID);
    console.log("- Current Office:", application.scholarOffice);

    // Clear scholar deployment info
    const previousOffice = application.scholarOffice;
    application.scholarOffice = "";
    application.scholarNotes = "";

    try {
      // Delete or deactivate Scholar record
      const ScholarModel = require("../models/scholar.model").default;
      const scholar = await ScholarModel.findOne({
        userId: application.userID,
        applicationId: application._id,
        status: "active",
      });

      if (scholar) {
        console.log("📋 Deactivating Scholar record:", scholar._id);
        scholar.status = "inactive";
        scholar.semesterEndDate = new Date(); // Mark when semester ended
        await scholar.save();
        console.log("✅ Scholar record deactivated successfully!");

        // Add service duration for completed semester
        try {
          const serviceDurationService = require("../services/serviceDuration.service");
          const serviceDuration =
            await serviceDurationService.addSemesterService(
              application.userID,
              scholar._id,
              scholar.scholarType
            );
          console.log(
            `✅ Added ${scholar.semesterMonths || 6} months to service duration. Total: ${serviceDuration.serviceMonths} months`
          );
        } catch (error) {
          console.error("❌ Failed to add service duration:", error);
          // Don't throw - this is non-critical
        }

        // Convert scholar schedule back to trainee schedule (optional - keep as scholar)
        const scholarSchedule = await ScheduleModel.findOne({
          userId: application.userID,
          scholarId: scholar._id,
          userType: "scholar",
        });

        if (scholarSchedule) {
          console.log(
            "📋 Found scholar schedule, keeping as scholar type with inactive status"
          );
          // Keep the schedule as is, just the scholar status is now inactive
        }
      } else {
        console.log("⚠️  No active Scholar record found");
      }
    } catch (error) {
      console.error("❌ Failed to deactivate Scholar record:", error);
      throw error;
    }

    // Add timeline entry
    const timelineEntry = {
      action: "scholar_undeployed",
      performedBy: userID,
      performedByName: hrName,
      timestamp: new Date(),
      previousStatus: "accepted",
      newStatus: "accepted",
      notes: `Scholar undeployed from ${previousOffice}`,
    };

    application.timeline = application.timeline || [];
    application.timeline.push(timelineEntry as any);

    await application.save({ validateBeforeSave: false });

    // Populate for response
    await application.populate("userID", "firstname lastname email");

    return res.status(OK).json({
      message: "Scholar undeployed successfully",
      application,
    });
  }
);

// Update trainee hours (for Office staff)
export const updateTraineeHoursHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const { applicationId } = req.params;
    const { completedHours, notes, traineePerformanceRating } = req.body;

    const application = await ApplicationModel.findById(applicationId);
    appAssert(application, NOT_FOUND, "Application not found");

    appAssert(
      application.status === "trainee",
      BAD_REQUEST,
      "Application must be in trainee status"
    );

    appAssert(
      completedHours !== undefined,
      BAD_REQUEST,
      "Completed hours is required"
    );

    // Get user info for timeline
    const user = await UserModel.findById(userID);
    const userName = user
      ? `${user.officeName || user.firstname} ${user.lastname || ""}`.trim()
      : "Office Staff";

    application.completedHours = completedHours;

    // Update performance rating if provided
    if (traineePerformanceRating !== undefined) {
      appAssert(
        traineePerformanceRating >= 1 && traineePerformanceRating <= 5,
        BAD_REQUEST,
        "Performance rating must be between 1 and 5"
      );
      application.traineePerformanceRating = traineePerformanceRating;

      // Add rating timeline entry
      const ratingEntry = {
        action: "performance_rated",
        performedBy: userID,
        performedByName: userName,
        timestamp: new Date(),
        notes: notes || `Performance rated: ${traineePerformanceRating}/5`,
      };
      application.timeline = application.timeline || [];
      application.timeline.push(ratingEntry as any);
    } else {
      // Add regular timeline entry for hours update
      const timelineEntry = {
        action: "hours_updated",
        performedBy: userID,
        performedByName: userName,
        timestamp: new Date(),
        notes: notes || `Updated hours to ${completedHours}`,
      };
      application.timeline = application.timeline || [];
      application.timeline.push(timelineEntry as any);
    }

    // Check if training is completed
    if (
      application.requiredHours &&
      completedHours >= application.requiredHours
    ) {
      const previousStatus = application.status;
      application.status = "training_completed";

      // Update student's user status to "training_completed"
      const student = await UserModel.findById(application.userID);
      if (student) {
        student.status = "training_completed";
        await student.save();
      }

      const completionEntry = {
        action: "training_completed",
        performedBy: userID,
        performedByName: userName,
        timestamp: new Date(),
        previousStatus,
        newStatus: "training_completed",
        notes: `Completed all ${application.requiredHours} required hours`,
      };

      application.timeline.push(completionEntry as any);
    }

    await application.save({ validateBeforeSave: false });

    // Notify HR when office rates a trainee
    if (traineePerformanceRating !== undefined) {
      try {
        // Get student info for the notification
        const student = await UserModel.findById(application.userID);
        const studentName = student
          ? `${student.firstname} ${student.lastname}`
          : "A trainee";

        // Get all HR users
        const hrUsers = await UserModel.find({ role: "hr" });

        // Create notification for each HR user
        for (const hrUser of hrUsers) {
          await createNotification({
            userID: (hrUser as any)._id.toString(),
            title: "⭐ Trainee Performance Rated",
            message: `${userName} has rated ${studentName}'s performance: ${traineePerformanceRating}/5 stars${notes ? ` - ${notes}` : ""}.`,
            type: "info",
            relatedApplicationID: (application as any)._id.toString(),
          });
        }

        console.log(
          `[trainee] Notified HR about performance rating for ${studentName}`
        );
      } catch (error) {
        console.error(
          "[trainee] Failed to notify HR about performance rating:",
          error
        );
        // Don't fail the rating submission if notification fails
      }
    }

    // Populate for response
    await application.populate("userID", "firstname lastname email");
    await application.populate("traineeSupervisor", "firstname lastname email");

    return res.status(OK).json({
      message: "Trainee hours updated successfully",
      application,
    });
  }
);

// Get student's trainee deployment info
export const getMyTraineeInfoHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;

    const application = await ApplicationModel.findOne({
      userID,
      status: {
        $in: [
          "trainee",
          "training_completed",
          "pending_office_interview",
          "office_interview_scheduled",
        ],
      },
    })
      .populate("traineeSupervisor", "firstname lastname email")
      .sort({ traineeStartDate: -1 });

    if (!application) {
      return res.status(OK).json({
        deployment: null,
        message: "No active trainee deployment found",
      });
    }

    return res.status(OK).json({
      deployment: {
        office: application.traineeOffice,
        supervisor: application.traineeSupervisor,
        startDate: application.traineeStartDate,
        endDate: application.traineeEndDate,
        requiredHours: application.requiredHours,
        completedHours: application.completedHours,
        status: application.status,
        notes: application.traineeNotes,
        performanceRating: application.traineePerformanceRating,
        deploymentInterviewDate: application.deploymentInterviewDate,
        deploymentInterviewTime: application.deploymentInterviewTime,
        deploymentInterviewLocation: application.deploymentInterviewLocation,
        deploymentInterviewMode: application.deploymentInterviewMode,
        deploymentInterviewLink: application.deploymentInterviewLink,
        deploymentInterviewNotes: application.deploymentInterviewNotes,
      },
    });
  }
);

// Get scholar deployment info for student (student checks if they're a scholar)
export const getMyScholarInfoHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;

    const ScholarModel = require("../models/scholar.model").default;

    // Check if student is deployed as a scholar
    const scholar = await ScholarModel.findOne({
      userId: userID,
      status: "active",
    }).sort({ deployedAt: -1 });

    if (!scholar) {
      return res.status(OK).json({
        scholar: null,
        message: "No active scholar deployment found",
      });
    }

    return res.status(OK).json({
      scholar: {
        _id: scholar._id,
        office: scholar.scholarOffice,
        scholarType: scholar.scholarType,
        deployedAt: scholar.deployedAt,
        status: scholar.status,
        notes: scholar.scholarNotes,
        performanceRating: scholar.performanceRating,
      },
    });
  }
);

// Schedule deployment interview (for Office staff)
export const scheduleDeploymentInterviewHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const { applicationId } = req.params;
    const {
      deploymentInterviewDate,
      deploymentInterviewTime,
      deploymentInterviewLocation,
      deploymentInterviewMode,
      deploymentInterviewWhatToBring,
    } = req.body;

    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "office" || user.role === "hr",
      FORBIDDEN,
      "Only office staff and HR can schedule deployment interviews"
    );

    const application = await ApplicationModel.findById(applicationId);
    appAssert(application, NOT_FOUND, "Application not found");

    appAssert(
      application.status === "pending_office_interview",
      BAD_REQUEST,
      "Application must be in pending_office_interview status"
    );

    // Validate that the office user matches the trainee's office
    if (user.role === "office") {
      const userOffice = user.officeName || user.office;
      appAssert(
        application.traineeOffice === userOffice,
        FORBIDDEN,
        "You can only schedule interviews for trainees assigned to your office"
      );
    }

    // Validate required fields
    appAssert(
      deploymentInterviewDate && deploymentInterviewTime,
      BAD_REQUEST,
      "Interview date and time are required"
    );

    // Validate future date
    const selectedDate = new Date(deploymentInterviewDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appAssert(
      selectedDate >= today,
      BAD_REQUEST,
      "Interview date must be in the future"
    );

    // Validate time range (8:00 AM - 5:00 PM)
    const [hours, minutes] = deploymentInterviewTime.split(":").map(Number);
    const timeInMinutes = hours * 60 + minutes;
    const minTime = 8 * 60; // 8:00 AM
    const maxTime = 17 * 60; // 5:00 PM
    appAssert(
      timeInMinutes >= minTime && timeInMinutes <= maxTime,
      BAD_REQUEST,
      "Interview time must be between 8:00 AM and 5:00 PM"
    );

    // Update application
    const previousStatus = application.status;
    application.status = "office_interview_scheduled";
    application.deploymentInterviewDate = deploymentInterviewDate;
    application.deploymentInterviewTime = deploymentInterviewTime;
    application.deploymentInterviewLocation = deploymentInterviewLocation;
    application.deploymentInterviewMode =
      deploymentInterviewMode || "in-person";
    application.deploymentInterviewWhatToBring = deploymentInterviewWhatToBring;

    // Add timeline entry
    const userName = user.officeName || `${user.firstname} ${user.lastname}`;
    const timelineEntry = {
      action: "deployment_interview_scheduled",
      performedBy: userID,
      performedByName: userName,
      timestamp: new Date(),
      previousStatus,
      newStatus: "office_interview_scheduled",
      notes: `Deployment interview scheduled for ${deploymentInterviewDate} at ${deploymentInterviewTime} (In-Person)`,
    };

    application.timeline = application.timeline || [];
    application.timeline.push(timelineEntry as any);

    await application.save({ validateBeforeSave: false });

    // Populate for response
    await application.populate("userID", "firstname lastname email");
    await application.populate("traineeSupervisor", "firstname lastname email");

    // Send notification to student
    try {
      const {
        createNotification,
      } = require("../services/notification.service");
      const applicant = await UserModel.findById(application.userID);
      if (applicant && applicant._id) {
        await createNotification({
          userID: String(applicant._id),
          title: "Deployment Interview Scheduled",
          message: `Your deployment interview with ${application.traineeOffice} has been scheduled for ${deploymentInterviewDate} at ${deploymentInterviewTime}.`,
          type: "info",
          relatedApplicationID: applicationId,
        });
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
    }

    // Send email to student
    try {
      const { sendMail } = require("../utils/sendMail");
      const {
        getDeploymentInterviewEmailTemplate,
      } = require("../utils/emailTemplate");
      const applicant = await UserModel.findById(application.userID);

      if (applicant && applicant.email) {
        const applicantName = `${applicant.firstname} ${applicant.lastname}`;
        const emailTemplate = getDeploymentInterviewEmailTemplate(
          applicantName,
          application.traineeOffice,
          deploymentInterviewDate,
          deploymentInterviewTime,
          deploymentInterviewLocation,
          deploymentInterviewWhatToBring
        );

        await sendMail({
          to: applicant.email,
          subject: emailTemplate.subject,
          text: emailTemplate.text,
          html: emailTemplate.html,
        });
      }
    } catch (error) {
      console.error("Failed to send email:", error);
    }

    return res.status(OK).json({
      message: "Deployment interview scheduled successfully",
      application,
    });
  }
);

// Accept deployment (for Office staff)
export const acceptDeploymentHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const { applicationId } = req.params;
    const { notes } = req.body;

    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "office" || user.role === "hr",
      FORBIDDEN,
      "Only office staff and HR can accept deployments"
    );

    const application = await ApplicationModel.findById(applicationId);
    appAssert(application, NOT_FOUND, "Application not found");

    appAssert(
      application.status === "office_interview_scheduled" ||
        application.status === "pending_office_interview",
      BAD_REQUEST,
      "Application must be in office_interview_scheduled or pending_office_interview status"
    );

    // Validate that the office user matches the trainee's office
    if (user.role === "office") {
      const userOffice = user.officeName || user.office;
      appAssert(
        application.traineeOffice === userOffice,
        FORBIDDEN,
        "You can only accept deployments for trainees assigned to your office"
      );
    }

    // Update application status to trainee
    const previousStatus = application.status;
    application.status = "trainee";

    // Update student's user status to "trainee"
    const student = await UserModel.findById(application.userID);
    if (student) {
      student.status = "trainee";
      await student.save();
    }

    // Add timeline entry
    const userName = user.officeName || `${user.firstname} ${user.lastname}`;
    const timelineEntry = {
      action: "deployment_accepted",
      performedBy: userID,
      performedByName: userName,
      timestamp: new Date(),
      previousStatus,
      newStatus: "trainee",
      notes: notes || `Deployment accepted by ${application.traineeOffice}`,
    };

    application.timeline = application.timeline || [];
    application.timeline.push(timelineEntry as any);

    await application.save({ validateBeforeSave: false });

    // Populate for response
    await application.populate("userID", "firstname lastname email");
    await application.populate("traineeSupervisor", "firstname lastname email");

    // Send notification to student
    try {
      const {
        createNotification,
      } = require("../services/notification.service");
      const applicant = await UserModel.findById(application.userID);
      if (applicant && applicant._id) {
        await createNotification({
          userID: String(applicant._id),
          title: "Deployment Accepted!",
          message: `Congratulations! ${application.traineeOffice} has accepted your deployment. Your training will begin on ${application.traineeStartDate?.toLocaleDateString()}.`,
          type: "success",
          relatedApplicationID: applicationId,
        });
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
    }

    return res.status(OK).json({
      message: "Deployment accepted successfully",
      application,
    });
  }
);

// Reject deployment (for Office staff)
export const rejectDeploymentHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const { applicationId } = req.params;
    const { rejectionReason } = req.body;

    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "office" || user.role === "hr",
      FORBIDDEN,
      "Only office staff and HR can reject deployments"
    );

    const application = await ApplicationModel.findById(applicationId);
    appAssert(application, NOT_FOUND, "Application not found");

    appAssert(
      application.status === "office_interview_scheduled" ||
        application.status === "pending_office_interview",
      BAD_REQUEST,
      "Application must be in office_interview_scheduled or pending_office_interview status"
    );

    // Validate that the office user matches the trainee's office
    if (user.role === "office") {
      const userOffice = user.officeName || user.office;
      appAssert(
        application.traineeOffice === userOffice,
        FORBIDDEN,
        "You can only reject deployments for trainees assigned to your office"
      );
    }

    appAssert(rejectionReason, BAD_REQUEST, "Rejection reason is required");

    // Update application - revert back to interview_passed so HR can redeploy
    const previousStatus = application.status;
    application.status = "interview_passed";
    application.deploymentRejectionReason = rejectionReason;

    // Clear deployment fields
    const rejectedOffice = application.traineeOffice;
    application.traineeOffice = undefined;
    application.traineeSupervisor = undefined;
    application.traineeStartDate = undefined;
    application.traineeEndDate = undefined;
    application.deploymentInterviewDate = undefined;
    application.deploymentInterviewTime = undefined;
    application.deploymentInterviewLocation = undefined;
    application.deploymentInterviewMode = undefined;
    application.deploymentInterviewLink = undefined;
    application.deploymentInterviewNotes = undefined;

    // Update student's user status back to "interview_passed"
    const student = await UserModel.findById(application.userID);
    if (student) {
      student.status = "interview_passed";
      await student.save();
    }

    // Add timeline entry
    const userName = user.officeName || `${user.firstname} ${user.lastname}`;
    const timelineEntry = {
      action: "deployment_rejected",
      performedBy: userID,
      performedByName: userName,
      timestamp: new Date(),
      previousStatus,
      newStatus: "interview_passed",
      notes: `Deployment to ${rejectedOffice} rejected. Reason: ${rejectionReason}`,
    };

    application.timeline = application.timeline || [];
    application.timeline.push(timelineEntry as any);

    await application.save({ validateBeforeSave: false });

    // Populate for response
    await application.populate("userID", "firstname lastname email");

    // Send notification to student and HR
    try {
      const {
        createNotification,
      } = require("../services/notification.service");

      // Notify student
      const applicant = await UserModel.findById(application.userID);
      if (applicant && applicant._id) {
        await createNotification({
          userID: String(applicant._id),
          title: "Deployment Update",
          message: `Your deployment to ${rejectedOffice} was not approved. The HR team will work on finding another placement for you.`,
          type: "info",
          relatedApplicationID: applicationId,
        });
      }

      // Notify HR if assigned
      if (application.assignedTo) {
        await createNotification({
          userID: String(application.assignedTo),
          title: "Deployment Rejected",
          message: `${rejectedOffice} rejected the deployment for ${applicant?.firstname} ${applicant?.lastname}. Reason: ${rejectionReason}`,
          type: "warning",
          relatedApplicationID: applicationId,
        });
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
    }

    return res.status(OK).json({
      message: "Deployment rejected successfully",
      application,
    });
  }
);

// Upload class schedule (Student only)
export const uploadClassScheduleHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const file = req.file;
    const { scheduleData } = req.body;

    appAssert(file, BAD_REQUEST, "Schedule file is required");
    appAssert(
      file.mimetype === "application/pdf",
      BAD_REQUEST,
      "Only PDF files are allowed"
    );

    const ScheduleModel = require("../models/schedule.model").default;
    const ScholarModel = require("../models/scholar.model").default;

    // Check if user is a trainee or scholar
    const application = await ApplicationModel.findOne({
      userID,
      status: { $in: ["trainee", "training_completed"] },
    });

    const scholar = await ScholarModel.findOne({
      userId: userID,
      status: "active",
    });

    appAssert(
      application || scholar,
      NOT_FOUND,
      "No active trainee or scholar deployment found for this user"
    );

    const isScholar = !!scholar;
    const userType = isScholar ? "scholar" : "trainee";

    // Find or create schedule
    let schedule = await ScheduleModel.findOne({
      userId: userID,
      ...(isScholar
        ? { scholarId: scholar._id }
        : { applicationId: application!._id }),
    });

    if (!schedule) {
      schedule = new ScheduleModel({
        userId: userID,
        userType,
        ...(isScholar
          ? { scholarId: scholar._id }
          : { applicationId: application!._id }),
      });
    }

    // Store the file path/URL (Cloudinary URL)
    schedule.classSchedule = file.path;
    schedule.uploadedAt = new Date();

    // Store parsed schedule data if provided
    if (scheduleData) {
      try {
        const parsedData =
          typeof scheduleData === "string"
            ? JSON.parse(scheduleData)
            : scheduleData;
        schedule.classScheduleData = parsedData;
      } catch (error) {
        console.error("Error parsing schedule data:", error);
      }
    }

    // Clear any existing duty hours when a new schedule is uploaded
    // Rationale:
    // - For scholars: previously added temporary duty hours should be replaced by the uploaded work schedule
    // - For trainees: temporary duty hours added before class schedule upload should be cleared so office can add fresh duty hours based on the official class schedule
    if (schedule.dutyHours && schedule.dutyHours.length > 0) {
      const who = isScholar ? "scholar" : "trainee";
      console.log(
        `🗑️ Clearing ${schedule.dutyHours.length} temporary duty hours for ${who} (replaced by uploaded schedule)`
      );
      schedule.dutyHours = [];
    }

    await schedule.save();

    console.log(`✅ Schedule uploaded for ${userType}:`, schedule._id);

    return res.status(OK).json({
      message: "Schedule uploaded successfully",
      scheduleUrl: file.path,
      scheduleData: schedule.classScheduleData,
      userType,
    });
  }
);

// Get class schedule (Student and Office/HR)
export const getClassScheduleHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const user = await UserModel.findById(userID);

    appAssert(user, NOT_FOUND, "User not found");

    const ScheduleModel = require("../models/schedule.model").default;
    const ScholarModel = require("../models/scholar.model").default;

    let schedule;

    if (user.role === "student") {
      // Students can only view their own schedule
      schedule = await ScheduleModel.findOne({
        userId: userID,
      });
    } else if (user.role === "office" || user.role === "hr") {
      // Office/HR can view any trainee/scholar's schedule
      const { applicationId } = req.params;

      // Check if it's a scholar by _id, userId, or applicationId
      let scholar = await ScholarModel.findById(applicationId);
      if (!scholar) {
        scholar = await ScholarModel.findOne({ userId: applicationId });
      }
      if (!scholar) {
        scholar = await ScholarModel.findOne({ applicationId });
      }

      if (scholar) {
        // This is a scholar - find schedule by scholarId
        console.log(
          "🎓 Found scholar, fetching schedule by scholarId:",
          scholar._id
        );
        schedule = await ScheduleModel.findOne({
          scholarId: scholar._id,
        });
      } else {
        // Not a scholar, must be a trainee - find schedule by applicationId
        console.log(
          "📚 Not a scholar, fetching schedule by applicationId:",
          applicationId
        );
        schedule = await ScheduleModel.findOne({
          applicationId: applicationId,
        });
      }
    } else {
      throw new Error("Unauthorized");
    }

    if (!schedule) {
      return res.status(OK).json({
        scheduleUrl: null,
        scheduleData: [],
        dutyHours: [],
        message: "No schedule uploaded yet",
      });
    }

    return res.status(OK).json({
      scheduleUrl: schedule.classSchedule || null,
      scheduleData: schedule.classScheduleData || [],
      dutyHours: schedule.dutyHours || [],
      userType: schedule.userType,
    });
  }
);

// Add duty hours to schedule (Office only)
export const addDutyHoursHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const { applicationId } = req.params;
    const { day, startTime, endTime, location, notes } = req.body;

    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "office" || user.role === "hr",
      FORBIDDEN,
      "Only office staff and HR can add duty hours"
    );

    // Validate required fields
    appAssert(day, BAD_REQUEST, "Day is required");
    appAssert(startTime, BAD_REQUEST, "Start time is required");
    appAssert(endTime, BAD_REQUEST, "End time is required");
    appAssert(location, BAD_REQUEST, "Location is required");

    // Import Scholar model
    const ScholarModel = require("../models/scholar.model").default;
    // Utilities for schedule parsing
    const { buildScheduleMap } = require("../utils/scheduleSync");

    // Helper to convert HH:MM to minutes
    const toMinutes = (hhmm: string): number => {
      if (!hhmm) return 0;
      const [h, m] = hhmm.split(":").map((n: string) => parseInt(n, 10));
      return (h || 0) * 60 + (m || 0);
    };

    // Check if this is a scholar by _id, userId, or applicationId
    let scholar = await ScholarModel.findById(applicationId);
    if (!scholar) {
      scholar = await ScholarModel.findOne({ userId: applicationId });
    }
    if (!scholar) {
      scholar = await ScholarModel.findOne({ applicationId });
    }

    if (scholar) {
      // ===== SCHOLAR FLOW =====
      console.log("🎓 Adding duty hours for SCHOLAR");

      // Validate scholar status
      appAssert(
        scholar.status === "active",
        BAD_REQUEST,
        "Scholar must be in active status"
      );

      // Find or create schedule for scholar
      let schedule = await ScheduleModel.findOne({
        scholarId: scholar._id,
      });

      if (!schedule) {
        console.log(
          "📋 No schedule found, creating new schedule for scholar..."
        );

        // Create a new schedule for scholar
        // NOTE: Scholar schedules use scholarId ONLY (not applicationId)
        schedule = new ScheduleModel({
          userId: scholar.userId,
          scholarId: scholar._id,
          userType: "scholar",
          scheduleData: [], // Empty schedule data
          dutyHours: [], // Will add duty hours below
        });

        console.log("✅ Created new scholar schedule structure");
      }

      // Validate office permissions for scholar
      if (user.role === "office") {
        const userOffice = user.officeName || user.office;
        appAssert(
          scholar.scholarOffice === userOffice,
          FORBIDDEN,
          "You can only add duty hours for scholars assigned to your office"
        );
      }

      // Build schedule map and validate conflicts before adding
      const scheduleMap = buildScheduleMap(
        schedule.classScheduleData || [],
        schedule.dutyHours || []
      );
      const slots = scheduleMap[day] || [];
      const newStart = toMinutes(startTime);
      const newEnd = toMinutes(endTime);

      appAssert(
        newEnd > newStart,
        BAD_REQUEST,
        "End time must be after start time"
      );

      const hasConflict = slots.some((s: any) => {
        const sStart = toMinutes(s.startTime);
        const sEnd = toMinutes(s.endTime);
        return newStart < sEnd && newEnd > sStart;
      });

      appAssert(
        !hasConflict,
        BAD_REQUEST,
        "Duty hours conflict with existing schedule on this day"
      );

      // Add duty hour entry to schedule
      const dutyHourEntry = {
        day,
        startTime,
        endTime,
        location,
        notes: notes || "",
      };

      schedule.dutyHours = schedule.dutyHours || [];
      schedule.dutyHours.push(dutyHourEntry);
      schedule.lastModifiedBy = new Types.ObjectId(userID);
      schedule.lastModifiedAt = new Date();

      await schedule.save();

      console.log("✅ Duty hours added to scholar schedule");

      return res.status(OK).json({
        message: "Duty hours added successfully",
        dutyHours: schedule.dutyHours,
      });
    } else {
      // ===== TRAINEE FLOW =====
      console.log("📚 Adding duty hours for TRAINEE");

      const application = await ApplicationModel.findById(applicationId);
      appAssert(application, NOT_FOUND, "Trainee not found");

      // Validate trainee status
      appAssert(
        application.status === "trainee" ||
          application.status === "training_completed",
        BAD_REQUEST,
        "Application must be in trainee or training_completed status"
      );

      // Validate office permissions for trainee
      if (user.role === "office") {
        const userOffice = user.officeName || user.office;
        appAssert(
          application.traineeOffice === userOffice,
          FORBIDDEN,
          "You can only add duty hours for trainees assigned to your office"
        );
      }

      // Find or create schedule for trainee
      let schedule = await ScheduleModel.findOne({ applicationId });

      if (!schedule) {
        console.log(
          "📋 No schedule found, creating new schedule for trainee..."
        );

        schedule = new ScheduleModel({
          userId: application.userID,
          applicationId: applicationId,
          userType: "trainee",
          scheduleData: [],
          dutyHours: [],
        });

        console.log("✅ Created new trainee schedule structure");
      }

      // Build schedule map and validate conflicts before adding
      const scheduleMap = buildScheduleMap(
        schedule.classScheduleData || [],
        schedule.dutyHours || []
      );
      const slots = scheduleMap[day] || [];
      const newStart = toMinutes(startTime);
      const newEnd = toMinutes(endTime);

      appAssert(
        newEnd > newStart,
        BAD_REQUEST,
        "End time must be after start time"
      );

      const hasConflict = slots.some((s: any) => {
        const sStart = toMinutes(s.startTime);
        const sEnd = toMinutes(s.endTime);
        return newStart < sEnd && newEnd > sStart;
      });

      appAssert(
        !hasConflict,
        BAD_REQUEST,
        "Duty hours conflict with existing schedule on this day"
      );

      // Add duty hour entry to schedule
      const dutyHourEntry = {
        day,
        startTime,
        endTime,
        location,
        notes: notes || "",
      };

      schedule.dutyHours = schedule.dutyHours || [];
      schedule.dutyHours.push(dutyHourEntry);
      schedule.lastModifiedBy = new Types.ObjectId(userID);
      schedule.lastModifiedAt = new Date();

      await schedule.save();

      // Add timeline entry to application
      const userName = user.officeName || `${user.firstname} ${user.lastname}`;
      const timelineEntry = {
        action: "duty_hours_added",
        performedBy: userID,
        performedByName: userName,
        timestamp: new Date(),
        notes: `Added duty hours: ${day} ${startTime}-${endTime} at ${location}`,
      };

      application.timeline = application.timeline || [];
      application.timeline.push(timelineEntry as any);
      await application.save({ validateBeforeSave: false });

      console.log("✅ Duty hours added to trainee schedule");

      return res.status(OK).json({
        message: "Duty hours added successfully",
        dutyHours: schedule.dutyHours,
      });
    }
  }
);

// Remove duty hours (Office only)
export const removeDutyHoursHandler = catchErrors(
  async (req: Request, res: Response) => {
    const { applicationId } = req.params;
    const { day, startTime, endTime } = req.body;

    appAssert(
      day && startTime && endTime,
      BAD_REQUEST,
      "Day, startTime, and endTime are required"
    );

    const userID = req.userID!;
    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");

    console.log(
      `🔍 Remove duty hours called with applicationId: ${applicationId}`
    );

    // Check if it's a scholar first
    const scholar = await ScholarModel.findById(applicationId);
    console.log(
      `🔍 Scholar lookup result:`,
      scholar ? `Found: ${scholar._id}` : "Not found"
    );

    let schedule;
    if (scholar) {
      // Find schedule by scholarId for scholars
      console.log("✅ Removing duty hours from scholar schedule");
      schedule = await ScheduleModel.findOne({
        scholarId: scholar._id,
        userType: "scholar",
      });
      console.log(
        `🔍 Schedule lookup by scholarId:`,
        schedule
          ? `Found with ${schedule.dutyHours?.length || 0} duty hours`
          : "Not found"
      );
    } else {
      // It's a trainee - find by applicationId
      console.log(
        "🔍 Not a scholar, checking if it's a trainee application..."
      );
      const application = await ApplicationModel.findById(applicationId);
      appAssert(application, NOT_FOUND, "Trainee or Scholar not found");

      schedule = await ScheduleModel.findOne({
        applicationId: application._id,
        userType: "trainee",
      });
    }

    appAssert(schedule, NOT_FOUND, "Schedule not found");
    appAssert(
      schedule.dutyHours && schedule.dutyHours.length > 0,
      BAD_REQUEST,
      "No duty hours to remove"
    );

    // Find and remove the matching duty hour
    const initialLength = schedule.dutyHours.length;
    schedule.dutyHours = schedule.dutyHours.filter(
      (dh) =>
        !(
          dh.day === day &&
          dh.startTime === startTime &&
          dh.endTime === endTime
        )
    );

    appAssert(
      schedule.dutyHours.length < initialLength,
      NOT_FOUND,
      "Duty hour not found"
    );

    schedule.lastModifiedBy = new Types.ObjectId(userID);
    schedule.lastModifiedAt = new Date();
    await schedule.save();

    console.log(`🗑️ Removed duty hour: ${day} ${startTime}-${endTime}`);

    return res.status(OK).json({
      message: "Duty hour removed successfully",
      dutyHours: schedule.dutyHours,
    });
  }
);

// Download/View class schedule PDF (Student and Office/HR)
export const downloadClassScheduleHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const user = await UserModel.findById(userID);

    appAssert(user, NOT_FOUND, "User not found");

    let schedule;

    if (user.role === "student") {
      // Students can only view their own schedule
      schedule = await ScheduleModel.findOne({
        userId: userID,
        userType: { $in: ["trainee", "scholar"] },
      });
    } else if (user.role === "office" || user.role === "hr") {
      // Office/HR can view any trainee's/scholar's schedule
      const { applicationId } = req.params;
      schedule = await ScheduleModel.findOne({ applicationId });

      // If not found by applicationId, try scholarId
      if (!schedule) {
        const scholar = await ScholarModel.findOne({ applicationId });
        if (scholar) {
          schedule = await ScheduleModel.findOne({ scholarId: scholar._id });
        }
      }
    } else {
      throw new Error("Unauthorized");
    }

    appAssert(schedule, NOT_FOUND, "Schedule not found");
    appAssert(schedule.classSchedule, NOT_FOUND, "No schedule file found");

    // Redirect to the Cloudinary URL
    // Since Cloudinary URLs are public, this should work
    return res.redirect(schedule.classSchedule);
  }
);
