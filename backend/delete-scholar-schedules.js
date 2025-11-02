const mongoose = require("mongoose");
require("dotenv").config();

const scheduleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
    scholarId: { type: mongoose.Schema.Types.ObjectId, ref: "Scholar" },
    userType: { type: String, enum: ["trainee", "scholar"] },
    scheduleData: Object,
  },
  { timestamps: true }
);

const Schedule = mongoose.model("Schedule", scheduleSchema);

async function deleteScholarSchedules() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find all schedules with userType "scholar"
    console.log("🔍 Looking for scholar schedules...");
    const scholarSchedules = await Schedule.find({ userType: "scholar" });

    console.log(`📋 Found ${scholarSchedules.length} scholar schedule(s)\n`);

    if (scholarSchedules.length === 0) {
      console.log("✅ No scholar schedules found to delete");
      await mongoose.connection.close();
      return;
    }

    // Display schedules that will be deleted
    for (const schedule of scholarSchedules) {
      console.log("📋 Scholar Schedule to DELETE:");
      console.log("   - Schedule ID:", schedule._id);
      console.log("   - User ID:", schedule.userId);
      console.log("   - Application ID:", schedule.applicationId);
      console.log("   - Scholar ID:", schedule.scholarId);
      console.log("   - Created:", schedule.createdAt);
      console.log("   - Has schedule data:", !!schedule.scheduleData);
      console.log("");
    }

    // Delete all scholar schedules
    console.log("🗑️  Deleting scholar schedules...");
    const result = await Schedule.deleteMany({ userType: "scholar" });
    console.log(`✅ Deleted ${result.deletedCount} scholar schedule(s)`);
    console.log("");
    console.log(
      "ℹ️  Reason: These were trainee CLASS schedules incorrectly converted to scholar schedules."
    );
    console.log(
      "   Scholars need to upload their own WORK schedules (duty hours, shifts, etc.)"
    );
    console.log(
      "   The original trainee class schedules remain as historical data."
    );

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

deleteScholarSchedules();
