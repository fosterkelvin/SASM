// Script to manually add service duration for scholars whose semester was ended
// Run this once if scholars were reset before the service duration feature was added

const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const UserDataModel = require("./src/models/userdata.model").default;
const ScholarModel = require("./src/models/scholar.model").default;
const UserModel = require("./src/models/user.model").default;

const MONGODB_URI = process.env.MONGODB_URI;

async function addMissingSemesterService() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find all scholars with status "inactive" or "completed" (semester ended)
    const completedScholars = await ScholarModel.find({
      status: { $in: ["inactive", "completed"] },
    });

    console.log(`\n📊 Found ${completedScholars.length} completed scholars`);

    if (completedScholars.length === 0) {
      console.log("ℹ️  No completed scholars found. Nothing to migrate.");
      process.exit(0);
    }

    let successCount = 0;
    let errorCount = 0;

    for (const scholar of completedScholars) {
      try {
        // Find or create user data
        let userData = await UserDataModel.findOne({ userId: scholar.userId });

        if (!userData) {
          userData = new UserDataModel({
            userId: scholar.userId,
            serviceMonths: 0,
            servicePeriods: [],
          });
        }

        // Check if this service period was already added
        const alreadyAdded = userData.servicePeriods?.some(
          (period) =>
            period.startDate?.getTime() ===
              scholar.semesterStartDate?.getTime() &&
            period.scholarType === scholar.scholarType
        );

        if (alreadyAdded) {
          console.log(
            `⏭️  Skipping scholar ${scholar._id} - service period already exists`
          );
          continue;
        }

        // Add 6 months to service
        const monthsToAdd = scholar.semesterMonths || 6;
        userData.serviceMonths = (userData.serviceMonths || 0) + monthsToAdd;

        // Add service period record
        const servicePeriod = {
          startDate:
            scholar.semesterStartDate || scholar.deployedAt || new Date(),
          endDate: scholar.semesterEndDate || new Date(),
          months: monthsToAdd,
          scholarType: scholar.scholarType,
        };

        userData.servicePeriods = userData.servicePeriods || [];
        userData.servicePeriods.push(servicePeriod);

        await userData.save();

        // Get user details for logging
        const user = await UserModel.findById(scholar.userId);
        const userName = user
          ? `${user.firstname} ${user.lastname}`
          : "Unknown";

        console.log(
          `✅ Added ${monthsToAdd} months for ${userName} (${scholar.userId}). Total: ${userData.serviceMonths} months`
        );
        successCount++;
      } catch (error) {
        console.error(
          `❌ Failed to add service duration for scholar ${scholar._id}:`,
          error.message
        );
        errorCount++;
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📝 Total: ${completedScholars.length}`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run the migration
addMissingSemesterService();
