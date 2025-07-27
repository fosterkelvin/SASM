import { Request, Response } from "express";
import catchErrors from "../utils/catchErrors";
import { OK, NOT_FOUND } from "../constants/http";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteMultipleNotifications,
  getUnreadNotificationCount,
} from "../services/notification.service";
import appAssert from "../utils/appAssert";
import { z } from "zod";

// Get user notifications
export const getUserNotificationsHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;

    // Parse query parameters
    const query = z
      .object({
        isRead: z
          .string()
          .optional()
          .transform((val) =>
            val === "true" ? true : val === "false" ? false : undefined
          ),
        limit: z.string().regex(/^\d+$/).transform(Number).optional(),
        skip: z.string().regex(/^\d+$/).transform(Number).optional(),
      })
      .parse(req.query);

    const notifications = await getUserNotifications(userID, query);

    return res.status(OK).json({
      notifications,
      count: notifications.length,
    });
  }
);

// Mark notification as read
export const markNotificationAsReadHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const notificationID = req.params.id;

    const notification = await markNotificationAsRead(notificationID, userID);
    appAssert(notification, NOT_FOUND, "Notification not found");

    return res.status(OK).json({
      message: "Notification marked as read",
      notification,
    });
  }
);

// Mark all notifications as read
export const markAllNotificationsAsReadHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;

    const result = await markAllNotificationsAsRead(userID);

    return res.status(OK).json({
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  }
);

// Delete notification
export const deleteNotificationHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const notificationID = req.params.id;

    const notification = await deleteNotification(notificationID, userID);
    appAssert(notification, NOT_FOUND, "Notification not found");

    return res.status(OK).json({
      message: "Notification deleted successfully",
    });
  }
);

// Delete multiple notifications
export const deleteMultipleNotificationsHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;

    const schema = z.object({
      notificationIDs: z
        .array(z.string().min(1))
        .min(1, "At least one notification ID is required"),
    });

    const { notificationIDs } = schema.parse(req.body);

    const result = await deleteMultipleNotifications(notificationIDs, userID);

    return res.status(OK).json({
      message: `${result.deletedCount} notification(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  }
);

// Get unread notification count
export const getUnreadNotificationCountHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;

    const count = await getUnreadNotificationCount(userID);

    return res.status(OK).json({
      unreadCount: count,
    });
  }
);
