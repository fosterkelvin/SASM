const mongoose = require("mongoose");
const ScholarModel = require("./dist/models/scholar.model").default;
const UserModel = require("./dist/models/user.model").default;
require("dotenv").config();

async function reactivateScholar() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find the scholar by email
    const email = "20197992@s.ubaguio.edu";

    const user = await UserModel.findOne({ email });
    if (!user) {
      console.log("❌ User not found with email:", email);
      return;
    }

    // Find inactive scholar record
    const scholar = await ScholarModel.findOne({
      userId: user._id,
      status: "inactive",
    }).sort({ createdAt: -1 });

    if (!scholar) {
      console.log("❌ No inactive scholar record found for this user");
      return;
    }

    console.log("🔄 Reactivating scholar...");
    console.log("   Scholar ID:", scholar._id);
    console.log("   Previous Status:", scholar.status);

    // Reactivate the scholar
    scholar.status = "active";
    await scholar.save();

    console.log("   New Status:", scholar.status);
    console.log("\n✅ Scholar reactivated successfully!");
    console.log("   The scholar will now appear in the evaluation page.");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

reactivateScholar();
