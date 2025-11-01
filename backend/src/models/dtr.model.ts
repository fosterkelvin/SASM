import mongoose, { Schema, Document } from "mongoose";

export interface IDTREntryEdit {
  editedBy: string; // Profile ID or User ID
  editedByName: string; // Profile name or User name
  editedAt: Date;
  changes: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
}

export interface IDTRShift {
  in?: string; // HH:MM format
  out?: string; // HH:MM format
}

export interface IDTREntry {
  day: number; // 1-31
  // Legacy fields (kept for backward compatibility)
  in1?: string; // HH:MM format - First shift
  out1?: string;
  in2?: string; // Second shift
  out2?: string;
  in3?: string; // Third shift (optional)
  out3?: string;
  in4?: string; // Fourth shift (optional)
  out4?: string;
  // NEW: Dynamic shifts array (unlimited shifts)
  shifts?: IDTRShift[]; // Array of shift time pairs
  late?: number; // minutes
  undertime?: number; // minutes
  totalHours?: number; // in minutes
  status?: string; // Present, Absent, Late, On Leave
  confirmationStatus?: "unconfirmed" | "confirmed"; // Confirmation by office staff
  confirmedBy?: string; // User ID or name of office staff who confirmed
  confirmedByProfile?: string; // Profile name if office user
  confirmedAt?: Date; // When it was confirmed
  excusedStatus?: "none" | "excused"; // Excused status for emergencies
  excusedReason?: string; // Reason for excusing the day
  editHistory?: IDTREntryEdit[]; // Track all edits
}

export interface IDTR extends Document {
  userId: mongoose.Types.ObjectId;
  month: number; // 1-12
  year: number;
  department?: string;
  dutyHours?: string;
  entries: IDTREntry[];
  submittedAt?: Date;
  checkedBy?: string;
  checkedAt?: Date;
  status: "draft" | "submitted" | "approved" | "rejected";
  remarks?: string;
  totalMonthlyHours?: number; // calculated total hours for the month
  createdAt: Date;
  updatedAt: Date;
}

const DTREntryEditSchema = new Schema<IDTREntryEdit>(
  {
    editedBy: { type: String, required: true },
    editedByName: { type: String, required: true },
    editedAt: { type: Date, required: true },
    changes: [
      {
        field: { type: String, required: true },
        oldValue: { type: String, required: true },
        newValue: { type: String, required: true },
      },
    ],
  },
  { _id: false }
);

const DTRShiftSchema = new Schema<IDTRShift>(
  {
    in: { type: String },
    out: { type: String },
  },
  { _id: false }
);

const DTREntrySchema = new Schema<IDTREntry>(
  {
    day: { type: Number, required: true, min: 1, max: 31 },
    // Legacy fields (kept for backward compatibility)
    in1: { type: String },
    out1: { type: String },
    in2: { type: String },
    out2: { type: String },
    in3: { type: String },
    out3: { type: String },
    in4: { type: String },
    out4: { type: String },
    // NEW: Dynamic shifts array
    shifts: { type: [DTRShiftSchema], default: [] },
    late: { type: Number, default: 0 },
    undertime: { type: Number, default: 0 },
    totalHours: { type: Number, default: 0 },
    status: { type: String, default: "" },
    confirmationStatus: { type: String, default: "unconfirmed" },
    confirmedBy: { type: String },
    confirmedByProfile: { type: String },
    confirmedAt: { type: Date },
    excusedStatus: { type: String, default: "none" },
    excusedReason: { type: String, default: "" },
    editHistory: { type: [DTREntryEditSchema], default: [] },
  },
  { _id: false }
);

const DTRSchema = new Schema<IDTR>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
      index: true,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    department: { type: String },
    dutyHours: { type: String },
    entries: {
      type: [DTREntrySchema],
      default: [],
    },
    submittedAt: { type: Date },
    checkedBy: { type: String },
    checkedAt: { type: Date },
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "rejected"],
      default: "draft",
    },
    remarks: { type: String },
    totalMonthlyHours: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one DTR per user per month/year
DTRSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

// Pre-save hook to calculate total monthly hours (only count confirmed entries)
DTRSchema.pre("save", function (next) {
  if (this.entries && this.entries.length > 0) {
    this.totalMonthlyHours = this.entries.reduce((sum, entry) => {
      // Only count hours from confirmed entries
      if (entry.confirmationStatus === "confirmed") {
        // Apply 5-hour (300 minutes) daily limit for official total
        const cappedHours = Math.min(entry.totalHours || 0, 300);
        return sum + cappedHours;
      }
      return sum;
    }, 0);
  }
  next();
});

const DTRModel = mongoose.model<IDTR>("DTR", DTRSchema);

export default DTRModel;
