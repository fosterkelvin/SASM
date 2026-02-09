import ApplicationModel from "../models/application.model";
import ReApplicationModel from "../models/reapplication.model";
import LeaveModel from "../models/leave.model";
import ArchivedApplicationModel from "../models/archivedApplication.model";
import ArchivedReApplicationModel from "../models/archivedReApplication.model";
import ArchivedLeaveModel from "../models/archivedLeave.model";

// Constants for archival timing
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const TWO_YEARS_MS = 2 * ONE_YEAR_MS;

/**
 * Get the current semester year string
 */
const getSemesterYear = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const semester = month >= 1 && month <= 5 ? "Second" : "First";
  const academicYear =
    month >= 8 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  return `${academicYear} ${semester} Semester`;
};

/**
 * Archive rejected applications older than 1 year
 */
export const archiveOldRejectedApplications = async (): Promise<{
  archived: number;
  errors: number;
}> => {
  const oneYearAgo = new Date(Date.now() - ONE_YEAR_MS);
  const semesterYear = getSemesterYear();

  console.log("🗄️ Archiving rejected applications older than 1 year...");

  // Find rejected applications older than 1 year
  const oldRejectedApps = await ApplicationModel.find({
    status: "rejected",
    updatedAt: { $lt: oneYearAgo },
  });

  console.log(`Found ${oldRejectedApps.length} rejected applications to archive`);

  let archived = 0;
  let errors = 0;

  for (const app of oldRejectedApps) {
    try {
      // Check if already archived
      const existing = await ArchivedApplicationModel.findOne({
        "originalApplication._id": app._id,
      });

      if (existing) {
        console.log(`Application ${app._id} already archived, deleting original`);
        await ApplicationModel.deleteOne({ _id: app._id });
        continue;
      }

      // Create archived record
      await ArchivedApplicationModel.create({
        originalApplication: app.toObject(),
        archivedAt: new Date(),
        archivedReason: "Auto-archived - Rejected over 1 year",
        semesterYear,
        userID: app.userID,
        firstName: app.firstName,
        lastName: app.lastName,
        position: app.position,
        email: app.email,
        originalStatus: app.status,
        scheduledDeletionDate: new Date(Date.now() + TWO_YEARS_MS),
      });

      // Delete original
      await ApplicationModel.deleteOne({ _id: app._id });
      archived++;
      console.log(`✅ Archived application: ${app.firstName} ${app.lastName}`);
    } catch (error) {
      console.error(`❌ Error archiving application ${app._id}:`, error);
      errors++;
    }
  }

  return { archived, errors };
};

/**
 * Archive rejected reapplications older than 1 year
 */
export const archiveOldRejectedReApplications = async (): Promise<{
  archived: number;
  errors: number;
}> => {
  const oneYearAgo = new Date(Date.now() - ONE_YEAR_MS);
  const semesterYear = getSemesterYear();

  console.log("🗄️ Archiving rejected reapplications older than 1 year...");

  const oldRejectedReApps = await ReApplicationModel.find({
    status: "rejected",
    updatedAt: { $lt: oneYearAgo },
  });

  console.log(`Found ${oldRejectedReApps.length} rejected reapplications to archive`);

  let archived = 0;
  let errors = 0;

  for (const reapp of oldRejectedReApps) {
    try {
      // Check if already archived
      const existing = await ArchivedReApplicationModel.findOne({
        "originalReApplication._id": reapp._id,
      });

      if (existing) {
        console.log(`ReApplication ${reapp._id} already archived, deleting original`);
        await ReApplicationModel.deleteOne({ _id: reapp._id });
        continue;
      }

      // Create archived record
      await ArchivedReApplicationModel.create({
        originalReApplication: reapp.toObject(),
        archivedAt: new Date(),
        archivedReason: "Auto-archived - Rejected over 1 year",
        semesterYear,
        userID: reapp.userID,
        firstName: reapp.firstName,
        lastName: reapp.lastName,
        position: reapp.position,
        email: reapp.email,
        originalStatus: reapp.status,
        scheduledDeletionDate: new Date(Date.now() + TWO_YEARS_MS),
      });

      // Delete original
      await ReApplicationModel.deleteOne({ _id: reapp._id });
      archived++;
      console.log(`✅ Archived reapplication: ${reapp.firstName} ${reapp.lastName}`);
    } catch (error) {
      console.error(`❌ Error archiving reapplication ${reapp._id}:`, error);
      errors++;
    }
  }

  return { archived, errors };
};

/**
 * Archive disapproved leave requests older than 1 year
 */
export const archiveOldDisapprovedLeaves = async (): Promise<{
  archived: number;
  errors: number;
}> => {
  const oneYearAgo = new Date(Date.now() - ONE_YEAR_MS);
  const semesterYear = getSemesterYear();

  console.log("🗄️ Archiving disapproved leave requests older than 1 year...");

  const oldDisapprovedLeaves = await LeaveModel.find({
    status: "disapproved",
    updatedAt: { $lt: oneYearAgo },
  });

  console.log(`Found ${oldDisapprovedLeaves.length} disapproved leaves to archive`);

  let archived = 0;
  let errors = 0;

  for (const leave of oldDisapprovedLeaves) {
    try {
      // Check if already archived
      const existing = await ArchivedLeaveModel.findOne({
        "originalLeave._id": leave._id,
      });

      if (existing) {
        console.log(`Leave ${leave._id} already archived, deleting original`);
        await LeaveModel.deleteOne({ _id: leave._id });
        continue;
      }

      // Create archived record
      await ArchivedLeaveModel.create({
        originalLeave: leave.toObject(),
        archivedAt: new Date(),
        archivedReason: "Auto-archived - Disapproved over 1 year",
        semesterYear,
        userId: leave.userId,
        name: leave.name,
        typeOfLeave: leave.typeOfLeave,
        dateFrom: leave.dateFrom,
        dateTo: leave.dateTo,
        originalStatus: leave.status,
        scheduledDeletionDate: new Date(Date.now() + TWO_YEARS_MS),
      });

      // Delete original
      await LeaveModel.deleteOne({ _id: leave._id });
      archived++;
      console.log(`✅ Archived leave: ${leave.name}`);
    } catch (error) {
      console.error(`❌ Error archiving leave ${leave._id}:`, error);
      errors++;
    }
  }

  return { archived, errors };
};

/**
 * Permanently delete archived records older than 2 years
 */
export const deleteExpiredArchivedRecords = async (): Promise<{
  deletedApplications: number;
  deletedReApplications: number;
  deletedLeaves: number;
}> => {
  const now = new Date();

  console.log("🗑️ Deleting archived records older than 2 years...");

  // Delete expired archived applications
  const appResult = await ArchivedApplicationModel.deleteMany({
    scheduledDeletionDate: { $lte: now },
  });

  // Delete expired archived reapplications
  const reappResult = await ArchivedReApplicationModel.deleteMany({
    scheduledDeletionDate: { $lte: now },
  });

  // Delete expired archived leaves
  const leaveResult = await ArchivedLeaveModel.deleteMany({
    scheduledDeletionDate: { $lte: now },
  });

  console.log(`✅ Deleted ${appResult.deletedCount} archived applications`);
  console.log(`✅ Deleted ${reappResult.deletedCount} archived reapplications`);
  console.log(`✅ Deleted ${leaveResult.deletedCount} archived leaves`);

  return {
    deletedApplications: appResult.deletedCount,
    deletedReApplications: reappResult.deletedCount,
    deletedLeaves: leaveResult.deletedCount,
  };
};

/**
 * Run all archival and cleanup tasks
 */
export const runArchivalTasks = async (): Promise<{
  archived: {
    applications: number;
    reapplications: number;
    leaves: number;
  };
  deleted: {
    applications: number;
    reapplications: number;
    leaves: number;
  };
  errors: number;
}> => {
  console.log("=== RUNNING ARCHIVAL TASKS ===");
  console.log(`Date: ${new Date().toISOString()}`);

  // Archive old rejected items (1 year old)
  const appArchive = await archiveOldRejectedApplications();
  const reappArchive = await archiveOldRejectedReApplications();
  const leaveArchive = await archiveOldDisapprovedLeaves();

  // Delete expired archived items (2 years old)
  const deleted = await deleteExpiredArchivedRecords();

  const result = {
    archived: {
      applications: appArchive.archived,
      reapplications: reappArchive.archived,
      leaves: leaveArchive.archived,
    },
    deleted: {
      applications: deleted.deletedApplications,
      reapplications: deleted.deletedReApplications,
      leaves: deleted.deletedLeaves,
    },
    errors: appArchive.errors + reappArchive.errors + leaveArchive.errors,
  };

  console.log("=== ARCHIVAL TASKS COMPLETE ===");
  console.log("Summary:", JSON.stringify(result, null, 2));

  return result;
};

export default {
  archiveOldRejectedApplications,
  archiveOldRejectedReApplications,
  archiveOldDisapprovedLeaves,
  deleteExpiredArchivedRecords,
  runArchivalTasks,
};
