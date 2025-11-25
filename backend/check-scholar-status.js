const mongoose = require("mongoose");
const ScholarModel = require("./dist/models/scholar.model").default;
const UserModel = require("./dist/models/user.model").default;
const ApplicationModel = require("./dist/models/application.model").default;
require("dotenv").config();

async function checkScholarStatus() {
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

    console.log("👤 User found:");
    console.log("   Name:", user.firstname, user.lastname);
    console.log("   Email:", user.email);
    console.log("   User ID:", user._id);
    console.log();

    // Find scholar record
    const scholar = await ScholarModel.findOne({ userId: user._id }).sort({
      createdAt: -1,
    }); // Get most recent

    if (!scholar) {
      console.log("❌ No scholar record found for this user");
      return;
    }

    console.log("🎓 Scholar record found:");
    console.log("   Scholar ID:", scholar._id);
    console.log("   Status:", scholar.status);
    console.log("   Office:", scholar.scholarOffice);
    console.log("   Type:", scholar.scholarType);
    console.log("   Deployed at:", scholar.deployedAt);
    console.log("   Updated at:", scholar.updatedAt);
    console.log();

    // Find application
    const application = await ApplicationModel.findById(scholar.applicationId);
    if (application) {
      console.log("📄 Application status:", application.status);
      console.log("   Scholar Office:", application.scholarOffice);
      console.log();
    }

    if (scholar.status === "inactive") {
      console.log("⚠️  SCHOLAR IS INACTIVE");
      console.log("\n📝 This happened because:");
      console.log("   - HR clicked 'Undeploy' on this scholar");
      console.log("   - This sets the scholar status to 'inactive'");
      console.log("\n🔧 To fix this:");
      console.log("   1. Ask HR to re-deploy the scholar, OR");
      console.log("   2. Run: node backend/reactivate-scholar.js");
    } else {
      console.log("✅ Scholar is active!");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkScholarStatus();
