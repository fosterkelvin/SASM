// Script to check Scholar records and their offices
const mongoose = require("mongoose");
require("dotenv").config();

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

const Scholar = mongoose.model("Scholar", ScholarSchema);
const Application = mongoose.model("Application", ApplicationSchema);

async function checkScholars() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const scholars = await Scholar.find({});
    console.log(`📚 Found ${scholars.length} scholars (all statuses):\n`);

    for (const scholar of scholars) {
      console.log(`Scholar ${scholar._id}:`);
      console.log(`  - userId: ${scholar.userId}`);
      console.log(`  - applicationId: ${scholar.applicationId}`);
      console.log(
        `  - scholarOffice: "${scholar.scholarOffice}" ${!scholar.scholarOffice ? "⚠️ EMPTY!" : "✅"}`
      );
      console.log(`  - scholarType: ${scholar.scholarType}`);
      console.log(`  - status: ${scholar.status}`);
      console.log(`  - scholarNotes: ${scholar.scholarNotes}`);

      // Check the related application
      const app = await Application.findById(scholar.applicationId);
      if (app) {
        console.log(
          `  - Application scholarOffice: "${app.scholarOffice}" ${!app.scholarOffice ? "⚠️ EMPTY!" : "✅"}`
        );
      }
      console.log("");
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

checkScholars();
