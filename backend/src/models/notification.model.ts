import mongoose from "mongoose";

export interface NotificationDocument extends mongoose.Document {
  userID: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: "success" | "warning" | "error" | "info";
  isRead: boolean;
  relatedApplicationID?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new mongoose.Schema<NotificationDocument>(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["success", "warning", "error", "info"],
      default: "info",
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      required: true,
    },
    relatedApplicationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
notificationSchema.index({ userID: 1, createdAt: -1 });
notificationSchema.index({ userID: 1, isRead: 1 });

const NotificationModel = mongoose.model<NotificationDocument>(
  "Notification",
  notificationSchema
);

export default NotificationModel;
