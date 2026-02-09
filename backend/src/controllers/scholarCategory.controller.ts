import { Request, Response } from "express";
import ScholarCategoryModel from "../models/scholarCategory.model";
import ScholarModel from "../models/scholar.model";
import ApplicationModel from "../models/application.model";
import UserModel from "../models/user.model";
import catchErrors from "../utils/catchErrors";
import { OK, BAD_REQUEST, NOT_FOUND, FORBIDDEN } from "../constants/http";
import appAssert from "../utils/appAssert";

// Get all scholars by category
export const getScholarsByCategory = catchErrors(
  async (req: Request, res: Response) => {
    const { category, search, office, scholarType, page = 1, limit = 20 } = req.query;
    
    const filter: any = {};
    
    if (category && category !== "all") {
      filter.category = category;
    }
    
    if (office) {
      filter.scholarOffice = office;
    }
    
    if (scholarType) {
      filter.scholarType = scholarType;
    }
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [records, total] = await Promise.all([
      ScholarCategoryModel.find(filter)
        .populate("addedBy", "firstname lastname")
        .sort({ categoryChangedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ScholarCategoryModel.countDocuments(filter),
    ]);
    
    return res.status(OK).json({
      records,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  }
);

// Get category statistics
export const getCategoryStats = catchErrors(
  async (req: Request, res: Response) => {
    // Get active scholars count from Scholar model
    const activeScholars = await ScholarModel.countDocuments({ status: "active" });
    
    // Get trainees count from Application model
    const trainees = await ApplicationModel.countDocuments({
      status: { $in: ["trainee", "training_completed", "pending_office_interview", "office_interview_scheduled"] }
    });
    
    // Get category counts from ScholarCategory model
    const [archived, withdrawn, blacklisted] = await Promise.all([
      ScholarCategoryModel.countDocuments({ category: "graduated" }),
      ScholarCategoryModel.countDocuments({ category: "withdrawn" }),
      ScholarCategoryModel.countDocuments({ category: "blacklisted" }),
    ]);
    
    // Get expiring soon counts
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const withdrawnExpiringSoon = await ScholarCategoryModel.countDocuments({
      category: "withdrawn",
      expiresAt: { $lte: threeDaysFromNow },
    });
    
    const blacklistExpiringSoon = await ScholarCategoryModel.countDocuments({
      category: "blacklisted",
      blacklistExpiresAt: { $lte: threeDaysFromNow, $ne: null },
    });
    
    return res.status(OK).json({
      stats: {
        scholars: activeScholars,
        trainees,
        archived,
        withdrawn,
        blacklisted,
        withdrawnExpiringSoon,
        blacklistExpiringSoon,
      },
    });
  }
);

// Get active scholars (current)
export const getActiveScholars = catchErrors(
  async (req: Request, res: Response) => {
    const { search, office, scholarType, page = 1, limit = 20 } = req.query;
    
    const filter: any = { status: "active" };
    
    if (office) {
      filter.scholarOffice = office;
    }
    
    if (scholarType) {
      filter.scholarType = scholarType;
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    let scholars = await ScholarModel.find(filter)
      .populate("userId", "firstname lastname email status")
      .sort({ deployedAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    // Apply search filter on populated data
    if (search) {
      const searchLower = String(search).toLowerCase();
      scholars = scholars.filter((s: any) => {
        const user = s.userId;
        if (!user) return false;
        return (
          user.firstname?.toLowerCase().includes(searchLower) ||
          user.lastname?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower)
        );
      });
    }
    
    const total = await ScholarModel.countDocuments(filter);
    
    return res.status(OK).json({
      scholars,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  }
);

// Get trainees (applicants in training)
export const getTraineesList = catchErrors(
  async (req: Request, res: Response) => {
    const { search, office, position, page = 1, limit = 20 } = req.query;
    
    const filter: any = {
      status: { $in: ["trainee", "training_completed", "pending_office_interview", "office_interview_scheduled"] }
    };
    
    if (office) {
      filter.traineeOffice = office;
    }
    
    if (position) {
      filter.position = position;
    }
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [trainees, total] = await Promise.all([
      ApplicationModel.find(filter)
        .populate("userID", "firstname lastname email")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ApplicationModel.countDocuments(filter),
    ]);
    
    return res.status(OK).json({
      trainees,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  }
);

// Graduate a scholar (move to archive)
export const graduateScholar = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const { scholarId } = req.params;
    const { graduationDate, academicYear, notes, totalServiceMonths, completedHours } = req.body;
    
    // Find the scholar
    const scholar = await ScholarModel.findById(scholarId).populate("userId", "firstname lastname email gender");
    appAssert(scholar, NOT_FOUND, "Scholar not found");
    
    const user = scholar.userId as any;
    appAssert(user, NOT_FOUND, "User not found for this scholar");
    
    // Create archive record
    const archiveRecord = new ScholarCategoryModel({
      userId: user._id,
      applicationId: scholar.applicationId,
      scholarId: scholar._id,
      category: "graduated",
      firstName: user.firstname,
      lastName: user.lastname,
      email: user.email,
      gender: user.gender,
      scholarType: scholar.scholarType,
      scholarOffice: scholar.scholarOffice,
      totalServiceMonths: totalServiceMonths || scholar.semesterMonths || 0,
      completedHours: completedHours || 0,
      startDate: scholar.semesterStartDate || scholar.deployedAt,
      endDate: graduationDate ? new Date(graduationDate) : new Date(),
      categoryChangedAt: new Date(),
      graduationDate: graduationDate ? new Date(graduationDate) : new Date(),
      academicYear: academicYear || new Date().getFullYear().toString(),
      addedBy: userID,
      notes,
      isProtected: true, // Cannot be deleted
    });
    
    await archiveRecord.save();
    
    // Update scholar status to completed
    scholar.status = "completed";
    scholar.semesterEndDate = graduationDate ? new Date(graduationDate) : new Date();
    await scholar.save();
    
    return res.status(OK).json({
      message: "Scholar graduated and archived successfully",
      record: archiveRecord,
    });
  }
);

// Withdraw an applicant
export const withdrawApplicant = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const { applicationId } = req.params;
    const { reason, notes } = req.body;
    
    // Find the application
    const application = await ApplicationModel.findById(applicationId)
      .populate("userID", "firstname lastname email gender");
    appAssert(application, NOT_FOUND, "Application not found");
    
    const user = application.userID as any;
    
    // Check if already in withdrawn category
    const existing = await ScholarCategoryModel.findOne({
      applicationId: application._id,
      category: "withdrawn",
    });
    
    if (existing) {
      return res.status(BAD_REQUEST).json({
        message: "Application is already in withdrawn status",
      });
    }
    
    // Create withdrawn record (expires after 3 months)
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 3);
    
    const withdrawnRecord = new ScholarCategoryModel({
      userId: user._id,
      applicationId: application._id,
      category: "withdrawn",
      firstName: application.firstName || user.firstname,
      lastName: application.lastName || user.lastname,
      email: application.email || user.email,
      gender: application.gender,
      scholarType: application.position,
      scholarOffice: application.traineeOffice || application.scholarOffice,
      categoryChangedAt: new Date(),
      withdrawalReason: reason,
      withdrawalDate: new Date(),
      expiresAt: expiryDate, // Auto-clean after 3 months
      addedBy: userID,
      notes,
      isProtected: false,
    });
    
    await withdrawnRecord.save();
    
    // Update application status
    application.status = "withdrawn";
    await application.save();
    
    return res.status(OK).json({
      message: "Applicant withdrawn successfully. Record will be auto-removed after 3 months.",
      record: withdrawnRecord,
      expiresAt: expiryDate,
    });
  }
);

// Blacklist an applicant/scholar
export const blacklistPerson = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const { userId } = req.params;
    const { reason, restrictionPeriod = 0, notes, applicationId, scholarId } = req.body;
    
    // Find the user
    const user = await UserModel.findById(userId);
    appAssert(user, NOT_FOUND, "User not found");
    
    // Check if already blacklisted
    const existing = await ScholarCategoryModel.findOne({
      userId: userId,
      category: "blacklisted",
    });
    
    if (existing) {
      return res.status(BAD_REQUEST).json({
        message: "User is already blacklisted",
        existingRecord: existing,
      });
    }
    
    // Get application/scholar details if provided
    let scholarType, scholarOffice;
    if (applicationId) {
      const app = await ApplicationModel.findById(applicationId);
      if (app) {
        scholarType = app.position;
        scholarOffice = app.traineeOffice || app.scholarOffice;
      }
    }
    if (scholarId) {
      const scholar = await ScholarModel.findById(scholarId);
      if (scholar) {
        scholarType = scholar.scholarType;
        scholarOffice = scholar.scholarOffice;
      }
    }
    
    // Calculate expiry date if not permanent
    let blacklistExpiresAt = null;
    if (restrictionPeriod > 0) {
      blacklistExpiresAt = new Date();
      blacklistExpiresAt.setMonth(blacklistExpiresAt.getMonth() + restrictionPeriod);
    }
    
    const blacklistRecord = new ScholarCategoryModel({
      userId: user._id,
      applicationId,
      scholarId,
      category: "blacklisted",
      firstName: user.firstname,
      lastName: user.lastname,
      email: user.email,
      scholarType,
      scholarOffice,
      categoryChangedAt: new Date(),
      blacklistReason: reason,
      blacklistDate: new Date(),
      restrictionPeriod, // 0 = permanent
      blacklistExpiresAt,
      addedBy: userID,
      notes,
      isProtected: false,
    });
    
    await blacklistRecord.save();
    
    // If there's an active application, reject it
    if (applicationId) {
      await ApplicationModel.findByIdAndUpdate(applicationId, { status: "rejected" });
    }
    
    // If there's an active scholar record, deactivate it
    if (scholarId) {
      await ScholarModel.findByIdAndUpdate(scholarId, { status: "inactive" });
    }
    
    return res.status(OK).json({
      message: restrictionPeriod > 0 
        ? `User blacklisted for ${restrictionPeriod} months`
        : "User permanently blacklisted",
      record: blacklistRecord,
    });
  }
);

// Remove from blacklist (early removal)
export const removeFromBlacklist = catchErrors(
  async (req: Request, res: Response) => {
    const { recordId } = req.params;
    const { reason } = req.body;
    
    const record = await ScholarCategoryModel.findById(recordId);
    appAssert(record, NOT_FOUND, "Blacklist record not found");
    appAssert(record.category === "blacklisted", BAD_REQUEST, "Record is not a blacklist entry");
    
    // Delete the record
    await ScholarCategoryModel.findByIdAndDelete(recordId);
    
    return res.status(OK).json({
      message: "User removed from blacklist",
      removedRecord: record,
      removalReason: reason,
    });
  }
);

// Check if user is blacklisted (for application validation)
export const checkBlacklist = catchErrors(
  async (req: Request, res: Response) => {
    const { email, userId } = req.query;
    
    const filter: any = { category: "blacklisted" };
    
    if (email) {
      filter.email = String(email).toLowerCase();
    } else if (userId) {
      filter.userId = userId;
    } else {
      return res.status(BAD_REQUEST).json({
        message: "Email or userId is required",
      });
    }
    
    const blacklistRecord = await ScholarCategoryModel.findOne(filter);
    
    if (blacklistRecord) {
      // Check if expired
      if (blacklistRecord.blacklistExpiresAt && blacklistRecord.blacklistExpiresAt < new Date()) {
        // Auto-clean expired record
        await ScholarCategoryModel.findByIdAndDelete(blacklistRecord._id);
        return res.status(OK).json({
          isBlacklisted: false,
        });
      }
      
      return res.status(OK).json({
        isBlacklisted: true,
        reason: blacklistRecord.blacklistReason,
        isPermanent: !blacklistRecord.blacklistExpiresAt || blacklistRecord.restrictionPeriod === 0,
        expiresAt: blacklistRecord.blacklistExpiresAt,
      });
    }
    
    return res.status(OK).json({
      isBlacklisted: false,
    });
  }
);

// Get archived scholars (graduated)
export const getArchivedScholars = catchErrors(
  async (req: Request, res: Response) => {
    const { search, office, scholarType, academicYear, page = 1, limit = 20 } = req.query;
    
    const filter: any = { category: "graduated" };
    
    if (office) {
      filter.scholarOffice = office;
    }
    
    if (scholarType) {
      filter.scholarType = scholarType;
    }
    
    if (academicYear) {
      filter.academicYear = academicYear;
    }
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [records, total] = await Promise.all([
      ScholarCategoryModel.find(filter)
        .populate("addedBy", "firstname lastname")
        .sort({ graduationDate: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ScholarCategoryModel.countDocuments(filter),
    ]);
    
    // Get unique academic years for filter dropdown
    const academicYears = await ScholarCategoryModel.distinct("academicYear", { category: "graduated" });
    
    return res.status(OK).json({
      records,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      academicYears: academicYears.sort().reverse(),
    });
  }
);

// Get withdrawn applicants
export const getWithdrawnApplicants = catchErrors(
  async (req: Request, res: Response) => {
    const { search, page = 1, limit = 20 } = req.query;
    
    const filter: any = { category: "withdrawn" };
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [records, total] = await Promise.all([
      ScholarCategoryModel.find(filter)
        .populate("addedBy", "firstname lastname")
        .sort({ withdrawalDate: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ScholarCategoryModel.countDocuments(filter),
    ]);
    
    return res.status(OK).json({
      records,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  }
);

// Get blacklisted persons
export const getBlacklistedPersons = catchErrors(
  async (req: Request, res: Response) => {
    const { search, includeExpired = false, page = 1, limit = 20 } = req.query;
    
    const filter: any = { category: "blacklisted" };
    
    // By default, don't show expired entries
    if (!includeExpired) {
      filter.$or = [
        { blacklistExpiresAt: null },
        { blacklistExpiresAt: { $gt: new Date() } },
        { restrictionPeriod: 0 },
      ];
    }
    
    if (search) {
      filter.$and = [
        {
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        },
      ];
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [records, total] = await Promise.all([
      ScholarCategoryModel.find(filter)
        .populate("addedBy", "firstname lastname")
        .sort({ blacklistDate: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ScholarCategoryModel.countDocuments(filter),
    ]);
    
    return res.status(OK).json({
      records,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  }
);

// Get report data for PDF generation
export const getCategoryReportData = catchErrors(
  async (req: Request, res: Response) => {
    const { category, office, scholarType, academicYear, startDate, endDate } = req.query;
    
    const filter: any = {};
    
    if (category && category !== "all") {
      filter.category = category;
    }
    
    if (office) {
      filter.scholarOffice = office;
    }
    
    if (scholarType) {
      filter.scholarType = scholarType;
    }
    
    if (academicYear) {
      filter.academicYear = academicYear;
    }
    
    if (startDate || endDate) {
      filter.categoryChangedAt = {};
      if (startDate) {
        filter.categoryChangedAt.$gte = new Date(String(startDate));
      }
      if (endDate) {
        filter.categoryChangedAt.$lte = new Date(String(endDate));
      }
    }
    
    const records = await ScholarCategoryModel.find(filter)
      .populate("addedBy", "firstname lastname")
      .sort({ categoryChangedAt: -1 });
    
    // Calculate summary
    const summary = {
      total: records.length,
      byCategory: {
        graduated: records.filter(r => r.category === "graduated").length,
        withdrawn: records.filter(r => r.category === "withdrawn").length,
        blacklisted: records.filter(r => r.category === "blacklisted").length,
      },
      byGender: {
        male: records.filter(r => r.gender === "Male").length,
        female: records.filter(r => r.gender === "Female").length,
      },
      byType: {
        student_assistant: records.filter(r => r.scholarType === "student_assistant").length,
        student_marshal: records.filter(r => r.scholarType === "student_marshal").length,
      },
    };
    
    return res.status(OK).json({
      records,
      summary,
    });
  }
);

// Manual cleanup trigger (admin only)
export const triggerCleanup = catchErrors(
  async (req: Request, res: Response) => {
    const now = new Date();
    
    // Clean expired withdrawn records (should be auto-cleaned by TTL, but manual trigger available)
    const withdrawnCleaned = await ScholarCategoryModel.deleteMany({
      category: "withdrawn",
      expiresAt: { $lte: now },
    });
    
    // Clean expired blacklist records
    const blacklistCleaned = await ScholarCategoryModel.deleteMany({
      category: "blacklisted",
      blacklistExpiresAt: { $lte: now },
      restrictionPeriod: { $gt: 0 }, // Only non-permanent
    });
    
    return res.status(OK).json({
      message: "Cleanup completed",
      withdrawnRemoved: withdrawnCleaned.deletedCount,
      blacklistRemoved: blacklistCleaned.deletedCount,
    });
  }
);
