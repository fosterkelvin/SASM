import { Router } from "express";
import {
  getUserNotificationsHandler,
  markNotificationAsReadHandler,
  markAllNotificationsAsReadHandler,
  deleteNotificationHandler,
  deleteMultipleNotificationsHandler,
  getUnreadNotificationCountHandler,
} from "../controllers/notification.controller";

const notificationRoutes = Router();

// Prefix: /notifications

// GET /notifications - Get user's notifications
notificationRoutes.get("/", getUserNotificationsHandler);

// GET /notifications/unread-count - Get unread notification count
notificationRoutes.get("/unread-count", getUnreadNotificationCountHandler);

// PUT /notifications/mark-all-read - Mark all notifications as read
notificationRoutes.put("/mark-all-read", markAllNotificationsAsReadHandler);

// PUT /notifications/bulk-read - Mark multiple notifications as read
notificationRoutes.put(
  "/bulk-read",
  require("../controllers/notification.controller")
    .markMultipleNotificationsAsReadHandler
);

// PUT /notifications/:id/read - Mark specific notification as read
notificationRoutes.put("/:id/read", markNotificationAsReadHandler);

// DELETE /notifications/bulk - Delete multiple notifications
notificationRoutes.delete("/bulk", deleteMultipleNotificationsHandler);

// DELETE /notifications/:id - Delete specific notification
notificationRoutes.delete("/:id", deleteNotificationHandler);

export default notificationRoutes;
