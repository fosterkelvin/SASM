require("dotenv").config();
const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {},
  { strict: false, collection: "applications" }
);
const Application = mongoose.model("Application", ApplicationSchema);

async function checkApplicationDetails() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check all applications with their gender and position
    const allApps = await Application.find({}).select("status gender position");
    console.log("\n=== All Applications Details ===");
    console.log(`Total applications: ${allApps.length}`);

    allApps.forEach((app, index) => {
      console.log(`\nApplication ${index + 1}:`);
      console.log(`  ID: ${app._id}`);
      console.log(`  Status: ${app.status}`);
      console.log(`  Gender: ${app.gender}`);
      console.log(`  Position: ${app.position}`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkApplicationDetails();
