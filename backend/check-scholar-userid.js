const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;

async function checkScholarUserId() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const Scholar = mongoose.model(
      "Scholar",
      new mongoose.Schema({}, { strict: false }),
      "scholars"
    );

    const Schedule = mongoose.model(
      "Schedule",
      new mongoose.Schema({}, { strict: false }),
      "schedules"
    );

    // Find the scholar
    const scholar = await Scholar.findOne({ scholarOffice: "SIT" }).lean();
    console.log("📋 Scholar data:");
    console.log("  - _id:", scholar._id);
    console.log("  - userId:", scholar.userId);
    console.log("  - applicationId:", scholar.applicationId);

    // Find the schedule for this scholar
    const schedule = await Schedule.findOne({ scholarId: scholar._id }).lean();
    if (schedule) {
      console.log("\n📅 Schedule data:");
      console.log("  - _id:", schedule._id);
      console.log("  - userId:", schedule.userId);
      console.log("  - scholarId:", schedule.scholarId);
      console.log("  - userType:", schedule.userType);
      console.log("  - dutyHours:", schedule.dutyHours);
    } else {
      console.log("\n❌ No schedule found for scholar");
    }

    // Check current logged in userId from logs
    console.log("\n🔍 Current student login userId: 69064cfc0e4d8178be12ad22");
    console.log("🔍 Scholar's userId in DB:", scholar.userId.toString());
    console.log(
      "🔍 Match?",
      scholar.userId.toString() === "69064cfc0e4d8178be12ad22"
    );

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.disconnect();
  }
}

checkScholarUserId();
