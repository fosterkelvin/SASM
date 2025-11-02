// Script to fix ALL trainee schedules to match their actual deployment status
const mongoose = require("mongoose");
require("dotenv").config();

const ScheduleSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    applicationId: mongoose.Schema.Types.ObjectId,
    scholarId: mongoose.Schema.Types.ObjectId,
    userType: String,
    classSchedule: String,
    classScheduleData: mongoose.Schema.Types.Mixed,
    dutyHours: Array,
    uploadedAt: Date,
    lastModifiedBy: mongoose.Schema.Types.ObjectId,
    lastModifiedAt: Date,
  },
  { timestamps: true }
);

const ScholarSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    applicationId: mongoose.Schema.Types.ObjectId,
    scholarOffice: String,
    scholarType: String,
    deployedBy: mongoose.Schema.Types.ObjectId,
    deployedAt: Date,
    scholarNotes: String,
    status: String,
    performanceRating: Number,
  },
  { timestamps: true }
);

const ApplicationSchema = new mongoose.Schema(
  {
    userID: mongoose.Schema.Types.ObjectId,
    status: String,
    scholarOffice: String,
    position: String,
  },
  { timestamps: true }
);

const Schedule = mongoose.model("Schedule", ScheduleSchema);
const Scholar = mongoose.model("Scholar", ScholarSchema);
const Application = mongoose.model("Application", ApplicationSchema);

async function fixAllSchedules() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find all schedules with userType "trainee"
    const traineeSchedules = await Schedule.find({ userType: "trainee" });
    console.log(
      `📋 Found ${traineeSchedules.length} schedules marked as "trainee"\n`
    );

    let fixed = 0;
    let skipped = 0;

    for (const schedule of traineeSchedules) {
      console.log(`\n🔍 Checking schedule ${schedule._id}:`);
      console.log(`   - User ID: ${schedule.userId}`);
      console.log(`   - Current userType: ${schedule.userType}`);

      // Check if this user has an accepted application (scholar status)
      const acceptedApp = await Application.findOne({
        userID: schedule.userId,
        status: "accepted",
      });

      if (!acceptedApp) {
        console.log(`   ℹ️  User is still a trainee (no accepted application)`);
        skipped++;
        continue;
      }

      console.log(`   ✅ User is ACCEPTED (should be scholar)!`);
      console.log(`   - Application ID: ${acceptedApp._id}`);
      console.log(
        `   - Scholar Office: ${acceptedApp.scholarOffice || "Not assigned yet"}`
      );

      // Find or check Scholar record
      let scholar = await Scholar.findOne({
        userId: schedule.userId,
        applicationId: acceptedApp._id,
      });

      if (!scholar) {
        console.log(`   ⚠️  No Scholar record found - creating one...`);
        scholar = new Scholar({
          userId: schedule.userId,
          applicationId: acceptedApp._id,
          scholarOffice: acceptedApp.scholarOffice || "TBD",
          scholarType: acceptedApp.position || "student_assistant",
          deployedBy: schedule.userId, // Placeholder
          status: "active",
          scholarNotes: "Auto-created by fix script",
        });
        await scholar.save();
        console.log(`   ✅ Scholar record created: ${scholar._id}`);
      } else {
        console.log(`   ✅ Scholar record found: ${scholar._id}`);
      }

      // Update the schedule
      console.log(`   🔧 Converting schedule to scholar type...`);
      schedule.userType = "scholar";
      schedule.scholarId = scholar._id;
      schedule.applicationId = acceptedApp._id;
      await schedule.save();

      console.log(`   ✅ Schedule updated!`);
      console.log(`      - New userType: scholar`);
      console.log(`      - New scholarId: ${scholar._id}`);
      fixed++;
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Summary:");
    console.log(`   - Total schedules checked: ${traineeSchedules.length}`);
    console.log(`   - Schedules converted to scholar: ${fixed}`);
    console.log(`   - Schedules kept as trainee: ${skipped}`);
    console.log("=".repeat(60));

    console.log("\n✅ Done! All schedules have been synchronized.");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

fixAllSchedules();
