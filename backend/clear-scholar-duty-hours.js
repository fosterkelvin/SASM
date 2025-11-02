const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const MONGO_URI = process.env.MONGO_URI;

async function clearScholarDutyHours() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const Schedule = mongoose.model(
      "Schedule",
      new mongoose.Schema({}, { strict: false }),
      "schedules"
    );

    // Find scholar schedules that have BOTH uploaded schedule AND duty hours
    const schedules = await Schedule.find({
      userType: "scholar",
      classSchedule: { $exists: true, $ne: null }, // Has uploaded schedule
      dutyHours: { $exists: true, $ne: [] }, // Has duty hours
    });

    console.log(
      `📋 Found ${schedules.length} scholar schedule(s) with both uploaded schedule and duty hours\n`
    );

    if (schedules.length === 0) {
      console.log("✅ No cleanup needed!");
      await mongoose.disconnect();
      return;
    }

    for (const schedule of schedules) {
      console.log(`📅 Schedule ID: ${schedule._id}`);
      console.log(`   - User ID: ${schedule.userId}`);
      console.log(`   - Uploaded schedule: ${schedule.classSchedule}`);
      console.log(`   - Duty hours to clear: ${schedule.dutyHours.length}`);

      // Clear the duty hours
      schedule.dutyHours = [];
      await schedule.save();

      console.log(`   ✅ Cleared duty hours\n`);
    }

    console.log(
      `\n✅ Cleared duty hours from ${schedules.length} scholar schedule(s)`
    );
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.disconnect();
  }
}

clearScholarDutyHours();
