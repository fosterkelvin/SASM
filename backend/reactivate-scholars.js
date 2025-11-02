// Script to reactivate scholars with offices assigned
const mongoose = require("mongoose");
require("dotenv").config();

const ScholarSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    applicationId: mongoose.Schema.Types.ObjectId,
    scholarOffice: String,
    scholarType: String,
    status: String,
  },
  { timestamps: true }
);

const Scholar = mongoose.model("Scholar", ScholarSchema);

async function reactivateScholars() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find scholars with offices but inactive status
    const inactiveScholars = await Scholar.find({
      status: "inactive",
      scholarOffice: { $exists: true, $ne: "" },
    });

    console.log(
      `📚 Found ${inactiveScholars.length} inactive scholars with offices assigned\n`
    );

    let reactivated = 0;
    for (const scholar of inactiveScholars) {
      console.log(`Reactivating Scholar ${scholar._id}:`);
      console.log(`  - Office: ${scholar.scholarOffice}`);
      console.log(`  - Type: ${scholar.scholarType}`);

      scholar.status = "active";
      await scholar.save();

      console.log(`  ✅ Reactivated!\n`);
      reactivated++;
    }

    console.log("=".repeat(60));
    console.log(`📊 Summary: Reactivated ${reactivated} scholars`);
    console.log("=".repeat(60));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

reactivateScholars();
