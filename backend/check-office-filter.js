const mongoose = require("mongoose");
const ScholarModel = require("./dist/models/scholar.model").default;
const UserModel = require("./dist/models/user.model").default;
const ApplicationModel = require("./dist/models/application.model").default;
require("dotenv").config();

async function checkOfficeFiltering() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find the SIT office user
    const officeUser = await UserModel.findOne({
      role: "office",
      $or: [{ officeName: "SIT" }, { office: "SIT" }],
    });

    if (!officeUser) {
      console.log("❌ No office user found for SIT");
      return;
    }

    console.log("👤 Office User:");
    console.log("   Name:", officeUser.firstname, officeUser.lastname);
    console.log("   Role:", officeUser.role);
    console.log("   officeName:", officeUser.officeName);
    console.log("   office:", officeUser.office);
    console.log();

    // Now check what scholars match the filter used by getOfficeScholarsHandler
    const filter = {
      status: { $in: ["active", "inactive"] },
      scholarOffice: officeUser.officeName || officeUser.office,
    };

    console.log("🔍 Filter being used:");
    console.log(JSON.stringify(filter, null, 2));
    console.log();

    const scholars = await ScholarModel.find(filter)
      .populate("userId", "firstname lastname email")
      .populate("applicationId", "position");

    console.log(`📊 Found ${scholars.length} scholars matching filter\n`);

    if (scholars.length > 0) {
      scholars.forEach((s, i) => {
        console.log(`Scholar ${i + 1}:`);
        console.log("   ID:", s._id);
        console.log("   Name:", s.userId?.firstname, s.userId?.lastname);
        console.log("   Email:", s.userId?.email);
        console.log("   Status:", s.status);
        console.log("   Office:", s.scholarOffice);
        console.log();
      });
    } else {
      console.log("⚠️  No scholars found!");
      console.log("\nLet's check ALL scholars:");
      const allScholars = await ScholarModel.find({}).populate(
        "userId",
        "firstname lastname email"
      );

      console.log(`\nTotal scholars in database: ${allScholars.length}\n`);
      allScholars.forEach((s, i) => {
        console.log(`Scholar ${i + 1}:`);
        console.log("   ID:", s._id);
        console.log("   Name:", s.userId?.firstname, s.userId?.lastname);
        console.log("   Status:", s.status);
        console.log("   Office:", s.scholarOffice);
        console.log(
          "   Match filter?",
          s.scholarOffice === filter.scholarOffice
        );
        console.log();
      });
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkOfficeFiltering();
