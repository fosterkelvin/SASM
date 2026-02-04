import { Request, Response } from "express";
import { OK, CREATED, BAD_REQUEST, FORBIDDEN } from "../constants/http";
import ReApplicationModel from "../models/reapplication.model";
import ArchivedApplicationModel from "../models/archivedApplication.model";
import ApplicationModel from "../models/application.model";
import UserModel from "../models/user.model";
import ScholarModel from "../models/scholar.model";
import EvaluationModel from "../models/evaluation.model";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";
import cloudinary from "../config/cloudinary";

// Submit a re-application
export const submitReApplicationHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID;

    // Get data from request body
    const {
      effectivityDate,
      yearsInService,
      term,
      academicYear,
      reapplicationReasons,
      submissionDate,
      college,
      courseYear,
      position,
    } = req.body;

    // Validate required fields
    appAssert(effectivityDate, BAD_REQUEST, "Effectivity date is required");
    appAssert(yearsInService, BAD_REQUEST, "Years in service is required");
    appAssert(term, BAD_REQUEST, "Term is required");
    appAssert(academicYear, BAD_REQUEST, "Academic year is required");
    appAssert(
      reapplicationReasons,
      BAD_REQUEST,
      "Reason for re-application is required"
    );

    // Get the grades file from multer
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const recentGradesFile = files?.recentGrades?.[0];

    appAssert(recentGradesFile, BAD_REQUEST, "Recent grades file is required");

    // Get user info from User model
    const user = await UserModel.findById(userID);
    appAssert(user, BAD_REQUEST, "User not found");

    // Check if user is blocked
    appAssert(
      !user.blocked,
      FORBIDDEN,
      "Your account has been blocked. You cannot submit re-applications. Please contact HR for assistance."
    );

    // Try to find the most recent application (active or archived) - optional for reference
    let previousApplication = await ApplicationModel.findOne({
      userID,
    }).sort({ createdAt: -1 });

    let previousApplicationId = previousApplication?._id;

    // If no active application, check archived
    if (!previousApplication) {
      const archivedApp = await ArchivedApplicationModel.findOne({
        userID,
      }).sort({ archivedAt: -1 });

      if (archivedApp?.originalApplication) {
        previousApplication = archivedApp.originalApplication;
        previousApplicationId = archivedApp._id;
      }
    }

    // Get user info from User model
    const firstName = user.firstname;
    const lastName = user.lastname;
    const email = user.email;

    // Create the re-application
    const reApplication = await ReApplicationModel.create({
      userID,
      previousApplicationId,
      firstName,
      lastName,
      email,
      position:
        position || previousApplication?.position || "student_assistant",
      effectivityDate: new Date(effectivityDate),
      yearsInService,
      term,
      academicYear,
      reapplicationReasons,
      submissionDate: submissionDate ? new Date(submissionDate) : new Date(),
      recentGrades: recentGradesFile.path, // Cloudinary URL
      college,
      courseYear,
      status: "pending",
    });

    return res.status(CREATED).json({
      message: "Re-application submitted successfully",
      reApplication,
    });
  }
);

// Get user's re-applications
export const getUserReApplicationsHandler = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID;

    const reApplications = await ReApplicationModel.find({ userID }).sort({
      createdAt: -1,
    });

    return res.status(OK).json({
      reApplications,
    });
  }
);

// Get all re-applications (HR/Office)
export const getAllReApplicationsHandler = catchErrors(
  async (req: Request, res: Response) => {
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const reApplications = await ReApplicationModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("userID", "firstname lastname email");

    const total = await ReApplicationModel.countDocuments(query);

    // Get the latest evaluation for each re-applicant
    const reApplicationsWithEvaluation = await Promise.all(
      reApplications.map(async (reapp: any) => {
        const reappObj = reapp.toObject();

        // Get the user ID - could be populated object or ObjectId
        const userId = reapp.userID?._id || reapp.userID;
        
        console.log("🔍 Looking up evaluation for user:", userId, "Name:", reapp.firstName, reapp.lastName);

        let foundEvaluation = false;

        // First, try to find evaluation directly by userId (new evaluations store this)
        const latestEvaluationByUser = await EvaluationModel.findOne({
          userId: userId,
        })
          .sort({ createdAt: -1 })
          .limit(1);
        
        if (latestEvaluationByUser) {
          console.log("📝 Found evaluation by userId");
          const ratings = latestEvaluationByUser.items
            .filter((item: any) => item.rating)
            .map((item: any) => item.rating);
          const averageRating =
            ratings.length > 0
              ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
              : null;

          reappObj.lastEvaluation = {
            officeName: latestEvaluationByUser.officeName,
            evaluatorName: latestEvaluationByUser.evaluatorName,
            recommendedForNextSemester: latestEvaluationByUser.recommendedForNextSemester,
            averageRating: averageRating ? Math.round(averageRating * 10) / 10 : null,
            areasOfStrength: latestEvaluationByUser.areasOfStrength,
            areasOfImprovement: latestEvaluationByUser.areasOfImprovement,
            justification: latestEvaluationByUser.justification,
            evaluatedAt: latestEvaluationByUser.createdAt,
          };
          foundEvaluation = true;
        }

        // Fallback: Find evaluation via scholar records (for older evaluations without userId)
        if (!foundEvaluation) {
          const scholars = await ScholarModel.find({ userId: userId }).sort({ createdAt: -1 });
          console.log("📚 Scholars found:", scholars.length);

          for (const scholar of scholars) {
            const latestEvaluation = await EvaluationModel.findOne({
              scholarId: scholar._id,
            })
              .sort({ createdAt: -1 })
              .limit(1);
            
            console.log("📝 Checking scholar", scholar._id, "- Evaluation found:", latestEvaluation ? "Yes" : "No");

            if (latestEvaluation) {
              const ratings = latestEvaluation.items
                .filter((item: any) => item.rating)
                .map((item: any) => item.rating);
              const averageRating =
                ratings.length > 0
                  ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
                  : null;

              reappObj.lastEvaluation = {
                officeName: latestEvaluation.officeName,
                evaluatorName: latestEvaluation.evaluatorName,
                recommendedForNextSemester: latestEvaluation.recommendedForNextSemester,
                averageRating: averageRating ? Math.round(averageRating * 10) / 10 : null,
                areasOfStrength: latestEvaluation.areasOfStrength,
                areasOfImprovement: latestEvaluation.areasOfImprovement,
                justification: latestEvaluation.justification,
                evaluatedAt: latestEvaluation.createdAt,
              };
              break;
            }
          }
        }

        return reappObj;
      })
    );

    return res.status(OK).json({
      reApplications: reApplicationsWithEvaluation,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  }
);

// Update re-application status
export const updateReApplicationStatusHandler = catchErrors(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    appAssert(status, BAD_REQUEST, "Status is required");

    const reApplication = await ReApplicationModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    appAssert(reApplication, BAD_REQUEST, "Re-application not found");

    // If approved, update user status back to SA or SM (based on their scholarship type)
    if (status === "approved") {
      const user = await UserModel.findById(reApplication.userID);

      if (user) {
        // Determine status from position field
        const newStatus =
          reApplication.position === "student_assistant" ? "SA" : "SM";

        console.log("🎓 Re-application approved - updating user status:");
        console.log("- User ID:", user._id);
        console.log("- Previous status:", user.status);
        console.log("- New status:", newStatus);
        console.log("- Position:", reApplication.position);

        user.status = newStatus;
        await user.save();

        console.log("✅ User status updated successfully!");

        // Create or reactivate Scholar record
        try {
          console.log("🔍 Checking for existing scholar record...");

          // Check if scholar record already exists
          let scholarRecord = await ScholarModel.findOne({ userId: user._id });

          if (scholarRecord) {
            // Reactivate existing scholar
            console.log(
              "📝 Reactivating existing scholar record:",
              scholarRecord._id
            );
            scholarRecord.status = "active";
            scholarRecord.semesterStartDate = new Date();
            await scholarRecord.save();
            console.log("✅ Scholar reactivated!");
          } else {
            // Create new scholar record (for scholars who were never deployed before)
            // These scholars will need to be deployed to an office later
            console.log("📝 Creating new scholar record for re-applicant");
            console.log("- userId:", user._id);
            console.log(
              "- applicationId:",
              reApplication.previousApplicationId
            );
            console.log("- scholarType:", reApplication.position);
            console.log(
              "⚠️  Note: Scholar not yet deployed to office - will appear as 'Not Deployed'"
            );

            // Get the HR user ID who is approving this
            const approverID = req.userID;

            scholarRecord = new ScholarModel({
              userId: user._id,
              applicationId: reApplication.previousApplicationId,
              scholarType: reApplication.position,
              deployedBy: approverID, // HR who approved the re-application
              scholarOffice: "Not Deployed", // Will be updated when deployed to office
              status: "active",
              semesterStartDate: new Date(),
              semesterMonths: 6,
              scholarNotes:
                "Approved via re-application - pending office deployment",
            });

            const savedScholar = await scholarRecord.save();
            console.log("✅ New scholar record created!");
            console.log("- Scholar ID:", savedScholar._id);
            console.log(
              "- Full record:",
              JSON.stringify(savedScholar.toObject(), null, 2)
            );
          }
        } catch (scholarError) {
          console.error("❌ Error managing scholar record:");
          console.error("- Error:", scholarError);
          if (scholarError instanceof Error) {
            console.error("- Stack:", scholarError.stack);
          }
          // Don't throw - user status was already updated
        }
      }
    }

    return res.status(OK).json({
      message: "Re-application status updated",
      reApplication,
    });
  }
);

// Delete re-application
export const deleteReApplicationHandler = catchErrors(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userID = req.userID;

    const reApplication = await ReApplicationModel.findOne({
      _id: id,
      userID,
    });

    appAssert(reApplication, BAD_REQUEST, "Re-application not found");

    // Delete the grades file from Cloudinary if it exists
    if (reApplication.recentGrades) {
      try {
        const publicId = reApplication.recentGrades
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
      } catch (error) {
        console.error("Error deleting file from Cloudinary:", error);
      }
    }

    await reApplication.deleteOne();

    return res.status(OK).json({
      message: "Re-application deleted successfully",
    });
  }
);
