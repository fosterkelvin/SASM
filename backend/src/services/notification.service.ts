export const markMultipleNotificationsAsRead = async (
  notificationIDs: string[],
  userID: string
) => {
  try {
    const result = await NotificationModel.updateMany(
      { _id: { $in: notificationIDs }, userID, isRead: false },
      { isRead: true }
    );
    return result;
  } catch (error) {
    console.error("Error marking multiple notifications as read:", error);
    throw error;
  }
};
import NotificationModel from "../models/notification.model";
import UserModel from "../models/user.model";
import { Types } from "mongoose";
import { sendMail } from "../utils/sendMail";
import {
  getApplicationStatusEmailTemplate,
  getInterviewScheduledEmailTemplate,
  getInterviewResultEmailTemplate,
  getPsychometricTestScheduledEmailTemplate,
  getNewApplicationNotificationEmailTemplate,
} from "../utils/emailTemplate";

interface CreateNotificationParams {
  userID: string | Types.ObjectId;
  title: string;
  message: string;
  type: "success" | "warning" | "error" | "info";
  relatedApplicationID?: string | Types.ObjectId;
}

export const createNotification = async (params: CreateNotificationParams) => {
  try {
    const notification = await NotificationModel.create(params);
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

export const getUserNotifications = async (
  userID: string,
  options: {
    isRead?: boolean;
    limit?: number;
    skip?: number;
  } = {}
) => {
  try {
    const { isRead, limit = 50, skip = 0 } = options;

    const filter: any = { userID };
    if (isRead !== undefined) {
      filter.isRead = isRead;
    }

    const notifications = await NotificationModel.find(filter)
      .populate("relatedApplicationID", "position status")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    return notifications;
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (
  notificationID: string,
  userID: string
) => {
  try {
    const notification = await NotificationModel.findOneAndUpdate(
      { _id: notificationID, userID },
      { isRead: true },
      { new: true }
    );
    return notification;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userID: string) => {
  try {
    const result = await NotificationModel.updateMany(
      { userID, isRead: false },
      { isRead: true }
    );
    return result;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

export const deleteNotification = async (
  notificationID: string,
  userID: string
) => {
  try {
    const notification = await NotificationModel.findOneAndDelete({
      _id: notificationID,
      userID,
    });
    return notification;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

export const deleteMultipleNotifications = async (
  notificationIDs: string[],
  userID: string
) => {
  try {
    const result = await NotificationModel.deleteMany({
      _id: { $in: notificationIDs },
      userID,
    });
    return result;
  } catch (error) {
    console.error("Error deleting multiple notifications:", error);
    throw error;
  }
};

export const getUnreadNotificationCount = async (userID: string) => {
  try {
    const count = await NotificationModel.countDocuments({
      userID,
      isRead: false,
    });
    return count;
  } catch (error) {
    console.error("Error getting unread notification count:", error);
    throw error;
  }
};

// Application status change notification helper
export const createApplicationStatusNotification = async (
  userID: string | Types.ObjectId,
  applicationID: string | Types.ObjectId,
  status: string,
  position: string,
  hrComments?: string,
  interviewDetails?: {
    interviewDate?: string;
    interviewTime?: string;
    interviewLocation?: string;
    interviewWhatToBring?: string;
    interviewNotes?: string;
  },
  psychometricTestDetails?: {
    psychometricTestDate?: string;
    psychometricTestTime?: string;
    psychometricTestLocation?: string;
    psychometricTestWhatToBring?: string;
  }
) => {
  let title = "";
  let message = "";
  let type: "success" | "warning" | "error" | "info" = "info";

  const positionTitle =
    position === "student_assistant" ? "Student Assistant" : "Student Marshal";

  switch (status) {
    case "under_review":
      title = "Application Under Review";
      message = `Your application for ${positionTitle} position is now under review. We will notify you of any updates.`;
      type = "info";
      break;
    case "psychometric_scheduled":
      title = "Psychometric Test Scheduled";
      if (
        psychometricTestDetails &&
        psychometricTestDetails.psychometricTestDate &&
        psychometricTestDetails.psychometricTestTime &&
        psychometricTestDetails.psychometricTestLocation
      ) {
        const formattedDate = new Date(
          psychometricTestDetails.psychometricTestDate
        ).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const formattedTime = new Date(
          `2000-01-01T${psychometricTestDetails.psychometricTestTime}`
        ).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        message = `Great news! A psychometric test has been scheduled for your ${positionTitle} application.\n\n📅 Date: ${formattedDate}\n🕐 Time: ${formattedTime}\n📍 Location: ${psychometricTestDetails.psychometricTestLocation}\n\nPlease check your email for complete details and what to bring.`;
      } else {
        message = `Great news! A psychometric test has been scheduled for your ${positionTitle} application. Please check your email for details.`;
      }
      type = "info";
      break;
    case "psychometric_completed":
      title = "Psychometric Test Completed";
      message = `Thank you for completing the psychometric test for the ${positionTitle} position. We are reviewing your results and will notify you of the next steps soon.`;
      type = "info";
      break;
    case "psychometric_passed":
      title = "Psychometric Test Passed! 🎉";
      message = `Congratulations! You have successfully passed the psychometric test for the ${positionTitle} position. Your application will proceed to the next stage.`;
      type = "success";
      break;
    case "psychometric_failed":
      title = "Psychometric Test Results";
      message = `Thank you for taking the psychometric test for the ${positionTitle} position. Unfortunately, we will not be moving forward at this time.`;
      type = "error";
      break;
    case "interview_scheduled":
      title = "Interview Scheduled";
      if (
        interviewDetails &&
        interviewDetails.interviewDate &&
        interviewDetails.interviewTime &&
        interviewDetails.interviewLocation
      ) {
        const formattedDate = new Date(
          interviewDetails.interviewDate
        ).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const formattedTime = new Date(
          `2000-01-01T${interviewDetails.interviewTime}`
        ).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        message = `Great news! An interview has been scheduled for your ${positionTitle} application.\n\n📅 Date: ${formattedDate}\n🕐 Time: ${formattedTime}\n📍 Location: ${interviewDetails.interviewLocation}\n\nPlease check your email for complete details and instructions.`;
      } else {
        message = `Great news! An interview has been scheduled for your ${positionTitle} application. Please check your email for details.`;
      }
      type = "info";
      break;
    case "passed_interview":
      title = "Interview Passed! 🎉";
      message = `Congratulations! You have passed the interview for the ${positionTitle} position. You will now need to complete the required hours as specified in your application before final hiring. We will be in touch with next steps soon.`;
      type = "success";
      break;
    case "failed_interview":
      title = "Interview Results";
      message = `Thank you for participating in the interview for the ${positionTitle} position. Unfortunately, we will not be moving forward at this time.`;
      type = "error";
      break;
    case "hours_completed":
      title = "Hours Completed! ✅";
      message = `Excellent work! You have successfully completed the required hours for the ${positionTitle} position. Your performance will be reviewed for final hiring decision.`;
      type = "success";
      break;
    case "accepted":
      title = "Application Accepted! 🎉";
      message = `Congratulations! Your application for the ${positionTitle} position has been accepted. Welcome aboard! Please check your email for onboarding details.`;
      type = "success";
      break;
    case "rejected":
      title = "Application Status Update";
      message = `We regret to inform you that your application for ${positionTitle} position was not selected at this time. Thank you for your interest.`;
      type = "error";
      break;
    case "withdrawn":
      title = "Application Withdrawn";
      message = `Your application for the ${positionTitle} position has been withdrawn as requested.`;
      type = "info";
      break;
    case "on_hold":
      title = "Application On Hold";
      message = `Your application for the ${positionTitle} position has been put on hold temporarily. We will update you when there are further developments.`;
      type = "info";
      break;
    default:
      title = "Application Status Update";
      message = `Your application for ${positionTitle} position status has been updated.`;
      type = "info";
  }

  // Add HR comments to message if provided
  if (hrComments && hrComments.trim()) {
    message += `\n\nAdditional notes: ${hrComments}`;
  }

  // Create the in-app notification
  const notification = await createNotification({
    userID,
    title,
    message,
    type,
    relatedApplicationID: applicationID,
  });

  // Send email notification to the student
  try {
    // Get user information for email
    const user = await UserModel.findById(userID);
    if (user && user.email) {
      const applicantName = `${user.firstname} ${user.lastname}`;

      let emailTemplate;

      // Use special psychometric test email template if status is psychometric_scheduled
      if (
        status === "psychometric_scheduled" &&
        psychometricTestDetails &&
        psychometricTestDetails.psychometricTestDate &&
        psychometricTestDetails.psychometricTestTime &&
        psychometricTestDetails.psychometricTestLocation &&
        psychometricTestDetails.psychometricTestWhatToBring
      ) {
        emailTemplate = getPsychometricTestScheduledEmailTemplate(
          applicantName,
          positionTitle,
          psychometricTestDetails.psychometricTestDate,
          psychometricTestDetails.psychometricTestTime,
          psychometricTestDetails.psychometricTestLocation,
          psychometricTestDetails.psychometricTestWhatToBring
        );
      } else if (
        status === "interview_scheduled" &&
        interviewDetails &&
        interviewDetails.interviewDate &&
        interviewDetails.interviewTime &&
        interviewDetails.interviewLocation &&
        interviewDetails.interviewWhatToBring
      ) {
        emailTemplate = getInterviewScheduledEmailTemplate(
          applicantName,
          positionTitle,
          interviewDetails.interviewDate,
          interviewDetails.interviewTime,
          interviewDetails.interviewLocation,
          interviewDetails.interviewWhatToBring,
          interviewDetails.interviewNotes
        );
      } else if (
        status === "passed_interview" ||
        status === "failed_interview"
      ) {
        // Use specialized interview result email template
        emailTemplate = getInterviewResultEmailTemplate(
          applicantName,
          positionTitle,
          status === "passed_interview",
          hrComments
        );
      } else {
        // Use the general status update email template
        emailTemplate = getApplicationStatusEmailTemplate(
          applicantName,
          positionTitle,
          status,
          hrComments
        );
      }

      await sendMail({
        to: user.email,
        subject: emailTemplate.subject,
        text: emailTemplate.text,
        html: emailTemplate.html,
      });

      console.log(
        `Application status email sent to ${user.email} for status: ${status}`
      );
    }
  } catch (error) {
    console.error("Failed to send application status email:", error);
    // Don't fail the notification creation if email sending fails
  }

  return notification;
};

// Notify all HR users about a new application
export const notifyHRAboutNewApplication = async (
  applicationID: string | Types.ObjectId,
  applicantName: string,
  position: string
) => {
  try {
    // Find all HR users
    const hrUsers = await UserModel.find({ role: "hr" });

    if (hrUsers.length === 0) {
      console.log("No HR users found to notify about new application");
      return [];
    }

    const positionTitle =
      position === "student_assistant"
        ? "Student Assistant"
        : "Student Marshal";

    // Create notifications and send emails for all HR users
    const notifications = await Promise.all(
      hrUsers.map(async (hrUser) => {
        try {
          // Create in-app notification
          const notification = await createNotification({
            userID: (hrUser._id as Types.ObjectId).toString(),
            title: "🆕 New Application Received",
            message: `${applicantName} has submitted a new application for ${positionTitle} position. Review it in the Application Management section.`,
            type: "info",
            relatedApplicationID: applicationID,
          });

          // Send email notification to HR
          try {
            const emailTemplate = getNewApplicationNotificationEmailTemplate(
              applicantName,
              position,
              applicationID.toString()
            );

            await sendMail({
              to: hrUser.email,
              subject: emailTemplate.subject,
              text: emailTemplate.text,
              html: emailTemplate.html,
            });

            console.log(
              `New application notification email sent to HR user: ${hrUser.email}`
            );
          } catch (emailError) {
            console.error(
              `Failed to send email to HR user ${hrUser.email}:`,
              emailError
            );
            // Don't fail if email sending fails
          }

          return notification;
        } catch (error) {
          console.error(
            `Failed to create notification for HR user ${hrUser.email}:`,
            error
          );
          return null;
        }
      })
    );

    console.log(
      `Created ${notifications.filter((n) => n !== null).length} notifications for HR users about new application`
    );
    return notifications.filter((n) => n !== null);
  } catch (error) {
    console.error("Error notifying HR about new application:", error);
    // Don't throw error - this is a non-critical operation
    return [];
  }
};
