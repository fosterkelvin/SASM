// Script to fix existing trainee schedules that should be scholar schedules
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

const Schedule = mongoose.model("Schedule", ScheduleSchema);
const Scholar = mongoose.model("Scholar", ScholarSchema);

async function fixScholarSchedules() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find all active scholars
    const scholars = await Scholar.find({ status: "active" });
    console.log(`📚 Found ${scholars.length} active scholars\n`);

    let fixed = 0;
    let alreadyCorrect = 0;
    let notFound = 0;

    for (const scholar of scholars) {
      console.log(`\n🔍 Checking scholar ${scholar._id}:`);
      console.log(`   - User ID: ${scholar.userId}`);
      console.log(`   - Application ID: ${scholar.applicationId}`);
      console.log(`   - Office: ${scholar.scholarOffice}`);

      // Find ANY schedule for this user
      const schedule = await Schedule.findOne({ userId: scholar.userId });

      if (!schedule) {
        console.log(`   ⚠️  No schedule found for this scholar`);
        notFound++;
        continue;
      }

      console.log(`   📋 Found schedule ${schedule._id}:`);
      console.log(`      - Current userType: ${schedule.userType}`);
      console.log(`      - Current scholarId: ${schedule.scholarId}`);
      console.log(`      - Current applicationId: ${schedule.applicationId}`);

      if (
        schedule.userType === "scholar" &&
        schedule.scholarId?.toString() === scholar._id.toString()
      ) {
        console.log(`   ✅ Schedule already correct!`);
        alreadyCorrect++;
        continue;
      }

      // Fix the schedule
      console.log(`   🔧 Updating schedule...`);
      schedule.userType = "scholar";
      schedule.scholarId = scholar._id;
      schedule.applicationId = scholar.applicationId;
      await schedule.save();

      console.log(`   ✅ Schedule updated!`);
      console.log(`      - New userType: ${schedule.userType}`);
      console.log(`      - New scholarId: ${schedule.scholarId}`);
      console.log(`      - New applicationId: ${schedule.applicationId}`);
      fixed++;
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Summary:");
    console.log(`   - Total scholars checked: ${scholars.length}`);
    console.log(`   - Schedules fixed: ${fixed}`);
    console.log(`   - Already correct: ${alreadyCorrect}`);
    console.log(`   - No schedule found: ${notFound}`);
    console.log("=".repeat(60));

    console.log("\n✅ Done! All scholar schedules have been updated.");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

fixScholarSchedules();
