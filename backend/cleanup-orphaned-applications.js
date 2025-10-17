/**
 * Cleanup script to remove orphaned application records
 * (applications where the userID no longer exists)
 *
 * Run with: node cleanup-orphaned-applications.js
 */

const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const ApplicationModel = require("./src/models/application.model").default;
const UserModel = require("./src/models/user.model").default;

async function cleanupOrphanedApplications() {
  try {
    console.log("🔌 Connecting to database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to database\n");

    console.log("🔍 Searching for orphaned applications...\n");

    // Get all applications with trainee-related statuses
    const applications = await ApplicationModel.find({
      status: {
        $in: [
          "pending_office_interview",
          "office_interview_scheduled",
          "trainee",
          "training_completed",
        ],
      },
    });

    console.log(`📊 Found ${applications.length} total trainee applications\n`);

    const orphanedApps = [];

    // Check each application
    for (const app of applications) {
      if (!app.userID) {
        orphanedApps.push({
          _id: app._id,
          status: app.status,
          office: app.traineeOffice,
          reason: "No userID field",
        });
      } else {
        // Check if user exists
        const user = await UserModel.findById(app.userID);
        if (!user) {
          orphanedApps.push({
            _id: app._id,
            userID: app.userID,
            status: app.status,
            office: app.traineeOffice,
            reason: "User does not exist",
          });
        }
      }
    }

    if (orphanedApps.length === 0) {
      console.log("✅ No orphaned applications found!");
    } else {
      console.log(
        `⚠️  Found ${orphanedApps.length} orphaned application(s):\n`
      );
      orphanedApps.forEach((app, index) => {
        console.log(`${index + 1}. Application ID: ${app._id}`);
        console.log(`   - Status: ${app.status}`);
        console.log(`   - Office: ${app.office || "N/A"}`);
        console.log(`   - User ID: ${app.userID || "N/A"}`);
        console.log(`   - Reason: ${app.reason}`);
        console.log("");
      });

      // Ask for confirmation before deleting
      console.log("⚠️  WARNING: The above applications will be DELETED.");
      console.log("❓ Do you want to proceed? (yes/no)");

      // For automated cleanup, uncomment the following:
      /*
      const deletedCount = await ApplicationModel.deleteMany({
        _id: { $in: orphanedApps.map(app => app._id) }
      });
      console.log(`✅ Deleted ${deletedCount.deletedCount} orphaned application(s)`);
      */

      console.log(
        "\n💡 To delete these records, uncomment the deletion code in this script."
      );
    }

    console.log("\n✅ Cleanup check complete");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from database");
  }
}

cleanupOrphanedApplications();
