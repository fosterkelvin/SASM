import { Schema, model, Document, Types } from "mongoose";

export interface IDutyHour {
  day: string; // e.g., "Monday", "Tuesday"
  startTime: string; // e.g., "09:00"
  endTime: string; // e.g., "12:00"
  location?: string;
  notes?: string;
}

export interface ISchedule extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId; // Reference to User (student)
  // Store either applicationId (for trainees) OR scholarId (for scholars)
  applicationId?: Types.ObjectId; // Reference to Application (for trainees)
  scholarId?: Types.ObjectId; // Reference to Scholar (for scholars)
  userType: "trainee" | "scholar"; // Indicates if this is for trainee or scholar

  // Class Schedule
  classSchedule?: string; // URL to uploaded schedule image/PDF
  classScheduleData?: any; // Structured schedule data if needed

  // Duty Hours (added by office)
  dutyHours: IDutyHour[];

  // Metadata
  uploadedAt?: Date;
  lastModifiedBy?: Types.ObjectId; // Office user who last modified
  lastModifiedAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const dutyHourSchema = new Schema<IDutyHour>(
  {
    day: {
      type: String,
      required: true,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const scheduleSchema = new Schema<ISchedule>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
    },
    scholarId: {
      type: Schema.Types.ObjectId,
      ref: "Scholar",
    },
    userType: {
      type: String,
      enum: ["trainee", "scholar"],
      required: true,
    },
    classSchedule: {
      type: String,
      trim: true,
    },
    classScheduleData: {
      type: Schema.Types.Mixed,
    },
    dutyHours: {
      type: [dutyHourSchema],
      default: [],
    },
    uploadedAt: {
      type: Date,
    },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    lastModifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
scheduleSchema.index({ userId: 1 });
scheduleSchema.index({ applicationId: 1 });
scheduleSchema.index({ scholarId: 1 });
scheduleSchema.index({ userType: 1 });

// Ensure either applicationId or scholarId is set, but not both
scheduleSchema.pre("save", function (next) {
  if (this.userType === "trainee" && !this.applicationId) {
    return next(new Error("applicationId is required for trainee schedules"));
  }
  if (this.userType === "scholar" && !this.scholarId) {
    return next(new Error("scholarId is required for scholar schedules"));
  }
  if (this.applicationId && this.scholarId) {
    return next(new Error("Cannot have both applicationId and scholarId"));
  }
  next();
});

const ScheduleModel = model<ISchedule>("Schedule", scheduleSchema);

export default ScheduleModel;
