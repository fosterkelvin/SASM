require("dotenv").config();
const mongoose = require("mongoose");

const UserDataSchema = new mongoose.Schema({}, { strict: false });
const UserData = mongoose.model("UserData", UserDataSchema, "userdatas");

async function setEffectivityDate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Set effectivity date to today for Kelvin Foster's user ID
    const userId = "69265cb96694ec94c1d785fd"; // Kelvin's user ID from the screenshot
    const effectivityDate = new Date();

    const result = await UserData.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      { effectivityDate },
      { upsert: true, new: true }
    );

    console.log("✅ Effectivity date set successfully!");
    console.log("- User ID:", userId);
    console.log("- Effectivity date:", effectivityDate);
    console.log("- Updated document:", result);

    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.disconnect();
  }
}

setEffectivityDate();
