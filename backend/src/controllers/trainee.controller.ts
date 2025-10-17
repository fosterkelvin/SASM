import { Request, Response } from "express";
import ApplicationModel from "../models/application.model";
import UserModel from "../models/user.model";
import OfficeProfileModel from "../models/officeProfile.model";
import catchErrors from "../utils/catchErrors";
import { BAD_REQUEST, NOT_FOUND, OK, FORBIDDEN } from "../constants/http";
import appAssert from "../utils/appAssert";

// Get all trainees (for HR)
export const getAllTraineesHandler = catchErrors(
  async (req: Request, res: Response) => {
    const { office, status } = req.query;

    const filter: any = {
      status: {
        $in: [
          "pending_office_interview",
          "office_interview_scheduled",
          "trainee",
          "training_completed",
        ],
      },
    };

    if (office) {
      filter.traineeOffice = office;
    }

    if (status) {
      filter.status = status;
    }

    const trainees = await ApplicationModel.find(filter)
      .populate("userID", "firstname lastname email")
      .populate("traineeSupervisor", "firstname lastname email")
      .sort({ traineeStartDate: -1 });

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
      requiredHours,
      traineeNotes,
    } = req.body;

    const application = await ApplicationModel.findById(applicationId);
    appAssert(application, NOT_FOUND, "Application not found");

    appAssert(
      application.status === "interview_passed" ||
        application.status === "trainee" ||
        application.status === "pending_office_interview" ||
        application.status === "office_interview_scheduled",
      BAD_REQUEST,
      "Application must be in interview_passed, pending_office_interview, office_interview_scheduled, or trainee status"
    );

    // Validate required fields
    appAssert(traineeOffice, BAD_REQUEST, "Office assignment is required");
    appAssert(traineeStartDate, BAD_REQUEST, "Start date is required");
    appAssert(requiredHours, BAD_REQUEST, "Required hours is required");

    // Get HR user info for timeline
    const hrUser = await UserModel.findById(userID);
    const hrName = hrUser
      ? `${hrUser.firstname} ${hrUser.lastname}`
      : "HR Staff";

    // Update application - set to pending_office_interview
    const previousStatus = application.status;
    application.status = "pending_office_interview";
    application.traineeOffice = traineeOffice;
    application.traineeSupervisor = traineeSupervisor || undefined;
    application.traineeStartDate = new Date(traineeStartDate);
    application.traineeEndDate = traineeEndDate
      ? new Date(traineeEndDate)
      : undefined;
    application.requiredHours = requiredHours;
    application.completedHours = 0;
    application.traineeNotes = traineeNotes || "";

    // Update student's user status to "pending_office_interview"
    const student = await UserModel.findById(application.userID);
    console.log("🔍 Updating student status to pending_office_interview:");
    console.log("- Student found:", !!student);
    console.log("- Student ID:", application.userID);
    if (student) {
      console.log("- Previous student status:", student.status);
      student.status = "pending_office_interview";
      await student.save();
      console.log("✅ Student status updated to:", student.status);
    } else {
      console.log("❌ Student not found!");
    }

    // Add timeline entry
    const timelineEntry = {
      action: "deployed_to_office",
      performedBy: userID,
      performedByName: hrName,
      timestamp: new Date(),
      previousStatus,
      newStatus: "pending_office_interview",
      notes: `Deployed to ${traineeOffice}. Pending office interview. Required hours: ${requiredHours}`,
    };

    application.timeline = application.timeline || [];
    application.timeline.push(timelineEntry as any);

    await application.save();

    // Populate for response
    await application.populate("userID", "firstname lastname email");
    await application.populate("traineeSupervisor", "firstname lastname email");

    return res.status(OK).json({
      message: "Trainee deployed successfully",
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

    const application = await ApplicationModel.findById(applicationId);
    appAssert(application, NOT_FOUND, "Application not found");

    appAssert(
      application.status === "trainee" ||
        application.status === "training_completed",
      BAD_REQUEST,
      "Application must be in trainee or training_completed status"
    );

    // Get HR user info for timeline
    const hrUser = await UserModel.findById(userID);
    const hrName = hrUser
      ? `${hrUser.firstname} ${hrUser.lastname}`
      : "HR Staff";

    // Update fields if provided
    if (traineeOffice !== undefined) application.traineeOffice = traineeOffice;
    if (traineeSupervisor !== undefined)
      application.traineeSupervisor = traineeSupervisor || undefined;
    if (traineeStartDate !== undefined)
      application.traineeStartDate = new Date(traineeStartDate);
    if (traineeEndDate !== undefined)
      application.traineeEndDate = traineeEndDate
        ? new Date(traineeEndDate)
        : undefined;
    if (requiredHours !== undefined) application.requiredHours = requiredHours;
    if (completedHours !== undefined)
      application.completedHours = completedHours;
    if (traineeNotes !== undefined) application.traineeNotes = traineeNotes;
    if (traineePerformanceRating !== undefined)
      application.traineePerformanceRating = traineePerformanceRating;

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

    await application.save();

    // Populate for response
    await application.populate("userID", "firstname lastname email");
    await application.populate("traineeSupervisor", "firstname lastname email");

    return res.status(OK).json({
      message: "Trainee deployment updated successfully",
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

    await application.save();

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

    await application.save();

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

    await application.save();

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

    await application.save();

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
