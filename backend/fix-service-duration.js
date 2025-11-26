// Fix script to add service duration for scholars whose semester was ended
// This adds 6 months for each archived application that was a scholar

const mongoose = require("mongoose");
require("dotenv").config();

const MONGODB_URI = process.env.MONGO_URI;

// Define schemas inline
const userDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gender: String,
    birthdate: Date,
    civilStatus: String,
    phoneNumber: String,
    address: String,
    college: String,
    courseYear: String,
    serviceMonths: { type: Number, default: 0 },
    servicePeriods: [
      {
        startDate: Date,
        endDate: Date,
        months: Number,
        scholarType: String,
      },
    ],
  },
  { timestamps: true }
);

const archivedApplicationSchema = new mongoose.Schema(
  {
    userID: mongoose.Schema.Types.ObjectId,
    firstName: String,
    lastName: String,
    position: String,
    originalStatus: String,
    archivedReason: String,
    archivedAt: { type: Date, default: Date.now },
    originalApplication: Object,
    createdAt: Date,
  },
  { timestamps: true }
);

const UserDataModel = mongoose.model("UserData", userDataSchema);
const ArchivedApplicationModel = mongoose.model(
  "ArchivedApplication",
  archivedApplicationSchema
);

async function fixServiceDuration() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find archived applications from the recent semester end
    const recentlyArchived = await ArchivedApplicationModel.find({
      archivedReason: "End of Semester - Scholar Reset",
      originalStatus: "accepted",
    }).sort({ archivedAt: -1 });

    console.log(`\n📊 Found ${recentlyArchived.length} archived scholars\n`);

    if (recentlyArchived.length === 0) {
      console.log("ℹ️  No archived scholars found.");
      process.exit(0);
    }

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const archived of recentlyArchived) {
      try {
        const userId = archived.userID;
        const position =
          archived.originalApplication?.position || archived.position;

        // Determine scholar type
        let scholarType;
        if (
          position === "student_assistant" ||
          position === "Student Assistant"
        ) {
          scholarType = "student_assistant";
        } else if (
          position === "student_marshal" ||
          position === "Student Marshal"
        ) {
          scholarType = "student_marshal";
        } else {
          console.log(
            `⏭️  Skipping ${archived.firstName} ${archived.lastName} - Unknown position: ${position}`
          );
          skippedCount++;
          continue;
        }

        // Find or create user data
        let userData = await UserDataModel.findOne({ userId });

        if (!userData) {
          userData = new UserDataModel({
            userId,
            serviceMonths: 0,
            servicePeriods: [],
          });
        }

        // Check if service was already added for this archive
        const alreadyAdded = userData.servicePeriods?.some(
          (period) =>
            period.scholarType === scholarType &&
            Math.abs(
              new Date(period.endDate).getTime() -
                new Date(archived.archivedAt).getTime()
            ) < 60000 // Within 1 minute
        );

        if (alreadyAdded) {
          console.log(
            `⏭️  Skipping ${archived.firstName} ${archived.lastName} - Already added`
          );
          skippedCount++;
          continue;
        }

        // Add 6 months to service
        const monthsToAdd = 6;
        userData.serviceMonths = (userData.serviceMonths || 0) + monthsToAdd;

        // Get dates from archived application
        const deployedAt =
          archived.originalApplication?.createdAt ||
          archived.createdAt ||
          new Date();
        const endDate = archived.archivedAt || new Date();

        // Add service period record
        const servicePeriod = {
          startDate: deployedAt,
          endDate: endDate,
          months: monthsToAdd,
          scholarType,
        };

        userData.servicePeriods = userData.servicePeriods || [];
        userData.servicePeriods.push(servicePeriod);

        await userData.save();

        console.log(
          `✅ Added ${monthsToAdd} months for ${archived.firstName} ${archived.lastName} (${scholarType}). Total: ${userData.serviceMonths} months`
        );
        successCount++;
      } catch (error) {
        console.error(
          `❌ Failed for ${archived.firstName} ${archived.lastName}:`,
          error.message
        );
        errorCount++;
      }
    }

    console.log(`\n📊 Fix Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📝 Total: ${recentlyArchived.length}`);
  } catch (error) {
    console.error("❌ Fix failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run the fix
fixServiceDuration();
