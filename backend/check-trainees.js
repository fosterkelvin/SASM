require("dotenv").config();
const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {},
  { strict: false, collection: "applications" }
);
const Application = mongoose.model("Application", ApplicationSchema);

async function checkTrainees() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check all application statuses
    const allApps = await Application.find({}).select("status userID");
    console.log("\n=== All Applications ===");
    console.log(`Total applications: ${allApps.length}`);

    const statusCounts = {};
    allApps.forEach((app) => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });

    console.log("\nStatus breakdown:");
    Object.entries(statusCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });

    // Check specifically for training-related statuses
    const trainingStatuses = [
      "trainee",
      "training_completed",
      "interview_passed",
    ];
    console.log("\n=== Training Related Applications ===");
    for (const status of trainingStatuses) {
      const apps = await Application.find({ status }).select("userID status");
      console.log(`${status}: ${apps.length}`);
      if (apps.length > 0) {
        apps.forEach((app) =>
          console.log(`  - ID: ${app._id}, UserID: ${app.userID}`)
        );
      }
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkTrainees();
