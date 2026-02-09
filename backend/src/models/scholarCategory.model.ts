import { Schema, model, Document, Types } from "mongoose";

// Scholar Category Types
export type ScholarCategoryType = 
  | "active"      // Current scholars
  | "graduated"   // Graduated - moves to Archive
  | "withdrawn"   // Withdrawn applicants - auto-clean after 3 months
  | "blacklisted" // Cannot reapply - self-cleaning based on restriction period

export interface IScholarCategory extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  applicationId?: Types.ObjectId;
  scholarId?: Types.ObjectId;
  
  // Category Information
  category: ScholarCategoryType;
  
  // Personal Info (denormalized for reports)
  firstName: string;
  lastName: string;
  email: string;
  gender?: "Male" | "Female" | "Other";
  
  // Scholar Details
  scholarType?: "student_assistant" | "student_marshal";
  scholarOffice?: string;
  
  // Service Details
  totalServiceMonths?: number;
  completedHours?: number;
  
  // Dates
  startDate?: Date;
  endDate?: Date;
  categoryChangedAt: Date;
  
  // Archive specific
  graduationDate?: Date;
  academicYear?: string;
  
  // Withdrawn specific
  withdrawalReason?: string;
  withdrawalDate?: Date;
  expiresAt?: Date; // Auto-clean date (3 months for withdrawn)
  
  // Blacklist specific
  blacklistReason?: string;
  blacklistDate?: Date;
  restrictionPeriod?: number; // Months (0 = permanent)
  blacklistExpiresAt?: Date; // When blacklist expires (null = permanent)
  
  // Metadata
  addedBy: Types.ObjectId;
  notes?: string;
  
  // Prevent deletion flag
  isProtected: boolean; // True for archived records
  
  createdAt: Date;
  updatedAt: Date;
}

const scholarCategorySchema = new Schema<IScholarCategory>(
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
    
    // Category
    category: {
      type: String,
      enum: ["active", "graduated", "withdrawn", "blacklisted"],
      required: true,
    },
    
    // Personal Info
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    
    // Scholar Details
    scholarType: {
      type: String,
      enum: ["student_assistant", "student_marshal"],
    },
    scholarOffice: {
      type: String,
      trim: true,
    },
    
    // Service Details
    totalServiceMonths: {
      type: Number,
      default: 0,
    },
    completedHours: {
      type: Number,
      default: 0,
    },
    
    // Dates
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    categoryChangedAt: {
      type: Date,
      default: Date.now,
    },
    
    // Archive specific
    graduationDate: {
      type: Date,
    },
    academicYear: {
      type: String,
      trim: true,
    },
    
    // Withdrawn specific
    withdrawalReason: {
      type: String,
      trim: true,
    },
    withdrawalDate: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    
    // Blacklist specific
    blacklistReason: {
      type: String,
      trim: true,
    },
    blacklistDate: {
      type: Date,
    },
    restrictionPeriod: {
      type: Number,
      default: 0, // 0 = permanent
    },
    blacklistExpiresAt: {
      type: Date,
    },
    
    // Metadata
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    
    // Protection flag
    isProtected: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
scholarCategorySchema.index({ userId: 1 });
scholarCategorySchema.index({ category: 1 });
scholarCategorySchema.index({ email: 1 });
scholarCategorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-cleanup
scholarCategorySchema.index({ blacklistExpiresAt: 1 });
scholarCategorySchema.index({ scholarOffice: 1 });
scholarCategorySchema.index({ graduationDate: -1 });

// Pre-save middleware to set protection and expiry
scholarCategorySchema.pre("save", function(next) {
  // Archived (graduated) records cannot be deleted
  if (this.category === "graduated") {
    this.isProtected = true;
  }
  
  // Set expiry for withdrawn applicants (3 months)
  if (this.category === "withdrawn" && !this.expiresAt) {
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 3);
    this.expiresAt = expiryDate;
    this.withdrawalDate = this.withdrawalDate || new Date();
  }
  
  // Set expiry for blacklisted (if not permanent)
  if (this.category === "blacklisted" && this.restrictionPeriod && this.restrictionPeriod > 0) {
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + this.restrictionPeriod);
    this.blacklistExpiresAt = expiryDate;
    this.blacklistDate = this.blacklistDate || new Date();
  }
  
  next();
});

// Pre-remove middleware to prevent deletion of protected records
scholarCategorySchema.pre("deleteOne", { document: true, query: false }, function(next) {
  if (this.isProtected) {
    const error = new Error("Cannot delete protected archived records");
    return next(error);
  }
  next();
});

// Static method to clean up expired blacklist entries
scholarCategorySchema.statics.cleanupExpiredBlacklist = async function() {
  const now = new Date();
  const result = await this.deleteMany({
    category: "blacklisted",
    blacklistExpiresAt: { $lte: now },
    restrictionPeriod: { $gt: 0 }, // Only non-permanent
  });
  return result.deletedCount;
};

const ScholarCategoryModel = model<IScholarCategory>("ScholarCategory", scholarCategorySchema);

export default ScholarCategoryModel;
