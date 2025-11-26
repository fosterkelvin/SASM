import { Request, Response } from "express";
import catchErrors from "../utils/catchErrors";
import ApplicationModel from "../models/application.model";
import UserModel from "../models/user.model";
import appAssert from "../utils/appAssert";
import { BAD_REQUEST, FORBIDDEN, NOT_FOUND, OK } from "../constants/http";
import {
  createApplicationStatusNotification,
  createNotification,
} from "../services/notification.service";
import { sendMail } from "../utils/sendMail";
import { getApplicationStatusEmailTemplate } from "../utils/emailTemplate";
// Fixed required hours for all trainees
const DEFAULT_REQUIRED_HOURS = 130;

// Schedule Psychometric Test
export const schedulePsychometricTestHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const applicationId = req.params.id;
    const {
      psychometricTestDate,
      psychometricTestTime,
      psychometricTestLocation,
      psychometricTestLink,
      psychometricTestNotes,
    } = req.body;

    // Check permissions
    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "hr" || user.role === "office",
      FORBIDDEN,
      "Access denied"
    );

    const application = await ApplicationModel.findById(applicationId);
    appAssert(application, NOT_FOUND, "Application not found");

    // Validate application status
    appAssert(
      application.status === "under_review",
      BAD_REQUEST,
      "Application must be under review to schedule psychometric test"
    );

    // Validate required fields
    appAssert(
      psychometricTestDate && psychometricTestTime,
      BAD_REQUEST,
      "Test date and time are required"
    );

    appAssert(
      psychometricTestLocation || psychometricTestLink,
      BAD_REQUEST,
      "Test location or link is required"
    );

    // Update application
    const previousStatus = application.status;
    application.status = "psychometric_scheduled";
    application.psychometricTestDate = psychometricTestDate;
    application.psychometricTestTime = psychometricTestTime;
    application.psychometricTestLocation = psychometricTestLocation;
    application.psychometricTestLink = psychometricTestLink;
    application.psychometricTestNotes = psychometricTestNotes;
    application.psychometricScheduledAt = new Date();

    // Add timeline entry
    application.timeline = application.timeline || [];
    application.timeline.push({
      action: "psychometric_test_scheduled",
      performedBy: userID,
      performedByName: `${user.firstname} ${user.lastname}`,
      timestamp: new Date(),
      previousStatus,
      newStatus: "psychometric_scheduled",
      notes: `Test scheduled for ${psychometricTestDate} at ${psychometricTestTime}`,
    } as any);

    await application.save();
    await application.populate([
      { path: "userID", select: "firstname lastname email" },
      { path: "assignedTo", select: "firstname lastname" },
    ]);

    // Send notification
    try {
      const applicant = await UserModel.findById(application.userID);
      if (applicant && applicant._id) {
        await createNotification({
          userID: String(applicant._id),
          title: "Psychometric Test Scheduled",
          message: `Your psychometric test has been scheduled for ${psychometricTestDate} at ${psychometricTestTime}. ${
            psychometricTestLocation
              ? `Location: ${psychometricTestLocation}`
              : `Link: ${psychometricTestLink}`
          }`,
          type: "info",
          relatedApplicationID: applicationId,
        });

        // Send email
        const emailTemplate = getApplicationStatusEmailTemplate(
          `${applicant.firstname} ${applicant.lastname}`,
          application.position === "student_assistant"
            ? "Student Assistant"
            : "Student Marshal",
          "psychometric_scheduled",
          `Your psychometric test has been scheduled for ${psychometricTestDate} at ${psychometricTestTime}.`
        );

        await sendMail({
          to: applicant.email,
          subject: emailTemplate.subject,
          text: emailTemplate.text,
          html: emailTemplate.html,
        });
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
    }

    return res.status(OK).json({
      message: "Psychometric test scheduled successfully",
      application,
    });
  }
);

// Submit Psychometric Test Score
export const submitPsychometricTestScoreHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const applicationId = req.params.id;
    const {
      psychometricTestScore,
      psychometricTestPassed,
      psychometricTestNotes,
    } = req.body;

    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "hr" || user.role === "office",
      FORBIDDEN,
      "Access denied"
    );

    const application = await ApplicationModel.findById(applicationId);
    appAssert(application, NOT_FOUND, "Application not found");

    appAssert(
      application.status === "psychometric_scheduled" ||
        application.status === "psychometric_completed",
      BAD_REQUEST,
      "Invalid application status"
    );

    appAssert(
      psychometricTestScore !== undefined &&
        psychometricTestScore >= 0 &&
        psychometricTestScore <= 100,
      BAD_REQUEST,
      "Valid test score (0-100) is required"
    );

    // Update application
    const previousStatus = application.status;
    application.psychometricTestScore = psychometricTestScore;
    application.psychometricTestPassed = psychometricTestPassed;
    application.psychometricTestNotes = psychometricTestNotes;
    application.psychometricCompletedAt = new Date();
    application.status = psychometricTestPassed
      ? "psychometric_passed"
      : "psychometric_failed";

    // Add timeline entry
    application.timeline = application.timeline || [];
    application.timeline.push({
      action: "psychometric_test_scored",
      performedBy: userID,
      performedByName: `${user.firstname} ${user.lastname}`,
      timestamp: new Date(),
      previousStatus,
      newStatus: application.status,
      notes: `Score: ${psychometricTestScore}%. Result: ${
        psychometricTestPassed ? "Passed" : "Failed"
      }`,
    } as any);

    await application.save();
    await application.populate([
      { path: "userID", select: "firstname lastname email" },
    ]);

    // Send notification
    try {
      const applicant = await UserModel.findById(application.userID);
      if (applicant && applicant._id) {
        await createNotification({
          userID: String(applicant._id),
          title: psychometricTestPassed
            ? "Psychometric Test Passed!"
            : "Psychometric Test Result",
          message: psychometricTestPassed
            ? "Congratulations! You passed the psychometric test. The HR team will contact you for the next step."
            : "Thank you for taking the psychometric test. We will review your application and get back to you.",
          type: psychometricTestPassed ? "success" : "info",
          relatedApplicationID: applicationId,
        });
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
    }

    return res.status(OK).json({
      message: "Psychometric test score submitted successfully",
      application,
    });
  }
);

// Schedule Interview
export const scheduleInterviewHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const applicationId = req.params.id;
    const {
      interviewDate,
      interviewTime,
      interviewLocation,
      interviewMode,
      interviewLink,
      interviewNotes,
    } = req.body;

    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "hr" || user.role === "office",
      FORBIDDEN,
      "Access denied"
    );

    const application = await ApplicationModel.findById(applicationId);
    appAssert(application, NOT_FOUND, "Application not found");

    appAssert(
      application.status === "psychometric_passed",
      BAD_REQUEST,
      "Applicant must pass psychometric test before interview"
    );

    appAssert(
      interviewDate && interviewTime,
      BAD_REQUEST,
      "Interview date and time are required"
    );

    appAssert(
      interviewMode,
      BAD_REQUEST,
      "Interview mode is required (in-person, virtual, or phone)"
    );

    // Update application
    const previousStatus = application.status;
    application.status = "interview_scheduled";
    application.interviewDate = interviewDate;
    application.interviewTime = interviewTime;
    application.interviewLocation = interviewLocation;
    application.interviewMode = interviewMode;
    application.interviewLink = interviewLink;
    application.interviewNotes = interviewNotes;
    application.interviewScheduledAt = new Date();

    // Add timeline entry
    application.timeline = application.timeline || [];
    application.timeline.push({
      action: "interview_scheduled",
      performedBy: userID,
      performedByName: `${user.firstname} ${user.lastname}`,
      timestamp: new Date(),
      previousStatus,
      newStatus: "interview_scheduled",
      notes: `Interview scheduled for ${interviewDate} at ${interviewTime} (${interviewMode})`,
    } as any);

    await application.save();
    await application.populate([
      { path: "userID", select: "firstname lastname email" },
    ]);

    // Send notification
    try {
      const applicant = await UserModel.findById(application.userID);
      if (applicant && applicant._id) {
        await createNotification({
          userID: String(applicant._id),
          title: "Interview Scheduled",
          message: `Your interview has been scheduled for ${interviewDate} at ${interviewTime}. Mode: ${interviewMode}. ${
            interviewLocation
              ? `Location: ${interviewLocation}`
              : interviewLink
                ? `Link: ${interviewLink}`
                : ""
          }`,
          type: "info",
          relatedApplicationID: applicationId,
        });
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
    }

    return res.status(OK).json({
      message: "Interview scheduled successfully",
      application,
    });
  }
);

// Submit Interview Result
export const submitInterviewResultHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const applicationId = req.params.id;
    const { interviewScore, interviewPassed, interviewNotes } = req.body;

    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "hr" || user.role === "office",
      FORBIDDEN,
      "Access denied"
    );

    const application = await ApplicationModel.findById(applicationId);
    appAssert(application, NOT_FOUND, "Application not found");

    appAssert(
      application.status === "interview_scheduled" ||
        application.status === "interview_completed",
      BAD_REQUEST,
      "Invalid application status"
    );

    appAssert(
      interviewScore !== undefined &&
        interviewScore >= 1 &&
        interviewScore <= 5,
      BAD_REQUEST,
      "Interview score (1-5) is required"
    );

    // Update application
    const previousStatus = application.status;
    application.interviewScore = interviewScore;
    application.interviewPassed = interviewPassed;
    application.interviewNotes = interviewNotes;
    application.interviewCompletedAt = new Date();
    application.status = interviewPassed
      ? "interview_passed"
      : "interview_failed";

    // Add timeline entry
    application.timeline = application.timeline || [];
    application.timeline.push({
      action: "interview_completed",
      performedBy: userID,
      performedByName: `${user.firstname} ${user.lastname}`,
      timestamp: new Date(),
      previousStatus,
      newStatus: application.status,
      notes: `Score: ${interviewScore}/5. Result: ${
        interviewPassed ? "Passed" : "Failed"
      }`,
    } as any);

    await application.save();
    await application.populate([
      { path: "userID", select: "firstname lastname email" },
    ]);

    // Send notification
    try {
      const applicant = await UserModel.findById(application.userID);
      if (applicant && applicant._id) {
        await createNotification({
          userID: String(applicant._id),
          title: interviewPassed ? "Interview Passed!" : "Interview Result",
          message: interviewPassed
            ? "Congratulations! You passed the interview. You will be set as a trainee soon."
            : "Thank you for attending the interview. We will review your application and get back to you.",
          type: interviewPassed ? "success" : "info",
          relatedApplicationID: applicationId,
        });
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
    }

    return res.status(OK).json({
      message: "Interview result submitted successfully",
      application,
    });
  }
);

// Set as Trainee
export const setAsTraineeHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const applicationId = req.params.id;
    const {
      traineeStartDate,
      // requiredHours is ignored; we use DEFAULT_REQUIRED_HOURS
      traineeOffice,
      traineeSupervisor,
      traineeNotes,
    } = req.body;

    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "hr" || user.role === "office",
      FORBIDDEN,
      "Access denied"
    );

    const application = await ApplicationModel.findById(applicationId);
    appAssert(application, NOT_FOUND, "Application not found");

    appAssert(
      application.status === "interview_passed",
      BAD_REQUEST,
      "Applicant must pass interview before being set as trainee"
    );

    appAssert(traineeStartDate, BAD_REQUEST, "Start date is required");

    // Update application
    const previousStatus = application.status;
    application.status = "trainee";
    application.traineeStartDate = new Date(traineeStartDate);
    application.requiredHours = DEFAULT_REQUIRED_HOURS;
    application.completedHours = 0;
    application.traineeOffice = traineeOffice;
    application.traineeSupervisor = traineeSupervisor;
    application.traineeNotes = traineeNotes;

    // Add timeline entry
    application.timeline = application.timeline || [];
    application.timeline.push({
      action: "set_as_trainee",
      performedBy: userID,
      performedByName: `${user.firstname} ${user.lastname}`,
      timestamp: new Date(),
      previousStatus,
      newStatus: "trainee",
      notes: `Set as trainee. Required hours: ${DEFAULT_REQUIRED_HOURS}. Start date: ${traineeStartDate}`,
    } as any);

    await application.save();
    await application.populate([
      { path: "userID", select: "firstname lastname email" },
      { path: "traineeSupervisor", select: "firstname lastname" },
    ]);

    // Send notification
    try {
      const applicant = await UserModel.findById(application.userID);
      if (applicant && applicant._id) {
        await createNotification({
          userID: String(applicant._id),
          title: "Welcome! You're now a Trainee",
          message: `Congratulations! You have been set as a trainee. You need to complete ${DEFAULT_REQUIRED_HOURS} hours starting from ${traineeStartDate}. ${
            traineeOffice ? `Office: ${traineeOffice}` : ""
          }`,
          type: "success",
          relatedApplicationID: applicationId,
        });
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
    }

    return res.status(OK).json({
      message: "Applicant set as trainee successfully",
      application,
    });
  }
);

// Update Trainee Hours
export const updateTraineeHoursHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const applicationId = req.params.id;
    const { completedHours, traineeNotes } = req.body;

    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "hr" || user.role === "office",
      FORBIDDEN,
      "Access denied"
    );

    const application = await ApplicationModel.findById(applicationId);
    appAssert(application, NOT_FOUND, "Application not found");

    appAssert(
      application.status === "trainee",
      BAD_REQUEST,
      "Application must be in trainee status"
    );

    appAssert(
      completedHours !== undefined && completedHours >= 0,
      BAD_REQUEST,
      "Valid completed hours required"
    );

    // Update application
    const previousHours = application.completedHours || 0;
    application.completedHours = completedHours;
    if (traineeNotes) {
      application.traineeNotes = traineeNotes;
    }

    // Check if training is completed
    if (
      application.requiredHours &&
      completedHours >= application.requiredHours
    ) {
      const previousStatus = application.status;
      application.status = "training_completed";
      application.traineeEndDate = new Date();

      // Add timeline entry for completion
      application.timeline = application.timeline || [];
      application.timeline.push({
        action: "training_completed",
        performedBy: userID,
        performedByName: `${user.firstname} ${user.lastname}`,
        timestamp: new Date(),
        previousStatus,
        newStatus: "training_completed",
        notes: `Training completed! ${completedHours}/${application.requiredHours} hours`,
      } as any);

      await application.save();

      // Send notification for completion
      try {
        const applicant = await UserModel.findById(application.userID);
        if (applicant && applicant._id) {
          await createNotification({
            userID: String(applicant._id),
            title: "Training Completed!",
            message: `Congratulations! You have completed your training (${completedHours} hours). Your application will be reviewed for final acceptance.`,
            type: "success",
            relatedApplicationID: applicationId,
          });
        }
      } catch (error) {
        console.error("Failed to send notification:", error);
      }
    } else {
      // Just add timeline entry for hours update
      application.timeline = application.timeline || [];
      application.timeline.push({
        action: "hours_updated",
        performedBy: userID,
        performedByName: `${user.firstname} ${user.lastname}`,
        timestamp: new Date(),
        notes: `Hours updated: ${previousHours} → ${completedHours}/${application.requiredHours}`,
      } as any);

      await application.save();
    }

    await application.populate([
      { path: "userID", select: "firstname lastname email" },
    ]);

    return res.status(OK).json({
      message: "Trainee hours updated successfully",
      application,
    });
  }
);

// Accept Application (Final Step)
export const acceptApplicationHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const applicationId = req.params.id;
    const { traineePerformanceRating, hrComments } = req.body;

    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(user.role === "hr", FORBIDDEN, "Only HR can accept applications");

    const application = await ApplicationModel.findById(applicationId);
    appAssert(application, NOT_FOUND, "Application not found");

    appAssert(
      application.status === "training_completed",
      BAD_REQUEST,
      "Training must be completed before acceptance"
    );

    // Check academic email
    const applicant = await UserModel.findById(application.userID);
    appAssert(applicant, NOT_FOUND, "Applicant not found");

    const candidateEmail = (
      applicant.pendingEmail ||
      applicant.email ||
      ""
    ).toLowerCase();
    appAssert(
      candidateEmail.endsWith("@s.ubaguio.edu"),
      BAD_REQUEST,
      "Applicant must have an academic email ending with @s.ubaguio.edu"
    );

    // Update application
    const previousStatus = application.status;
    application.status = "accepted";
    if (traineePerformanceRating) {
      application.traineePerformanceRating = traineePerformanceRating;
    }
    if (hrComments) {
      application.hrComments = hrComments;
    }

    // Update user status based on position
    const newUserStatus =
      application.position === "student_assistant" ? "SA" : "SM";
    const previousUserStatus = applicant.status;
    applicant.status = newUserStatus;
    await applicant.save();

    console.log("✅ User status updated on application acceptance:");
    console.log("- User ID:", applicant._id);
    console.log("- Position:", application.position);
    console.log("- Previous status:", previousUserStatus);
    console.log("- New status:", newUserStatus);
    console.log(
      "ℹ️  Effectivity date will be set when scholar is deployed to office"
    );

    // Add timeline entry
    application.timeline = application.timeline || [];
    application.timeline.push({
      action: "application_accepted",
      performedBy: userID,
      performedByName: `${user.firstname} ${user.lastname}`,
      timestamp: new Date(),
      previousStatus,
      newStatus: "accepted",
      notes: `Application accepted. Performance rating: ${
        traineePerformanceRating || "N/A"
      }. User status set to ${newUserStatus}.`,
    } as any);

    await application.save();
    await application.populate([
      { path: "userID", select: "firstname lastname email" },
    ]);

    // Send notification
    try {
      if (applicant._id) {
        await createNotification({
          userID: String(applicant._id),
          title: "Application Accepted! 🎉",
          message: `Congratulations! Your application has been accepted. You are now officially a ${
            application.position === "student_assistant"
              ? "Student Assistant"
              : "Student Marshal"
          }. Welcome to the team!`,
          type: "success",
          relatedApplicationID: applicationId,
        });

        // Send email
        const emailTemplate = getApplicationStatusEmailTemplate(
          `${applicant.firstname} ${applicant.lastname}`,
          application.position === "student_assistant"
            ? "Student Assistant"
            : "Student Marshal",
          "accepted",
          "Your application has been accepted! Welcome to the team."
        );

        await sendMail({
          to: applicant.email,
          subject: emailTemplate.subject,
          text: emailTemplate.text,
          html: emailTemplate.html,
        });
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
    }

    return res.status(OK).json({
      message: "Application accepted successfully",
      application,
    });
  }
);

// Reject Application (Can be done at any stage)
export const rejectApplicationHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const applicationId = req.params.id;
    const { rejectionReason } = req.body;

    const user = await UserModel.findById(userID);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(
      user.role === "hr" || user.role === "office",
      FORBIDDEN,
      "Access denied"
    );

    const application = await ApplicationModel.findById(applicationId);
    appAssert(application, NOT_FOUND, "Application not found");

    appAssert(rejectionReason, BAD_REQUEST, "Rejection reason is required");

    // Update application
    const previousStatus = application.status;
    application.status = "rejected";
    application.hrComments = rejectionReason;

    // Add timeline entry
    application.timeline = application.timeline || [];
    application.timeline.push({
      action: "application_rejected",
      performedBy: userID,
      performedByName: `${user.firstname} ${user.lastname}`,
      timestamp: new Date(),
      previousStatus,
      newStatus: "rejected",
      notes: rejectionReason,
    } as any);

    await application.save();
    await application.populate([
      { path: "userID", select: "firstname lastname email" },
    ]);

    // Send notification
    try {
      const applicant = await UserModel.findById(application.userID);
      if (applicant && applicant._id) {
        await createNotification({
          userID: String(applicant._id),
          title: "Application Status Update",
          message: `We regret to inform you that your application has not been successful at this time. ${rejectionReason}`,
          type: "info",
          relatedApplicationID: applicationId,
        });
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
    }

    return res.status(OK).json({
      message: "Application rejected",
      application,
    });
  }
);
