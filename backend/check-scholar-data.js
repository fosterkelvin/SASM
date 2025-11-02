const mongoose = require("mongoose");
require("dotenv").config();

const scholarSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
    scholarOffice: String,
    scholarType: String,
    status: String,
  },
  { timestamps: true }
);

const Scholar = mongoose.model("Scholar", scholarSchema);

async function checkScholarData() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const scholars = await Scholar.find({}).limit(5);

    console.log(`📋 Found ${scholars.length} scholar(s)\n`);

    for (const scholar of scholars) {
      console.log("📊 Scholar Data:");
      console.log("   - _id:", scholar._id);
      console.log("   - _id type:", typeof scholar._id);
      console.log("   - _id as string:", scholar._id.toString());
      console.log("   - applicationId:", scholar.applicationId);
      console.log("   - applicationId type:", typeof scholar.applicationId);
      console.log(
        "   - applicationId as string:",
        scholar.applicationId?.toString()
      );
      console.log("   - userId:", scholar.userId);
      console.log("   - userId type:", typeof scholar.userId);
      console.log("   - scholarOffice:", scholar.scholarOffice);
      console.log("   - status:", scholar.status);
      console.log("");
    }

    await mongoose.connection.close();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

checkScholarData();
